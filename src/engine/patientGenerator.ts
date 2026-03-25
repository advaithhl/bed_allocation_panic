import type { CareLevel, DifficultyConfig, Equipment, Gender, Patient } from '../types/game';
import { PATIENT_FIRST_NAMES, PATIENT_LAST_NAMES, FUN_TRAITS } from '../data/names';
import { GENDER_SPLIT, MEDIUM_CARE_BAND, EQUIPMENT_OXYGEN_CHANCE } from '../config';

let nextId = 1;

export function resetPatientIdCounter() {
  nextId = 1;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePatient(
  gameClock: number,
  config: DifficultyConfig,
): Patient {
  const id = `patient-${nextId++}`;
  const name = `${pick(PATIENT_FIRST_NAMES)} ${pick(PATIENT_LAST_NAMES)}`;
  const gender: Gender = Math.random() < GENDER_SPLIT ? 'male' : 'female';
  const trait = pick(FUN_TRAITS);

  const isEmergency = Math.random() < config.emergencyChance;

  let careLevel: CareLevel = 'low';
  const r = Math.random();
  if (r < config.highCareChance) {
    careLevel = 'high';
  } else if (r < config.highCareChance + MEDIUM_CARE_BAND) {
    careLevel = 'medium';
  }

  const isolationRequired = Math.random() < config.isolationChance;

  let equipment: Equipment = 'none';
  if (Math.random() < config.equipmentChance) {
    equipment = Math.random() < EQUIPMENT_OXYGEN_CHANCE ? 'oxygen' : 'intensive';
  }

  const expiryMs = isEmergency ? config.emergencyExpiryMs : config.patientExpiryMs;

  return {
    id,
    name,
    careLevel: isEmergency ? 'high' : careLevel,
    gender,
    isolationRequired: isEmergency ? false : isolationRequired,
    equipment: isEmergency ? 'none' : equipment,
    funTrait: `${trait.icon} ${trait.text}`,
    spawnedAtGameTime: gameClock,
    expiresAtGameTime: gameClock + expiryMs,
    isEmergency,
    dischargeAtGameTime: 0,
  };
}
