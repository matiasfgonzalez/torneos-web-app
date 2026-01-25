import { RefereeStatus } from "@prisma/client";

export interface IReferee {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  birthDate?: Date | string | null;
  nationality?: string | null;
  imageUrl?: string | null;
  certificationLevel?: string | null;
  status: RefereeStatus;
  enabled: boolean;
  deletedAt?: Date | string | null;
  userId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    matches: number;
  };
}

export interface IRefereeCreate {
  name: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  birthDate?: string;
  nationality?: string;
  imageUrl?: string;
  certificationLevel?: string;
}

export interface IRefereeUpdate extends Partial<IRefereeCreate> {
  status?: RefereeStatus;
  enabled?: boolean;
}

export interface IMatchReferee {
  id: string;
  matchId: string;
  refereeId: string;
  role: string;
  referee?: IReferee;
}

// Constantes para labels en español
export const REFEREE_STATUS_LABELS: Record<RefereeStatus, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SUSPENDIDO: "Suspendido",
  RETIRADO: "Retirado",
};

export const REFEREE_STATUS_COLORS: Record<RefereeStatus, string> = {
  ACTIVO: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  INACTIVO: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  SUSPENDIDO: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  RETIRADO: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const CERTIFICATION_LEVELS = [
  { value: "Nivel 1", label: "Nivel 1 (Amateur)" },
  { value: "Nivel 2", label: "Nivel 2 (Regional)" },
  { value: "Nivel 3", label: "Nivel 3 (Nacional)" },
  { value: "FIFA", label: "FIFA / Internacional" },
];

export const REFEREE_ROLES = [
  { value: "Principal", label: "Árbitro Principal" },
  { value: "Asistente 1", label: "Asistente 1 (Línea)" },
  { value: "Asistente 2", label: "Asistente 2 (Línea)" },
  { value: "Cuarto Arbitro", label: "Cuarto Árbitro" },
  { value: "VAR", label: "VAR" },
  { value: "AVAR", label: "AVAR (Asistente VAR)" },
];
