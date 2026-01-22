import Link from "next/link";
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
    AlertCircle,
    Sparkles
} from "lucide-react";

const stats = [
    {
        title: "Torneos Activos",
        value: "0",
        description: "Crea tu primer torneo",
        icon: Trophy,
        trend: "Comienza ahora",
        color: "from-[#ad45ff] to-[#a3b3ff]"
    },
    {
        title: "Equipos Registrados",
        value: "0",
        description: "Sin equipos aún",
        icon: Users,
        trend: "Registra equipos",
        color: "from-blue-500 to-cyan-400"
    },
    {
        title: "Jugadores Activos",
        value: "0",
        description: "Participando en torneos",
        icon: UserCheck,
        trend: "Agrega jugadores",
        color: "from-green-500 to-emerald-400"
    },
    {
        title: "Partidos Programados",
        value: "0",
        description: "Para los próximos 7 días",
        icon: Calendar,
        trend: "Programa partidos",
        color: "from-orange-500 to-amber-400"
    }
];

const recentActivity = [
    {
        action: "¡Bienvenido a GOLAZO!",
        details: "Tu cuenta ha sido creada exitosamente",
        time: "Ahora",
        type: "success"
    },
    {
        action: "Primeros pasos",
        details: "Crea tu primer torneo para comenzar",
        time: "",
        type: "info"
    }
];

const pendingTasks = [
    {
        task: "Crear tu primer torneo",
        count: 1,
        priority: "high"
    },
    {
        task: "Registrar equipos participantes",
        count: 0,
        priority: "medium"
    },
    {
        task: "Agregar jugadores a equipos",
        count: 0,
        priority: "low"
    }
];

const quickActions = [
    {
        title: "Crear Torneo",
        icon: Trophy,
        href: "/admin/torneos/nuevo",
        color: "from-[#ad45ff] to-[#a3b3ff]"
    },
    {
        title: "Registrar Equipo",
        icon: Users,
        href: "/admin/equipos",
        color: "from-blue-500 to-cyan-400"
    },
    {
        title: "Programar Partido",
        icon: Calendar,
        href: "/admin/partidos",
        color: "from-green-500 to-emerald-400"
    },
    {
        title: "Ver Reportes",
        icon: TrendingUp,
        href: "/admin/estadisticas",
        color: "from-orange-500 to-amber-400"
    }
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Header con gradiente */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ad45ff]/10 via-[#a3b3ff]/10 to-transparent p-6 border border-[#ad45ff]/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ad45ff]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-6 h-6 text-[#ad45ff]" />
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent">
                            Dashboard
                        </h2>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Resumen general de la plataforma de torneos
                    </p>
                </div>
            </div>

            {/* Stats Cards con glassmorphism */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="glass-card border-0 overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                                <stat.icon className="h-4 w-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                {stat.value}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {stat.description}
                            </p>
                            <p className="text-xs text-[#ad45ff] mt-1 font-medium">
                                {stat.trend}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Recent Activity */}
                <Card className="glass-card border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] animate-pulse" />
                            Actividad Reciente
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            Últimas acciones en la plataforma
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-4 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                                >
                                    <div
                                        className={`w-3 h-3 rounded-full ${
                                            activity.type === "success"
                                                ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                                : activity.type === "warning"
                                                ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                                                : activity.type === "info"
                                                ? "bg-gradient-to-r from-blue-400 to-cyan-500"
                                                : "bg-gray-400"
                                        }`}
                                    />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                                            {activity.action}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {activity.details}
                                        </p>
                                    </div>
                                    {activity.time && (
                                        <div className="text-xs text-gray-400 dark:text-gray-500">
                                            {activity.time}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Tasks */}
                <Card className="glass-card border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <AlertCircle className="w-4 h-4 text-[#ad45ff]" />
                            Tareas Pendientes
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            Acciones que requieren tu atención
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingTasks.map((task, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className={`w-2 h-2 rounded-full ${
                                                task.priority === "high"
                                                    ? "bg-red-500"
                                                    : task.priority === "medium"
                                                    ? "bg-yellow-500"
                                                    : "bg-green-500"
                                            }`}
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {task.task}
                                        </span>
                                    </div>
                                    <span className="text-xs bg-gradient-to-r from-[#ad45ff]/10 to-[#a3b3ff]/10 text-[#ad45ff] px-3 py-1 rounded-full font-medium">
                                        {task.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="glass-card border-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ad45ff] via-[#a3b3ff] to-[#ad45ff]" />
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Acciones Rápidas</CardTitle>
                    <CardDescription className="text-gray-500">
                        Accesos directos a las funciones más utilizadas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {quickActions.map((action) => (
                            <Link key={action.title} href={action.href}>
                                <Card className="glass-card border-0 cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <CardContent className="flex flex-col items-center justify-center p-6 relative overflow-hidden">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                                            <action.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#ad45ff] transition-colors">
                                            {action.title}
                                        </span>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

