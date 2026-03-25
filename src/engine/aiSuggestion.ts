import type { AISuggestion, Patient, Room } from '../types/game';
import { validatePlacement } from './validation';
import { AI_QUIPS } from '../data/names';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getSuggestion(
  patient: Patient | null,
  rooms: Room[],
): AISuggestion | null {
  if (!patient) return null;

  const validRooms = rooms.filter(
    (r) => validatePlacement(patient, r).valid,
  );
  const invalidRooms = rooms.filter(
    (r) => !r.disabled && !validatePlacement(patient, r).valid,
  );

  const roll = Math.random();

  if (roll < 0.55 && validRooms.length > 0) {
    // Best valid room (prefer exact care level match and least occupied)
    const sorted = [...validRooms].sort((a, b) => {
      const aOcc = a.occupants.length;
      const bOcc = b.occupants.length;
      return aOcc - bOcc;
    });
    return {
      roomId: sorted[0].id,
      message: pick(AI_QUIPS.high),
      confidence: 'high',
    };
  }

  if (roll < 0.85 && validRooms.length > 0) {
    // Suboptimal but valid
    const room = pick(validRooms);
    return {
      roomId: room.id,
      message: pick(AI_QUIPS.medium),
      confidence: 'medium',
    };
  }

  // Bad suggestion
  const pool = invalidRooms.length > 0 ? invalidRooms : rooms.filter((r) => !r.disabled);
  if (pool.length === 0) return null;

  return {
    roomId: pick(pool).id,
    message: pick(AI_QUIPS.low),
    confidence: 'low',
  };
}
