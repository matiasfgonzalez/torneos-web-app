import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/shared/LegalPage";
import { getSiteSettings } from "@modules/configuracion/actions/siteSettings";

export const metadata: Metadata = {
  title: "Política de Privacidad | GOLAZO",
  description:
    "Cómo GOLAZO trata los datos personales: qué datos se cargan, con qué finalidad, quién los ve y qué derechos tenés según la Ley 25.326.",
};

/**
 * Política de privacidad (A10/N12/N14b — Ley 25.326). La plataforma maneja
 * DNI de jugadores (incluidos menores): esta página es prerrequisito legal de
 * cobrar planes y de la autocreación de fichas (N14b).
 *
 * ⚠️ Borrador fundacional redactado desde el comportamiento real del sistema:
 * requiere revisión de un profesional legal antes del lanzamiento comercial.
 */
export default async function PrivacidadPage() {
  const settings = await getSiteSettings();
  const contacto = settings.contactEmail ?? "el canal de contacto del sitio";

  const sections: LegalSection[] = [
    {
      id: "responsable",
      title: "Responsable del tratamiento",
      body: (
        <p>
          GOLAZO es responsable de las bases de datos de la plataforma, en los
          términos de la Ley 25.326 de Protección de los Datos Personales de la
          República Argentina. Podés contactarnos por cualquier tema de datos
          personales a{" "}
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
    {
      id: "que-datos",
      title: "Qué datos se tratan",
      body: (
        <ul>
          <li>
            <strong className="text-gray-900 dark:text-white">Cuenta:</strong>{" "}
            nombre, email y foto de perfil, provistos por tu cuenta de Google
            al registrarte.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">
              Perfil (opcional):
            </strong>{" "}
            teléfono, localidad y biografía, si decidís completarlos.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">
              Ficha de jugador:
            </strong>{" "}
            nombre, DNI, fecha de nacimiento, nacionalidad, características
            deportivas (posición, altura, pie hábil) y fotos.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">
              Actividad deportiva:
            </strong>{" "}
            planteles, goles, asistencias, tarjetas y sanciones.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Pagos:</strong>{" "}
            plan contratado, montos y comprobantes de transferencia.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Técnicos:</strong>{" "}
            registros de acceso y un registro de auditoría de los cambios sobre
            fichas de jugadores (quién cambió qué y cuándo).
          </li>
        </ul>
      ),
    },
    {
      id: "origen",
      title: "Quién carga los datos",
      body: (
        <>
          <p>
            Los datos los carga su titular, o la liga o el delegado del equipo
            donde la persona juega. Quien carga datos de un tercero declara
            contar con su consentimiento — y con el de sus padres o tutores si
            es menor de edad.
          </p>
          <p>
            Cada persona tiene una única ficha en toda la plataforma,
            identificada por su DNI: eso evita fichas duplicadas entre ligas y
            le permite al jugador reclamar la suya.
          </p>
        </>
      ),
    },
    {
      id: "finalidad",
      title: "Para qué se usan",
      body: (
        <ul>
          <li>
            Gestionar las competencias: fixture, tablas, resultados,
            estadísticas, sanciones e inscripciones.
          </li>
          <li>
            Identificar de forma única a cada jugador mediante su DNI.{" "}
            <strong className="text-gray-900 dark:text-white">
              El DNI se usa solo para identificar: nunca se publica.
            </strong>
          </li>
          <li>Difundir públicamente las competencias (ver sección 6).</li>
          <li>Administrar planes y pagos de las ligas.</li>
          <li>Seguridad, prevención de abuso y auditoría de cambios.</li>
        </ul>
      ),
    },
    {
      id: "menores",
      title: "Datos de menores de edad",
      body: (
        <>
          <p>
            Las ligas amateur incluyen categorías infantiles y juveniles. Las
            fichas de menores las carga su club o liga, que declara contar con
            el consentimiento de los padres o tutores.
          </p>
          <ul>
            <li>Se cargan solo los datos necesarios para competir.</li>
            <li>El documento de un menor nunca es público.</li>
            <li>
              Los padres o tutores pueden pedir acceso, rectificación o
              supresión de los datos del menor escribiendo al contacto de esta
              política.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "publico-y-privado",
      title: "Qué es público y qué no",
      body: (
        <>
          <p>
            Las páginas públicas de torneos, equipos y jugadores muestran la
            información deportiva: nombre, foto, equipo, posición,
            estadísticas y sanciones. Es el propósito de difusión de la
            plataforma.
          </p>
          <p>
            <strong className="text-gray-900 dark:text-white">
              Nunca se publican:
            </strong>{" "}
            DNI, email, teléfono, comprobantes de pago ni ningún dato de
            contacto personal.
          </p>
        </>
      ),
    },
    {
      id: "ficha",
      title: "Titularidad de la ficha de jugador",
      body: (
        <>
          <p>
            El jugador puede vincular su ficha a su cuenta acreditando su DNI.
            La vinculación la confirma quien puede reconocerlo: su liga, su
            delegado o quien cargó la ficha. Una ficha puede estar vinculada a
            una sola cuenta.
          </p>
          <p>
            Con la ficha vinculada, el jugador ve su trayectoria completa y
            puede corregir sus propios datos. Si creés que alguien vinculó una
            ficha que no le corresponde, escribinos al contacto de esta
            política.
          </p>
        </>
      ),
    },
    {
      id: "terceros",
      title: "Servicios de terceros",
      body: (
        <>
          <p>
            No vendemos datos personales. Para funcionar, la plataforma usa
            proveedores que tratan datos por cuenta nuestra:
          </p>
          <ul>
            <li>
              <strong className="text-gray-900 dark:text-white">Clerk</strong> y{" "}
              <strong className="text-gray-900 dark:text-white">Google</strong>:
              registro e inicio de sesión.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">
                Cloudinary
              </strong>
              : almacenamiento de imágenes (logos, fotos, comprobantes).
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">
                Proveedores de infraestructura
              </strong>{" "}
              (hosting y base de datos) donde corre la plataforma.
            </li>
          </ul>
          <p>
            Estos servicios pueden implicar transferencias internacionales de
            datos, que se realizan hacia proveedores con garantías de
            protección adecuadas. Cuando exista pago online, Mercado Pago
            procesará esos pagos bajo sus propios términos.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies y almacenamiento local",
      body: (
        <ul>
          <li>
            <strong className="text-gray-900 dark:text-white">
              Cookies de sesión:
            </strong>{" "}
            necesarias para iniciar y mantener tu sesión (autenticación).
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">
              Preferencias en tu navegador:
            </strong>{" "}
            tema claro/oscuro y estado del menú, guardados localmente en tu
            dispositivo. No salen de tu navegador.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">
              No usamos cookies de publicidad
            </strong>{" "}
            ni rastreadores de terceros.
          </li>
        </ul>
      ),
    },
    {
      id: "conservacion",
      title: "Conservación y supresión",
      body: (
        <>
          <p>
            Los datos se conservan mientras la cuenta o la ficha estén activas.
            El historial deportivo de partidos ya jugados (goles, tarjetas,
            resultados) se conserva porque las tablas y estadísticas de las
            competencias dependen de él: suprimirlo alteraría datos de
            terceros.
          </p>
          <p>
            Podés pedir la supresión de tus datos personales: se elimina o
            anonimiza todo lo que no rompa la integridad del historial
            deportivo de otras personas, conforme a la Ley 25.326.
          </p>
        </>
      ),
    },
    {
      id: "seguridad",
      title: "Seguridad",
      body: (
        <ul>
          <li>Cifrado en tránsito (HTTPS) en todo el sitio.</li>
          <li>
            Control de acceso por roles: cada persona solo puede gestionar lo
            que le corresponde (su liga, su equipo, su ficha).
          </li>
          <li>
            Registro de auditoría de los cambios sobre fichas de jugadores.
          </li>
        </ul>
      ),
    },
    {
      id: "derechos",
      title: "Tus derechos (Ley 25.326)",
      body: (
        <>
          <p>
            Como titular de los datos tenés derecho de acceso, rectificación,
            actualización y supresión. El ejercicio es gratuito a intervalos no
            inferiores a seis meses, salvo interés legítimo (art. 14 inc. 3,
            Ley 25.326). Para ejercerlos, escribí al contacto de esta política.
          </p>
          <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-700 dark:bg-gray-900/50">
            La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, órgano de control de
            la Ley N° 25.326, tiene la atribución de atender las denuncias y
            reclamos que se interpongan con relación al incumplimiento de las
            normas sobre protección de datos personales.
          </p>
        </>
      ),
    },
    {
      id: "cambios",
      title: "Cambios a esta política",
      body: (
        <p>
          Podemos actualizar esta política. Si el cambio es sustancial, lo
          vamos a anunciar en el sitio con anticipación razonable. La fecha de
          última actualización figura arriba.
        </p>
      ),
    },
    {
      id: "contacto",
      title: "Contacto",
      body: (
        <p>
          Por consultas, ejercicio de derechos o reclamos sobre datos
          personales:{" "}
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
      title="Política de Privacidad"
      updatedAt="17 de julio de 2026"
      intro={
        <p>
          Esta política explica qué datos personales trata GOLAZO, quién los
          carga, para qué se usan, qué es público y qué derechos tenés. Aplica
          la Ley 25.326 de Protección de los Datos Personales (Argentina). Los
          términos de uso están en{" "}
          <Link href="/terminos" className="font-medium text-brand hover:underline">
            Términos y Condiciones
          </Link>
          .
        </p>
      }
      sections={sections}
    />
  );
}
