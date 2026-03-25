import type { Patient } from '../types/game';
import {
  CARE_LEVEL_RANK,
  COMBO_CAP,
  PERFECT_PLACEMENT_WINDOW_MS,
  BASE_SCORE,
  SPEED_BONUS_MAX,
  SPEED_BONUS_DECAY_MS,
  PERFECT_SCORE_MULTIPLIER,
  EMERGENCY_BONUS,
} from '../config';
import type { CareLevel } from '../types/game';

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

  const speedBonus = Math.max(
    0,
    Math.round(SPEED_BONUS_MAX * (1 - elapsed / SPEED_BONUS_DECAY_MS)),
  );

  const multiplier = Math.min(combo + 1, COMBO_CAP);
  const perfectMultiplier = isPerfect ? PERFECT_SCORE_MULTIPLIER : 1;

  const emergencyBonus = patient.isEmergency ? EMERGENCY_BONUS : 0;

  const points = Math.round(
    (base + speedBonus + emergencyBonus) * multiplier * perfectMultiplier,
  );

  return { points, isPerfect, speedBonus };
}

export function careLevelValue(level: CareLevel): number {
  return CARE_LEVEL_RANK[level];
}
