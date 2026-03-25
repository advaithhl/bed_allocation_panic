import type { Room } from '../types/game';
import { ROOM_TEMPLATES, ROOM_LABELS } from '../config';

export function createRooms(): Room[] {
  return ROOM_TEMPLATES.map((template, index) => ({
    id: `room-${index + 1}`,
    label: ROOM_LABELS[index] || `Room ${index + 1}`,
    capacity: template.capacity,
    maxCareLevel: template.maxCareLevel,
    genderPolicy: template.genderPolicy,
    isolationCapable: template.isolationCapable,
    equipmentAvailable: template.equipmentAvailable,
    occupants: [],
    disabled: false,
    disabledUntilGameTime: 0,
  }));
}
