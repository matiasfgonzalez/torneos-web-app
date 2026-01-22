"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  updateUserProfile,
  ProfileFormState,
} from "@modules/usuarios/actions/user-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@prisma/client";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface ProfileFormProps {
  user: User;
}

const initialState: ProfileFormState = {
  message: "",
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9c3ce6] hover:to-[#8f9fe6] text-white border-none shadow-md hover:shadow-lg transition-all duration-300"
    >
      {pending ? (
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
  );
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateUserProfile, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else if (!state.errors) {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form action={formAction} ref={formRef} className="space-y-6 mt-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nombre Completo
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.name || ""}
            placeholder="Tu nombre"
            className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-[#ad45ff] focus:border-[#ad45ff] transition-all"
          />
          {state.errors?.name && (
            <p className="text-sm text-red-500">
              {state.errors.name.join(", ")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="phone"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Teléfono
          </Label>
          <Input
            id="phone"
            name="phone"
            defaultValue={user.phone || ""}
            placeholder="+54 9 11 ..."
            className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-[#ad45ff] focus:border-[#ad45ff] transition-all"
          />
          {state.errors?.phone && (
            <p className="text-sm text-red-500">
              {state.errors.phone.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="location"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Ubicación / Ciudad
        </Label>
        <Input
          id="location"
          name="location"
          defaultValue={user.location || ""}
          placeholder="Ej: Buenos Aires, Argentina"
          className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-[#ad45ff] focus:border-[#ad45ff] transition-all"
        />
        {state.errors?.location && (
          <p className="text-sm text-red-500">
            {state.errors.location.join(", ")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="bio"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Biografía
        </Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={user.bio || ""}
          placeholder="Cuéntanos un poco sobre ti..."
          className="min-h-[100px] bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-[#ad45ff] focus:border-[#ad45ff] transition-all resize-none"
        />
        {state.errors?.bio && (
          <p className="text-sm text-red-500">{state.errors.bio.join(", ")}</p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}
