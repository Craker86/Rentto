-- ========================================================================
-- Rentto — Email en perfiles
-- ========================================================================
-- Añade columna `email` a `perfiles` para que el cliente pueda
-- consultar el email de la contraparte (sin necesidad de tocar
-- auth.users, que requiere service_role).
--
-- Caso de uso: el propietario al confirmar un pago necesita el email
-- del inquilino para enviarle el aviso. JOIN pagos.user_id → perfiles.id
-- → perfiles.email.
--
-- Idempotente.
-- ========================================================================


-- 1. Columna
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS email TEXT;


-- 2. Backfill desde auth.users (corre una sola vez)
UPDATE public.perfiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');


-- 3. Trigger para auto-poblar al crear perfil futuro
-- Cuando se inserta un perfil, copia el email del usuario auth correspondiente.
CREATE OR REPLACE FUNCTION public.perfiles_set_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email IS NULL OR NEW.email = '' THEN
    SELECT email INTO NEW.email FROM auth.users WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS perfiles_set_email_trigger ON public.perfiles;
CREATE TRIGGER perfiles_set_email_trigger
  BEFORE INSERT ON public.perfiles
  FOR EACH ROW EXECUTE FUNCTION public.perfiles_set_email();


-- 4. Verificación
-- SELECT id, nombre, email, rol FROM public.perfiles ORDER BY created_at DESC LIMIT 10;
