import type React from "react";
import { Toaster } from "sonner";
import { AdminSidebar } from "@/components/admin/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Sidebar - incluye both desktop y mobile */}
      <AdminSidebar role={role} />

      {/* Main content area with proper spacing */}
      <div className="md:pl-72">
        {/* Header with proper z-index */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm px-4 md:px-6">
          <div className="flex items-center space-x-3">
            {/* Solo mostrar en desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Panel de Administración
                </h1>
                <p className="text-xs text-gray-500">GOLAZO Admin</p>
              </div>
            </div>
          </div>
          {/* Solo mostrar en mobile - alineado a la derecha */}
          <h1 className="md:hidden text-lg font-bold text-gray-900">Admin</h1>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          {children}
          <Toaster position="top-right" richColors />
        </main>
      </div>
    </div>
  );
}
