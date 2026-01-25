"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Upload,
  Camera,
  Shield,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { toast } from "sonner";
import {
  IUser,
  IUpdateUserData,
  UserRole,
  UserStatus,
  ROLE_LABELS,
  STATUS_LABELS,
  canAssignRole,
} from "../../types";

// Interfaces para la API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ApiUser extends Omit<
  IUser,
  "createdAt" | "updatedAt" | "lastLoginAt" | "birthDate" | "emailVerified"
> {
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
  birthDate?: string | null;
  emailVerified?: boolean | null;
  stats?: {
    recent: {
      news: number;
      tournaments: number;
      activity: number;
    };
    total: {
      news: number;
      tournaments: number;
      teams: number;
      auditLogs: number;
    };
  };
}

export default function EditUser() {
  const resolvedParams = useParams();
  const userId = resolvedParams?.id as string;

  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserRole] = useState<UserRole>(UserRole.ADMINISTRADOR); // En producción vendría del contexto de autenticación
  const [hasChanges, setHasChanges] = useState(false);

  const [formData, setFormData] = useState<IUpdateUserData>({
    name: "",
    phone: "",
    location: "",
    bio: "",
    role: UserRole.USUARIO,
    status: UserStatus.ACTIVO,
    imageUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const result: ApiResponse<ApiUser> = await response.json();

        if (result.success && result.data) {
          const userData = result.data;
          setUser(userData);
          setFormData({
            name: userData.name || "",
            phone: userData.phone || "",
            location: userData.location || "",
            bio: userData.bio || "",
            role: userData.role,
            status: userData.status,
            imageUrl: userData.imageUrl || "",
          });
        } else {
          toast.error(result.message || "Error al cargar el usuario");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Error al cargar los datos del usuario");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleInputChange = (
    field: keyof IUpdateUserData,
    value: string | UserRole | UserStatus,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (formData.phone && !/^[+]?[0-9\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "El teléfono no tiene un formato válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result: ApiResponse<ApiUser> = await response.json();

      if (result.success) {
        toast.success("Usuario actualizado exitosamente");
        setHasChanges(false);
        if (result.data) {
          setUser(result.data);
        }
      } else {
        toast.error(result.message || "Error al actualizar el usuario");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error al actualizar el usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges && user) {
      if (confirm("¿Estás seguro de que quieres descartar los cambios?")) {
        setFormData({
          name: user.name || "",
          phone: user.phone || "",
          location: user.location || "",
          bio: user.bio || "",
          role: user.role,
          status: user.status,
          imageUrl: user.imageUrl || "",
        });
        setHasChanges(false);
        setErrors({});
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // En producción, aquí subirías la imagen a un servicio de almacenamiento
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange("imageUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#ad45ff]" />
              <p className="text-gray-600 dark:text-gray-400">
                Cargando datos del usuario...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Usuario no encontrado
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              No se pudo cargar la información del usuario.
            </p>
            <Button asChild>
              <Link href="/admin/usuarios">Volver a usuarios</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              asChild
              className="text-[#ad45ff] dark:text-[#a3b3ff] hover:bg-[#ad45ff]/10 dark:hover:bg-[#8b39cc]/20"
            >
              <Link href={`/admin/usuarios/${user.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al perfil
              </Link>
            </Button>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Editar Usuario
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                Modifica la información del usuario {user.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Cambios sin guardar</span>
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={!hasChanges}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white border-0"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información personal */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="space-y-4 pb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Información Personal
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Nombre Completo *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={`pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white ${
                          errors.name
                            ? "border-red-500 dark:border-red-500"
                            : ""
                        }`}
                        placeholder="Ingresa el nombre completo"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email (solo lectura) */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Correo Electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="pl-10 bg-gray-50 dark:bg-gray-600 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                        placeholder="usuario@ejemplo.com"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      El email no se puede modificar
                    </p>
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Teléfono
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className={`pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white ${
                          errors.phone
                            ? "border-red-500 dark:border-red-500"
                            : ""
                        }`}
                        placeholder="+54 9 11 1234-5678"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Ubicación */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Ubicación
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                        placeholder="Ciudad, País"
                      />
                    </div>
                  </div>
                </div>

                {/* Biografía */}
                <div className="space-y-2">
                  <Label
                    htmlFor="bio"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Biografía
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white resize-none"
                    placeholder="Descripción del usuario, experiencia, intereses..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información del sistema */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="space-y-4 pb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-[#ad45ff] to-[#a3b3ff] rounded-full" />
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Información del Sistema
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fecha de registro
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Última actualización
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(user.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Última conexión
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {user.lastLoginAt
                          ? formatDate(user.lastLoginAt)
                          : "Nunca"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ID del usuario
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-900 dark:text-white font-mono">
                        {user.id}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Avatar */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Camera className="h-5 w-5 text-[#ad45ff] dark:text-[#a3b3ff]" />
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Foto de Perfil
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={formData.imageUrl || ""}
                      alt={formData.name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] text-white font-bold text-xl">
                      {formData.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2 w-full">
                    <Label
                      htmlFor="image-upload"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Cambiar imagen
                    </Label>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" className="w-full" asChild>
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Subir imagen
                        </label>
                      </Button>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Input
                        placeholder="O pega una URL de imagen"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          handleInputChange("imageUrl", e.target.value)
                        }
                        className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rol y Estado */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-[#ad45ff] dark:text-[#a3b3ff]" />
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Permisos y Estado
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rol */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rol del usuario
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) =>
                      handleInputChange("role", value as UserRole)
                    }
                    disabled={
                      !canAssignRole(
                        currentUserRole,
                        formData.role || UserRole.USUARIO,
                      )
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <SelectValue placeholder="Selecciona un rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS)
                        .filter(([role]) =>
                          canAssignRole(currentUserRole, role as UserRole),
                        )
                        .map(([role, label]) => (
                          <SelectItem key={role} value={role}>
                            {label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {!canAssignRole(
                    currentUserRole,
                    formData.role || UserRole.USUARIO,
                  ) && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      No puedes cambiar este rol debido a tus permisos
                    </p>
                  )}
                </div>

                {/* Estado */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado del usuario
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value as UserStatus)
                    }
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <SelectItem key={status} value={status}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Información adicional */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estadísticas del usuario
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Noticias creadas
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user._count?.news || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Torneos creados
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user._count?.tournaments || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Equipos creados
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user._count?.teams || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
