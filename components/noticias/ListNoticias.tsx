import Link from "next/link";
import { Button } from "../ui/button";
import Noticia from "./Noticia";
import { getNoticias } from "@/app/actions/noticias/getNoticias";

const ListNoticias = async () => {
    const noticias = await getNoticias();
    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Noticias Destacadas</h2>
                    <Button variant="outline" asChild>
                        <Link href="/noticias">Ver todas las noticias</Link>
                    </Button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {noticias.length === 0 ? (
                        <div className="col-span-3 text-center">
                            <p className="text-muted-foreground">
                                No hay noticias disponibles en este momento.
                            </p>
                        </div>
                    ) : (
                        noticias.map((news) => (
                            <Noticia news={news} key={news.id} />
                        ))
                    )}
                    {}
                </div>
            </div>
        </section>
    );
};

export default ListNoticias;
