# Estado del Proyecto — Rentto

**Última actualización:** 25 abril 2026 (sesión extendida)

## ✅ Completado en sesión 25 abr

### Producto core
- [x] **Validación modo vs score** en `/vincular` y marketplace — bloquea vinculación si score insuficiente
- [x] **Trigger de score en Supabase** — auto-registra +7/−10 pts en `score_historial`
- [x] **UI Historial de pagos** en `/contrato` inquilino — timeline con eventos
- [x] **Página `/modos`** pública para marketing y educación
- [x] **Sistema de notificaciones inbox**: tabla + RLS + 3 triggers + página `/notificaciones`
- [x] **Bell del TopBar** muestra unreads de notificaciones (no más pagos pendientes)
- [x] **Botón quitar foto inline** en `/propietario`
- [x] **Emails automáticos para 4 eventos** con templates (`/api/notificar` refactor)
- [x] **Email column en perfiles** + trigger auto-populate desde auth.users
- [x] **PWA real**: manifest enriquecido, SW funcional, install prompt component

### Performance
- [x] Vercel Analytics + Speed Insights integrados
- [x] **Score 100/100 móvil y desktop** (P75 usuarios reales)
- [x] LCP 0.58s móvil, 1.41s desktop. CLS 0. TTFB 0.2s

### Mejoras post-cierre (extensión de sesión)
- [x] **Dashboard inquilino dinámico**: `ProximaAccion` card que cambia según estado del mes (confirmado/pendiente/rechazado/vencido/sin pagar). Countdown chip "Faltan Xd" o "Vencido". Score mini-card con tendencia "+N este mes"
- [x] **Preferencias de notificaciones** persistidas: tabla `perfiles.notif_prefs` JSONB + helper `user_quiere_notif()`. Triggers respetan in_app, clientes respetan email. Sub-página `/notificaciones/preferencias` con toggles por evento×canal
- [x] **Búsqueda en `/inquilinos`** por nombre/propiedad/dirección/teléfono
- [x] **Export CSV de pagos** en `/propietario` con BOM UTF-8 (Excel detecta acentos correctamente)

## ⏳ Pendiente

### Acciones tuyas (Supabase)
- [ ] Correr `supabase-notif-prefs.sql` (column + helper + triggers actualizados)

### Acciones tuyas (Vercel UI)
- [ ] Activar Web Analytics toggle en sidebar "Analítica"
- [ ] Activar Speed Insights toggle en "Información sobre velocidad"
- [ ] Activar "Implementación de vista previa"
- [ ] Expandir "4 Recomendaciones" en Configuración de implementación

### Acciones tuyas (Externas)
- [ ] **Comprar dominio propio** (rentto.com o rentto.ve)
- [ ] Configurar DNS apuntando a Vercel
- [ ] Verificar dominio en Resend (entonces emails llegan a cualquier destinatario, no solo al verificado)

### Crecimiento (post-dominio)
- [ ] Plan de piloto con 10 propiedades en Caracas
- [ ] Wait-list / landing de marketing con `/modos` como punto central

## 📋 Decisiones tomadas en esta sesión

- **Score histórico vs score visible:** dos modelos. `score_historial.score_total` es ledger acumulativo de eventos de pago. El score de la card son 6 criterios escalados a 100. UI lo aclara
- **Notificaciones INSERT:** solo via triggers SECURITY DEFINER. Cliente NO inserta directamente
- **Email enforcement:** preferencias se respetan en dos lugares — triggers chequean `in_app`, clientes chequean `email` antes de llamar `/api/notificar`
- **CSV export:** BOM UTF-8 para que Excel abra acentos/ñ correctamente en Windows
- **Dashboard estado del mes:** lógica centralizada en `calcularEstadoMes()` con 5 ramas (confirmado/pendiente/rechazado/vencido/sin_pagar_aun)

## 📂 Archivos SQL pendientes de correr (en orden)

1. `supabase-rls.sql` — policies (ya corrido)
2. `supabase-score-trigger.sql` — trigger de score (ya corrido)
3. `supabase-notificaciones.sql` — inbox (ya corrido)
4. `supabase-perfiles-email.sql` — email column (ya corrido)
5. `supabase-notif-prefs.sql` — preferencias (**pendiente**)

## 📂 Archivos clave en esta sesión

- `supabase-score-trigger.sql`, `supabase-notificaciones.sql`, `supabase-perfiles-email.sql`, `supabase-notif-prefs.sql`
- `src/app/lib/scoring.js`, `src/app/lib/modos.js`
- `src/app/modos/page.js` — landing pública
- `src/app/notificaciones/page.js` — inbox
- `src/app/notificaciones/preferencias/page.js` — preferencias
- `src/app/dashboard/page.js` — dinámico con ProximaAccion + ScoreMiniCard
- `src/app/PWAInstaller.js` — registro SW + install prompt
- `public/sw.js`, `public/manifest.json` — PWA shell

## 🎯 Próxima sesión — prioridades

1. **Comprar dominio + verificar en Resend** (acción tuya, crítica)
2. **Conectar dominio a Vercel** (post-compra, 30 min de DNS)
3. **Plan de piloto** — definir 10 candidatos en Caracas, agenda de outreach
4. **Landing de wait-list** o ajustes a `/modos` para captar interés pre-launch
