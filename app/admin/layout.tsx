import type React from "react";
import { Toaster } from "sonner";
import { AdminSidebar } from "@/components/admin/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const userLogued = await currentUser();

    console.log("User in admin layout:", userLogued);

    if (!userLogued) {
        // Redirige si no está autenticado (aunque Clerk ya lo hace desde el middleware)
        redirect("/sign-in");
    }

    let role: string | null = null;
    if (userLogued) {
        role = userLogued.publicMetadata?.role as string | null;
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="">
                <div className="flex h-16 items-center justify-between border-b px-4 md:px-6">
                    <div className="">
                        <AdminSidebar role={role} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <h1 className="text-lg font-semibold">
                            Panel de Administración
                        </h1>
                    </div>
                </div>
                <main className="p-4 md:p-6 md:pl-76">
                    {children}
                    <Toaster position="top-right" richColors />
                </main>
            </div>
        </div>
    );
}
