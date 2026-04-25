-- ========================================================================
-- Rentto — Sistema de notificaciones (inbox real)
-- ========================================================================
-- Crea tabla `notificaciones` + RLS + 3 triggers que generan notifs:
--   1. Pago insertado → notif al propietario ("Nuevo pago recibido")
--   2. Pago cambia estado → notif al inquilino (confirmado/rechazado)
--   3. Vinculación creada → notif al propietario ("Inquilino vinculado")
--
-- Idempotente.
-- ========================================================================


-- ======================================================================
-- 1. Tabla
-- ======================================================================

CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL,
  titulo text NOT NULL,
  cuerpo text,
  link text,
  leida boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index para queries comunes (mis notificaciones no leídas, ordenadas por fecha)
CREATE INDEX IF NOT EXISTS idx_notif_user_unread
  ON public.notificaciones (user_id, leida, created_at DESC);


-- ======================================================================
-- 2. RLS
-- ======================================================================

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notif_select_own ON public.notificaciones;
CREATE POLICY notif_select_own ON public.notificaciones
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS notif_update_own ON public.notificaciones;
CREATE POLICY notif_update_own ON public.notificaciones
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS notif_delete_own ON public.notificaciones;
CREATE POLICY notif_delete_own ON public.notificaciones
  FOR DELETE USING (user_id = auth.uid());

-- INSERT: sin policy → solo via service_role / triggers (bypass RLS).
-- El cliente no debe insertar directamente.


-- ======================================================================
-- 3. Trigger — pago insertado → notif al propietario
-- ======================================================================

CREATE OR REPLACE FUNCTION public.notif_pago_insertado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_propietario_id uuid;
  v_propiedad_nombre text;
BEGIN
  SELECT user_id, nombre INTO v_propietario_id, v_propiedad_nombre
    FROM public.propiedades WHERE id = NEW.propiedad_id;
  IF v_propietario_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.notificaciones (user_id, tipo, titulo, cuerpo, link)
  VALUES (
    v_propietario_id,
    'pago_recibido',
    'Nuevo pago recibido',
    '$' || NEW.monto || ' vía ' || NEW.metodo
      || ' en ' || COALESCE(v_propiedad_nombre, 'tu propiedad')
      || '. Pendiente de confirmación.',
    '/propietario#pendientes'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notif_pago_insert ON public.pagos;
CREATE TRIGGER notif_pago_insert
  AFTER INSERT ON public.pagos
  FOR EACH ROW EXECUTE FUNCTION public.notif_pago_insertado();


-- ======================================================================
-- 4. Trigger — estado del pago cambia → notif al inquilino
-- ======================================================================

CREATE OR REPLACE FUNCTION public.notif_pago_cambio_estado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_titulo text;
  v_cuerpo text;
  v_tipo text;
BEGIN
  IF NEW.estado = OLD.estado THEN RETURN NEW; END IF;

  IF NEW.estado = 'confirmado' THEN
    v_tipo := 'pago_confirmado';
    v_titulo := 'Tu pago fue confirmado';
    v_cuerpo := 'El propietario confirmó tu pago de $' || NEW.monto
                || '. +7 pts en tu score.';
  ELSIF NEW.estado = 'rechazado' THEN
    v_tipo := 'pago_rechazado';
    v_titulo := 'Tu pago fue rechazado';
    v_cuerpo := 'El propietario rechazó el pago de $' || NEW.monto
                || '. Verifica el comprobante y vuelve a intentar.';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notificaciones (user_id, tipo, titulo, cuerpo, link)
  VALUES (NEW.user_id, v_tipo, v_titulo, v_cuerpo, '/recibos');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notif_pago_estado ON public.pagos;
CREATE TRIGGER notif_pago_estado
  AFTER UPDATE OF estado ON public.pagos
  FOR EACH ROW EXECUTE FUNCTION public.notif_pago_cambio_estado();


-- ======================================================================
-- 5. Trigger — vinculación creada → notif al propietario
-- ======================================================================

CREATE OR REPLACE FUNCTION public.notif_vinculacion_creada()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_propietario_id uuid;
  v_propiedad_nombre text;
  v_inquilino_nombre text;
BEGIN
  SELECT user_id, nombre INTO v_propietario_id, v_propiedad_nombre
    FROM public.propiedades WHERE id = NEW.propiedad_id;
  SELECT nombre INTO v_inquilino_nombre
    FROM public.perfiles WHERE id = NEW.inquilino_id;
  IF v_propietario_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO public.notificaciones (user_id, tipo, titulo, cuerpo, link)
  VALUES (
    v_propietario_id,
    'inquilino_vinculado',
    'Nuevo inquilino vinculado',
    COALESCE(v_inquilino_nombre, 'Un inquilino')
      || ' se vinculó a ' || COALESCE(v_propiedad_nombre, 'tu propiedad') || '.',
    '/inquilinos'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notif_vinculacion_insert ON public.vinculaciones;
CREATE TRIGGER notif_vinculacion_insert
  AFTER INSERT ON public.vinculaciones
  FOR EACH ROW EXECUTE FUNCTION public.notif_vinculacion_creada();


-- ======================================================================
-- Verificación
-- ======================================================================
-- Después de correr, prueba:
--   1. Crea un nuevo pago desde la app → debe aparecer una notif al propietario
--   2. El propietario confirma o rechaza → notif al inquilino
--   3. Un inquilino se vincula con código → notif al propietario
--
--   SELECT * FROM public.notificaciones ORDER BY created_at DESC LIMIT 10;
