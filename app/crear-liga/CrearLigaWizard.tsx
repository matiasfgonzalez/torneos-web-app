"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import {
  TOURNAMENT_FORMAT_LABELS,
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
} from "@/lib/constants";
import {
  Trophy,
  Users,
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Mail,
  PartyPopper,
  Sparkles,
  CreditCard,
} from "lucide-react";

// ============================================================
// Tipos
// ============================================================

interface InitialOrg {
  name: string;
  locality: string | null;
  description: string | null;
  phone: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
}

interface SentInvite {
  email: string;
  role: "ORGANIZADOR" | "COLABORADOR";
  type: "member" | "invite";
}

const STEPS = [
  { number: 1, title: "Tu liga", icon: Shield },
  { number: 2, title: "Primer torneo", icon: Trophy },
  { number: 3, title: "Tu equipo", icon: Users },
] as const;

// El nombre auto-generado ("Liga de Juan") no sirve como prefill útil
const isAutoName = (name: string | undefined) =>
  !name || name === "Mi Liga" || name.startsWith("Liga de ");

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error ?? "Ocurrió un error inesperado";
  } catch {
    return "Ocurrió un error inesperado";
  }
}

// ============================================================
// Wizard
// ============================================================

export default function CrearLigaWizard({
  initialOrg,
  userName,
  targetPlan,
}: {
  initialOrg: InitialOrg | null;
  userName: string | null;
  /**
   * Plan pago elegido en el pricing antes de llegar acá (`?plan=PRO`, N14d):
   * la pantalla de éxito ofrece contratarlo en /admin/plan sin repetir la
   * elección. `null` = entró sin plan en mente (el funnel de siempre).
   */
  targetPlan?: string | null;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [saving, setSaving] = useState(false);

  // Paso 1 — perfil de la liga
  const [orgForm, setOrgForm] = useState({
    name: isAutoName(initialOrg?.name) ? "" : (initialOrg?.name ?? ""),
    locality: initialOrg?.locality ?? "",
    description: initialOrg?.description ?? "",
    phone: initialOrg?.phone ?? "",
    logoUrl: initialOrg?.logoUrl ?? null,
    logoPublicId: initialOrg?.logoPublicId ?? null,
  });

  // Paso 2 — primer torneo
  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    format: "LIGA",
    startDate: "",
    ageGroup: "LIBRE",
    gender: "MASCULINO",
  });
  const [createdTournament, setCreatedTournament] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Paso 3 — invitaciones
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ORGANIZADOR" | "COLABORADOR">(
    "ORGANIZADOR",
  );
  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const [planLimitMsg, setPlanLimitMsg] = useState<string | null>(null);

  // ------------------------------------------------------------
  // Paso 1: guardar perfil de la liga
  // ------------------------------------------------------------
  const submitOrg = async () => {
    if (orgForm.name.trim().length < 2) {
      toast.error("Poné un nombre para tu liga (mínimo 2 caracteres)");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/org", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orgForm.name.trim(),
          locality: orgForm.locality,
          description: orgForm.description,
          phone: orgForm.phone,
          logoUrl: orgForm.logoUrl,
          logoPublicId: orgForm.logoPublicId,
        }),
      });
      if (!res.ok) {
        toast.error(await readError(res));
        return;
      }
      toast.success("¡Tu liga quedó creada!");
      setStep(2);
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------
  // Paso 2: crear primer torneo (opcional)
  // ------------------------------------------------------------
  const submitTournament = async () => {
    if (!tournamentForm.name.trim()) {
      toast.error("Poné un nombre para el torneo");
      return;
    }
    if (!tournamentForm.startDate) {
      toast.error("Elegí la fecha de inicio");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tournamentForm.name.trim(),
          format: tournamentForm.format,
          startDate: tournamentForm.startDate,
          ageGroup: tournamentForm.ageGroup,
          gender: tournamentForm.gender,
          locality: orgForm.locality.trim() || "A definir",
          liga: orgForm.name.trim() || null,
        }),
      });
      if (!res.ok) {
        toast.error(await readError(res));
        return;
      }
      const data = await res.json();
      setCreatedTournament({ id: data.id, name: data.name });
      toast.success(`Torneo "${data.name}" creado`);
      setStep(3);
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------
  // Paso 3: invitar co-organizadores (opcional)
  // ------------------------------------------------------------
  const sendInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      toast.error("Ingresá un email válido");
      return;
    }
    if (sentInvites.some((i) => i.email === email)) {
      toast.error("Ya invitaste a ese email");
      return;
    }
    setSaving(true);
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
      const data = await res.json();
      setSentInvites((prev) => [
        ...prev,
        { email, role: inviteRole, type: data.type },
      ]);
      setInviteEmail("");
      toast.success(
        data.type === "member"
          ? `${email} ya tiene cuenta: se sumó a tu liga`
          : `Invitación enviada: se sumará al registrarse`,
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Título */}
      {step < 4 && (
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand to-brand-2 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg shadow-brand/25">
            <Sparkles className="w-4 h-4" />
            Gratis · Sin tarjeta de crédito
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Creá tu liga en minutos
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            {userName ? `${userName.split(" ")[0]}, e` : "E"}n tres pasos tenés
            tu liga con su primer torneo publicado y tu equipo de trabajo
            invitado.
          </p>
        </div>
      )}

      {/* Stepper */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.number;
            const isDone = step > s.number;
            return (
              <div key={s.number} className="flex items-center gap-2 sm:gap-4">
                {index > 0 && (
                  <div
                    className={`h-0.5 w-6 sm:w-12 rounded-full transition-colors ${
                      isDone || isActive
                        ? "bg-gradient-to-r from-brand to-brand-2"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                      isDone
                        ? "bg-gradient-to-r from-brand to-brand-2 text-white"
                        : isActive
                          ? "bg-gradient-to-r from-brand to-brand-2 text-white shadow-lg shadow-brand/30"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`hidden sm:block text-sm font-medium ${
                      isActive
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Card del paso */}
      <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50 p-6 sm:p-8">
        {/* ---------------- Paso 1: Tu liga ---------------- */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Contanos sobre tu liga
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Es lo que van a ver los equipos y jugadores en las páginas
                públicas. Podés cambiarlo cuando quieras.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-name">
                Nombre de la liga <span className="text-red-500">*</span>
              </Label>
              <Input
                id="org-name"
                placeholder='Ej: "Liga Municipal de Rafaela"'
                value={orgForm.name}
                maxLength={100}
                onChange={(e) =>
                  setOrgForm({ ...orgForm, name: e.target.value })
                }
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org-locality">Localidad</Label>
                <Input
                  id="org-locality"
                  placeholder="Ciudad / zona"
                  value={orgForm.locality}
                  maxLength={120}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, locality: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-phone">WhatsApp de contacto</Label>
                <Input
                  id="org-phone"
                  placeholder="+54 9 ..."
                  value={orgForm.phone}
                  maxLength={30}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-description">Descripción corta</Label>
              <Textarea
                id="org-description"
                placeholder="Ej: Fútbol amateur los sábados, categorías libre y veteranos."
                value={orgForm.description}
                maxLength={500}
                rows={3}
                onChange={(e) =>
                  setOrgForm({ ...orgForm, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Logo o escudo (opcional)</Label>
              <CloudinaryUpload
                folder="organizaciones/logos"
                value={orgForm.logoUrl}
                publicId={orgForm.logoPublicId}
                onChange={(url, publicId) =>
                  setOrgForm({ ...orgForm, logoUrl: url, logoPublicId: publicId })
                }
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={submitOrg}
                disabled={saving}
                className="bg-gradient-to-r from-brand to-brand-2 hover:from-brand-hover hover:to-brand-mid-hover text-white font-semibold px-6 shadow-lg shadow-brand/25"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ---------------- Paso 2: Primer torneo ---------------- */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Creá tu primer torneo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Con el nombre y la fecha alcanza para arrancar; equipos,
                fixture y todo lo demás lo cargás después desde el panel.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="t-name">
                Nombre del torneo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="t-name"
                placeholder='Ej: "Apertura 2026"'
                value={tournamentForm.name}
                maxLength={150}
                onChange={(e) =>
                  setTournamentForm({ ...tournamentForm, name: e.target.value })
                }
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Formato <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={tournamentForm.format}
                  onValueChange={(value) =>
                    setTournamentForm({ ...tournamentForm, format: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegí el formato" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TOURNAMENT_FORMAT_LABELS).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="t-start">
                  Fecha de inicio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="t-start"
                  type="date"
                  value={tournamentForm.startDate}
                  onChange={(e) =>
                    setTournamentForm({
                      ...tournamentForm,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={tournamentForm.ageGroup}
                  onValueChange={(value) =>
                    setTournamentForm({ ...tournamentForm, ageGroup: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGE_GROUP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Género</Label>
                <Select
                  value={tournamentForm.gender}
                  onValueChange={(value) =>
                    setTournamentForm({ ...tournamentForm, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={saving}
                className="text-gray-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  onClick={() => setStep(3)}
                  disabled={saving}
                  className="text-gray-500 w-full sm:w-auto"
                >
                  Omitir por ahora
                </Button>
                <Button
                  onClick={submitTournament}
                  disabled={saving}
                  className="bg-gradient-to-r from-brand to-brand-2 hover:from-brand-hover hover:to-brand-mid-hover text-white font-semibold px-6 shadow-lg shadow-brand/25 w-full sm:w-auto"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trophy className="w-4 h-4 mr-2" />
                  )}
                  Crear torneo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- Paso 3: Invitar equipo ---------------- */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Invitá a tu equipo de trabajo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <strong>Organizadores</strong> gestionan torneos y equipos;{" "}
                <strong>colaboradores</strong> solo cargan resultados (ideal
                planilleros). Si todavía no tienen cuenta, se suman solos al
                registrarse.
              </p>
            </div>

            {planLimitMsg && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/50 p-4">
                <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-amber-800 dark:text-amber-200">
                    {planLimitMsg}
                  </p>
                  <Link
                    href="/admin/plan"
                    className="font-semibold text-brand hover:underline"
                  >
                    Ver planes →
                  </Link>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="email@ejemplo.com"
                  className="pl-9"
                  value={inviteEmail}
                  disabled={!!planLimitMsg}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendInvite();
                  }}
                />
              </div>
              <Select
                value={inviteRole}
                onValueChange={(value) =>
                  setInviteRole(value as "ORGANIZADOR" | "COLABORADOR")
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
                onClick={sendInvite}
                disabled={saving || !!planLimitMsg}
                className="bg-gradient-to-r from-brand to-brand-2 hover:from-brand-hover hover:to-brand-mid-hover text-white font-semibold shadow-lg shadow-brand/25"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Invitar"
                )}
              </Button>
            </div>

            {sentInvites.length > 0 && (
              <ul className="space-y-2">
                {sentInvites.map((invite) => (
                  <li
                    key={invite.email}
                    className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="truncate text-gray-900 dark:text-white">
                        {invite.email}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-3">
                      {invite.role === "ORGANIZADOR"
                        ? "Organizador"
                        : "Colaborador"}
                      {invite.type === "invite" ? " · pendiente" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setStep(2)}
                disabled={saving}
                className="text-gray-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={saving}
                className="bg-gradient-to-r from-brand to-brand-2 hover:from-brand-hover hover:to-brand-mid-hover text-white font-semibold px-6 shadow-lg shadow-brand/25 w-full sm:w-auto"
              >
                {sentInvites.length > 0 ? "Finalizar" : "Omitir y finalizar"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ---------------- Éxito ---------------- */}
        {step === 4 && (
          <div className="text-center space-y-6 py-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-brand to-brand-2 rounded-3xl flex items-center justify-center shadow-xl shadow-brand/30">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                ¡Tu liga está lista! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                {createdTournament
                  ? `"${orgForm.name}" ya tiene su primer torneo: ${createdTournament.name}. Ahora cargá los equipos y armá el fixture.`
                  : `"${orgForm.name}" quedó creada. Desde el panel podés crear torneos, equipos y jugadores.`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Vino del pricing con un plan pago elegido (N14d): cerrar ese
                  funnel es lo primero; el resto pasa a secundario. */}
              {targetPlan && (
                <Button
                  asChild
                  variant="brand"
                  className="font-semibold px-6 w-full sm:w-auto"
                >
                  <Link href={`/admin/plan?plan=${targetPlan}`}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Contratar plan {targetPlan}
                  </Link>
                </Button>
              )}
              {createdTournament && (
                <Button
                  asChild
                  variant={targetPlan ? "outline" : "brand"}
                  className="font-semibold px-6 w-full sm:w-auto"
                >
                  <Link href={`/admin/torneos/${createdTournament.id}`}>
                    <Trophy className="w-4 h-4 mr-2" />
                    Configurar mi torneo
                  </Link>
                </Button>
              )}
              <Button
                asChild
                variant={targetPlan || createdTournament ? "outline" : "brand"}
                className="font-semibold px-6 w-full sm:w-auto"
              >
                <Link href="/admin/dashboard">Ir a mi panel</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Nota freemium */}
      {step < 4 && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          Empezás con el plan FREE (1 torneo activo). Podés mejorar tu plan
          cuando lo necesites desde el panel.
        </p>
      )}
    </div>
  );
}
