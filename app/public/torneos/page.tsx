import { getTorneos } from "@/app/actions/torneos/getTorneos";
import FiltroTorneos from "@/components/torneos/FiltroTorneos";

export default async function TorneosPage() {
  const torneos = await getTorneos();
  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Todos los Torneos
          </h1>
          <p className="text-muted-foreground dark:text-gray-400 text-lg">
            Explora todos los torneos disponibles, desde los más competitivos
            hasta los amateur.
          </p>
        </div>

        <FiltroTorneos tournaments={torneos} />
      </div>
    </div>
  );
}
