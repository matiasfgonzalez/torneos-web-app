import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Páginas que requieren sesión (la validación fina de rol vive en layouts/handlers)
const isProtectedPage = createRouteMatcher(["/admin(.*)", "/profile(.*)"]);

// Webhooks futuros (Clerk/Mercado Pago) validan firma propia, no sesión
const isWebhook = createRouteMatcher(["/api/webhooks(.*)"]);

const isApi = createRouteMatcher(["/api(.*)"]);

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export default clerkMiddleware(async (auth, req) => {
    if (isWebhook(req)) return;

    if (isProtectedPage(req)) {
        await auth.protect(); // sin sesión → redirect a sign-in
        return;
    }

    // Defensa en profundidad: toda mutación de API exige sesión,
    // aunque el handler olvide validar. Los GET públicos siguen abiertos.
    if (isApi(req) && !SAFE_METHODS.has(req.method.toUpperCase())) {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "No autorizado. Debes iniciar sesión." },
                { status: 401 },
            );
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        String.raw`/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)`,
        // Always run for API routes
        "/(api|trpc)(.*)"
    ]
};
