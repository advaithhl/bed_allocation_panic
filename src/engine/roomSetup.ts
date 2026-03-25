import type { CareLevel, Equipment, GenderPolicy, Room } from '../types/game';
import { ROOM_LABELS } from '../data/names';

interface RoomTemplate {
  capacity: 1 | 2;
  maxCareLevel: CareLevel;
  genderPolicy: GenderPolicy;
  isolationCapable: boolean;
  equipmentAvailable: Equipment;
}

const ROOM_TEMPLATES: RoomTemplate[] = [
  // Row 1: basic low-care
  { capacity: 2, maxCareLevel: 'low', genderPolicy: 'female', isolationCapable: false, equipmentAvailable: 'none' },
  { capacity: 2, maxCareLevel: 'low', genderPolicy: 'male', isolationCapable: false, equipmentAvailable: 'none' },
  // Row 2: medium-care
  { capacity: 2, maxCareLevel: 'medium', genderPolicy: 'mixed', isolationCapable: false, equipmentAvailable: 'oxygen' },
  { capacity: 1, maxCareLevel: 'medium', genderPolicy: 'mixed', isolationCapable: true, equipmentAvailable: 'none' },
  // Row 3: high-care
  { capacity: 2, maxCareLevel: 'high', genderPolicy: 'mixed', isolationCapable: false, equipmentAvailable: 'intensive' },
  { capacity: 1, maxCareLevel: 'high', genderPolicy: 'mixed', isolationCapable: true, equipmentAvailable: 'oxygen' },
];

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
