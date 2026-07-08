import { describe, expect, it } from "vitest";
import { MatchStatus } from "@prisma/client";
import { isWalkover, resolveWalkover } from "@/lib/standings/walkover";

describe("resolveWalkover", () => {
  const base = {
    status: MatchStatus.WALKOVER,
    homeTeamId: "home",
    awayTeamId: "away",
    walkoverScore: 3,
  };

  it("ganador local → walkoverScore-0", () => {
    const res = resolveWalkover({ ...base, walkoverWinnerTeamId: "home" });
    expect(res).toEqual({ ok: true, homeScore: 3, awayScore: 0 });
  });

  it("ganador visitante → 0-walkoverScore", () => {
    const res = resolveWalkover({ ...base, walkoverWinnerTeamId: "away" });
    expect(res).toEqual({ ok: true, homeScore: 0, awayScore: 3 });
  });

  it("respeta un walkoverScore configurado (ej. 2)", () => {
    const res = resolveWalkover({
      ...base,
      walkoverScore: 2,
      walkoverWinnerTeamId: "home",
    });
    expect(res).toEqual({ ok: true, homeScore: 2, awayScore: 0 });
  });

  it("sin ganador → error", () => {
    const res = resolveWalkover({ ...base, walkoverWinnerTeamId: null });
    expect(res.ok).toBe(false);
  });

  it("ganador que no juega el partido → error", () => {
    const res = resolveWalkover({ ...base, walkoverWinnerTeamId: "otro" });
    expect(res.ok).toBe(false);
  });
});

describe("isWalkover", () => {
  it("true solo para WALKOVER", () => {
    expect(isWalkover(MatchStatus.WALKOVER)).toBe(true);
    expect(isWalkover(MatchStatus.FINALIZADO)).toBe(false);
    expect(isWalkover(null)).toBe(false);
  });
});
