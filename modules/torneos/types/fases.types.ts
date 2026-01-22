export enum PhaseName {
  FECHA = "FECHA",
  CRUCES = "CRUCES",
  FASES_DE_GRUPOS = "FASES_DE_GRUPOS",
  DIECISAVOS_DE_FINAL = "DIECISAVOS_DE_FINAL",
  OCTAVOS_DE_FINAL = "OCTAVOS_DE_FINAL",
  CUARTOS_DE_FINAL = "CUARTOS_DE_FINAL",
  SEMIFINAL = "SEMIFINAL",
  FINAL = "FINAL",
}

export const PHASE_NAME = [
  { label: "Fecha", value: PhaseName.FECHA },
  { label: "Cruces", value: PhaseName.CRUCES },
  { label: "Fases de grupos", value: PhaseName.FASES_DE_GRUPOS },
  { label: "Dieciseisavos de final", value: PhaseName.DIECISAVOS_DE_FINAL },
  { label: "Octavos de final", value: PhaseName.OCTAVOS_DE_FINAL },
  { label: "Cuartos de final", value: PhaseName.CUARTOS_DE_FINAL },
  { label: "Semifinal", value: PhaseName.SEMIFINAL },
  { label: "Final", value: PhaseName.FINAL },
] as const;

