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

Install @clerk/nextjs Run the following command to install the SDK:

```
npm install @clerk/nextjs
```

## Tamaño de las imagenes para mantener la relacion aspecto

16:9 -> w:1312 px h:736 px

Para una imagen con w de 960 px

Relaciones de aspecto recomendadas:

1. 16:9 (estándar moderno, ideal para noticias, videos, tarjetas amplias)
   📏 Alto = 960 × 9 / 16 = 540 px

✅ Resultado: 960 × 540

2. 4:3 (más cuadrada, buena para contenido editorial)
   📏 Alto = 960 × 3 / 4 = 720 px

✅ Resultado: 960 × 720

3. 3:2 (más fotográfica, estilo portada de nota o blog)
   📏 Alto = 960 × 2 / 3 ≈ 640 px

✅ Resultado: 960 × 640

4. 1:1 (cuadrada, estilo redes sociales o miniaturas)
   📏 Alto = 960

✅ Resultado: 960 × 960
