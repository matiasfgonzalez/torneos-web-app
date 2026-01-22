import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoadingUsuarios() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Loading */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
              <Skeleton className="h-8 w-80 bg-gray-200 dark:bg-gray-700" />
            </div>
            <Skeleton className="h-5 w-96 bg-gray-200 dark:bg-gray-700" />
          </div>
          <Skeleton className="h-11 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        {/* Stats Cards Loading */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="border-2 border-gray-200/50 dark:border-gray-700/50 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-gray-200 dark:bg-gray-700 mb-2" />
                <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Loading */}
        <Card className="border-2 border-gray-200/50 dark:border-gray-700/50 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-48 bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <Skeleton className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <Skeleton className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Users Table Loading */}
        <Card className="border-2 border-gray-200/50 dark:border-gray-700/50 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-64 bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4">
                <div className="grid grid-cols-7 gap-4">
                  <Skeleton className="h-5 w-16 bg-gray-200 dark:bg-gray-600" />
                  <Skeleton className="h-5 w-20 bg-gray-200 dark:bg-gray-600" />
                  <Skeleton className="h-5 w-12 bg-gray-200 dark:bg-gray-600" />
                  <Skeleton className="h-5 w-14 bg-gray-200 dark:bg-gray-600" />
                  <Skeleton className="h-5 w-18 bg-gray-200 dark:bg-gray-600" />
                  <Skeleton className="h-5 w-20 bg-gray-200 dark:bg-gray-600" />
                  <Skeleton className="h-5 w-16 bg-gray-200 dark:bg-gray-600" />
                </div>
              </div>

              {/* Table Rows */}
              <div className="divide-y dark:divide-gray-700">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="grid grid-cols-7 gap-4 items-center">
                      {/* Usuario */}
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
                          <Skeleton className="h-3 w-32 bg-gray-200 dark:bg-gray-700" />
                        </div>
                      </div>

                      {/* Email */}
                      <Skeleton className="h-4 w-40 bg-gray-200 dark:bg-gray-700" />

                      {/* Rol */}
                      <Skeleton className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />

                      {/* Estado */}
                      <Skeleton className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />

                      {/* Última conexión */}
                      <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" />

                      {/* Fecha registro */}
                      <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" />

                      {/* Acciones */}
                      <div className="flex justify-end space-x-2">
                        <Skeleton className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                        <Skeleton className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                        <Skeleton className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Loading */}
            <div className="flex items-center justify-between mt-6">
              <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <Skeleton className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
                <Skeleton className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
                <Skeleton className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
                <Skeleton className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

