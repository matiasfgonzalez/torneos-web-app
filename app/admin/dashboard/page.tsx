import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Trophy,
    Users,
    UserCheck,
    Calendar,
    TrendingUp,
    AlertCircle
} from "lucide-react";

const stats = [
    {
        title: "Torneos Activos",
        value: "8",
        description: "3 finalizando esta semana",
        icon: Trophy,
        trend: "+2 desde el mes pasado"
    },
    {
        title: "Equipos Registrados",
        value: "156",
        description: "12 nuevos este mes",
        icon: Users,
        trend: "+12 nuevos registros"
    },
    {
        title: "Jugadores Activos",
        value: "2,847",
        description: "Participando en torneos",
        icon: UserCheck,
        trend: "+89 este mes"
    },
    {
        title: "Partidos Programados",
        value: "45",
        description: "Para los próximos 7 días",
        icon: Calendar,
        trend: "23 pendientes de resultado"
    }
];

const recentActivity = [
    {
        action: "Nuevo torneo creado",
        details: "Copa Juvenil 2024",
        time: "Hace 2 horas",
        type: "success"
    },
    {
        action: "Equipo registrado",
        details: "Deportivo San Juan",
        time: "Hace 4 horas",
        type: "info"
    },
    {
        action: "Partido finalizado",
        details: "Águilas 2-1 Leones",
        time: "Hace 6 horas",
        type: "success"
    },
    {
        action: "Jugador suspendido",
        details: "Carlos Rodríguez - 2 partidos",
        time: "Hace 1 día",
        type: "warning"
    },
    {
        action: "Torneo finalizado",
        details: "Liga Amateur Clausura",
        time: "Hace 2 días",
        type: "success"
    }
];

const pendingTasks = [
    {
        task: "Revisar inscripciones pendientes",
        count: 8,
        priority: "high"
    },
    {
        task: "Aprobar cambios de jugadores",
        count: 3,
        priority: "medium"
    },
    {
        task: "Programar partidos de semifinal",
        count: 4,
        priority: "high"
    },
    {
        task: "Actualizar estadísticas de torneo",
        count: 2,
        priority: "low"
    }
];

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Resumen general de la plataforma de torneos
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stat.value}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                                {stat.trend}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                        <CardDescription>
                            Últimas acciones en la plataforma
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-4"
                                >
                                    <div
                                        className={`w-2 h-2 rounded-full ${
                                            activity.type === "success"
                                                ? "bg-green-500"
                                                : activity.type === "warning"
                                                ? "bg-yellow-500"
                                                : activity.type === "info"
                                                ? "bg-blue-500"
                                                : "bg-gray-500"
                                        }`}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {activity.action}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.details}
                                        </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {activity.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tareas Pendientes</CardTitle>
                        <CardDescription>
                            Acciones que requieren tu atención
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingTasks.map((task, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-3">
                                        <AlertCircle
                                            className={`h-4 w-4 ${
                                                task.priority === "high"
                                                    ? "text-red-500"
                                                    : task.priority === "medium"
                                                    ? "text-yellow-500"
                                                    : "text-green-500"
                                            }`}
                                        />
                                        <span className="text-sm font-medium">
                                            {task.task}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs bg-muted px-2 py-1 rounded">
                                            {task.count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                    <CardDescription>
                        Accesos directos a las funciones más utilizadas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                        <Card className="cursor-pointer hover:bg-accent transition-colors">
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <Trophy className="h-8 w-8 mb-2 text-primary" />
                                <span className="text-sm font-medium">
                                    Crear Torneo
                                </span>
                            </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:bg-accent transition-colors">
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <Users className="h-8 w-8 mb-2 text-primary" />
                                <span className="text-sm font-medium">
                                    Registrar Equipo
                                </span>
                            </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:bg-accent transition-colors">
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <Calendar className="h-8 w-8 mb-2 text-primary" />
                                <span className="text-sm font-medium">
                                    Programar Partido
                                </span>
                            </CardContent>
                        </Card>
                        <Card className="cursor-pointer hover:bg-accent transition-colors">
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                                <span className="text-sm font-medium">
                                    Ver Reportes
                                </span>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
