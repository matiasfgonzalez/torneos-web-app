import { FullscreenLoading } from "@/components/fullscreen-loading";

export default function AdminLoading() {
  return (
    <FullscreenLoading
      isVisible
      message="Cargando panel..."
      submessage="Preparando datos de administración"
    />
  );
}
