import type React from "react";
import { Toaster } from "sonner";
import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <div className="">
                <div className="flex h-16 items-center justify-between border-b px-4 md:px-6">
                    <div className="">
                        <AdminSidebar />
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
