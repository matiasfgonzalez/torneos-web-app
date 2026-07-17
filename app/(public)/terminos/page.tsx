import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/shared/LegalPage";
import { getSiteSettings } from "@modules/configuracion/actions/siteSettings";

export const metadata: Metadata = {
  title: "Términos y Condiciones | GOLAZO",
  description:
    "Términos y condiciones de uso de GOLAZO, la plataforma de gestión de torneos de fútbol amateur.",
};

/**
 * Términos y condiciones (A10/N14b). El contenido describe lo que el producto
 * hace DE VERDAD (roles, planes, retención de datos) — regla F4: el copy legal
 * no promete ni amenaza nada distinto de lo que el server hace.
 *
 * ⚠️ Borrador fundacional redactado desde el comportamiento real del sistema:
 * requiere revisión de un profesional legal antes del lanzamiento comercial.
 */
export default async function TerminosPage() {
  const settings = await getSiteSettings();
  const contacto = settings.contactEmail ?? "el canal de contacto del sitio";

  const sections: LegalSection[] = [
    {
      id: "aceptacion",
      title: "Quiénes somos y aceptación",
      body: (
        <>
          <p>
            GOLAZO es una plataforma web para organizar y difundir torneos de
            fútbol amateur: fixture, tabla de posiciones, resultados,
            estadísticas, planteles e inscripciones.
          </p>
          <p>
            Al crear una cuenta o usar el sitio aceptás estos términos y la{" "}
            <Link href="/privacidad" className="font-medium text-brand hover:underline">
              Política de Privacidad
            </Link>
            . Si no estás de acuerdo con alguna parte, no uses la plataforma.
          </p>
        </>
      ),
    },
    {
      id: "el-servicio",
      title: "El servicio",
      body: (
        <>
          <p>
            GOLAZO provee la herramienta; las competencias las organizan las
            ligas que usan la plataforma. Los torneos, equipos, jugadores,
            resultados y sanciones los cargan las propias ligas, sus
            colaboradores y los delegados de los equipos. GOLAZO no organiza
            torneos ni participa de las decisiones deportivas.
          </p>
          <p>
            El servicio incluye páginas públicas de ligas, torneos, equipos,
            jugadores y partidos, pensadas para la difusión de las
            competencias.
          </p>
        </>
      ),
    },
    {
      id: "cuentas",
      title: "Cuentas y registro",
      body: (
        <>
          <p>
            El registro se hace con una cuenta de Google. Te comprometés a que
            los datos de tu cuenta sean veraces y sos responsable de la
            actividad que se haga con ella.
          </p>
          <ul>
            <li>
              Para registrarte tenés que ser mayor de 18 años, o tener al menos
              13 años y contar con autorización de tus padres o tutores.
            </li>
            <li>
              Una misma cuenta puede tener varios roles a la vez (hincha,
              jugador, delegado, miembro de una liga). Ningún rol excluye a
              otro.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "roles",
      title: "Roles y responsabilidades",
      body: (
        <>
          <ul>
            <li>
              <strong className="text-gray-900 dark:text-white">Hincha:</strong>{" "}
              puede seguir torneos y equipos. No gestiona datos de terceros.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Jugador:</strong>{" "}
              puede vincular a su cuenta la ficha que lo representa,
              acreditando su identidad con su DNI. Está prohibido reclamar la
              ficha de otra persona. La vinculación la confirma la liga o el
              delegado que lo conoce.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">
                Delegado de equipo:
              </strong>{" "}
              representa a un equipo ante una liga (que debe aprobarlo). Al
              cargar el plantel declara contar con la autorización del club y
              el consentimiento de cada jugador que carga (o de sus padres o
              tutores, si es menor).
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">
                Liga (organización):
              </strong>{" "}
              el dueño de la liga contrata el plan, invita miembros y es
              responsable de los datos que su organización carga, de aprobar
              delegados e inscripciones y de resolver los reclamos de fichas de
              sus competencias.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">
                Organizador y colaborador:
              </strong>{" "}
              miembros invitados por la liga. El organizador gestiona las
              competencias existentes; el colaborador solo carga resultados y
              eventos de partido.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "datos-de-terceros",
      title: "Datos de terceros",
      body: (
        <p>
          Quien carga datos de otra persona (por ejemplo, la ficha de un
          jugador con su DNI, fecha de nacimiento o foto) declara contar con el
          consentimiento del titular — y con el de sus padres o tutores si es
          menor de edad. El detalle del tratamiento de datos está en la{" "}
          <Link href="/privacidad" className="font-medium text-brand hover:underline">
            Política de Privacidad
          </Link>
          .
        </p>
      ),
    },
    {
      id: "planes-y-pagos",
      title: "Planes y pagos",
      body: (
        <>
          <ul>
            <li>
              El plan Gratis es permanente y no requiere datos de pago. Tiene
              límites de uso (cantidad de torneos activos, equipos por torneo y
              miembros).
            </li>
            <li>
              Los planes pagos amplían esos límites. Se abonan por
              transferencia informando el comprobante desde el panel; el plan
              se activa cuando el pago es aprobado.
            </li>
            <li>
              La renovación no es automática: al vencer el período pagado, la
              organización vuelve a los límites del plan Gratis.{" "}
              <strong className="text-gray-900 dark:text-white">
                Nunca se borran ni se ocultan los datos ya cargados
              </strong>{" "}
              por un vencimiento.
            </li>
            <li>
              Los precios pueden cambiar; un cambio de precio nunca afecta un
              período ya pagado.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "contenido-publico",
      title: "Contenido público",
      body: (
        <p>
          Las tablas de posiciones, los resultados, el fixture y las fichas
          deportivas de equipos y jugadores son públicos: ese es el propósito
          de difusión de la plataforma. Los datos de contacto y los documentos
          de identidad nunca se publican (ver la Política de Privacidad).
        </p>
      ),
    },
    {
      id: "conducta",
      title: "Conducta prohibida",
      body: (
        <ul>
          <li>Suplantar la identidad de otra persona o reclamar su ficha.</li>
          <li>Cargar datos falsos o de personas que no dieron consentimiento.</li>
          <li>
            Subir contenido ofensivo, discriminatorio o que infrinja derechos
            de terceros (incluidas imágenes sin autorización).
          </li>
          <li>
            Interferir con el servicio: accesos no autorizados, extracción
            masiva de datos, o cualquier uso que degrade la plataforma para el
            resto.
          </li>
        </ul>
      ),
    },
    {
      id: "suspension",
      title: "Suspensión de cuentas y organizaciones",
      body: (
        <p>
          El incumplimiento de estos términos (incluida la falta de pago
          comprometido o el uso abusivo) puede derivar en la suspensión de la
          cuenta o de la organización. Una organización suspendida no puede
          crear ni modificar datos; la información ya cargada se conserva según
          la política de retención.
        </p>
      ),
    },
    {
      id: "propiedad",
      title: "Propiedad intelectual",
      body: (
        <>
          <p>
            La plataforma (software, diseño y marca GOLAZO) es propiedad de sus
            titulares. Los datos deportivos cargados pertenecen a sus titulares
            y a las ligas que los administran; al cargarlos nos otorgás una
            licencia para almacenarlos y mostrarlos dentro del servicio,
            incluida su difusión pública descripta arriba.
          </p>
        </>
      ),
    },
    {
      id: "responsabilidad",
      title: "Disponibilidad y responsabilidad",
      body: (
        <>
          <p>
            El servicio se presta “tal cual”. Trabajamos para que esté siempre
            disponible, pero no garantizamos disponibilidad ininterrumpida ni
            ausencia de errores.
          </p>
          <p>
            Las decisiones deportivas (resultados, sanciones, inscripciones,
            aprobaciones) son de las ligas: GOLAZO no es parte de las disputas
            entre ligas, equipos y jugadores, que deben resolverse ante la
            organización correspondiente.
          </p>
        </>
      ),
    },
    {
      id: "cambios",
      title: "Cambios a estos términos",
      body: (
        <p>
          Podemos actualizar estos términos. Si el cambio es sustancial, lo
          vamos a anunciar en el sitio con anticipación razonable. Seguir
          usando la plataforma después de un cambio implica aceptarlo.
        </p>
      ),
    },
    {
      id: "ley-aplicable",
      title: "Ley aplicable y jurisdicción",
      body: (
        <p>
          Estos términos se rigen por las leyes de la República Argentina.
          Cualquier controversia se somete a los tribunales ordinarios
          competentes de la República Argentina.
        </p>
      ),
    },
    {
      id: "contacto",
      title: "Contacto",
      body: (
        <p>
          Ante cualquier consulta sobre estos términos, escribinos a{" "}
          {settings.contactEmail ? (
            <a
              href={`mailto:${settings.contactEmail}`}
              className="font-medium text-brand hover:underline"
            >
              {settings.contactEmail}
            </a>
          ) : (
            contacto
          )}
          .
        </p>
      ),
    },
  ];

  return (
    <LegalPage
      title="Términos y Condiciones"
      updatedAt="17 de julio de 2026"
      intro={
        <p>
          Estos términos regulan el uso de GOLAZO. Están escritos para leerse:
          describen lo que la plataforma hace de verdad — quién puede hacer
          qué, cómo funcionan los planes y qué pasa con tus datos.
        </p>
      }
      sections={sections}
    />
  );
}
