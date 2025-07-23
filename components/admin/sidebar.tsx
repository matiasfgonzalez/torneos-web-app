"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import {
    Trophy,
    Users,
    UserCheck,
    Calendar,
    BarChart3,
    Settings,
    Menu,
    Home,
    Shield,
    Newspaper,
    ArrowBigLeft
} from "lucide-react";

const menuItems = [
    {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: Home,
        enabled: true,
        roles: ["admin", "editor", "viewer"]
    },
    {
        title: "Noticias",
        href: "/admin/noticias",
        icon: Newspaper,
        enabled: true,
        roles: ["admin", "editor"]
    },
    {
        title: "Torneos",
        href: "/admin/torneos",
        icon: Trophy,
        enabled: true,
        roles: ["admin", "editor"]
    },
    {
        title: "Equipos",
        href: "/admin/equipos",
        icon: Users,
        enabled: false
    },
    {
        title: "Jugadores",
        href: "/admin/jugadores",
        icon: UserCheck,
        enabled: false
    },
    {
        title: "Partidos",
        href: "/admin/partidos",
        icon: Calendar,
        enabled: false
    },
    {
        title: "Estadísticas",
        href: "/admin/estadisticas",
        icon: BarChart3,
        enabled: false
    },
    {
        title: "Configuración",
        href: "/admin/configuracion",
        icon: Settings,
        enabled: false
    }
];

interface AdminSidebarProps {
    role: string | null;
}

export function AdminSidebar(props: AdminSidebarProps) {
    const { role } = props;
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex h-16 items-center border-b px-6">
                <div className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <span className="text-lg font-semibold">Admin Panel</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 p-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const isDisabled =
                        item.roles && !item.roles.includes(role ?? "viewer");

                    if (isDisabled) {
                        return null; // Skip rendering disabled items
                    }
                    const html = item.enabled ? (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                        >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                        </Link>
                    ) : null;

                    return html;
                })}
            </nav>

            {/* Footer */}
            <div className="border-t p-4">
                <Button
                    variant="secondary"
                    className="w-full justify-start"
                    asChild
                >
                    <Link href="/public/index">
                        <ArrowBigLeft className="mr-2 h-4 w-4" />
                        Volver al sitio
                    </Link>
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50 bg-background border-r">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="md:hidden bg-transparent"
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                    <SheetTitle></SheetTitle>
                    <SheetDescription></SheetDescription>
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    );
}
