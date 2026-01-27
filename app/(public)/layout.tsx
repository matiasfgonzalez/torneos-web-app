import { Header } from "@/components/layout/header";
import { Mic } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { checkUser } from "@/lib/checkUser";
import { currentUser } from "@clerk/nextjs/server";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await checkUser();
  let isLogued: boolean = false;

  if (user) {
    const userLogued = await currentUser();
    if (userLogued) {
      isLogued = true;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header isLogued={isLogued} />
      {children}
      {/* Footer */}
      <footer className="bg-background dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Mic className="h-6 w-6 text-primary" />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  GOLAZO
                </span>
              </div>
              <p className="text-muted-foreground dark:text-gray-400">
                La plataforma líder para la gestión y seguimiento de torneos de
                fútbol local.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                Navegación
              </h3>
              <ul className="space-y-2 text-muted-foreground dark:text-gray-400">
                <li>
                  <Link
                    href="/"
                    className="hover:text-primary dark:hover:text-[#ad45ff] transition-colors"
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/torneos"
                    className="hover:text-primary dark:hover:text-[#ad45ff] transition-colors"
                  >
                    Torneos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/noticias"
                    className="hover:text-primary dark:hover:text-[#ad45ff] transition-colors"
                  >
                    Noticias
                  </Link>
                </li>
                <li>
                  <Link
                    href="/estadisticas"
                    className="hover:text-primary dark:hover:text-[#ad45ff] transition-colors"
                  >
                    Estadísticas
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                Torneos
              </h3>
              <ul className="space-y-2 text-muted-foreground dark:text-gray-400">
                <li>
                  <Link
                    href="/torneos?categoria=primera"
                    className="hover:text-primary dark:hover:text-[#ad45ff] transition-colors"
                  >
                    Primera División
                  </Link>
                </li>
                <li>
                  <Link
                    href="/torneos?categoria=juvenil"
                    className="hover:text-primary dark:hover:text-[#ad45ff] transition-colors"
                  >
                    Juveniles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/torneos?categoria=amateur"
                    className="hover:text-primary dark:hover:text-[#ad45ff] transition-colors"
                  >
                    Amateur
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                Contacto
              </h3>
              <ul className="space-y-2 text-muted-foreground dark:text-gray-400">
                <li>Email: matiasgonzalez.652@gmail.com</li>
                <li>Teléfono: +54 9 3454 432164</li>
                <li>Dirección: Los Jilgueros 130</li>
                <li>Oro Verde - Entre Ríos - Argentina</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-muted-foreground dark:text-gray-400">
            <p>
              &copy; 2025{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                GOLAZO
              </span>
              . Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

