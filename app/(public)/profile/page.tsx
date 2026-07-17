import { checkUser } from "@/lib/checkUser";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Edit2,
  UserIcon,
  Heart,
} from "lucide-react";
import ProfileForm from "./components/ProfileForm";
import ActivityHistory from "./components/ActivityHistory";
import { getUserFavorites } from "@modules/favoritos/actions/favorites";
import { FavoritesTab } from "@modules/usuarios/components/FavoritesTab";
import { HatsHub } from "@modules/usuarios/components/HatsHub";
import { getUserHats } from "@/lib/userHats";
import { USER_ROLE_LABELS } from "@/lib/constants";

export default async function ProfilePage() {
  const user = await checkUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [favorites, hats] = await Promise.all([
    getUserFavorites(),
    getUserHats(user),
  ]);

  // Calculate quick stats
  const joinedDate = new Date(user.createdAt).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex-grow p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="glass-card rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 border-0 shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand to-brand-2 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white dark:border-gray-900 shadow-xl relative z-10">
              <AvatarImage
                src={user.imageUrl || ""}
                alt={user.name || "User"}
              />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-brand to-brand-2 text-white">
                {user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* Edit avatar button (Visual only for now) */}
            <button
              className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 z-20 hover:scale-110 transition-transform cursor-not-allowed opacity-80"
              title="Próximamente"
            >
              <Edit2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4 z-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {user.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Badge
                  variant="outline"
                  className="border-brand/40 text-brand bg-brand/5 px-3 py-1"
                >
                  {USER_ROLE_LABELS[user.role]}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-3 h-3" />
                  Miembro desde {joinedDate}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700/50">
                <Mail className="w-4 h-4 text-brand" />
                {user.email}
              </div>
              {user.location && (
                <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700/50">
                  <MapPin className="w-4 h-4 text-brand-2" />
                  {user.location}
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700/50">
                  <Phone className="w-4 h-4 text-purple-400" />
                  {user.phone}
                </div>
              )}
            </div>

            {user.bio && (
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl text-balance">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* Mis vínculos (N14a): las 4 puertas con su estado real */}
        {hats && <HatsHub hats={hats} />}

        {/* Content Tabs */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/40 dark:bg-gray-900/40 p-1 rounded-xl mb-6 backdrop-blur-md border border-white/20">
                <TabsTrigger
                  value="info"
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg data-[state=active]:text-brand transition-all duration-300"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Información Personal</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg data-[state=active]:text-brand transition-all duration-300"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favoritos
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-lg data-[state=active]:text-brand transition-all duration-300"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Historial y Actividad</span>
                  <span className="sm:hidden">Historial</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="info"
                className="glass-card p-6 md:p-8 rounded-2xl border-0 animate-in fade-in-50 zoom-in-95 duration-300"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Editar Perfil
                  </h2>
                  <p className="text-sm text-gray-500">
                    Actualiza tu información personal visible para otros
                    usuarios.
                  </p>
                </div>
                <ProfileForm user={user} />
              </TabsContent>

              <TabsContent
                value="favorites"
                className="glass-card p-6 md:p-8 rounded-2xl border-0 animate-in fade-in-50 zoom-in-95 duration-300"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Torneos y Equipos que Seguís
                  </h2>
                  <p className="text-sm text-gray-500">
                    Los vas a ver también en tu inicio.
                  </p>
                </div>
                <FavoritesTab
                  tournaments={favorites.tournaments}
                  teams={favorites.teams}
                />
              </TabsContent>

              <TabsContent
                value="activity"
                className="glass-card p-6 md:p-8 rounded-2xl border-0 animate-in fade-in-50 zoom-in-95 duration-300"
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Tu Actividad
                  </h2>
                  <p className="text-sm text-gray-500">
                    Resumen de torneos y equipos asociados a tu cuenta.
                  </p>
                </div>
                <ActivityHistory user={user} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar / Stats Column */}
          <div className="space-y-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-brand to-brand-2 bg-clip-text text-transparent">
                  Estado de Cuenta
                </CardTitle>
                <CardDescription>Resumen de tu suscripción</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Estado
                  </span>
                  <Badge className="bg-green-500 hover:bg-green-600">
                    Activo
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Gestionado por Clerk & Database
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 bg-gradient-to-br from-brand/10 to-transparent">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  ¿Necesitas ayuda?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Si tienes problemas con tu cuenta o necesitas cambiar tu rol,
                  contacta a soporte.
                </p>
                <button className="w-full py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-brand shadow-sm hover:shadow-md transition-all">
                  Contactar Soporte
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
