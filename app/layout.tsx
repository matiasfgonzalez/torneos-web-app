import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";

// Premium Golazo Theme for Clerk
const clerkAppearance = {
  variables: {
    // Colores principales Premium Golazo
    colorPrimary: "#ad45ff",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    colorWarning: "#f59e0b",
    colorNeutral: "#1a0a2e",
    colorText: "#1a0a2e",
    colorTextOnPrimaryBackground: "#ffffff",
    colorTextSecondary: "#6b7280",
    colorBackground: "#ffffff",
    colorInputBackground: "#f9fafb",
    colorInputText: "#1a0a2e",
    // Bordes y sombras
    borderRadius: "0.75rem",
    // Fuentes
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    fontFamilyButtons: "var(--font-geist-sans), system-ui, sans-serif",
    fontSize: "0.9375rem",
    fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
    // Espaciado
    spacingUnit: "1rem",
  },
  elements: {
    // Root y contenedores
    rootBox: "font-sans",
    card: "bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 rounded-2xl backdrop-blur-xl",

    // Header del modal
    headerTitle: "text-xl font-bold text-gray-900 dark:text-white",
    headerSubtitle: "text-sm text-gray-500 dark:text-gray-400",

    // User Button (avatar)
    userButtonBox: "hover:opacity-90 transition-opacity",
    userButtonTrigger:
      "focus:shadow-none focus:ring-2 focus:ring-[#ad45ff]/50 rounded-full",
    userButtonAvatarBox:
      "w-10 h-10 ring-2 ring-[#ad45ff]/30 hover:ring-[#ad45ff] transition-all",
    userButtonAvatarImage: "rounded-full",

    // User Button Popover (modal de opciones)
    userButtonPopoverCard:
      "bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden min-w-[280px]",
    userButtonPopoverMain: "p-0",
    userButtonPopoverActions: "p-2",
    userButtonPopoverActionButton:
      "w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-[#ad45ff]/10 hover:to-[#a3b3ff]/10 rounded-xl transition-all duration-200 font-medium",
    userButtonPopoverActionButtonIcon: "w-5 h-5 text-[#ad45ff]",
    userButtonPopoverActionButtonText: "text-sm",
    userButtonPopoverFooter: "hidden",

    // User Preview (info del usuario en el popover)
    userPreviewMainIdentifier: "font-semibold text-gray-900 dark:text-white",
    userPreviewSecondaryIdentifier: "text-sm text-gray-500 dark:text-gray-400",
    userPreviewAvatarBox: "w-12 h-12 ring-2 ring-[#ad45ff]/20",
    userPreviewTextContainer: "gap-0.5",

    // Botones principales
    formButtonPrimary:
      "bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-[#ad45ff]/25 hover:shadow-xl hover:shadow-[#ad45ff]/30 transition-all duration-300 border-0",
    formButtonReset: "text-[#ad45ff] hover:text-[#9d35ef] font-medium",

    // Inputs
    formFieldLabel: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-1",
    formFieldInput:
      "w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#ad45ff]/50 focus:border-[#ad45ff] transition-all",
    formFieldInputShowPasswordButton: "text-gray-400 hover:text-[#ad45ff]",

    // Social buttons
    socialButtonsBlockButton:
      "border border-gray-200 dark:border-gray-700 hover:border-[#ad45ff]/50 hover:bg-[#ad45ff]/5 rounded-xl py-3 transition-all duration-200",
    socialButtonsBlockButtonText:
      "font-medium text-gray-700 dark:text-gray-200",

    // Dividers
    dividerLine: "bg-gray-200 dark:bg-gray-700",
    dividerText: "text-gray-400 dark:text-gray-500 text-sm",

    // Links
    footerActionLink:
      "text-[#ad45ff] hover:text-[#9d35ef] font-medium transition-colors",

    // Identity preview
    identityPreviewText: "text-gray-900 dark:text-white",
    identityPreviewEditButton: "text-[#ad45ff] hover:text-[#9d35ef]",

    // Alerts
    alertText: "text-sm",

    // Profile sections
    profileSectionTitle: "text-lg font-semibold text-gray-900 dark:text-white",
    profileSectionTitleText: "font-semibold",
    profileSectionContent: "mt-4",
    profileSectionPrimaryButton:
      "bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white rounded-xl px-4 py-2 font-medium hover:shadow-lg transition-all",

    // Navbar (para el UserProfile)
    navbar:
      "bg-gray-50 dark:bg-gray-800/50 border-r border-gray-100 dark:border-gray-800",
    navbarButton:
      "hover:bg-[#ad45ff]/10 text-gray-700 dark:text-gray-200 rounded-xl transition-colors",
    navbarButtonIcon: "text-[#ad45ff]",

    // Page (para el UserProfile)
    pageScrollBox: "p-6",
    page: "bg-white dark:bg-gray-900",

    // Badge
    badge:
      "bg-[#ad45ff]/10 text-[#ad45ff] font-medium px-2 py-1 rounded-lg text-xs",

    // Menu items
    menuButton: "hover:bg-[#ad45ff]/10 rounded-xl transition-colors",
    menuItem: "hover:bg-[#ad45ff]/10 rounded-xl transition-colors px-3 py-2",

    // Avatar uploader
    avatarImageActionsUpload: "text-[#ad45ff] hover:text-[#9d35ef]",
    avatarImageActionsRemove: "text-red-500 hover:text-red-600",

    // Form
    form: "gap-4",
    formHeader: "mb-4",
    formResendCodeLink: "text-[#ad45ff] hover:text-[#9d35ef]",

    // OTP input
    otpCodeFieldInput:
      "border-gray-200 dark:border-gray-700 focus:border-[#ad45ff] focus:ring-[#ad45ff]/50 rounded-xl",

    // Buttons section
    formFieldAction: "text-[#ad45ff] hover:text-[#9d35ef] text-sm font-medium",
  },
  layout: {
    socialButtonsPlacement: "bottom" as const,
    socialButtonsVariant: "blockButton" as const,
    termsPageUrl: "/terms",
    privacyPageUrl: "/privacy",
    helpPageUrl: "/help",
    logoPlacement: "inside" as const,
    logoImageUrl: "",
    shimmer: true,
  },
};

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

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
    <ClerkProvider localization={esES} appearance={clerkAppearance}>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            <NextTopLoader height={5} speed={800} />
            <Suspense fallback={null}>{children}</Suspense>
            <Analytics />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
