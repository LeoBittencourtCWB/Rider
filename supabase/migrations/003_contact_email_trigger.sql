-- Habilitar a extensão pg_net para fazer chamadas HTTP
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Função que envia email via Supabase Edge Function (ou webhook externo)
-- Por enquanto, usamos a função auth.email() do Supabase para enviar
-- Para produção, configure um webhook ou Edge Function

-- Abordagem: trigger que chama um webhook quando uma mensagem de contato é inserida
CREATE OR REPLACE FUNCTION public.notify_contact_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_name TEXT;
    v_user_email TEXT;
    v_webhook_url TEXT;
BEGIN
    -- Buscar dados do usuário
    SELECT user_name, email INTO v_user_name, v_user_email
    FROM public.profiles
    WHERE user_id = NEW.user_id;

    -- Enviar via pg_net para um webhook (configurar URL no dashboard)
    -- Por enquanto, apenas registramos. Configure um webhook na seção abaixo.
    PERFORM extensions.http_post(
        url := 'https://zjcflvfkkxlivqwcladz.supabase.co/functions/v1/send-contact-email',
        body := json_build_object(
            'message_id', NEW.message_id,
            'message', NEW.message,
            'user_name', v_user_name,
            'user_email', v_user_email
        )::text,
        headers := json_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('request.jwt.claim.sub', true)
        )::jsonb
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_contact_message_insert
    AFTER INSERT ON public.contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_contact_message();
