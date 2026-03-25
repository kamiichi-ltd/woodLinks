# WoodLinks System Specification Ver 2.0

## Document Scope

This document is reverse-engineered from the current repository contents only. It records implemented behavior that is visible in application code, SQL files, and E2E tests as of the current analysis.

Primary source groups used for this version:

- `src/app/**`
- `src/components/**`
- `src/services/**`
- `src/utils/supabase/**`
- `src/lib/**`
- `src/database.types.ts`
- `init_database.sql`
- `schema_update.sql`
- `fix_analytics_rls.sql`
- `misc/*.sql`
- `supabase/add_card_connections.sql`
- `tests/e2e/**`

Important source-of-truth notes:

- The repository does not contain one ordered migration chain. SQL is split across root-level files, `misc/`, and `supabase/`.
- `src/database.types.ts` is not a full mirror of the SQL files. Some fields exist in types but are not introduced by visible SQL in this repository, and some SQL-defined columns are missing or differ in types.
- This specification therefore records both implemented behavior and visible repository drift where the code and SQL do not align perfectly.

---

## 1. Product Overview

### 1.1 System Purpose

WoodLinks is a digital business card platform built around a physical wooden card and a public web profile.

The current codebase implements the following product capabilities:

- authenticated users can create and manage card projects in `/dashboard`
- cards can be published to public profile pages at `/p/[slug]`
- physical cards expose a fixed entry URL at `/c/[id]` for QR/NFC use
- unclaimed physical cards can be activated into an account
- public visitors can save contact data as vCard
- public visitors can authenticate and save a card through LINE login, creating a lead record
- card owners can see saved-user leads in their dashboard
- users can order physical cards and track order status
- admins can manage orders, customers, cards, and bulk-generate empty cards for manufacturing
- analytics events are recorded and displayed in dashboard/admin-facing charts

### 1.2 Actor Definitions

#### Admin

Admin is not represented as a dedicated database role in Next.js application logic. In the app layer, admin means:

- the user is authenticated
- `user.email === process.env.ADMIN_EMAIL`

This check is implemented in:

- `src/app/(admin)/layout.tsx`
- `src/utils/supabase/middleware.ts`
- `src/app/actions/admin.ts`
- `src/app/actions/admin-bulk.ts`

Implemented admin capabilities:

- access `/admin`
- access `/admin/orders`
- access `/admin/customers`
- access `/admin/cards`
- access `/admin/cards/[id]`
- read all cards through service-role-backed admin actions
- bulk-generate empty cards for manufacturing
- edit cards through admin card edit UI
- read all orders and customers
- update order state

#### Owner

Owner is the authenticated end user using `/dashboard`.

The current implementation uses two ownership concepts on `cards`:

- `cards.user_id`
  - dashboard creator / editor ownership
  - used by most card CRUD, content CRUD, order RPC ownership checks, dashboard queries, and many existing policies
- `cards.owner_id`
  - claimed physical-card ownership
  - used by activation flow
  - used by public page `isOwner`
  - used by lead-viewing policy in `card_connections`
  - used by one analytics SELECT policy file

This dual model is still present in Ver 2.0. The codebase does not collapse `user_id` and `owner_id` into one canonical owner field.

#### Guest

Guest is an unauthenticated public visitor.

Implemented guest capabilities:

- visit the landing page
- access public pages at `/p/[slug]`
- access physical-card entry URLs at `/c/[id]`
- trigger analytics inserts
- download public vCard data
- start login and activation flows
- start LINE login from a public card

Implemented guest restrictions:

- no access to `/dashboard`
- no access to `/admin`
- no direct writes to cards, profiles, contents, orders, or card connections

---

## 2. System Architecture

### 2.1 Technology Stack

| Layer | Current implementation |
| --- | --- |
| Frontend framework | Next.js 16.1.4 App Router |
| UI runtime | React 19.2.3 |
| Styling | Tailwind CSS 4 |
| UI libraries | `lucide-react`, Framer Motion, DnD Kit, Recharts, `qrcode.react` |
| Backend / BaaS | Supabase Auth, Postgres, Storage |
| Supabase SDKs | `@supabase/ssr`, `@supabase/supabase-js` |
| Payments | Stripe Checkout + Stripe webhook |
| Testing | Playwright E2E |

### 2.2 Route Topology

Current route families:

- Public
  - `/`
  - `/login`
  - `/auth/callback`
  - `/p/[slug]`
  - `/c/[id]`
  - `/api/vcard/[slug]`
  - `/api/cards/[id]/vcard`
  - `/api/webhooks/stripe`
- User dashboard
  - `/dashboard`
  - `/dashboard/cards/[id]`
  - `/dashboard/profile`
- Admin
  - `/admin`
  - `/admin/orders`
  - `/admin/customers`
  - `/admin/cards`
  - `/admin/cards/[id]`

### 2.3 Rendering and Write Model

Current implementation pattern:

- route pages are primarily Server Components
- modals, forms, editors, tables with interactions, and public save buttons are Client Components
- writes are split across:
  - Server Actions in `src/app/actions/**`
  - server-only service functions in `src/services/**`
  - browser Supabase client usage in selected client-side services and upload flows
  - API Route handlers for webhook and download endpoints

### 2.4 Supabase Client Usage

| Context | File(s) | Auth mode | Main usage |
| --- | --- | --- | --- |
| Request-scoped server client | `src/utils/supabase/server.ts` | anon key + auth cookies | Server Components and Server Actions under user session |
| Browser client | `src/utils/supabase/client.ts` | anon key in browser | OAuth start, RPC/browser-side data access |
| Middleware client | `src/utils/supabase/middleware.ts` | anon key + request cookies | session refresh and login/signup redirect logic |
| Service-role client | `src/app/actions/admin.ts` | service role | admin data read/write |
| Service-role client | `src/app/actions/admin-bulk.ts` | service role | admin card list + bulk generation |
| Service-role client | `src/app/actions/activation.ts` | service role | claiming unowned physical cards |
| Mixed user + service-role | `src/app/actions/connection.ts` | request-scoped user client + service role | idempotent lead save and lead list fetch |
| Service-role client | `src/app/api/webhooks/stripe/route.ts` | service role | Stripe webhook order update |

### 2.5 Session and Redirect Handling

Current session flow is centered on Supabase cookie sessions plus middleware.

Implemented behavior:

- `src/middleware.ts` routes all non-static requests through `updateSession`
- `src/utils/supabase/middleware.ts` refreshes Supabase session cookies
- authenticated access to `/login` or `/signup` is intercepted in middleware
- if `next`, `action`, or `cardId` are present on `/login` or `/signup`, middleware redirects authenticated users to the preserved target instead of showing the form

`src/lib/auth-redirect.ts` provides the common redirect helper:

- `buildSafeNextPath(nextParam, extras)`
- accepts only relative paths starting with `/`
- rejects `//...` style open redirects
- appends allowlisted extra query parameters such as `action` and `cardId`

### 2.6 Authentication Methods

Current login paths:

- email/password login via `src/services/auth-service.ts`
- email/password signup via `src/services/auth-service.ts`
- LINE OAuth start via `src/utils/supabase/client.ts`

Implemented LINE OAuth behavior:

- `signInWithLine()` calls `supabase.auth.signInWithOAuth({ provider: 'line' })`
- the OAuth redirect target is `/auth/callback`
- `next`, `action`, and `cardId` are appended to the callback URL when present
- `/auth/callback` exchanges the Supabase code for a session and redirects to the preserved target path

### 2.7 Lead Capture Architecture

Implemented lead capture path:

1. guest visits `/p/[slug]`
2. public card CTA renders `LINEでこのカードを保存`
3. guest click navigates to `/login?next=/p/[slug]&action=save&cardId=[cardId]`
4. user logs in with email/password or starts LINE OAuth
5. redirect handling preserves `next`, `action`, and `cardId`
6. user returns to `/p/[slug]?action=save&cardId=[cardId]`
7. `PublicCardPage` passes `autoSaveRequested`
8. `LineSaveButton` auto-runs `saveCardConnection(cardId)` once
9. on success, the URL is replaced with `saved=1`
10. the button text changes to `LINEで保存済み`

This flow is implemented across:

- `src/app/login/page.tsx`
- `src/services/auth-service.ts`
- `src/utils/supabase/client.ts`
- `src/app/auth/callback/route.ts`
- `src/utils/supabase/middleware.ts`
- `src/app/p/[slug]/page.tsx`
- `src/components/public/line-save-button.tsx`
- `src/app/actions/connection.ts`

### 2.8 Bulk Manufacturing Architecture

Implemented bulk manufacturing path:

1. admin opens `/admin/cards`
2. `BulkCardGenerator` opens a modal
3. admin selects count from `10 / 50 / 100`
4. admin selects material from `sugi / hinoki / walnut / maple`
5. client calls `generateBulkCards(count, materialType)`
6. server action verifies admin by `ADMIN_EMAIL`
7. service-role client inserts draft, unpublished, unclaimed card rows
8. action returns `id`, `slug`, `materialType`, `url`
9. client builds CSV in browser with columns `ID, Material, URL`
10. CSV is downloaded immediately and page state is refreshed

This flow is implemented across:

- `src/app/actions/admin-bulk.ts`
- `src/app/(admin)/admin/cards/page.tsx`
- `src/components/admin/bulk-card-generator.tsx`
- `src/components/admin/admin-card-table.tsx`

---

## 3. Database Design and Security

### 3.1 Schema Source Notes

Current schema information is distributed across the following files:

- `init_database.sql`
- `schema_update.sql`
- `fix_analytics_rls.sql`
- `misc/reconstruct_infrastructure.sql`
- `misc/orders_schema.sql`
- `misc/orders_rpc.sql`
- `misc/fix_profile_rls.sql`
- `misc/storage_setup.sql`
- `misc/analytics_setup.sql`
- `supabase/add_card_connections.sql`

Important visible drift in the repository:

- `getCardBySlug()` filters on `cards.is_published = true`, while `misc/reconstruct_infrastructure.sql` changes the public card policy to `status = 'published'`
- dashboard and admin write paths explicitly keep `is_published` and `status` in sync, so current app logic assumes both represent the same publish state
- `misc/analytics_setup.sql` only allows analytics `event_type` values `view` and `contact_save`, but application code also logs `link_click`
- `misc/analytics_setup.sql` grants analytics SELECT by `cards.user_id`, while `fix_analytics_rls.sql` grants analytics SELECT by `cards.owner_id`
- `src/database.types.ts` does not match `misc/orders_schema.sql`; the type file models a legacy orders shape while SQL defines the physical-order schema with `card_id`, `material`, shipping fields, and monetary columns
- `src/database.types.ts` contains card fields such as `wood_origin`, `wood_age`, and `wood_story`, but no visible SQL migration in this repository adds those columns

### 3.2 Major Tables

#### `profiles`

Implemented / referenced columns:

- `id` UUID primary key referencing `auth.users(id)`
- `full_name`
- `avatar_url`
- `email`
- `created_at` in SQL
- `updated_at` in `src/database.types.ts`

Current usage:

- signup upsert
- public avatar display
- profile editing
- admin customer/order joins
- CRM lead list display

#### `cards`

Implemented / referenced columns across SQL and code:

- `id`
- `user_id`
- `owner_id`
- `title`
- `description`
- `slug`
- `is_published`
- `status`
- `material_type`
- `created_at`
- `updated_at`
- `wood_origin`
- `wood_age`
- `wood_story`
- `view_count`

Current runtime meaning of key columns:

- `user_id`
  - dashboard ownership
  - dashboard card CRUD
  - content CRUD
  - order RPC ownership
  - one branch of lead visibility
- `owner_id`
  - physical-card claim state
  - public-page owner check
  - activation and lifecycle usage
  - one branch of analytics/lead visibility
- `slug`
  - public route key for `/p/[slug]`
- `status`
  - lifecycle status for `/c/[id]` behavior
- `is_published`
  - direct query filter used by `getCardBySlug()`

#### `card_contents`

Implemented columns:

- `id`
- `card_id`
- `type`
- `content` JSONB
- `order_index`
- `created_at`

Current usage:

- public card rendering
- dashboard content editing
- drag-and-drop reorder

#### `analytics`

Implemented columns from SQL and code:

- `id`
- `card_id`
- `event_type`
- `device_type`
- `browser`
- `os`
- `created_at`

Current event types in code:

- `view`
- `contact_save`
- `link_click`

Current analytical interpretation in app:

- `totalViews` counts `view`
- `totalSaves` counts `contact_save`
- `clickRate` uses `link_click / view`

Important current fact:

- LINE lead saves in `card_connections` are not counted into `totalSaves`
- `totalSaves` represents vCard contact-save events only

#### `orders`

Implemented columns in `misc/orders_schema.sql`:

- `id`
- `user_id`
- `card_id`
- `status`
- `material`
- `quantity`
- `currency`
- `unit_price`
- `subtotal`
- `tax`
- `shipping_fee`
- `total`
- `payment_provider`
- `payment_intent_id`
- `checkout_session_id`
- `paid_at`
- shipping name / postal / address / phone fields
- `shipping_carrier`
- `tracking_number`
- `shipped_at`
- `created_at`
- `updated_at`

Current usage:

- order creation via `create_order` RPC
- Stripe checkout creation in `src/app/actions/checkout.ts`
- Stripe webhook status update
- dashboard order status display
- admin order management

#### `card_connections`

Implemented in `supabase/add_card_connections.sql`:

- `id`
- `card_id`
- `user_id`
- `created_at`

Current usage:

- lead capture storage from public cards
- dashboard CRM list
- E2E save-flow verification

#### `card_lifecycle_logs`

Implemented in `misc/reconstruct_infrastructure.sql`:

- `id`
- `card_id`
- `event_type`
- `reason`
- `meta`
- `created_at`

Current runtime usage visible in SQL:

- order RPC writes `physical_order_created`
- admin order status RPC writes `shipped` and `payment_received`

No active Next.js runtime code in the current repository reads this table directly.

### 3.3 RLS and Security Matrix

| Resource | SELECT | INSERT | UPDATE | DELETE | Current notes |
| --- | --- | --- | --- | --- | --- |
| `profiles` | public SELECT allowed by `misc/fix_profile_rls.sql` | authenticated user can insert own row when `auth.uid() = id` | authenticated user can update own row when `auth.uid() = id` | no explicit delete policy visible | public profile and avatar access depend on open SELECT |
| `cards` | public SELECT policy exists in two forms: `is_published = true` in `init_database.sql`, and `status = 'published'` in `misc/reconstruct_infrastructure.sql` | owner create/update paths use authenticated session and `user_id` | policy `"Users can manage their own cards"` uses `auth.uid() = user_id`; claim policy allows UPDATE when `owner_id IS NULL` and new `owner_id = auth.uid()` | owner delete via `user_id` path | app also uses service role for activation and admin card updates |
| `card_contents` | public SELECT allowed when parent card is published | owner manage via parent `cards.user_id = auth.uid()` | owner manage via parent `cards.user_id = auth.uid()` | owner manage via parent `cards.user_id = auth.uid()` | DnD reorder also depends on card ownership via `user_id` |
| `analytics` | authenticated SELECT policy exists; repository has both `cards.user_id = auth.uid()` and later `cards.owner_id = auth.uid()` variants | public INSERT allowed | no explicit public UPDATE policy | no explicit public DELETE policy | app writes `link_click`, though one SQL check only lists `view` and `contact_save` |
| `orders` | authenticated user can SELECT own orders | no normal authenticated INSERT policy; order creation is intended through `SECURITY DEFINER` RPC | no normal authenticated UPDATE policy | no normal authenticated DELETE policy | `service_role` full access policy exists in `misc/orders_schema.sql` |
| `card_connections` | authenticated SELECT allowed only when the target card has `cards.user_id = auth.uid()` or `cards.owner_id = auth.uid()` | authenticated INSERT allowed only when `auth.uid() = user_id` | no UPDATE policy | no DELETE policy | owner dashboard list is also fetched with service role after explicit ownership verification in app code |
| `storage.objects` | public SELECT for `avatars` and `project_images` | authenticated INSERT allowed for those buckets | authenticated UPDATE allowed for those buckets | authenticated DELETE allowed for those buckets | policies are bucket-wide in `misc/storage_setup.sql`, not user-folder constrained |

### 3.4 Lead Capture Security Model

The implemented lead-capture security model is split between SQL and application code.

SQL layer:

- `card_connections` INSERT is restricted to authenticated users saving their own `user_id`
- `card_connections` SELECT is restricted to the owning card user by `cards.user_id` or `cards.owner_id`

Application layer:

- `saveCardConnection()` first verifies an authenticated user via request-scoped Supabase
- the card existence check uses the request-scoped client
- duplicate detection uses a service-role client and `maybeSingle()`
- if a connection already exists, the action returns success without inserting
- the actual insert is still executed through the request-scoped user client

Current result:

- insert permission still relies on RLS
- duplicate detection does not rely on a SQL unique constraint
- idempotency is enforced in application code rather than schema

### 3.5 Lead Fetch Security Model

`getCardLeads(cardId)` does not rely solely on the `card_connections` SELECT policy.

Current implemented flow:

1. fetch current user from request-scoped Supabase
2. create service-role Supabase client
3. verify the user owns the target card by checking `cards.user_id = user.id` or `cards.owner_id = user.id`
4. fetch lead rows with service-role access

Current result:

- lead visibility is protected first by explicit application-level ownership verification
- actual lead fetch uses service-role access
- this allows a manual fallback path even if relationship-based select typing fails

---

## 4. Data Flow and State

### 4.1 Card Publish / Unpublish State Sync

The application currently maintains both `cards.is_published` and `cards.status`.

Implemented sync paths:

- dashboard publish toggle
  - `src/components/forms/card-settings-form.tsx`
  - checkbox calls `toggleCardStatus(cardId, isPublished)`
  - `src/app/actions/card-status.ts` writes:
    - `is_published = isPublished`
    - `status = 'published'` or `'draft'`
- dashboard full settings submit
  - `src/services/card-service.ts`
  - `updateCard()` maps `status` into `is_published`
- admin card update
  - `src/app/actions/admin.ts`
  - `updateAdminCard()` writes both `is_published` and `status`

Important current fact:

- public page fetches by `is_published = true`
- public SQL policy in later migration file is expressed in terms of `status = 'published'`
- app code keeps both values synchronized on normal write paths, so current runtime depends on this sync remaining intact

### 4.2 Public Card Read Flow

Current implemented flow for `/p/[slug]`:

1. `getCardBySlug(slug)` reads `cards` where `slug = slug` and `is_published = true`
2. it fetches `card_contents`
3. it fetches `profiles.avatar_url` using `cards.user_id`
4. `src/app/p/[slug]/page.tsx` fetches current user
5. if `card.owner_id` is null, the route renders `CardActivation`
6. otherwise it logs a `view` analytics event
7. it renders `PublicCardClient`

### 4.3 Physical Card Entry Flow

Current implemented flow for `/c/[id]`:

1. `getPublicCardById(id)` fetches the card by primary key without a published filter
2. route switches on `card.status`
3. `published` redirects to `/p/[slug]` if `slug` exists
4. `draft` renders a "Coming Soon" state
5. `lost_reissued`, `disabled`, and `transferred` render disabled/unavailable states

### 4.4 Physical Card Activation Flow

Current implemented flow:

1. an unclaimed card reaches `/p/[slug]`
2. `PublicCardPage` sees `owner_id` is null and renders `CardActivation`
3. guest is sent to `/login?next=/p/[slug]`
4. authenticated user can click activation
5. `claimCard(cardId)`:
   - reads current user
   - checks `cards.owner_id`
   - uses service role to update `owner_id = user.id` where `owner_id IS NULL`
6. action redirects to `/admin/cards/[cardId]`

Important current fact:

- although SQL includes a claim policy on `cards`, the runtime claim path uses a service-role client instead of relying on that policy

### 4.5 Lead Capture Flow

Current implemented lead capture flow:

1. `PublicCardClient` renders two CTA buttons:
   - `LINEでこのカードを保存`
   - `Add to Contacts / 連絡先に追加`
2. guest clicking the LINE button is sent to `/login?next=/p/[slug]&action=save&cardId=[cardId]`
3. login page preserves these params in hidden fields for email login and passes them to LINE OAuth start
4. email login:
   - `login(formData)` signs in with password
   - `buildSafeNextPath()` rebuilds `/p/[slug]?action=save&cardId=[cardId]`
   - redirect occurs immediately after login
5. LINE OAuth login:
   - browser starts `signInWithOAuth({ provider: 'line' })`
   - callback URL includes `next`, `action`, `cardId`
   - `/auth/callback` exchanges the code for a session
   - callback redirects to rebuilt target path
6. public page receives `action=save`
7. `LineSaveButton` sees `autoSaveRequested = true` and `isLoggedIn = true`
8. `saveCardConnection(cardId)` runs once
9. success path replaces the URL with `saved=1`
10. the button enters `saved` state and displays `LINEで保存済み`

### 4.6 Lead Persistence and Idempotency

`saveCardConnection(cardId)` currently implements idempotency like this:

1. verify user is authenticated
2. verify card exists
3. service-role client checks for an existing row in `card_connections` by `(card_id, user_id)`
4. if found, return `{ success: true, alreadySaved: true }`
5. otherwise insert through the request-scoped user client

Current implementation facts:

- there is no visible SQL unique constraint on `(card_id, user_id)`
- duplicate prevention is implemented in action code
- the action does not write an analytics event

### 4.7 Lead List Read Flow

The current owner CRM view at `/dashboard/cards/[id]` works like this:

1. dashboard page loads `getCard(id)` and verifies ownership by `cards.user_id`
2. page also calls `getCardLeads(id)`
3. `getCardLeads()` verifies ownership by either `cards.user_id` or `cards.owner_id`
4. it attempts a joined query:
   - `card_connections`
   - `profiles:user_id(full_name, avatar_url, email)`
5. if that query succeeds, results are mapped directly
6. if join resolution fails, it falls back to:
   - fetch `card_connections`
   - fetch `profiles` by collected `user_id`s
   - merge in application code
7. if profile fetch also fails, it still returns lead rows with null profile fields
8. `LeadList` renders avatar, display name, and saved date, or an empty placeholder

### 4.8 Analytics Recording and Display

Current implemented analytics write paths:

- `/p/[slug]` page load calls `logEvent(card.id, 'view')`
- vCard button click calls `logEvent(card.id, 'contact_save')`
- public SNS link click calls `logEvent(card.id, 'link_click')`

Current dashboard display path:

1. `getCardAnalytics(cardId)` fetches the last 30 days from `analytics`
2. it aggregates:
   - total views
   - today's views
   - total contact saves
   - click rate
   - seven-day view series
   - device ratio
3. `AnalyticsDashboard` renders the KPI cards and charts

Important current fact:

- dashboard "保存数" is derived from `analytics.contact_save`
- LINE lead saves in `card_connections` are not shown in this KPI

### 4.9 Bulk Generation and CSV Export Flow

Current implemented admin manufacturing flow:

1. `/admin/cards` loads all cards through `getAdminCards()`
2. `BulkCardGenerator` opens a modal from the top of the page
3. admin selects count and material
4. client calls `generateBulkCards()`
5. server action inserts rows with:
   - `user_id = current admin user`
   - `owner_id = null`
   - `status = 'draft'`
   - `is_published = false`
   - `slug = bulk-[randomUUID without hyphens]`
   - `material_type = selected material`
   - `title = null`
   - `description = null`
6. action returns `id`, `slug`, `materialType`, `url = /c/[id]`
7. client builds a CSV in the browser with:
   - `ID`
   - `Material`
   - `URL`
8. client triggers an immediate download
9. page refreshes and the new cards appear in the admin table

Important current fact:

- bulk-generated empty cards are represented as normal `cards` rows
- they are "unclaimed" by `owner_id = null`
- they are still attributed to the current admin in `user_id`

---

## 5. Directory Structure and Responsibilities

### 5.1 `src/app`

Top-level route entry points and server-rendered pages.

Current role split:

- `src/app/(dashboard)/dashboard/**`
  - authenticated owner dashboard pages
  - card edit page
  - profile page
- `src/app/(admin)/admin/**`
  - admin pages
  - orders, customers, cards, dashboard
- `src/app/p/[slug]/page.tsx`
  - public card display and lead auto-save trigger wiring
- `src/app/c/[id]/page.tsx`
  - physical-card entry routing by card status
- `src/app/login/page.tsx`
  - email login/signup and LINE login entry
- `src/app/auth/callback/route.ts`
  - Supabase OAuth callback exchange
- `src/app/api/**`
  - vCard downloads
  - Stripe webhook

### 5.2 `src/app/actions`

Server Actions and server-side mutation entry points.

Current files:

- `activation.ts`
  - claim unowned card
- `admin.ts`
  - admin orders, customers, card edit
- `admin-bulk.ts`
  - admin card list and bulk generation
- `analytics.ts`
  - analytics write and aggregation
- `card-status.ts`
  - publish/draft toggle sync
- `checkout.ts`
  - Stripe checkout session creation
- `connection.ts`
  - lead save + lead read
- `order.ts`
  - delete pending order
- `project.ts`
  - project deletion helpers

### 5.3 `src/components`

Reusable UI layers split by context.

- `src/components/public`
  - public card screen, public navigation, activation, LINE save CTA, vCard save CTA
- `src/components/dashboard`
  - dashboard-only widgets such as `LeadList` and destructive actions
- `src/components/admin`
  - admin nav, admin tables, admin card edit, bulk generation modal
- `src/components/forms`
  - owner dashboard forms such as card settings
- `src/components/orders`
  - ordering and order-status UI
- `src/components/cards`
  - QR code and card-adjacent UI
- `src/components/analytics`
  - analytics widgets such as `ViewCounter`
- `src/components/layout`
  - shared shell/navigation components

### 5.4 `src/services`

Server-side and browser-side service modules.

Current roles:

- `auth-service.ts`
  - email login/signup/logout and redirect behavior
- `card-service.ts`
  - dashboard card CRUD, public reads, content CRUD
- `order-service.ts`
  - browser RPC calls and checkout start
- `profile-service.ts`
  - profile update
- `analytics-service.ts`
  - auxiliary analytics logic

### 5.5 `src/utils/supabase`

Supabase client factories and session middleware.

- `client.ts`
  - browser client
  - LINE OAuth start
- `server.ts`
  - request-scoped server client
- `middleware.ts`
  - session refresh and login/signup redirect logic

### 5.6 `src/lib`

Small server-side helpers.

- `auth-redirect.ts`
  - safe redirect path reconstruction for auth and lead capture

### 5.7 SQL and Seeds

- root SQL files
  - historical schema, RLS, storage, and RPC definitions
- `misc/*.sql`
  - incremental schema and policy adjustments
- `supabase/add_card_connections.sql`
  - additive lead-capture table and policies
- `supabase/seed_demo.sql`
  - demo seed data

### 5.8 `tests/e2e`

Playwright end-to-end test suites.

Current suites include:

- `card-connection-flow.spec.ts`
- `guest-activation.spec.ts`
- `login-redirect.spec.ts`
- `verify-analytics.spec.ts`
- `full-activation-flow.spec.ts`
- `user-dashboard-toggle.spec.ts`
- `woodlinks-full-cycle.spec.ts`
- `debug-toggle.spec.ts`

---

## 6. E2E Testing Coverage

### 6.1 Playwright Runtime

Current Playwright configuration:

- test directory: `tests/e2e`
- browser project: Chromium only
- default `baseURL`: `http://localhost:3000`
- reporter: HTML
- fully parallel by default

### 6.2 Lead Capture and Redirect Coverage

`tests/e2e/card-connection-flow.spec.ts` currently implements three explicit CRM/lead scenarios:

1. guest click on the public LINE save CTA redirects to `/login`
   - verifies `next=/p/[slug]`
   - verifies `action=save`
2. login with `?next=/p/[slug]&action=save`
   - redirects back to `/p/[slug]`
   - verifies `saved=1`
   - verifies UI button state `LINEで保存済み`
   - verifies one row exists in `card_connections`
3. repeating the save flow
   - does not crash
   - still renders the original page
   - keeps `card_connections` count at `1`

Current test implementation details:

- the suite runs in `serial` mode inside the spec
- test data is created directly with Supabase service-role credentials from `.env.local`
- DB row count is checked directly against `card_connections`

### 6.3 Redirect Persistence Coverage

`tests/e2e/login-redirect.spec.ts` verifies:

- `/login?next=[path]` preserves the target path after email login

This covers the base `next` redirect mechanism that the lead-capture flow also depends on.

### 6.4 Activation Coverage

`tests/e2e/guest-activation.spec.ts` verifies:

- an unclaimed card renders the activation screen instead of the normal public card
- guest click on `ログインして有効化` redirects to `/login`
- the `next=/p/[slug]` parameter is preserved

### 6.5 Analytics Coverage

`tests/e2e/verify-analytics.spec.ts` verifies:

- a published card is visible on the public route
- a guest page view increments the count shown in dashboard analytics

### 6.6 Current Coverage Boundary

The current E2E suite covers:

- redirect parameter persistence
- activation entry behavior
- analytics increment visibility
- lead save idempotency and DB insert path

It does not currently contain an E2E spec for:

- actual external LINE OAuth provider behavior
- admin bulk generation and CSV export
- lead list rendering in dashboard after save

---

## 7. Current Implementation Drift and Coupling Points

The following are not future proposals. They are current facts visible in the repository.

### 7.1 Publish State Is Dual-Tracked

The app currently uses both:

- `cards.is_published`
- `cards.status`

Public fetch code and public SQL policies do not use exactly the same field, so correct behavior depends on the app continuing to synchronize them on writes.

### 7.2 Ownership Is Dual-Tracked

The app currently uses both:

- `cards.user_id`
- `cards.owner_id`

Different features depend on different columns. Dashboard CRUD is mostly `user_id`-based. Activation, public owner state, lead visibility, and one analytics policy use `owner_id`.

### 7.3 Analytics "Save Count" and CRM Saves Are Different Systems

There are two separate "save" concepts:

- `analytics.contact_save`
  - triggered by vCard download CTA
  - displayed as analytics `保存数`
- `card_connections`
  - triggered by authenticated LINE/public save flow
  - displayed in CRM lead list

The dashboard analytics save KPI does not count CRM lead saves.

### 7.4 Lead Read Path Uses Service Role After App-Level Ownership Check

`getCardLeads()` does not depend solely on `card_connections` RLS. It verifies ownership first, then reads with service role and includes a manual merge fallback.

### 7.5 Bulk-Generated Cards Are Real `cards` Rows

The manufacturing bulk generator does not use a separate inventory table. It inserts standard `cards` rows with:

- admin `user_id`
- null `owner_id`
- draft status
- unpublished state

### 7.6 Types and SQL Still Diverge

Visible examples:

- orders type model and orders SQL schema are different
- analytics SQL check and app event types are different
- some card fields used in code are not introduced by visible SQL in this repository

This document therefore treats the combination of SQL files and application code as the current system definition, not `src/database.types.ts` alone.
