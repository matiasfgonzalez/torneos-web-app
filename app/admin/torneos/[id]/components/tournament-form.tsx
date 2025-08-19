"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Trophy,
  MapPin,
  Users,
  Clock,
  ImageIcon,
  Building,
} from "lucide-react";
import { ITorneo } from "@/components/torneos/types";

interface TournamentFormProps {
  onSubmit: (data: ITorneo) => void;
  onCancel: () => void;
  initialData?: Partial<ITorneo>;
  isLoading?: boolean;
}

export interface TournamentFormData {
  name: string;
  description: string;
  category: string;
  locality: string;
  logoUrl: string;
  liga: string;
  status: string;
  format: string;
  nextMatch: string;
  homeAndAway: boolean;
  startDate: string;
  endDate: string;
}

const categories = [
  { value: "PRIMERA", label: "Primera División" },
  { value: "SEGUNDA", label: "Segunda División" },
  { value: "TERCERA", label: "Tercera División" },
  { value: "JUVENIL", label: "Juvenil" },
  { value: "INFANTIL", label: "Infantil" },
  { value: "FEMENINO", label: "Femenino" },
  { value: "AMATEUR", label: "Amateur" },
  { value: "PROFESIONAL", label: "Profesional" },
];

const statuses = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_CURSO", label: "En Curso" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "SUSPENDIDO", label: "Suspendido" },
];

const formats = [
  { value: "LIGA", label: "Liga (Todos contra Todos)" },
  { value: "ELIMINACION", label: "Eliminación Directa" },
  { value: "GRUPOS", label: "Fase de Grupos" },
  { value: "MIXTO", label: "Mixto (Grupos + Eliminación)" },
];

export default function TournamentForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}: TournamentFormProps) {
  const [formData, setFormData] = useState<TournamentFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    locality: initialData?.locality || "",
    logoUrl: initialData?.logoUrl || "",
    liga: initialData?.liga || "",
    status: initialData?.status || "PENDIENTE",
    format: initialData?.format || "LIGA",
    nextMatch: initialData?.nextMatch || "",
    homeAndAway: initialData?.homeAndAway || false,
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
  });

  const [errors, setErrors] = useState<Partial<TournamentFormData>>({});

  const handleInputChange = (
    field: keyof TournamentFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<TournamentFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del torneo es obligatorio";
    }

    if (!formData.category) {
      newErrors.category = "La categoría es obligatoria";
    }

    if (!formData.locality.trim()) {
      newErrors.locality = "La localidad es obligatoria";
    }

    if (!formData.startDate) {
      newErrors.startDate = "La fecha de inicio es obligatoria";
    }

    if (
      formData.endDate &&
      formData.startDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      newErrors.endDate =
        "La fecha de fin debe ser posterior a la fecha de inicio";
    }

    if (formData.nextMatch && new Date(formData.nextMatch) < new Date()) {
      newErrors.nextMatch =
        "La fecha del próximo partido no puede ser en el pasado";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Información Básica
          </CardTitle>
          <CardDescription>Datos principales del torneo</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del Torneo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ej: Copa Primavera 2024"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Categoría <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange("category", value)}
            >
              <SelectTrigger
                className={errors.category ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe el torneo, sus objetivos y características especiales..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ubicación y Organización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ubicación y Organización
          </CardTitle>
          <CardDescription>
            Información sobre la ubicación y entidad organizadora
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="locality">
              Localidad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="locality"
              placeholder="Ej: Buenos Aires, Argentina"
              value={formData.locality}
              onChange={(e) => handleInputChange("locality", e.target.value)}
              className={errors.locality ? "border-red-500" : ""}
            />
            {errors.locality && (
              <p className="text-sm text-red-500">{errors.locality}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="liga">
              <Building className="inline h-4 w-4 mr-1" />
              Liga/Asociación Organizadora
            </Label>
            <Input
              id="liga"
              placeholder="Ej: Liga Argentina de Fútbol"
              value={formData.liga}
              onChange={(e) => handleInputChange("liga", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración del Torneo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Configuración del Torneo
          </CardTitle>
          <CardDescription>Formato y reglas del torneo</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="format">Formato del Torneo</Label>
            <Select
              value={formData.format}
              onValueChange={(value) => handleInputChange("format", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el formato" />
              </SelectTrigger>
              <SelectContent>
                {formats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado del Torneo</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el estado" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="homeAndAway"
                checked={formData.homeAndAway}
                onCheckedChange={(checked) =>
                  handleInputChange("homeAndAway", checked)
                }
              />
              <Label htmlFor="homeAndAway" className="text-sm font-medium">
                Torneo de ida y vuelta (cada equipo juega dos veces contra cada
                rival)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fechas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Fechas del Torneo
          </CardTitle>
          <CardDescription>Programación temporal del torneo</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">
              Fecha de Inicio <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className={errors.startDate ? "border-red-500" : ""}
            />
            {errors.startDate && (
              <p className="text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Fecha de Finalización</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className={errors.endDate ? "border-red-500" : ""}
            />
            {errors.endDate && (
              <p className="text-sm text-red-500">{errors.endDate}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nextMatch">
              <Clock className="inline h-4 w-4 mr-1" />
              Próximo Partido (Opcional)
            </Label>
            <Input
              id="nextMatch"
              type="datetime-local"
              value={formData.nextMatch}
              onChange={(e) => handleInputChange("nextMatch", e.target.value)}
              className={errors.nextMatch ? "border-red-500" : ""}
            />
            {errors.nextMatch && (
              <p className="text-sm text-red-500">{errors.nextMatch}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Imagen del Torneo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imagen del Torneo
          </CardTitle>
          <CardDescription>
            Logo o imagen representativa del torneo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">URL del Logo</Label>
            <Input
              id="logoUrl"
              type="url"
              placeholder="https://ejemplo.com/logo-torneo.png"
              value={formData.logoUrl}
              onChange={(e) => handleInputChange("logoUrl", e.target.value)}
            />
            {formData.logoUrl && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Vista previa:
                </p>
                <img
                  src={formData.logoUrl || "/placeholder.svg"}
                  alt="Vista previa del logo"
                  className="w-20 h-20 object-cover rounded-lg border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Guardando..."
            : initialData
            ? "Actualizar Torneo"
            : "Crear Torneo"}
        </Button>
      </div>
    </form>
  );
}
