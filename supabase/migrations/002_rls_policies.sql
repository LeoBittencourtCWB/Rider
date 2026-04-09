-- Enable RLS on all tables
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_winners      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages    ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- EVENTS
CREATE POLICY "events_select_active" ON public.events FOR SELECT TO authenticated USING (is_active = true OR created_by = auth.uid());
CREATE POLICY "events_insert_own" ON public.events FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "events_update_own" ON public.events FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "events_delete_own" ON public.events FOR DELETE TO authenticated USING (created_by = auth.uid());

-- EVENT REGISTRATIONS
CREATE POLICY "registrations_select" ON public.event_registrations FOR SELECT TO authenticated USING (user_id = auth.uid() OR event_id IN (SELECT event_id FROM public.events WHERE created_by = auth.uid()));
CREATE POLICY "registrations_insert_own" ON public.event_registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "registrations_delete_own" ON public.event_registrations FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RAFFLE PRODUCTS
CREATE POLICY "raffle_products_select" ON public.raffle_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "raffle_products_insert" ON public.raffle_products FOR INSERT TO authenticated WITH CHECK (event_id IN (SELECT event_id FROM public.events WHERE created_by = auth.uid()));
CREATE POLICY "raffle_products_update" ON public.raffle_products FOR UPDATE TO authenticated USING (event_id IN (SELECT event_id FROM public.events WHERE created_by = auth.uid()));
CREATE POLICY "raffle_products_delete" ON public.raffle_products FOR DELETE TO authenticated USING (event_id IN (SELECT event_id FROM public.events WHERE created_by = auth.uid()));

-- RAFFLE WINNERS
CREATE POLICY "raffle_winners_select" ON public.raffle_winners FOR SELECT TO authenticated USING (true);

-- CONTACT MESSAGES
CREATE POLICY "contact_messages_insert" ON public.contact_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "contact_messages_select" ON public.contact_messages FOR SELECT TO authenticated USING (user_id = auth.uid());
