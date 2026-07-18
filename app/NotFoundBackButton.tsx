"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Único trozo interactivo del 404: volver a la página anterior (o al inicio si
 * no hay historial). Se aísla en un client component para que `not-found.tsx`
 * pueda ser un Server Component — así Next fija bien el status HTTP 404 (un
 * `not-found` client + streaming lo dejaba en 200, malo para SEO/crawlers).
 */
export function NotFoundBackButton() {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <Button
      onClick={goBack}
      variant="link"
      className="cursor-pointer px-6 py-5 text-white transition-all hover:bg-white/10"
    >
      <ArrowLeft className="mr-2 h-5 w-5" />
      Página Anterior
    </Button>
  );
}
