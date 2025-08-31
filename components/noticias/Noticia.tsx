import { formatDate } from "@/lib/formatDate";
import { INoticia } from "./types";
import Link from "next/link";

interface NoticiaProps {
  news: INoticia;
}

const Noticia = (props: NoticiaProps) => {
  const { news } = props;
  return (
    <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:-translate-y-3 hover:border-purple-400/40 transition">
      <div className="relative w-full h-64">
        <img
          src={news.coverImageUrl ?? "/placeholder.svg"}
          alt={news.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="p-6">
        <span className="bg-purple-500 px-3 py-1 rounded-full text-sm font-semibold">
          {news.user.name ?? "Anónimo"}
        </span>
        <p className="text-gray-400 text-sm mt-2">
          📅 {news.publishedAt ? formatDate(news.publishedAt) : "Sin fecha"}
        </p>
        <h3 className="text-xl font-bold mt-2">{news.title}</h3>
        <Link href={`/public/noticias/${news.id}`}>
          <button className="w-full cursor-pointer mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 font-semibold hover:scale-105 transition">
            Leer más
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Noticia;
