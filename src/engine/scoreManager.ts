import type { CareLevel, Patient } from '../types/game';
import { CARE_LEVEL_RANK, COMBO_CAP, PERFECT_PLACEMENT_WINDOW_MS } from '../types/game';

const BASE_SCORE: Record<CareLevel, number> = {
  low: 50,
  medium: 100,
  high: 150,
};

export function calculatePlacementScore(
  patient: Patient,
  gameClock: number,
  combo: number,
): { points: number; isPerfect: boolean; speedBonus: number } {
  const base = BASE_SCORE[patient.careLevel];
  const elapsed = gameClock - patient.spawnedAtGameTime;
  const isPerfect =
    elapsed <= PERFECT_PLACEMENT_WINDOW_MS &&
    (patient.careLevel === 'high' || patient.isEmergency);

  // Speed bonus: faster = more points. Max 100 bonus at instant, decays linearly over 10s
  const speedBonus = Math.max(0, Math.round(100 * (1 - elapsed / 10000)));

  const multiplier = Math.min(combo + 1, COMBO_CAP);
  const perfectMultiplier = isPerfect ? 2 : 1;

  const emergencyBonus = patient.isEmergency ? 50 : 0;

  const points = Math.round(
    (base + speedBonus + emergencyBonus) * multiplier * perfectMultiplier,
  );

  return { points, isPerfect, speedBonus };
}

export function careLevelValue(level: CareLevel): number {
  return CARE_LEVEL_RANK[level];
}
