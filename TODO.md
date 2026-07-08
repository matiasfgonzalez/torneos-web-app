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
- **Pendiente del ítem 5 (stats manuales vía tournament-teams):** sin cambios, sigue abierto.

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
- **Pendiente:** unificar `components/admin/match-dialog.tsx` (usado por /admin/partidos) con `DialogAddEditMatch.tsx` (usado por /admin/torneos/[id]) — no son idénticos, ambos vivos con features distintas; unificarlos es rediseño de F3. Regla ESLint `no-restricted-imports` también pendiente.
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
  - El botón "Eliminar" de noticias en [app/admin/noticias/[id]/page.tsx](app/admin/noticias/[id]/page.tsx) no está implementado (handler vacío); la API DELETE existe — conectarla.
- **Esfuerzo:** E:Bajo · **Beneficio:** Sin PII en logs; ruido cero.

### A11. Endpoints referenciados por la UI que no existen (hallazgo C3, 2026-07-04)

- [ ] **Problema:** La UI llama endpoints sin handler → 405 silencioso:
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

- [ ] **Problema:** El design system de globals.css define `--primary/--secondary` pero la marca real (`#ad45ff → #a3b3ff`) está copiada a mano en 93 archivos; el modo oscuro define un `--primary` blanco que casi no se usa.
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

### F0. Fundaciones del Design System (pre-requisito, E:Medio)

- [ ] Tokens de marca en CSS (ver M6) + escala tipográfica documentada (display/h1/h2/body/caption) + espaciados estándar (secciones `py-16/24`, cards `p-6`).
- [ ] Componentes base compartidos y únicos:
  - `<PageHero>` público (badge + título con GradientText + subtítulo + stats) — hoy cada página pública lo duplica a mano.
  - `<PageHeader>` admin (título + descripción + acciones + breadcrumbs).
  - `<StatCard>` unificado (hay 3 implementaciones de StatsCards distintas).
  - `<StatusBadge>` por entidad con mapa único de colores por estado (torneo/partido/jugador/usuario) — hoy los colores de estado varían entre páginas.
  - `<EmptyState>`, `<SkeletonTable>`, `<SkeletonCards>`, `<ConfirmDialog>`.
- [ ] Documentar en `docs/DESIGN-SYSTEM.md` (paleta, uso del gradiente, dos/dont's).

### F1. Landing (retoques menores, E:Bajo)

- [ ] Ya es la referencia. Solo: reemplazar `<img>` por `next/image`, revisar contraste AA de textos sobre glow, `prefers-reduced-motion`, y comprimir imágenes hero. Lazy-load de secciones bajo el fold con `next/dynamic` si el bundle lo amerita.

### F2. Páginas públicas (E:Alto)

- [ ] Unificar los heros de `/torneos`, `/equipos`, `/jugadores`, `/noticias`, `/partidos` con `<PageHero>` (hoy cada una copia los blobs decorativos con variaciones).
- [ ] Cards de torneo/equipo/jugador con anatomía consistente (imagen, título, badges, meta, hover elevate + glow sutil).
- [ ] Detalle de torneo público: tabs sticky en mobile, tabla de posiciones con zebra + fila destacada del líder + indicadores ▲▼ de racha, bracket con scroll horizontal contenido en mobile.
- [ ] Filtros como chips horizontales scrolleables en mobile (patrón app deportiva) con estado en URL.
- [ ] Página de partido: timeline vertical de eventos (goles/tarjetas) con minuto, escudos y marcador grande.

### F3. Panel admin (E:Alto)

- [ ] **Dashboard:** hoy es débil — rediseñar con KPIs reales (torneos activos, partidos hoy, últimos resultados, actividad reciente del AuditLog), gráfico de evolución (usar `--chart-*` ya definidos) y accesos rápidos "Crear torneo / Cargar resultado".
- [ ] **Tablas → DataTable común** (sort, búsqueda, paginación server, selección) que colapsa a cards en mobile (patrón ya usado en usuarios; generalizarlo).
- [ ] **Formularios y diálogos:** loading en submit, validación inline con mensajes en español, diálogos largos → `<Sheet>` lateral en desktop y fullscreen en mobile, autosave de borradores en torneos.
- [ ] **Flujo de carga de resultados** (el más frecuente del admin): rediseñar como stepper rápido — resultado → goles → tarjetas → confirmar, con recálculo automático visible.
- [ ] **Navegación:** breadcrumbs en subpáginas, indicador activo en sidebar por sección, command palette `Ctrl+K` (buscar torneo/equipo/jugador y acciones) — diferenciador SaaS barato con `cmdk`.

### F4. Microinteracciones y pulido (E:Medio)

- [ ] Transiciones de página suaves (template.tsx con fade corto), hover states consistentes (elevate + border-brand), toasts de éxito con acción "Deshacer" donde aplique (soft delete lo permite), number tickers en KPIs, `View Transitions` para navegación entre card→detalle.
- [ ] Auditoría dark/light completa: hoy hay combinaciones `bg-white dark:bg-gray-900` hardcodeadas que deben usar tokens (`bg-card`).

---

## 🚀 PRODUCTO — Funcionalidades nuevas y diferenciadores SaaS

> Ordenadas por relación valor/esfuerzo. Las 4 primeras convierten la app de "gestor interno" a "plataforma".

- [ ] **S1. Generador automático de fixture (E:Alto, valor máximo):** round-robin (ida/vuelta), grupos balanceados y brackets con byes a partir de los equipos inscriptos; hoy crear cada partido a mano es el mayor dolor del organizador. Algoritmo puro + tests (encaja con A8).
- [ ] **S2. Multi-tenancy con organizaciones/ligas:** ✅ definido y detallado en N2 (schema concreto de `Organization`/`OrganizationMember`, News queda global, sin Clerk Organizations). Ver sección 🧭.
- [ ] **S3. Inscripción online de equipos (E:Alto):** flujo público — organizador publica torneo con cupos y fecha límite → delegados registran equipo + plantel → organizador aprueba/rechaza. Estados `INSCRIPCION` ya existen en el enum; falta el workflow. Opcional: cobro de inscripción con Mercado Pago.
- [ ] **S4. Página pública compartible + QR (E:Medio):** URL limpia por torneo con OG image dinámica (marcador/tabla), botón compartir por WhatsApp (canal #1 en ligas amateur) y QR imprimible.
- [ ] **S5. Notificaciones (E:Medio):** in-app (campana con no-leídas) + email (Resend) para: resultado cargado, próximo partido, equipo aprobado. Base: modelo `Notification` + preferencias por usuario.
- [ ] **S6. Live match center (E:Alto):** marcador en vivo minuto a minuto (el admin carga eventos, el público ve actualizado con polling/SSE). Gran diferenciador para ligas locales.
- [ ] **S7. Estadísticas avanzadas (E:Medio):** goleadores, valla menos vencida, fair play (ya hay Cards), racha de equipos, historial head-to-head — todos los datos ya existen en Goal/Card/Match.
- [ ] **S8. Exportables (E:Bajo-Medio):** fixture y tabla en PDF con branding, planteles en CSV. Muy pedido por organizadores.
- [ ] **S9. PWA (E:Medio):** manifest + service worker; los usuarios finales lo usan desde el celular en la cancha.
- [ ] **S10. Multi-deporte (E:Alto, evaluar):** campo `sport` en Tournament con configuración de puntaje por deporte (básquet/vóley no usan 3-1-0). Solo si el negocio lo pide; diseñarlo en S2 para no migrar dos veces.
- [ ] **S11. Billing/planes freemium:** ✅ definido y detallado en N4 (planes/límites) + N5 (pagos manuales) + Mercado Pago después. Ver sección 🧭.

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

> ✅ **Implementado en mutaciones (2026-07-05):** toda mutación valida pertenencia a la org dueña del recurso (directo o vía torneo/partido). **Pendiente:** filtrar por org los LISTADOS del panel admin (hoy un organizador vería datos de otras orgs en las tablas del panel — no puede tocarlos, pero los ve; se resuelve con el dashboard por organización de N10).

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

#### N5. 🟠 Pagos manuales con comprobante (E:Medio)

> ✅ **Implementado (2026-07-05):** modelo `Payment` (con `planId` del plan pagado, `method`/`externalId` MP-ready). API: `POST /api/payments` (solo OWNER/admin; monto calculado server-side), `GET /api/payments` (admin: todos; organizador: su org), `PATCH /api/payments/[id]` (admin aprueba/rechaza; aprobar activa plan + extiende vencimiento en transacción), `GET /api/plans`, `GET /api/org/subscription` (plan efectivo + uso). Páginas: [/admin/plan](app/admin/plan/page.tsx) (plan actual, uso, contratar con comprobante vía Cloudinary `pagos/comprobantes`, historial) y [/admin/pagos](app/admin/pagos/page.tsx) (cola admin con comprobante, aprobar/rechazar con motivo). Sidebar actualizado a roles nuevos + links Plan/Pagos.
> **Pendientes de N5:** (1) alias/CBU de transferencia hardcodeado como "GOLAZO.PAGOS" en la página de plan — mover a env/config con el dato real; (2) notificación al admin al informar pago y al OWNER al aprobar/rechazar — llega con S5; (3) los comprobantes en Cloudinary son URL pública no listada — evaluar delivery privado/URL firmada; (4) integración Mercado Pago (webhook → Payment APROBADO).

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
> **Pendientes/siguientes:** (1) email real de invitación (hoy la invitación existe pero no se envía email — llega con S5/Resend); (2) reenviar invitación y ver fecha de expiración; (3) el `myRole` del OWNER se usa en `/api/org` pero falta exponerlo en la UI del panel para ocultar acciones a no-OWNER del lado cliente (hoy el server ya las bloquea con 403); (4) transferir propiedad de la liga a otro miembro.

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
> **Pendientes/siguientes:** (1) "cumplida" asume que el suspendido no juega los partidos posteriores del equipo (no hay planilla de asistencia); si el club lo alinea igual, el warning avisa pero no se detecta como violación. (2) Cancelar/perdonar una suspensión **automática** requiere un flag `pardoned` que el recompute respete (hoy solo se quitan borrando la tarjeta origen; sí se cancelan las MANUAL). (3) Notificación al jugador/organizador (llega con S5). (4) FairPlay como criterio de desempate en la tabla aún no está cableado en el comparador (N7).

#### N9. 🟡 Slugs y URLs públicas compartibles (E:Bajo)

> ✅ **Implementado (2026-07-08):** **Util compartido [lib/slug.ts](lib/slug.ts):** `slugify` (minúsculas, sin acentos, ≤60), `uniqueOrganizationSlug` y `uniqueTournamentSlug` con desambiguación real `-2`/`-3`… (ya no sufijo aleatorio); `orgAuth` refactorizado para reusarlo (elimina la duplicación de N6). **Schema** (migración `20260708170000_tournament_slug`, aplicada + backfill): `Tournament.slug` con `@@unique([organizationId, slug])` (único por org); [prisma/backfill-tournament-slugs.js](prisma/backfill-tournament-slugs.js) completó los existentes (1 torneo → `categoria-a`). **Generación:** POST de torneo setea slug; PATCH lo completa si falta pero **no lo cambia al renombrar** (mantiene estables los links compartidos). **Rutas:** `/liga/[slug]` (página de liga: perfil + botón WhatsApp + grilla de torneos) y `/liga/[slug]/[torneo]` (URL canónica del torneo), ambas con `generateMetadata` OG/Twitter (prep S4). **Redirect:** `/torneos/[id]` (UUID legacy) redirige a la URL canónica si el torneo tiene slug. **Refactor sin duplicar:** el detalle de torneo (~950 líneas) se extrajo a [TournamentDetailView](modules/torneos/components/TournamentDetailView.tsx) que ambas rutas renderizan. **Resolvers:** `getTorneoBySlug`/`getTournamentMetaBySlug`/`getTournamentCanonicalPath` y `getOrganizationBySlug`. **Tests:** +6 (slugify), 54 en total ✅. Build ✅, tsc ✅, lint ✅.
> **Pendientes/siguientes:** (1) el listado `/torneos` (FiltroTorneos) aún enlaza por `/torneos/[id]` y llega a la canónica **vía redirect** — enlazar directo requiere sumar el org slug a `getTorneos`/`ITorneo` (se hará con N10/M2). (2) Falta redirigir `/torneos/[id]` con **301 permanente** explícito (hoy `redirect()` de Next = 307); evaluar `permanentRedirect`. (3) Slug editable a mano por el organizador (hoy solo automático). (4) La página de liga no distingue estado SUSPENDIDA de la org (muestra igual, por política de retención). Habilita S4: QR + compartir por WhatsApp + OG image dinámica.

#### N10. 🟡 Vistas y páginas faltantes por rol (E:Alto, iterativo)

- [ ] **Público (no logueado):** directorio de ligas/torneos activos con búsqueda por localidad; página de torneo (tabla, fixture, resultados, goleadores, tarjetas, sancionados); página de equipo (plantel, historial); página de jugador (stats por torneo). Todo SEO-first (M3) — es el embudo de adquisición: jugador busca su torneo → lo ve → "Creá el tuyo gratis".
- [ ] **USUARIO logueado:** home con torneos/equipos seguidos (`Favorite { userId, tournamentId?, teamId? }`), notificaciones (S5), perfil. CTA permanente "Creá tu liga".
- [ ] **Organizador (panel org):** dashboard (próximos partidos, resultados sin cargar, estado del plan); **carga rápida de resultados mobile-first** (desde la cancha: marcador + goleadores + tarjetas en una pantalla — es LA pantalla más usada del producto); gestión de miembros; `/org/plan`.
- [ ] **Admin (vos):** cola de pagos (N5); CRUD de planes; listado de organizaciones con estado/plan/último pago y acción suspender; métricas SaaS (orgs activas, conversiones FREE→PRO, ingresos del mes, torneos creados); "ver como organización" (impersonar solo lectura para soporte).

#### N11. 🟡 Limpieza y completitud del schema (E:Medio, misma migración que N2/A6/M13)

- [x] Eliminar el modelo legacy `Phase` + `Match.phaseId` + `Tournament.phaseId` (BD reseteada; ruta `/api/phases`, seed y selects de fase legacy eliminados; los dialogs de partido usan `tournamentPhaseId` con las fases del torneo).
- [x] `TournamentPhase.type`: String → enum `PhaseType (LEAGUE|GROUP|KNOCKOUT)`.
- [x] `Team.yearFounded`: String? → Int?.
- [x] `Player.nationalId String?` (DNI) con `@@unique([organizationId, nationalId])`.
- [x] `Goal.assistTeamPlayerId String?` (asistencias — falta UI de carga).
- [x] `TeamPlayer.isCaptain Boolean @default(false)` (falta UI).
- [x] `TournamentTeam.registrationStatus` enum (`INSCRIPTO` default | `PENDIENTE` | `RECHAZADO`).
- [x] `deletedAt` agregado a Player y News (falta aplicar soft delete + filtros en sus rutas, hoy solo torneos/árbitros lo usan).
- [ ] Revisar `TournamentFormat`: marcar qué formatos soporta realmente el generador de fixture (S1) y ocultar el resto en la UI (evita torneos "SUIZO" que nada implementa).
- ⚠️ (Hallazgo 2026-07-05) No existe UI para crear/gestionar `TournamentPhase`: el selector de fase en partidos solo aparece si el torneo tiene fases. Agregar CRUD de fases del torneo (va con F3 o S1).

#### N12. 🟢 Identidad global de jugador cross-liga (E:Alto, post-N2, diferenciador futuro)

- [ ] Perfil global verificado por DNI: un jugador puede reclamar su perfil (registrándose con el DNI que cargó su organizador), ver sus stats agregadas de todas las ligas y su "carnet digital" con QR (verificación anti-suplantación en la cancha, dolor real de ligas amateur). Convierte a los ~jugadores (miles) en usuarios de la plataforma → embudo de nuevos organizadores. Requiere N2, N3 y política de privacidad.

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
