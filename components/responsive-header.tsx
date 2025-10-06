import Link from "next/link";
import { Menu, X, LogIn } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import { currentUser } from "@clerk/nextjs/server";
import ThemeToggle from "./ThemeToggle";

interface ResponsiveHeaderProps {
  currentPage?: string;
}

export default async function ResponsiveHeader({
  currentPage = "",
}: Readonly<ResponsiveHeaderProps>) {
  const user = await checkUser();
  console.log("User in header:", user);

  const userLogued = await currentUser();

  let isLogued: boolean = false;
  if (userLogued) {
    isLogued = true;
  }

  const navigationItems = [
    {
      href: "/public/index",
      label: "Inicio",
      key: "inicio",
      disabled: false,
    },
    { href: "/torneos", label: "Torneos", key: "torneos", disabled: true },
    { href: "/equipos", label: "Equipos", key: "equipos", disabled: true },
    {
      href: "/jugadores",
      label: "Jugadores",
      key: "jugadores",
      disabled: true,
    },
    {
      href: "/public/noticias",
      label: "Noticias",
      key: "noticias",
      disabled: false,
    },
    {
      href: "/estadisticas",
      label: "Estadísticas",
      key: "estadisticas",
      disabled: true,
    },
    {
      href: "/admin/dashboard",
      label: "Administración",
      key: "dashboard",
      disabled: !isLogued,
    },
  ];

  return (
    <header className="border-b border-primary/20 dark:border-gray-700 bg-card/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Agrupación con peer */}
        <div className="relative peer">
          <input type="checkbox" id="menu-toggle" className="peer hidden" />

          {/* Barra de navegación */}
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/public/index"
              className="flex items-center text-xl font-bold text-purple-400 hover:scale-105 transition"
            >
              🏆
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                GOLAZO
              </span>
            </Link>

            {/* Menú escritorio */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.map(
                (item) =>
                  !item.disabled && (
                    <Link
                      key={item.key}
                      href={item.href}
                      className={
                        currentPage === item.key
                          ? "nav-neon-link-active text-foreground dark:text-white hover:text-primary dark:hover:text-[#ad45ff]"
                          : "nav-neon-link text-foreground dark:text-gray-300 hover:text-primary dark:hover:text-[#ad45ff]"
                      }
                    >
                      {item.label}
                    </Link>
                  )
              )}
              <ThemeToggle />
              <SignedOut>
                <SignInButton>
                  <button
                    className="flex items-center gap-2 w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-2.5
        text-sm sm:text-md font-semibold text-white bg-gradient-to-r
        from-indigo-400 via-indigo-500 to-indigo-600
        hover:from-indigo-500 hover:via-indigo-600 hover:to-indigo-700
        rounded-full shadow-md transition-all duration-300 ease-in-out
        hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <LogIn className="w-5 h-5" />
                    Iniciar sesión
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>

            {/* Botón menú móvil */}
            <label
              htmlFor="menu-toggle"
              className="lg:hidden p-2 rounded-lg bg-primary/10 dark:bg-gray-700 border border-primary/20 dark:border-gray-600 hover:bg-primary/20 dark:hover:bg-gray-600 hover:shadow-neon-sm transition-all duration-300 group cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-6 w-6 text-primary dark:text-gray-300 group-hover:scale-110 transition-transform duration-300 peer-checked:hidden block" />
              <X className="h-6 w-6 text-primary dark:text-gray-300 group-hover:rotate-90 transition-transform duration-300 hidden peer-checked:block" />
            </label>
          </nav>

          {/* Menú móvil */}
          <div className="lg:hidden max-h-0 peer-checked:max-h-96 peer-checked:opacity-100 peer-checked:mt-4 peer-checked:translate-y-0 opacity-0 -translate-y-4 overflow-hidden transition-all duration-500 ease-in-out">
            <div className="bg-card/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg border border-primary/20 dark:border-gray-700 shadow-neon-md overflow-hidden">
              <div className="py-2">
                {navigationItems.map(
                  (item, index) =>
                    !item.disabled && (
                      <Link
                        key={item.key}
                        href={item.href}
                        className={`block px-6 py-4 transition-all duration-300 relative group ${
                          currentPage === item.key
                            ? "text-primary dark:text-[#ad45ff] font-semibold bg-primary/10 dark:bg-[#ad45ff]/10 border-l-4 border-primary dark:border-[#ad45ff] shadow-neon-sm"
                            : "text-foreground dark:text-gray-300 hover:text-primary dark:hover:text-[#ad45ff] hover:bg-primary/5 dark:hover:bg-gray-700 hover:shadow-neon-sm"
                        }`}
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        <span className="relative z-10 hover:underline decoration-primary/50 decoration-2 underline-offset-4">
                          {item.label}
                        </span>
                        {currentPage !== item.key && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 dark:from-[#ad45ff]/0 dark:via-[#ad45ff]/5 dark:to-[#ad45ff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                      </Link>
                    )
                )}
                <div className="flex justify-center mt-4">
                  <ThemeToggle />
                </div>
                <div className="flex justify-center mt-4">
                  <SignedOut>
                    <SignInButton>
                      <button
                        className="flex items-center gap-2 w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-2.5
        text-sm sm:text-md font-semibold text-white bg-gradient-to-r
        from-indigo-400 via-indigo-500 to-indigo-600
        hover:from-indigo-500 hover:via-indigo-600 hover:to-indigo-700
        rounded-full shadow-md transition-all duration-300 ease-in-out
        hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <LogIn className="w-5 h-5" />
                        Iniciar sesión
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
