export type CareLevel = 'low' | 'medium' | 'high';
export type Gender = 'male' | 'female';
export type Equipment = 'none' | 'oxygen' | 'intensive';
export type GenderPolicy = 'male' | 'female' | 'mixed';
export type DifficultyPhase = 'calmShift' | 'busyHours' | 'chaos';
export type GamePhase = 'start' | 'playing' | 'shiftOver';
export type EventType = 'emergency' | 'cleaning' | 'worsened' | 'inspection';

export const CARE_LEVEL_RANK: Record<CareLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export const CARE_LEVEL_LABEL: Record<CareLevel, string> = {
  low: 'Low',
  medium: 'Med',
  high: 'High',
};

export const PHASE_DISPLAY: Record<DifficultyPhase, string> = {
  calmShift: 'Calm Shift',
  busyHours: 'Busy Hours',
  chaos: 'CHAOS',
};

export interface Patient {
  id: string;
  name: string;
  careLevel: CareLevel;
  gender: Gender;
  isolationRequired: boolean;
  equipment: Equipment;
  funTrait: string;
  spawnedAtGameTime: number;
  expiresAtGameTime: number;
  isEmergency: boolean;
  dischargeAtGameTime: number;
}

export interface Room {
  id: string;
  label: string;
  capacity: 1 | 2;
  maxCareLevel: CareLevel;
  genderPolicy: GenderPolicy;
  isolationCapable: boolean;
  equipmentAvailable: Equipment;
  occupants: Patient[];
  disabled: boolean;
  disabledUntilGameTime: number;
}

export interface ValidationReason {
  text: string;
  icon: string;
}

export interface ValidationResult {
  valid: boolean;
  reasons: ValidationReason[];
}

export interface GameEvent {
  id: string;
  type: EventType;
  displayText: string;
  durationMs: number;
  startedAtGameTime: number;
  affectedEntityId: string | null;
}

export interface SlowMoState {
  active: boolean;
  endsAtGameTime: number;
  cooldownUntilGameTime: number;
}

export interface GameStats {
  patientsPlaced: number;
  patientsDischarged: number;
  perfectPlacements: number;
  bestCombo: number;
  totalScore: number;
  efficiency: number;
  highestPhaseReached: DifficultyPhase;
  rearrangements: number;
  missCount: number;
  totalSpawned: number;
}

export interface AISuggestion {
  roomId: string;
  message: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface PerfectPlacementEvent {
  roomId: string;
  triggeredAtGameTime: number;
}

export interface PhaseTransitionEvent {
  phase: DifficultyPhase;
  triggeredAtGameTime: number;
}

export interface DragData {
  patientId: string;
  source: 'queue' | string;
}

export interface DifficultyConfig {
  spawnIntervalMs: number;
  spawnVarianceMs: number;
  eventProbability: number;
  patientExpiryMs: number;
  emergencyExpiryMs: number;
  emergencyChance: number;
  highCareChance: number;
  isolationChance: number;
  equipmentChance: number;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyPhase, DifficultyConfig> = {
  calmShift: {
    spawnIntervalMs: 5000,
    spawnVarianceMs: 1500,
    eventProbability: 0,
    patientExpiryMs: 30000,
    emergencyExpiryMs: 10000,
    emergencyChance: 0,
    highCareChance: 0,
    isolationChance: 0,
    equipmentChance: 0,
  },
  busyHours: {
    spawnIntervalMs: 3200,
    spawnVarianceMs: 800,
    eventProbability: 0.03,
    patientExpiryMs: 22000,
    emergencyExpiryMs: 8000,
    emergencyChance: 0.1,
    highCareChance: 0.25,
    isolationChance: 0.1,
    equipmentChance: 0.15,
  },
  chaos: {
    spawnIntervalMs: 1800,
    spawnVarianceMs: 500,
    eventProbability: 0.06,
    patientExpiryMs: 14000,
    emergencyExpiryMs: 6000,
    emergencyChance: 0.2,
    highCareChance: 0.35,
    isolationChance: 0.18,
    equipmentChance: 0.3,
  },
};

export const PHASE_THRESHOLDS: Record<DifficultyPhase, number> = {
  calmShift: 0,
  busyHours: 45000,
  chaos: 120000,
};

export const MAX_MISSES = 3;
export const MAX_VISIBLE_QUEUE = 5;
export const PRESSURE_OVERFLOW_PENALTY_MS = 1500;
export const SLOW_MO_DURATION_MS = 2000;
export const SLOW_MO_COOLDOWN_MS = 10000;
export const SLOW_MO_TIME_SCALE = 0.4;
export const PERFECT_PLACEMENT_WINDOW_MS = 3000;
export const COMBO_CAP = 5;

export const STAY_DURATION_MS: Record<CareLevel, number> = {
  low: 15000,
  medium: 20000,
  high: 28000,
};
export const PERFECT_STAY_MULTIPLIER = 0.75;
