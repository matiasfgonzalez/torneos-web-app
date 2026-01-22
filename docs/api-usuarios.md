# API de Gestión de Usuarios

Este documento describe las APIs REST creadas para el sistema de gestión de usuarios en el panel de administración.

## 🔧 Configuración Previa

Antes de usar las APIs, es necesario ejecutar las migraciones de Prisma para actualizar la base de datos:

```bash
# Ejecutar migración para agregar nuevos campos al modelo User
npx prisma migrate dev --name add-user-fields

# Generar cliente de Prisma actualizado
npx prisma generate
```

## 📊 Endpoints Disponibles

### 1. Listar Usuarios

**GET** `/api/users`

Obtiene una lista paginada de usuarios con filtros opcionales.

#### Parámetros de consulta:

- `search` (string): Búsqueda por nombre, email, teléfono o ubicación
- `role` (string): Filtrar por rol (`ADMIN`, `MODERATOR`, `EDITOR`, `ORGANIZER`, `USER`)
- `status` (string): Filtrar por estado (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING`)
- `sortBy` (string): Campo para ordenar (`name`, `email`, `createdAt`, `lastLoginAt`)
- `sortOrder` (string): Orden (`asc`, `desc`)
- `page` (number): Número de página (por defecto: 1)
- `limit` (number): Elementos por página (por defecto: 10)

#### Ejemplo de uso:

```bash
GET /api/users?search=juan&role=EDITOR&status=ACTIVE&page=1&limit=20
```

#### Respuesta:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "Usuario Ejemplo",
      "imageUrl": "https://...",
      "phone": "+34 600 000 000",
      "location": "Madrid, España",
      "bio": "Biografía del usuario",
      "role": "EDITOR",
      "status": "ACTIVE",
      "lastLoginAt": "2025-10-07T10:00:00Z",
      "emailVerified": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-10-07T10:00:00Z",
      "_count": {
        "news": 5,
        "tournaments": 2,
        "teams": 1
      }
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2. Crear Usuario

**POST** `/api/users`

Crea un nuevo usuario en el sistema.

#### Cuerpo de la petición:

```json
{
  "email": "nuevo@example.com",
  "name": "Nuevo Usuario",
  "phone": "+34 600 000 000",
  "location": "Barcelona, España",
  "bio": "Biografía del nuevo usuario",
  "role": "USER",
  "status": "PENDING",
  "imageUrl": "https://...",
  "clerkUserId": "clerk_user_id"
}
```

#### Respuesta:

```json
{
  "success": true,
  "data": {
    "id": "nuevo-uuid",
    "email": "nuevo@example.com",
    "name": "Nuevo Usuario"
    // ... otros campos
  },
  "message": "Usuario creado exitosamente"
}
```

### 3. Obtener Usuario Específico

**GET** `/api/users/[id]`

Obtiene los detalles completos de un usuario, incluyendo estadísticas y actividad reciente.

#### Respuesta:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Usuario Ejemplo",
    // ... campos básicos
    "news": [
      {
        "id": "news-uuid",
        "title": "Noticia reciente",
        "summary": "Resumen...",
        "published": true,
        "publishedAt": "2025-10-07T10:00:00Z"
      }
    ],
    "tournaments": [
      {
        "id": "tournament-uuid",
        "name": "Torneo ejemplo",
        "status": "ACTIVO",
        "startDate": "2025-10-15T00:00:00Z",
        "category": "LIBRE"
      }
    ],
    "teams": [
      {
        "id": "team-uuid",
        "name": "Equipo ejemplo",
        "shortName": "EQ",
        "enabled": true
      }
    ],
    "auditLogs": [
      {
        "id": "log-uuid",
        "action": "UPDATE_USER",
        "entity": "User",
        "createdAt": "2025-10-07T10:00:00Z"
      }
    ],
    "stats": {
      "recent": {
        "news": 2,
        "tournaments": 1,
        "activity": 5
      },
      "total": {
        "news": 10,
        "tournaments": 3,
        "teams": 2,
        "auditLogs": 25
      }
    }
  }
}
```

### 4. Actualizar Usuario

**PUT** `/api/users/[id]`

Actualiza la información de un usuario existente.

#### Cuerpo de la petición:

```json
{
  "name": "Nombre actualizado",
  "phone": "+34 600 111 111",
  "location": "Valencia, España",
  "bio": "Biografía actualizada",
  "role": "MODERATOR",
  "status": "ACTIVE",
  "imageUrl": "https://nueva-imagen.jpg",
  "emailVerified": true
}
```

#### Respuesta:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Nombre actualizado"
    // ... campos actualizados
  },
  "message": "Usuario actualizado exitosamente"
}
```

### 5. Eliminar Usuario (Lógico)

**DELETE** `/api/users/[id]`

Realiza una eliminación lógica del usuario (marca como inactivo).

#### Respuesta:

```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

### 6. Estadísticas de Usuarios

**GET** `/api/users/stats`

Obtiene métricas y estadísticas generales del sistema de usuarios.

#### Respuesta:

```json
{
  "success": true,
  "data": {
    "overview": {
      "total": 150,
      "active": 120,
      "inactive": 15,
      "suspended": 10,
      "pending": 5,
      "emailVerified": 140,
      "recentLogins": 80
    },
    "roleDistribution": {
      "admin": 2,
      "moderator": 5,
      "editor": 15,
      "organizer": 8,
      "user": 120
    },
    "statusDistribution": {
      "active": 120,
      "inactive": 15,
      "suspended": 10,
      "pending": 5
    },
    "growth": {
      "last24Hours": 2,
      "last7Days": 8,
      "last30Days": 25,
      "byMonth": [
        {
          "month": 1,
          "year": 2025,
          "count": 10,
          "label": "ene 2025"
        }
      ]
    },
    "activity": {
      "totalNews": 50,
      "totalTournaments": 20,
      "totalTeams": 30,
      "averageContentPerUser": 0.67
    },
    "percentages": {
      "activeUsers": 80,
      "emailVerified": 93,
      "recentActivity": 53
    }
  },
  "timestamp": "2025-10-07T10:00:00Z"
}
```

## 🔐 Roles y Permisos

### Jerarquía de Roles:

1. **USER** (Nivel 1): Acceso básico
2. **EDITOR** (Nivel 2): Puede crear contenido
3. **ORGANIZER** (Nivel 3): Gestiona torneos y equipos
4. **MODERATOR** (Nivel 4): Modera contenido y usuarios
5. **ADMIN** (Nivel 5): Acceso completo

### Estados de Usuario:

- **PENDING**: Pendiente de activación
- **ACTIVE**: Usuario activo
- **INACTIVE**: Usuario inactivo temporalmente
- **SUSPENDED**: Usuario suspendido

## 🚨 Manejo de Errores

Todas las APIs devuelven errores en el siguiente formato:

```json
{
  "success": false,
  "error": "Tipo de error",
  "message": "Descripción detallada del error"
}
```

### Códigos de estado HTTP:

- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Datos de entrada inválidos
- `404`: Recurso no encontrado
- `409`: Conflicto (email duplicado)
- `500`: Error interno del servidor

## 📝 Notas Importantes

1. **Auditoría**: Todas las operaciones de actualización y eliminación se registran en `AuditLog`
2. **Eliminación Lógica**: Los usuarios no se eliminan físicamente, solo se marcan como inactivos
3. **Paginación**: Por defecto se devuelven 10 elementos por página
4. **Filtros**: Se pueden combinar múltiples filtros en una sola consulta
5. **Búsqueda**: La búsqueda es insensible a mayúsculas y minúsculas

## 🔄 Integración con Clerk

El sistema está preparado para integrarse con Clerk Auth:

- Campo `clerkUserId` para vincular con la autenticación externa
- Campo `emailVerified` para controlar verificación de email
- Campo `lastLoginAt` para rastrear actividad

Para producción, se recomienda integrar estas APIs con el sistema de autenticación de Clerk para mayor seguridad.
