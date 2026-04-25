-- ========================================================================
-- Rentto — Preferencias de notificaciones por usuario
-- ========================================================================
-- Añade columna notif_prefs (JSONB) a perfiles y actualiza los triggers
-- para respetar las preferencias del destinatario.
--
-- Estructura de notif_prefs:
-- {
--   "pago_recibido":      { "in_app": true, "email": true },
--   "pago_confirmado":    { "in_app": true, "email": true },
--   "pago_rechazado":     { "in_app": true, "email": true },
--   "inquilino_vinculado":{ "in_app": true, "email": true }
-- }
--
-- Default si no está configurado: TRUE (notif activadas).
-- ========================================================================


-- 1. Columna
ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS notif_prefs JSONB DEFAULT NULL;


-- 2. Helper function: ¿el usuario quiere recibir notif por canal X?
CREATE OR REPLACE FUNCTION public.user_quiere_notif(
  p_user_id uuid,
  p_evento text,
  p_canal text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefs jsonb;
BEGIN
  SELECT notif_prefs INTO v_prefs FROM public.perfiles WHERE id = p_user_id;
  IF v_prefs IS NULL THEN RETURN TRUE; END IF;
  RETURN COALESCE((v_prefs->p_evento->>p_canal)::boolean, TRUE);
END;
$$;


-- 3. Actualizar triggers para respetar prefs (canal in_app)

CREATE OR REPLACE FUNCTION public.notif_pago_insertado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_propietario_id uuid;
  v_propiedad_nombre text;
BEGIN
  SELECT user_id, nombre INTO v_propietario_id, v_propiedad_nombre
    FROM public.propiedades WHERE id = NEW.propiedad_id;
  IF v_propietario_id IS NULL THEN RETURN NEW; END IF;
  IF NOT public.user_quiere_notif(v_propietario_id, 'pago_recibido', 'in_app') THEN
    RETURN NEW;
  END IF;

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
    v_cuerpo := 'El propietario confirmó tu pago de $' || NEW.monto || '. +7 pts en tu score.';
  ELSIF NEW.estado = 'rechazado' THEN
    v_tipo := 'pago_rechazado';
    v_titulo := 'Tu pago fue rechazado';
    v_cuerpo := 'El propietario rechazó el pago de $' || NEW.monto || '. Verifica el comprobante.';
  ELSE
    RETURN NEW;
  END IF;

  IF NOT public.user_quiere_notif(NEW.user_id, v_tipo, 'in_app') THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notificaciones (user_id, tipo, titulo, cuerpo, link)
  VALUES (NEW.user_id, v_tipo, v_titulo, v_cuerpo, '/recibos');
  RETURN NEW;
END;
$$;


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
  IF NOT public.user_quiere_notif(v_propietario_id, 'inquilino_vinculado', 'in_app') THEN
    RETURN NEW;
  END IF;

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


-- 4. Verificación
-- SELECT id, nombre, notif_prefs FROM public.perfiles ORDER BY created_at DESC LIMIT 10;
