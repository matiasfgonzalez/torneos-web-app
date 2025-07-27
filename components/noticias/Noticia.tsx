import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { formatDate } from "@/lib/formatDate";
import { INoticia } from "./types";
import { Calendar, User } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

interface NoticiaProps {
    news: INoticia;
}

const Noticia = (props: NoticiaProps) => {
    const { news } = props;
    return (
        <Card
            key={news.id}
            className="overflow-hidden hover:shadow-lg transform transition-transform duration-300 hover:scale-[1.02]"
        >
            <div className="aspect-video bg-muted overflow-hidden rounded-lg">
                <img
                    src={news.coverImageUrl ?? "/placeholder.svg"}
                    alt={news.title}
                    className="w-full h-full object-cover object-center"
                />
            </div>
            <CardHeader>
                <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">
                        <User className="h-4 w-4" />
                        {news.user.name ?? "Anónimo"}
                    </Badge>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {news.publishedAt
                            ? formatDate(news.publishedAt)
                            : "Sin fecha"}
                    </span>
                </div>
                <CardTitle className="">{news.title}</CardTitle>
                {/*<CardDescription className="line-clamp-3">
                    {news.summary ?? "No hay resumen disponible."}
                </CardDescription>*/}
            </CardHeader>
            <CardContent>
                <Button variant="secondary" className="w-full cursor-pointer">
                    <Link href={`/public/noticias/${news.id}`}>Leer más</Link>
                </Button>
            </CardContent>
        </Card>
    );
};

export default Noticia;
