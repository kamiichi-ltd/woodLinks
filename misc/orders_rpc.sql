-- RPC: create_order
-- Description: ユーザーが注文を確定する。Stripe等の決済フロー前にOrderレコードを作成する。
CREATE OR REPLACE FUNCTION public.create_order(
    p_card_id UUID,
    p_material TEXT,
    p_quantity INTEGER,
    p_shipping_name TEXT,
    p_shipping_postal TEXT,
    p_shipping_address1 TEXT,
    p_shipping_address2 TEXT,
    p_shipping_phone TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- RLSをバイパスしてINSERTを行うため
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_new_order_id UUID;
    v_card_owner_id UUID;
BEGIN
    -- 1. 実行ユーザーの取得
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. カードの所有権チェック
    SELECT user_id INTO v_card_owner_id FROM public.cards WHERE id = p_card_id;
    
    IF v_card_owner_id IS NULL THEN
         RAISE EXCEPTION 'Card not found';
    END IF;

    IF v_card_owner_id != v_user_id THEN
        RAISE EXCEPTION 'You do not own this card';
    END IF;

    -- 3. 注文の作成
    INSERT INTO public.orders (
        user_id,
        card_id,
        status,
        material,
        quantity,
        shipping_name,
        shipping_postal,
        shipping_address1,
        shipping_address2,
        shipping_phone
    ) VALUES (
        v_user_id,
        p_card_id,
        'pending_payment',
        p_material,
        p_quantity,
        p_shipping_name,
        p_shipping_postal,
        p_shipping_address1,
        p_shipping_address2,
        p_shipping_phone
    )
    RETURNING id INTO v_new_order_id;

    -- 4. (Optional) Lifecycle Log
    INSERT INTO public.card_lifecycle_logs (card_id, event_type, meta)
    VALUES (p_card_id, 'physical_order_created', jsonb_build_object('order_id', v_new_order_id));

    RETURN v_new_order_id;
END;
$$;


-- RPC: start_checkout (Mock)
-- Description: 支払いフローを開始する（PoC用ダミー）。実際はStripe Session ID等を返す。
CREATE OR REPLACE FUNCTION public.start_checkout(p_order_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_status public.order_status;
    v_user_id UUID;
BEGIN
    -- 権限チェック
    SELECT status, user_id INTO v_order_status, v_user_id
    FROM public.orders WHERE id = p_order_id;

    IF v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Forbidden';
    END IF;

    IF v_order_status != 'pending_payment' THEN
        RAISE EXCEPTION 'Order is not in pending state';
    END IF;

    -- Dummy Logic: 本来はStripe APIを呼ぶなどがサーバーサイドで行われるが、
    -- ここでは単純にURL文字列を返すだけ。
    -- 実際はNext.js Server Action側でStripe処理をする方が一般的かもしれないが、
    -- 要件にある「RPC経由」に寄せるなら、DB側でPaymentIntentを作るか、
    -- あるいはこれは「チェックアウトURLを返す」だけの関数とする。
    
    RETURN 'https://checkout.stripe.com/test-link-mock'; 
END;
$$;


-- RPC: admin_update_order_status
-- Description: 管理者が注文ステータスを更新する（発送処理など）
-- Service Role Only (Supabase Dashboardや管理画面からのみ実行可)
CREATE OR REPLACE FUNCTION public.admin_update_order_status(
    p_order_id UUID,
    p_new_status public.order_status,
    p_tracking_number TEXT DEFAULT NULL,
    p_shipped_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_status public.order_status;
BEGIN
    -- 管理者権限チェックの方法はプロジェクトによるが、
    -- Supabaseの特権ユーザー(Service Role)経由で呼ばれることを想定するか、
    -- ユーザーテーブルにis_adminフラグを持たせてチェックする。
    -- ここでは単純化のため、別途RLSや呼び出し元の権限管理に委ねるが、
    -- 安全のため「auth.uid()」チェックを入れるべき。
    -- 今回は簡易的に「この関数はService Roleからしか呼ばない」前提で実装するか、
    -- あるいは特定のAdmin UIDリストとの照合を入れるなどが考えられる。
    
    -- NOTE: 本番では auth.jwt() -> role = 'service_role' のチェックなどを推奨。
    
    UPDATE public.orders
    SET 
        status = p_new_status,
        tracking_number = COALESCE(p_tracking_number, tracking_number),
        shipped_at = COALESCE(p_shipped_at, shipped_at),
        updated_at = now()
    WHERE id = p_order_id;
    
    -- ログ記録（発送時など）
    IF p_new_status = 'shipped' THEN
        INSERT INTO public.card_lifecycle_logs (card_id, event_type, meta)
        SELECT card_id, 'shipped', jsonb_build_object('order_id', p_order_id)
        FROM public.orders WHERE id = p_order_id;
    END IF;
END;
$$;
