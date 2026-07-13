import Link from "next/link";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { getSiteSettings } from "@modules/configuracion/actions/siteSettings";

const platformLinks = [
  { label: "Torneos", href: "/torneos" },
  { label: "Equipos", href: "/equipos" },
  { label: "Jugadores", href: "/jugadores" },
  { label: "Noticias", href: "/noticias" },
];

// Sin páginas propias todavía (ver TODO.md A10) — se muestran como texto,
// no como links muertos a "#".
const legalItems = ["Términos de Servicio", "Política de Privacidad", "Cookies"];

const DEFAULT_DESCRIPTION =
  "La plataforma líder para la gestión profesional de torneos deportivos. Organiza, gestiona y haz crecer tus competencias.";

/**
 * Footer público. Server component: lee la config editable desde
 * /admin/configuracion (modules/configuracion/actions/siteSettings.ts) para
 * que el contacto y las redes se puedan actualizar sin redeploy.
 */
export async function Footer() {
  const settings = await getSiteSettings();

  const socialLinks = [
    { icon: Facebook, label: "Facebook", href: settings.facebookUrl },
    { icon: Twitter, label: "Twitter", href: settings.twitterUrl },
    { icon: Instagram, label: "Instagram", href: settings.instagramUrl },
  ].filter((s): s is typeof s & { href: string } => !!s.href);

  const hasContact = settings.contactEmail || settings.contactPhone || settings.address;

  return (
    <footer className="relative bg-gray-900 dark:bg-gray-950 text-white overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#ad45ff]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#a3b3ff]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Línea decorativa superior con gradiente */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#ad45ff]/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sección principal */}
        <div className="py-16 lg:py-20">
          <div className="grid lg:grid-cols-6 gap-12 lg:gap-8">
            {/* Logo y descripción - ocupa 2 columnas */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#ad45ff]/25 group-hover:shadow-[#ad45ff]/40 transition-shadow">
                  <span className="text-lg">🏆</span>
                </div>
                <GradientText className="text-2xl font-bold">
                  GOLAZO
                </GradientText>
              </Link>

              <p className="text-gray-400 leading-relaxed max-w-sm">
                {settings.description || DEFAULT_DESCRIPTION}
              </p>

              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social w-10 h-10 bg-gray-800 hover:bg-gradient-to-br hover:from-[#ad45ff] hover:to-[#a3b3ff] rounded-xl flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-[#ad45ff]/25"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5 text-gray-400 group-hover/social:text-white transition-colors" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Enlaces - 4 columnas */}
            <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Plataforma */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
                  Plataforma
                </h3>
                <ul className="space-y-3">
                  {platformLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group/link text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1"
                      >
                        {link.label}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contacto — editable desde /admin/configuracion */}
              {hasContact && (
                <div className="col-span-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
                    Contacto
                  </h3>
                  <ul className="space-y-3 text-gray-400">
                    {settings.contactEmail && (
                      <li>
                        <a
                          href={`mailto:${settings.contactEmail}`}
                          className="hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          {settings.contactEmail}
                        </a>
                      </li>
                    )}
                    {settings.contactPhone && (
                      <li>
                        <a
                          href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`}
                          className="hover:text-white transition-colors inline-flex items-center gap-2"
                        >
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          {settings.contactPhone}
                        </a>
                      </li>
                    )}
                    {settings.address && (
                      <li className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{settings.address}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Legal */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
                  Legal
                </h3>
                <ul className="space-y-3">
                  {legalItems.map((item) => (
                    <li key={item} className="text-gray-500">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} GOLAZO. Todos los derechos
              reservados.
            </p>

            {/* Badges de confianza */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Todos los sistemas operativos</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-gray-700" />
              <div className="hidden sm:flex items-center gap-2 text-gray-500 text-sm">
                <span>🔒</span>
                <span>Conexión segura SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
