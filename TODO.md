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

- [ ] **Problema:** El endpoint devuelve métricas completas de usuarios (totales, roles, crecimiento, logins) sin verificar sesión ni rol. Verificado: no importa `auth()` ni `validateApiRole` ([app/api/users/stats/route.ts](app/api/users/stats/route.ts)).
- **Explicación:** Cualquier visitante anónimo puede hacer `curl /api/users/stats` y obtener inteligencia del negocio y distribución de roles (útil para atacar cuentas ADMINISTRADOR).
- **Impacto/Riesgo:** Fuga de datos e inteligencia de negocio. OWASP A01 (Broken Access Control).
- **Solución:** Agregar `validateApiRole(["ADMINISTRADOR"])` al inicio del handler, igual que en `app/api/users/route.ts`.
- **Esfuerzo:** E:Bajo · **Beneficio:** Cierra fuga de datos inmediata.

### C2. Mass assignment (`data: { ...body }`) en mutaciones

- [ ] **Problema:** Varias rutas insertan/actualizan con spread directo del body: [app/api/team-player/route.ts](app/api/team-player/route.ts), [app/api/team-player/[id]/route.ts](app/api/team-player/[id]/route.ts), [app/api/players/[id]/route.ts](app/api/players/[id]/route.ts), [app/api/matches/[id]/route.ts](app/api/matches/[id]/route.ts).
- **Explicación:** Un cliente malicioso puede enviar campos no previstos (`tournamentId`, `createdAt`, ids de relaciones) y sobreescribirlos; los campos desconocidos además provocan errores 500 de Prisma.
- **Impacto/Riesgo:** Corrupción de datos, escalada de datos entre torneos. OWASP A04/A08.
- **Solución:** Whitelist explícita de campos + validación Zod (ver C3). Nunca `...body`.
- **Esfuerzo:** E:Medio · **Beneficio:** Integridad garantizada de las entidades.

### C3. Sin validación de entrada (Zod) en la API — fechas incluidas

- [ ] **Problema:** Solo Cloudinary valida con Zod. El resto hace `new Date(body.dateTime)` / `new Date(body.birthDate)` sin guards (ej. [app/api/matches/[id]/route.ts:53](app/api/matches/[id]/route.ts#L53), [app/api/players/[id]/route.ts](app/api/players/[id]/route.ts)); un body sin fecha guarda `Invalid Date` o revienta con 500.
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

- [ ] **Problema:** `POST /api/cloudinary/sign` y `DELETE /api/cloudinary/delete` solo exigen `userId` de Clerk. Un usuario con rol `USUARIO` puede obtener firmas de subida y **borrar cualquier imagen del bucket por publicId** ([app/api/cloudinary/delete/route.ts](app/api/cloudinary/delete/route.ts)).
- **Impacto/Riesgo:** Vandalismo del CDN completo (logos, fotos, portadas). Irreversible.
- **Solución:** `validateApiRole(["ADMINISTRADOR","EDITOR","ORGANIZADOR"])` en ambos + validar que el `publicId` pertenezca a una entidad que el usuario puede gestionar (buscar el publicId en Tournament/Team/Player/News antes de borrar) + restringir `folder` firmado a un prefijo por entidad.
- **Esfuerzo:** E:Medio · **Beneficio:** Protege todos los assets del producto.

### C5. XSS almacenado en detalle de noticia

- [ ] **Problema:** `dangerouslySetInnerHTML` con contenido editable sin sanitizar ([app/(public)/noticias/[id]/page.tsx:245](app/(public)/noticias/[id]/page.tsx#L245)).
- **Explicación:** Un EDITOR (o cualquiera si la API de noticias se ve comprometida) puede inyectar `<script>`/`onerror` que se ejecuta en todos los visitantes.
- **Solución:** Sanitizar con `isomorphic-dompurify` en el server antes de renderizar, o migrar el contenido a un formato estructurado (tiptap/markdown).
- **Esfuerzo:** E:Bajo · **Beneficio:** Elimina OWASP A03 en la superficie pública.

### C6. Integridad de standings: sin transacciones + bugs de fase

- [ ] **Problema (4 bugs verificados en [lib/standings/calculate-standings.ts](lib/standings/calculate-standings.ts) y [app/api/matches/[id]/route.ts](app/api/matches/[id]/route.ts)):**
  1. Ninguna operación de standings corre en `db.$transaction`; si falla a mitad, la tabla queda desincronizada para siempre.
  2. El PATCH de partido selecciona el estado previo **sin `tournamentPhaseId`** (`select` en línea ~31), por lo que `applyMatchResult` compara `undefined !== nuevaFase` y suma/resta en la fase equivocada → `TeamPhaseStats` se corrompe al editar resultados.
  3. `recalculateTournamentStandings` resetea `TournamentTeam` pero **no** `TeamPhaseStats`, y su `findMany` tampoco selecciona `tournamentPhaseId` → cada recálculo duplica acumulados de fase.
  4. `phaseTypeCountsPoints()` existe en [lib/standings/phase-utils.ts](lib/standings/phase-utils.ts) pero **nunca se invoca**: los partidos de fases KNOCKOUT suman puntos a la tabla general (regla de negocio rota). El estado `WALKOVER` tampoco computa resultado.
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

### C7. Autorización sin ownership + borrado físico en cascada

- [ ] **Problema:** Cualquier `ORGANIZADOR`/`EDITOR` puede editar o **eliminar físicamente** torneos de otros usuarios ([app/api/tournaments/[id]/route.ts](app/api/tournaments/[id]/route.ts) hace `db.tournament.delete` → cascade borra partidos, goles, tarjetas, stats e historia). Existe `deletedAt` en el modelo pero no se usa.
- **Solución (regla confirmada ✅):**
  1. ADMINISTRADOR y MODERADOR gestionan todo; ORGANIZADOR/EDITOR solo ven y editan recursos propios (`userId === user.id`), tanto en listados del admin como en mutaciones.
  2. DELETE → soft delete (`deletedAt: new Date()`) + filtrar `deletedAt: null` en todos los listados.
  3. Helper único `assertCanManage(user, resource)` en `lib/`, preparado para recibir `organizationId` cuando llegue S2.
- **Esfuerzo:** E:Medio · **Beneficio:** Aislamiento entre organizadores (pre-requisito para multi-tenancy) y datos recuperables.

### C8. Middleware sin protección de rutas (defensa en profundidad)

- [ ] **Problema:** [middleware.ts](middleware.ts) es `clerkMiddleware()` pelado: no protege `/admin` ni `/api`. Toda la seguridad depende de que cada page/handler se acuerde de validar (y varios no lo hacen, ver C1).
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

- [ ] **Problema:** [next.config.ts](next.config.ts) no define `headers()` (falta CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy). Ninguna API tiene rate limiting (login/uploads/recalculate incluidos).
- **Solución:** Bloque `headers()` en next.config + rate limiting con `@upstash/ratelimit` (o Arcjet) en middleware para `/api/*`.
- **Esfuerzo:** E:Medio · **Beneficio:** Hardening base de producción; mitiga fuerza bruta, clickjacking y abuso.

---

## 🟠 ALTO — Bugs y deuda estructural (Sprints 2-3)

### A1. Código duplicado masivo: `app/admin/*` vs `modules/*`

- [ ] **Problema:** Árboles de componentes **idénticos byte a byte** (verificado con diff): `app/admin/jugadores/components/PlayersTable.tsx` == `modules/jugadores/components/admin/PlayersTable.tsx`; ídem `StatsCards`, `ListTournaments`, `DialogAddTournaments`, `player-form`, y `lib/calcularEdad.ts` == `modules/shared/utils/calcularEdad.ts`. También hay dobles: `lib/formatDate.ts` vs `modules/shared/utils/formatDate.ts` (difieren), `components/admin/match-dialog.tsx` vs `DialogAddEditMatch.tsx`.
- **Impacto:** Cada fix hay que hacerlo dos veces; ya hay divergencias silenciosas.
- **Solución:** Elegir `modules/` como única fuente (coincide con docs/ARQUITECTURA.md), borrar duplicados de `app/` y `lib/`, y actualizar imports. Agregar regla ESLint `no-restricted-imports` para prevenir regresiones.
- **Esfuerzo:** E:Medio · **Beneficio:** −30% superficie de mantenimiento.

### A2. Dashboard admin de torneos con contadores rotos

- [ ] **Problema:** Compara `t.status === "En curso"` y `"Inscripciones"` (labels de UI) contra el enum real (`ACTIVO`, `INSCRIPCION`) → esos KPIs siempre muestran 0. Verificado en [app/admin/torneos/page.tsx:55](app/admin/torneos/page.tsx#L55) y [:66](app/admin/torneos/page.tsx#L66).
- **Solución:** Comparar contra `TournamentStatus.ACTIVO` / `INSCRIPCION` y mapear labels solo para mostrar (usar `lib/constants.ts`).
- **Esfuerzo:** E:Bajo · **Beneficio:** Métricas correctas para el admin.

### A3. Consultas pesadas y sin paginación (N+1 / payload gigante)

- [ ] **Problema:** `getTorneoById` incluye 6 niveles de relaciones (torneo → teams → players + matches → goals/cards → teamPlayer → player → team) ([modules/torneos/actions/getTorneoById.ts](modules/torneos/actions/getTorneoById.ts)); `GET /api/matches` devuelve **todos** los partidos de la BD con includes profundos; players/noticias/torneos sin `page/limit`.
- **Solución:** `select` mínimo por vista, paginación (`cursor` o `skip/take`) con metadatos `{ data, total, page }`, y dividir el detalle de torneo en queries por tab (standings / fixture / plantel se cargan al abrir cada tab).
- **Esfuerzo:** E:Alto · **Beneficio:** Escala a torneos grandes; TTFB estable.

### A4. Sincronización de usuarios Clerk↔BD incompleta

- [ ] **Problema:** No existe webhook de Clerk (verificado: 0 referencias a svix/webhook). Consecuencias: `lastLoginAt` y `emailVerified` **nunca se actualizan** (la UI de usuarios muestra "Nunca"); si un usuario cambia email/foto o se elimina en Clerk, la BD queda desincronizada; `checkUser()` hace find+create sin manejar la race (dos requests simultáneas → error P2002) y corre una query por cada request de página.
- **Solución:** Crear `app/api/webhooks/clerk/route.ts` (svix) para `user.created/updated/deleted` + `session.created` (actualiza `lastLoginAt`); en `checkUser` usar `upsert` y cachear con `React.cache()` por request.
- **Esfuerzo:** E:Medio · **Beneficio:** Datos de usuarios reales y confiables; menos queries.

### A5. Sin manejo global de errores ni estados de carga

- [ ] **Problema:** 0 archivos `error.tsx`/`global-error.tsx` en todo `app/`; solo 2 `loading.tsx` (noticias y usuarios admin). Un throw en un server component muestra la pantalla de error cruda de Next.
- **Solución:** `app/error.tsx` + `app/global-error.tsx` con diseño Premium Golazo (reutilizar estilo del NotFound ya rediseñado) y `loading.tsx` por sección con skeletons.
- **Esfuerzo:** E:Medio · **Beneficio:** Resiliencia percibida de nivel producto.

### A6. Prisma: índices ausentes y modelo legacy conviviendo

- [ ] **Problema:**
  - Sin índices en: `Match(tournamentId, dateTime)`, `Match(status)`, `Goal(matchId)`, `Card(matchId)`, `TeamPlayer(tournamentTeamId)`, `Tournament(status, deletedAt)`, `News(published, publishedAt)`, `User(role, status)`.
  - `Phase`/`phaseId` (legacy) convive con `TournamentPhase` en Tournament y Match — dos caminos para lo mismo.
  - `News.publishedAt` tiene `@default(now())` aunque sea borrador (orden de publicación falso).
  - `Team.yearFounded` es `String` (sin validación ni orden).
  - `Tournament.nextMatch` es un dato derivable (denormalización manual propensa a quedar vieja).
- **Solución:** Migración única: agregar `@@index`, migrar datos de `Phase`→`TournamentPhase` y eliminar el modelo legacy, `publishedAt DateTime?` (se setea al publicar), `yearFounded Int?`, y calcular `nextMatch` con query en lugar de campo.
- **Esfuerzo:** E:Medio-Alto · **Beneficio:** Queries rápidas y un solo modelo mental de fases.

### A7. Formato de respuesta de API inconsistente

- [ ] **Problema:** Mezcla de formas: `NextResponse.json(match)`, `{ success, error, message }`, `new NextResponse("texto")`, y `GET /api/tournaments` devuelve **200 con `{message}`** cuando no hay resultados (el cliente espera array → runtime error).
- **Solución:** Helper `apiResponse.ts` (`ok(data, meta?)` / `fail(status, code, message)`) y usarlo en el 100% de las rutas. Listas vacías devuelven `[]`, no mensajes.
- **Esfuerzo:** E:Medio · **Beneficio:** Frontend predecible, menos `any` defensivos.

### A8. Testing inexistente + sin CI

- [ ] **Problema:** 0 tests, no hay `.github/workflows`, ni scripts de test. `npm run lint` es la única verificación.
- **Solución (mínimo viable):**
  1. Vitest + unit tests de `lib/standings/*` y validadores Zod (la lógica más crítica y más testeable).
  2. Playwright con 3 flujos E2E: crear torneo → agregar equipos → cargar resultado → verificar tabla.
  3. GitHub Actions: `lint + tsc --noEmit + vitest + build` en cada PR.
- **Esfuerzo:** E:Alto · **Beneficio:** Red de seguridad para refactors (especialmente C6/A6).

### A9. Dependencias: mismatch y sobrepeso

- [ ] **Problema:** `eslint-config-next@15.3.5` con `next@16.1.5` (reglas desactualizadas); **tres** librerías de animación (framer-motion + gsap + ogl) — verificar si gsap/ogl se usan más allá de `Particles.tsx`; `ts-node` innecesario con seeds en JS.
- **Solución:** Alinear `eslint-config-next@16`, consolidar animaciones en framer-motion (o CSS), eliminar deps sin uso (`npx depcheck`).
- **Esfuerzo:** E:Bajo · **Beneficio:** Bundle menor, lint correcto para Next 16.

### A10. `console.log` con datos de usuario en server

- [ ] **Problema:** 20 `console.log` incluyendo el objeto usuario completo en [app/admin/layout.tsx](app/admin/layout.tsx) y [app/page.tsx](app/page.tsx) (PII en logs de hosting).
- **Solución:** Eliminarlos; introducir logger mínimo (`lib/logger.ts` con niveles y no-op en prod) para lo que valga la pena conservar.
- **Esfuerzo:** E:Bajo · **Beneficio:** Sin PII en logs; ruido cero.

---

## 🟡 MEDIO — Calidad, performance y UX transversal (Sprints 4-5)

### M1. Minimizar datos expuestos en APIs públicas

- [ ] Noticias/torneos públicos incluyen el objeto `user` completo (email, phone, role del autor). Usar `select: { name, imageUrl }`. **E:Bajo**

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

### M10. Estados vacíos y skeletons consistentes

- [ ] Crear componentes `<EmptyState icon título descripción acción/>` y `<SkeletonTable/>`, `<SkeletonCards/>` reutilizables (hoy cada página improvisa o no tiene). **E:Medio**

### M11. Reglas de negocio de torneo incompletas (casos borde)

- [ ] No se valida: equipo jugando contra sí mismo (`homeTeamId === awayTeamId`), partidos entre equipos que no pertenecen al torneo, resultados negativos, partido FINALIZADO sin scores, torneo con `endDate < startDate`, edición de resultados de torneos FINALIZADOS/ARCHIVADOS, jugador duplicado en dos equipos del mismo torneo (permitido hoy — ¿regla?). Codificar estas invariantes en los validadores Zod + checks de negocio. **E:Medio**

### M12. Máquina de estados de torneo y partido

- [ ] Hoy cualquier status puede saltar a cualquier otro. Definir transiciones válidas (`BORRADOR→INSCRIPCION→PENDIENTE→ACTIVO→FINALIZADO→ARCHIVADO`, etc.) en un helper `canTransition(from, to)` compartido por API y UI (deshabilitar opciones inválidas en selects). **E:Medio**

### M13. Revisión de enums sobredimensionados (decisión tomada ✅)

- [ ] Reemplazar `TournamentCategory` por 3 campos: `ageGroup` (enum: LIBRE, SUB_17, SUB_20, JUVENIL, INFANTIL, VETERANO, M30, ...), `gender` (enum: MASCULINO, FEMENINO, MIXTO) y `division` (String opcional: "A", "Primera", ...). Actualizar formularios, filtros públicos y badges. Ejecutar en la misma migración que A6.
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
- [ ] **S2. Multi-tenancy con organizaciones/ligas (E:Alto, decisión tomada ✅ — el producto es SaaS multi-liga):** modelo `Organization` (dueño, miembros con roles por organización, branding propio, slug `/liga/[slug]`); `Tournament`, `Team`, `Player`, `Referee` y `News` referencian `organizationId`. Evaluar Clerk Organizations para membresías. Diseñar el schema en el Sprint 3 (junto con A6) aunque la UI llegue después, para no migrar dos veces.
- [ ] **S3. Inscripción online de equipos (E:Alto):** flujo público — organizador publica torneo con cupos y fecha límite → delegados registran equipo + plantel → organizador aprueba/rechaza. Estados `INSCRIPCION` ya existen en el enum; falta el workflow. Opcional: cobro de inscripción con Mercado Pago.
- [ ] **S4. Página pública compartible + QR (E:Medio):** URL limpia por torneo con OG image dinámica (marcador/tabla), botón compartir por WhatsApp (canal #1 en ligas amateur) y QR imprimible.
- [ ] **S5. Notificaciones (E:Medio):** in-app (campana con no-leídas) + email (Resend) para: resultado cargado, próximo partido, equipo aprobado. Base: modelo `Notification` + preferencias por usuario.
- [ ] **S6. Live match center (E:Alto):** marcador en vivo minuto a minuto (el admin carga eventos, el público ve actualizado con polling/SSE). Gran diferenciador para ligas locales.
- [ ] **S7. Estadísticas avanzadas (E:Medio):** goleadores, valla menos vencida, fair play (ya hay Cards), racha de equipos, historial head-to-head — todos los datos ya existen en Goal/Card/Match.
- [ ] **S8. Exportables (E:Bajo-Medio):** fixture y tabla en PDF con branding, planteles en CSV. Muy pedido por organizadores.
- [ ] **S9. PWA (E:Medio):** manifest + service worker; los usuarios finales lo usan desde el celular en la cancha.
- [ ] **S10. Multi-deporte (E:Alto, evaluar):** campo `sport` en Tournament con configuración de puntaje por deporte (básquet/vóley no usan 3-1-0). Solo si el negocio lo pide; diseñarlo en S2 para no migrar dos veces.
- [ ] **S11. Billing/planes freemium (E:Alto, post-MVP):** límite de torneos/equipos por plan, Stripe o Mercado Pago Suscripciones. Depende de S2.

---

## 📅 Roadmap sugerido

| Sprint | Contenido | Resultado |
|---|---|---|
| 1 | C1–C9 completos | Producto seguro; datos íntegros |
| 2 | A1, A2, A4, A5, A7, A10 | Base de código única y honesta |
| 3 | A3, A6 + M13 + schema `Organization` (S2) en una sola migración, A8 (tests de standings + CI) | Escalable, multi-tenant a nivel datos y con red de seguridad |
| 4 | F0 + M6 + M10 (design system) | Fundaciones visuales |
| 5 | F2 + F3 (rediseño público y admin) + M2, M7 | UI nivel SaaS |
| 6 | M3, M4, M8, M9, M11, M12 + F4 | Pulido enterprise |
| 7+ | S1 → S2 → S3 → S4/S5 | Diferenciación de producto |

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
