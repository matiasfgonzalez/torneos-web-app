# TODO Tecnico - GOLAZO

Backlog generado a partir del analisis integral del proyecto.

Criterio de prioridad:

- P0: Riesgo critico de seguridad o integridad de datos.
- P1: Alto impacto funcional o de mantenibilidad.
- P2: Mejora importante de robustez, performance o DX.
- P3: Refinamiento y deuda tecnica de bajo riesgo.

---

## P0 - Critico

### 1) Blindar endpoints con mass assignment

- Prioridad: P0
- Area: API
- Descripcion: Eliminar uso de data: { ...body } en rutas de mutacion. En su lugar, mapear campos permitidos de forma explicita y validar tipos.
- Evidencia:
  - app/api/team-player/route.ts
  - app/api/players/[id]/route.ts
  - app/api/matches/[id]/route.ts
- Criterio de aceptacion:
  - Ningun endpoint de mutacion usa spread del body.
  - Todos los campos actualizables estan whitelisteados.

### 2) Estandarizar validacion de entrada con Zod

- Prioridad: P0
- Area: API
- Descripcion: Crear esquemas por endpoint (POST/PATCH/PUT/DELETE) para torneos, equipos, jugadores, partidos, noticias, arbitros, asociaciones y usuarios.
- Criterio de aceptacion:
  - 100% de endpoints de mutacion validan request con Zod.
  - Errores de validacion devuelven status 400 y mensaje en espanol.

### 3) Corregir bug de ruta y actualizacion en jugadores por ID

- Prioridad: P0
- Area: API
- Descripcion: Revisar app/api/players/[id]/route.ts por inconsistencias de comentario/ruta y logica de actualizacion para evitar errores silenciosos.
- Criterio de aceptacion:
  - La ruta actualiza jugador por ID real.
  - La fecha se parsea de forma segura y no rompe si es null/undefined.

### 4) Definir estrategia Prisma compatible con version actual

- Prioridad: P0
- Area: Prisma
- Descripcion: Resolver incompatibilidad detectada sobre datasource url. Elegir una de dos rutas: mantener Prisma 6 correctamente o migrar a Prisma 7 con prisma.config.ts y adaptador.
- Criterio de aceptacion:
  - Sin errores de compilacion de Prisma en IDE/CI.
  - Flujo prisma generate + migrate funciona en local y deploy.

### 5) Endurecer permisos en Cloudinary Delete

- Prioridad: P0
- Area: Seguridad/API
- Descripcion: DELETE /api/cloudinary/delete hoy permite a cualquier usuario autenticado borrar imagenes por publicId. Restringir por rol y ownership del recurso.
- Criterio de aceptacion:
  - Solo roles autorizados pueden eliminar.
  - Se valida que el publicId pertenezca a una entidad permitida.

---

## P1 - Alto Impacto

### 6) Unificar autorizacion en todas las mutaciones

- Prioridad: P1
- Area: API/Auth
- Descripcion: Reemplazar verificaciones manuales de rol por validateApiRole y politicas consistentes por recurso.
- Evidencia:
  - app/api/team-player/route.ts
  - app/api/tournament-teams/route.ts
  - app/api/tournaments/[id]/recalculate/route.ts
- Criterio de aceptacion:
  - Todas las mutaciones usan validateApiRole o un wrapper equivalente.

### 7) Normalizar formato de errores de API

- Prioridad: P1
- Area: API
- Descripcion: Crear helper unico de respuesta de error y aplicarlo en todas las rutas.
- Criterio de aceptacion:
  - Formato uniforme: success, error, message, code.
  - Mensajes orientados al usuario siempre en espanol.

### 8) Aplicar transacciones en operaciones de standings

- Prioridad: P1
- Area: Backend/Prisma
- Descripcion: En create/update de partido y recalculo de tabla, agrupar operaciones de match + stats en db.$transaction para evitar desincronizacion.
- Evidencia:
  - app/api/matches/route.ts
  - app/api/matches/[id]/route.ts
  - lib/standings/calculate-standings.ts
- Criterio de aceptacion:
  - No hay estado parcial si una operacion falla.

### 9) Corregir recalculateTournamentStandings para fases

- Prioridad: P1
- Area: Backend/Prisma
- Descripcion: El recalculo resetea solo TournamentTeam y no TeamPhaseStats; puede duplicar/acumular en fase. Debe resetear ambas capas y recalcular coherentemente.
- Criterio de aceptacion:
  - Recalcular dos veces consecutivas produce el mismo resultado.

### 10) Introducir soft-delete consistente en torneos/equipos

- Prioridad: P1
- Area: API/Prisma
- Descripcion: Existen campos deletedAt en modelo, pero varios endpoints hacen delete fisico y/o listan sin filtrar deletedAt.
- Evidencia:
  - app/api/tournaments/[id]/route.ts (DELETE fisico)
  - app/api/tournaments/route.ts (GET sin deletedAt null)
- Criterio de aceptacion:
  - Politica de borrado definida por entidad.
  - Todos los listados respetan deletedAt y enabled cuando corresponda.

### 11) Optimizar query pesada getTorneoById

- Prioridad: P1
- Area: Backend
- Descripcion: Reducir includes profundos con select, paginacion y limites para matches/goals/cards/teamPlayer.
- Evidencia:
  - modules/torneos/actions/getTorneoById.ts
- Criterio de aceptacion:
  - Tiempo de respuesta controlado para torneos grandes.
  - Payload reducido sin perder datos necesarios.

### 12) Corregir estadisticas del dashboard admin de torneos

- Prioridad: P1
- Area: Frontend
- Descripcion: La pagina compara estados en texto (En curso, Inscripciones) pero los valores reales son enums (ACTIVO, INSCRIPCION), generando conteos incorrectos.
- Evidencia:
  - app/admin/torneos/page.tsx
- Criterio de aceptacion:
  - Conteos reflejan valores reales del enum.

### 13) Resolver endpoint GET /api/users/stats sin control de acceso

- Prioridad: P1
- Area: API/Security
- Descripcion: Exponer metricas de usuarios sin validateApiRole es un riesgo de privacidad e inteligencia de negocio.
- Evidencia:
  - app/api/users/stats/route.ts
- Criterio de aceptacion:
  - Endpoint protegido por rol ADMINISTRADOR.

### 14) Reducir complejidad cognitiva de PATCH en arbitros

- Prioridad: P1
- Area: API
- Descripcion: Refactorizar app/api/referees/[id]/route.ts en validadores y funciones auxiliares para mejorar mantenibilidad y testeo.
- Criterio de aceptacion:
  - Complejidad por debajo del umbral de lint.
  - Funcionalidad preservada por tests.

### 15) Eliminar logs sensibles o ruidosos en servidor

- Prioridad: P1
- Area: Backend/DX
- Descripcion: Quitar console.log de rutas/layouts y pasar a logger estructurado con niveles.
- Evidencia:
  - app/admin/layout.tsx
  - app/page.tsx
  - app/admin/torneos/page.tsx
- Criterio de aceptacion:
  - Sin logs de debug en produccion.

---

## P2 - Mejora Importante

### 16) Fortalecer indices de Prisma para consultas frecuentes

- Prioridad: P2
- Area: Prisma
- Descripcion: Agregar indices de uso real (filtros y orden): match.tournamentId/dateTime, teamPlayer.tournamentTeamId, goal.matchId, card.matchId, referee.deletedAt, user.isActive/status/role.
- Criterio de aceptacion:
  - Migracion aplicada.
  - Mejora medible de queries en endpoints principales.

### 17) Definir contrato de API publica minimizando datos sensibles

- Prioridad: P2
- Area: API
- Descripcion: Evitar include user completo en endpoints publicos de noticias/torneos; usar select minimo.
- Evidencia:
  - app/api/noticias/route.ts
  - app/api/noticias/[id]/route.ts
- Criterio de aceptacion:
  - Responses publicas no exponen campos internos innecesarios.

### 18) Implementar sanitizacion HTML en detalle de noticia

- Prioridad: P2
- Area: Frontend/Security
- Descripcion: Se usa dangerouslySetInnerHTML con contenido editable. Sanitizar con libreria segura antes de renderizar.
- Evidencia:
  - app/(public)/noticias/[id]/page.tsx
- Criterio de aceptacion:
  - Payload con script o onerror no se ejecuta.

### 19) Migrar imagenes img a componente optimizado

- Prioridad: P2
- Area: Frontend/Performance
- Descripcion: Reemplazar img por next/image en vistas principales para mejorar LCP y carga responsiva.
- Criterio de aceptacion:
  - Mejoras en Lighthouse (LCP/CLS) en paginas clave.

### 20) Añadir paginacion en listados masivos

- Prioridad: P2
- Area: API/Frontend
- Descripcion: GET de players, matches, noticias y torneos hoy puede devolver todo. Agregar page/limit/sort y metadatos.
- Criterio de aceptacion:
  - Endpoints soportan paginacion estable.
  - UI consume paginacion sin degradacion.

### 21) Centralizar cliente API en frontend

- Prioridad: P2
- Area: Frontend
- Descripcion: Evitar fetch disperso y manejo desigual de errores. Crear capa apiClient con interceptores de errores y tipado.
- Criterio de aceptacion:
  - Componentes consumen apiClient reutilizable.

### 22) Validar y normalizar fechas de entrada

- Prioridad: P2
- Area: API
- Descripcion: Reemplazar new Date(...) directo por z.coerce.date y guardas explicitas en torneos, jugadores y partidos.
- Criterio de aceptacion:
  - Inputs invalidos devuelven 400 predecible.

### 23) Consolidar politica de ownership de recursos

- Prioridad: P2
- Area: Auth
- Descripcion: Definir y aplicar si EDITOR/ORGANIZADOR pueden editar cualquier entidad o solo las creadas por ellos.
- Criterio de aceptacion:
  - Reglas documentadas y aplicadas en todas las mutaciones.

### 24) Revisar modelo YearFounded

- Prioridad: P2
- Area: Prisma
- Descripcion: Evaluar migracion de Team.yearFounded de String a Int para validacion y ordenamiento nativo.
- Criterio de aceptacion:
  - Si se migra, existe script de migracion segura y compatibilidad de UI.

### 25) Endurecer endpoint recalculate con idempotencia y lock

- Prioridad: P2
- Area: Backend
- Descripcion: Evitar recalculos concurrentes del mismo torneo con mecanismo de lock logico.
- Criterio de aceptacion:
  - Dos requests simultaneas no corrompen standings.

### 26) Aplicar CORS y rate limiting en /api

- Prioridad: P2
- Area: Seguridad/DevOps
- Descripcion: Configurar limites por IP y politica CORS segun entorno.
- Criterio de aceptacion:
  - Requests abusivas responden 429.
  - Origenes no permitidos bloqueados.

---

## P3 - Refinamiento y Calidad

### 27) Implementar suite de tests base

- Prioridad: P3
- Area: Testing
- Descripcion: Agregar tests unitarios para validadores y standings, integracion para API critica, y e2e para flujos admin/publicos.
- Criterio de aceptacion:
  - Pipeline con pruebas ejecutables y umbral minimo de cobertura.

### 28) Documentar contratos de API por endpoint

- Prioridad: P3
- Area: DX
- Descripcion: Crear documentacion de request/response/errores para endpoints de torneos, partidos, noticias y usuarios.
- Criterio de aceptacion:
  - Documentacion actualizada y consumible por frontend.

### 29) Refactor de naming y consistencia semantica

- Prioridad: P3
- Area: Código
- Descripcion: Corregir nombres engañosos (por ejemplo newTournament al crear Team, mensajes de error de torneo en rutas de equipo, comentarios desactualizados).
- Criterio de aceptacion:
  - Nombres y mensajes coherentes con entidad real.

### 30) Mejorar accesibilidad UI admin y publica

- Prioridad: P3
- Area: Frontend
- Descripcion: Auditar contraste, labels, foco y navegacion por teclado en tablas/dialogos.
- Criterio de aceptacion:
  - Sin issues criticos de accesibilidad en auditoria automatizada.

### 31) Definir versionado y estrategia de migraciones

- Prioridad: P3
- Area: DevOps/Prisma
- Descripcion: Establecer protocolo de migraciones en equipos y validacion previa en CI.
- Criterio de aceptacion:
  - Checklist de migraciones aprobado y documentado.

### 32) Crear .env.example oficial

- Prioridad: P3
- Area: DX/Security
- Descripcion: Publicar plantilla limpia de variables requeridas sin datos sensibles para onboarding.
- Criterio de aceptacion:
  - Nuevo desarrollador puede arrancar proyecto sin buscar claves en el codigo.

---

## Orden Sugerido de Ejecucion

1. Sprint 1: tareas 1, 2, 4, 5.
2. Sprint 2: tareas 6, 7, 8, 9, 13.
3. Sprint 3: tareas 10, 11, 12, 16, 18, 20.
4. Sprint 4: resto de P2 y P3.

## Nota

Este backlog esta pensado para cerrar brechas de seguridad, estabilidad e integridad de datos primero, y luego avanzar con performance, testing y escalabilidad.
