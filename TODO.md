# TODO — Auditoría Técnica Integral GOLAZO

> Auditoría realizada el 2026-07-03 sobre todo el proyecto (arquitectura, backend, Prisma, seguridad, frontend, UX/UI, DevOps, testing, SEO, accesibilidad y producto).
> Todos los hallazgos fueron **verificados en el código actual** (no es una lista teórica).
> El proyecto está en desarrollo y sin producción: se pueden cambiar modelos y reglas de negocio libremente.

**Leyenda**

- Prioridad: 🔴 Crítico · 🟠 Alto · 🟡 Medio · 🟢 Bajo
- Esfuerzo: `E:Bajo` (horas) · `E:Medio` (1-3 días) · `E:Alto` (semana+)
- Estado: `[ ]` pendiente · `[x]` hecho · `[~]` parcial

**Resumen ejecutivo**

| Área | Estado |
|---|---|
| Arquitectura | Buena base modular (`modules/`), pero con árbol duplicado en `app/admin/*` y capa legacy (`Phase`) conviviendo con la nueva (`TournamentPhase`) |
| Backend/API | Funcional pero inseguro: mass assignment, endpoints sin auth, sin validación Zod, sin transacciones |
| Prisma/BD | Modelo rico pero sin índices, con borrado físico pese a `deletedAt`, y doble fuente de verdad en standings |
| Seguridad | Varios agujeros OWASP (A01, A03, A04) — ver sección Crítico |
| Frontend | Landing premium muy buena; el resto es inconsistente (93 archivos con colores hardcodeados, 42 con `<img>`, 2 `loading.tsx`, 0 `error.tsx`) |
| Testing | Inexistente (0 tests) |
| DevOps | Sin CI/CD, sin Docker, sin monitoreo, sin backups documentados |
| Producto | Falta el corazón SaaS: multi-tenancy, inscripciones, fixture automático, notificaciones |

---

## 🔴 CRÍTICO — Seguridad e integridad de datos (Sprint 1)

### C1. `GET /api/users/stats` sin ningún control de acceso

- [x] **Problema:** El endpoint devuelve métricas completas de usuarios (totales, roles, crecimiento, logins) sin verificar sesión ni rol. Verificado: no importa `auth()` ni `validateApiRole` ([app/api/users/stats/route.ts](app/api/users/stats/route.ts)).
- **Explicación:** Cualquier visitante anónimo puede hacer `curl /api/users/stats` y obtener inteligencia del negocio y distribución de roles (útil para atacar cuentas ADMINISTRADOR).
- **Impacto/Riesgo:** Fuga de datos e inteligencia de negocio. OWASP A01 (Broken Access Control).
- **Solución:** Agregar `validateApiRole(["ADMINISTRADOR"])` al inicio del handler, igual que en `app/api/users/route.ts`.
- **Esfuerzo:** E:Bajo · **Beneficio:** Cierra fuga de datos inmediata.

### C2. Mass assignment (`data: { ...body }`) en mutaciones

- [x] **Problema:** Varias rutas insertan/actualizan con spread directo del body: [app/api/team-player/route.ts](app/api/team-player/route.ts), [app/api/team-player/[id]/route.ts](app/api/team-player/[id]/route.ts), [app/api/players/[id]/route.ts](app/api/players/[id]/route.ts), [app/api/matches/[id]/route.ts](app/api/matches/[id]/route.ts).
- **Explicación:** Un cliente malicioso puede enviar campos no previstos (`tournamentId`, `createdAt`, ids de relaciones) y sobreescribirlos; los campos desconocidos además provocan errores 500 de Prisma.
- **Impacto/Riesgo:** Corrupción de datos, escalada de datos entre torneos. OWASP A04/A08.
- **Solución:** Whitelist explícita de campos + validación Zod (ver C3). Nunca `...body`.
- **Esfuerzo:** E:Medio · **Beneficio:** Integridad garantizada de las entidades.

### C3. Sin validación de entrada (Zod) en la API — fechas incluidas

- [x] **Problema:** Solo Cloudinary valida con Zod. El resto hace `new Date(body.dateTime)` / `new Date(body.birthDate)` sin guards (ej. [app/api/matches/[id]/route.ts:53](app/api/matches/[id]/route.ts#L53), [app/api/players/[id]/route.ts](app/api/players/[id]/route.ts)); un body sin fecha guarda `Invalid Date` o revienta con 500.
- **Explicación:** Zod ya está en las dependencias y se usa en formularios; falta la capa server.
- **Solución:** Crear `lib/validators/*.ts` con esquemas por entidad y reutilizarlos en API + formularios (una sola fuente de verdad).
- **Ejemplo:**
  ```ts
  // lib/validators/match.ts
  export const matchUpdateSchema = z.object({
    dateTime: z.coerce.date(),
    stadium: z.string().trim().max(120).nullish(),
    status: z.nativeEnum(MatchStatus),
    homeScore: z.number().int().min(0).max(99).nullable(),
    awayScore: z.number().int().min(0).max(99).nullable(),
    tournamentPhaseId: z.string().uuid().nullish(),
    roundNumber: z.number().int().positive().nullish(),
  }).strict();

  // en la ruta
  const parsed = matchUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return apiError(400, "Datos inválidos", parsed.error.flatten());
  ```
- **Esfuerzo:** E:Medio-Alto (todas las rutas) · **Beneficio:** Errores 400 predecibles, sin estados corruptos.

### C4. Cloudinary sign/delete abiertos a cualquier usuario autenticado

- [x] **Problema:** `POST /api/cloudinary/sign` y `DELETE /api/cloudinary/delete` solo exigen `userId` de Clerk. Un usuario con rol `USUARIO` puede obtener firmas de subida y **borrar cualquier imagen del bucket por publicId** ([app/api/cloudinary/delete/route.ts](app/api/cloudinary/delete/route.ts)).
- **Impacto/Riesgo:** Vandalismo del CDN completo (logos, fotos, portadas). Irreversible.
- **Solución:** `validateApiRole(["ADMINISTRADOR","EDITOR","ORGANIZADOR"])` en ambos + validar que el `publicId` pertenezca a una entidad que el usuario puede gestionar (buscar el publicId en Tournament/Team/Player/News antes de borrar) + restringir `folder` firmado a un prefijo por entidad.
- **Implementado (2026-07-04):** rol en ambos endpoints; `folder` de firma restringido a enum `ALLOWED_UPLOAD_FOLDERS` ([types/cloudinary.ts](types/cloudinary.ts)) — al agregar una entidad con imágenes hay que registrar su carpeta ahí; `publicId` de borrado limitado por regex a las carpetas gestionadas (`torneos/`, `equipos/`, `noticias/`, `jugadores/`).
- **Pendiente (→ S2/C7):** el check "publicId pertenece a una entidad del usuario" no se implementó: rompería el flujo de reemplazo/quitar imagen del uploader (borra assets recién subidos aún no persistidos) y sin multi-tenancy todos los roles de gestión administran todo. Rehacer cuando exista `organizationId`.

### C5. XSS almacenado en detalle de noticia

- [x] **Problema:** `dangerouslySetInnerHTML` con contenido editable sin sanitizar ([app/(public)/noticias/[id]/page.tsx:245](app/(public)/noticias/[id]/page.tsx#L245)).
- **Explicación:** Un EDITOR (o cualquiera si la API de noticias se ve comprometida) puede inyectar `<script>`/`onerror` que se ejecuta en todos los visitantes.
- **Solución:** Sanitizar con `isomorphic-dompurify` en el server antes de renderizar, o migrar el contenido a un formato estructurado (tiptap/markdown).
- **Implementado (2026-07-04):** el contenido es texto plano (Textarea en admin), así que se eliminó `dangerouslySetInnerHTML` y se renderiza como texto React con `whitespace-pre-line` (conserva saltos de línea, sin HTML). ⚠️ Si a futuro se agrega editor rich-text (tiptap/markdown), reintroducir render HTML **solo** con sanitización server-side (`isomorphic-dompurify`).
- **Esfuerzo:** E:Bajo · **Beneficio:** Elimina OWASP A03 en la superficie pública.

### C6. Integridad de standings: sin transacciones + bugs de fase

- [x] **Problema (4 bugs verificados en [lib/standings/calculate-standings.ts](lib/standings/calculate-standings.ts) y [app/api/matches/[id]/route.ts](app/api/matches/[id]/route.ts)):**
  1. Ninguna operación de standings corre en `db.$transaction`; si falla a mitad, la tabla queda desincronizada para siempre.
  2. El PATCH de partido selecciona el estado previo **sin `tournamentPhaseId`** (`select` en línea ~31), por lo que `applyMatchResult` compara `undefined !== nuevaFase` y suma/resta en la fase equivocada → `TeamPhaseStats` se corrompe al editar resultados.
  3. `recalculateTournamentStandings` resetea `TournamentTeam` pero **no** `TeamPhaseStats`, y su `findMany` tampoco selecciona `tournamentPhaseId` → cada recálculo duplica acumulados de fase.
  4. `phaseTypeCountsPoints()` existe en [lib/standings/phase-utils.ts](lib/standings/phase-utils.ts) pero **nunca se invoca**: los partidos de fases KNOCKOUT suman puntos a la tabla general (regla de negocio rota). El estado `WALKOVER` tampoco computa resultado.
  5. (Hallazgo C3, 2026-07-04) La API `tournament-teams` acepta stats de standings (`wins`, `points`, `goalDifference`, etc.) directamente del cliente en POST/PATCH; hoy validado con Zod (rango -999..9999) pero sigue siendo doble fuente de verdad frente al cálculo automático. Decidir si esos campos se quitan del contrato público o se limitan a un flujo de "ajuste manual" auditado.
- **Solución:** Envolver match+stats en `db.$transaction`; incluir `tournamentPhaseId` en ambos selects; resetear/eliminar `TeamPhaseStats` en el recálculo; aplicar `phaseTypeCountsPoints` antes de sumar puntos globales; implementar WALKOVER según decisión ✅: el admin marca el equipo ganador y el sistema fija 3-0 automáticamente, computándolo como partido finalizado con puntos.
- **Ejemplo:**
  ```ts
  await db.$transaction(async (tx) => {
    const updated = await tx.match.update({ where: { id }, data });
    await applyMatchResult(tx, previousResult, extractMatchResult(updated));
  });
  ```
  (pasar `tx` a `applyStatsToTeam` en lugar de `db`).
- **Esfuerzo:** E:Medio · **Beneficio:** La tabla de posiciones —el corazón del producto— pasa a ser confiable.
- **Implementado (2026-07-04):** `applyMatchResult(tx, prev, new)` ahora exige cliente de transacción; match POST/PATCH y goles (add/delete) corren mutación+standings en `db.$transaction`. Selects incluyen `tournamentPhaseId`. Recálculo en transacción única (timeout 30s): resetea `TournamentTeam` **y** `TeamPhaseStats` vía `updateMany` (conserva `bonusPoints` manuales) e incluye WALKOVER. Fases KNOCKOUT ya no suman a la tabla general (`phaseTypeCountsPoints`), solo a `TeamPhaseStats`. WALKOVER computa como finalizado. **✅ Cerrado del todo en N7 (2026-07-08):** el server ya no exige marcador manual — el organizador marca el equipo ganador y `resolveWalkover` fija `walkoverScore`-0 automáticamente; el diálogo de partido muestra el selector de ganador al elegir estado WALKOVER.
- **Ítem 5 (stats manuales vía tournament-teams): ✅ cerrado en F3 (2026-07-14).** Decisión del usuario: se quitan del contrato. La API de `tournament-teams` ya no acepta `wins`/`points`/`goalDifference`/etc. del cliente ([lib/validators/tournament-team.ts](lib/validators/tournament-team.ts)) y el formulario de inscripción no los pide más: las estadísticas salen solo del cálculo automático sobre los partidos. El ajuste manual de puntos (quita por sanción) va por `bonusPoints`, que el recálculo respeta. **C6 cerrado del todo.**

### C7. Autorización sin ownership + borrado físico en cascada

- [x] **Problema:** Cualquier `ORGANIZADOR`/`EDITOR` puede editar o **eliminar físicamente** torneos de otros usuarios ([app/api/tournaments/[id]/route.ts](app/api/tournaments/[id]/route.ts) hace `db.tournament.delete` → cascade borra partidos, goles, tarjetas, stats e historia). Existe `deletedAt` en el modelo pero no se usa.
- **Solución (regla confirmada ✅):**
  1. ADMINISTRADOR y MODERADOR gestionan todo; ORGANIZADOR/EDITOR solo ven y editan recursos propios (`userId === user.id`), tanto en listados del admin como en mutaciones.
  2. DELETE → soft delete (`deletedAt: new Date()`) + filtrar `deletedAt: null` en todos los listados.
  3. Helper único `assertCanManage(user, resource)` en `lib/`, preparado para recibir `organizationId` cuando llegue S2.
- **Implementado parcial (2026-07-05) — punto 2:** DELETE de torneo es soft delete (`deletedAt + enabled:false`), PATCH y recalculate rechazan torneos eliminados (404), y todos los listados/lecturas filtran `deletedAt: null` (`GET /api/tournaments`, `getTorneos`, `getTorneoById`, historial de perfil). Los datos quedan recuperables (restaurar = `deletedAt: null`; UI de papelera pendiente, va con F3).
- **Completado (2026-07-05) — puntos 1 y 3 vía N1/N2:** ownership por organización con `requireApiOrgAccess`/`canManageOrg` en [lib/orgAuth.ts](lib/orgAuth.ts), aplicado a todas las mutaciones. C7 cerrado (los listados del panel por org quedan en N3/N10).
- **Esfuerzo:** E:Medio · **Beneficio:** Aislamiento entre organizadores (pre-requisito para multi-tenancy) y datos recuperables.

### C8. Middleware sin protección de rutas (defensa en profundidad)

- [x] **Problema:** [middleware.ts](middleware.ts) es `clerkMiddleware()` pelado: no protege `/admin` ni `/api`. Toda la seguridad depende de que cada page/handler se acuerde de validar (y varios no lo hacen, ver C1).
- **Implementado (2026-07-05):** `/admin(.*)` y `/profile(.*)` con `auth.protect()` (anon → redirect a sign-in); toda mutación de `/api` (métodos no GET/HEAD/OPTIONS) exige sesión → 401 aunque el handler olvide validar; `/api/webhooks(.*)` excluido (validarán firma propia: Clerk/Mercado Pago). GETs públicos siguen abiertos. Verificado con dev server: POST/PATCH/DELETE anónimos → 401, GETs públicos → 200, /admin → 307 a Clerk.
- **Solución:**
  ```ts
  const isProtected = createRouteMatcher(["/admin(.*)", "/profile(.*)"]);
  export default clerkMiddleware(async (auth, req) => {
    if (isProtected(req)) await auth.protect();
  });
  ```
  Mantener validación de rol fina en layouts/handlers (capa 2).
- **Esfuerzo:** E:Bajo · **Beneficio:** Un fallo puntual en una page ya no expone el panel.

### C9. Sin headers de seguridad ni rate limiting

- [x] **Problema:** [next.config.ts](next.config.ts) no define `headers()` (falta CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy). Ninguna API tiene rate limiting (login/uploads/recalculate incluidos).
- **Solución:** Bloque `headers()` en next.config + rate limiting con `@upstash/ratelimit` (o Arcjet) en middleware para `/api/*`.
- **Implementado (2026-07-05):**
  - Headers en [next.config.ts](next.config.ts): CSP (permite Clerk dev, Turnstile, Cloudinary; `unsafe-inline/eval` quedan hasta endurecer con nonces en F0), HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy. ⚠️ Al pasar Clerk a dominio de producción, agregar ese dominio a la CSP.
  - Rate limiting por IP en [middleware.ts](middleware.ts) con [lib/rate-limit.ts](lib/rate-limit.ts) (en memoria, ventana fija 1 min): 120 lecturas / 30 escrituras por IP → 429 con `Retry-After`. Verificado: 30 POST pasan, del 31 en adelante 429; GETs no afectados.
  - ⚠️ Limitación documentada: contadores por instancia; si el deploy final es serverless multi-instancia, reemplazar por `@upstash/ratelimit` manteniendo la firma de `rateLimit()`.
- **Esfuerzo:** E:Medio · **Beneficio:** Hardening base de producción; mitiga fuerza bruta, clickjacking y abuso.

### C10. Server actions de mutación sin autenticación ni rol (hallazgo C6, 2026-07-04)

- [x] **Problema:** 4 archivos de server actions mutan la BD sin ningún check de auth/rol (verificado: solo `modules/usuarios/actions/user-profile.ts` valida sesión):
  - [modules/partidos/actions/goals.ts](modules/partidos/actions/goals.ts) — `addGoal`/`deleteGoal` (además tocan standings).
  - [modules/partidos/actions/cards.ts](modules/partidos/actions/cards.ts) — tarjetas.
  - [modules/partidos/actions/referees.ts](modules/partidos/actions/referees.ts) — árbitros de partido.
  - [modules/arbitros/actions/actions.ts](modules/arbitros/actions/actions.ts) — CRUD árbitros.
- **Explicación:** Las server actions son endpoints HTTP públicos (POST con action-id); cualquier visitante puede invocarlas sin sesión y modificar goles, marcadores y standings.
- **Impacto/Riesgo:** Equivalente a C1/C4 pero en la capa de actions. OWASP A01.
- **Solución:** Guard compartido tipo `requireRole(["ADMINISTRADOR","EDITOR","ORGANIZADOR"])` (versión para actions de `validateApiRole`) al inicio de cada action de mutación.
- **Implementado (2026-07-05):** creado [lib/actionRoleValidation.ts](lib/actionRoleValidation.ts) (`requireActionRole`, devuelve objeto serializable) y aplicado a las 12 mutaciones: addGoal/deleteGoal, addCard/deleteCard, assignRefereeToMatch/removeRefereeFromMatch, createReferee/updateReferee/toggleRefereeEnabled/updateRefereeStatus/deleteReferee/restoreReferee. Con N1 estos guards migran a `requireOrgRole`.
- **Esfuerzo:** E:Bajo · **Beneficio:** Cierra mutaciones anónimas de datos de partido.

---

## 🟠 ALTO — Bugs y deuda estructural (Sprints 2-3)

### A1. Código duplicado masivo: `app/admin/*` vs `modules/*`

- [~] **Problema:** Árboles de componentes **idénticos byte a byte** (verificado con diff): `app/admin/jugadores/components/PlayersTable.tsx` == `modules/jugadores/components/admin/PlayersTable.tsx`; ídem `StatsCards`, `ListTournaments`, `DialogAddTournaments`, `player-form`, y `lib/calcularEdad.ts` == `modules/shared/utils/calcularEdad.ts`. También hay dobles: `lib/formatDate.ts` vs `modules/shared/utils/formatDate.ts` (difieren), `components/admin/match-dialog.tsx` vs `DialogAddEditMatch.tsx`.
- **Impacto:** Cada fix hay que hacerlo dos veces; ya hay divergencias silenciosas.
- **Solución:** Elegir `modules/` como única fuente (coincide con docs/ARQUITECTURA.md), borrar duplicados de `app/` y `lib/`, y actualizar imports. Agregar regla ESLint `no-restricted-imports` para prevenir regresiones.
- **Implementado (2026-07-05):**
  - Componentes: `modules/` es la fuente única. Borrados `app/admin/jugadores/components/*` y `app/admin/torneos/components/*`; páginas importan de `@modules/...`. La divergencia era **bidireccional** (confirmada): `player-form` bueno estaba en `app/` (CloudinaryUpload + publicIds → copiado a modules) y `DialogAddTournaments` bueno en `modules/` (enabled/rules/trophy).
  - Utils: canónico queda en `lib/` (convención ShadCN `@/lib/utils` + ~80 imports existentes; desviación deliberada de la solución original). Borrados los muertos `modules/shared/utils/{utils,calcularEdad,formatDate}.ts` (0 imports los usaban; el `formatDate` de modules era además una versión vieja con bug de timezone).
  - Verificado con `next build` completo en verde (31 páginas).
- **Unificación de los diálogos de partido: hecha (2026-07-14, F3).** `components/admin/match-dialog.tsx` y `DialogAddEditMatch.tsx` se fusionaron en [MatchFormSheet](modules/partidos/components/admin/MatchFormSheet.tsx) (ver F3 "Formularios y diálogos"): el de `/admin/partidos` estaba además roto de raíz (pedía equipos a una ruta inexistente y mandaba ids de la entidad equivocada).
- **Pendiente:** regla ESLint `no-restricted-imports` para prevenir regresiones.
- **Esfuerzo:** E:Medio · **Beneficio:** −30% superficie de mantenimiento.

### A1b. Migrar `middleware.ts` → `proxy.ts` (hallazgo A1, 2026-07-05)

- [ ] **Problema:** Next 16 avisa en cada build: `The "middleware" file convention is deprecated. Please use "proxy" instead.` Además el `config.matcher` debe ser string literal estáticamente analizable (usar `String.raw` rompe el build con "Invalid segment configuration export" — ya documentado en comentario del archivo).
- **Solución:** Renombrar a `proxy.ts` siguiendo la guía oficial cuando se toque el middleware de nuevo (C8/C9 ya implementados ahí). **E:Bajo**

### A2. Dashboard admin de torneos con contadores rotos

- [x] **Problema:** Compara `t.status === "En curso"` y `"Inscripciones"` (labels de UI) contra el enum real (`ACTIVO`, `INSCRIPCION`) → esos KPIs siempre muestran 0. Verificado en [app/admin/torneos/page.tsx:55](app/admin/torneos/page.tsx#L55) y [:66](app/admin/torneos/page.tsx#L66).
- **Solución:** Comparar contra `TournamentStatus.ACTIVO` / `INSCRIPCION` y mapear labels solo para mostrar (usar `lib/constants.ts`).
- **Implementado (2026-07-05):** los 5 filtros rotos comparan ahora contra `TournamentStatus.ACTIVO/INSCRIPCION/FINALIZADO` (página admin + `StatsCards` de torneos). De paso se eliminó el `console.log` que imprimía torneos con el objeto `user` completo (email/teléfono) en logs del server — parte de A10.
- (Hallazgo 2026-07-05) `modules/torneos/components/ListTorneos.tsx` es código muerto: datos mock hardcodeados y 0 imports. Borrarlo en la limpieza de A5/M-cleanup.
- **Esfuerzo:** E:Bajo · **Beneficio:** Métricas correctas para el admin.

### A3. Consultas pesadas y sin paginación (N+1 / payload gigante)

- [ ] **Problema:** `getTorneoById` incluye 6 niveles de relaciones (torneo → teams → players + matches → goals/cards → teamPlayer → player → team) ([modules/torneos/actions/getTorneoById.ts](modules/torneos/actions/getTorneoById.ts)); `GET /api/matches` devuelve **todos** los partidos de la BD con includes profundos; players/noticias/torneos sin `page/limit`.
- **Solución:** `select` mínimo por vista, paginación (`cursor` o `skip/take`) con metadatos `{ data, total, page }`, y dividir el detalle de torneo en queries por tab (standings / fixture / plantel se cargan al abrir cada tab).
- **Esfuerzo:** E:Alto · **Beneficio:** Escala a torneos grandes; TTFB estable.

### A4. Sincronización de usuarios Clerk↔BD incompleta

- [~] **Problema:** No existe webhook de Clerk (verificado: 0 referencias a svix/webhook). Consecuencias: `lastLoginAt` y `emailVerified` **nunca se actualizan** (la UI de usuarios muestra "Nunca"); si un usuario cambia email/foto o se elimina en Clerk, la BD queda desincronizada; `checkUser()` hace find+create sin manejar la race (dos requests simultáneas → error P2002) y corre una query por cada request de página. Además (hallazgo C3, 2026-07-04) `POST /api/users` crea usuarios con `clerkUserId: temp_${Date.now()}` — usuarios que jamás podrán loguearse ni vincularse a Clerk.
- **Solución:** Crear `app/api/webhooks/clerk/route.ts` (svix) para `user.created/updated/deleted` + `session.created` (actualiza `lastLoginAt`); en `checkUser` usar `upsert` y cachear con `React.cache()` por request.
- **Implementado (2026-07-05):**
  - [app/api/webhooks/clerk/route.ts](app/api/webhooks/clerk/route.ts) con `verifyWebhook` de `@clerk/nextjs/webhooks` (secret: env `CLERK_WEBHOOK_SECRET`, ya configurado en Clerk apuntando a `https://torneos-web-app.vercel.app/api/webhooks/clerk`). Maneja `user.created` (upsert, status ACTIVO), `user.updated` (solo campos de Clerk, no pisa role/status/phone/bio), `user.deleted` (baja lógica) y `session.created` (`lastLoginAt`). Firma inválida → 400 (verificado); error de BD → 500 (Clerk reintenta); conflicto P2002 → 200 con log (reintentar no lo arregla).
  - [lib/checkUser.ts](lib/checkUser.ts): `React.cache()` (1 query por request), `upsert` con `update: {}` (no pisa datos del admin), race del primer login (P2002) manejada. Usuarios nuevos nacen con `status: ACTIVO` (decisión D5).
  - ⚠️ En el dashboard de Clerk deben estar suscriptos los eventos: `user.created`, `user.updated`, `user.deleted`, `session.created`.
- **Pendiente:** eliminar el `clerkUserId: temp_` de `POST /api/users` (decidir si ese endpoint de alta manual sobrevive o se reemplaza por invitaciones de Clerk — probablemente muera con N1/N2).
- **Esfuerzo:** E:Medio · **Beneficio:** Datos de usuarios reales y confiables; menos queries.

### A5. Sin manejo global de errores ni estados de carga

- [x] **Problema:** 0 archivos `error.tsx`/`global-error.tsx` en todo `app/`; solo 2 `loading.tsx` (noticias y usuarios admin). Un throw en un server component muestra la pantalla de error cruda de Next.
- **Solución:** `app/error.tsx` + `app/global-error.tsx` con diseño Premium Golazo (reutilizar estilo del NotFound ya rediseñado) y `loading.tsx` por sección con skeletons.
- **Implementado (2026-07-05):** [app/error.tsx](app/error.tsx) (estilo premium del 404, botón Reintentar con `reset()` + digest visible), [app/global-error.tsx](app/global-error.tsx) (último recurso con `<html>/<body>` y estilos inline — Tailwind puede no estar si falló el root layout), [app/loading.tsx](app/loading.tsx) y [app/admin/loading.tsx](app/admin/loading.tsx) con `FullscreenLoading`. Build completo en verde. Los skeletons por sección quedan en M10 (ya documentado ahí).
- **Esfuerzo:** E:Medio · **Beneficio:** Resiliencia percibida de nivel producto.

### A6. Prisma: índices ausentes y modelo legacy conviviendo

- [~] **Problema:**
  - Sin índices en: `Match(tournamentId, dateTime)`, `Match(status)`, `Goal(matchId)`, `Card(matchId)`, `TeamPlayer(tournamentTeamId)`, `Tournament(status, deletedAt)`, `News(published, publishedAt)`, `User(role, status)`.
  - `Phase`/`phaseId` (legacy) convive con `TournamentPhase` en Tournament y Match — dos caminos para lo mismo.
  - `News.publishedAt` tiene `@default(now())` aunque sea borrador (orden de publicación falso).
  - `Team.yearFounded` es `String` (sin validación ni orden).
  - `Tournament.nextMatch` es un dato derivable (denormalización manual propensa a quedar vieja).
- **Solución:** Migración única: agregar `@@index`, migrar datos de `Phase`→`TournamentPhase` y eliminar el modelo legacy, `publishedAt DateTime?` (se setea al publicar), `yearFounded Int?`, y calcular `nextMatch` con query en lugar de campo.
- **Implementado (2026-07-05, migración `nueva_estructura`):** todos los índices ✅ (más `organizationId` en las 4 entidades, `homeTeamId/awayTeamId/tournamentPhaseId` en Match, `AuditLog(entity, entityId)`), `Phase` legacy eliminado ✅, `yearFounded Int?` ✅. **Pendiente:** `publishedAt` nullable y eliminar `nextMatch` derivable (quedaron como estaban para no tocar más UI en esta pasada).
- **Esfuerzo:** E:Medio-Alto · **Beneficio:** Queries rápidas y un solo modelo mental de fases.

### A7. Formato de respuesta de API inconsistente

- [~] **Problema:** Mezcla de formas: `NextResponse.json(match)`, `{ success, error, message }`, `new NextResponse("texto")`, y `GET /api/tournaments` devuelve **200 con `{message}`** cuando no hay resultados (el cliente espera array → runtime error).
- **Solución:** Helper `apiResponse.ts` (`ok(data, meta?)` / `fail(status, code, message)`) y usarlo en el 100% de las rutas. Listas vacías devuelven `[]`, no mensajes.
- **Implementado (2026-07-05):** creado [lib/apiResponse.ts](lib/apiResponse.ts) (`apiOk`/`apiError`) con la convención documentada: éxito = datos directos, listas vacías = `[]`, error = `{ error, details? }` JSON con status correcto. Corregido el bug de `GET /api/tournaments` (`{message}` con 200 → `[]`) y eliminados los 5 `new NextResponse("texto")` (players ×2, tournaments ×2, teams).
- **Pendiente (deliberado):** migrar los éxitos de todas las rutas al envelope `{ success, data }` se hace en el rewrite de rutas de N1/N2 — cambiarlo hoy obliga a tocar cada `fetch` del frontend dos veces. `users/*` conserva su envelope histórico hasta entonces.
- **Esfuerzo:** E:Medio · **Beneficio:** Frontend predecible, menos `any` defensivos.

### A8. Testing inexistente + sin CI

- [~] **Problema:** 0 tests, no hay `.github/workflows`, ni scripts de test. `npm run lint` es la única verificación.
- **Solución (mínimo viable):**
  1. Vitest + unit tests de `lib/standings/*` y validadores Zod (la lógica más crítica y más testeable).
  2. Playwright con 3 flujos E2E: crear torneo → agregar equipos → cargar resultado → verificar tabla.
  3. GitHub Actions: `lint + tsc --noEmit + vitest + build` en cada PR.
- **Implementado (2026-07-05) — punto 1 parcial + punto 3:**
  - Vitest instalado ([vitest.config.ts](vitest.config.ts), scripts `test`/`test:watch`). 21 tests verdes en `tests/standings/`: `applyMatchResult` con TransactionClient falso (creación, empate, WALKOVER, no-contables, edición 2-1→2-2, reversión, delta neto cero, fase GROUP, fase KNOCKOUT sin puntos globales, cambio de fase, fase inexistente) + `phase-utils` puros. Red de seguridad lista ANTES de la migración N1/N2.
  - [.github/workflows/ci.yml](.github/workflows/ci.yml): job bloqueante `tsc + vitest` (con `prisma generate` y DATABASE_URL dummy) + job de lint **no bloqueante** (hay ~26 errores preexistentes: unused imports en partidos/usuarios, `any` en match-dialog/MatchDetailModal/StandingsTable — limpiarlos y volver el lint bloqueante).
- **Pendiente:** tests de validadores Zod, Playwright E2E, `next build` en CI (tarda; evaluar), lint bloqueante.
- **Esfuerzo:** E:Alto · **Beneficio:** Red de seguridad para refactors (especialmente C6/A6).

### A9. Dependencias: mismatch y sobrepeso

- [ ] **Problema:** `eslint-config-next@15.3.5` con `next@16.1.5` (reglas desactualizadas); **tres** librerías de animación (framer-motion + gsap + ogl) — verificar si gsap/ogl se usan más allá de `Particles.tsx`; `ts-node` innecesario con seeds en JS.
- **Solución:** Alinear `eslint-config-next@16`, consolidar animaciones en framer-motion (o CSS), eliminar deps sin uso (`npx depcheck`).
- (Hallazgo 2026-07-05) `npm install` reporta **18 vulnerabilidades (4 moderate, 12 high, 2 critical)** — correr `npm audit` y evaluar `npm audit fix` al hacer esta tarea.
- **Esfuerzo:** E:Bajo · **Beneficio:** Bundle menor, lint correcto para Next 16.

### A10. `console.log` con datos de usuario en server

- [x] **Problema:** 20 `console.log` incluyendo el objeto usuario completo en [app/admin/layout.tsx](app/admin/layout.tsx) y [app/page.tsx](app/page.tsx) (PII en logs de hosting).
- **Solución:** Eliminarlos; introducir logger mínimo (`lib/logger.ts` con niveles y no-op en prod) para lo que valga la pena conservar.
- **Implementado (2026-07-05):** eliminados TODOS los `console.log/info/debug` de código (quedan solo 2 en comentarios de docs). PII fuera de logs: usuario completo en home/header/admin-layout. Errores reales pasados a `console.error`; cancelación de `navigator.share` silenciada. El logger `lib/logger.ts` queda opcional para cuando haga falta (hoy no hay nada que loguear).
- **Hallazgos (2026-07-05):**
  - Los links "Términos de Servicio" y "Política de Privacidad" en sign-in/sign-up eran botones muertos (solo hacían console.log) → convertidos a texto plano. **Falta crear las páginas legales** `/terminos` y `/privacidad` — obligatorias antes de cobrar planes (N4/N5). Agregar a N6 (onboarding) o F2.
    - ✅ **Hecho (2026-07-17):** [/terminos](app/(public)/terminos/page.tsx) y [/privacidad](app/(public)/privacidad/page.tsx) con shell compartido [LegalPage](components/shared/LegalPage.tsx) (columna legible, índice con anclas, secciones numeradas con `scroll-mt`, tokens de marca, dark/light). **El contenido describe lo que el sistema hace de verdad** (regla F4 aplicada a lo legal): roles/sombreros reales, freemium sin renovación automática, retención ("nunca se borran datos por vencimiento"), DNI solo como identificador (nunca público), datos de menores cargados por el club con consentimiento de padres, reclamo de ficha, encargados reales (Clerk/Google/Cloudinary/hosting) y derechos Ley 25.326 con la **leyenda obligatoria de la AAIP**. Cookies es sección `#cookies` de privacidad (no hay cookies de publicidad que ameriten página propia). El email de contacto sale de `SiteSettings` (editable en `/admin/configuracion`, sin redeploy). **Cableado:** footer "Legal" dejó de ser texto plano (links reales, Cookies → `/privacidad#cookies`), y los textos de sign-in/sign-up volvieron a ser links — de paso ambos archivos migraron a tokens de marca (0 hex, regla M6). Verificado: `tsc` limpio, 0 errores lint, build verde, smoke 200 en ambas rutas con ancla y leyenda AAIP presentes.
    - ⚠️ **Pendiente de negocio:** es un borrador fundacional redactado desde el comportamiento real del código — **hacerlo revisar por un profesional legal antes del lanzamiento comercial** (especialmente: jurisdicción, edad mínima, registro de bases de datos ante la AAIP).
  - El botón "Eliminar" de noticias en [app/admin/noticias/[id]/page.tsx](app/admin/noticias/[id]/page.tsx) no está implementado (handler vacío); la API DELETE existe — conectarla.
- **Esfuerzo:** E:Bajo · **Beneficio:** Sin PII en logs; ruido cero.

### A11. Endpoints referenciados por la UI que no existen (hallazgo C3, 2026-07-04)

> ✅ **Cerrado en F3 (2026-07-14)** — los dos flujos muertos se eliminaron en vez de implementarse:
> 1. `GET /api/teams`: el diálogo que lo llamaba (`match-dialog.tsx`) ya no existe. Su reemplazo ([MatchFormSheet](modules/partidos/components/admin/MatchFormSheet.tsx)) trae los equipos **del torneo** (`TournamentTeam`, que es lo que la API de partidos referencia de verdad) con el nuevo `GET /api/tournaments/[id]`. Pedir un listado global de `Team` para programar un partido era el bug, no la solución.
> 2. `PATCH /api/team-player/[id]`: el modo "edit" del diálogo de plantel se eliminó ([TeamRosterSheet](app/admin/torneos/[id]/components/TeamRosterSheet.tsx)); para cambiar los datos de un jugador en el equipo se lo saca y se lo vuelve a sumar.

- [x] **Problema:** La UI llama endpoints sin handler → 405 silencioso:
  1. `GET /api/teams`: [components/admin/match-dialog.tsx:109](components/admin/match-dialog.tsx#L109) hace `fetch("/api/teams")` pero [app/api/teams/route.ts](app/api/teams/route.ts) solo exporta POST.
  2. `PATCH /api/team-player/[id]`: [DialogAddEditTeamPlayer.tsx:182](app/admin/torneos/[id]/components/DialogAddEditTeamPlayer.tsx#L182) usa PATCH en modo edición pero [app/api/team-player/[id]/route.ts](app/api/team-player/[id]/route.ts) solo tiene GET/DELETE → editar asociación jugador-equipo nunca funcionó.
- **Solución:** Implementar GET (lista de equipos activos) y PATCH (con `teamPlayerCreateSchema.partial()` de `lib/validators/team-player.ts` + `validateApiRole`), o eliminar los flujos muertos de la UI.
- **Esfuerzo:** E:Bajo · **Beneficio:** Flujos de edición admin funcionales.

---

## 🟡 MEDIO — Calidad, performance y UX transversal (Sprints 4-5)

### M1. Minimizar datos expuestos en APIs públicas

- [ ] Noticias/torneos públicos incluyen el objeto `user` completo (email, phone, role del autor). Usar `select: { name, imageUrl }`. **E:Bajo**
- [ ] (Hallazgo C10, 2026-07-05) Las lecturas de árbitros están abiertas y exponen PII: `GET /api/referees` (sin `validateApiRole`) y las actions `getReferees`/`getRefereeById` devuelven email, teléfono y DNI de árbitros a cualquiera. Restringir a roles de gestión o filtrar campos sensibles en respuestas públicas. **E:Bajo**

### M2. Migrar `<img>` → `next/image` (42 archivos)

- [ ] Definir `sizes` correctos, placeholders blur para logos/portadas, y transformar URLs de Cloudinary con `f_auto,q_auto,w_...`. Mejora LCP/CLS directa. **E:Medio**

### M3. SEO real (hoy solo hay metadata en el root)

- [ ] `generateMetadata` dinámico en `/torneos/[id]`, `/noticias/[id]`, `/equipos/[id]`, `/jugadores/[id]` (título, descripción, OG image con logo del torneo).
- [ ] `app/sitemap.ts` + `app/robots.ts` (excluir `/admin`).
- [ ] JSON-LD `SportsEvent` en partidos y `NewsArticle` en noticias.
- [ ] OG image dinámica con `next/og` para compartir torneos/resultados. **E:Medio**

### M4. Accesibilidad (WCAG AA)

- [ ] Solo hay 15 atributos `aria-*` en todo el código. Auditar: labels en inputs de filtros, `aria-label` en botones-ícono, focus visible consistente, orden de tabulación en diálogos, contraste del texto gris sobre fondos glass, `alt` significativos, `prefers-reduced-motion` para las animaciones pulse/blur. **E:Medio**

### M5. Capa de datos del cliente unificada

- [ ] 47 `fetch()` dispersos con manejo de errores desigual; mezcla de server actions y API routes para lo mismo (ej. partidos usa ambas). Decidir: **mutaciones = server actions** (con Zod compartido) y API routes solo para lo consumido externamente; o crear `lib/api-client.ts` tipado. Considerar TanStack Query para cache/revalidación en cliente. **E:Alto**

### M6. Tokenizar la marca (93 archivos con `#ad45ff` hardcodeado)

> ✅ **Núcleo implementado en F0 (2026-07-13):** tokens `--brand`/`--brand-2`/`--brand-mid`/`--gradient-brand` en globals.css + `@theme inline` → `bg-brand`, `from-brand`, etc., y `<Button variant="brand">`. **Pendiente de este ítem:** solo la migración progresiva de los ~90 archivos legacy (regla en AGENT_RULES: al tocar un archivo, migrar sus clases de marca; código nuevo solo tokens).

- [~] **Problema:** El design system de globals.css define `--primary/--secondary` pero la marca real (`#ad45ff → #a3b3ff`) está copiada a mano en 93 archivos; el modo oscuro define un `--primary` blanco que casi no se usa.
- **Solución:**
  ```css
  :root {
    --brand: oklch(0.62 0.24 305);        /* #ad45ff */
    --brand-2: oklch(0.78 0.09 275);      /* #a3b3ff */
    --gradient-brand: linear-gradient(135deg, var(--brand), var(--brand-2));
  }
  @theme inline { --color-brand: var(--brand); --color-brand-2: var(--brand-2); }
  ```
  Clases utilitarias `bg-brand`, `text-brand`, `bg-gradient-brand` y reemplazo progresivo (empezar por componentes compartidos). **E:Medio** · Cambiar la marca pasa de tocar 93 archivos a tocar 2 líneas.

### M7. Paginación, búsqueda y filtros server-side en admin

- [ ] Las tablas de admin cargan todo y filtran en cliente. Con `?page`, `?q`, `?status` en URL (estado compartible) + `searchParams` en server components. **E:Medio**

### M8. Integrar AuditLog (modelo existe, uso = 0)

- [ ] Registrar en `AuditLog` todas las mutaciones sensibles (delete de torneo, cambio de rol, edición de resultado) desde los helpers de autorización, y una vista `/admin/auditoria` para ADMINISTRADOR. **E:Medio**

### M9. Limpieza de imágenes huérfanas en Cloudinary

- [ ] Al eliminar torneo/equipo/jugador/noticia no se borra su imagen (`logoPublicId` queda huérfano). Borrar el asset en la misma operación (o job diferido) usando los `publicId` ya guardados. **E:Bajo**
- [ ] (Hallazgo C3, 2026-07-04) `News.coverImagePublicId` y `Team.logoPublicId` nunca se persistían: las rutas los descartaban del body. Los validators Zod ahora los aceptan, pero falta verificar que los formularios los envíen al subir imagen; sin ese dato la limpieza de huérfanos es imposible. **E:Bajo**

### M10. Estados vacíos y skeletons consistentes

- [ ] Crear componentes `<EmptyState icon título descripción acción/>` y `<SkeletonTable/>`, `<SkeletonCards/>` reutilizables (hoy cada página improvisa o no tiene). **E:Medio**

### M11. Reglas de negocio de torneo incompletas (casos borde)

- [ ] No se valida: equipo jugando contra sí mismo (`homeTeamId === awayTeamId`), partidos entre equipos que no pertenecen al torneo, resultados negativos, partido FINALIZADO sin scores, torneo con `endDate < startDate`, edición de resultados de torneos FINALIZADOS/ARCHIVADOS, jugador duplicado en dos equipos del mismo torneo (permitido hoy — ¿regla?). Codificar estas invariantes en los validadores Zod + checks de negocio. **E:Medio**

### M12. Máquina de estados de torneo y partido

- [ ] Hoy cualquier status puede saltar a cualquier otro. Definir transiciones válidas (`BORRADOR→INSCRIPCION→PENDIENTE→ACTIVO→FINALIZADO→ARCHIVADO`, etc.) en un helper `canTransition(from, to)` compartido por API y UI (deshabilitar opciones inválidas en selects). **E:Medio**

### M13. Revisión de enums sobredimensionados (decisión tomada ✅)

- [x] Reemplazar `TournamentCategory` por 3 campos: `ageGroup` + `gender` + `division`. **Implementado (2026-07-05):** enums nuevos, validators, form de torneo con los 3 campos, filtros públicos por `ageGroup`, y helper `formatTournamentCategory()` en [lib/constants.ts](lib/constants.ts) usado por todos los badges/labels ("Sub-17 Femenino A").
- [ ] `TournamentFormat` tiene 14 valores pero la lógica solo distingue table/bracket/mixed: reducirlo a los formatos realmente soportados (LIGA, ELIMINACION_DIRECTA, GRUPOS_MAS_PLAYOFFS, etc.) y mapear el resto. **E:Medio** (ahora es gratis, sin datos en producción)

---

## 🟢 BAJO — Refinamiento y DX

- [ ] **B1. Naming y comentarios engañosos:** comentario `// app/api/teams/[id]/route.ts` dentro de `players/[id]/route.ts`; variable `updatedPlayer` en rutas de teams; "Torneo eliminada"; mezcla español/inglés en carpetas (`equipos` vs `teams` en API). Unificar convención. **E:Bajo**
- [ ] **B2. Renombrar `.env_example` → `.env.example`** (convención estándar que las herramientas detectan) y documentar cada variable en README. **E:Bajo**
- [ ] **B3. Documentar contratos de API** (`docs/api/*.md` o OpenAPI generado desde los esquemas Zod). **E:Medio**
- [ ] **B4. Código muerto:** `components/admin/match-dialog.tsx` (reemplazado por DialogAddEditMatch), `components/BuscandoRivales.tsx`, `home-ads`/`video-ads` si no se montan, `app/admin/partidos` vs gestión dentro del torneo (decidir cuál vive). Ejecutar `npx knip` para detección completa. **E:Bajo**
- [ ] **B5. Estrategia de migraciones:** checklist para PRs con migración + `prisma migrate diff` en CI + seeds idempotentes (el seed actual es `phase-seed.js` del modelo legacy — actualizarlo o eliminarlo junto con A6). **E:Bajo**
- [ ] **B6. TypeScript más estricto:** 48 usos de `: any`; activar `noUncheckedIndexedAccess`, tipar respuestas de API con los tipos inferidos de Zod (`z.infer`). **E:Medio**
- [ ] **B7. DevOps base:** GitHub Actions (ver A8), `Dockerfile` multi-stage opcional para portabilidad, Sentry (error tracking) + logs estructurados, política de backups de la BD (pg_dump programado o PITR del proveedor), y documento breve de recuperación ante desastres. **E:Medio**

---

## 🎨 REDISEÑO FRONTEND — Plan por fases

> Objetivo: llevar todo el producto al nivel de la landing ("Premium Golazo": gradiente `#ad45ff→#a3b3ff`, glass, glow suave), **sin cambiar la esencia**. Mobile-first y dark/light en todo. Cada fase es entregable por separado.

> ✅ **Auditoría de consistencia visual (2026-07-12):** se recorrió el proyecto completo (públicas + admin) contra las 5 páginas de referencia pedidas (Inicio, Torneos, Jugadores, `admin/dashboard`, `admin/noticias`) para mapear qué tan extendido está el lenguaje "Premium Golazo". Resultado: la mayoría del sitio **ya lo sigue** (no estaba documentado antes de esta auditoría). Se encontraron y corrigieron los 4 desvíos reales, de mayor a menor impacto:
> 1. **`app/(public)/partidos/page.tsx`** (pública, nav principal) usaba clases `bg-golazo-green`/`text-golazo-black`/`text-golazo-gray` **inexistentes** en `globals.css` ni en la config de Tailwind — huérfanas de un diseño anterior, sin ningún efecto real. Además el filtro de "Estado"/"Torneo" nunca se aplicaba (el `useMemo` de filtrado solo miraba `search`) y el filtro de "Tipo" usaba `MatchType`, un campo que no existe en el modelo `Match` real. Reescrita con el patrón premium (hero + stats + `premium-gradient-bg`) y filtros funcionales de verdad (torneos derivados de los partidos reales, no una lista mock hardcodeada de "La Liga/Champions League").
> 2. **`app/admin/partidos/page.tsx`** (la pantalla admin más usada operativamente) usaba paleta `zinc-900`/`violet-600`/`indigo-600` en vez de la marca, con tema oscuro forzado (sin `dark:` en casi ninguna clase). Reescrita a la marca `#ad45ff/#c77dff` con soporte real de light/dark, agregando además el header "Sistema activo" que sí tienen Torneos/Equipos/Jugadores.
> 3. **`app/admin/arbitros/page.tsx` + `DialogReferee.tsx`** forzaban un tema oscuro permanente (`bg-slate-900`, texto blanco hardcodeado, sin ningún `dark:`) con gradiente ámbar en el título en vez de la marca — el único rincón del admin que no respetaba el toggle claro/oscuro. Reescritos ambos al patrón estándar (header "Sistema activo", diálogo con secciones `bg-gray-50 dark:bg-gray-800/50`). De paso, `REFEREE_STATUS_COLORS` (`modules/arbitros/types/index.ts`) pasó de tonos `-400` sin variante clara (bajo contraste sobre blanco) a pares `-50/-700` claro + `-500/20/-400` oscuro.
> 4. **`app/sign-up/[[...sign-up]]`** (pantalla de conversión clave) no tenía `Header`/`Footer` del sitio (a diferencia de `/sign-in`) y `GoogleSignUp.tsx` no tenía **ninguna** clase `dark:` ni usaba `.glass-card`, a diferencia de su gemela `GoogleSignIn.tsx`. Alineadas ambas.
>
> Se documentó el lenguaje real (no aspiracional) en 4 documentos de fuente de verdad (2026-07-12, ampliado a pedido del usuario a partir del primer `docs/DESIGN-SYSTEM.md`): [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) (tokens: paleta, tipografía, espaciado, color semántico, dark/light), [docs/COMPONENT_LIBRARY.md](docs/COMPONENT_LIBRARY.md) (inventario de componentes shadcn + propios y sus convenciones), [docs/UI_PATTERNS.md](docs/UI_PATTERNS.md) (plantillas de pantalla completas) y [docs/AGENT_RULES.md](docs/AGENT_RULES.md) (checklist obligatorio para cualquier IA que toque UI en este repo). Verificado: `tsc`/`build`/lint en verde, smoke test en dev server de las 3 rutas tocadas (200 OK, sin clases rotas).
> ✅ **Footer unificado + configuración del sitio editable (2026-07-13):** se resolvió el hallazgo del footer duplicado (ver más abajo el detalle que quedó pendiente el 2026-07-12) siguiendo instrucción explícita del usuario: "usá el footer prolijo y cargá el contacto desde la administración". Se eliminó el footer inline de `app/(public)/layout.tsx` (gradiente `blue→purple`, ícono `Mic`, link muerto a `/estadisticas`) y ahora todas las páginas públicas usan el único componente `Footer` (`components/layout/footer.tsx`).
> - **Nuevo modelo `SiteSettings`** (singleton, id fijo `"main"`, migración `20260713022847_site_settings`): `description` (tagline del footer), `contactEmail`, `contactPhone`, `address`, `facebookUrl`/`twitterUrl`/`instagramUrl`. Se crea perezosamente con los valores reales que antes estaban hardcodeados (`getOrCreateSiteSettings`-style en [modules/configuracion/actions/siteSettings.ts](modules/configuracion/actions/siteSettings.ts), cacheado con `React.cache()` porque el Footer se renderiza en cada página).
> - **`Footer` ahora es un server component async** que lee `getSiteSettings()`: el bloque de contacto (email `mailto:`, teléfono `tel:`, dirección) solo se muestra si hay datos cargados, los íconos de redes sociales solo aparecen si tienen URL real (antes eran `href="#"` decorativos). La sección "Legal" (Términos/Privacidad/Cookies) se dejó como texto plano, no como links — consistente con la decisión ya tomada en A10 (esas páginas no existen todavía).
> - **`/admin/configuracion`** (nueva página, `ConfiguracionClient.tsx`, solo ADMINISTRADOR): formulario para editar toda esa info sin redeploy — cambios visibles al instante (`revalidatePath("/", "layout")`). Se habilitó el ítem "Configuración" del sidebar, que ya existía pero estaba `enabled: false` sin implementación.
> - Construido siguiendo `docs/DESIGN_SYSTEM.md`/`COMPONENT_LIBRARY.md`/`UI_PATTERNS.md` (patrón admin "header simple", variante B) como fuente de verdad — primera pieza construida bajo esa convención explícita del usuario.
> - Verificado: `tsc`/lint/`build` en verde, smoke test en dev server confirmó que el singleton se autocreó con los valores reales por defecto y el footer los renderiza.
>
> Detalle del hallazgo original (2026-07-12): `app/(public)/layout.tsx` (envuelve casi todas las páginas públicas) tenía un footer **inline** distinto del componente `Footer`, con gradiente `blue-400→purple-400` en vez de la marca, ícono `Mic` (sin sentido para una plataforma de fútbol) en vez de `Trophy`, link muerto a `/estadisticas`, año de copyright hardcodeado "2025". El inline tenía datos de contacto reales que el componente `Footer` no tenía — resuelto arriba llevando esos datos a `SiteSettings` en vez de perderlos.
> **Pendiente real que no se tocó en esta pasada** (bajo impacto, documentado abajo en F3): el header "Sistema activo" con Card decorativa no está replicado en `admin/usuarios`, `admin/plan`, `admin/pagos`, `admin/miembros`, `admin/organizaciones`, `admin/planes` — usan una versión simplificada (ícono + `<h1>` sin Card contenedora). Es un sub-lenguaje coherente en sí mismo, no un bug, pero genera un salto de estilo al navegar entre secciones admin.

### F0. Fundaciones del Design System (pre-requisito, E:Medio)

> ✅ **Completado (2026-07-13).** Verificado: `tsc` limpio, lint sin errores nuevos, `next build` en verde, smoke en dev server (los tokens `--brand`/`.from-brand`/`--gradient-brand` compilan en el CSS servido y `/torneos` renderiza el hero nuevo). Docs actualizadas (DESIGN_SYSTEM §1-2, COMPONENT_LIBRARY §1/2/2b/3, UI_PATTERNS §1/3/7/8, AGENT_RULES).

- [x] Documentar en `docs/DESIGN_SYSTEM.md` + `docs/COMPONENT_LIBRARY.md` + `docs/UI_PATTERNS.md` + `docs/AGENT_RULES.md` (paleta, uso del gradiente, patrones de componentes, plantillas de pantalla, do's/don'ts) — hecho 2026-07-12 como parte de la auditoría de consistencia visual (ver arriba).
- [x] **Tokens de marca en CSS (núcleo de M6, 2026-07-13):** `--brand`/`--brand-2`/`--brand-mid`/`--brand-hover`/`--brand-mid-hover`/`--gradient-brand` en [app/globals.css](app/globals.css), expuestos vía `@theme inline` → utilidades `bg-brand`, `text-brand`, `from-brand`, `shadow-brand/25`, `.bg-gradient-brand`. Las utilidades existentes (`.premium-gradient-text`, `.golazo-gradient`, `.premium-border`) ahora leen los tokens. Cambiar la marca pasó de 93 archivos a 6 líneas. **Bonus:** variante `brand` en `buttonVariants` ([components/ui/button.tsx](components/ui/button.tsx)) — `<Button variant="brand">` reemplaza el gradiente manual repetido. La escala tipográfica/espaciados quedan como convención documentada (DESIGN_SYSTEM §3), sin variables `--space-*` (no aportaban sobre Tailwind).
  - **Pendiente (queda en M6):** migración progresiva de los ~90 archivos legacy con `#ad45ff` hardcodeado a los tokens — regla nueva en AGENT_RULES: al tocar un archivo legacy, migrar sus clases de marca de paso; código nuevo solo tokens.
- [x] Componentes base compartidos y únicos (2026-07-13, todos en [components/shared/](components/shared/), documentados en COMPONENT_LIBRARY §2b):
  - `<PageHero>` + `<HeroHighlight>` — adoptado en [app/(public)/torneos/page.tsx](app/(public)/torneos/page.tsx) (referencia). Los heros de jugadores/equipos/noticias/partidos siguen inline → los migra F2.
  - `<PageHeader>` admin con `variant="showcase"` ("Sistema activo") y `variant="simple"` + `breadcrumbs`/`quickStats`/`actions` — adoptado en [app/admin/torneos/page.tsx](app/admin/torneos/page.tsx) (referencia). El resto de pantallas admin → las migra F3 (incluye el pendiente "header no replicado" de F3).
  - `<StatCard>`/`<StatCardGrid>` — las 3 implementaciones duplicadas de StatsCards (torneos/equipos/jugadores) ahora lo usan internamente (mismo visual, −200 líneas). **Bug corregido de paso:** los KPIs de jugadores comparaban `status === "ACTIVE"/"SUSPENDED"` contra el enum real `ACTIVO/SUSPENDIDO` → siempre 0 (mismo tipo de bug que A2), en StatsCards y en [app/admin/jugadores/page.tsx](app/admin/jugadores/page.tsx).
  - `<StatusBadge entity="tournament|match|player|user|payment|referee">` con mapas únicos en [lib/status-colors.ts](lib/status-colors.ts) (formato REFEREE_STATUS_COLORS) + labels nuevos `MATCH_STATUS_LABELS`/`USER_STATUS_LABELS`/`PAY_STATUS_LABELS` en [lib/constants.ts](lib/constants.ts) — adoptado en `app/admin/partidos/page.tsx` (reemplaza su `getStatusBadge` local). Los `getStatusColor`/`STATUS_BADGE` locales restantes se migran al tocar cada pantalla.
  - `<EmptyState>`, `<SkeletonTable>`/`<SkeletonCards>`, `<ConfirmDialog>` (trigger o controlado, `onConfirm` async con loading) — `ConfirmDialog` adoptado en la eliminación de partido de `/admin/partidos` (elimina el último `confirm()`/`alert()` nativo documentado; ahora con toast).

### F1. Landing (retoques menores, E:Bajo)

> ✅ **Completado (2026-07-13).** Hallazgo central: las 5 `<img>` de la landing eran **hotlinks a sitios de terceros** con logos de marcas/clubes reales (Nike, Adidas, McDonald's, AFA, escudos de la federación entrerriana) que la CSP de C9 (`img-src`) **ya bloqueaba** — se veían rotas en cualquier entorno además del problema legal y de fiabilidad. La solución no fue `next/image` sino eliminar las imágenes externas:
> - **Hero:** los 3 escudos de la tabla de demostración → `next/image` con las copias **locales** que ya existían en [public/escudos/](public/escudos/) (`'self'` permitido por la CSP), data extraída a `DEMO_STANDINGS`; el emoji 🏆 del header de la card → ícono `Trophy` de Lucide (regla AGENT_RULES). [hero-section.tsx](components/sections/hero-section.tsx)
> - **Sponsors:** marcas reales → **marcas ficticias** como logos tipográficos con el gradiente `color` que ya traía la data (sin imágenes); sponsor destacado → monograma "MS". Documentado en [lib/constants/sponsors.ts](lib/constants/sponsors.ts): cuando haya sponsors reales, subir assets a Cloudinary y volver a `next/image`. ⚠️ Decisión de contenido tomada por defecto razonable (las imágenes estaban rotas y eran marcas ajenas) — cambiar los nombres ficticios es editar solo ese archivo.
> - **`prefers-reduced-motion`** global en [globals.css](app/globals.css): anula animaciones/transiciones/smooth-scroll para quienes lo piden (cubre pulse de blobs, float de partículas, etc. en toda la app, no solo landing); los `animate-pulse` decorativos de las secciones tocadas pasaron además a `motion-safe:animate-pulse`.
> - **Contraste AA:** `text-white/80` en texto chico sobre gradiente de marca (garantías del CTA final, cite del sponsor) → blanco pleno; `text-green-600` sobre verde claro del badge "En Vivo" → `text-green-700` claro / `-400` oscuro.
> - **Tokens:** las clases de marca de los archivos tocados (hero, sponsors, cta) migradas a `from-brand`/`text-brand`/`shadow-brand` (regla F0); el svg de subrayado usa `var(--brand)`.
> - **No se hizo (justificado):** lazy-load con `next/dynamic` — las 8 secciones son server components sin JS de cliente propio, no hay bundle que diferir; "comprimir imágenes hero" — ya no quedan imágenes en la landing.
> - Verificado: `tsc` limpio, lint sin errores nuevos, `next build` en verde, smoke en dev (`/` 200 sin `<img>` externas, avatares e iniciales renderizados).

### F2. Páginas públicas (E:Alto)

- [x] `app/(public)/partidos/page.tsx` alineada al lenguaje premium (2026-07-12, ver auditoría arriba) — quedaba la más desviada del grupo de páginas públicas.
- [x] **Heros unificados con `<PageHero>` (2026-07-13):** `/torneos` (F0) + `/equipos`, `/jugadores`, `/noticias`, `/partidos` — se eliminaron las 4 copias del hero (~500 líneas de JSX duplicado); `PageHero` ganó grilla adaptativa para 3 stats (noticias). **Fix de paso:** el CTA "Registrar Equipo" de `/equipos` apuntaba a `/login`, ruta inexistente (404) → `/crear-liga`.
- [x] **Header público unificado (2026-07-13, pedido explícito del usuario):** antes la landing mostraba anclas (`#features`/`#precios`/`#contacto`) que desaparecían al navegar a otra página (menú "cambiaba" según dónde estabas) y **faltaba "Partidos"** en el menú. Ahora: [lib/constants/navigation.ts](lib/constants/navigation.ts) define `siteLinks` únicos (Torneos/Partidos/Equipos/Jugadores/Noticias) que Header **y** Footer comparten; anónimos suman "Precios" → `/#precios` (funciona desde cualquier página; para logueados `/` es FanHome sin pricing, gestionan plan en `/admin/plan`); logueados suman "Mi Panel"/"Mi Perfil". Indicador de **sección activa** por ruta (subrayado de marca persistente + `aria-current`), links internos con `<Link>` (antes `<a>` con full reload), botón de menú mobile 44px con `aria-expanded`, emoji 🏆 del logo → ícono `Trophy`, prop `isLandingPage` eliminada, tokens de marca. [components/layout/header.tsx](components/layout/header.tsx)
- [x] **Footer con dark/light real (2026-07-13):** antes era oscuro fijo (`bg-gray-900` sin variante clara — no respondía al toggle). Ahora `bg-gray-50 dark:bg-gray-950` con pares completos en textos/íconos/bordes, links de secciones compartidos con el Header (suma "Partidos" que faltaba), emojis 🏆/🔒 → `Trophy`/`Lock`, íconos sociales 44px, `motion-safe:animate-pulse`, tokens. [components/layout/footer.tsx](components/layout/footer.tsx)
- Verificado (2026-07-13): `tsc` limpio, lint sin errores nuevos, `next build` verde, smoke en dev: las 6 rutas públicas 200; header idéntico en `/` y `/equipos` (link Partidos + Precios en ambos, 0 anclas viejas fuera de landing); `/login` muerto eliminado; `PageHero` renderizando; footer con clase light presente.
- [x] **Detalle de torneo público (2026-07-13):** tabs sticky en mobile (pegadas bajo el header al scrollear, `lg:` vuelve estático); tabla de posiciones con **zebra**, **líder destacado** (acento dorado + borde izquierdo) y **columna "Racha"** — flecha ▲▼/− por el último resultado + puntos W/D/L de los últimos 5 en desktop, calculada en [PublicStandingsSection](modules/torneos/components/PublicStandingsSection.tsx) desde los partidos FINALIZADO/WALKOVER (global del torneo, no cambia al filtrar fase/grupo) y pasada como prop opcional a [StandingsTable](modules/torneos/components/StandingsTable.tsx) (el admin no la pasa y no ve la columna). El "bracket con scroll horizontal" ya estaba resuelto por diseño: `KnockoutBracket` es grid que colapsa a 1 columna en mobile, sin overflow. Tokens de marca migrados en los 4 archivos tocados.
- [x] **Cronología del partido (2026-07-13):** [MatchDetailModal](modules/torneos/components/MatchDetailModal.tsx) reemplazó las tabs Goles/Tarjetas por una **Cronología** unificada: timeline vertical con línea central, minuto al centro, eventos del local a la izquierda y del visitante a la derecha (gol = ícono, tarjeta = rectángulo amarillo/rojo, con jugador y detalle penal/autogol/motivo). El marcador grande + escudos ya existían en el header del modal. Tab Árbitros se conserva. (El TODO decía "página de partido" — se implementó en el modal existente, que es donde vive el detalle de partido hoy; una página standalone `/partidos/[id]` queda para cuando exista S6 live match center.)
- [x] **Listado → URL canónica directa (2026-07-13, cierra pendiente 1 de N9):** `getTorneos` ahora incluye `organization.slug`, `ITorneo` ganó `slug`/`organization`, y [FiltroTorneos](modules/torneos/components/FiltroTorneos.tsx) enlaza directo a `/liga/[org]/[torneo]` vía el helper puro [tournamentPublicPath](modules/torneos/utils/publicPath.ts) (fallback a `/torneos/[id]` si falta slug). Motivación extra: ver hallazgo Node 24 abajo.
- ⚠️ **Hallazgo crítico de entorno (2026-07-13): `redirect()` de Next está roto en esta máquina** — Node **v24.12.0** + Next (16.1.5 y 16.2.10, dev y `next start`, con y sin middleware) devuelve **200 con el error boundary** en vez de 307, con `TypeError: controller[kState].transformAlgorithm is not a function` (bug de webstreams). Afectaba TODOS los redirects server-side, en particular `/torneos/[id]` → canónica (la página del torneo se veía como error). **No es un bug del código** (verificado con `git stash`: falla igual sin los cambios) y **no debería afectar Vercel** (corre Node LTS). Mitigado enlazando directo a la canónica (arriba). **Solución real: bajar Node local a LTS 22.x** — hasta entonces, cualquier `redirect()` (p. ej. `validatePanelAccess` → sign-in) falla en local. Los links UUID que aún dependen del redirect: FanHome, FavoritesTab, `/partidos` (card de torneo) — migrarlos a canónica requiere sumar slugs a sus queries (pendiente abajo).
- [x] **Upgrade Next 16.1.5 → 16.2.10 + `eslint-config-next` 15.3.5 → 16.2.10 (2026-07-13, cierra parte de A9):** intento de fix del bug de arriba (no lo arregló, pero el upgrade quedó: build/tests/54 tests verdes). [eslint.config.mjs](eslint.config.mjs) migrado a los flat configs nativos (`eslint-config-next/core-web-vitals`) — el puente `FlatCompat` rompía con "circular structure". ⚠️ El linter nuevo trae reglas extra (`react-hooks/purity`, etc.): el conteo repo-wide pasó de ~26 a **64 errores preexistentes** (CI lint sigue non-blocking; limpieza pendiente en A8/A9). Se corrigieron los 3 del área tocada (Date.now en HeaderTorneo con disable justificado, `any` en AdminStandingsSection).
- Verificado (2026-07-13): `tsc` limpio, lint del módulo tocado sin errores, 54 tests ✅, `next build` verde, smoke en dev: `/torneos` enlaza directo a `/liga/club-12/categoria-a`; la canónica renderiza Posiciones + columna Racha + tabs sticky + líder destacado.
- [x] **Cards de torneo/equipo/jugador con anatomía consistente (2026-07-13):** shell compartido `<EntityCard>` + `<EntityCardAvatar>` ([components/shared/EntityCard.tsx](components/shared/EntityCard.tsx)) — `Link` + esquinas `rounded-2xl` + elevación en hover + barra de acento de marca; cada entidad compone su propio layout encima. Antes las 3 cards estaban escritas a mano e inconsistentes entre sí (torneo con banner opaco `bg-white`, equipo/jugador con glass `bg-white/80 backdrop-blur`, ninguna con el mismo criterio de qué hace clickeable a toda la card). `TournamentCard` ([modules/torneos/components/TournamentCard.tsx](modules/torneos/components/TournamentCard.tsx), extraído de `FiltroTorneos.tsx`, que antes tenía el JSX de la card inline) mantiene su banner con logo superpuesto pero ahora usa un badge de estado **sólido** documentado como excepción deliberada (`TOURNAMENT_STATUS_SOLID_COLORS` en [lib/status-colors.ts](lib/status-colors.ts) — el badge suave estándar pierde contraste sobre el banner con textura). `TeamCard` ([modules/equipos/components/public/TeamCard.tsx](modules/equipos/components/public/TeamCard.tsx)) migrado sobre el shell, fallback de logo pasó de inicial de texto a ícono `Shield` (consistente con el resto del admin). `PlayerCard` (nuevo, [modules/jugadores/components/public/PlayerCard.tsx](modules/jugadores/components/public/PlayerCard.tsx), `variant="grid"|"list"`) extraído de `app/(public)/jugadores/page.tsx`, usa `<StatusBadge entity="player">` para el badge y conserva el dot sólido de `PLAYER_STATUS_COLORS` como indicador chico (uso ya documentado para ese mapa). De paso: `TeamsList.tsx` y `FiltroTorneos.tsx` migraron su estado vacío a `<EmptyState>` y los hex `#ad45ff`/`#a3b3ff` restantes de los 3 archivos de listado a tokens de marca; fix menor de un link muerto `/login` → `/sign-up` en el CTA de jugadores.
  - Verificación de las cards (2026-07-13, quedó pendiente una pasada por caída temporal del shell del harness, cerrada después): `tsc` limpio, lint sin errores, `next build` verde. En la revisión manual previa se había detectado y corregido un error de tipos real (`TOURNAMENT_STATUS_SOLID_COLORS[tournament.status]` necesita el cast `as Record<string, string>` que ya usa `StatusBadge.tsx`, porque `ITorneo.status` es `string` y no el enum). ⚠️ **Nota de entorno:** el `tsc` fallaba con ~60 errores fantasma (`Module '@prisma/client' has no exported member ...`) por **cliente Prisma stale** — `npx prisma generate` los limpia todos. No es código roto; si aparecen, regenerar antes de investigar.
- [x] **Filtros como chips + estado en URL (2026-07-13):** nuevo `<FilterChipGroup>` ([components/shared/FilterChips.tsx](components/shared/FilterChips.tsx)) — chips que **scrollean en una fila horizontal en mobile** (patrón app deportiva, `overflow-x-auto scrollbar-hide`) y hacen wrap en desktop, 44px de alto (objetivo táctil), con `aria-pressed` por chip y `role="group"` + `aria-label` por grupo. Reemplaza a los `<Select>`/`<select>` nativos de los **5 listados públicos** (`/torneos`, `/equipos`, `/jugadores`, `/noticias`, `/partidos`) — de paso muere el panel de filtros colapsable de `/partidos` (los filtros ahora están siempre visibles, no escondidos detrás de un botón). Nuevo hook [useUrlFilters](hooks/use-url-filters.ts): el estado de los filtros vive en la **query de la URL** (búsqueda compartible/bookmarkeable; "atrás" del navegador deshace el último filtro en vez de salir de la página), con `router.replace(..., { scroll: false })` para no saltar al tope ni ensuciar el historial, y omitiendo de la query los filtros en su valor por defecto (`/torneos`, no `/torneos?estado=Todos&categoria=Todas`). **Fix de paso:** en `/partidos` el reset de paginación al filtrar pasó de `useEffect`+`setState` (render en cascada, rechazado por `react-hooks/set-state-in-effect` del linter nuevo) al patrón recomendado de React de ajustar el estado durante el render comparando una `filterKey`.
- [x] **Links UUID → URL canónica (2026-07-13, cierra el pendiente 1 de N9 del todo):** `getUserFavorites` ([modules/favoritos/actions/favorites.ts](modules/favoritos/actions/favorites.ts)) y `GET /api/matches` ahora traen `slug` + `organization.slug`, así que **FanHome**, **FavoritesTab** y **`/partidos`** enlazan directo a `/liga/[org]/[torneo]` vía `tournamentPublicPath` en vez de a `/torneos/[uuid]`. Ya no queda ningún link público que dependa del `redirect()` server-side (el que está roto en local por Node 24 — ver hallazgo arriba).
- Verificado (2026-07-13): `tsc` limpio, lint sin errores nuevos, `next build` verde, smoke en dev — las 5 rutas de listado responden 200 con filtros en la query; `/torneos?estado=FINALIZADO` → "No se encontraron torneos" y `?localidad=Oro verde` → la card presente (el filtro de la URL **filtra de verdad**, no solo pinta el chip); `aria-pressed="true"` correcto en el chip activo de cada grupo; `/api/matches` devuelve `organization.slug` (`club-12`) → `/partidos` enlaza a la canónica.

- [x] **Ficha pública del partido `/partidos/[id]` (2026-07-14, pedido explícito del usuario — cierra el pendiente que F2 había diferido):** era el único recurso público sin página propia; el detalle del partido solo existía dentro de un modal, que **no tiene URL** y por lo tanto no se puede compartir, bookmarkear ni indexar. Nueva [MatchDetailView](modules/partidos/components/MatchDetailView.tsx) (patrón §2 de UI_PATTERNS): marcador grande con escudos y estado en vivo, penales/walkover, **cronología unificada** de goles y tarjetas (local a la izquierda, visitante a la derecha, minuto al costado, con link al jugador de cada evento), terna arbitral, y accesos a los dos equipos y al torneo. `generateMetadata` con el resultado en el `<title>` para que el link compartido se vea bien.
  - **Se llega desde todos lados donde se muestra un partido** (si no, la página no existe para el usuario): listado `/partidos`, card de partido del equipo, fixture y bracket del torneo (la llave del cuadro ahora es clickeable), modal de detalle del torneo (que suma "ver ficha completa"), los goles en la ficha del jugador, y el panel (menú de `/admin/partidos` + acción en la tabla de partidos del torneo).
  - `getMatchById` ganó el `tournamentTeam` de cada gol/tarjeta (sin eso no se puede saber de qué lado del marcador va cada evento), la asistencia y el `organization.slug` del torneo para la URL canónica. La cronología cuenta el **autogol para el rival**, no para el equipo del jugador que lo hizo.
  - Se eliminó `modules/partidos/components/PartidoDetalle.tsx`: componente **huérfano** (no lo importaba nadie), con paleta slate forzada fuera de la marca, sin dark mode real y con 6 botones sin `onClick`.
  - Verificado: `tsc` limpio, `next build` verde, smoke en dev y en `next start` — la ficha de un partido real renderiza (marcador, cronología, "Todos los partidos").

**F2 completo.**

- [ ] ⚠️ **Soft 404 en toda la app (encontrado 2026-07-14 al smoke-testear la ficha de partido):** `notFound()` renderiza la página 404 pero la respuesta sale con **HTTP 200**, no 404. No es de la ruta nueva: `/jugadores/[uuid-inexistente]` (que ya existía) hace exactamente lo mismo. Probado en dev **y** en `next start`. Sospecha principal: el middleware de Clerk envolviendo la respuesta (mismo tipo de síntoma que el bug de `redirect()` con Node 24 documentado en F2 — conviene descartar primero el entorno). Impacto real: Google indexa páginas inexistentes como si fueran válidas, y cualquier monitoreo que mire status codes no ve los 404. **E:Bajo** una vez identificada la causa.

### F3. Panel admin (E:Alto)

- [x] **Dashboard:** ya no es débil — `app/admin/dashboard/page.tsx` tiene KPIs reales, resultados sin cargar, próximos partidos y estado del plan (hecho en N10, 2026-07-12). Pendiente de este ítem: gráfico de evolución con `--chart-*` y actividad reciente del AuditLog (M8, no integrado aún).
- [x] **Flujo de carga de resultados:** ya no es el más lento — pantalla única mobile-first en `/admin/partidos/[id]/cargar` (marcador + goleadores + tarjetas, hecho en N10, 2026-07-12).
- [x] `app/admin/partidos/page.tsx` y `app/admin/arbitros/page.tsx` (+ `DialogReferee.tsx`) alineados al lenguaje premium (2026-07-12, ver auditoría arriba) — eran los dos únicos rincones del admin con paleta y modo oscuro forzado fuera de la marca.
- [x] **Sidebar replegable (2026-07-13, pedido explícito del usuario):** en desktop el menú se **repliega a solo íconos** (`md:w-72` ↔ `md:w-20`) con un botón-pestaña sobre su borde derecho; la preferencia **persiste en localStorage** entre navegaciones y sesiones. Para eso el layout (server, sigue resolviendo auth/rol/orgView) delega el árbol a **[AdminShell](components/admin/AdminShell.tsx)** (client), que coordina el ancho del contenido con el estado del sidebar. Detalles no obvios: el estado se lee con `useSyncExternalStore` y **no** con `useEffect`+`setState` (render en cascada, lo rechaza `react-hooks/set-state-in-effect` del linter nuevo), y `SidebarContent` se sacó **fuera** de `AdminSidebar` (crearlo en cada render remontaba el árbol entero del sidebar en cada navegación — `react-hooks/static-components`). De paso: sección activa por **prefijo de ruta** (las subpáginas como `/admin/torneos/[id]` ahora mantienen "Torneos" resaltado — antes se apagaba), `aria-current`/`aria-expanded`, botón de menú mobile a 44px, y el footer del sidebar (avatar/rol) que estaba **sin dark mode** ahora lo tiene.
- [x] **Header "Sistema activo" replicado en TODAS las pantallas admin (2026-07-13):** las 11 pantallas usan `<PageHeader>` — variante **showcase** en torneos/equipos/jugadores/árbitros/partidos, variante **simple** en plan/pagos/planes/organizaciones/configuración. Se eliminaron ~10 copias del mismo header inline. Nuevo `<SectionTitle>` (barra de acento + h2) para los títulos de sección, que se repetía a mano en casi todo el panel.
- [x] **Tokens de marca en el panel (2026-07-13):** los **43 archivos** de `app/admin` + `modules/*/components/admin` + `components/admin` que tenían hex hardcodeado (`#ad45ff`, `#a3b3ff`, `#c77dff`, y los hover `#9c3ee6`/`#b66de6`/`#9d35ef`…) pasaron a los tokens (`from-brand`, `text-brand`, `shadow-brand/25`, `<Button variant="brand">`). **0 hex de marca restantes en todo el admin** (verificado con grep).
- [x] **`confirm()` nativos eliminados de los flujos de partido (2026-07-13):** eliminar gol, eliminar tarjeta y desasignar árbitro usaban `confirm()` del navegador — lo que `AGENT_RULES` prohíbe explícitamente. Ahora usan `<ConfirmDialog>` con descripción del efecto real ("el marcador y la tabla de posiciones se recalculan automáticamente", "las sanciones del torneo se recalculan automáticamente"). Quedan 3 `confirm()` de "descartar cambios sin guardar" en formularios de edición (noticias/usuarios) — menos graves (no destruyen datos del servidor), pendientes.
- [x] **`StatusBadge` unificado (2026-07-13):** el mapa `STATUS_BADGE` estaba **duplicado byte a byte** en `admin/pagos` y `admin/plan`; `TabsMatches` tenía su propio `getStatusBadge` con 8 casos. Los tres migraron a `<StatusBadge entity="payment"|"match">`. Con el DataTable migraron además `ListTournaments` y `PlayersTable`. **Pendiente:** quedan mapas locales en `TeamsTable` (activo/deshabilitado, es un booleano, no un enum de estado), `equipos/Header` y `noticias` (publicado/borrador, ídem) — evaluar si vale la pena meterlos en `StatusBadge` o si un booleano no es un "estado" en el sentido del componente.
- [x] **Tablas → DataTable común (2026-07-13):** creado **[components/shared/DataTable.tsx](components/shared/DataTable.tsx)** y migradas las **7 tablas del panel**: `TeamsTable`, `PlayersTable`, `ListTournaments`, `app/admin/arbitros`, `app/admin/noticias`, y `TabsTeams`/`TabsMatches` del detalle de torneo. Cada una reimplementaba búsqueda y filtros por su cuenta, ninguna tenía orden ni paginación, y todas scrolleaban en horizontal en mobile (con las acciones fuera del viewport).
  - Trae: orden por columna (3 estados, `aria-sort`), búsqueda, filtros de chips (reusa `FilterChipGroup`), paginación (página acotada **durante el render**, no con `useEffect`+`setState`), estado vacío distinguiendo "sin datos" de "sin resultados" (+ "Limpiar filtros"), y **colapso automático a cards por debajo de `md`** (con `renderCard` propio cuando la card automática no alcanza, ej. las 11 columnas de estadísticas de `TabsTeams`).
  - **Bugs encontrados y arreglados de paso** (misma clase que A2, que arregló los contadores del dashboard pero no las tablas): el filtro de estado de **jugadores** comparaba `"ACTIVE"/"SUSPENDED"/"INJURED"` contra el enum real `ACTIVO/LESIONADO/SUSPENDIDO/NO_DISPONIBLE`, y el de **torneos** comparaba `"En curso"/"Inscripciones"` (labels de UI) contra `ACTIVO/INSCRIPCION`. En ambos casos **el filtro no matcheaba nunca** y el badge caía siempre al caso `default` (mostrando el enum crudo). Ahora las opciones salen de `PLAYER_STATUS_OPTIONS`/`TOURNAMENT_STATUS_OPTIONS` y los badges de `<StatusBadge>`. Lo mismo con `getPositionBadge`, que comparaba `"Portero"/"Defensa"` contra `ARQUERO/DEFENSOR_CENTRAL`.
  - Paginación **en cliente** (alcanza para los volúmenes actuales); la server-side es M7 y se enchufa dentro del mismo componente con la misma API de columnas.
  - Documentado en `COMPONENT_LIBRARY.md` §4, `UI_PATTERNS.md` §3/§3b/§9 y `AGENT_RULES.md`.
- [x] **Botones muertos en el panel — resuelto (2026-07-14):** los tres botones que no hacían nada (`Eliminar jugador` sin `onClick` y sin endpoint, `Eliminar equipo` pegando a `/api/team/[id]` — ruta inexistente, y `Programar primer partido` sin handler) ahora funcionan, con la semántica de baja definida por el usuario:
  - **Regla:** se **elimina de verdad solo si la entidad no tiene ninguna relación** (jugador sin ningún `TeamPlayer`; equipo sin ningún `TournamentTeam`). Con historial **nunca se borra**: se **deshabilita** (`enabled = false`) — los datos y el historial se siguen viendo, pero deja de poder usarse. Esto no es cosmético: las FK son `onDelete: Cascade`, así que un borrado físico con historial se llevaría puestos goles, asistencias, tarjetas, suspensiones, planteles y las estadísticas de la tabla de posiciones de partidos ya jugados.
  - **Schema:** `Player.enabled` (migración `20260714022521_player_enabled_flag`). `Team.enabled` ya existía pero **no había forma de cambiarlo desde ningún lado** — solo se seteaba al crear.
  - **Server actions** nuevas: [modules/jugadores/actions/players.ts](modules/jugadores/actions/players.ts) (`deletePlayer`, `togglePlayerEnabled`) y [modules/equipos/actions/teams.ts](modules/equipos/actions/teams.ts) (`deleteTeam`, `toggleTeamEnabled`), con guard de organización (`requireActionOrgAccess`), **re-verificación de las relaciones en el servidor** (el cliente puede tener la lista vieja) y limpieza de las imágenes en Cloudinary al borrar de verdad (si no, quedaban huérfanas).
  - **UI:** nuevo [components/shared/DeleteOrDisableButtons.tsx](components/shared/DeleteOrDisableButtons.tsx) — toggle habilitar/deshabilitar + botón de baja cuyo diálogo cambia según el caso: con historial explica *por qué* no se puede eliminar y ofrece deshabilitar; sin historial ofrece el borrado definitivo. Cableado en `PlayersTable`, `TeamsTable` y el header del detalle de equipo (que redirige a `/admin/equipos` tras el borrado). Se eliminó `DeleteTeamButton.tsx` (el que pegaba a la ruta inexistente).
  - **Un deshabilitado deja de ser usable** (si no, deshabilitar no deshabilita nada): `/api/players` ya no devuelve deshabilitados ni eliminados, y `tournament-team-form` filtra los equipos por `enabled` al inscribir en un torneo. El listado público de equipos ya filtraba `enabled`; el de jugadores ahora también (vía la API).
  - **Bonus de seguridad:** `GET /api/players` devolvía **todos los jugadores de todas las organizaciones sin ningún filtro** (fuga entre ligas, N3). Ahora acepta `?scope=panel`, que lo acota a las organizaciones del usuario — es lo que usa el selector de "agregar jugador al equipo".
  - **"Programar primer partido"** ahora abre el diálogo real de creación (estado vacío de `TabsMatches`).
  - Documentado como patrón §8b en `UI_PATTERNS.md` + regla en `AGENT_RULES.md`, para que aplique a toda entidad nueva del historial deportivo.
  - Verificado: `tsc` limpio, `next build` verde, sin errores de lint nuevos.
- [x] **Deuda de lint eliminada — de 55 errores a 0 en todo el repo (2026-07-14).** No era cosmética: cada regla marcaba un bug real de rendimiento o de tipos, y arreglarlas destapó cuatro bugs de comportamiento (abajo). El repo queda en **0 errores de lint** (quedan 84 warnings, casi todos `<img>` vs `next/image`).
  - **17 × `react-hooks/static-components`** — todos de **una sola causa**: `FormLabel` declarado dentro del render de `player-form.tsx`. Un componente creado en cada render remonta su subárbol y le resetea el estado: el formulario de jugador remontaba sus 17 labels en cada tecla. Se subió a nivel de módulo.
  - **10 × `react-hooks/set-state-in-effect`** — los cuatro patrones, resueltos y documentados en `AGENT_RULES.md`: (a) fetch inicial → `useTransition` (el pendiente **es** el loading, no un `useState` apagado a mano en un `finally`); (b) estado derivado de props → ajuste durante el render (`DialogReferee`, `QuickMatchLoader`, `noticias/[id]`); (c) lectura de un store externo → `useSyncExternalStore` (**`theme-provider` reescrito**: el tema vive en `localStorage`, y leerlo con `useEffect` hacía renderizar dos veces, una con el tema equivocado); (d) guard de hidratación → nuevo hook **[useIsMounted](hooks/use-mounted.ts)**.
  - **7 × `react-hooks/immutability`** — funciones (`fetchPlayers`, `fetchMatches`, `deleteImage`, `fetchAuxData`) declaradas como `const` **debajo** del `useEffect` que las llamaba: el effect las leía en la zona muerta temporal. Se movieron arriba (y `deleteImage`, que no dependía de nada del componente, salió del componente).
  - **22 × `@typescript-eslint/no-explicit-any`** — la raíz era que **`getEquipoById` no tipaba su retorno**, y los seis consumidores (Header, QuickStats, TabsTeam, PublicTabsTeam, PublicTeamHeader, MatchCard) recibían `teamData: any`. Ahora el tipo se **deriva del propio `include` de Prisma** (`Prisma.TeamGetPayload<typeof teamDetailInclude>`), así no se puede desincronizar del query.
  - **Bugs reales que el tipado destapó** (los `any` los estaban tapando):
    1. **`MatchCard` mostraba `partido.time`, un campo que no existe** en el modelo `Match` (solo hay `dateTime`) → el reloj de la card de partido **nunca se renderizaba**. Ahora la hora sale de `dateTime`.
    2. `MatchCard` tenía un fallback de logo que leía `partido.homeTeam`/`awayTeam`, campos que ese objeto no tiene: **código inalcanzable**.
    3. **`ITeam` mentía**: declaraba `coach`, `homeCity`, `homeColor` y `awayColor` como `string` no-nulos cuando en el schema son `String?`. Alineado, y manejados los `null` en los 3 usos que asumían lo contrario.
    4. La interfaz `Match` de `/admin/partidos` **no declaraba `tournamentId`/`homeTeamId`/`awayTeamId`**, que son justo los campos que `MatchDialog` necesita para precargar la edición (la API sí los devuelve; solo mentía el tipo).
  - **Código muerto borrado:** `DialogManageGoals.tsx` — duplicado de `ManageGoals` que **no importaba nadie**, y que además usaba un `confirm()` nativo (prohibido por `AGENT_RULES`) para borrar un gol.
  - Verificado: `tsc` limpio, **0 errores de eslint en todo el repo**, `next build` verde, **54 tests** ✅, smoke en dev (rutas públicas 200).
- [x] **Formularios y diálogos (2026-07-14):** los 9 formularios del panel pasaron a un caparazón único, **[FormSheet](components/shared/form/FormSheet.tsx)** — panel lateral en desktop, **pantalla completa en mobile**, con header y barra de acciones sticky (el "Guardar" ya no vive al fondo de un scroll interno). Documentado como patrón §11 de `UI_PATTERNS.md`.
  - **Validación inline en español:** Zod 4 con locale `es` global ([lib/zod-locale.ts](lib/zod-locale.ts) → `z.config(z.locales.es())`) + `zodResolver` en los 9 formularios. Antes solo 2 validaban algo; el resto llegaba al server con lo que fuera (`required` del navegador y nada más). Error debajo del campo, `aria-invalid` en rojo, foco automático en el primer inválido y resumen `role="alert"` en el footer.
  - **Loading de submit consistente:** sale de `formState.isSubmitting`. Se eliminaron los 9 `useState(isLoading)` que cada pantalla apagaba a mano en un `finally` (y en 2 casos se apagaba mal).
  - **Campos tipados compartidos** ([components/shared/form/fields.tsx](components/shared/form/fields.tsx)): `TextField`/`NumberField`/`DateField`/`TextareaField`/`SelectField`/`SwitchField`/`ImageField`/`ColorField` + `FormSection`/`FieldRow`. La misma cadena de 12 clases por input estaba copiada ~150 veces y ya había divergido (unos con `border-2`, otros sin foco de marca, otros sin `dark:`).
  - **Autosave de borradores en torneos** ([hooks/use-form-draft.ts](hooks/use-form-draft.ts)): el alta de torneo (25 campos) se autoguarda en `localStorage` con debounce y ofrece retomarla al reabrir. Solo en altas: en edición la fuente de verdad es la base (un borrador viejo pisaría cambios de otra persona).
  - **`confirm()` nativo eliminado del repo:** cerrar un formulario sucio (X, Escape, click afuera, Cancelar) abre un `<ConfirmDialog>`; los 2 `confirm()` de "descartar cambios" que quedaban (noticias, usuarios) usan el mismo diálogo. **0 `confirm()`/`alert()` en todo el código.**
  - **Diálogo de partido unificado (cierra el pendiente de A1):** los dos que convivían (`components/admin/match-dialog.tsx` y `DialogAddEditMatch.tsx`) son ahora un único [MatchFormSheet](modules/partidos/components/admin/MatchFormSheet.tsx) que sirve a las dos pantallas (con torneo en contexto, o pidiéndolo). **Bug grave que destapó:** el de `/admin/partidos` pedía los equipos a `GET /api/teams` —ruta que no existe, solo hay POST— y mandaba ids de `Team` donde la API espera ids de `TournamentTeam`: **programar un partido desde esa pantalla nunca funcionó**. Para arreglarlo se agregó `GET /api/tournaments/[id]` (torneo + equipos inscriptos + fases), verificado en dev.
  - **Inscripción de equipo:** `DialogAddEditTeamTournament` + `tournament-team-form` (727 líneas) → [TournamentTeamSheet](app/admin/torneos/[id]/components/TournamentTeamSheet.tsx). **Cierra el punto 5 de C6** (decisión del usuario): ya no se cargan estadísticas a mano (PJ/PG/PE/PP/GF/GC/puntos) y **la API tampoco las acepta** ([lib/validators/tournament-team.ts](lib/validators/tournament-team.ts)) — eran doble fuente de verdad, el recálculo de la tabla las pisaba igual. El ajuste manual de puntos va por `bonusPoints`, que el recálculo respeta.
  - **Plantel:** `DialogAddEditTeamPlayer` (tema oscuro forzado con paleta slate/ámbar, fuera de la marca) → [TeamRosterSheet](app/admin/torneos/[id]/components/TeamRosterSheet.tsx). Se eliminó su modo "edit", que hacía `PATCH /api/team-player/[id]` — ruta inexistente (**hallazgo A11.2**: editar una asociación jugador-equipo nunca funcionó). Ahora se saca y se vuelve a sumar; de paso el alta acepta dorsal y posición en ese equipo, que la API ya soportaba.
  - **Bug de fechas corregido en todo el panel** ([lib/date-input.ts](lib/date-input.ts)): los formularios formateaban con `toISOString().split("T")[0]`, que pasa a UTC y **corre el día** en Argentina (un partido del 14 a las 21:00 se editaba como 15). Las fechas ahora viven como string local y se convierten al enviar.
  - **Bug destapado por la validación:** `teamCreateSchema` exige `yearFounded` (no está en su `.partial()`), pero el formulario de equipo lo mandaba opcional → crear un equipo sin año daba 400 y la UI solo decía "Error al crear el equipo", sin señalar el campo. Ahora es obligatorio en el formulario, con su mensaje.
  - Verificado: `tsc` limpio, **0 errores de lint en todo el repo**, 54 tests ✅, `next build` verde (43 páginas), smoke en dev del endpoint nuevo (`GET /api/tournaments/[id]` → 200 con equipos y fases).
  - ⚠️ **Pendiente de verificar a mano** (mismo límite que el DataTable): la pasada visual de los 9 formularios requiere sesión de Clerk — sin cookies las rutas `/admin/*` dan 404. Falta comprobar en el navegador el panel lateral en desktop, el fullscreen en mobile (<768px), el aviso de borrador y la guarda de cambios sin guardar.
- [x] **Navegación (2026-07-14):** el indicador activo por prefijo ya estaba; se sumaron las dos piezas que faltaban.
  - **Fuente única del menú** ([lib/constants/admin-nav.ts](lib/constants/admin-nav.ts)): `menuItems` vivía dentro del sidebar. Sumar el palette copiando esa lista habría creado dos menús que divergen en silencio (el error de los dos footers y los dos `STATUS_BADGE`), así que se extrajo primero: sidebar y palette la comparten, y agregar una ruta admin es sumar un objeto ahí.
  - **Breadcrumbs en las 6 subpáginas** (detalle de torneo/equipo, detalle y edición de noticia, detalle y edición de usuario) con el nuevo [Breadcrumbs](components/shared/Breadcrumbs.tsx). Se extrajo del `<PageHeader>` porque las pantallas de detalle tienen header propio y no pueden usarlo: sin extraerlo, cada una habría copiado el markup. Reemplazan a los botones "Volver a X" (el breadcrumb dice dónde estás **y** conserva el link de vuelta). **De paso:** `modules/equipos/.../Header.tsx` tenía un pseudo-breadcrumb a mano cuyo último nivel decía "Detalle del Equipo" —el tipo de pantalla— en vez del nombre del equipo. **Excepción deliberada:** `/admin/partidos/[id]/cargar` conserva su "← Partidos" + badge del torneo; es el patrón §5 (acción rápida mobile-first) y un breadcrumb competiría ahí con el marcador sticky.
  - **Command palette `Ctrl/⌘+K`** con `cmdk` ([CommandPalette.tsx](components/admin/CommandPalette.tsx) + primitiva [command.tsx](components/ui/command.tsx)), montado en `AdminShell` con **disparador visible** en el header ("Buscar… ⌘K"): un atajo que no se anuncia no existe para quien no lo conoce. Hace dos cosas: **busca torneos, equipos y jugadores por nombre** (lo que de verdad justifica el atajo: llegar a "Clausura 2026" sin abrir el listado y filtrar) y salta a secciones. Nuevo `GET /api/admin/search` ([route.ts](app/api/admin/search/route.ts)) acotado a las organizaciones del usuario (`getPanelOrgIds`, N3) — verificado en dev: anónimo → `[]`, query < 2 caracteres → `[]` sin tocar la BD. El resultado de un jugador lleva a su **ficha pública**, la única que existe (no hay `/admin/jugadores/[id]`), y el grupo lo avisa en vez de fingir un atajo que no acorta nada.
  - Desviación deliberada de la primitiva shadcn: `CommandDialog` reenvía sus props extra al `<Command>` y no al `<Dialog>` — sin eso no se puede pasar `shouldFilter={false}`, necesario para no re-filtrar en el cliente (con otro criterio) resultados que el server ya filtró.
  - Verificado: `tsc` limpio, **0 errores de lint en todo el repo**, 54 tests ✅, `next build` verde (44 páginas), smoke en dev (`/`, `/torneos` 200; endpoint de búsqueda OK). **Pendiente de verificar a mano** (necesita sesión de Clerk): abrir el palette con el atajo y ver resultados reales de búsqueda.
- Documentado: patrón §12 de `UI_PATTERNS.md`, `COMPONENT_LIBRARY.md` §2b/§2c y regla nueva en `AGENT_RULES.md`.

**F3 completo** (salvo las verificaciones manuales anotadas arriba y en el DataTable).
- Verificado (2026-07-13): `tsc` limpio, `next build` verde, **0 errores de lint en los archivos nuevos/tocados** (los 47 del panel son preexistentes, ver ítem arriba); smoke en dev del sidebar/headers: las 13 rutas admin compilan y responden sin errores de render (dan 404 por el gate de Clerk sin cookies, esperado).
- ⚠️ **Pendiente de verificar a mano:** el smoke en dev **del DataTable** no llegó a correrse (el entorno de shell se cayó al final de la tarea). `tsc` + `eslint` + `next build` sí pasaron sobre las 7 tablas migradas, así que compilan y tipan; falta la pasada visual: orden por columna, chips de filtro, paginación y **el colapso a cards en <768px** en cada una de las 7 pantallas.

### F4. Microinteracciones y pulido (E:Medio)

- [x] **Microinteracciones (2026-07-14).** Antes de animar nada se creó el **sistema de movimiento** que faltaba ([globals.css](app/globals.css), documentado en DESIGN_SYSTEM §5b): una sola curva (`--ease-out` → utilidad `ease-brand`) y tres duraciones (`--duration-fast|base|slow`, 150/250/400ms). Sin eso, cada microinteracción nueva habría sumado otro `duration-300 ease-in-out` inventado y el producto se movería con un ritmo distinto en cada pantalla.
  - **Transiciones de página:** [app/template.tsx](app/template.tsx) con `.page-transition` (fade + 4px, 200ms). `template.tsx` se remonta en cada navegación → sin JS ni estado. Corto a propósito: una transición de página que se nota estorba.
  - **Hover consistente:** nueva utilidad **`.interactive-surface`** (elevación 2px + sombra + borde de marca), adoptada por `StatCard` y `EntityCard`, que lo tenían escrito a mano y con duraciones distintas (`duration-300` vs `duration-200`).
  - **Number tickers en KPIs:** nuevo [NumberTicker](components/shared/NumberTicker.tsx), ya integrado en `StatCard` (solo para valores numéricos: animar `"3 de 5"` no significa nada). Usa `tabular-nums` — sin ancho fijo por dígito el número tiembla mientras sube.
  - **`prefers-reduced-motion` en JS:** nuevo hook [usePrefersReducedMotion](hooks/use-reduced-motion.ts). Hallazgo: la media query global de `globals.css` (F1) frena animaciones y transiciones **de CSS**, pero **no toca un `requestAnimationFrame`** — el ticker habría animado igual para quien pidió menos movimiento.
  - **Toast con "Deshacer" (el ítem de más valor):** el botón de eliminar torneo **mentía** — decía *"Esta acción no se puede deshacer. Se eliminará el torneo y todos sus datos"* cuando el DELETE es un **soft delete** (C7) que conserva partidos, goles, tarjetas y standings. Dos errores en uno: asustaba con una consecuencia falsa y desperdiciaba una red de seguridad que ya existía en el server pero no tenía cómo invocarse desde la UI (solo entrando a la base a mano). Ahora: nuevo `POST /api/tournaments/[id]/restore` ([route.ts](app/api/tournaments/[id]/restore/route.ts) — mismo control de acceso que el DELETE, espeja a `restoreReferee`), copy honesto, `<ConfirmDialog>` en vez del `Dialog` armado a mano, y toast con **"Deshacer"** a 10s (el default de 4s se va antes de que el usuario registre el error). Al eliminar desde la ficha del torneo redirige al listado (esa ruta deja de existir) y el "Deshacer" devuelve a la ficha. Documentado como patrón §8c de `UI_PATTERNS.md`.
  - **No se hizo — `View Transitions` (decisión justificada):** requiere `experimental.viewTransition` de Next **+ `unstable_ViewTransition` de React**, que **no existe en React 19 estable** (verificado en `node_modules`: la config de Next lo acepta, React no lo exporta). Habilitarlo obliga a migrar React al canal experimental en una app que va a producción, a cambio de un efecto cosmético. El fade de `template.tsx` cubre la mayor parte del beneficio percibido sin ese riesgo. Reevaluar cuando `<ViewTransition>` sea estable en React.
- [x] **Auditoría dark/light (2026-07-14) — apareció la causa raíz, no una lista de archivos.** El token **`--card` valía en modo oscuro exactamente lo mismo que `--background`** (`oklch(0.145 0 0)` los dos), y `<Card>` de shadcn usa `bg-card`: **toda card sin override se confundía con el fondo de la página**, solo el borde la salvaba. Por eso ~89 archivos terminaron hardcodeando `dark:bg-gray-800/900` encima — no era descuido, era el único modo de que se vieran. Corregido a `oklch(0.205 0 0)` en `--card` y `--popover`. **Verificado en el CSS servido por el dev server:** dark `--background: #0a0a0a` vs `--card: #171717` (antes idénticos).
  - Con el token ya utilizable, migrados a `bg-card` los **componentes compartidos** (los de más alcance): `PageHeader`, `DataTable` (buscador + card de mobile), `FilterChips`, `EntityCard` y los campos de formulario (`fields.tsx`). Los ~85 archivos legacy restantes se migran **al tocarlos**, misma política que los tokens de marca de M6 (regla agregada a `AGENT_RULES.md`).
  - Excepción documentada: una sección *hundida* dentro de una card (ej. `FormSection`) **no** es `bg-card` — `bg-gray-50 dark:bg-gray-900/50` ahí es deliberado.
- Verificado: `tsc` limpio, **0 errores de lint en todo el repo**, 54 tests ✅, `next build` verde, smoke en dev (6 rutas públicas 200; `--ease-out`/`--duration-fast`/`.interactive-surface`/`pageIn` presentes en el CSS servido; `.page-transition` en el HTML; `POST /restore` anónimo → 401).
- ⚠️ **Pendiente de verificar a mano** (necesita sesión de Clerk): el toast "Deshacer" contra un torneo real, el ticker de los KPIs del panel y el contraste de las cards en dark después del cambio de token.

**F4 completo. Con esto cierra el plan de rediseño frontend (F0–F4).**

---

## 🚀 PRODUCTO — Funcionalidades nuevas y diferenciadores SaaS

> Ordenadas por relación valor/esfuerzo. Las 4 primeras convierten la app de "gestor interno" a "plataforma".

- [x] **S1. Generador automático de fixture (2026-07-14).** Round-robin (ida/vuelta), grupos balanceados y llaves con byes a partir de los equipos inscriptos, desde el detalle del torneo (header de la pestaña Partidos y su estado vacío). **Algoritmo puro en [lib/fixture/](lib/fixture/) + 64 tests** (los tests del repo pasaron de 54 a 118): no toca Prisma, ni `Date.now()`, ni auth — recibe ids y devuelve un plan; el server action ([generateFixture.ts](modules/torneos/actions/generateFixture.ts)) pone permisos, guardas y escritura en una transacción.
  - **Round-robin por método del círculo** ([round-robin.ts](lib/fixture/round-robin.ts)): cada par se cruza exactamente una vez, nadie juega dos veces la misma fecha, y con cantidad impar cada equipo descansa exactamente una. **Bug que agarró un test, no el navegador:** la primera versión alternaba la localía por jornada + índice de cruce (lo intuitivo) y dejaba a un equipo con **los 5 partidos de visitante**; la regla correcta es invertir solo el cruce del equipo fijo, y da el desbalance mínimo posible (1 partido). Verificado de 4 a 12 equipos.
  - **Grupos** ([groups.ts](lib/fixture/groups.ts)): reparto en serpiente, no por bloques — si la lista viene sembrada por nivel, cortar por bloques mete a los cuatro mejores en la misma zona.
  - **Llaves** ([knockout.ts](lib/fixture/knockout.ts)): siembra estándar (el 1 y el 2 solo se cruzan en la final) y byes para los mejores sembrados. ⚠️ **Genera solo la primera ronda, por un límite del schema:** `Match.homeTeamId` es obligatorio, así que no se puede crear una semifinal antes de saber quién la juega (no hay forma de representar "el ganador de la llave 3"). Las rondas siguientes se cargan con el formulario de partido cuando hay resultados.
  - **Sorteo reproducible** ([shuffle.ts](lib/fixture/shuffle.ts)): PRNG con semilla en vez de `Math.random()`, así el algoritmo sigue siendo puro y los tests no son una lotería.
  - **Calendario** ([schedule.ts](lib/fixture/schedule.ts)): fecha de inicio + intervalo (default: próximo sábado 16:00, una fecha por semana). Aritmética de fecha local, no suma de milisegundos — con milisegundos, cruzar el cambio de horario de verano corre la hora de todas las jornadas siguientes.
  - **Nunca pisa partidos jugados** (decisión del usuario): con partidos FINALIZADO/EN_JUEGO/WALKOVER, o con marcador, goles o tarjetas, el generador se niega y explica por qué. Si solo hay partidos PROGRAMADO vacíos, pide confirmación para reemplazarlos. El chequeo se rehace en el server: el cliente pudo cargar la pantalla antes de que alguien cargara un resultado.
  - **Formatos: cierra el pendiente de la línea 766.** [formats.ts](lib/fixture/formats.ts) es la fuente única de qué formato usa qué generador. De los 14 del enum, 10 se generan; los 4 restantes (`SUIZO`, `DOBLE_ELIMINACION`, `MIXTO`, `AMISTOSO`) **se ocultan del selector** y declaran su motivo (el suizo empareja según resultados de la ronda anterior: no existe un fixture completo para generar de una vez). `tournamentFormatOptions(currentFormat)` conserva el formato de un torneo viejo para que editarlo no se lo cambie por lo bajo.
  - 🐛 **Bug grave encontrado y arreglado (S1 dependía de él): todo el display de fases estaba muerto.** `KnockoutBracket`, `PublicStandingsSection`, `AdminStandingsSection` y el badge de fase de `TournamentDetailView` filtraban por `match.phase?.name` contra nombres del modelo **`Phase` legacy, borrado en A6**. La query (`getTorneoById`) trae `tournamentPhase` y nunca `phase` → el campo era siempre `undefined`: **el bracket renderizaba cero partidos y el badge de fase no aparecía nunca**. TypeScript no lo agarró porque `IMatch` declaraba `phase`, un campo que la API no devuelve (misma clase de bug que los `any` de F3). Corregido: `IMatch` ahora declara `tournamentPhase`, se filtra por `tournamentPhase.type === "KNOCKOUT"` (enum del schema, no texto libre) y se borraron los 4 helpers legacy (`isKnockoutPhase`, `legacyPhaseCountsPoints`, `getLegacyPhaseName`, `getKnockoutPhaseOrder`) con sus tests. De paso murió una cadena de 9 ternarios que traducía nombres del enum borrado.
  - Verificado: `tsc` limpio, **0 errores de lint en todo el repo**, **118 tests ✅**, `next build` verde, smoke en dev (`/`, `/torneos` y la ficha pública de un torneo real → 200).
  - ⚠️ **Pendiente de verificar a mano** (necesita sesión de Clerk): generar un fixture real de punta a punta y ver el bracket renderizando con las fases nuevas.
  - **Pendiente que abre S1:** avanzar rondas de una llave automáticamente al cargar un resultado (hoy la ronda siguiente se crea a mano). Requiere decidir cómo se representa "el ganador de la llave 3" antes de que exista — probablemente `Match.homeTeamId` nullable + un campo de origen.
- [ ] **S2. Multi-tenancy con organizaciones/ligas:** ✅ definido y detallado en N2 (schema concreto de `Organization`/`OrganizationMember`, News queda global, sin Clerk Organizations). Ver sección 🧭.
- [ ] **S3. Inscripción online de equipos (E:Alto):** flujo público — organizador publica torneo con cupos y fecha límite → delegados registran equipo + plantel → organizador aprueba/rechaza. Estados `INSCRIPCION` ya existen en el enum; falta el workflow. Opcional: cobro de inscripción con Mercado Pago.
  - [x] **Hecho (2026-07-14, en N13/N12 + cupos):** el delegado inscribe su equipo a los torneos abiertos, la liga aprueba/rechaza con `RegistrationStatus`, el plantel se carga con dedupe por DNI, y el torneo tiene **cupo máximo y fecha límite de inscripción** (migración `20260716130745_cupos_y_ficha_del_jugador`).
    - `Tournament.maxTeams` y `registrationDeadline`, ambos **nullable = sin límite**: los torneos que ya existían no cambian de conducta.
    - Reglas puras y testeables en [lib/inscriptions.ts](lib/inscriptions.ts) (`isRegistrationClosed`, `remainingSlots`, `canRequestInscription`) — la UI las usa para mostrar "quedan 2 cupos / cierra el viernes" y el server para decidir: **una sola fuente**, así la UI no dice una cosa y el server otra. +15 tests.
    - **El cupo cuenta solo los INSCRIPTO**, no los pendientes: una solicitud sin aprobar todavía no ocupa lugar. Por eso el control **duro va al aprobar**, no al pedir — entre la solicitud y la aprobación pueden haberse aprobado otras, y aprobar de a una las pendientes desbordaría el cupo sin que nadie se entere.
    - La lista del delegado **oculta los torneos con inscripción vencida** y deshabilita el botón sin cupo: mostrar un botón que el server va a rechazar es peor que no mostrarlo. El cierre se valida igual en el server (la fecha del navegador la pone el usuario).
    - Validación cruzada en el form: las inscripciones no pueden cerrar después de que arranque el torneo.
    - **Falta de S3:** cobro de la inscripción con Mercado Pago (opcional).
    - ✅ **Límite del plan, corregido de raíz (2026-07-14).** El síntoma conocido era que `assertPlanLimit(org, "addTeamToTournament")` contaba **todos** los `TournamentTeam` (rechazar una inscripción consumía cupo del plan igual). Al mirarlo apareció que era **lo menos grave de tres**:
      1. **El conteo** incluía `RECHAZADO` y `PENDIENTE`. Ahora cuenta solo `INSCRIPTO`: es lo único que de verdad ocupa un lugar. Una solicitud que nunca se aprueba no debería costar nada.
      2. 🔴 **El camino del delegado no consultaba el plan en absoluto.** `assertPlanLimit` se llamaba en **un solo lugar** (`POST /api/tournament-teams`, la liga agregando a mano); ni `requestInscription` ni `approveInscription` lo miraban. O sea: **el límite comercial simplemente no se aplicaba si los equipos entraban por inscripción online** — una liga en FREE podía terminar con 30 equipos en un torneo de 8. Es fuga de ingresos, que es exactamente lo que el límite existe para evitar.
      3. **El control estaba en el lugar equivocado.** Ahora va donde el equipo **pasa a ocupar lugar** (`approveInscription`), no solo al crearlo: si no, aprobar de a una las pendientes desborda el cupo sin que nadie se entere.
    - **Concepto nuevo: capacidad efectiva** (`effectiveCapacity` en [lib/inscriptions.ts](lib/inscriptions.ts), puro y testeado) = la más chica entre el cupo del torneo y el del plan. Devuelve también **de dónde sale el límite**, y eso no es decorativo: decide a quién se le cuenta qué.
    - 🔒 **El delegado no ve el plan de la liga.** Que una liga esté en el plan gratis es su relación comercial con la plataforma: no es problema del delegado y la expone. Al delegado se le dice *"este torneo ya no tiene lugar"*; al organizador, el mensaje real con el upsell. Mismo límite, distinto mensaje según quién escucha.
    - Verificado: 148 tests ✅ (+4 de `effectiveCapacity`), `tsc` limpio, 0 errores de lint, build verde.
- [x] **S4. Página pública compartible + QR (E:Medio):** ✅ **Hecho (2026-07-17).** OG image dinámica + compartir por WhatsApp + QR imprimible, todo colgado de la URL canónica `/liga/[slug]/[torneo]` que ya existía de N9.
  - **OG image que se genera en cada scrapeo, no un JPG viejo** ([opengraph-image.tsx](app/(public)/liga/[slug]/[torneo]/opengraph-image.tsx), `next/og`/Satori). Dos variantes según el estado real del torneo: si ya hay partidos jugados muestra el **top 5 de la tabla** (ordenado con el `makeStandingsComparator` del torneo — la misma fuente que la tabla web, no un `sort` paralelo que se despegue); si todavía no arrancó, invita a seguirlo con el número de equipos. La metadata la inyecta Next solo por convención de archivo — se **quitó** el `openGraph.images` que ponía el logo en [page.tsx](app/(public)/liga/[slug]/[torneo]/page.tsx), porque declararlo a mano pisaba la imagen dinámica.
  - **Consulta propia y mínima** (`getTournamentOgData`): la OG se scrapea seguido y no puede arrastrar el include gigante de `getTorneoById`. Cuenta solo los `INSCRIPTO` (los pendientes de la inscripción online no van en la tabla). Si el torneo no existe (link viejo/borrado) devuelve una **tarjeta de marca** en vez de un 500 que deja la preview en blanco.
  - **Compartir por WhatsApp, copiar link y share nativo** ([ShareButton.tsx](modules/torneos/components/ShareButton.tsx), junto al FollowButton en el hero). La URL se arma con `window.location.origin` en el cliente: funciona igual en local, preview y prod **sin depender de ninguna env pública**. En móvil, si hay `navigator.share`, se ofrece primero (un tap, sin salir de la app).
  - **QR imprimible** ([/qr](app/(public)/liga/[slug]/[torneo]/qr/page.tsx)): cartel para Ctrl+P → pared de la cancha. SVG (nítido a cualquier tamaño de papel, un PNG se pixela), corrección de errores **nivel M** (aguanta que el papel se moje/doble), `print:hidden` en todo lo que no es el cartel, y `robots: noindex` (un afiche no es contenido para Google). El ítem QR en el ShareButton **se oculta si el torneo no tiene slug todavía** — su ruta vive bajo `/liga/...` y sin slug daría 404.
  - **Dependencia nueva: `qrcode`.** Es lo contrario del caso Resend de S5: allá el SDK no compraba nada (un `fetch`), acá la librería compra un algoritmo difícil (Reed-Solomon + enmascarado) **verificado por el ecosistema** — escribirlo a mano sería un QR que no puedo validar sin un lector de referencia. Las 2 vulns `moderate` que reporta `npm audit` son de `postcss` anidado en Next (preexistentes, ajenas a esto).
  - **Refactor de paso:** la lógica de URL base salió de `email.ts` (S5) a [lib/urls.ts](lib/urls.ts) (`getBaseUrl`/`absoluteUrl`), ahora compartida entre email, OG y QR. Una sola definición del orden `NEXT_PUBLIC_APP_URL → VERCEL_URL → localhost`.
  - Verificado **en runtime, no por ausencia de error**: build de producción real, la OG renderiza **PNG 1200×630 válido** en sus dos variantes (invitación con datos reales + tabla con un render aislado, porque ningún torneo de la base tiene partidos jugados todavía), los `<meta property="og:image">` salen con URL absoluta + tipo + tamaño, el QR renderiza SVG y el botón Compartir aparece en la página. 174 tests ✅, `tsc` limpio, 0 errores de lint.
  - **Falta de S4:** (1) la variante-tabla de la OG no se ejercitó contra datos reales porque **ningún torneo de la base tiene partidos jugados** — se verificó con un render aislado de los mismos primitivos; (2) no hay caché de la OG image (Next la revalida sola, pero un torneo muy compartido la regenera seguido — evaluar `revalidate` si pesa); (3) el QR y el compartir viven en la página del torneo, no en la de equipo/jugador (fuera del alcance del pedido).
- [x] **S5. Notificaciones (E:Medio):** ✅ **Hecho (2026-07-17).** Campana con no-leídas + email por Resend, modelo `Notification` + `NotificationPreference` (migración `20260717120000_notificaciones`).
  - **El texto no se guarda en el enum, se renderiza.** [lib/notifications/catalog.ts](lib/notifications/catalog.ts) es puro: `renderNotification(payload)` → `{título, cuerpo, url, categoría}`, con **unión discriminada por tipo** — mandar `INSCRIPCION_APROBADA` sin el nombre del torneo no compila. Pero la fila sí guarda el texto **ya renderizado**: la campana se lee mucho más de lo que se escribe, y resolverlo en cada lectura obligaría a consultar torneos/equipos que quizá ya se borraron.
  - **`notify()` nunca lanza y nunca va adentro de una transacción** ([lib/notifications/dispatch.ts](lib/notifications/dispatch.ts)). Una notificación es un efecto del negocio, no el negocio: si aprobar una inscripción notifica mal, la inscripción queda aprobada igual. Y adentro de la transacción, un rollback dejaría avisos de algo que no pasó — un email ya no se puede desenviar.
  - **Nunca se notifica al que actuó** (`exclude`): el organizador que aprueba no necesita que le avisen que aprobó.
  - **Los destinatarios se resuelven por rol en un solo lugar** (`getOrgManagerIds`, `getTeamManagerIds`, `getPlatformAdminIds`…), no en cada acción: si no, dos flujos parecidos terminan avisándole a gente distinta. El COLABORADOR queda afuera de las decisiones (carga resultados, no aprueba — tabla N1).
  - **Sin `RESEND_API_KEY` no explota: no manda nada** y la campana funciona igual. Se usa `fetch` contra la API de Resend en vez del SDK — es un endpoint, y el paquete no compra nada. La pantalla de preferencias **avisa** cuando el envío no está configurado, en vez de mostrar switches que no hacen nada.
  - **Preferencias: la ausencia de fila es "todo encendido".** Nadie configura nada para que funcione, no hay que sembrar filas al registrarse ni backfillear a los usuarios que ya existían. Solo se ofrece apagar el **email**: la campana no interrumpe a nadie.
  - 🔴 **La suspensión se notifica solo si es nueva.** El motor de sanciones es idempotente y **recalcula en cada carga de resultado**: notificar ahí sin más habría re-avisado la misma suspensión una y otra vez. Se compara `desiredKeys - existingKeys` dentro de la transacción y se avisa después del commit. Cierra el pendiente (3) de N8.
  - **Emisores cableados (cierran deuda de otras tareas):** resultado cargado (solo en la **transición** a FINALIZADO — editar un gol mal cargado no es una novedad, y es el mismo PATCH que usa la carga en vivo: notificar en cada uno sería spam); delegado aprobado/rechazado y equipo propuesto (**pendiente de N13**); inscripción pedida/aprobada/rechazada (S3); pago informado → ADMIN y aprobado/rechazado → OWNER (**pendiente de N5**); disputa de ficha → ADMIN (**pendiente que abrió N14b**) y su resolución a **las dos partes**; reclamo de ficha aprobado/rechazado.
  - **En la disputa, al dueño actual no se le avisa que la abrieron** — solo el resultado. Avisarle antes de que alguien mire la evidencia lo invita a reaccionar contra el reclamante, que puede ser el titular real.
  - **Falta de S5:** (1) **"próximo partido" no está**: es el único aviso del enunciado que no lo dispara una acción de usuario — necesita un job programado (cron de Vercel) que barra los partidos de las próximas 24h, y no hay infraestructura de cron en el proyecto todavía; (2) email real de invitación a la liga (pendiente de N6: la invitación existe pero no se envía — la campana no sirve porque el invitado todavía no tiene cuenta); (3) la campana es polling cada 60s, no push (el tiempo real llega con S6); (4) `/notificaciones` trae 50 y no pagina.
  - Verificado: **174 tests ✅** (+26: catálogo y `relativeTime`), `tsc` limpio, 0 errores de lint, build verde, migración aplicada.
  - ⚠️ **Encontrado de paso (preexistente, NO de S5) → ✅ arreglado (2026-07-17), ver abajo.**

- [x] **Historial de migraciones irreproducible — arreglado (2026-07-17).** `prisma migrate dev` fallaba con **P3006**: `cupos_y_ficha_del_jugador` hacía `ALTER TYPE "TeamManagerStatus" RENAME TO "ApprovalStatus"` sobre un tipo que, en un replay, todavía no existía. La base real estaba al día, pero **el historial no se podía replayear: no se podía levantar un entorno nuevo.**
  - **La causa no era el SQL, era el nombre de las carpetas.** El orden real de aplicación (`_prisma_migrations.started_at`) lo dejó a la vista: `delegado_de_equipo` (`…144357`) se aplicó **14:44**, y `jugador_identidad_global` (`…122751`) y `cupos_y_ficha_del_jugador` (`…130745`) recién **15:28** y **16:08**. O sea: esas dos se escribieron después pero se nombraron con timestamps **antedatados**. Prisma aplica en **orden lexicográfico de carpeta**, así que en un replay corrían antes de la migración que crea el enum que ellas renombran. En la base real nunca se notó porque ahí se aplicaron en el orden correcto, una sola vez.
  - **El arreglo fue renombrar, no reescribir.** El defecto era la **clave de orden**, no el contenido: las dos carpetas antedatadas pasaron a su **hora real de aplicación** (`20260716152830_jugador_identidad_global`, `20260716160823_cupos_y_ficha_del_jugador`). `delegado_de_equipo` no se tocó — su nombre ya era honesto. **Cero cambios de SQL**, así que los checksums siguen válidos y el rename del enum (que es deliberado: `ALTER TYPE … RENAME` conserva los datos, recrearlo los tira) se conserva como estaba.
  - **`_prisma_migrations` se actualizó** (`migration_name`, 2 filas) para que la base reconozca los nombres nuevos: sin eso los vería como pendientes e intentaría re-ejecutarlos. Solo bookkeeping — ningún dato de negocio.
  - Verificado **de verdad, no por ausencia de error**: se creó una base descartable, se corrió `migrate deploy` desde cero (13/13 aplicadas ✅) y se comparó el resultado contra `schema.prisma` → **"No difference detected"**. La base de entorno nuevo sale idéntica al schema. `migrate dev` sobre la real: "Already in sync". Base descartable eliminada.
  - 📌 **Regla para adelante:** **no antedatar carpetas de migración.** El timestamp no es cosmético: es el orden de ejecución. Si una migración depende de otra, su nombre tiene que ordenar después — y `migrate dev` (que replaya en shadow DB) lo detecta antes de commitear, cosa que `migrate deploy` **no** hace.
- [ ] **S6. Live match center (E:Alto):** marcador en vivo minuto a minuto (el admin carga eventos, el público ve actualizado con polling/SSE). Gran diferenciador para ligas locales.
- [x] **S7. Estadísticas avanzadas (E:Medio):** ✅ **Hecho (2026-07-17).** Goleadores/valla/tarjetas **ya existían** en la pestaña Estadísticas; S7 agrega lo que faltaba: **fair play por equipo, racha/forma y cara a cara (head-to-head)**.
  - **Lógica pura en [lib/stats/](lib/stats/) + 20 tests**, mismo patrón que fixture/standings/suspensions: recibe arrays y devuelve rankings, sin Prisma ni `Date.now()`. Las server actions ([getAdvancedStats](modules/torneos/actions/getAdvancedStats.ts), [getHeadToHead](modules/torneos/actions/getHeadToHead.ts)) traen los datos y delegan el conteo.
  - 🔑 **El resultado W/D/L se decide por el marcador, igual que la tabla** ([match-outcome.ts](lib/stats/match-outcome.ts) reusa el criterio de `calculateTeamStats`). Es la misma fuente de verdad — la racha nunca contradice a la tabla. Consecuencia deliberada y documentada: una serie definida por **penales** (empate + `penaltyWinner`) cuenta como empate en la racha, exactamente como la cuenta la tabla general.
  - **Fair play incluye a los equipos sin tarjetas** (son los más limpios: omitirlos daría el ranking al revés), por eso recibe la lista de participantes, no solo las tarjetas. Escala amarilla 1 · roja 3 en una constante única, no repartida.
  - **Head-to-head bajo demanda, no precalculado:** el usuario elige dos equipos y el historial se pide al server. No se computan las N² combinaciones — en un torneo grande sería una consulta enorme para algo que casi nadie abre. Todo se reporta **desde la óptica de A** (el primer selector), así "izquierda vs derecha" es literal.
  - **La `form` se devuelve en el orden de la tabla** (mismo `makeStandingsComparator`), así el ranking de racha se lee al lado de la posición sin sorpresas.
  - Verificado **en navegador real (puppeteer sobre Chrome, no solo curl)**: la pestaña arranca en Posiciones, así que el SSR de la pestaña Estadísticas viene vacío — al activarla renderiza todo. Confirmado con screenshot: Fair Play rankea los 2 equipos, Racha muestra su estado vacío correcto (0 partidos), y el selector de cara a cara ejercita la server action (devolvió "todavía no se enfrentaron", correcto). 194 tests ✅ (+20), `tsc` limpio, 0 errores de lint, build verde. (La herramienta de verificación `puppeteer-core` se desinstaló después: nada del código la usa.)
  - **Nota:** la tabla de posiciones **ya tenía una columna "Racha"** (vacía). La card de Racha de S7 es más rica (badges G/E/P de los últimos 5 + "N victorias al hilo") y vive en la pestaña de stats; no reemplaza la columna, la complementa.
  - **Falta de S7:** (1) fair play/racha/H2H **no se ejercitaron con partidos jugados reales** porque ningún torneo de la base tiene resultados cargados — se probó la lógica con 20 tests unitarios y la UI con datos vacíos; (2) el H2H no se precalcula (decisión, ver arriba), así que cada consulta es un round-trip; (3) no hay stats a nivel jugador nuevas (asistencias existen en `Goal.assistTeamPlayer` pero no se expusieron — queda para una iteración).
- [ ] **S8. Exportables (E:Bajo-Medio):** fixture y tabla en PDF con branding, planteles en CSV. Muy pedido por organizadores.
- [x] **S9. PWA (E:Medio):** ✅ **Hecho (2026-07-17).** La app es instalable en el celular y aguanta la mala señal de la cancha.
  - **Manifest** en [app/manifest.ts](app/manifest.ts) → Next lo sirve en `/manifest.webmanifest` e inyecta el `<link rel="manifest">` solo. `display: standalone`, `start_url: /torneos` (lo que abre un hincha, no la landing de marketing), `theme_color` violeta de marca, íconos 192/512 en `any` **y** `maskable`, y `shortcuts` (Torneos/Partidos/Equipos) para el long-press del ícono.
  - **Service worker** vanilla sin dependencias en [public/sw.js](public/sw.js): páginas **network-first** (online = siempre fresco; solo sin red se sirve la última copia o la pantalla offline), assets con hash de Next **cache-first**. **Nunca toca `/api`, Clerk ni Cloudinary** (otro origen) → cero riesgo de servir datos autenticados viejos. Registrado por [components/pwa/service-worker-register.tsx](components/pwa/service-worker-register.tsx), montado en el layout raíz, **solo en producción** (en dev el HMR y un SW que cachea se pelean). Pantalla offline branded en [public/offline.html](public/offline.html) (auto-reload al volver la red).
  - **Sección en la landing** [InstallAppSection](components/sections/install-app-section.tsx) (entre Features y SocialProof): pitch al hincha ("Toda la liga, en tu bolsillo") con mockup de teléfono como elemento de firma. El CTA es **adaptativo por plataforma** vía el hook [useInstallPrompt](components/pwa/use-install-prompt.ts): Chrome/Edge/Android → botón que dispara el `beforeinstallprompt` nativo; iOS → pasos "Compartir → Agregar a inicio" (Safari no soporta el evento); ya instalada (standalone) → estado de éxito. Tokens de marca, dark/light, `prefers-reduced-motion`, touch target 48px. **No usa `sonner`**: la landing (`/`) cuelga del layout raíz, que no monta `Toaster` → feedback inline.
  - **Íconos generados** (trofeo de marca, mismo signo que header/footer) con `sharp`: `public/icons/icon-{192,512}.png` (redondeado, `any`) + `icon-maskable-{192,512}.png` (full-bleed, safe-zone). De paso se **arregló un 404 preexistente**: `app/layout.tsx` declaraba `/favicon.ico`, `/favicon-16x16.png` y `/apple-touch-icon.png` que **no existían en `public/`** → ahora sí (más `favicon-32x32.png`). `appleWebApp` + `themeColor` claro/oscuro agregados a la metadata.
  - Verificado (producción, `npm start`): `/manifest.webmanifest` 200 `application/manifest+json`, `/sw.js` 200, `/offline.html` 200, todos los íconos 200, `start_url` `/torneos` 200, la sección presente en el SSR, `<link rel="manifest">`/theme-color/apple-tags en el `<head>`, sin errores de runtime. `tsc` limpio, 0 errores de lint en lo tocado, build verde.
  - **Falta de S9:** (1) **no se probó la instalación real en un dispositivo** (Android Chrome / iPhone Safari) ni el `beforeinstallprompt` en vivo — se verificó que estén todos los criterios (manifest + SW con fetch handler + íconos 192/512 + https), pero no el prompt disparado en un teléfono; (2) la sección de instalación vive **solo en la landing anónima**; el home del hincha logueado ([FanHome](modules/usuarios/components/FanHome.tsx)) no la muestra — un usuario final logueado es justo quien está en la cancha, así que evaluar sumar ahí un banner de instalación discreto (bajo esfuerzo; la app ya es instalable desde el menú del navegador en cualquier página); (3) **sin push notifications** — el SW no maneja `push`/`notificationclick` todavía; las notificaciones siguen siendo la campana con polling (ver S5), el paso a push real es una iteración aparte; (4) no hay `screenshots` en el manifest (Chrome muestra una tarjeta de instalación más rica con ellas) — requiere capturar pantallas reales de la app; (5) el registro del SW está gateado a `NODE_ENV === "production"`: en dev la PWA no cachea (a propósito), se prueba con `build` + `start`.
- [ ] **S10. Multi-deporte (E:Alto, evaluar):** campo `sport` en Tournament con configuración de puntaje por deporte (básquet/vóley no usan 3-1-0). Solo si el negocio lo pide; diseñarlo en S2 para no migrar dos veces.
- [ ] **S11. Billing/planes freemium:** ✅ definido y detallado en N4 (planes/límites) + N5 (pagos manuales) + Mercado Pago después. Ver sección 🧭.
- [ ] **S12. Novedades de la liga (E:Medio, decisión D13):** publicaciones del organizador en su página pública `/liga/[slug]` — sale del pedido "el organizador puede crear noticias" (N14). **No reusar `News`** (que es de plataforma y solo ADMIN): modelo propio `OrgPost` con `organizationId`, título/contenido/portada, publicado/borrador, visible en la página de la liga y opcionalmente agregado al home del hincha que la sigue. Evaluar como feature de plan (`features.orgNews`) — es exactamente el tipo de valor que justifica PRO sin bloquear la operación deportiva.

---

## 🧭 NEGOCIO Y MODELO DE DATOS — Auditoría de Prisma vs. objetivos del producto (2026-07-05)

> Auditoría profunda del schema, la estructura y las reglas de negocio contra la visión definida por el product owner:
> landing atractiva para captar clientes → registro como usuario básico → upgrade a ORGANIZADOR contratando un plan →
> organizadores gestionan torneos completos (equipos, jugadores, partidos, árbitros, goles, tarjetas) → el administrador
> gestiona todo, aprueba pagos manuales (comprobante) y más adelante integra Mercado Pago.

### Diagnóstico: qué cumple y qué no

**Lo que el modelo actual hace bien (conservar):**

- El núcleo deportivo es rico y está bien normalizado: `Tournament → TournamentPhase → Match → Goal/Card/MatchReferee`, con `TournamentTeam` (equipo-en-torneo) y `TeamPlayer` (jugador-en-equipo-en-torneo) como tablas puente correctas. Esto permite que un mismo equipo/jugador participe en múltiples torneos con stats separadas — exactamente lo que un SaaS de ligas necesita.
- `TeamPhaseStats` con `bonusPoints` ya soporta grupos, fases y ajustes manuales.
- `Referee`/`MatchReferee` con roles por partido es más completo que la mayoría de competidores amateur.

**Lo que NO cumple con los objetivos (bloqueante para el modelo de negocio):**

1. **Roles globales equivocados.** `UserRole` mezcla roles de plataforma (ADMINISTRADOR) con roles de trabajo (EDITOR, MODERADOR, ORGANIZADOR) a nivel global. En el negocio real, "organizador" no es un rol global: es una relación con UNA liga/organización. Hoy un ORGANIZADOR ve/toca datos de todos. → N1/N2.
2. **No existe `Organization`.** Sin ella no hay: varios organizadores por torneo, datos privados por liga, planes por cliente, ni facturación. Es LA tabla que convierte la app de "gestor personal" a SaaS. → N2.
3. **No existe nada de billing.** Ni plan, ni suscripción, ni pago. El flujo "contratar plan → ser organizador" no tiene dónde vivir. → N4/N5.
4. **Reglas deportivas hardcodeadas.** 3-1-0 puntos fijo en `calculateTeamStats`, sin criterios de desempate configurables, sin sanciones automáticas por acumulación, sin campo para ganador de walkover. → N7/N8.
5. **Sin identidad pública.** No hay `slug` en Tournament ni Organization: las URLs públicas compartibles (el canal de adquisición #1: WhatsApp) no se pueden construir bien. → N9.
6. **`User.status = PENDIENTE` por default** sin flujo de activación definido: hoy un registrado queda en limbo. → N1.

### Decisiones de negocio nuevas (2026-07-05) — ver sección Decisiones al final

Roles simplificados (D5), datos privados por organización (D6), freemium (D7), pagos manuales primero (D8), múltiples organizadores vía membresía (D9). Las tareas N* implementan estas decisiones.

### Tareas por prioridad

#### N1. 🔴 Redefinir roles: plataforma vs. organización (E:Medio)

> ✅ **Implementado (2026-07-05):** `UserRole` = ADMINISTRADOR | USUARIO; `OrgRole` = OWNER | ORGANIZADOR | COLABORADOR. Registro nace ACTIVO. Bootstrap de admin vía env `ADMIN_EMAIL` en `checkUser`. Guards nuevos en [lib/orgAuth.ts](lib/orgAuth.ts) (`requireApiOrgContext`, `requireApiOrgAccess`, `requireActionOrgAccess`, con `allowCollaborator` para carga de resultados) aplicados a TODAS las rutas y actions de mutación. Panel: [lib/roleValidation.ts](lib/roleValidation.ts) → `validatePanelAccess` (admin o miembro de org). Noticias/usuarios/stats = solo admin.

- [x] **Qué:** separar rol de plataforma y rol dentro de una organización.
  - `UserRole` global queda en 2: `ADMINISTRADOR` (vos) y `USUARIO` (todo registrado; el "cliente/visitante").
  - Rol de trabajo pasa a `OrganizationMember.role`: `OWNER` (creó la liga, gestiona plan y miembros), `ORGANIZADOR` (gestión completa de torneos/equipos/jugadores/partidos), `COLABORADOR` (solo carga resultados/eventos en vivo; ideal planilleros).
  - Migración de datos existentes: EDITOR/MODERADOR/ORGANIZADOR actuales → `USUARIO` global + membresía en una organización creada para ellos.
  - Registro nuevo: `status = ACTIVO` directo (eliminar PENDIENTE como default; queda para moderación manual si hiciera falta).
- **Permisos resultantes:**
  | Acción | Anónimo | USUARIO | COLABORADOR | ORGANIZADOR | OWNER | ADMIN |
  |---|---|---|---|---|---|---|
  | Ver páginas públicas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
  | Favoritos/seguir torneos | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
  | Cargar resultados/goles/tarjetas | ❌ | ❌ | ✅ (su org) | ✅ (su org) | ✅ | ✅ |
  | CRUD torneos/equipos/jugadores/árbitros | ❌ | ❌ | ❌ | ✅ (su org) | ✅ | ✅ |
  | Miembros, plan, pagos de la org | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
  | Noticias globales, planes, aprobar pagos, todo | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
- **Detalles:** reemplaza los checks `validateApiRole(["ADMINISTRADOR","EDITOR","ORGANIZADOR"])` por `requireOrgRole(orgId, ["ORGANIZADOR","OWNER"])` + `requireAdmin()`. Resuelve C7 y C10 de forma definitiva. Noticias globales = solo ADMIN (marketing de la plataforma).

#### N2. 🔴 Modelo `Organization` + membresías — concreta S2 (E:Alto)

> ✅ **Implementado (2026-07-05):** `Organization` + `OrganizationMember` en el schema (con slug único, status ACTIVA/SUSPENDIDA); `organizationId` **obligatorio** en Tournament/Team/Player/Referee; News quedó global. BD reseteada (aprobado por el owner) y migración inicial limpia `20260705_nueva_estructura`. La org personal se auto-crea en el primer uso (`getOrCreateOwnOrg`, freemium D7). **UI de gestión de miembros/invitaciones ✅ (N6):** `/admin/miembros` + APIs `/api/org/members`.

- [x] **Qué:** la tabla central del SaaS. Schema propuesto:
  ```prisma
  model Organization {
    id          String   @id @default(uuid())
    name        String            // "Liga Municipal de Rafaela"
    slug        String   @unique  // /liga/liga-municipal-rafaela
    logoUrl     String?
    logoPublicId String?
    description String?
    locality    String?
    phone       String?           // contacto público (WhatsApp)
    status      OrgStatus @default(ACTIVA) // ACTIVA | SUSPENDIDA (por falta de pago/abuso)
    ownerId     String
    owner       User     @relation(fields: [ownerId], references: [id])
    members     OrganizationMember[]
    subscription Subscription?
    tournaments Tournament[]
    teams       Team[]
    players     Player[]
    referees    Referee[]
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }

  model OrganizationMember {
    id             String   @id @default(uuid())
    organizationId String
    userId         String
    role           OrgRole  // OWNER | ORGANIZADOR | COLABORADOR
    invitedById    String?
    createdAt      DateTime @default(now())
    @@unique([organizationId, userId])
  }
  ```
  - `organizationId` **obligatorio** en `Tournament`, `Team`, `Player`, `Referee` (nullable solo durante la migración). `News` queda global (solo admin).
  - "Un torneo con varios organizadores" = varios `OrganizationMember` con rol ORGANIZADOR/COLABORADOR. No hace falta tabla torneo-organizador; si a futuro se quiere restringir un miembro a UN torneo, se agrega `TournamentAccess` opcional (no ahora).
- **Detalles:** ejecutar en la MISMA migración que A6 (índices) y M13 (categorías) para migrar una sola vez. Invitaciones por email (miembro existente o invitación pendiente por email). Clerk Organizations: evaluado — **no usar**; membresía propia en BD da control total sobre roles/planes y evita acoplar billing a Clerk.

#### N3. 🔴 Visibilidad de datos entre organizaciones (E:Bajo, es política + queries)

> ✅ **Implementado en mutaciones (2026-07-05):** toda mutación valida pertenencia a la org dueña del recurso (directo o vía torneo/partido).
> ✅ **Completado — listados del panel scopeados por org (2026-07-13):** cierra el pendiente de N3 y desbloquea el "ver como organización" de N10.
> - **Helper único en [lib/orgAuth.ts](lib/orgAuth.ts):** `getPanelOrgIds(user?)` (null = ADMINISTRADOR sin restricción; `[]` = sin sesión/sin membresías → no ve nada; array = orgs del miembro), `orgScopeWhere(orgIds)` (fragmento `where` de Prisma) y `canViewInPanel(orgIds, organizationId)` (guard para páginas de detalle).
> - **Listados scopeados:** `getAdminTorneos`/`getAdminEquipos` (variantes de panel — las públicas `getTorneos`/`getEquipos` siguen mostrando todo, política "público read-only"), `getJugadores` y `getReferees` scopeados directamente (solo los usa el panel y exponen PII: DNI, fecha de nacimiento, email/teléfono — sin sesión ahora devuelven `[]`, cierra de paso la mitad del segundo ítem de M1), y `GET /api/matches?scope=panel` (el GET público sin param sigue abierto; `/admin/partidos` usa el scoped). Las 3 páginas de listado admin (torneos/equipos/jugadores) pasaron a `export const dynamic = "force-dynamic"` — antes se **prerenderizaban en el build** con datos congelados.
> - **Detalle guardado:** `/admin/torneos/[id]` y `/admin/equipos/[id]` verifican `canViewInPanel` y muestran "no encontrado" si el recurso es de otra org (filtrar el listado sin guardar el detalle era inútil — la URL directa seguía mostrando todo). La pantalla de agregar equipos a un torneo ahora ofrece solo equipos de la org (`getAdminEquipos`).
> - **"Ver como organización" (pendiente de N10, abordado acá):** el ADMINISTRADOR activa desde [/admin/organizaciones](app/admin/organizaciones/OrganizacionesClient.tsx) el botón "Ver como" → cookie httpOnly `golazo-admin-org-view` ([adminOrgView.ts](modules/organizaciones/actions/adminOrgView.ts), solo ADMINISTRADOR) → todos los listados del panel + el dashboard quedan scopeados a esa org (misma vista que su OWNER) y un banner fijo en el layout admin ([OrgViewBanner](components/admin/OrgViewBanner.tsx)) permite salir. Solo afecta VISTA: los permisos de mutación del admin no cambian.
> - Verificado: `tsc` limpio, 54 tests ✅, `next build` en verde sin ruido de prerender, lint sin errores nuevos, smoke en dev server (`/torneos` y `/api/matches` públicos 200; `/api/matches?scope=panel` anónimo → `[]`; `/admin/*` gateado por Clerk).
> - **Nota de diseño:** los `TournamentTeam`/`TeamPlayer` no llevan `organizationId` propio — heredan el del torneo/equipo; sus endpoints ya validaban vía `requireApiOrgAccess` y sus listados solo se llegan desde el detalle de torneo (ya guardado).

- [x] **Qué:** definir y aplicar la regla de qué ve cada organizador.
  - **Privado por organización (gestión):** equipos, jugadores, árbitros y torneos se crean, ven y editan SOLO dentro de la organización dueña. Otro organizador NO los ve en sus paneles ni los puede reutilizar. Razones: (a) integridad — nadie quiere que otra liga edite a sus jugadores; (b) privacidad — datos personales (DNI, fecha de nacimiento, fotos de menores); (c) simplicidad de permisos.
  - **Público read-only (difusión):** las páginas públicas de torneo/equipo/jugador son visibles para todos (es el marketing del organizador y de GOLAZO).
  - **Reutilización dentro de la org:** el mismo `Team`/`Player` participa en todos los torneos de su organización (Apertura, Clausura, Copa) — el modelo actual ya lo soporta vía `TournamentTeam`/`TeamPlayer`.
  - **Cross-liga (futuro, N12):** identidad global de jugador por DNI con stats agregadas de todas las ligas. Es un diferenciador fuerte pero requiere verificación de identidad; NO entra ahora.

#### N4. 🟠 Planes y límites — schema + enforcement (E:Medio)

> ✅ **Implementado (2026-07-05):** modelos `Plan`/`Subscription` (migración `planes_y_pagos`), seed idempotente con FREE/PRO/PREMIUM ([prisma/seed.js](prisma/seed.js) — **precios placeholder: $0/$15.000/$25.000 ARS, editarlos ahí o en BD**). [lib/planLimits.ts](lib/planLimits.ts): suscripción FREE auto-creada, plan efectivo (vencida → límites FREE sin ocultar datos), `assertPlanLimit` aplicado en crear torneo (402) y agregar equipo a torneo (402), `hasFeature()` listo para exportPdf/branding/liveMatch. **Enforcement de `maxMembers` ✅ (N6):** aplicado en `POST /api/org/members`, cuenta miembros + invitaciones pendientes → 402. **Pendiente:** UI de upsell linda ante el 402 (hoy toast/aviso con el mensaje; el wizard y `/admin/miembros` ya muestran un banner con link a planes).

- [x] **Qué:** modelo de planes con límites, sin pasarela todavía.
  ```prisma
  model Plan {
    id            String  @id @default(uuid())
    code          String  @unique  // FREE | PRO | PREMIUM
    name          String
    priceMonthly  Decimal @db.Decimal(10,2)
    currency      String  @default("ARS")
    maxActiveTournaments Int      // FREE: 1
    maxTeamsPerTournament Int     // FREE: 12
    maxMembers    Int             // FREE: 2
    features      Json            // { "exportPdf": false, "customBranding": false, "liveMatch": false, ... }
    isActive      Boolean @default(true)
    order         Int     @default(0)
  }

  model Subscription {
    id             String   @id @default(uuid())
    organizationId String   @unique
    planId         String
    status         SubStatus // ACTIVA | VENCIDA | CANCELADA
    currentPeriodEnd DateTime? // null = FREE sin vencimiento
    createdAt      DateTime @default(now())
    updatedAt      DateTime @updatedAt
    payments       Payment[]
  }
  ```
  - **Sugerencia de planes iniciales:** FREE (1 torneo activo, 12 equipos/torneo, 2 miembros, marca "Powered by GOLAZO" en páginas públicas) / PRO (torneos ilimitados, 30 equipos, 10 miembros, export PDF, sin marca) / PREMIUM (todo + branding propio de la liga + live match center cuando exista). Precios los definís vos; el schema no los hardcodea.
  - **Enforcement:** helper único `assertPlanLimit(orgId, "createTournament" | "addTeam" | "addMember")` llamado en los endpoints de creación; devuelve 402 con mensaje de upsell. Features por flag: `hasFeature(orgId, "exportPdf")`. Los límites se leen del Plan, nunca se copian a la org (cambiar un plan actualiza a todos sus clientes).
  - **Vencimiento:** job/check on-read — si `currentPeriodEnd < now` → status VENCIDA → la org pasa a límites de FREE (no se borra nada; solo se bloquea crear). Nunca ocultar datos ya cargados: es la mejor política de retención.

#### N4b. 🔴 Auditoría de límites de plan — caminos que los esquivaban (2026-07-14)

> Pasada completa sobre **cada límite contra todos los caminos que lo cruzan**, no solo el de creación. Disparada por el hallazgo de `addTeamToTournament`. Resultado: **4 bypasses reales, todos corregidos**; el conteo mal era el menos grave.

| Límite | Estado | Hallazgo |
|---|---|---|
| `maxTeamsPerTournament` | ✅ corregido | Contaba `RECHAZADO`/`PENDIENTE`; y **el camino del delegado no lo consultaba nunca** (ver S3) |
| `maxActiveTournaments` | ✅ corregido | **Dos bypasses** (abajo) |
| `maxMembers` | ✅ sano | Aceptar una invitación es neutro (miembro +1, invitación pendiente −1); cambiar de rol no suma |
| features (`hasFeature`) | ⚠️ ver abajo | No se aplica en ningún lado — pero porque las features no existen |

**Los dos bypasses de `maxActiveTournaments`** (ambos: el límite se consume en una transición que nadie miraba):
1. **Reactivar un archivado.** `PATCH /api/tournaments/[id]` acepta `status` y no chequeaba el plan. Con FREE (1 torneo activo): archivar el que tenías → deja de contar → crear uno nuevo → volver el archivado a `ACTIVO` = **2 activos con plan de 1**.
2. **Restaurar un eliminado.** El endpoint de restore (que agregué yo en F4 para el "Deshacer") devuelve `deletedAt: null`, y el conteo filtra `deletedAt: null` → el torneo vuelve a contar. Mismo truco: eliminar → crear → restaurar.

**La corrección de fondo:** se extrajo `isActiveTournamentStatus()` — la regla de "qué torneo ocupa cupo" ahora la comparten **el conteo y los tres caminos que activan** (crear, reactivar, restaurar). Cuando la sabía solo el conteo, cualquier camino nuevo la esquivaba sin que nadie lo notara. Un estado desconocido cuenta como activo a propósito: cobrar de más se corrige, regalar el producto no se detecta. +8 tests.

**⚠️ Features de pago: no es un bypass, es un problema peor.** `hasFeature()` existe y **no lo llama nadie** — porque `exportPdf` (S8), `liveMatch` (S6) y `customBranding` **no están construidas**. El riesgo real: la landing (`pricing-section`) **las anuncia** si el admin las tilda en `/admin/planes`, o sea vender algo que no se puede entregar. Se agregó un aviso en esa pantalla para que nadie las active por error. `hasFeature` queda como el punto de enforcement listo para cuando S6/S8 lleguen.

#### N5. 🟠 Pagos manuales con comprobante (E:Medio)

> ✅ **Implementado (2026-07-05):** modelo `Payment` (con `planId` del plan pagado, `method`/`externalId` MP-ready). API: `POST /api/payments` (solo OWNER/admin; monto calculado server-side), `GET /api/payments` (admin: todos; organizador: su org), `PATCH /api/payments/[id]` (admin aprueba/rechaza; aprobar activa plan + extiende vencimiento en transacción), `GET /api/plans`, `GET /api/org/subscription` (plan efectivo + uso). Páginas: [/admin/plan](app/admin/plan/page.tsx) (plan actual, uso, contratar con comprobante vía Cloudinary `pagos/comprobantes`, historial) y [/admin/pagos](app/admin/pagos/page.tsx) (cola admin con comprobante, aprobar/rechazar con motivo). Sidebar actualizado a roles nuevos + links Plan/Pagos.
> **Pendientes de N5:** (1) alias/CBU de transferencia hardcodeado como "GOLAZO.PAGOS" en la página de plan — mover a env/config con el dato real; (2) ✅ **hecho en S5 (2026-07-17):** notificación al admin al informar pago y al OWNER al aprobar/rechazar (con el motivo del rechazo, que es lo que necesita para corregirlo); (3) los comprobantes en Cloudinary son URL pública no listada — evaluar delivery privado/URL firmada; (4) integración Mercado Pago (webhook → Payment APROBADO).

- [x] **Qué:** flujo completo sin pasarela, diseñado para enchufar Mercado Pago después sin migrar.
  ```prisma
  model Payment {
    id             String   @id @default(uuid())
    subscriptionId String
    amount         Decimal  @db.Decimal(10,2)
    currency       String   @default("ARS")
    periodMonths   Int      @default(1)   // cuántos meses paga
    method         PayMethod // TRANSFERENCIA | EFECTIVO | MERCADOPAGO
    status         PayStatus @default(PENDIENTE) // PENDIENTE | APROBADO | RECHAZADO
    receiptUrl     String?   // comprobante (Cloudinary, carpeta pagos/comprobantes)
    receiptPublicId String?
    externalId     String?   // ID de MP cuando exista
    notes          String?   // nota del organizador
    reviewNotes    String?   // motivo de rechazo del admin
    reviewedById   String?
    reviewedAt     DateTime?
    createdAt      DateTime @default(now())
  }
  ```
  - **Flujo:** OWNER elige plan → página muestra datos de transferencia (alias/CBU) → sube comprobante → `Payment PENDIENTE` → notificación al admin → admin aprueba (extiende `currentPeriodEnd` += periodMonths y activa) o rechaza con motivo → notificación al OWNER.
  - **Páginas nuevas:** `/admin/pagos` (cola con comprobante visible, aprobar/rechazar) y `/org/plan` (plan actual, vencimiento, historial de pagos, subir comprobante).
  - **Mercado Pago después:** mismo modelo — webhook de MP crea `Payment` con `method: MERCADOPAGO, status: APROBADO, externalId` y extiende el período. Cero migración.
  - ⚠️ Agregar carpeta `pagos/comprobantes` a `ALLOWED_UPLOAD_FOLDERS` (C4) y que el comprobante NO sea público (usar delivery privado de Cloudinary o guardarlo con URL firmada).

#### N6. 🟠 Onboarding de organizador — "Creá tu liga" (E:Medio)

> ✅ **Implementado (2026-07-08):** modelo `OrganizationInvite` (email + rol + estado PENDIENTE/ACEPTADA/CANCELADA, `@@unique([organizationId, email])`, migración `20260706120000_organization_invites`). **APIs:** `GET/PATCH /api/org` (perfil de la liga, PATCH solo OWNER, regenera slug al cambiar nombre); `GET/POST /api/org/members` (invitar por email — si ya tiene cuenta se suma directo, si no queda invitación pendiente); `PATCH/DELETE /api/org/members/[id]` (cambiar rol / quitar, nunca al OWNER); `DELETE /api/org/invites/[id]` (cancelar). **Guards nuevos en [lib/orgAuth.ts](lib/orgAuth.ts):** `isOrgOwner`, `acceptPendingInvites` (auto-acepta invitaciones al entrar), `uniqueSlug` exportado. **Enforcement `maxMembers`:** `assertPlanLimit(org, "addMember")` cuenta miembros + invitaciones pendientes → 402 con upsell (cierra el pendiente de N4). **Wizard [/crear-liga](app/crear-liga/CrearLigaWizard.tsx)** de 3 pasos (liga → primer torneo opcional → invitar equipo) con pantalla de éxito; `validatePanelAccess` redirige a `/crear-liga` a quien no tiene liga; sign-up ahora aterriza ahí directo. **Panel [/admin/miembros](app/admin/miembros/MembersClient.tsx)** (lista, invitar, cambiar rol, quitar, cancelar invitaciones) + link en sidebar. **Landing:** CTAs reales `→ /crear-liga` (hero "Creá tu liga gratis", CTA final), pricing dinámico con los **3 planes reales leídos de la BD** ([pricing-section.tsx](components/sections/pricing-section.tsx)) + **FAQ**; corregido el copy falso "14 días de prueba" → "Plan gratis para siempre" (coherente con freemium). Carpeta `organizaciones/logos` agregada a `ALLOWED_UPLOAD_FOLDERS`. Build ✅, 21 tests ✅, lint ✅.
> **Pendientes/siguientes:** (1) email real de invitación (hoy la invitación existe pero no se envía email — **sigue pendiente después de S5**: ya hay transporte (`sendEmail`, Resend), pero la campana no sirve acá porque el invitado todavía no tiene cuenta; hay que armarle el mail con el link de alta); (2) reenviar invitación y ver fecha de expiración; (3) ✅ **hecho en N14c (2026-07-16):** el rol de org se expone en el panel (`getMyOrgRole` → sidebar/palette ocultan Plan/Miembros, y esas páginas redirigen a no-OWNER); (4) transferir propiedad de la liga a otro miembro.

- [x] **Qué:** el camino USUARIO → OWNER con la menor fricción posible.
  - **Freemium self-service (D7):** cualquier USUARIO crea su organización GRATIS (plan FREE) sin aprobación manual. La org se auto-crea en el primer uso (`getOrCreateOwnOrg`) y el wizard la completa. Prueba con 1 torneo real y paga al chocar con los límites.
  - Wizard: nombre de la liga (+ localidad/logo/contacto) → primer torneo (nombre, formato, fecha — omitible) → invitar co-organizadores/colaboradores (omitible) → panel.
  - CTAs en landing: "Creá tu liga gratis" (hero + CTA final) + pricing con los 3 planes reales + FAQ.
  - El registro común queda como está (USUARIO): puede seguir torneos y ver todo lo público; el upsell a crear liga está en la landing y en `/crear-liga`.

#### N7. 🟠 Configuración deportiva por torneo (E:Medio) — cierra WALKOVER de C6

> ✅ **Implementado (2026-07-08):** **Schema** (migración `20260708120000_configuracion_deportiva`, aplicada a la BD): `Tournament.pointsWin/pointsDraw/pointsLoss` (3-1-0 default), `walkoverScore` (3 default), `tiebreakers Json?`; `Match.walkoverWinnerTeamId` con relación a TournamentTeam. **Módulo nuevo [lib/standings/config.ts](lib/standings/config.ts):** `PointsConfig`, criterios de desempate `PTS/DIF/GF/GA/WINS`, `normalizeTiebreakers` (PTS siempre primero, filtra basura) y `makeStandingsComparator` (comparador único de tabla). **Standings:** `calculateTeamStats` recibe los puntos del torneo en vez de 3-1-0 fijo; `applyMatchResult`/`recalculateTournamentStandings` propagan la config (recálculo lee los puntos del torneo). **Sort unificado:** `StandingsTable` y `groupTeamsByGroup` usan el comparador con los `tiebreakers` del torneo, enhebrados desde las páginas pública y admin. **WALKOVER (cierra C6):** [lib/standings/walkover.ts](lib/standings/walkover.ts) `resolveWalkover` — el organizador solo marca el ganador y el server fija `walkoverScore`-0 (POST y PATCH de `/api/matches`); ya no se carga el 3-0 a mano. **UI:** sección "Configuración deportiva" en el form de torneo (puntos, walkoverScore, preset de desempate) y en el diálogo de partido un selector de ganador que aparece al elegir estado WALKOVER (oculta el marcador manual y explica el auto 3-0); validación extra "un equipo no puede jugar contra sí mismo". **Tests:** +14 (config + walkover), 35 en total ✅. Build ✅, tsc ✅, lint ✅.
> **Pendientes/siguientes:** (1) H2H (head-to-head) y FairPlay como criterios de desempate — el vocabulario los contempla pero requieren cruzar partidos/tarjetas; FairPlay llega con N8. (2) UI de tiebreakers hoy es un preset de 3 opciones; un reordenamiento libre (drag) queda para F3. (3) el marcador de walkover no distingue ida/vuelta.

- [x] **Qué:** sacar las reglas hardcodeadas del código y llevarlas al torneo.
  - `Tournament`: `pointsWin`/`pointsDraw`/`pointsLoss`, `tiebreakers Json` (orden de criterios: PTS, DIF, GF, GA, WINS; H2H/FairPlay pendientes), `walkoverScore`.
  - `Match.walkoverWinnerTeamId`: el organizador marca el ganador y el server fija el marcador automáticamente (cierra el pendiente de C6; la UI deja de exigir cargar 3-0 a mano).
  - `calculateTeamStats` recibe la config del torneo en vez de 3-1-0 fijo; el orden de la tabla usa `tiebreakers`.
  - Esto habilita multi-deporte después (S10): básquet/vóley solo cambian puntos y desempates.

#### N8. 🟡 Sanciones automáticas (E:Medio)

> ✅ **Implementado (2026-07-08):** **Schema** (migración `20260708150000_sanciones_automaticas`, aplicada a la BD): `Tournament.yellowsForSuspension` (5 default), `matchesPerRedCard` (1 default) — 0 desactiva; modelo `Suspension` (reason ACUMULACION/ROJA/MANUAL, totalMatches/servedMatches/isActive, triggerDate, `sourceCardId @unique` + `accumulationIndex` como claves de dedupe). **Motor idempotente** (mismo patrón que el recálculo de standings): [lib/suspensions/rules.ts](lib/suspensions/rules.ts) reglas puras testeadas (amarillas de acumulación excluyendo las de un partido con roja para evitar triple castigo; suspensión por cada roja; fechas cumplidas = partidos FINALIZADOS del equipo posteriores al evento) y [lib/suspensions/engine.ts](lib/suspensions/engine.ts) `recomputeTournamentSuspensions` (reconcilia automáticas desde las tarjetas + recalcula servedMatches/isActive de TODAS, preservando las MANUAL). **Hooks:** recompute al cargar/borrar tarjeta ([cards.ts](modules/partidos/actions/cards.ts)) y al crear/editar partido que entra o sale de FINALIZADO (POST/PATCH de `/api/matches`). **Query + acciones:** `getTournamentSuspensions` y `createManualSuspension`/`cancelManualSuspension` (roles gestores) en [suspensions.ts](modules/torneos/actions/suspensions.ts). **UI config:** amarillas/roja en la sección "Configuración deportiva" del form de torneo. **Vista pública "Sancionados"** en el tab Estadísticas del torneo + sección admin con alta/cancelación manual ([AdminSuspensionsSection](modules/torneos/components/admin/AdminSuspensionsSection.tsx)). **Warning al organizador:** `addGoal`/`addCard` devuelven `suspendedWarning` y la UI avisa (toast, no bloquea) si se alinea a un suspendido. **Tests:** +13 (motor de reglas), 48 en total ✅. Build ✅, tsc ✅, lint ✅. **Aporta el criterio FairPlay que N7 dejó pendiente** (ya hay tarjetas por jugador para desempatar).
> **Pendientes/siguientes:** (1) "cumplida" asume que el suspendido no juega los partidos posteriores del equipo (no hay planilla de asistencia); si el club lo alinea igual, el warning avisa pero no se detecta como violación. (2) Cancelar/perdonar una suspensión **automática** requiere un flag `pardoned` que el recompute respete (hoy solo se quitan borrando la tarjeta origen; sí se cancelan las MANUAL). (3) ✅ **hecho en S5 (2026-07-17):** se notifica **al delegado** (no al jugador: es quien arma el equipo y quien puede evitar que lo alineen), y **solo cuando la suspensión es nueva** — el motor recalcula en cada carga de resultado, así que avisar sin comparar contra las que ya existían habría re-notificado lo mismo cada vez. (4) FairPlay como criterio de desempate en la tabla aún no está cableado en el comparador (N7).

#### N9. 🟡 Slugs y URLs públicas compartibles (E:Bajo)

> ✅ **Implementado (2026-07-08):** **Util compartido [lib/slug.ts](lib/slug.ts):** `slugify` (minúsculas, sin acentos, ≤60), `uniqueOrganizationSlug` y `uniqueTournamentSlug` con desambiguación real `-2`/`-3`… (ya no sufijo aleatorio); `orgAuth` refactorizado para reusarlo (elimina la duplicación de N6). **Schema** (migración `20260708170000_tournament_slug`, aplicada + backfill): `Tournament.slug` con `@@unique([organizationId, slug])` (único por org); [prisma/backfill-tournament-slugs.js](prisma/backfill-tournament-slugs.js) completó los existentes (1 torneo → `categoria-a`). **Generación:** POST de torneo setea slug; PATCH lo completa si falta pero **no lo cambia al renombrar** (mantiene estables los links compartidos). **Rutas:** `/liga/[slug]` (página de liga: perfil + botón WhatsApp + grilla de torneos) y `/liga/[slug]/[torneo]` (URL canónica del torneo), ambas con `generateMetadata` OG/Twitter (prep S4). **Redirect:** `/torneos/[id]` (UUID legacy) redirige a la URL canónica si el torneo tiene slug. **Refactor sin duplicar:** el detalle de torneo (~950 líneas) se extrajo a [TournamentDetailView](modules/torneos/components/TournamentDetailView.tsx) que ambas rutas renderizan. **Resolvers:** `getTorneoBySlug`/`getTournamentMetaBySlug`/`getTournamentCanonicalPath` y `getOrganizationBySlug`. **Tests:** +6 (slugify), 54 en total ✅. Build ✅, tsc ✅, lint ✅.
> **Pendientes/siguientes:** (1) ✅ **hecho (2026-07-13, F2):** `/torneos` enlaza directo a la canónica vía `tournamentPublicPath` (`getTorneos` incluye `organization.slug`); quedan FanHome/FavoritesTab/`/partidos` por UUID (ver F2). (2) Falta redirigir `/torneos/[id]` con **301 permanente** explícito (hoy `redirect()` de Next = 307); evaluar `permanentRedirect`. (3) Slug editable a mano por el organizador (hoy solo automático). (4) La página de liga no distingue estado SUSPENDIDA de la org (muestra igual, por política de retención). Habilita S4: QR + compartir por WhatsApp + OG image dinámica.

#### N10. 🟡 Vistas y páginas faltantes por rol (E:Alto, iterativo)

> ✅ **Avance (2026-07-12):** auditoría completa del estado real vs. lo pedido (mucho ya existía y no estaba documentado: torneo público con tabla/fixture/resultados/goleadores/tarjetas/sancionados en [TournamentDetailView](modules/torneos/components/TournamentDetailView.tsx), página de equipo y de jugador, gestión de miembros, plan del organizador, cola de pagos del admin). De los gaps reales se resolvió el top 3 por valor/costo:
> 1. **Carga rápida de resultados mobile-first** (antes: 2 diálogos con 3 tabs separadas — "editar" para el marcador y "detalles" para goles/tarjetas/árbitros en pestañas distintas). Nueva pantalla única `/admin/partidos/[id]/cargar` ([page.tsx](app/admin/partidos/[id]/cargar/page.tsx) + [QuickMatchLoader.tsx](app/admin/partidos/[id]/cargar/QuickMatchLoader.tsx)): marcador con steppers táctiles (44px, sticky mientras se scrollea) + estado del partido + walkover, y debajo Goleadores/Tarjetas reutilizando `ManageGoals`/`ManageCards` existentes (sin duplicar lógica). Acceso con `canManageOrg(..., allowCollaborator: true)` — un COLABORADOR puede cargar resultados sin ser dueño de la org. Enlazada como acción principal desde `/admin/partidos` (antes tenía un ítem de menú "Cargar Resultado" que por bug abría el mismo diálogo que "Editar Detalles" — corregido de paso) y desde la tabla de partidos del detalle de torneo.
> 2. **Dashboard del organizador con datos reales** (antes: 100% hardcodeado, mismo contenido estático para cualquier org). Nuevo [getOrgDashboardData](modules/organizaciones/actions/getOrgDashboardData.ts) + [app/admin/dashboard/page.tsx](app/admin/dashboard/page.tsx): torneos/equipos/jugadores activos, **resultados sin cargar** (partidos ya jugados sin marcador, con botón directo a la pantalla de carga rápida — cierra el loop con el punto 1), próximos 5 partidos, y estado del plan (reusa `getEffectivePlan`/`getOrCreateSubscription` de [lib/planLimits.ts](lib/planLimits.ts), misma fuente que `/admin/plan`). Si el usuario no tiene organización (caso ADMINISTRADOR sin liga propia) muestra un estado vacío honesto con accesos a Usuarios/Torneos/Pagos en lugar de métricas SaaS falsas (esas quedan pendientes, ver abajo).
> 3. **Búsqueda por localidad** en el directorio público de torneos ([FiltroTorneos.tsx](modules/torneos/components/FiltroTorneos.tsx)): el placeholder ya prometía "buscar por ubicación" pero el filtro de texto no incluía `tournament.locality` (bug cerrado) + se agregó un selector dedicado de localidad (opciones derivadas de los torneos listados) con su chip en los filtros activos.
>
> Verificado: `tsc --noEmit` limpio, `next build` completo en verde (63 rutas), lint sin errores en los archivos nuevos, smoke test en dev server (`/torneos` 200 con el filtro de localidad renderizado, rutas `/admin/*` correctamente gateadas por Clerk).

- [~] **Público (no logueado):** directorio de ligas/torneos activos ✅ con búsqueda por localidad (2026-07-12); página de torneo (tabla, fixture, resultados, goleadores, tarjetas, sancionados) ✅ ya estaba completa; página de equipo (plantel, historial) ✅; página de jugador (stats por torneo) ✅. **Pendiente:** SEO-first (M3, `generateMetadata`/JSON-LD dinámico) no se auditó en esta pasada; sigue en M3.
- [~] **USUARIO logueado:** ✅ **Implementado (2026-07-13):** modelo `Favorite` (migración `20260713024328_favorites`) — un usuario sigue un torneo o un equipo (exactamente uno de los dos FK, validado en la capa de acciones; los `@@unique([userId, tournamentId])`/`@@unique([userId, teamId])` no chocan entre sí porque Postgres no considera dos NULL iguales). [modules/favoritos/actions/favorites.ts](modules/favoritos/actions/favorites.ts): `toggleFavoriteTournament`/`toggleFavoriteTeam`, `getUserFavorites`, `getFavoritedIds`. Componente `FollowButton` ([modules/favoritos/components/FollowButton.tsx](modules/favoritos/components/FollowButton.tsx), 3 variantes: `icon`/`full`/`hero` para fondos oscuros fijos) integrado en el header público de torneo (`HeaderTorneo.tsx`) y de equipo (`PublicTeamHeader.tsx`) — si no hay sesión, redirige a `/sign-in` en vez de fallar. **Home personalizado** (`app/page.tsx`): si el usuario está logueado, `/` deja de mostrar la landing de marketing y muestra `FanHome` (torneos/equipos seguidos con opción de dejar de seguir, CTA permanente "Creá tu liga" o "Ir a mi panel" según si ya tiene organización, accesos rápidos de descubrimiento) — la landing sigue intacta para visitantes anónimos. **Perfil**: nueva tab "Favoritos" en `/profile` con la misma lista.
  - **Pendiente:** notificaciones **al hincha por sus favoritos** (que un torneo/equipo seguido juegue o cargue resultado). S5 ya dejó la base (`notify()` + campana + preferencias), pero el aviso al hincha **no está cableado**: hoy el resultado se le notifica al delegado, no al seguidor. Falta un tipo nuevo y resolver destinatarios desde `Favorite`.
- [~] **Organizador (panel org):** dashboard con datos reales ✅ (2026-07-12, ver arriba); **carga rápida de resultados mobile-first** ✅ (2026-07-12, ver arriba); gestión de miembros ✅ ya existía ([app/admin/miembros](app/admin/miembros/page.tsx)); plan ✅ ya existía en `/admin/plan` (el TODO original decía `/org/plan`, quedó bajo el panel unificado — no amerita mover la ruta).
- [~] **Admin (vos):** cola de pagos ✅ ya existía (`/admin/pagos`, aprobación).
  - ✅ **Implementado (2026-07-12):** **Listado de organizaciones** [/admin/organizaciones](app/admin/organizaciones/page.tsx) (`GET /api/admin/organizations`): plan efectivo, estado de suscripción (con badge si VENCIDA), último pago, miembros y torneos por org, con búsqueda por nombre/slug/localidad. **Suspender/reactivar** (`PATCH /api/admin/organizations/[id]`, confirmación con `AlertDialog`) — usa el `OrgStatus` que ya existía en el schema pero no tenía UI; `requireApiOrgContext` (lib/orgAuth.ts) ya bloqueaba crear/mutar recursos a orgs `SUSPENDIDA` desde antes, así que la acción tiene efecto real de inmediato. **Métricas SaaS** (`GET /api/admin/metrics`, tarjetas en la misma página): organizaciones activas/suspendidas/nuevas (30 días), conversión FREE→pago, ingresos del mes (suma de `Payment` `APROBADO`), torneos creados (total y del mes). **CRUD de planes** [/admin/planes](app/admin/planes/page.tsx) (`GET/POST /api/admin/plans`, `PATCH /api/admin/plans/[id]`): crear/editar precio, límites (torneos/equipos/miembros), features (`exportPdf`/`customBranding`/`liveMatch`) y activar/desactivar — el plan `FREE` no se puede desactivar (server-side, es el fallback de `getFreePlan()` en [lib/planLimits.ts](lib/planLimits.ts) para toda organización sin suscripción vigente). Sidebar: ítems "Organizaciones" y "Planes" agregados (roles `["ADMINISTRADOR"]`).
  - ✅ **"Ver como organización" implementado (2026-07-13, junto con el cierre de N3):** botón "Ver como" en `/admin/organizaciones` → cookie + banner de salida en el layout admin; listados y dashboard del panel quedan scopeados a esa org. Ver detalle en N3.

#### N11. 🟡 Limpieza y completitud del schema (E:Medio, misma migración que N2/A6/M13)

- [x] Eliminar el modelo legacy `Phase` + `Match.phaseId` + `Tournament.phaseId` (BD reseteada; ruta `/api/phases`, seed y selects de fase legacy eliminados; los dialogs de partido usan `tournamentPhaseId` con las fases del torneo).
- [x] `TournamentPhase.type`: String → enum `PhaseType (LEAGUE|GROUP|KNOCKOUT)`.
- [x] `Team.yearFounded`: String? → Int?.
- [x] `Player.nationalId String?` (DNI) con `@@unique([organizationId, nationalId])`.
- [x] `Goal.assistTeamPlayerId String?` (asistencias — falta UI de carga).
- [x] `TeamPlayer.isCaptain Boolean @default(false)` (falta UI).
- [x] `TournamentTeam.registrationStatus` enum (`INSCRIPTO` default | `PENDIENTE` | `RECHAZADO`).
- [x] `deletedAt` agregado a Player y News (falta aplicar soft delete + filtros en sus rutas, hoy solo torneos/árbitros lo usan).
- [x] Revisar `TournamentFormat`: marcar qué formatos soporta realmente el generador de fixture (S1) y ocultar el resto en la UI (evita torneos "SUIZO" que nada implementa). **Hecho en S1 (2026-07-14):** [lib/fixture/formats.ts](lib/fixture/formats.ts) mapea los 10 formatos con generador y declara el motivo de los 4 que no; `tournamentFormatOptions()` los oculta del selector conservando el formato de torneos viejos. El enum del schema no se tocó (los valores heredados siguen siendo válidos para datos existentes).
- ⚠️ (Hallazgo 2026-07-05) No existe UI para crear/gestionar `TournamentPhase`: el selector de fase en partidos solo aparece si el torneo tiene fases. Agregar CRUD de fases del torneo (va con F3 o S1).

#### N12. 🟢 Identidad global de jugador cross-liga (E:Alto, post-N2, diferenciador futuro)

> ✅ **Base implementada (2026-07-14, decisión del product owner al definir el plantel del delegado).** La ficha de jugador dejó de pertenecer a una liga: **una ficha por persona en toda la plataforma**, identificada por su DNI.
> - **Migración `20260716122751_jugador_identidad_global`** (escrita a mano, no generada: `prisma migrate dev` avisaba de pérdida de datos y el backfill había que decidirlo). `Player.organizationId` **eliminado**; `nationalId` pasa a `NOT NULL` + `@unique` global. El único jugador que existía sin DNI se backfilleó con `SIN-DNI-{id8}` — un marcador **visiblemente temporal y único** en vez de inventar un documento que parezca real: la liga lo ve roto y lo corrige. Si dos fichas de ligas distintas hubieran compartido DNI, el índice único aborta la migración sin escribir nada (fusionar fichas es decisión de negocio, no un UPDATE a ciegas).
> - **La ficha no tiene dueño.** Qué jugadores ve una liga se **deriva de la participación** (`TeamPlayer → TournamentTeam → Tournament`), no de un `organizationId`. Nuevo [lib/playerAuth.ts](lib/playerAuth.ts): `playerOrgScopeWhere`, `canEditPlayer`, `logPlayerChange`. Migrados los 6 consumidores (`getJugadores`, `/api/players` GET+POST+PATCH, `players.ts` actions, dashboard de org, buscador del panel). **Bug latente encontrado de paso:** el buscador del panel spreadeaba `orgScopeWhere` sobre `Player` — `tsc` lo aceptaba (el spread pierde el tipo) pero habría reventado en runtime.
> - **Historial de cambios** (decisión del owner: cualquier delegado con el jugador en su plantel puede editar, así que tiene que quedar rastro): cada edición escribe en el `AuditLog` que **ya existía** un diff `{campo: {de, a}}` con el usuario. Solo los campos que cambiaron; las fechas se comparan por valor y no por referencia (si no, todo cambio de fecha parecería real).
> - **DNI normalizado** ([validators/player.ts](lib/validators/player.ts)): "12.345.678" y "12345678" son el mismo documento — sin eso el índice único no sirve para nada. +11 tests.
> - ⚠️ **Privacidad (Ley 25.326):** con identidad global, buscar un jugador es buscar en toda la plataforma. La búsqueda del delegado exige **DNI exacto** (no parcial, no por nombre) y devuelve lo mínimo para confirmar identidad. Quien tiene el documento en la mano ya sabe el DNI; quien no, no puede pescar. **Endurecerlo (pedir también fecha de nacimiento) queda pendiente si el negocio lo exige.**

- [x] **El jugador reclama su propia ficha (2026-07-14).** Modelo `PlayerClaim` + `/mi-ficha`: el jugador busca su ficha **por DNI exacto** (su propio documento es la prueba de identidad más razonable que hay), y quien es responsable de esa ficha confirma que es él. Aprobado, ve su **trayectoria cruzando todas las ligas** (torneos, goles, tarjetas) y puede gestionar sus datos.
  - **Quién aprueba: los responsables de la ficha** — la liga donde juega, el delegado que lo tiene en su plantel, o quien la cargó. Es exactamente `canEditPlayer`, y no por casualidad: es la gente que puede reconocerlo. La plataforma no tiene forma de verificar que ese usuario es esa persona; quien lo conoce, sí. **Nadie puede autoaprobarse**: un reclamo PENDIENTE no da permiso sobre la ficha.
  - **Una ficha, un dueño.** Prisma no permite un índice único parcial ("único entre los APROBADO"), así que la regla se sostiene en `approvePlayerClaim` y se re-verifica al aprobar.
  - `canEditPlayer` ahora incluye al dueño de la ficha: son sus datos. El historial (`AuditLog`) registra sus cambios igual que los de cualquier otro.
  - **Enum unificado:** `TeamManagerStatus` → **`ApprovalStatus`**, compartido por los dos flujos de aprobación (delegado de equipo y reclamo de ficha) — es el mismo concepto y merecía un solo vocabulario. Renombrado con `ALTER TYPE ... RENAME` (Prisma lo habría resuelto tirando el tipo y la columna).
  - **Cuarta puerta en `/bienvenida`:** "Juego en una liga" → `/mi-ficha`. La bandeja del panel pasó a llamarse **Solicitudes** (delegados + inscripciones + reclamos de ficha), que es lo que de verdad es.
- [ ] **Falta de N12:** el **carnet digital con QR** (verificación anti-suplantación en la cancha). La **política de privacidad** ✅ ya existe (2026-07-17, ver A10): `/privacidad` cubre DNI de menores y mayores, Ley 25.326 y leyenda AAIP — pendiente solo la revisión por un profesional legal antes del lanzamiento.

#### N13. 🔴 El delegado de equipo y el flujo de alta — prerequisito de S3 (E:Alto)

> **Definido con el product owner (2026-07-14)** al analizar S3. Diagnóstico: el modelo tenía **tres personas reales pero solo dos puertas**.

**El hueco encontrado**

Los permisos vivían en dos ejes y **los dos son del lado de la liga**: `UserRole` (ADMINISTRADOR/USUARIO) y `OrgRole` (OWNER/ORGANIZADOR/COLABORADOR, todos personal de la liga). **No existía el delegado**: nadie representa a un equipo. Y el alta empujaba a todos al lugar equivocado — `GoogleSignUp` tenía `forceRedirectUrl="/crear-liga"` y `validatePanelAccess` redirige ahí a cualquiera sin liga, así que **un delegado que se registraba recibía "creá tu liga"**, el producto equivocado, sin más salida que volver al home a mano.

| Persona | Qué quiere | Estado previo |
|---|---|---|
| Hincha | Seguir a su equipo | ✅ FanHome con favoritos |
| Organizador | Gestionar su liga | ✅ `/crear-liga` + `/admin` |
| **Delegado** | Anotar su equipo y cargar el plantel | ❌ **no existía** |

**Decisión 1 — el delegado NO es `OrganizationMember`.** La tentación era sumar `DELEGADO` a `OrgRole` y reusar todo. No conviene, y no es estético: **todas las consultas del panel se acotan con `getPanelOrgIds()`, que devuelve organizaciones**. Un delegado que fuera miembro vería *todos* los equipos y jugadores de la liga entera; habría que agregar filtro por equipo a cada query del panel — la fuga de N3 otra vez. El delegado no trabaja para la liga: **representa a un equipo**, así que su permiso cuelga del equipo.

- Modelo nuevo **`TeamManager`** (usuario ↔ equipo, estado `PENDIENTE`/`APROBADO`/`RECHAZADO`). Al no ser miembro, `getPanelOrgIds()` le devuelve `[]` y no ve nada de la liga por accidente.
- Área propia **`/mi-equipo`**, no `/admin`.

**Decisión 2 — cómo se llega a ser delegado.** Los dos caminos son el mismo flujo con distinta entrada, y **siempre los aprueba la liga** (si no, cualquiera se declara delegado de cualquier equipo):
1. Elige liga → **reclama un equipo existente** → la liga aprueba.
2. Elige liga → **propone un equipo nuevo** → se crea con `enabled: false` (que ya significa "existe pero no se puede usar", regla de F3) → al aprobar queda habilitado. Si se rechaza, el equipo se borra: todavía no tiene historial.

**Decisión 3 — qué puede hacer el delegado aprobado.** Cargar y editar el plantel de **su** equipo, inscribirlo en torneos abiertos y ver su fixture. **No toca resultados, goles ni tarjetas**: eso es de la liga, y es lo que hace confiable a la tabla (para reportes desde el equipo ya existe `COLABORADOR`).

**Decisión 4 — alta con tres puertas.** Sign-up deja de forzar `/crear-liga` y aterriza en **`/bienvenida`**: *sigo a mi equipo* (hincha, salida por defecto), *represento a un equipo* (delegado) y *organizo una liga* (el wizard actual de N6). Se elige una vez y se puede cambiar después.

**Por qué esto desbloquea S3:** con el delegado ya identificado y aprobado, la inscripción es inscribir su equipo en un torneo abierto y que la liga apruebe — con `RegistrationStatus.PENDIENTE`/`RECHAZADO`, que **ya están en el schema sin usar** desde N2, puestos justo para esto.

- [~] **Implementación — base lista (2026-07-14):**
  - **Schema:** modelo `TeamManager` + enum `TeamManagerStatus`, migración `20260716144357_delegado_de_equipo` **aplicada**. Puramente aditiva (solo `CREATE TYPE`/`CREATE TABLE`, ni un `DROP` ni `ALTER` sobre tablas existentes): no pudo perder datos. `@@unique([userId, teamId])` (una solicitud por persona y equipo; un rechazo previo se reusa al reintentar) + auditoría de la decisión (`decidedById`/`decidedAt`).
  - **Guards:** [lib/teamAuth.ts](lib/teamAuth.ts) — espejo de `orgAuth` para el otro lado del mostrador: `getManagedTeamIds`, `canManageTeam`, `requireActionTeamManager`, `requireApiTeamManager`.
  - **Acciones:** [modules/delegados/actions/requests.ts](modules/delegados/actions/requests.ts) — `requestTeamClaim` (reclamar), `requestNewTeam` (proponer, con anti-duplicado por nombre dentro de la liga), `approveTeamRequest` (habilita el equipo si era propuesta), `rejectTeamRequest` (borra el equipo propuesto **solo** si sigue sin usar: `!enabled && 0 torneos && 1 solo solicitante`; si algo cambió, se queda deshabilitado y lo resuelve la liga).
  - **Alta con tres puertas:** [/bienvenida](app/bienvenida/page.tsx). El sign-up ya **no fuerza `/crear-liga`** y `validatePanelAccess` manda al delegado a `/mi-equipo` en vez de ofrecerle crear una liga. `/bienvenida` y `/mi-equipo` protegidas en el middleware.
  - **Área del delegado:** [/mi-equipo](app/mi-equipo/page.tsx) — buscar equipo y reclamarlo, proponer uno nuevo, ver el estado de las solicitudes. Deliberadamente chica: no es `/admin`.
  - **Bandeja de la liga:** [/admin/delegados](app/admin/delegados/page.tsx) con aprobar/rechazar (distingue "equipo nuevo" de reclamo y explica en el diálogo qué pasa en cada caso). Ítem nuevo en `adminNavItems` → aparece en sidebar y command palette.
  - Verificado: `tsc` limpio, **0 errores de lint**, 118 tests ✅, `next build` verde, smoke en dev (rutas nuevas compilan; anónimo → protegidas por el middleware).
- [x] **Plantel del delegado + inscripción (2026-07-14).** El flujo completo que definió el owner: se loguea → crea/reclama equipo → **ve los torneos abiertos e inscribe su equipo** → **carga jugadores validando contra la base** → **arma la plantilla del torneo**.
  - **Inscripción (núcleo de S3):** [inscriptions.ts](modules/delegados/actions/inscriptions.ts) — el delegado pide, el `TournamentTeam` nace `PENDIENTE` (el enum `RegistrationStatus` estaba en el schema **sin usar** desde N2, puesto justo para esto) y la liga aprueba/rechaza desde `/admin/delegados`. Solo torneos en estado `INSCRIPCION`: anotarse a uno ya empezado desordena el fixture y la tabla. Se puede armar el plantel mientras la inscripción está pendiente. **Rechazar marca `RECHAZADO`, no borra**: el plantel cuelga del `TournamentTeam` con `onDelete: Cascade` y borrarlo se lo llevaría puesto.
  - 🐛 **Bug que destapó activar `RegistrationStatus`:** el **generador de fixture no lo filtraba** — un equipo con inscripción pendiente habría entrado al fixture sin que la liga dijera que sí. Corregido: solo `INSCRIPTO` genera partidos.
  - **Carga de jugadores con dedupe:** el flujo es **buscar por DNI primero**, y recién si no existe se ofrece cargar — es lo que evita el duplicado, y por eso la UI nunca muestra "crear" antes de haber buscado. Si existe, se asocia. `POST /api/players` devuelve **409 con el jugador existente** en vez de un error opaco, y el formulario del panel lo muestra **en el campo del DNI**, no en un toast que se va.
  - 🐛 **El formulario de jugador del panel no pedía DNI** (ni el campo existía en `IPlayer` — el tipo mentía otra vez, como en F3): con el DNI ahora obligatorio, crear un jugador desde el panel habría dado 400. Agregado.
  - **La regla que el schema no garantizaba:** un jugador **no puede estar en dos equipos del mismo torneo** (podría jugar contra sí mismo y sumar goles para los dos lados). El único índice, `@@unique([playerId, tournamentTeamId])`, solo evitaba cargarlo dos veces en el *mismo* equipo. Ahora se valida en `addPlayerToRoster`. Sí puede jugar varios torneos distintos — que es exactamente el motivo de que la ficha sea única y el `TeamPlayer` sea por torneo.
  - **Sacar del plantel** se niega si el jugador ya tiene goles o tarjetas en ese torneo (misma regla que §8b: `onDelete: Cascade` se los llevaría).
  - Verificado: `tsc` limpio, **0 errores de lint**, **129 tests ✅** (+11), `next build` verde, smoke en dev (`/api/players?scope=panel` anónimo → `[]`: el aislamiento N3 sigue en pie con el scoping nuevo por participación).
- [ ] **Pendientes menores de N13:** ✅ **hecho en S5 (2026-07-17):** aviso (campana + email) al aprobar/rechazar la delegación y la inscripción — antes el delegado se enteraba solo si volvía a mirar `/mi-equipo`. **Siguen pendientes:** que el delegado pueda cancelar su propia solicitud; transferir la delegación a otra persona.

#### N14. 🔴 Circuitos por tipo de usuario — auditoría integral y diseño (2026-07-16)

> Pedido del product owner (2026-07-16): validar de punta a punta cómo deberían ser los circuitos dentro de la página para cada tipo de usuario — anónimo, registrado, jugador, delegado, organizador (con plan), colaborador invitado y admin — y decidir la mejor solución donde había dudas: ¿el colaborador paga?, ¿cómo se lo limita a un torneo?, ¿el organizador crea noticias?, ¿el plan FREE asigna el rol automáticamente?
> Auditado contra el código real: [middleware.ts](middleware.ts), [lib/roleValidation.ts](lib/roleValidation.ts), [lib/orgAuth.ts](lib/orgAuth.ts), [lib/teamAuth.ts](lib/teamAuth.ts), [lib/playerAuth.ts](lib/playerAuth.ts), [/bienvenida](app/bienvenida/page.tsx), [/mi-ficha](modules/jugadores/actions/claims.ts), [/mi-equipo](app/mi-equipo/page.tsx), [/crear-liga](app/crear-liga/page.tsx), [pricing-section](components/sections/pricing-section.tsx) y [header](components/layout/header.tsx).
>
> **Conclusión general: los circuitos pedidos ya están implementados en su gran mayoría** por N1/N2 (roles), N6 (onboarding), N10 (FanHome/favoritos), N12 (ficha del jugador), N13 (delegado), S3 (inscripciones) y N4/N4b/N5 (planes/pagos). Lo que falta no son circuitos nuevos sino **cinco huecos concretos (N14a–N14e)** y **cinco decisiones de negocio que quedan fijadas (D10–D14**, sección Decisiones al final del archivo).

##### El principio rector: una cuenta, varios sombreros

`UserRole` solo distingue ADMINISTRADOR de USUARIO. Todo lo demás son **relaciones opcionales y acumulables** que la misma cuenta puede tener a la vez — y eso es una fortaleza del modelo, no un accidente:

| Sombrero | Relación en BD | Área propia | Cómo se consigue |
|---|---|---|---|
| Hincha | `Favorite` | `/` (FanHome) + `/profile` | Solo, siguiendo torneos/equipos |
| Jugador | `PlayerClaim` APROBADO | `/mi-ficha` | Reclama su ficha por DNI; aprueba el responsable de la ficha (N12) |
| Delegado | `TeamManager` APROBADO | `/mi-equipo` | Reclama o propone un equipo; aprueba la liga (N13) |
| Colaborador | `OrganizationMember` COLABORADOR | `/admin` (solo carga de resultados) | Invitado por email por la liga (N6) |
| Organizador | `OrganizationMember` ORGANIZADOR | `/admin` | Invitado por email por la liga (N6) |
| Dueño de liga | `OrganizationMember` OWNER | `/admin` + plan/pagos/miembros | Crea su liga gratis (`/crear-liga`, D7) |

Un mismo USUARIO puede ser hincha de un torneo, jugador en una liga, delegado de un equipo en otra y OWNER de la suya. Las tablas son independientes y ningún circuito bloquea a otro (verificado). El único rol exclusivo es ADMINISTRADOR (product owner). **Consecuencia de diseño:** la pregunta "¿qué rol tiene este usuario?" está mal planteada — la correcta es "¿qué sombreros tiene puestos?", y la navegación debe reflejarlo (→ N14a).

##### Circuito 1 — Visitante anónimo ✅ (funciona como se pidió)

Navega todas las páginas públicas sin fricción y hace login cuando quiere.

- **Verificado:** el middleware solo protege `/admin`, `/profile`, `/mi-equipo`, `/mi-ficha` y `/bienvenida`; los GET públicos están abiertos; toda mutación exige sesión (C8). Landing con pricing real de BD, directorio de torneos/equipos/jugadores/partidos, páginas de liga `/liga/[slug]`, ficha de partido, noticias.
- **Sin gaps de circuito.** Los pendientes en esta superficie son de calidad, no de flujo: soft-404 (F2), SEO dinámico (M3), páginas legales (A10 — que además son prerrequisito de N14b).

##### Circuito 2 — USUARIO recién registrado ✅ (las 4 puertas)

`sign-up` → `/bienvenida` → elige: *sigo a mi equipo* (`/`), *juego en una liga* (`/mi-ficha`), *represento a un equipo* (`/mi-equipo`), *organizo una liga* (`/crear-liga`). Quien ya tiene un vínculo no vuelve a elegir (redirect por prioridad: membresía → delegación → reclamo de ficha).

- ✅ Coincide con lo pedido: el primer perfil es `USUARIO` (default del schema), nace `ACTIVO` (N1), y desde ahí puede reclamar/crear su jugador, pedir ser delegado, crear equipos, pedir inscripciones o crear su liga.
- ⚠️ **Gap → N14a:** `/bienvenida` es de alta (bien), pero después del alta **no hay forma visible de ponerse otro sombrero**: el header de logueados muestra siempre "Mi Panel" → `/admin/dashboard` para *cualquier* usuario ([header.tsx:35](components/layout/header.tsx#L35)). Un hincha que toca "Mi Panel" rebota por `validatePanelAccess` a `/bienvenida` (funciona, pero el label miente); un OWNER que además juega en otra liga **no tiene ningún link a `/mi-ficha`** salvo tipear la URL.

##### Circuito 3 — Jugador (`/mi-ficha`) [~] (reclamo ✅, creación ❌)

Hoy: busca su ficha por DNI exacto → pide vincularla → aprueba el responsable (liga/delegado/creador) → ve su trayectoria cross-liga y gestiona sus datos (N12).

- ✅ Reclamo, aprobación, dueño único, trayectoria y edición auditada: implementados y correctos.
- ⚠️ **Gap → N14b:** el pedido dice "reclamar **o crear** su jugador". Si ningún club lo cargó todavía, hoy el circuito termina en un callejón: *"Cuando tu delegado te sume a un plantel vas a poder reclamar tu ficha"* ([claims.ts:92](modules/jugadores/actions/claims.ts#L92)). Falta la creación self-service (decisión D14).

##### Circuito 4 — Delegado (`/mi-equipo`) ✅ (completo)

Reclama un equipo existente o propone uno nuevo → la liga aprueba (`/admin/delegados`) → carga plantel con dedupe por DNI → inscribe el equipo en torneos abiertos (cupos + fecha límite, S3) → la liga aprueba la inscripción (con control de plan en la aprobación, N4b).

- ✅ Es exactamente el circuito pedido ("pedir ser delegado de equipos o crearlos y solicitar agregarlo a un torneo"). Sin huecos de flujo; quedan los pendientes menores de N13 (cancelar solicitud propia, transferir delegación — los avisos ya salieron en S5).

##### Circuito 5 — Organizador (OWNER/ORGANIZADOR) ✅ (el plan FREE ya hace lo pedido)

**La duda del owner ("para ser organizador debe tener contratado un plan activo y pago") queda resuelta así, y ya está implementada:** contratar el plan FREE **es** contratar un plan. `/crear-liga` (o el CTA de pricing) crea la organización, la membresía OWNER y la `Subscription` FREE **en el mismo acto** (`getOrCreateOwnOrg` + `getOrCreateSubscription`) — que es literalmente lo pedido: *"cuando selecciona el plan free se le asigna automáticamente el rol de organizador y se hace la relación con el plan para poder hacer validaciones"*. Los planes **pagos** no habilitan el rol: habilitan **capacidad** (más torneos activos, más equipos, más miembros) y features. Esta es la decisión D7 (freemium) y es la correcta para adquisición: nadie paga antes de probar; se paga al chocar el límite.

- ✅ Crear torneos según el plan: `assertPlanLimit` + `isActiveTournamentStatus` cubren crear/reactivar/restaurar (N4b). Equipos por torneo: `effectiveCapacity` (S3). Miembros: `maxMembers` contando invitaciones pendientes (N6).
- ✅ Vencimiento del pago → límites FREE sin ocultar datos; org SUSPENDIDA → mutaciones bloqueadas (`requireApiOrgContext`). Upgrade: `/admin/plan` con comprobante → admin aprueba (N5).
- ✅ Gestiona torneos, equipos, jugadores, partidos, resultados, árbitros, fixture: todo el panel existente.
- ⚠️ **"El organizador puede crear noticias":** hoy `News` es **global y solo ADMIN** (decisión de N1/N2, correcta: es el marketing de la plataforma). Lo que el organizador de verdad necesita es publicar **novedades de SU liga** en su página pública — eso es otra cosa y va como S12/N14f (decisión D13).
- ⚠️ **Gap → N14c:** hoy cualquier ORGANIZADOR (no solo el OWNER) puede crear torneos, que son justamente lo que consume el cupo del plan. Decisión D12: crear/eliminar/reactivar torneos pasa a ser del OWNER.
- ⚠️ **Gap → N14d:** el pricing de la landing manda siempre a `/crear-liga`; para un OWNER logueado que quiere hacer upgrade, el destino correcto es `/admin/plan`.

##### Circuito 6 — Colaborador / organizador invitado ✅ con dos decisiones (D11 y D12)

El pedido: *"asociar otros como organizador/colaborador que ayudan con los datos pero no pueden crear torneos, solo actuar sobre el torneo al que fueron invitados... no sé si cobrarle"*.

**¿Se le cobra? No (decisión D11).** El colaborador/organizador invitado es un `OrganizationMember` que entra por invitación por email (N6) y **no contrata nada**: lo cubre el plan de la organización, y `maxMembers` es la palanca comercial (modelo de asientos, el estándar SaaS). Razones: (a) el valor lo captura la liga, entonces paga la liga; (b) un planillero voluntario de liga amateur jamás va a poner la tarjeta — cobrarle mata la adopción; (c) ya está implementado así y el enforcement funciona (cuenta miembros + invitaciones pendientes → 402). **Quien quiere más ayudantes, sube de plan.** No hay nada que construir acá.

**¿Cómo se limita lo que puede hacer?** Dos ejes distintos que el pedido mezcla, y conviene resolver por separado:

1. **Límite por acción (qué puede hacer)** — ya existe con los 3 roles: COLABORADOR solo carga resultados/goles/tarjetas (`allowCollaborator`); ORGANIZADOR gestiona todo lo deportivo. El matiz que falta es el de D12: que "crear torneos" (lo que consume plan) sea solo del OWNER → con eso el ORGANIZADOR invitado queda **exactamente** como lo describe el pedido: carga resultados, jugadores, equipos y partidos, pero no crea torneos (→ N14c).
2. **Límite por torneo (dónde puede hacerlo)** — hoy la membresía es de toda la organización, no de un torneo. Para ligas chicas (una persona ayuda en todo) el scope org-wide es lo correcto y más simple. El scoping fino por torneo queda **diseñado pero diferido** (→ N14e): no agregarlo hasta que una liga real lo pida — cada tabla de permisos nueva es fricción de invitación y superficie de bugs.

##### Circuito 7 — ADMINISTRADOR ✅ (completo)

Aprueba pagos (`/admin/pagos`), gestiona organizaciones con suspender/reactivar y métricas SaaS (`/admin/organizaciones`), CRUD de planes (`/admin/planes`), noticias de plataforma, usuarios, configuración del sitio, y "ver como organización" para soporte (N3/N10). Sin gaps de circuito.

##### Matriz canónica de permisos (todas las personas, no solo OrgRole)

Extiende la tabla de N1 con los sombreros que no son membresía:

| Acción | Anón. | USUARIO | Jugador (claim) | Delegado | COLABORADOR | ORGANIZADOR | OWNER | ADMIN |
|---|---|---|---|---|---|---|---|---|
| Ver páginas públicas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Favoritos / seguir | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reclamar/gestionar SU ficha | ❌ | ✅ | ✅ (ya la tiene) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Plantel + inscripción de SU equipo | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Cargar resultados/goles/tarjetas (su org) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| CRUD equipos/jugadores/árbitros/partidos (su org) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Aprobar delegados/inscripciones/reclamos (su org) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Crear/eliminar/reactivar torneos | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ **(D12)** | ✅ | ✅ |
| Novedades de la liga (S12, futuro) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Plan, pagos, miembros de la org | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Noticias de plataforma, planes, aprobar pagos | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

##### Tareas que salen de esta auditoría

- [x] **N14a. 🟠 Navegación por sombrero (E:Medio).** El header y el perfil deben reflejar los vínculos reales del usuario, no asumir que todos son organizadores.
  - Header: en vez del "Mi Panel" fijo, el server (layouts que ya llaman `checkUser`) resuelve los links según sombreros: "Mi Panel" (miembro/admin), "Mi Equipo" (delegado), "Mi Ficha" (claim), y los pasa al `Header` como props (es client component). Con varios sombreros se muestran varios; sin ninguno, "Empezar" → `/bienvenida`.
  - Hub **"Mis vínculos"** en `/profile`: las 4 puertas de `/bienvenida` con su estado real (ficha vinculada/pendiente, equipos que delega, ligas donde es miembro con su rol, favoritos) y acceso a sumar los que falten. Resuelve el caso "OWNER que además juega": hoy no tiene cómo llegar a `/mi-ficha`.
  - `/bienvenida` queda como está (pantalla de alta): el hub es el lugar de "cambiar/sumar después", que la propia pantalla promete ("podés cambiarla cuando quieras") y hoy no existe.
  > ✅ **Implementado (2026-07-16).**
  > - **Fuente única [lib/userHats.ts](lib/userHats.ts):** `getUserNavLinks()` (con `React.cache()` — el header se renderiza en cada página pública, una sola tanda de 3 `findFirst` indexados por request; anónimo = 0 queries) y `getUserHats()` (datos del hub con nombres y estados). Nav y hub leen del mismo lugar: no pueden divergir.
  > - **Header por sombrero:** prop nueva `userLinks` en [Header](components/layout/header.tsx) — "Mi Panel" (miembro o ADMINISTRADOR), "Mi Equipo" (delegado, cualquier estado: la página muestra la solicitud), "Mi Ficha" (reclamo vigente), "Empezar" → `/bienvenida` si no tiene ninguno, "Mi Perfil" siempre. Sin la prop cae al par histórico (compatibilidad). Cableado en los 5 puntos de render logueado: `(public)/layout`, home (FanHome), `/mi-ficha`, `/mi-equipo`, `/bienvenida`.
  > - **Hub [HatsHub](modules/usuarios/components/HatsHub.tsx) en `/profile`:** misma anatomía de card que las puertas de `/bienvenida` (ícono con gradiente de marca, CTA con flecha, `interactive-surface`, `bg-card`) + **badge de estado semántico** (verde activo / ámbar pendiente / gris sin vínculo, con pares dark). Cada card dice lo concreto: "Tu ficha: Juan Pérez", "Representás a Racing", "Dueño — Liga Municipal", "Seguís 3 favoritos"; la que falta invita a sumarla (`/mi-ficha`, `/mi-equipo`, `/crear-liga`, `/torneos`). ADMINISTRADOR sin liga ve su card de plataforma.
  > - **Labels canónicos:** `ORG_ROLE_LABELS` y `USER_ROLE_LABELS` nuevos en [lib/constants.ts](lib/constants.ts); `MembersClient` migró su copia local y el badge del perfil dejó de mostrar el enum crudo ("USUARIO" → "Usuario").
  > - **Tokens (regla M6):** `app/(public)/profile/page.tsx` migrado por completo — 0 hex de marca.
  > - Verificado: `tsc` limpio, **156 tests ✅**, 0 errores de lint en los archivos tocados, `next build` verde; smoke en `next start` (anónimo: "Precios" sin links de usuario, `/torneos` 200, `/profile` gateado sin sesión).
  > - ⚠️ **Pendiente de verificar a mano** (necesita sesión de Clerk): header de un hincha ("Empezar"), de un delegado ("Mi Equipo") y de un multi-sombrero (varios links), y el hub con datos reales en los 4 estados.
  > - **Pendiente que sigue abierto:** el `?plan=` a través del registro de Clerk (ver nota en N14d) — `GoogleSignUp` fuerza `/bienvenida`; decidir si pasa a `fallbackRedirectUrl` para respetar `redirect_url`.
- [x] **N14b. 🟡 Crear la propia ficha desde `/mi-ficha` (E:Medio, decisión D14).** Si el DNI no existe en la plataforma, ofrecer crear la ficha ahí mismo: nace con `createdById = él` y **claim APROBADO automático** (quien crea su propia ficha es su dueño — consistente con `canEditPlayer`, que ya incluye al creador y al dueño).
  > ✅ **Implementado (2026-07-17).**
  > - **Autocreación:** `createOwnPlayer` en [claims.ts](modules/jugadores/actions/claims.ts) — DNI (normalizado, único), nombre, **fecha de nacimiento obligatoria** (el segundo factor barato de D14) y **aceptación explícita de Términos/Privacidad** (checkbox con links, validada también en el server). Transacción: `Player` (`createdById` = él) + `PlayerClaim` APROBADO con constancia "Ficha creada por su titular"; `AuditLog` vía `logPlayerCreate`. La carrera DNI-duplicado (P2002) devuelve "ya existe, reclamala".
  > - **La búsqueda ahora abre el paso siguiente en vez de un callejón:** `requestPlayerClaim` devuelve `code` — `NOT_FOUND` → la UI ofrece el formulario de crear ficha; `DISPUTE_AVAILABLE` → ofrece la disputa.
  > - **Disputa de titularidad:** si la ficha está vinculada a **quien la autocreó** (nadie del club lo verificó), otro usuario puede reclamarla con **evidencia obligatoria** (≥10 caracteres) → claim PENDIENTE que resuelve **solo el ADMINISTRADOR**. Si el dueño fue confirmado por su liga/delegado, el rechazo automático sigue como antes.
  > - **Quien aprueba no puede ser parte (regla AGENT_RULES):** el dueño actual pasa `canEditPlayer` y habría podido rechazar a su rival — `getPendingPlayerClaims` excluye las disputas de las bandejas de no-admins y `authForClaim` las bloquea con mensaje explícito. El chequeo "un solo dueño" se movió a `authForClaim` (cubre aprobar **y** rechazar).
  > - **Resolución:** aprobar una disputa **transfiere la titularidad** en una transacción (claim viejo → RECHAZADO, nuevo → APROBADO, `AuditLog` acción `playerClaim.transfer` con `{de, a}`). La bandeja de `/admin/delegados` marca la disputa (badge + dueño actual + evidencia en cursiva) y el diálogo dice lo que de verdad pasa ("se desvincula de X y pasa a Y").
  > - **`/mi-ficha`:** formulario de creación (nombre + fecha + checkbox legales), sección de disputa (textarea de evidencia), y el estado PENDIENTE distingue "Esperando confirmación" de **"Disputa en revisión"** (`getMyPlayerClaim` ganó `isDispute`).
  > - Verificado: `tsc` limpio, **156 tests ✅**, 0 errores de lint, `next build` verde, smoke (`/mi-ficha` gateado sin sesión).
  > - ⚠️ **Pendiente de verificar a mano** (necesita sesión de Clerk): el flujo completo buscar→crear→ver ficha, y una disputa de punta a punta con dos cuentas.
  > - **Pendiente que abre N14b:** ✅ **resuelto en S5 (2026-07-17), pero al revés de como estaba planteado.** Al **abrirse** la disputa se le avisa al ADMINISTRADOR (que es quien la resuelve), **no al dueño actual**: avisarle antes de que alguien mire la evidencia lo invita a reaccionar contra el reclamante, que puede ser el titular real. El dueño actual sí recibe el **resultado** — las dos partes se enteran de cómo terminó.
  - **Por qué sí:** (a) completa el circuito pedido ("reclamar **o** crear"); (b) mejora el dedupe — cuando el delegado lo busque por DNI la ficha ya existe con datos que cargó el propio interesado, en vez de una ficha a medias tipeada apurado; (c) legalmente es el caso *mejor*: el titular del dato carga sus propios datos (consentimiento directo, Ley 25.326).
  - **El riesgo real — suplantación** (alguien crea/posee la ficha del DNI de otro): existe igual hoy (un delegado puede cargar cualquier DNI); la diferencia es que el claim de un tercero lo aprueba alguien que conoce al jugador y acá no hay aprobador. Mitigación: **vía de disputa** — si otro usuario reclama una ficha cuyo dueño es quien la autocreó (no un club), el reclamo no se rechaza automático sino que queda en una cola que resuelve el ADMINISTRADOR con la evidencia de ambos. Sumar además fecha de nacimiento obligatoria al autocrear (segundo factor barato, ya contemplado como endurecimiento en N12).
  - **Prerrequisito:** `/terminos` y `/privacidad` publicadas (A10) — al autocrear se acepta explícitamente la política de datos. ✅ **Cumplido (2026-07-17, ver A10): N14b queda desbloqueado** (recomendable esperar la revisión legal profesional antes de lanzar la autocreación).
- [x] **N14c. 🟠 Crear/eliminar/reactivar torneos = solo OWNER (E:Bajo, decisión D12).** Guard en `POST /api/tournaments`, DELETE, restore y el PATCH que reactiva (los mismos tres caminos que N4b ya unificó con `isActiveTournamentStatus` — la coherencia es esa: **toda transición que consume cupo del plan la controla quien gestiona el plan**). ORGANIZADOR sigue gestionando a fondo los torneos existentes (config deportiva, fases, fixture, equipos, resultados). La UI oculta "Nuevo torneo" a no-OWNER (el server igual bloquea con 403). Aprovechar para exponer `myRole` en el panel (pendiente 3 de N6) y ocultar también Plan/Miembros a no-OWNER en el sidebar.
  > ✅ **Implementado (2026-07-16).**
  > - **Guards nuevos en [lib/orgAuth.ts](lib/orgAuth.ts):** `requireApiOrgOwner(organizationId, mensaje)` (403 con mensaje específico de la acción) y `getMyOrgRole(user)` (rol en la primera membresía, el mismo criterio que `getOrCreateOwnOrg`).
  > - **Los 4 caminos que consumen cupo, cerrados:** `POST /api/tournaments` (crear — mensaje "Solo el dueño de la liga puede crear torneos"), `DELETE /api/tournaments/[id]` (eliminar — libera cupo, la otra mitad del truco de N4b), `POST /api/tournaments/[id]/restore` (restaurar) y el `PATCH` **solo cuando la transición reactiva** (`willBeActive && !wasActive`): editar un torneo sigue siendo de ORGANIZADOR.
  > - **Nav por rol de org:** `AdminNavItem.ownerOnly` en "Plan y Pagos" y "Miembros"; `navItemsForRole(role, orgRole)` los oculta a no-OWNER. El `orgRole` se resuelve en el layout del panel y baja por `AdminShell` → sidebar + command palette (las dos superficies comparten la fuente única de F3, así que se filtran juntas).
  > - **Páginas alineadas a la matriz N1:** `/admin/plan` (movido a `PlanClient.tsx` + `page.tsx` server con guard) y `/admin/miembros` redirigen a dashboard a quien no es OWNER — las APIs de mutación ya lo exigían; ahora la vista coincide.
  > - **Botones:** "Crear torneo" del listado solo para OWNER (`app/admin/torneos/page.tsx`); "Eliminar" oculto a no-OWNER en las filas del listado (`ListTournaments.canDelete`) y en el detalle (`Header.canDelete`, decidido por torneo exacto con `isOrgOwner`). Editar queda visible: sigue permitido.
  > - Verificado: `tsc` limpio (tras `prisma generate` — errores fantasma conocidos de F2), **156 tests ✅**, 0 errores de lint (23 warnings preexistentes), `next build` verde.
  > - ⚠️ **Pendiente de verificar a mano** (necesita sesión de Clerk con un miembro ORGANIZADOR): que el sidebar no muestre Plan/Miembros y que crear/eliminar torneo devuelva el 403 con su mensaje.
  > - **Nota:** en el listado multi-org el flag `canDelete` sale de la primera membresía (una org por usuario en la práctica); el server valida por torneo exacto igual. El detalle sí decide por torneo.
- [x] **N14d. 🟢 Pricing consciente de sesión (E:Bajo).** Los CTAs de `pricing-section` hoy mandan siempre a `/crear-liga`. Con sesión y organización propia deben ir a `/admin/plan` (con el plan preseleccionado, ej. `?plan=PRO`); sin organización, a `/crear-liga`; sin sesión, a `/sign-up` con redirect a `/crear-liga` (como hoy). Cierra de paso el pendiente de N4 ("UI de upsell ante el 402": el toast puede linkear a `/admin/plan?plan=PRO`).
  > ✅ **Implementado (2026-07-16).**
  > - **[pricing-section](components/sections/pricing-section.tsx):** resuelve sesión + membresía en el server. Con liga → `/admin/plan?plan=CODE` (el FREE pasa a "Ver mi plan" → `/admin/plan` sin query: FREE no se "contrata", es el fallback); sin liga → `/crear-liga` (anónimo termina en sign-up, como siempre).
  > - **El plan elegido viaja por el funnel:** `/crear-liga?plan=PRO` (sanitizado server-side, FREE excluido) → prop `targetPlan` del wizard → la pantalla de éxito ofrece **"Contratar plan PRO"** → `/admin/plan?plan=PRO`, donde [PlanClient](app/admin/plan/PlanClient.tsx) lo preselecciona. La selección se **deriva al renderizar** contra los planes pagos reales (`selected`): un código inexistente en la URL simplemente no selecciona nada — sin `useEffect`, sin estado roto.
  > - **Upsell del 402 (pendiente de N4, cerrado):** [lib/planUpsell.ts](lib/planUpsell.ts) `toastPlanLimit` — toast de error con acción **"Mejorar plan"** → `/admin/plan`, 8s. Cableado donde el límite de plan se cruza por fetch: crear/reactivar torneo ([DialogAddTournaments](modules/torneos/components/admin/DialogAddTournaments.tsx)) e inscribir equipo ([TournamentTeamSheet](app/admin/torneos/[id]/components/TournamentTeamSheet.tsx)). Tras N14c el 402 solo lo ve un OWNER — exactamente quien puede contratar. El wizard y `/admin/miembros` conservan su banner con link (ya existía).
  > - **Tokens de marca (regla M6, archivos tocados):** `pricing-section`, `CrearLigaWizard` y `crear-liga/page` migrados por completo — 0 hex de marca restantes en los 3; la pantalla de éxito del wizard usa `<Button variant="brand">`.
  > - Verificado: `tsc` limpio, **156 tests ✅**, 0 errores de lint en los archivos tocados, `next build` verde; smoke en `next start`: landing anónima → 3 CTAs a `/crear-liga`, tokens presentes en el HTML, `/admin/plan?plan=PRO` gateado sin sesión.
  > - **Pendiente menor (documentado):** el `?plan=` no sobrevive el paso por el registro de Clerk (sign-up fuerza `/bienvenida`, N13) — un anónimo que elige PRO en el pricing retoma el funnel sin el plan preseleccionado. Retomarlo requiere decidir el `redirect_url` de Clerk contra las tres puertas de `/bienvenida`; va con N14a (navegación por sombrero).
- [ ] **N14e. ⚪ Scoping por torneo — diseñado, NO construir todavía (E:Medio).** Si una liga real pide limitar un miembro a UN torneo: tabla `MemberTournamentAccess (memberId, tournamentId, @@unique)` donde **la ausencia de filas = acceso a toda la org** (los miembros actuales no cambian de conducta); los guards `canManageOrg`/`allowCollaborator` ganan un parámetro opcional `tournamentId` y la consultan solo si hay filas. No se construye hasta que haya demanda real: es fricción de invitación y superficie de permisos nueva.
- [ ] **N14f. 🟢 → S12. Novedades de la liga (E:Medio, decisión D13).** Ver S12 en la sección de producto.

---

## 📅 Roadmap sugerido

| Sprint | Contenido | Resultado |
|---|---|---|
| 1 | C1–C10 completos | Producto seguro; datos íntegros |
| 2 | A1, A2, A4, A5, A7, A10 | Base de código única y honesta |
| 3 | A3, A6 + M13 + **N1 + N2 + N3 + N11** en una sola migración, A8 (tests de standings + CI) | Multi-tenant real: roles correctos, organizaciones, datos privados por liga |
| 4 | ✅ **N4 + N5 + N6** (planes, pagos manuales, onboarding "Creá tu liga") + ✅ **N9** | Modelo de negocio operativo: se puede cobrar |
| 5 | F0 + M6 + M10 (design system) + ✅ **N7** | Fundaciones visuales + reglas deportivas configurables |
| 6 | F2 + F3 (rediseño público y admin) + M2, M7 + **N10** | UI nivel SaaS con las vistas por rol completas |
| 7 | M3, M4, M8, M9, M11, M12 + F4 + ✅ **N8** | Pulido enterprise + sanciones automáticas |
| 8+ | S1 (fixture) → S3 (inscripciones) → S4/S5 → Mercado Pago → **N12** | Diferenciación de producto |

## ✅ Decisiones de negocio definidas (2026-07-03)

> Confirmadas por el product owner. Son reglas de negocio vigentes: toda implementación debe respetarlas.

1. **Multi-tenancy (S2): el producto es SaaS multi-liga.**
   - Se agrega el modelo `Organization` (liga): dueño, miembros con roles por organización, branding propio y slug público (`/liga/[slug]`).
   - `Tournament`, `Team`, `Player`, `Referee` y `News` cuelgan de una organización (`organizationId`).
   - Evaluar Clerk Organizations para membresías. Decidido ahora para evitar migración dolorosa con datos en producción. Impacta el diseño de C7, A6 y todo el Sprint 3 en adelante.
2. **Ownership (C7): ORGANIZADOR/EDITOR solo ven y editan lo suyo.**
   - Regla: `ADMINISTRADOR` y `MODERADOR` gestionan todo; `ORGANIZADOR`/`EDITOR` solo recursos donde `userId === user.id` (y, con S2, dentro de su organización).
   - Aplica a lectura en el panel admin y a toda mutación (API + server actions) vía helper único `assertCanManage`.
3. **WALKOVER (C6): 3-0 para el equipo presente, con puntos.**
   - Estándar FIFA: el ganador recibe 3 puntos y el marcador oficial es 3-0 (cuenta para goles a favor/en contra).
   - El admin solo marca qué equipo ganó por walkover; el sistema fija el 3-0 automáticamente y lo computa en standings como partido finalizado.
4. **Categorías (M13): separar el enum en 3 campos.**
   - `ageGroup` (LIBRE, SUB_17, SUB_20, JUVENIL, VETERANO, M30, ...), `gender` (MASCULINO, FEMENINO, MIXTO) y `division` (texto opcional: "A", "Primera", ...).
   - Reemplaza a `TournamentCategory`. Permite "Sub-17 Femenino A", filtros reales y estadísticas cruzadas. Ejecutar junto con la migración de A6.

### Decisiones agregadas el 2026-07-05 (auditoría de negocio, sección 🧭)

5. **Roles (N1): 2 roles de plataforma + 3 roles por organización.**
   - Global: `ADMINISTRADOR` (product owner) y `USUARIO` (todo registrado). Se eliminan EDITOR/MODERADOR/ORGANIZADOR globales.
   - Por organización: `OWNER`, `ORGANIZADOR`, `COLABORADOR` (solo carga de resultados). Registro nuevo queda ACTIVO directo.
6. **Visibilidad (N3): datos privados por organización, públicos read-only.**
   - Equipos, jugadores, árbitros y torneos se gestionan solo dentro de su organización. Otras organizaciones no los ven ni reutilizan.
   - Las páginas públicas (torneo/equipo/jugador) son visibles para todos. Identidad cross-liga por DNI queda para N12.
7. **Freemium (N4/N6): crear liga es gratis, pagar es para crecer.**
   - Cualquier USUARIO crea su organización con plan FREE self-service (1 torneo activo, límites bajos, marca GOLAZO).
   - Los planes pagos (PRO/PREMIUM) levantan límites y features. Al vencer un pago la org vuelve a límites FREE; nunca se ocultan datos ya cargados.
8. **Pagos (N5): manuales con comprobante primero, Mercado Pago después.**
   - OWNER sube comprobante de transferencia → admin aprueba/rechaza desde `/admin/pagos` → se extiende el período.
   - El modelo `Payment` nace preparado para MP (`method`, `externalId`): la integración posterior no migra datos.
9. **Múltiples organizadores por torneo (N2): vía membresía de la organización.**
   - Todos los miembros ORGANIZADOR/COLABORADOR de la org gestionan sus torneos. Sin tabla torneo-organizador por ahora.

### Decisiones agregadas el 2026-07-16 (auditoría de circuitos, N14)

10. **Una cuenta, varios sombreros (N14).** Los "perfiles" no son roles excluyentes sino relaciones acumulables: la misma cuenta puede ser hincha (`Favorite`), jugador (`PlayerClaim`), delegado (`TeamManager`) y miembro/dueño de liga (`OrganizationMember`) a la vez. Ningún circuito bloquea a otro; la navegación debe reflejar los sombreros reales del usuario (N14a).
11. **El colaborador/organizador invitado NO paga (N14).** Los miembros de una liga no contratan plan propio: los cubre el plan de la organización y `maxMembers` es la palanca comercial (modelo de asientos). El valor lo captura la liga → paga la liga; cobrarle a un planillero voluntario mata la adopción. Ya implementado así (N6): no hay nada que construir.
12. **Crear/eliminar/reactivar torneos es del OWNER (N14c).** El torneo es lo que consume cupo del plan: quien gestiona el plan controla lo que lo consume. ORGANIZADOR gestiona a fondo los torneos existentes (config, fases, fixture, equipos, jugadores, partidos, resultados) pero no crea, elimina ni reactiva. Con esto el "organizador invitado" queda exactamente como lo describió el owner: ayuda con todos los datos, no crea torneos. Revisable si una liga real lo necesita distinto.
13. **Noticias de plataforma ≠ novedades de liga (N14f/S12).** `News` global sigue siendo solo ADMINISTRADOR (marketing de GOLAZO). Lo que el organizador necesita es publicar novedades de SU liga en su página pública: modelo aparte `OrgPost` (S12), evaluable como feature de plan PRO.
14. **La ficha propia se puede crear, no solo reclamar (N14b).** Si el DNI no existe, el propio jugador crea su ficha y nace dueño (claim APROBADO automático, auditado). Suplantación mitigada con fecha de nacimiento obligatoria al autocrear + vía de disputa resuelta por el ADMINISTRADOR. Prerrequisito: `/terminos` y `/privacidad` publicadas (A10/Ley 25.326).
