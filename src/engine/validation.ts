import type { Patient, Room, ValidationResult } from '../types/game';
import { CARE_LEVEL_RANK, EQUIPMENT_RANK } from '../config';

export function validatePlacement(patient: Patient, room: Room): ValidationResult {
  const reasons: ValidationResult['reasons'] = [];

  if (room.disabled) {
    reasons.push({ text: 'Room cleaning', icon: '🧹' });
  }

  if (room.occupants.length >= room.capacity) {
    reasons.push({ text: 'Room full', icon: '🚫' });
  }

  if (CARE_LEVEL_RANK[patient.careLevel] > CARE_LEVEL_RANK[room.maxCareLevel]) {
    reasons.push({ text: 'Care level exceeds max', icon: '⚕️' });
  }

  if (room.genderPolicy !== 'mixed') {
    if (patient.gender !== room.genderPolicy) {
      reasons.push({ text: 'Gender restriction', icon: '👤' });
    }
  }

  if (patient.isolationRequired) {
    if (!room.isolationCapable) {
      reasons.push({ text: 'No isolation room', icon: '🔒' });
    }
    if (room.occupants.length > 0) {
      reasons.push({ text: 'Isolation needs empty room', icon: '🔒' });
    }
  }

  // Don't place non-isolation patients in occupied isolation rooms with isolation patients
  if (
    !patient.isolationRequired &&
    room.occupants.some((o) => o.isolationRequired)
  ) {
    reasons.push({ text: 'Occupied by isolation patient', icon: '🔒' });
  }

  if (patient.equipment !== 'none') {
    if (EQUIPMENT_RANK[room.equipmentAvailable] < EQUIPMENT_RANK[patient.equipment]) {
      reasons.push({ text: 'Equipment unavailable', icon: '🩺' });
    }
  }

  return { valid: reasons.length === 0, reasons };
}
