import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
              <Skeleton className="h-8 w-64 bg-gray-200 dark:bg-gray-700" />
            </div>
            <Skeleton className="h-4 w-96 bg-gray-200 dark:bg-gray-700" />
          </div>
          <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-600" />
                <Skeleton className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-600" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-gray-200 dark:bg-gray-600" />
                <Skeleton className="h-3 w-20 mt-1 bg-gray-200 dark:bg-gray-600" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-xl bg-gray-200 dark:bg-gray-600" />
              <div>
                <Skeleton className="h-6 w-32 bg-gray-200 dark:bg-gray-600" />
                <Skeleton className="h-4 w-64 mt-1 bg-gray-200 dark:bg-gray-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full bg-gray-200 dark:bg-gray-600" />
              <div className="rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4">
                  <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-4 w-16 bg-gray-300 dark:bg-gray-600" />
                    <Skeleton className="h-4 w-12 bg-gray-300 dark:bg-gray-600" />
                    <Skeleton className="h-4 w-14 bg-gray-300 dark:bg-gray-600" />
                    <Skeleton className="h-4 w-16 bg-gray-300 dark:bg-gray-600" />
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-4 gap-4 items-center py-2"
                    >
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-16 rounded bg-gray-200 dark:bg-gray-600" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-600" />
                          <Skeleton className="h-3 w-24 bg-gray-200 dark:bg-gray-600" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-600" />
                      <Skeleton className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-600" />
                      <div className="flex justify-end space-x-2">
                        <Skeleton className="h-8 w-8 bg-gray-200 dark:bg-gray-600" />
                        <Skeleton className="h-8 w-8 bg-gray-200 dark:bg-gray-600" />
                        <Skeleton className="h-8 w-8 bg-gray-200 dark:bg-gray-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading overlay */}
        <div className="fixed inset-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" text="Cargando noticias..." />
            <p className="text-gray-600 dark:text-gray-400">
              Preparando el panel de administración...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

