import type { EventType, GameEvent, Room, Patient } from '../types/game';
import { EVENT_TEXTS } from '../data/names';
import { EVENT_DURATION_MS } from '../config';

let eventId = 1;

export function resetEventIdCounter() {
  eventId = 1;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateEvent(
  gameClock: number,
  rooms: Room[],
  queue: Patient[],
): GameEvent | null {
  const occupiedRooms = rooms.filter((r) => r.occupants.length > 0 && !r.disabled);
  const availableTypes: EventType[] = ['emergency'];

  if (occupiedRooms.length > 0) {
    availableTypes.push('cleaning');
    const upgradeable = occupiedRooms.flatMap((r) =>
      r.occupants.filter((p) => p.careLevel !== 'high'),
    );
    if (upgradeable.length > 0) {
      availableTypes.push('worsened');
    }
  }
  if (queue.length > 0 || occupiedRooms.length > 0) {
    availableTypes.push('inspection');
  }

  const type = pick(availableTypes);
  const id = `event-${eventId++}`;

  switch (type) {
    case 'emergency':
      return {
        id,
        type: 'emergency',
        displayText: `🚨 Emergency! ${pick(EVENT_TEXTS.emergency)}`,
        durationMs: EVENT_DURATION_MS.emergency,
        startedAtGameTime: gameClock,
        affectedEntityId: null,
      };

    case 'cleaning': {
      const room = pick(occupiedRooms);
      return {
        id,
        type: 'cleaning',
        displayText: `🧹 ${room.label}: ${pick(EVENT_TEXTS.cleaning)}`,
        durationMs: EVENT_DURATION_MS.cleaning,
        startedAtGameTime: gameClock,
        affectedEntityId: room.id,
      };
    }

    case 'worsened': {
      const candidates = occupiedRooms.flatMap((r) =>
        r.occupants.filter((p) => p.careLevel !== 'high'),
      );
      if (candidates.length === 0) return null;
      const patient = pick(candidates);
      return {
        id,
        type: 'worsened',
        displayText: `⚠️ ${patient.name}: ${pick(EVENT_TEXTS.worsened)}`,
        durationMs: EVENT_DURATION_MS.worsened,
        startedAtGameTime: gameClock,
        affectedEntityId: patient.id,
      };
    }

    case 'inspection':
      return {
        id,
        type: 'inspection',
        displayText: `🔍 ${pick(EVENT_TEXTS.inspection)}`,
        durationMs: EVENT_DURATION_MS.inspection,
        startedAtGameTime: gameClock,
        affectedEntityId: null,
      };

    default:
      return null;
  }
}
