import StatsCards from "./components/StatsCards";
import ListTournaments from "./components/ListTournaments";
import DialogAddTournaments from "./components/DialogAddTournaments";
import { getTorneos } from "@/app/actions/torneos/getTorneos";

export default async function AdminTorneos() {
    const tournaments = await getTorneos();

    console.log("Torneos obtenidos:", tournaments);
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Gestión de Torneos
                    </h2>
                    <p className="text-muted-foreground">
                        Administra todos los torneos de la plataforma
                    </p>
                </div>
                <DialogAddTournaments />
            </div>

            {/* Stats Cards */}
            <StatsCards tournaments={tournaments} />

            {/* Search and Filters */}
            <ListTournaments tournaments={tournaments} />
        </div>
    );
}
