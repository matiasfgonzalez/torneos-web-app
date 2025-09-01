import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "GOLAZO - Gestión Profesional de Torneos",
  description:
    "Plataforma líder en gestión de torneos deportivos con tablas de posiciones, equipos, jugadores, noticias y contenido multimedia integrado.",
  keywords:
    "torneos, deportes, gestión, tablas de posiciones, equipos, jugadores, noticias deportivas",
  authors: [{ name: "GOLAZO Team" }],
  creator: "GOLAZO",
  publisher: "GOLAZO",
  generator: "",
  openGraph: {
    title: "GOLAZO - Gestión Profesional de Torneos",
    description:
      "Plataforma líder en gestión de torneos deportivos con tablas de posiciones, equipos, jugadores, noticias y contenido multimedia integrado.",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "GOLAZO - Gestión Profesional de Torneos",
    description:
      "Plataforma líder en gestión de torneos deportivos con tablas de posiciones, equipos, jugadores, noticias y contenido multimedia integrado.",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <NextTopLoader height={5} speed={800} />
          <Suspense fallback={null}>{children}</Suspense>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
