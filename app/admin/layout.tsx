import type React from "react";
import { Toaster } from "sonner";
import { AdminSidebar } from "@/components/admin/sidebar";
import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userLogued = await checkUser();

  console.log("User in admin layout:", userLogued);

  if (!userLogued) {
    // Redirige si no está autenticado (aunque Clerk ya lo hace desde el middleware)
    redirect("/sign-in");
  }

  const role = userLogued.role;

  return (
    <div className="min-h-screen premium-gradient-bg">
      {/* Sidebar - incluye both desktop y mobile */}
      <AdminSidebar role={role} />

      {/* Main content area with proper spacing */}
      <div className="md:pl-72">
        {/* Header with proper z-index */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between glass-header shadow-sm px-4 md:px-6">
          <div className="flex items-center space-x-3">
            {/* Solo mostrar en desktop */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Panel de Administración
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  GOLAZO Admin
                </p>
              </div>
            </div>
          </div>
          {/* Solo mostrar en mobile - alineado a la derecha */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <h1 className="md:hidden text-lg font-bold text-gray-900 dark:text-white">
              Admin
            </h1>
          </div>
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

