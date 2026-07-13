"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setAdminOrgView } from "@modules/organizaciones/actions/adminOrgView";

/**
 * Banner del modo "ver como organización" (N3/N10): el ADMINISTRADOR ve el
 * panel scopeado a una organización, y desde acá sale del modo.
 */
export function OrgViewBanner({ orgName }: { orgName: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const exit = () => {
    startTransition(async () => {
      const res = await setAdminOrgView(null);
      if (res.success) {
        toast.success("Saliste del modo organización");
        router.refresh();
      } else {
        toast.error(res.error ?? "No se pudo salir del modo organización");
      }
    });
  };

  return (
    <div className="sticky top-16 z-20 flex items-center justify-between gap-3 px-4 md:px-6 py-2 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] text-white shadow-md">
      <div className="flex items-center gap-2 min-w-0 text-sm font-medium">
        <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="truncate">
          {orgName
            ? `Viendo el panel como: ${orgName}`
            : "Viendo como una organización que ya no existe"}
        </span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={exit}
        disabled={pending}
        className="gap-1.5 shrink-0 bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm"
        aria-label="Salir del modo organización"
      >
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        )}
        Salir
      </Button>
    </div>
  );
}
