import type { Patient, Room } from '../types/game';
import { validatePlacement } from './validation';
import { SPAWN_LOOKAHEAD_MS } from '../config';

/**
 * Projects what a room will look like at a future time by removing
 * occupants whose discharge timers will have elapsed and re-enabling
 * rooms whose cleaning timers will have expired.
 */
function simulateRoomAtTime(room: Room, atTime: number): Room {
  const disabledAtTime = room.disabled && room.disabledUntilGameTime > atTime;
  const remainingOccupants = room.occupants.filter(
    (p) => p.dischargeAtGameTime <= 0 || p.dischargeAtGameTime > atTime,
  );

  return {
    ...room,
    disabled: disabledAtTime,
    occupants: remainingOccupants,
  };
}

/**
 * Returns true if at least one room can accept this patient right now
 * using the standard placement validation rules.
 */
export function canPlaceNow(patient: Patient, rooms: Room[]): boolean {
  return rooms.some((room) => validatePlacement(patient, room).valid);
}

/**
 * Returns true if at least one room will be able to accept this patient
 * at some point within the lookahead horizon. Works by projecting every
 * room's state forward (discharges + re-enablement) and checking validity
 * against the projected state. Because occupants only leave over time
 * (never spontaneously arrive), validity at horizon-end is an upper bound:
 * if the patient fits there, a concrete placement moment exists.
 */
function canPlaceWithinHorizon(
  patient: Patient,
  rooms: Room[],
  gameClock: number,
  horizonMs: number,
): boolean {
  const horizonEnd = gameClock + horizonMs;
  return rooms.some((room) => {
    const projected = simulateRoomAtTime(room, horizonEnd);
    return validatePlacement(patient, projected).valid;
  });
}

/**
 * Full feasibility gate for spawning.
 *
 * Emergency patients must be placeable immediately — the player needs a
 * valid room RIGHT NOW or the patient is unfair.
 *
 * Normal patients are feasible if a valid slot exists now OR will open
 * within the lookahead window (based on scheduled discharges / room
 * re-enablement).
 */
export function isFeasibleSpawn(
  patient: Patient,
  rooms: Room[],
  gameClock: number,
): boolean {
  if (patient.isEmergency) {
    return canPlaceNow(patient, rooms);
  }
  return canPlaceWithinHorizon(patient, rooms, gameClock, SPAWN_LOOKAHEAD_MS);
}
