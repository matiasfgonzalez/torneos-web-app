import { ITorneo } from "@/components/torneos/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PropsStatsCards {
    tournaments: ITorneo[];
}

const StatsCards = (props: PropsStatsCards) => {
    const { tournaments } = props;
    const bgCard =
        "bg-gradient-to-r from-green-500 to-blue-500 text-black hover:from-green-400 hover:to-blue-400 hover:scale-105 transition-all duration-300";
    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card className={`h-full ${bgCard}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Torneos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {tournaments.length}
                    </div>
                </CardContent>
            </Card>
            <Card className={`h-full ${bgCard}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        En Curso
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {
                            tournaments.filter((t) => t.status === "En curso")
                                .length
                        }
                    </div>
                </CardContent>
            </Card>
            <Card className={`h-full ${bgCard}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Inscripciones
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {
                            tournaments.filter(
                                (t) => t.status === "Inscripciones"
                            ).length
                        }
                    </div>
                </CardContent>
            </Card>
            <Card className={`h-full ${bgCard}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Finalizados
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {
                            tournaments.filter((t) => t.status === "Finalizado")
                                .length
                        }
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default StatsCards;
