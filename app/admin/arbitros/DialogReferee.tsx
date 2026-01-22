"use client";

import { useState } from "react";
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
import {
  createReferee,
  updateReferee,
} from "@modules/arbitros/actions/actions";
import { toast } from "sonner";
import { Loader2, Plus, Edit, User, Mail, Phone, Award } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Referee {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  certificationLevel?: string | null;
}

interface DialogRefereeProps {
  mode: "create" | "edit";
  referee?: Referee;
  onSuccess: () => void;
}

export default function DialogReferee({
  mode,
  referee,
  onSuccess,
}: DialogRefereeProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(referee?.name || "");
  const [email, setEmail] = useState(referee?.email || "");
  const [phone, setPhone] = useState(referee?.phone || "");
  const [certificationLevel, setCertificationLevel] = useState(
    referee?.certificationLevel || "Nivel 1",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let res;
      if (mode === "create") {
        res = await createReferee({ name, email, phone, certificationLevel });
      } else {
        if (!referee) return;
        res = await updateReferee(referee.id, {
          name,
          email,
          phone,
          certificationLevel,
        });
      }

      if (res.success) {
        toast.success(
          mode === "create" ? "Árbitro creado" : "Árbitro actualizado",
        );
        setOpen(false);
        onSuccess();
        if (mode === "create") {
          setName("");
          setEmail("");
          setPhone("");
        }
      } else {
        toast.error(res.error || "Error en la operación");
      }
    } catch (error) {
      toast.error("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

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

  const inputClassName =
    "h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] focus:ring-2 focus:ring-[#ad45ff]/20 dark:focus:ring-[#a3b3ff]/20 text-gray-900 dark:text-white rounded-xl transition-all duration-200";

  const selectTriggerClassName =
    "h-12 bg-white dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 focus:border-[#ad45ff] dark:focus:border-[#a3b3ff] text-gray-900 dark:text-white rounded-xl";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button className="bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] dark:from-[#8b39cc] dark:to-[#829bd9] hover:from-[#9c3ee6] hover:to-[#92a6ff] dark:hover:from-[#7a32b8] dark:hover:to-[#7189c5] text-white border-0 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 rounded-2xl px-8 py-6 text-base font-semibold cursor-pointer">
            <Plus className="w-5 h-5 mr-2" /> Nuevo Árbitro
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-[#ad45ff] hover:text-white hover:border-[#ad45ff] transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
        {/* Header con gradiente */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#ad45ff] via-[#a3b3ff] to-[#ad45ff] rounded-t-2xl" />

        <DialogHeader className="space-y-4 pt-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#ad45ff] to-[#a3b3ff] rounded-xl flex items-center justify-center shadow-lg">
              {mode === "create" ? (
                <Award className="h-6 w-6 text-white" />
              ) : (
                <Edit className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {mode === "create" ? "Crear Árbitro" : "Editar Árbitro"}
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300 text-base">
                {mode === "create"
                  ? "Registra un nuevo árbitro en el sistema"
                  : "Modifica la información del árbitro"}
              </DialogDescription>
            </div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-600 to-transparent" />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div>
            <FormLabel icon={User} required>
              Nombre Completo
            </FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej: Horacio Elizondo"
              disabled={isLoading}
              className={inputClassName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel icon={Mail}>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contacto@arbitro.com"
                disabled={isLoading}
                className={inputClassName}
              />
            </div>
            <div>
              <FormLabel icon={Phone}>Teléfono</FormLabel>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11..."
                disabled={isLoading}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <FormLabel icon={Award}>Nivel de Certificación</FormLabel>
            <Select
              value={certificationLevel}
              onValueChange={setCertificationLevel}
              disabled={isLoading}
            >
              <SelectTrigger className={selectTriggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="Nivel 1">Nivel 1 (Amateur)</SelectItem>
                <SelectItem value="Nivel 2">Nivel 2 (Regional)</SelectItem>
                <SelectItem value="FIFA">FIFA / Profesional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl font-medium transition-all duration-200"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            {mode === "edit" ? (
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
                  "Actualizar"
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
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
