-- 1. Order Status Enum Definition
DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM (
        'pending_payment', -- 支払い待ち
        'paid',            -- 支払い完了（製作待ち）
        'in_production',   -- 製作中
        'shipped',         -- 発送済み
        'delivered',       -- 到着済み
        'cancelled',       -- キャンセル
        'refunded'         -- 返金済み
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Orders Table Definition
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    card_id UUID NOT NULL REFERENCES public.cards(id),
    
    -- Status & Details
    status public.order_status NOT NULL DEFAULT 'pending_payment',
    material TEXT NOT NULL CHECK (material IN ('sugi', 'hinoki', 'walnut')), -- 将来的にEnum化も検討だが、一旦TextCheckで柔軟に
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    
    -- Financials (Future Proofing)
    currency TEXT DEFAULT 'JPY',
    unit_price INTEGER, -- 注文確定時の単価を記録
    subtotal INTEGER,
    tax INTEGER,
    shipping_fee INTEGER,
    total INTEGER,
    
    -- Payment Info (Future Integration)
    payment_provider TEXT, -- 'stripe' etc
    payment_intent_id TEXT,
    checkout_session_id TEXT,
    paid_at TIMESTAMPTZ,
    
    -- Shipping Info
    shipping_name TEXT NOT NULL,
    shipping_postal TEXT NOT NULL,
    shipping_address1 TEXT NOT NULL,
    shipping_address2 TEXT,
    shipping_phone TEXT NOT NULL,
    
    -- Fulfillment
    shipping_carrier TEXT,  -- Yamato, Sagawa, JapanPost etc
    tracking_number TEXT,
    shipped_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_card_id ON public.orders(card_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 3. RLS Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: No direct INSERT/UPDATE/DELETE from client
-- (All mutations must happen via RPC to ensure business logic consistency)
-- Intentionally NOT creating policies for INSERT/UPDATE/DELETE for 'authenticated' role except logic handled by RPC (Security Definer).
-- The Application Logic (RPC) will operate with BYPASS RLS or OWNER privileges embedded.

-- However, if we want to allow Service Role (Admin) full access:
DROP POLICY IF EXISTS "Service role has full access to orders" ON public.orders;
CREATE POLICY "Service role has full access to orders"
ON public.orders FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Triggers (Optional: Updated At)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.orders;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
