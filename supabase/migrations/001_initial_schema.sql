-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
    user_id       UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name     TEXT        NOT NULL,
    user_picture  TEXT,
    email         TEXT        NOT NULL,
    whatsapp      TEXT        NOT NULL,
    motorcycle_plate TEXT,
    backseat_name TEXT,
    created_date  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE public.events (
    event_id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name        TEXT        NOT NULL,
    event_picture     TEXT,
    event_description TEXT,
    event_address     TEXT        NOT NULL,
    event_date        DATE        NOT NULL,
    event_start_time  TIME        NOT NULL,
    event_end_time    TIME        NOT NULL,
    event_cost        NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_by        UUID        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    created_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active         BOOLEAN     NOT NULL DEFAULT TRUE,
    CONSTRAINT unique_event_slot UNIQUE (event_date, event_start_time, event_address)
);

CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_is_active ON public.events(is_active);
CREATE INDEX idx_events_created_by ON public.events(created_by);

-- ============================================
-- EVENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE public.event_registrations (
    registration_id UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID        NOT NULL REFERENCES public.events(event_id) ON DELETE CASCADE,
    user_id         UUID        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_registration UNIQUE (event_id, user_id)
);

CREATE INDEX idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_registrations_user  ON public.event_registrations(user_id);

-- ============================================
-- RAFFLE PRODUCTS TABLE
-- ============================================
CREATE TABLE public.raffle_products (
    product_id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id            UUID        NOT NULL REFERENCES public.events(event_id) ON DELETE CASCADE,
    product_name        TEXT        NOT NULL,
    product_description TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_raffle_products_event ON public.raffle_products(event_id);

-- ============================================
-- RAFFLE WINNERS TABLE
-- ============================================
CREATE TABLE public.raffle_winners (
    winner_id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID        NOT NULL REFERENCES public.raffle_products(product_id) ON DELETE CASCADE,
    event_id    UUID        NOT NULL REFERENCES public.events(event_id) ON DELETE CASCADE,
    user_id     UUID        NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    drawn_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_raffle_winners_event ON public.raffle_winners(event_id);

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================
CREATE TABLE public.contact_messages (
    message_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    message     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- VIEW: events with participant count
-- ============================================
CREATE OR REPLACE VIEW public.events_with_count AS
SELECT
    e.*,
    p.user_name AS creator_name,
    p.user_picture AS creator_picture,
    COUNT(r.registration_id)::int AS participant_count
FROM public.events e
JOIN public.profiles p ON e.created_by = p.user_id
LEFT JOIN public.event_registrations r ON e.event_id = r.event_id
GROUP BY e.event_id, p.user_name, p.user_picture;

-- ============================================
-- FUNCTION: perform raffle draw
-- ============================================
CREATE OR REPLACE FUNCTION public.draw_raffle(p_event_id UUID)
RETURNS TABLE(product_id UUID, product_name TEXT, winner_user_id UUID, winner_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_product RECORD;
    v_winner_id UUID;
    v_winner_name TEXT;
    v_participants UUID[];
    v_used_participants UUID[] := ARRAY[]::UUID[];
BEGIN
    SELECT ARRAY_AGG(er.user_id) INTO v_participants
    FROM public.event_registrations er
    WHERE er.event_id = p_event_id;

    IF v_participants IS NULL OR array_length(v_participants, 1) = 0 THEN
        RAISE EXCEPTION 'Nenhum participante inscrito neste evento';
    END IF;

    FOR v_product IN
        SELECT rp.product_id, rp.product_name
        FROM public.raffle_products rp
        WHERE rp.event_id = p_event_id
          AND NOT EXISTS (
              SELECT 1 FROM public.raffle_winners rw WHERE rw.product_id = rp.product_id
          )
        ORDER BY rp.created_at
    LOOP
        IF array_length(v_used_participants, 1) IS NOT NULL
           AND array_length(v_used_participants, 1) >= array_length(v_participants, 1) THEN
            v_used_participants := ARRAY[]::UUID[];
        END IF;

        LOOP
            v_winner_id := v_participants[floor(random() * array_length(v_participants, 1)) + 1];
            EXIT WHEN NOT (v_winner_id = ANY(v_used_participants));
        END LOOP;

        v_used_participants := array_append(v_used_participants, v_winner_id);

        INSERT INTO public.raffle_winners(product_id, event_id, user_id)
        VALUES (v_product.product_id, p_event_id, v_winner_id);

        SELECT pr.user_name INTO v_winner_name FROM public.profiles pr WHERE pr.user_id = v_winner_id;

        product_id     := v_product.product_id;
        product_name   := v_product.product_name;
        winner_user_id := v_winner_id;
        winner_name    := v_winner_name;
        RETURN NEXT;
    END LOOP;
END;
$$;
