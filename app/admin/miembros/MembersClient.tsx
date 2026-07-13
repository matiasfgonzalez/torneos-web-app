"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Mail,
  Loader2,
  Trash2,
  Crown,
  CreditCard,
  Clock,
  X,
} from "lucide-react";

// ============================================================
// Tipos (respuesta de GET /api/org/members)
// ============================================================

type OrgRole = "OWNER" | "ORGANIZADOR" | "COLABORADOR";

interface Member {
  id: string;
  role: OrgRole;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    imageUrl: string | null;
  };
}

interface Invite {
  id: string;
  email: string;
  role: OrgRole;
  createdAt: string;
}

interface MembersData {
  organization: { id: string; name: string };
  canManage: boolean;
  members: Member[];
  invites: Invite[];
}

const ROLE_LABELS: Record<OrgRole, string> = {
  OWNER: "Dueño",
  ORGANIZADOR: "Organizador",
  COLABORADOR: "Colaborador",
};

const ROLE_BADGE_CLASSES: Record<OrgRole, string> = {
  OWNER:
    "bg-gradient-to-r from-brand to-brand-2 text-white border-0 shadow-sm",
  ORGANIZADOR:
    "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-0",
  COLABORADOR:
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-0",
};

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error ?? "Ocurrió un error inesperado";
  } catch {
    return "Ocurrió un error inesperado";
  }
}

// ============================================================
// Componente
// ============================================================

export default function MembersClient() {
  const [data, setData] = useState<MembersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ORGANIZADOR" | "COLABORADOR">(
    "ORGANIZADOR",
  );
  const [sending, setSending] = useState(false);
  const [planLimitMsg, setPlanLimitMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/org/members");
      if (!res.ok) {
        toast.error(await readError(res));
        return;
      }
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const invite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Ingresá un email válido");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/org/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole }),
      });
      if (res.status === 402) {
        setPlanLimitMsg(await readError(res));
        return;
      }
      if (!res.ok) {
        toast.error(await readError(res));
        return;
      }
      const result = await res.json();
      toast.success(
        result.type === "member"
          ? `${email} se sumó a tu liga`
          : "Invitación enviada: se sumará al registrarse",
      );
      setInviteEmail("");
      await load();
    } finally {
      setSending(false);
    }
  };

  const changeRole = async (memberId: string, role: string) => {
    const res = await fetch(`/api/org/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      toast.error(await readError(res));
      return;
    }
    toast.success("Rol actualizado");
    await load();
  };

  const removeMember = async (memberId: string) => {
    const res = await fetch(`/api/org/members/${memberId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error(await readError(res));
      return;
    }
    toast.success("Miembro quitado de la liga");
    setPlanLimitMsg(null);
    await load();
  };

  const cancelInvite = async (inviteId: string) => {
    const res = await fetch(`/api/org/invites/${inviteId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error(await readError(res));
      return;
    }
    toast.success("Invitación cancelada");
    setPlanLimitMsg(null);
    await load();
  };

  // ------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        No se pudieron cargar los miembros.{" "}
        <button onClick={() => load()} className="text-brand font-medium">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-brand to-brand-2 rounded-xl flex items-center justify-center shadow-lg">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Miembros
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Equipo de trabajo de {data.organization.name}
          </p>
        </div>
      </div>

      {/* Aviso de límite del plan */}
      {planLimitMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/50 p-4">
          <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-amber-800 dark:text-amber-200">{planLimitMsg}</p>
            <Link
              href="/admin/plan"
              className="font-semibold text-brand hover:underline"
            >
              Ver planes →
            </Link>
          </div>
        </div>
      )}

      {/* Invitar (solo OWNER/admin) */}
      {data.canManage && (
        <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Invitar por email
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                placeholder="email@ejemplo.com"
                className="pl-9"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") invite();
                }}
              />
            </div>
            <Select
              value={inviteRole}
              onValueChange={(v) =>
                setInviteRole(v as "ORGANIZADOR" | "COLABORADOR")
              }
            >
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORGANIZADOR">Organizador</SelectItem>
                <SelectItem value="COLABORADOR">Colaborador</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={invite}
              disabled={sending}
              className="bg-gradient-to-r from-brand to-brand-2 hover:from-brand-hover hover:to-brand-2 text-white font-semibold shadow-lg shadow-brand/25"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Invitar"
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Organizador: gestión completa de torneos, equipos y jugadores.
            Colaborador: solo carga de resultados (ideal planilleros).
          </p>
        </div>
      )}

      {/* Miembros */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm divide-y divide-gray-100 dark:divide-gray-700/50">
        {data.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 sm:gap-4 p-4"
          >
            {member.user.imageUrl ? (
              <Image
                src={member.user.imageUrl}
                alt={member.user.name ?? member.user.email}
                width={40}
                height={40}
                className="rounded-full ring-2 ring-brand/20 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand/20 to-brand-2/20 flex items-center justify-center text-sm font-semibold text-brand shrink-0">
                {(member.user.name ?? member.user.email)
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                {member.user.name ?? member.user.email}
                {member.role === "OWNER" && (
                  <Crown className="w-3.5 h-3.5 text-brand shrink-0" />
                )}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {member.user.email}
              </p>
            </div>

            {data.canManage && member.role !== "OWNER" ? (
              <div className="flex items-center gap-2 shrink-0">
                <Select
                  value={member.role}
                  onValueChange={(role) => changeRole(member.id, role)}
                >
                  <SelectTrigger className="w-36 hidden sm:flex">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORGANIZADOR">Organizador</SelectItem>
                    <SelectItem value="COLABORADOR">Colaborador</SelectItem>
                  </SelectContent>
                </Select>
                <Badge
                  className={`sm:hidden ${ROLE_BADGE_CLASSES[member.role]}`}
                >
                  {ROLE_LABELS[member.role]}
                </Badge>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500"
                      aria-label={`Quitar a ${member.user.name ?? member.user.email}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Quitar a {member.user.name ?? member.user.email}?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Dejará de tener acceso al panel de{" "}
                        {data.organization.name}. Los datos que cargó no se
                        pierden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeMember(member.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Quitar miembro
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <Badge className={ROLE_BADGE_CLASSES[member.role]}>
                {ROLE_LABELS[member.role]}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Invitaciones pendientes */}
      {data.invites.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Invitaciones pendientes
          </h2>
          <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm divide-y divide-gray-100 dark:divide-gray-700/50">
            {data.invites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {inv.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Se sumará como{" "}
                    {ROLE_LABELS[inv.role].toLowerCase()} al registrarse
                  </p>
                </div>
                {data.canManage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => cancelInvite(inv.id)}
                    className="text-gray-400 hover:text-red-500 shrink-0"
                    aria-label={`Cancelar invitación a ${inv.email}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
