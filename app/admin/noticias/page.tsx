"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useSearchParams } from "next/navigation";
import { SmartImage } from "@/components/shared/SmartImage";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import {
  Calendar,
  Edit,
  Eye,
  FileText,
  Filter,
  ImageIcon,
  Newspaper,
  PenLine,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard, StatCardGrid } from "@/components/shared/StatCard";
import { SkeletonTable } from "@/components/shared/Skeletons";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/DataTable";
import { formatDate } from "@/lib/formatDate";
import { INoticia } from "@modules/noticias/types";
import {
  getNoticiasAdminPaged,
  getNoticiasStats,
} from "@modules/noticias/actions/getNoticiasAdmin";
import { parseTableParams } from "@/lib/tableParams";
import { NoticiaForm } from "./NoticiaForm";

/**
 * Listado de noticias de la plataforma (patrón §4 variante A de UI_PATTERNS:
 * header showcase + KPIs + DataTable).
 *
 * `published` es un booleano, no un enum de estado, así que no pasa por
 * `<StatusBadge>` — es la excepción ya documentada en F3.
 */
function PublishedBadge({ published }: Readonly<{ published: boolean }>) {
  return published ? (
    <Badge className="border-green-200 bg-green-100 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
      Publicado
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-300"
    >
      Borrador
    </Badge>
  );
}

export default function AdminNoticias() {
  // Estado de la tabla (página/búsqueda/filtro/orden) en la URL (M7): la lista
  // se pagina y filtra en el server vía server action (no por `/api/noticias`,
  // que es pública y devuelve un array plano).
  const searchParams = useSearchParams();
  const params = useMemo(
    () =>
      parseTableParams(Object.fromEntries(searchParams.entries()), {
        filterKeys: ["published"],
      }),
    [searchParams],
  );

  // `null` = todavía no llegó la primera respuesta. Evita el frame con la tabla
  // vacía y el `setState` en el cuerpo del effect (react-hooks).
  const [data, setData] = useState<{ rows: INoticia[]; total: number } | null>(
    null,
  );
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const [, startFetch] = useTransition();

  const fetchNoticias = useCallback(() => {
    startFetch(async () => {
      try {
        const [paged, st] = await Promise.all([
          getNoticiasAdminPaged(params),
          getNoticiasStats(),
        ]);
        setData(paged);
        setStats(st);
      } catch {
        setData({ rows: [], total: 0 });
        toast.error("No se pudieron cargar las noticias");
      }
    });
  }, [params]);

  useEffect(() => {
    fetchNoticias();
  }, [fetchNoticias]);

  const isLoading = data === null;
  const list = data?.rows ?? [];
  const published = stats.published;

  const handleDeleteArticle = async (id: string) => {
    const res = await api.del(`/api/noticias/${id}`);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    fetchNoticias();
    toast.success("Noticia eliminada");
  };

  const togglePublishStatus = async (article: INoticia) => {
    const next = !article.published;
    // Solo el campo que cambia: `newsUpdateSchema` es parcial y mandar la
    // noticia entera arrastraba el autor y las fechas sin necesidad.
    const res = await api.put<INoticia>(`/api/noticias/${article.id}`, {
      published: next,
    });
    if (res.ok) {
      fetchNoticias();
      toast.success(next ? "Noticia publicada" : "Pasada a borrador");
    } else {
      toast.error("No se pudo cambiar el estado");
    }
  };

  // Función de render, no componente: declararlo acá dentro lo remontaría en
  // cada render (react-hooks/static-components).
  const renderRowActions = (article: INoticia) => (
    <>
      <Button
        variant="outline"
        size="icon"
        asChild
        title="Ver noticia"
        className="h-9 w-9 rounded-lg border-blue-300 text-blue-600 transition-all hover:border-blue-400 hover:bg-blue-50 dark:border-blue-500/50 dark:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-500/10"
      >
        <Link href={`/admin/noticias/${article.id}`}>
          <Eye className="h-4 w-4" />
          <span className="sr-only">Ver {article.title}</span>
        </Link>
      </Button>

      <Button
        variant="outline"
        size="icon"
        asChild
        title="Editar noticia"
        className="h-9 w-9 rounded-lg border-green-300 text-green-600 transition-all hover:border-green-400 hover:bg-green-50 dark:border-green-500/50 dark:text-green-400 dark:hover:border-green-500 dark:hover:bg-green-500/10"
      >
        <Link href={`/admin/noticias/${article.id}/edit`}>
          <Edit className="h-4 w-4" />
          <span className="sr-only">Editar {article.title}</span>
        </Link>
      </Button>

      <ConfirmDialog
        title="¿Eliminar la noticia?"
        description={
          <>
            Se elimina <strong>{article.title}</strong> de forma permanente,
            junto con su portada. Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        tone="danger"
        icon={Trash2}
        onConfirm={() => handleDeleteArticle(article.id)}
        trigger={
          <Button
            variant="outline"
            size="icon"
            title="Eliminar noticia"
            className="h-9 w-9 rounded-lg border-red-300 text-red-600 transition-all hover:border-red-400 hover:bg-red-50 dark:border-red-500/50 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar {article.title}</span>
          </Button>
        }
      />
    </>
  );

  const newsColumns: DataTableColumn<INoticia>[] = [
    {
      id: "article",
      header: "Noticia",
      sortValue: (a) => a.title,
      cell: (article) => (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
            {article.coverImageUrl ? (
              <SmartImage
                src={article.coverImageUrl}
                alt=""
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            )}
          </div>
          <div className="max-w-xs">
            <div className="line-clamp-1 font-medium text-gray-900 dark:text-white">
              {article.title}
            </div>
            <div className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {article.summary}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "publishedAt",
      header: "Fecha",
      sortValue: (a) => (a.publishedAt ? new Date(a.publishedAt).getTime() : 0),
      cell: (article) => (
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Calendar className="mr-1 h-4 w-4 shrink-0 text-brand" />
          {article.publishedAt ? formatDate(article.publishedAt) : "Sin fecha"}
        </div>
      ),
    },
    {
      id: "status",
      header: "Estado",
      sortValue: (a) => (a.published ? 0 : 1),
      cell: (article) => (
        <button
          type="button"
          onClick={() => togglePublishStatus(article)}
          className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          title={article.published ? "Pasar a borrador" : "Publicar"}
        >
          <PublishedBadge published={article.published} />
          <span className="sr-only">
            {article.published
              ? `Pasar ${article.title} a borrador`
              : `Publicar ${article.title}`}
          </span>
        </button>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      align: "right",
      hideOnCard: true,
      cell: (article) => (
        <div className="flex justify-end gap-2">{renderRowActions(article)}</div>
      ),
    },
  ];

  return (
    <div className="space-y-8 p-6 sm:p-8">
      <PageHeader
        icon={Newspaper}
        title="Panel de Noticias"
        statusText={`Sistema activo · ${stats.total} ${
          stats.total === 1 ? "noticia" : "noticias"
        }`}
        description="Gestiona las noticias de la plataforma: creá, publicá y editá los artículos que ven todos los usuarios de GOLAZO."
        quickStats={[
          {
            icon: Eye,
            text: `${published} publicadas`,
            colorClass:
              "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
          },
          {
            icon: PenLine,
            text: `${stats.drafts} borradores`,
            colorClass:
              "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
          },
        ]}
        actions={<NoticiaForm onSuccess={fetchNoticias} />}
      />

      <StatCardGrid>
        <StatCard
          title="Total noticias"
          value={stats.total}
          description="Artículos en total"
          icon={FileText}
        />
        <StatCard
          title="Publicadas"
          value={published}
          description="Visibles al público"
          icon={Eye}
          gradient="from-green-500 to-emerald-500"
          bgGradient="from-green-500/10 to-emerald-500/10"
        />
        <StatCard
          title="Borradores"
          value={stats.drafts}
          description="Sin publicar"
          icon={PenLine}
          gradient="from-orange-500 to-amber-500"
          bgGradient="from-orange-500/10 to-amber-500/10"
        />
      </StatCardGrid>

      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : (
        <DataTable
          rows={list}
          server={{
            total: data?.total ?? 0,
            page: params.page,
            pageSize: params.pageSize,
            q: params.q,
            sort: params.sort,
            dir: params.dir,
            filterValues: { published: params.filters.published ?? "all" },
          }}
          columns={newsColumns}
          getRowKey={(a) => a.id}
          icon={FileText}
          title="Lista de noticias"
          description="Gestiona todas las noticias y artículos publicados"
          searchable={{
            placeholder: "Buscar noticias...",
            getText: (a) => `${a.title} ${a.summary}`,
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
              test: (a, value) =>
                value === "published" ? a.published : !a.published,
            },
          ]}
          empty={{
            icon: FileText,
            title: "Todavía no hay noticias",
            description: "Creá tu primera noticia para comenzar.",
            filteredTitle: "No se encontraron noticias",
            filteredDescription:
              "Ninguna noticia coincide con los filtros aplicados.",
          }}
          rowActions={renderRowActions}
        />
      )}
    </div>
  );
}
