import {
  BarChart3,
  Users,
  Calendar,
  Video,
  ImageIcon,
  Trophy,
} from "lucide-react";

export const features = [
  {
    icon: BarChart3,
    title: "Tablas de Posiciones",
    description:
      "Actualización automática en tiempo real con estadísticas detalladas y rankings dinámicos.",
  },
  {
    icon: Users,
    title: "Gestión de Equipos",
    description:
      "Administra equipos y jugadores con perfiles completos, estadísticas y historial de rendimiento.",
  },
  {
    icon: Calendar,
    title: "Programación Inteligente",
    description:
      "Calendario automático de partidos con notificaciones y recordatorios para todos los participantes.",
  },
  {
    icon: Video,
    title: "Contenido Multimedia",
    description:
      "Integración con YouTube para highlights, entrevistas y contenido promocional del torneo.",
  },
  {
    icon: ImageIcon,
    title: "Publicidad Integrada",
    description:
      "Carrusel de imágenes publicitarias con gestión avanzada de patrocinadores y espacios comerciales.",
  },
  {
    icon: Trophy,
    title: "Centro de Noticias",
    description:
      "Publica noticias, resultados y actualizaciones importantes con sistema de notificaciones push.",
  },
] as const;
