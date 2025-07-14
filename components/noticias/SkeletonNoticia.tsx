const SkeletonNoticia = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 animate-pulse">
                <div className="mb-6 h-8 w-32 bg-gray-300 rounded" />

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="h-4 w-24 bg-gray-300 rounded" />
                        <div className="h-4 w-28 bg-gray-300 rounded" />
                        <div className="h-4 w-16 bg-gray-300 rounded" />
                    </div>

                    {/* Título */}
                    <div className="h-10 w-3/4 bg-gray-300 rounded" />

                    {/* Summary */}
                    <div className="h-5 w-full bg-gray-200 rounded" />
                    <div className="h-5 w-11/12 bg-gray-200 rounded" />

                    {/* Autor */}
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-300 rounded-full" />
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-300 rounded" />
                            <div className="h-3 w-48 bg-gray-200 rounded" />
                        </div>
                    </div>

                    {/* Imagen principal */}
                    <div className="h-72 w-full bg-gray-300 rounded-lg" />

                    {/* Contenido */}
                    <div className="space-y-3">
                        <div className="h-4 w-full bg-gray-200 rounded" />
                        <div className="h-4 w-11/12 bg-gray-200 rounded" />
                        <div className="h-4 w-10/12 bg-gray-200 rounded" />
                        <div className="h-4 w-9/12 bg-gray-200 rounded" />
                        <div className="h-4 w-8/12 bg-gray-200 rounded" />
                    </div>

                    {/* Botón compartir */}
                    <div className="h-10 w-32 bg-gray-300 rounded" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonNoticia;
