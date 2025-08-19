"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Users,
  InstagramIcon,
  TwitterIcon,
  Clock,
  Edit,
  Plus,
  X,
  Save,
} from "lucide-react";
import { ITeam } from "@/components/equipos/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PlayerFormProps {
  isEditMode: boolean;
  player?: any; // Para edición
  teams?: ITeam[];
}

export default function PlayerForm(props: Readonly<PlayerFormProps>) {
  const { isEditMode, player, teams } = props;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    description: isEditMode ? player?.description || "" : "",
    bio: isEditMode ? player?.bio || "" : "",
    status: isEditMode ? player?.status || "ACTIVO" : "ACTIVO",
    joinedAt: isEditMode ? player?.joinedAt || "" : "",
    instagramUrl: isEditMode ? player?.instagramUrl || "" : "",
    twitterUrl: isEditMode ? player?.twitterUrl || "" : "",
    teamId: isEditMode ? player?.teamId || "" : "",
  });

  const [imagePreview, setImagePreview] = useState(player?.imageUrl || "");

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "imageUrl") {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
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
            : "Jugador creado correctamente"
        );
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(
          isEditMode
            ? "Error al editar el Jugador"
            : "Error al crear el Jugador"
        );
        console.error("Error al crear Jugador:", errorData);
      }
    } catch (error) {
      toast.error(
        isEditMode
          ? "Error al editar el Jugador: " + error
          : "Error al crear el Jugador: " + error
      );
      console.error("Error en la petición:", error);
    }
  };

  const positions = [
    "Portero",
    "Defensa Central",
    "Lateral Derecho",
    "Lateral Izquierdo",
    "Mediocampista Defensivo",
    "Mediocampista Central",
    "Mediocampista Ofensivo",
    "Extremo Derecho",
    "Extremo Izquierdo",
    "Delantero Centro",
    "Segundo Delantero",
  ];

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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {isEditMode ? (
          <Button
            variant="secondary"
            size="sm"
            asChild
            className="bg-green-700 hover:bg-green-900 text-white cursor-pointer"
          >
            <div>
              <Edit className="h-4 w-4" />
            </div>
          </Button>
        ) : (
          <Button
            className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 text-white
        hover:from-primary/80 hover:to-blue-700 hover:scale-105 transition-all duration-300
         cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Registrar jugador
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {player ? "Editar Jugador" : "Registrar Nuevo Jugador"}
          </DialogTitle>
          <DialogDescription>
            {player
              ? "Modifica la información del jugador"
              : "Completa todos los datos del jugador"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Información Personal */}
            <Card className="bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-4 w-4" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label
                      htmlFor="name"
                      className="flex items-center gap-2 pb-2"
                    >
                      <User className="h-3 w-3" />
                      Nombre Completo *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Ej: Lionel Andrés Messi"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="birthDate"
                        className="flex items-center gap-2 pb-2"
                      >
                        <Calendar className="h-3 w-3" />
                        Fecha de Nacimiento
                      </Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) =>
                          handleInputChange("birthDate", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="birthPlace"
                        className="flex items-center gap-2 pb-2"
                      >
                        <MapPin className="h-3 w-3" />
                        Lugar de Nacimiento
                      </Label>
                      <Input
                        id="birthPlace"
                        value={formData.birthPlace}
                        onChange={(e) =>
                          handleInputChange("birthPlace", e.target.value)
                        }
                        placeholder="Ej: Rosario, Argentina"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="nationality"
                      className="flex items-center gap-2 pb-2"
                    >
                      <Globe className="h-3 w-3" />
                      Nacionalidad
                    </Label>
                    <Select
                      value={formData.nationality}
                      onValueChange={(value) =>
                        handleInputChange("nationality", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar nacionalidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Características Físicas */}
            <Card className="bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ruler className="h-4 w-4" />
                  Características Físicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="height"
                      className="flex items-center gap-2 pb-2"
                    >
                      <Ruler className="h-3 w-3" />
                      Altura (cm)
                    </Label>
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
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="weight"
                      className="flex items-center gap-2 pb-2"
                    >
                      <Weight className="h-3 w-3" />
                      Peso (kg)
                    </Label>
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
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="dominantFoot"
                    className="flex items-center gap-2 pb-2"
                  >
                    <Footprints className="h-3 w-3" />
                    Pie Dominante
                  </Label>
                  <Select
                    value={formData.dominantFoot}
                    onValueChange={(value) =>
                      handleInputChange("dominantFoot", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar pie dominante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DERECHA">Derecho</SelectItem>
                      <SelectItem value="IZQUIERDA">Izquierdo</SelectItem>
                      <SelectItem value="AMBOS">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Información Deportiva */}
            <Card className="bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-4 w-4" />
                  Información Deportiva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="teamId"
                    className="flex items-center gap-2 pb-2"
                  >
                    <Users className="h-3 w-3" />
                    Equipo *
                  </Label>
                  <Select
                    value={formData.teamId}
                    onValueChange={(value) =>
                      handleInputChange("teamId", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams &&
                        teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            <div className="flex items-center gap-2">
                              {team.logoUrl && (
                                <img
                                  src={team.logoUrl || "/placeholder.svg"}
                                  alt={team.name}
                                  className="w-4 h-4 rounded"
                                />
                              )}
                              {team.name}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="position"
                      className="flex items-center gap-2 pb-2"
                    >
                      <Trophy className="h-3 w-3" />
                      Posición
                    </Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) =>
                        handleInputChange("position", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar posición" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="number"
                      className="flex items-center gap-2 pb-2"
                    >
                      <Hash className="h-3 w-3" />
                      Número de Camiseta
                    </Label>
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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="status"
                      className="flex items-center gap-2 pb-2"
                    >
                      <Trophy className="h-3 w-3" />
                      Estado
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVO">Activo</SelectItem>
                        <SelectItem value="LESIONADO">Lesionado</SelectItem>
                        <SelectItem value="SUSPENDIDO">Suspendido</SelectItem>
                        <SelectItem value="NO_DISPONIBLE">
                          No Disponible
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label
                      htmlFor="joinedAt"
                      className="flex items-center gap-2 pb-2"
                    >
                      <Clock className="h-3 w-3" />
                      Fecha de Ingreso
                    </Label>
                    <Input
                      id="joinedAt"
                      type="date"
                      value={formData.joinedAt}
                      onChange={(e) =>
                        handleInputChange("joinedAt", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Imagen y Redes Sociales */}
            <Card className="bg-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="h-4 w-4" />
                  Imagen y Redes Sociales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="imageUrl"
                    className="flex items-center gap-2 pb-2"
                  >
                    <ImageIcon className="h-3 w-3" />
                    URL de la Foto
                  </Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      handleInputChange("imageUrl", e.target.value)
                    }
                    placeholder="https://ejemplo.com/foto-jugador.jpg"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        className="w-20 h-20 rounded-full object-cover border-2 border-border"
                        onError={() => setImagePreview("")}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="instagramUrl"
                    className="flex items-center gap-2 pb-2"
                  >
                    <InstagramIcon className="h-3 w-3" />
                    Instagram
                  </Label>
                  <Input
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) =>
                      handleInputChange("instagramUrl", e.target.value)
                    }
                    placeholder="https://instagram.com/usuario"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="twitterUrl"
                    className="flex items-center gap-2 pb-2"
                  >
                    <TwitterIcon className="h-3 w-3" />
                    Twitter/X
                  </Label>
                  <Input
                    id="twitterUrl"
                    value={formData.twitterUrl}
                    onChange={(e) =>
                      handleInputChange("twitterUrl", e.target.value)
                    }
                    placeholder="https://twitter.com/usuario"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Descripción y Biografía */}
          <Card className="bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-4 w-4" />
                Descripción y Biografía
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="description"
                  className="flex items-center gap-2 pb-2"
                >
                  <FileText className="h-3 w-3" />
                  Descripción Breve
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Descripción corta del jugador, sus características principales..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="bio" className="flex items-center gap-2 pb-2">
                  <FileText className="h-3 w-3" />
                  Biografía Completa
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Historia completa del jugador, logros, trayectoria, datos curiosos..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="default"
              onClick={() => {
                setIsDialogOpen(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            {isEditMode ? (
              <Button
                type="submit"
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-white
                  hover:from-yellow-500 hover:to-yellow-600 hover:scale-105 transition-all duration-300
                  active:scale-95 cursor-pointer"
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-blue-600 text-white
                  hover:from-primary/80 hover:to-blue-700 hover:scale-105 transition-all duration-300
                  active:scale-95 cursor-pointer"
              >
                <Save className="mr-2 h-4 w-4" />
                Registrar Equipo
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
