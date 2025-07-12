import ResponsiveHeader from "@/components/responsive-header";
import { Trophy } from "lucide-react";
import Link from "next/link";
import type React from "react";

export default function AdminLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <ResponsiveHeader />
            {children}
            {/* Footer */}
            <footer className="bg-background border-t py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Trophy className="h-6 w-6 text-primary" />
                                <span className="text-xl font-bold">
                                    VIVA LA MAÑANA
                                </span>
                            </div>
                            <p className="text-muted-foreground">
                                La plataforma líder para la gestión y
                                seguimiento de torneos de fútbol local.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Navegación</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>
                                    <Link
                                        href="/"
                                        className="hover:text-primary"
                                    >
                                        Inicio
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/torneos"
                                        className="hover:text-primary"
                                    >
                                        Torneos
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/noticias"
                                        className="hover:text-primary"
                                    >
                                        Noticias
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/estadisticas"
                                        className="hover:text-primary"
                                    >
                                        Estadísticas
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Torneos</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>
                                    <Link
                                        href="/torneos?categoria=primera"
                                        className="hover:text-primary"
                                    >
                                        Primera División
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/torneos?categoria=juvenil"
                                        className="hover:text-primary"
                                    >
                                        Juveniles
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/torneos?categoria=amateur"
                                        className="hover:text-primary"
                                    >
                                        Amateur
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Contacto</h3>
                            <ul className="space-y-2 text-muted-foreground">
                                <li>Email: matiasgonzalez.652@gmail.com</li>
                                <li>Teléfono: +54 9 3454 432164</li>
                                <li>Dirección: Los Jilgueros 130</li>
                                <li>Oro Verde - Entre Ríos - Argentina</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
                        <p>
                            &copy; 2024 VIVA LA MAÑANA. Todos los derechos
                            reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
