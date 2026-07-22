/**
 * Definición de los planes que siembra `prisma/seed.js`.
 *
 * Vive separado del seed para que un test pueda leerlo sin ejecutar la
 * escritura: `tests/plans/features.test.ts` verifica que **todos los planes
 * declaren todas las features del catálogo** (`lib/constants/plan-features.ts`).
 *
 * Ese test existe por un bug real: `orgNews` se agregó al validador, a la
 * pantalla de planes y al enforcement, pero no acá. Como `hasFeature` devuelve
 * `false` ante una clave ausente, la feature quedó apagada hasta para Premium
 * y no dio ningún síntoma — el organizador pagaba y la pantalla le decía
 * "función de plan superior".
 *
 * Los precios son placeholder: el vigente se gestiona desde `/admin/planes`.
 */
export const PLANS = [
  {
    code: "FREE",
    name: "Gratis",
    priceMonthly: 0,
    maxActiveTournaments: 1,
    maxTeamsPerTournament: 12,
    maxMembers: 2,
    features: {
      exportPdf: false,
      customBranding: false,
      liveMatch: false,
      orgNews: false,
    },
    order: 0,
  },
  {
    code: "PRO",
    name: "Pro",
    priceMonthly: 15000,
    maxActiveTournaments: 999,
    maxTeamsPerTournament: 30,
    maxMembers: 10,
    features: {
      exportPdf: true,
      customBranding: false,
      liveMatch: false,
      // Se deja en false para no cambiar solo lo que vale cada plan. Si las
      // novedades tienen que entrar en Pro, se prende desde /admin/planes.
      orgNews: false,
    },
    order: 1,
  },
  {
    code: "PREMIUM",
    name: "Premium",
    priceMonthly: 25000,
    maxActiveTournaments: 999,
    maxTeamsPerTournament: 999,
    maxMembers: 999,
    features: {
      exportPdf: true,
      customBranding: true,
      liveMatch: true,
      orgNews: true,
    },
    order: 2,
  },
];
