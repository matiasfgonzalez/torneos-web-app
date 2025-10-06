import Link from "next/link";
import { GradientText } from "@/components/ui-dev/gradient-text";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg mr-3"></div>
              <GradientText className="text-2xl font-bold">GOLAZO</GradientText>
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-4">
              La plataforma líder para la gestión profesional de torneos
              deportivos.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-200">
              Plataforma
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/torneos"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Torneos
                </Link>
              </li>
              <li>
                <Link
                  href="/equipos"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Equipos
                </Link>
              </li>
              <li>
                <Link
                  href="/jugadores"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Jugadores
                </Link>
              </li>
              <li>
                <Link
                  href="/noticias"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Noticias
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-200">
              Empresa
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Acerca de
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Carreras
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Prensa
                </a>
              </li>
              <li>
                <a
                  href="#contacto"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-gray-200">
              Soporte
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Documentación
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Estado del Sistema
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              © 2024 GOLAZO. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 text-sm transition-colors"
              >
                Política de Privacidad
              </a>
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 text-sm transition-colors"
              >
                Términos de Servicio
              </a>
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 text-sm transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
