import type React from "react";
import Link from "next/link";

/**
 * Shell de página legal (/terminos, /privacidad — A10/N14b). Texto largo:
 * columna angosta legible, índice con anclas y secciones numeradas con
 * `scroll-mt` para que el header sticky no tape el título al saltar.
 *
 * Server component puro: recibe las secciones como data y las renderiza.
 */

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  title: string;
  /** "17 de julio de 2026" — se muestra como "Última actualización". */
  updatedAt: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}

export function LegalPage({
  title,
  updatedAt,
  intro,
  sections,
}: Readonly<LegalPageProps>) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
      <header className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand">
          Legal
        </p>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Última actualización: {updatedAt}
        </p>
        <div className="mt-6 space-y-3 leading-relaxed text-gray-600 dark:text-gray-300">
          {intro}
        </div>
      </header>

      {/* Índice */}
      <nav
        aria-label="Contenido de esta página"
        className="mb-12 rounded-2xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-700"
      >
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
          En esta página
        </h2>
        <ol className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {sections.map((section, index) => (
            <li key={section.id}>
              <Link
                href={`#${section.id}`}
                className="inline-flex items-baseline gap-2 py-0.5 text-gray-600 transition-colors hover:text-brand dark:text-gray-300 dark:hover:text-brand"
              >
                <span className="text-xs font-semibold tabular-nums text-gray-400 dark:text-gray-500">
                  {index + 1}.
                </span>
                {section.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-12">
        {sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="scroll-mt-28"
          >
            <h2
              id={`${section.id}-title`}
              className="mb-4 flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-white"
            >
              <span
                aria-hidden="true"
                className="h-6 w-1 shrink-0 rounded-full bg-gradient-to-b from-brand to-brand-2"
              />
              <span>
                <span className="mr-2 text-gray-400 tabular-nums dark:text-gray-500">
                  {index + 1}.
                </span>
                {section.title}
              </span>
            </h2>
            <div className="space-y-3 leading-relaxed text-gray-600 dark:text-gray-300 [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
              {section.body}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
