import { describe, it, expect } from "vitest";
import { MatchStatus, TournamentStatus } from "@/lib/generated/prisma/enums";

import {
  MATCH_TRANSITIONS,
  TOURNAMENT_TRANSITIONS,
  allowedMatchTransitions,
  allowedTournamentTransitions,
  canCreateMatchWithStatus,
  canTransitionMatch,
  canTransitionTournament,
} from "@/lib/status-transitions";

describe("máquina de estados de torneo", () => {
  it("cubre todos los estados del enum de Prisma", () => {
    // Si mañana se agrega un estado y nadie define sus salidas, este test cae
    // antes de que la app lo deje pasar por no estar en la tabla.
    for (const status of Object.values(TournamentStatus)) {
      expect(TOURNAMENT_TRANSITIONS[status]).toBeDefined();
    }
  });

  it("nunca se lista a sí mismo como destino", () => {
    for (const [from, tos] of Object.entries(TOURNAMENT_TRANSITIONS)) {
      expect(tos).not.toContain(from);
    }
  });

  it("acepta repetir el estado actual (un PATCH parcial no es transición)", () => {
    for (const status of Object.values(TournamentStatus)) {
      expect(canTransitionTournament(status, status).ok).toBe(true);
    }
  });

  it("deja el camino normal: borrador → inscripción → activo → finalizado → archivado", () => {
    expect(canTransitionTournament("BORRADOR", "INSCRIPCION").ok).toBe(true);
    expect(canTransitionTournament("INSCRIPCION", "ACTIVO").ok).toBe(true);
    expect(canTransitionTournament("ACTIVO", "FINALIZADO").ok).toBe(true);
    expect(canTransitionTournament("FINALIZADO", "ARCHIVADO").ok).toBe(true);
  });

  it("frena volver a inscripción un torneo ya jugado", () => {
    const res = canTransitionTournament("FINALIZADO", "INSCRIPCION");
    expect(res.ok).toBe(false);
    if (!res.ok) {
      // El mensaje tiene que decir qué SÍ se puede hacer, con nombres en español.
      expect(res.error).toContain("«Finalizado»");
      expect(res.error).toContain("«Inscripción Abierta»");
      expect(res.error).toContain("En Curso");
      expect(res.error).toContain("Archivado");
    }
  });

  it("frena saltar de borrador a finalizado sin haberse jugado", () => {
    expect(canTransitionTournament("BORRADOR", "FINALIZADO").ok).toBe(false);
    expect(canTransitionTournament("BORRADOR", "ACTIVO").ok).toBe(false);
  });

  it("permite reabrir un finalizado y desarchivar (M11: agregar partidos)", () => {
    expect(canTransitionTournament("FINALIZADO", "ACTIVO").ok).toBe(true);
    expect(canTransitionTournament("ARCHIVADO", "FINALIZADO").ok).toBe(true);
    expect(canTransitionTournament("ARCHIVADO", "ACTIVO").ok).toBe(true);
  });

  it("permite revertir una cancelación al borrador", () => {
    expect(canTransitionTournament("CANCELADO", "BORRADOR").ok).toBe(true);
    // Pero no reanudarlo como si nada: primero se rearma.
    expect(canTransitionTournament("CANCELADO", "ACTIVO").ok).toBe(false);
  });

  it("suspende y reanuda un torneo en curso", () => {
    expect(canTransitionTournament("ACTIVO", "SUSPENDIDO").ok).toBe(true);
    expect(canTransitionTournament("SUSPENDIDO", "ACTIVO").ok).toBe(true);
  });

  it("`allowedTournamentTransitions` devuelve lo mismo que valida el canTransition", () => {
    for (const from of Object.values(TournamentStatus)) {
      for (const to of Object.values(TournamentStatus)) {
        if (from === to) continue;
        expect(canTransitionTournament(from, to).ok).toBe(
          allowedTournamentTransitions(from).includes(to),
        );
      }
    }
  });
});

describe("máquina de estados de partido", () => {
  it("cubre todos los estados del enum de Prisma", () => {
    for (const status of Object.values(MatchStatus)) {
      expect(MATCH_TRANSITIONS[status]).toBeDefined();
    }
  });

  it("nunca se lista a sí mismo como destino", () => {
    for (const [from, tos] of Object.entries(MATCH_TRANSITIONS)) {
      expect(tos).not.toContain(from);
    }
  });

  it("deja cargar el resultado el lunes: programado → finalizado", () => {
    // El caso de uso real de la carga rápida: nadie pasa por EN_JUEGO.
    expect(canTransitionMatch("PROGRAMADO", "FINALIZADO").ok).toBe(true);
    expect(canTransitionMatch("PROGRAMADO", "WALKOVER").ok).toBe(true);
  });

  it("deja el vivo completo: programado → en juego → entretiempo → finalizado", () => {
    expect(canTransitionMatch("PROGRAMADO", "EN_JUEGO").ok).toBe(true);
    expect(canTransitionMatch("EN_JUEGO", "ENTRETIEMPO").ok).toBe(true);
    expect(canTransitionMatch("ENTRETIEMPO", "FINALIZADO").ok).toBe(true);
  });

  it("frena el entretiempo de un partido que nunca arrancó", () => {
    expect(canTransitionMatch("PROGRAMADO", "ENTRETIEMPO").ok).toBe(false);
    expect(canTransitionMatch("CANCELADO", "ENTRETIEMPO").ok).toBe(false);
    expect(canTransitionMatch("POSTERGADO", "EN_JUEGO").ok).toBe(false);
  });

  it("deja corregir una carga equivocada (finalizado vuelve atrás)", () => {
    expect(canTransitionMatch("FINALIZADO", "PROGRAMADO").ok).toBe(true);
    expect(canTransitionMatch("FINALIZADO", "EN_JUEGO").ok).toBe(true);
    // Era ausencia y se cargó como resultado normal.
    expect(canTransitionMatch("FINALIZADO", "WALKOVER").ok).toBe(true);
    // Pero un finalizado no se "cancela": se reprograma primero.
    expect(canTransitionMatch("FINALIZADO", "CANCELADO").ok).toBe(false);
  });

  it("revierte una cancelación y un walkover", () => {
    expect(canTransitionMatch("CANCELADO", "PROGRAMADO").ok).toBe(true);
    expect(canTransitionMatch("WALKOVER", "PROGRAMADO").ok).toBe(true);
  });

  it("`allowedMatchTransitions` devuelve lo mismo que valida el canTransition", () => {
    for (const from of Object.values(MatchStatus)) {
      for (const to of Object.values(MatchStatus)) {
        if (from === to) continue;
        expect(canTransitionMatch(from, to).ok).toBe(
          allowedMatchTransitions(from).includes(to),
        );
      }
    }
  });
});

describe("canCreateMatchWithStatus", () => {
  it("deja crear programado, ya jugado o walkover (carga histórica)", () => {
    expect(canCreateMatchWithStatus("PROGRAMADO").ok).toBe(true);
    expect(canCreateMatchWithStatus("FINALIZADO").ok).toBe(true);
    expect(canCreateMatchWithStatus("WALKOVER").ok).toBe(true);
  });

  it("frena crear un partido directamente en entretiempo", () => {
    const res = canCreateMatchWithStatus("ENTRETIEMPO");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("Entretiempo");
  });
});
