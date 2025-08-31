import Link from "next/link";
import { Button } from "../ui/button";
import Noticia from "./Noticia";
import { getNoticias } from "@/app/actions/noticias/getNoticias";

const ListNoticias = async () => {
  const noticias = await getNoticias();
  return (
    <section className="bg-[#1a1a2e] py-24 px-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12 flex-col md:flex-row gap-6">
          <h2 className="text-3xl font-bold">Noticias Destacadas</h2>
          <Button
            variant="outline"
            asChild
            className="px-4 py-2 rounded-xl border-2 border-purple-500 text-purple-500 font-semibold hover:bg-purple-500 hover:text-white transition"
          >
            <Link href="/public/noticias">Ver todas las noticias</Link>
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
            noticias.map((news) => <Noticia news={news} key={news.id} />)
          )}
          {}
        </div>
      </div>
    </section>
  );
};

export default ListNoticias;
