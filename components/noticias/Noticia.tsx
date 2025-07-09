import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatDate } from "@/lib/formatDate";
import { INoticia } from "./types";

interface NoticiaProps {
    news: INoticia;
}

const Noticia = (props: NoticiaProps) => {
    const { news } = props;
    return (
        <Card
            key={news.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
        >
            <div className="aspect-video bg-muted">
                <img
                    src={news.coverImageUrl ?? "/placeholder.svg"}
                    alt={news.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">
                        Por {news.user.name ?? "Anónimo"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        {news.date ? formatDate(news.date) : "Sin fecha"}
                    </span>
                </div>
                <CardTitle className="">{news.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                    {news.summary ?? "No hay resumen disponible."}
                </CardDescription>
            </CardHeader>
        </Card>
    );
};

export default Noticia;
