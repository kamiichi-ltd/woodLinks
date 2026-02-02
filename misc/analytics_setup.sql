-- Create analytics table
create table if not exists analytics (
  id uuid default gen_random_uuid() primary key,
  card_id uuid references cards(id) on delete cascade not null,
  event_type text not null check (event_type in ('view', 'contact_save')),
  device_type text, -- 'mobile', 'tablet', 'desktop', 'wearable', 'embedded'
  browser text,
  os text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table analytics enable row level security;

-- Policy: Allow anonymous users (public) to insert events (view/save)
create policy "Allow public insert to analytics"
  on analytics for insert
  to anon, authenticated
  with check (true);

-- Policy: Allow card owners to view analytics for their own cards
create policy "Allow card owners to view their analytics"
  on analytics for select
  to authenticated
  using (
    exists (
      select 1 from cards
      where cards.id = analytics.card_id
      and cards.user_id = auth.uid()
    )
  );

-- Create index for faster querying by card and date
create index if not exists idx_analytics_card_created on analytics(card_id, created_at);
