import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "../ui/card";
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
                        <User className="h-4 w-4" />
                        {news.user.name ?? "Anónimo"}
                    </Badge>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {news.date ? formatDate(news.date) : "Sin fecha"}
                    </span>
                </div>
                <CardTitle className="">{news.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                    {news.summary ?? "No hay resumen disponible."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    variant="outline"
                    className="w-full bg-blue-700 hover:bg-blue-500 text-white hover:text-white cursor-pointer"
                >
                    <Link href={`/noticias/${news.id}`}>Leer más</Link>
                </Button>
            </CardContent>
        </Card>
    );
};

export default Noticia;
