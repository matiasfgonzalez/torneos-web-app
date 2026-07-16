/**
 * Transición de página (F4).
 *
 * `template.tsx` (a diferencia de `layout.tsx`) se **remonta en cada
 * navegación**, así que su animación de entrada corre en cada cambio de ruta
 * sin una línea de JS ni estado.
 *
 * Es un fade de 200ms con 4px de subida (`.page-transition` en globals.css), y
 * se anula bajo `prefers-reduced-motion`. Deliberadamente corto: una transición
 * de página que se nota es una transición que estorba — el trabajo del
 * organizador es cargar resultados, no mirar cómo entra la pantalla.
 *
 * ⚠️ No es `<ViewTransition>` de React (ver F4 en TODO.md): eso exige el canal
 * experimental de React, que no vale el riesgo por un efecto cosmético.
 */
export default function Template({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="page-transition">{children}</div>;
}
