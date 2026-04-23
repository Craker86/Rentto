# Estado del Proyecto — Rentto

**Última actualización:** 23 abril 2026, fin de sesión

## ✅ Completado hoy (23 abr) — día de MVP feature-complete

### Diseño
- [x] Migración de toda la app autenticada al design system (9 pantallas: `/pagar`, `/datos-personales`, `/metodos-pago`, `/recibos`, `/notificaciones`, `/seguridad`, `/configuracion`, `/nueva-propiedad`, `/vincular`)
- [x] Chasis unificado: TopBar sticky + NavBar role-aware con FAB central
- [x] `/propietario` rebuilt como command-center (hero de cobrado/esperado, alertas accionables, quick actions, próximos cobros)
- [x] Nuevas rutas: `/inquilinos` (directorio expandible), `/estadisticas` (KPIs + tendencia 6 meses + ranking top propiedades)
- [x] `/contrato` role-aware: propietario ve lista de contratos, inquilino ve detalle + score
- [x] Método **Efectivo** añadido como 5to rail en `/pagar` y `/metodos-pago`
- [x] Grid de métodos en `/dashboard` reestructurado a scroll horizontal con snap

### Producto — Modelo de negocio
- [x] **Scoring MVP** (`src/app/lib/scoring.js`) — función pura 0-100 con 6 criterios: perfil completo, email confiable, antigüedad, pagos confirmados, sin rechazos, sin pendientes viejos. Umbrales: Básico ≥50, Protegido ≥70, Premium ≥85
- [x] Scoring mostrado en `/contrato` (círculo + desglose), `/inquilinos` (badge por tenant), `/perfil` (card brand con progreso)
- [x] **Los 3 modos de Rentto** (`src/app/lib/modos.js`) — Básico (facilitador 5% prop), Protegido (garante parcial 4%+3%), Premium (garante total 5%+5%). Helpers `getModo`, `toneDeModo`, `calcularComisiones`
- [x] Selector de modo en `/nueva-propiedad` (3 cards comparativas con comisiones en vivo)
- [x] Toggle group de modo en edit form de `/propietario`
- [x] Badge de modo en cards del marketplace `/propiedades`
- [x] Pricing breakdown en `/contrato` inquilino (renta + comisión = total)
- [x] Columna `modo` añadida a `propiedades` en Supabase

### Seguridad
- [x] **Privacy fixes**: filtros `user_id` en todas las queries client-side (8 archivos) — antes inquilinos veían propiedades/pagos ajenos y propietarios veían inventario global
- [x] **Row Level Security** habilitado en todas las tablas del public schema (perfiles, propiedades, pagos, vinculaciones, tasa_bcv, score_historial)
- [x] Policies RLS escritas y aplicadas (`supabase-rls.sql` en el repo) — scoping correcto: inquilino ve lo suyo, propietario ve lo suyo, marketplace abierto a autenticados
- [x] Storage bucket `comprobantes` — policy SELECT pública eliminada (ya no se puede listar el bucket, pero los links directos siguen funcionando)
- [x] **Leaked Password Protection** activado en Auth (check contra Have I Been Pwned)
- [x] Credenciales Supabase movidas a env vars (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — antes hardcoded en `src/app/lib/supabase.js`
- [x] Env vars configuradas en Vercel, deploy verde en producción

### Bugs resueltos
- [x] "Hola, Jesús" hardcoded → ahora pulla `perfil.nombre`
- [x] `/design-system` eliminada (showcase ya no necesario)
- [x] Badge real de pendientes en la campana del TopBar (conteo scoped a propiedades del propietario)
- [x] Email de `/api/notificar` ahora tiene botón CTA clickeable que linkea a `/propietario#pendientes`

### Producción
- [x] Deploy verde en `rentto.vercel.app`
- [x] `/api/notificar` probado en producción (HTTP 200, email llega con CTA funcionando)

## ⏳ Pendiente

### Datos
- [ ] Limpiar fotos sucias en BD (algunas propiedades tienen screenshots de auth pages como fotos)
- [ ] El diagrama muestra `propiedades.modo` pero verificar que todas las filas existentes tengan valor (no null) — si hay nulls, UPDATE a 'basico' por defecto

### Producto
- [ ] Página `/modos` educativa (landing comparativa de Básico/Protegido/Premium para marketing)
- [ ] Auto-registro en `score_historial` — trigger que inserte fila cuando un pago pase a 'confirmado' (hoy la tabla está vacía, el scoring la ignora)
- [ ] Validación de modo vs score del inquilino al crear vinculación (si propiedad es Premium, inquilino debe tener score ≥85)
- [ ] Sistema real de notificaciones (tabla `notificaciones` con inbox del usuario + campana con unreads)

### Crecimiento
- [ ] Comprar dominio propio (rentto.com o rentto.ve)
- [ ] Configurar Resend con dominio custom (hoy mails caen en spam por `onboarding@resend.dev`)
- [ ] Preparar landing de marketing / wait-list
- [ ] Plan de piloto con 10 propiedades en Caracas (Municipio Sucre)

### Técnico
- [ ] 4 Recommendations que Vercel muestra en Deployment Settings (revisar qué son)
- [ ] Considerar si los `console.log` de `make-icons.js` siguen siendo necesarios
- [ ] PWA — revisar por qué no se instala bien desde teléfono

## 📋 Decisiones tomadas

- **Scoring:** 6 criterios medibles con datos actuales, escalados a 100 pts. Sin integraciones externas por ahora (identidad, bancos, referencias externas) — viene en fase 2
- **Modos:** pricing según MODELO-NEGOCIO.md, sin enforcement de score_minimo todavía (el propietario puede elegir cualquiera)
- **RLS:** conviven policies en español (viejas, owner-only) con las mías en inglés (añaden propietario-view). Son PERMISSIVE → se combinan con OR. Limpieza de duplicados: tarea futura
- **Env vars:** `NEXT_PUBLIC_*` porque son client-side. Supabase anon key es safe de exponer por diseño (RLS protege)

## 📂 Archivos clave

- `MODELO-NEGOCIO.md` — estrategia de producto, 3 modos, scoring criteria
- `supabase-rls.sql` — policies RLS idempotentes (para correr en SQL editor)
- `src/app/lib/scoring.js` — función pura de scoring MVP
- `src/app/lib/modos.js` — definición de los 3 modos + helpers
- `src/app/lib/supabase.js` — cliente con env vars
- `src/app/globals.css` — design tokens (Tailwind v4 @theme)
- `src/app/TopBar.js` / `NavBar.js` — chasis autenticado

## 🎯 Próxima sesión — prioridades sugeridas

1. **Auto-registro en score_historial** (trigger en Supabase) — hace real el scoring
2. **Validación modo vs score** — impide que inquilinos se vinculen a propiedades fuera de su rango
3. **Limpieza de data** (fotos sucias, nulls en modo)
4. **Dominio propio + Resend** — fuera del spam
5. **Landing de wait-list** con `/modos` educativa
