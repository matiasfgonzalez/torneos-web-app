## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## PRISMA

Instalar prisma

```
npm i -D prisma
```

Inicializar Prisma y crear estructura

```
npx prisma init
```

Esto crea el archivo prisma/schema.prisma y el .env para la conexión a la base de datos.

Generar cliente Prisma

```
npx prisma generate
```

Esto genera el cliente que permite hacer consultas desde tu código TypeScript.

Crear migración y aplicar a la base de datos

```
npx prisma migrate dev

npx prisma migrate dev --name init
```

Esto crea una migración y sincroniza tu base de datos con los modelos del schema.
