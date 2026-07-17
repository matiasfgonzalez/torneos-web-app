"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Dispara el diálogo de impresión del navegador (S4). Client por `window`. */
export function PrintButton() {
  return (
    <Button onClick={() => window.print()} className="gap-2">
      <Printer className="h-4 w-4" aria-hidden="true" />
      Imprimir
    </Button>
  );
}
