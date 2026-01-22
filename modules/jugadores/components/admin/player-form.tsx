"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Calendar,
  MapPin,
  Globe,
  Ruler,
  Weight,
  Footprints,
  Trophy,
  Hash,
  ImageIcon,
  FileText,
  InstagramIcon,
  TwitterIcon,
  Clock,
  Edit,
  Plus,
  Save,
  Loader2,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IPlayer,
  PLAYER_FOOT,
  PLAYER_POSITION,
  PLAYER_STATUS,
} from "@modules/jugadores/types";

interface PlayerFormProps {
  isEditMode: boolean;
  player?: IPlayer;
}

export default function PlayerForm(props: Readonly<PlayerFormProps>) {
  const { isEditMode, player } = props;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: isEditMode ? player?.name || "" : "",
    birthDate: isEditMode ? player?.birthDate || "" : "",
    birthPlace: isEditMode ? player?.birthPlace || "" : "",
    nationality: isEditMode ? player?.nationality || "" : "",
    height: isEditMode ? player?.height || "" : "",
    weight: isEditMode ? player?.weight || "" : "",
    dominantFoot: isEditMode ? player?.dominantFoot || "" : "",
    position: isEditMode ? player?.position || "" : "",
    number: isEditMode ? player?.number || "" : "",
    imageUrl: isEditMode ? player?.imageUrl || "" : "",
    imageUrlFace: isEditMode ? player?.imageUrlFace || "" : "",
    description: isEditMode ? player?.description || "" : "",
    bio: isEditMode ? player?.bio || "" : "",
    status: isEditMode ? player?.status || "ACTIVO" : "ACTIVO",
    joinedAt: isEditMode ? player?.joinedAt || "" : "",
    instagramUrl: isEditMode ? player?.instagramUrl || "" : "",
    twitterUrl: isEditMode ? player?.twitterUrl || "" : "",
  });

  const [imagePreview, setImagePreview] = useState(player?.imageUrl || "");
  const [imageFacePreview, setImageFacePreview] = useState(
    player?.imageUrlFace || "",
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "imageUrl") {
      setImagePreview(value);
    }

    if (field === "imageUrlFace") {
      setImageFacePreview(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const method = isEditMode ? "PATCH" : "POST";
      const url = isEditMode ? `/api/players/${player?.id}` : `/api/players`;

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        toast.success(
          isEditMode
            ? "Jugador editado correctamente"
            : "Jugador creado correctamente",
        );
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(
          isEditMode
            ? "Error al editar el Jugador"
            : "Error al crear el Jugador",
        );
        console.error("Error al crear Jugador:", errorData);
      }
    } catch (error) {
      toast.error(
        isEditMode
          ? "Error al editar el Jugador: " + error
          : "Error al crear el Jugador: " + error,
      );
      console.error("Error en la petición:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const countries = [
    "Argentina",
    "Brasil",
    "Chile",
    "Colombia",
    "Ecuador",
    "Paraguay",
    "Perú",
    "Uruguay",
    "Venezuela",
    "España",
    "Francia",
    "Italia",
    "Alemania",
    "Inglaterra",
    "Portugal",
    "Holanda",
    "Bélgica",
    "México",
    "Estados Unidos",
    "Canadá",
    "Costa Rica",
    "Honduras",
    "Guatemala",
    "Panamá",
  ];

  // Componente reutilizable para labels con barra violeta
  const FormLabel = ({
    icon: Icon,
    children,
    required,
  }: {
    icon: React.ElementType;
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <div className="flex items-center space-x-2 mb-2">
      <div className="w-1 h-5 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
        {children}
        {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );

  // Estilos comunes para inputs
  const inputClassName =
    "h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200";

  const textareaClassName =
    "bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl resize-none transition-all duration-200";

  const selectTriggerClassName =
    "h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl";

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="bg-green-600 hover:bg-green-700 text-white cursor-pointer rounded-xl shadow-lg"
          >
            <div>
              <Edit className="h-4 w-4" />
            </div>
          </Button>
        ) : (
          <Button className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 rounded-2xl px-8 py-6 text-base font-semibold cursor-pointer">
            <Plus className="mr-2 h-5 w-5" />
            Registrar Jugador
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
        {/* Header con gradiente */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ad45ff] via-[#a3b3ff] to-[#ad45ff] rounded-t-2xl" />

        <DialogHeader className="space-y-4 pt-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg">
              {isEditMode ? (
                <Edit className="h-6 w-6 text-white" />
              ) : (
                <User className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? "Editar Jugador" : "Registrar Nuevo Jugador"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
                {isEditMode
                  ? "Modifica la información del jugador"
                  : "Completa todos los datos del jugador"}
              </DialogDescription>
            </div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent" />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Información Personal */}
          <Card className="bg-gray-50/50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <FormLabel icon={User} required>
                  Nombre Completo
                </FormLabel>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ej: Lionel Andrés Messi"
                  required
                  disabled={isLoading}
                  className={inputClassName}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel icon={Calendar}>Fecha de Nacimiento</FormLabel>
                  <Input
                    id="birthDate"
                    type="date"
                    value={
                      formData.birthDate instanceof Date
                        ? formData.birthDate.toISOString().split("T")[0]
                        : (formData.birthDate ?? "")
                    }
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                    disabled={isLoading}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FormLabel icon={MapPin}>Lugar de Nacimiento</FormLabel>
                  <Input
                    id="birthPlace"
                    value={formData.birthPlace}
                    onChange={(e) =>
                      handleInputChange("birthPlace", e.target.value)
                    }
                    placeholder="Ej: Rosario, Argentina"
                    disabled={isLoading}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <FormLabel icon={Globe}>Nacionalidad</FormLabel>
                <Select
                  value={formData.nationality}
                  onValueChange={(value) =>
                    handleInputChange("nationality", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Seleccionar nacionalidad" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Características Físicas */}
          <Card className="bg-gray-50/50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Ruler className="h-4 w-4 text-white" />
                </div>
                Características Físicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel icon={Ruler}>Altura (cm)</FormLabel>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) =>
                      handleInputChange("height", e.target.value)
                    }
                    placeholder="175"
                    min="150"
                    max="220"
                    disabled={isLoading}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FormLabel icon={Weight}>Peso (kg)</FormLabel>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    placeholder="70"
                    min="40"
                    max="120"
                    disabled={isLoading}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div>
                <FormLabel icon={Footprints}>Pie Dominante</FormLabel>
                <Select
                  value={formData.dominantFoot}
                  onValueChange={(value) =>
                    handleInputChange("dominantFoot", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Seleccionar pie dominante" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {PLAYER_FOOT.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Información Deportiva */}
          <Card className="bg-gray-50/50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                Información Deportiva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel icon={Trophy}>Posición</FormLabel>
                  <Select
                    value={formData.position}
                    onValueChange={(value) =>
                      handleInputChange("position", value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className={selectTriggerClassName}>
                      <SelectValue placeholder="Seleccionar posición" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      {PLAYER_POSITION.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FormLabel icon={Hash}>Número de Camiseta</FormLabel>
                  <Input
                    id="number"
                    type="number"
                    value={formData.number}
                    onChange={(e) =>
                      handleInputChange("number", e.target.value)
                    }
                    placeholder="10"
                    min="1"
                    max="99"
                    disabled={isLoading}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel icon={Activity}>Estado</FormLabel>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger className={selectTriggerClassName}>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      {PLAYER_STATUS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FormLabel icon={Clock}>Fecha de Ingreso</FormLabel>
                  <Input
                    id="joinedAt"
                    type="date"
                    value={
                      formData.joinedAt instanceof Date
                        ? formData.joinedAt.toISOString().split("T")[0]
                        : (formData.joinedAt ?? "")
                    }
                    onChange={(e) =>
                      handleInputChange("joinedAt", e.target.value)
                    }
                    disabled={isLoading}
                    className={inputClassName}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imagen y Redes Sociales */}
          <Card className="bg-gray-50/50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-white" />
                </div>
                Imagen y Redes Sociales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel icon={ImageIcon}>Foto cuerpo entero</FormLabel>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      handleInputChange("imageUrl", e.target.value)
                    }
                    placeholder="https://ejemplo.com/foto-jugador.jpg"
                    disabled={isLoading}
                    className={inputClassName}
                  />
                  {imagePreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-600 shadow-lg"
                        onError={() => setImagePreview("")}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Vista previa
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <FormLabel icon={ImageIcon}>Foto de rostro</FormLabel>
                  <Input
                    id="imageUrlFace"
                    value={formData.imageUrlFace}
                    onChange={(e) =>
                      handleInputChange("imageUrlFace", e.target.value)
                    }
                    placeholder="https://ejemplo.com/foto-rostro.jpg"
                    disabled={isLoading}
                    className={inputClassName}
                  />
                  {imageFacePreview && (
                    <div className="mt-3 flex items-center gap-3">
                      <img
                        src={imageFacePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 shadow-lg"
                        onError={() => setImageFacePreview("")}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Vista previa
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel icon={InstagramIcon}>Instagram</FormLabel>
                  <Input
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) =>
                      handleInputChange("instagramUrl", e.target.value)
                    }
                    placeholder="https://instagram.com/usuario"
                    disabled={isLoading}
                    className={inputClassName}
                  />
                </div>

                <div>
                  <FormLabel icon={TwitterIcon}>Twitter/X</FormLabel>
                  <Input
                    id="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={(e) =>
                      handleInputChange("twitterUrl", e.target.value)
                    }
                    placeholder="https://twitter.com/usuario"
                    disabled={isLoading}
                    className={inputClassName}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descripción y Biografía */}
          <Card className="bg-gray-50/50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-white">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Descripción y Biografía
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <FormLabel icon={FileText}>Descripción Breve</FormLabel>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Descripción corta del jugador, sus características principales..."
                  rows={3}
                  disabled={isLoading}
                  className={textareaClassName}
                />
              </div>

              <div>
                <FormLabel icon={FileText}>Biografía Completa</FormLabel>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Historia completa del jugador, logros, trayectoria, datos curiosos..."
                  rows={5}
                  disabled={isLoading}
                  className={textareaClassName}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl font-medium transition-all duration-200"
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            {isEditMode ? (
              <Button
                type="submit"
                className="px-8 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                className="px-8 py-2.5 bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white border-0 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Jugador
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
