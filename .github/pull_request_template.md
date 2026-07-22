## Qué cambia y por qué

<!-- Dos o tres líneas. El "por qué" es lo que no se puede leer del diff. -->

## Cómo lo verificaste

<!-- Qué ejercitaste de verdad: la pantalla en el navegador, un round-trip contra
     la BD, un test. "Compila" no es verificar. -->

---

## ¿Toca `prisma/schema.prisma`?

**Si no, borrá esta sección.** Si sí, el CI ya comprueba que las migraciones
apliquen desde cero y que no falte ninguna — esto es lo que el CI **no** puede
saber por vos:

- [ ] La migración se generó con `npx prisma migrate dev`, **no** con `db push`.
      `db push` cambia tu base y no deja archivo: el cambio anda en tu máquina y
      falta en el deploy.
- [ ] El archivo de `prisma/migrations/` está **commiteado** (no solo el schema).
- [ ] Si la escribiste a mano, está dicho en la descripción **por qué**. Es
      válido y ya pasó acá: la de identidad global del jugador se escribió a mano
      porque `migrate dev` avisaba de pérdida de datos y había que decidir el
      backfill.
- [ ] **¿Es destructiva?** `DROP COLUMN`, `DROP TABLE`, pasar una columna a
      `NOT NULL`, o agregar un `@unique`. Si sí: ¿qué pasa con las filas que ya
      existen? Un `@unique` nuevo **aborta la migración** si hay duplicados —
      mejor que los borre una decisión de negocio y no un `UPDATE` a ciegas.
- [ ] Si hace falta **backfill**, está en la misma migración y el valor de
      relleno se distingue de un dato real (precedente: `SIN-DNI-{id8}`, que la
      liga ve roto y corrige, en vez de un documento inventado que parece
      válido).
- [ ] Si agregaste un modelo con imágenes, su carpeta está registrada en
      `ALLOWED_UPLOAD_FOLDERS` (`types/cloudinary.ts`) y sus columnas de
      `publicId` se persisten — si no, los archivos quedan huérfanos en
      Cloudinary (M9).
- [ ] Si el modelo lleva `deletedAt`, **todos** los listados filtran
      `deletedAt: null`.
