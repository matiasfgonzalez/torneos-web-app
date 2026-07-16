import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// Páginas que requieren sesión (la validación fina de rol vive en layouts/handlers)
// `/mi-equipo` y `/bienvenida` (N13) son de usuario logueado: sin sesión no
// tienen ningún sentido, así que se protegen igual que el panel y el perfil.
const isProtectedPage = createRouteMatcher([
  "/admin(.*)",
  "/profile(.*)",
  "/mi-equipo(.*)",
  "/mi-ficha(.*)",
  "/bienvenida(.*)",
]);

// Webhooks futuros (Clerk/Mercado Pago) validan firma propia, no sesión
const isWebhook = createRouteMatcher(["/api/webhooks(.*)"]);

const isApi = createRouteMatcher(["/api(.*)"]);

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Límites por IP y ventana de 1 minuto
const READ_LIMIT = 120;
const WRITE_LIMIT = 30;
const WINDOW_MS = 60_000;

function clientIp(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");
    return forwarded?.split(",")[0].trim() || "127.0.0.1";
}

export default clerkMiddleware(async (auth, req) => {
    if (isWebhook(req)) return;

    if (isProtectedPage(req)) {
        await auth.protect(); // sin sesión → redirect a sign-in
        return;
    }

    if (isApi(req)) {
        const isWrite = !SAFE_METHODS.has(req.method.toUpperCase());

        // Rate limiting por IP (lecturas y escrituras con límites separados)
        const limit = isWrite ? WRITE_LIMIT : READ_LIMIT;
        const result = rateLimit(
            `${clientIp(req)}:${isWrite ? "w" : "r"}`,
            limit,
            WINDOW_MS,
        );
        if (!result.ok) {
            return NextResponse.json(
                { error: "Demasiadas solicitudes. Intentá de nuevo en unos segundos." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(
                            Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000)),
                        ),
                    },
                },
            );
        }

        // Defensa en profundidad: toda mutación de API exige sesión,
        // aunque el handler olvide validar. Los GET públicos siguen abiertos.
        if (isWrite) {
            const { userId } = await auth();
            if (!userId) {
                return NextResponse.json(
                    { error: "No autorizado. Debes iniciar sesión." },
                    { status: 401 },
                );
            }
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        // NOTA: debe ser string literal plano (Next analiza esto estáticamente;
        // String.raw rompe el build con "Invalid segment configuration export")
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)"
    ]
};
