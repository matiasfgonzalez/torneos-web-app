"use client";

import { useState } from "react";
import { Check, Copy, QrCode, Share2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Ícono de WhatsApp inline: lucide no trae logos de marca. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

/**
 * Compartir un torneo (S4): WhatsApp (canal #1 en ligas amateur), copiar link,
 * y el QR imprimible. Si el dispositivo tiene share nativo (móvil), se ofrece
 * primero — es un tap y sin salir de la app.
 *
 * Recibe la ruta a compartir y arma la URL absoluta con el origin real del
 * navegador: así funciona igual en local, preview y producción sin depender de
 * ninguna env del lado del cliente.
 *
 * `qrPath` es null cuando el torneo todavía no tiene slug: el cartel QR vive
 * bajo `/liga/[slug]/[torneo]`, y sin slug esa ruta no existe. En ese caso el
 * ítem no se ofrece en vez de linkear a un 404.
 */
export function ShareButton({
  canonicalPath,
  tournamentName,
  qrPath,
}: Readonly<{
  canonicalPath: string;
  tournamentName: string;
  qrPath: string | null;
}>) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}${canonicalPath}`
      : canonicalPath;
  const shareText = `Seguí ${tournamentName} en vivo en GOLAZO`;

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const nativeShare = async () => {
    try {
      await navigator.share({ title: tournamentName, text: shareText, url });
    } catch {
      // El usuario canceló el diálogo del sistema: no es un error que reportar.
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar. Copialo a mano desde la barra.");
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Compartir
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        {canNativeShare && (
          <>
            <DropdownMenuItem onClick={nativeShare}>
              <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Compartir…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem asChild>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="mr-2 h-4 w-4 text-green-600" />
            WhatsApp
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={copyLink}>
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-600" aria-hidden="true" />
          ) : (
            <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copiado" : "Copiar link"}
        </DropdownMenuItem>

        {qrPath && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={qrPath} target="_blank" rel="noopener noreferrer">
                <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
                QR imprimible
              </a>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
