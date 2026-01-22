import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Users,
    Smartphone,
    MapPin,
    Clock,
    Star,
    Download,
    Play,
    CheckCircle,
    UserPlus,
    MessageCircle,
    Shield
} from "lucide-react";

const appFeatures = [
    {
        icon: UserPlus,
        title: "Encuentra Jugadores",
        description:
            "Conecta con jugadores disponibles en tu zona que buscan partidos"
    },
    {
        icon: MapPin,
        title: "Ubicación Inteligente",
        description:
            "Encuentra partidos cerca de ti usando geolocalización avanzada"
    },
    {
        icon: Clock,
        title: "Organización Rápida",
        description: "Crea y organiza partidos en minutos, no en horas"
    },
    {
        icon: MessageCircle,
        title: "Chat Integrado",
        description: "Comunícate directamente con organizadores y jugadores"
    },
    {
        icon: Star,
        title: "Sistema de Reputación",
        description: "Califica jugadores y organizadores para crear confianza"
    },
    {
        icon: Shield,
        title: "Perfiles Verificados",
        description: "Jugadores verificados para mayor seguridad y confianza"
    }
];

const appStats = [
    { number: "15,000+", label: "Jugadores Activos" },
    { number: "2,500+", label: "Partidos Organizados" },
    { number: "95%", label: "Partidos Completados" },
    { number: "4.8★", label: "Calificación en Stores" }
];

const BuscandoRivales = () => {
    return (
        <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-green-950/20 dark:via-blue-950/20 dark:to-purple-950/20">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center mb-6">
                            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                                <Smartphone className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            BUSCANDO RIVALES
                        </h2>
                        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
                            La app que revoluciona la organización de partidos
                            de fútbol
                        </p>
                        <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
                            ¿Te faltan jugadores para completar tu equipo?
                            ¿Quieres jugar pero no tienes con quién? Buscando
                            Rivales conecta organizadores y jugadores para que
                            ningún partido se cancele por falta de gente.
                        </p>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                        {/* Left Side - App Preview */}
                        <div className="relative">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                <div className="bg-white rounded-2xl p-6 shadow-inner">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                                                <Users className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">
                                                    Partido Hoy
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Cancha Municipal
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800">
                                            Faltan 2
                                        </Badge>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">
                                                        JM
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    Juan Martínez
                                                </span>
                                            </div>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-sm font-bold">
                                                        CR
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-900">
                                                    Carlos Ruiz
                                                </span>
                                            </div>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                    <UserPlus className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="font-medium text-green-700">
                                                    ¡Únete al partido!
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-green-500 hover:bg-green-600"
                                            >
                                                Unirse
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-lg animate-bounce">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-full shadow-lg animate-pulse">
                                <MapPin className="h-6 w-6" />
                            </div>
                        </div>

                        {/* Right Side - Features */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-center lg:text-left">
                                    ¿Cómo funciona?
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                                            <span className="text-green-600 dark:text-green-400 font-bold">
                                                1
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">
                                                Crea tu partido
                                            </h4>
                                            <p className="text-muted-foreground">
                                                Define fecha, hora, ubicación y
                                                cuántos jugadores necesitas
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                                                2
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">
                                                Encuentra jugadores
                                            </h4>
                                            <p className="text-muted-foreground">
                                                La app conecta automáticamente
                                                con jugadores disponibles en tu
                                                zona
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4">
                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                                            <span className="text-purple-600 dark:text-purple-400 font-bold">
                                                3
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">
                                                ¡A jugar!
                                            </h4>
                                            <p className="text-muted-foreground">
                                                Confirma jugadores, coordina
                                                detalles y disfruta del partido
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mb-16">
                        <h3 className="text-3xl font-bold text-center mb-12">
                            Características Principales
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {appFeatures.map((feature, index) => (
                                <Card
                                    key={index}
                                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
                                >
                                    <CardContent className="p-6 text-center">
                                        <div className="bg-gradient-to-br from-green-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <feature.icon className="h-8 w-8 text-white" />
                                        </div>
                                        <h4 className="font-bold text-lg mb-2">
                                            {feature.title}
                                        </h4>
                                        <p className="text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 mb-16 shadow-xl">
                        <h3 className="text-2xl font-bold text-center mb-8">
                            Números que Hablan
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {appStats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-muted-foreground font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-12 text-white">
                        <h3 className="text-3xl md:text-4xl font-bold mb-4">
                            ¡Descarga Buscando Rivales Hoy!
                        </h3>
                        <p className="text-xl mb-8 opacity-90">
                            Únete a miles de jugadores que ya no cancelan
                            partidos por falta de gente
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button
                                size="lg"
                                className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg"
                            >
                                <Download className="h-6 w-6 mr-2" />
                                App Store
                            </Button>
                            <Button
                                size="lg"
                                className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 text-lg"
                            >
                                <Play className="h-6 w-6 mr-2" />
                                Google Play
                            </Button>
                        </div>

                        <div className="mt-8 flex items-center justify-center space-x-6 text-sm opacity-80">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5" />
                                <span>Descarga Gratuita</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5" />
                                <span>Sin Publicidad</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-5 w-5" />
                                <span>Fácil de Usar</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BuscandoRivales;

