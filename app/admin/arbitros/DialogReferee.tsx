"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createReferee,
  updateReferee,
} from "@modules/arbitros/actions/actions";
import {
  IReferee,
  CERTIFICATION_LEVELS,
  REFEREE_STATUS_LABELS,
} from "@modules/arbitros/types";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Edit,
  User,
  Mail,
  Phone,
  Award,
  Calendar,
  MapPin,
  CreditCard,
  Image as ImageIcon,
  Shield,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RefereeStatus } from "@prisma/client";

interface DialogRefereeProps {
  readonly mode: "create" | "edit";
  readonly referee?: IReferee;
  readonly onSuccess: () => void;
}

export default function DialogReferee({
  mode,
  referee,
  onSuccess,
}: DialogRefereeProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [nationality, setNationality] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [certificationLevel, setCertificationLevel] = useState("Nivel 1");
  const [status, setStatus] = useState<RefereeStatus>("ACTIVO");

  // Reset form when dialog opens or referee changes
  useEffect(() => {
    if (open && referee && mode === "edit") {
      setName(referee.name || "");
      setEmail(referee.email || "");
      setPhone(referee.phone || "");
      setNationalId(referee.nationalId || "");
      setBirthDate(
        referee.birthDate
          ? new Date(referee.birthDate).toISOString().split("T")[0]
          : "",
      );
      setNationality(referee.nationality || "");
      setImageUrl(referee.imageUrl || "");
      setCertificationLevel(referee.certificationLevel || "Nivel 1");
      setStatus(referee.status);
    } else if (open && mode === "create") {
      // Reset for create mode
      setName("");
      setEmail("");
      setPhone("");
      setNationalId("");
      setBirthDate("");
      setNationality("");
      setImageUrl("");
      setCertificationLevel("Nivel 1");
      setStatus("ACTIVO");
    }
  }, [open, referee, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = {
        name,
        email: email || undefined,
        phone: phone || undefined,
        nationalId: nationalId || undefined,
        birthDate: birthDate || undefined,
        nationality: nationality || undefined,
        imageUrl: imageUrl || undefined,
        certificationLevel: certificationLevel || undefined,
        status: mode === "edit" ? status : undefined,
      };

      let res;
      if (mode === "create") {
        res = await createReferee(data);
      } else {
        if (!referee) return;
        res = await updateReferee(referee.id, data);
      }

      if (res.success) {
        toast.success(
          mode === "create"
            ? "Árbitro creado correctamente"
            : "Árbitro actualizado correctamente",
        );
        setOpen(false);
        onSuccess();
      } else {
        toast.error(res.error || "Error en la operación");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] text-white shadow-lg shadow-[#ad45ff]/25 hover:shadow-xl hover:shadow-[#ad45ff]/30 transition-all duration-300 rounded-xl px-6 py-6 text-base font-semibold cursor-pointer">
            <Plus className="w-5 h-5 mr-2" /> Nuevo Árbitro
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-lg border-[#ad45ff]/50 text-[#ad45ff] hover:bg-[#ad45ff]/10 hover:border-[#ad45ff] transition-all"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-[400px] sm:max-w-[600px] md:max-w-[750px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl shadow-black/50 rounded-2xl p-0">
        {/* Barra de acento */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 rounded-t-2xl" />
        <div className="h-px bg-gradient-to-r from-transparent via-amber-300/30 to-transparent" />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-tr from-[#ad45ff]/20 to-[#c77dff]/10 rounded-full blur-2xl pointer-events-none" />

          <DialogHeader className="space-y-3 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#ad45ff] to-[#c77dff] rounded-xl shadow-lg shadow-[#ad45ff]/30">
                {mode === "create" ? (
                  <Award className="w-6 h-6 text-white" />
                ) : (
                  <Edit className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                  {mode === "create" ? "Nuevo Árbitro" : "Editar Árbitro"}
                </DialogTitle>
                <DialogDescription className="text-gray-400 mt-1">
                  {mode === "create"
                    ? "Registra un nuevo árbitro en el sistema"
                    : "Modifica la información del árbitro"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
          {/* Card: Información Personal */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-amber-500/20 rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-amber-400">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <User className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-lg font-bold">Información Personal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3 h-3" />
                  Nombre completo <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ej: Néstor Pitana"
                  disabled={isLoading}
                  className="h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-amber-500/50 focus:border-amber-500 rounded-xl text-white placeholder:text-gray-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* DNI */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-3 h-3" />
                    DNI / Documento
                  </Label>
                  <Input
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="Ej: 12345678"
                    disabled={isLoading}
                    className="h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-slate-500 focus:border-amber-500 rounded-xl text-white placeholder:text-gray-500 transition-colors"
                  />
                </div>

                {/* Fecha de nacimiento */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Fecha de nacimiento
                  </Label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    disabled={isLoading}
                    className="h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-slate-500 focus:border-amber-500 rounded-xl text-white transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Nacionalidad */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Nacionalidad
                </Label>
                <Input
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  placeholder="Ej: Argentina"
                  disabled={isLoading}
                  className="h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-slate-500 focus:border-amber-500 rounded-xl text-white placeholder:text-gray-500 transition-colors"
                />
              </div>

              {/* URL de imagen */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" />
                  URL de foto
                </Label>
                <div className="flex gap-3">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://ejemplo.com/foto.jpg"
                    disabled={isLoading}
                    className="h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-slate-500 focus:border-amber-500 rounded-xl text-white placeholder:text-gray-500 transition-colors flex-1"
                  />
                  {imageUrl && (
                    <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden flex items-center justify-center border border-slate-600">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Contacto */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-[#ad45ff]/20 rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#ad45ff] to-[#c77dff]" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-[#ad45ff]">
                <div className="p-2 bg-[#ad45ff]/20 rounded-lg">
                  <Phone className="h-5 w-5 text-[#ad45ff]" />
                </div>
                <span className="text-lg font-bold">
                  Información de Contacto
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="arbitro@email.com"
                    disabled={isLoading}
                    className="h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-[#ad45ff]/50 focus:border-[#ad45ff] rounded-xl text-white placeholder:text-gray-500 transition-colors"
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    Teléfono
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                    disabled={isLoading}
                    className="h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-[#ad45ff]/50 focus:border-[#ad45ff] rounded-xl text-white placeholder:text-gray-500 transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Profesional */}
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-emerald-500/20 rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-emerald-400">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-lg font-bold">
                  Información Profesional
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nivel de certificación */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-3 h-3" />
                    Nivel de certificación
                  </Label>
                  <Select
                    value={certificationLevel}
                    onValueChange={setCertificationLevel}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-emerald-500/50 focus:border-emerald-500 rounded-xl text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {CERTIFICATION_LEVELS.map((level) => (
                        <SelectItem
                          key={level.value}
                          value={level.value}
                          className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20"
                        >
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Estado (solo en modo edición) */}
                {mode === "edit" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      Estado
                    </Label>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as RefereeStatus)}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-12 bg-slate-800/50 border-2 border-slate-600 hover:border-emerald-500/50 focus:border-emerald-500 rounded-xl text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {Object.entries(REFEREE_STATUS_LABELS).map(
                          ([value, label]) => (
                            <SelectItem
                              key={value}
                              value={value}
                              className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20"
                            >
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="px-6 h-12 bg-transparent border-2 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 rounded-xl font-semibold transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className={`px-6 h-12 text-white shadow-lg rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === "edit"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30"
                  : "bg-gradient-to-r from-[#ad45ff] to-[#c77dff] hover:from-[#9c3ee6] hover:to-[#b66de6] shadow-[#ad45ff]/25 hover:shadow-xl hover:shadow-[#ad45ff]/30"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : mode === "edit" ? (
                "Guardar cambios"
              ) : (
                "Crear árbitro"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
