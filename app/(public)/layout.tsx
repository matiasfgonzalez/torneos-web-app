import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type React from "react";
import { checkUser } from "@/lib/checkUser";
import { currentUser } from "@clerk/nextjs/server";
import { getUserNavLinks } from "@/lib/userHats";

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

  // Nav según los sombreros reales del usuario (N14a)
  const userLinks = isLogued ? await getUserNavLinks(user) : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header isLogued={isLogued} userLinks={userLinks} />
      {children}
      <Footer />
    </div>
  );
}

