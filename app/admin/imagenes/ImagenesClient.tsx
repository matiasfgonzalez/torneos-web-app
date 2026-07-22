"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader, SectionTitle } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Images, Loader2, RefreshCw, Trash2, ImageOff } from "lucide-react";
import type { OrphanImage } from "@/lib/cloudinary-orphans";
import { deleteOrphanImages } from "./actions";

/** Etiqueta legible por carpeta gestionada (deriva de ALLOWED_UPLOAD_FOLDERS). */
const FOLDER_LABELS: Record<string, string> = {
  "torneos/logos": "Torneos · logos",
  "equipos/logos": "Equipos · logos",
  "noticias/covers": "Noticias · portadas",
  "novedades/covers": "Novedades · portadas",
  "jugadores/cuerpo": "Jugadores · cuerpo",
  "jugadores/rostro": "Jugadores · rostro",
  "pagos/comprobantes": "Comprobantes de pago",
  "organizaciones/logos": "Organizaciones · logos",
};

function formatBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Miniatura cuadrada optimizada inyectando la transformación en la URL. */
function thumbUrl(secureUrl: string): string {
  return secureUrl.replace(
    "/upload/",
    "/upload/c_fill,g_auto,w_200,h_200,q_auto,f_auto/",
  );
}

export default function ImagenesClient({
  orphans,
}: Readonly<{ orphans: OrphanImage[] }>) {
  const router = useRouter();
  const [items, setItems] = useState<OrphanImage[]>(orphans);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Al re-fetchear el server component (router.refresh) llega una lista nueva:
  // hay que resincronizar la local y descartar de la selección los assets que
  // ya no están. Se ajusta **durante el render** comparando con la prop
  // anterior, no en un `useEffect` — un setState en el cuerpo del efecto
  // encadena renders (AGENT_RULES, `react-hooks/set-state-in-effect`).
  const [prevOrphans, setPrevOrphans] = useState(orphans);
  if (orphans !== prevOrphans) {
    setPrevOrphans(orphans);
    setItems(orphans);
    const live = new Set(orphans.map((o) => o.public_id));
    setSelected((prev) => new Set([...prev].filter((id) => live.has(id))));
    setRefreshing(false);
  }

  const groups = useMemo(() => {
    const map = new Map<string, OrphanImage[]>();
    for (const o of items) {
      const arr = map.get(o.managedFolder) ?? [];
      arr.push(o);
      map.set(o.managedFolder, arr);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const totalBytes = useMemo(
    () => items.reduce((sum, o) => sum + o.bytes, 0),
    [items],
  );
  const selectedBytes = useMemo(
    () =>
      items
        .filter((o) => selected.has(o.public_id))
        .reduce((sum, o) => sum + o.bytes, 0),
    [items, selected],
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleGroup = (folder: string, ids: string[]) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      for (const id of ids) {
        if (allSelected) next.delete(id);
        else next.add(id);
      }
      return next;
    });

  const selectAll = () => setSelected(new Set(items.map((o) => o.public_id)));
  const clearSelection = () => setSelected(new Set());

  const refresh = () => {
    setRefreshing(true);
    router.refresh();
    // Se apaga arriba, al llegar la lista nueva. El timeout es la red por si
    // el refresh no cambia nada (misma prop → no hay re-sincronización).
    setTimeout(() => setRefreshing(false), 1200);
  };

  const handleDelete = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    setDeleting(true);
    try {
      const res = await deleteOrphanImages(ids);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      setItems((prev) => prev.filter((o) => !res.deleted.includes(o.public_id)));
      setSelected(new Set());
      const skipped = res.skipped.length;
      toast.success(
        `${res.deleted.length} ${res.deleted.length === 1 ? "imagen borrada" : "imágenes borradas"}` +
          (skipped ? ` · ${skipped} omitidas (ya en uso)` : ""),
      );
    } catch {
      toast.error("Error al borrar las imágenes");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Images}
        title="Imágenes huérfanas"
        variant="simple"
        description="Assets en Cloudinary que ninguna entidad de la base referencia. Revisalos y borralos para liberar espacio."
        actions={
          <Button
            variant="outline"
            onClick={refresh}
            disabled={refreshing || deleting}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Actualizar
          </Button>
        }
      />

      {/* Resumen */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline" className="text-sm">
          {items.length} {items.length === 1 ? "huérfana" : "huérfanas"}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {formatBytes(totalBytes)} recuperables
        </Badge>
        {items.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={selectAll}
              disabled={deleting}
            >
              Seleccionar todo
            </Button>
            {selected.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                disabled={deleting}
              >
                Limpiar
              </Button>
            )}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
              <ImageOff className="w-7 h-7" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              No hay imágenes huérfanas
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
              Todo el almacenamiento de Cloudinary está en uso. Volvé después de
              borrar torneos, equipos o noticias.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8 pb-24">
          {groups.map(([folder, groupItems]) => {
            const ids = groupItems.map((o) => o.public_id);
            const groupBytes = groupItems.reduce((s, o) => s + o.bytes, 0);
            const allSelected = ids.every((id) => selected.has(id));
            return (
              <section key={folder} className="space-y-4">
                <SectionTitle
                  actions={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGroup(folder, ids)}
                      disabled={deleting}
                    >
                      {allSelected ? "Deseleccionar" : "Seleccionar grupo"}
                    </Button>
                  }
                >
                  <span className="flex items-center gap-2">
                    {FOLDER_LABELS[folder] ?? folder}
                    <Badge variant="secondary" className="font-normal">
                      {groupItems.length} · {formatBytes(groupBytes)}
                    </Badge>
                  </span>
                </SectionTitle>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {groupItems.map((o) => {
                    const isSelected = selected.has(o.public_id);
                    return (
                      <button
                        key={o.public_id}
                        type="button"
                        onClick={() => toggle(o.public_id)}
                        className={`group relative text-left rounded-xl border-2 overflow-hidden transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                          isSelected
                            ? "border-brand ring-2 ring-brand/40"
                            : "border-border hover:border-brand/40"
                        }`}
                      >
                        <div className="absolute top-2 left-2 z-10">
                          <Checkbox
                            checked={isSelected}
                            aria-label={`Seleccionar ${o.public_id}`}
                            className="bg-background/80 backdrop-blur-sm"
                          />
                        </div>
                        <div className="aspect-square bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbUrl(o.secure_url)}
                            alt={o.public_id}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2 space-y-0.5">
                          <p
                            className="text-xs font-medium text-gray-900 dark:text-white truncate"
                            title={o.public_id}
                          >
                            {o.public_id.split("/").pop()}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {formatBytes(o.bytes)} ·{" "}
                            {dateFmt.format(new Date(o.created_at))}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Barra de acción fija cuando hay selección */}
      {selected.size > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg">
          <Card className="border-2 border-brand/30 shadow-xl bg-card/95 backdrop-blur-sm">
            <CardContent className="flex items-center justify-between gap-4 p-3 pl-4">
              <div className="text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selected.size} seleccionada{selected.size === 1 ? "" : "s"}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {" "}
                  · {formatBytes(selectedBytes)}
                </span>
              </div>
              <Button
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Borrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Borrar {selected.size} imagen{selected.size === 1 ? "" : "es"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán {formatBytes(selectedBytes)} de Cloudinary de forma
              permanente. Esta acción no se puede deshacer. Antes de borrar se
              revalida que ninguna siga en uso.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Borrando…" : "Borrar definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
