"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Megaphone,
  Filter,
  Trash2,
  ImageIcon,
  Calendar,
  Lock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { formatDate } from "@/lib/formatDate";
import type { IOrgPost } from "@modules/novedades/types";
import { OrgPostForm } from "./OrgPostForm";

export function NovedadesClient({
  posts,
  canCreate,
}: Readonly<{ posts: IOrgPost[]; canCreate: boolean }>) {
  const router = useRouter();

  const togglePublish = async (post: IOrgPost) => {
    const res = await fetch(`/api/org-posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      toast.error(err?.error ?? "No se pudo cambiar el estado");
      return;
    }
    toast.success(post.published ? "Pasada a borrador" : "Novedad publicada");
    router.refresh();
  };

  const deletePost = async (post: IOrgPost) => {
    const res = await fetch(`/api/org-posts/${post.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      toast.error(err?.error ?? "No se pudo eliminar la novedad");
      return;
    }
    toast.success("Novedad eliminada");
    router.refresh();
  };

  const statusBadge = (published: boolean) =>
    published ? (
      <Badge className="border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
        Publicada
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
      >
        Borrador
      </Badge>
    );

  // Funciones de render (no componentes) para no remontar el árbol por fila.
  const renderRowActions = (post: IOrgPost) => (
    <>
      <OrgPostForm isEditMode post={post} />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
            title="Eliminar novedad"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar {post.title}</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta novedad?</AlertDialogTitle>
            <AlertDialogDescription>
              Se va a quitar{" "}
              <strong className="text-gray-900 dark:text-white">
                {post.title}
              </strong>{" "}
              de la página de tu liga. Podés volver a crearla cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePost(post)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  const columns: DataTableColumn<IOrgPost>[] = [
    {
      id: "post",
      header: "Novedad",
      sortValue: (p) => p.title,
      cell: (post) => (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
            {post.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.coverImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <div className="max-w-xs">
            <div className="line-clamp-1 font-medium text-gray-900 dark:text-white">
              {post.title}
            </div>
            {post.summary && (
              <div className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                {post.summary}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "date",
      header: "Fecha",
      sortValue: (p) => new Date(p.publishedAt ?? p.createdAt).getTime(),
      cell: (post) => (
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Calendar className="mr-1 h-4 w-4 shrink-0 text-brand" />
          {formatDate(post.publishedAt ?? post.createdAt)}
        </div>
      ),
    },
    {
      id: "status",
      header: "Estado",
      sortValue: (p) => (p.published ? 0 : 1),
      cell: (post) => (
        <button
          type="button"
          onClick={() => togglePublish(post)}
          className="cursor-pointer"
          title={post.published ? "Pasar a borrador" : "Publicar"}
        >
          {statusBadge(post.published)}
        </button>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      align: "right",
      hideOnCard: true,
      cell: (post) => (
        <div className="flex justify-end gap-2">{renderRowActions(post)}</div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-brand to-brand-2" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Novedades de la liga
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Publicaciones que aparecen en la página pública de tu liga.
          </p>
        </div>
        <OrgPostForm isEditMode={false} canCreate={canCreate} />
      </div>

      {/* Upsell si el plan no incluye la feature */}
      {!canCreate && (
        <div className="flex flex-col gap-3 rounded-2xl border border-brand/30 bg-gradient-to-r from-brand/5 to-brand-2/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-mid">
              <Lock className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Novedades es una función de plan superior
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mejorá tu plan para publicar novedades en la página de tu liga.
                {posts.length > 0 &&
                  " Las que ya cargaste siguen visibles y editables."}
              </p>
            </div>
          </div>
          <Button variant="brand" asChild className="shrink-0">
            <a href="/admin/plan">
              <Sparkles className="h-4 w-4" />
              Ver planes
            </a>
          </Button>
        </div>
      )}

      <DataTable
        rows={posts}
        columns={columns}
        getRowKey={(p) => p.id}
        icon={Megaphone}
        title="Tus novedades"
        description="Borradores y publicaciones de tu liga"
        searchable={{
          placeholder: "Buscar novedades…",
          getText: (p) => `${p.title} ${p.summary ?? ""}`,
        }}
        filters={[
          {
            id: "published",
            label: "Estado",
            icon: Filter,
            options: [
              { value: "all", label: "Todas" },
              { value: "published", label: "Publicadas" },
              { value: "draft", label: "Borradores" },
            ],
            test: (p, value) =>
              value === "published" ? p.published : !p.published,
          },
        ]}
        empty={{
          icon: Megaphone,
          title: "Todavía no hay novedades",
          description:
            "Creá tu primera novedad para que aparezca en la página de tu liga.",
          filteredTitle: "No se encontraron novedades",
          filteredDescription: "Ninguna coincide con los filtros aplicados.",
        }}
        rowActions={renderRowActions}
      />
    </div>
  );
}
