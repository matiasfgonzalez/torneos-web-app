import TeamForm from "./components/team-form";
import StatsCards from "./components/StatsCards";
import TeamsTable from "./components/TeamsTable";
import { getEquipos } from "@/app/actions/equipos/getEquipos";

export default async function AdminEquipos() {
    const teams = await getEquipos();
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Gestión de Equipos
                    </h2>
                    <p className="text-muted-foreground">
                        Administra todos los equipos registrados en la
                        plataforma
                    </p>
                </div>

                {/* Formulario de Creación */}
                <TeamForm isEditMode={false} />
            </div>

            {/* Stats Cards */}
            <StatsCards teams={teams} />

            {/* Teams Table */}
            <TeamsTable teams={teams} />
        </div>
    );
}
