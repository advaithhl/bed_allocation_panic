/**
 * Central game configuration.
 *
 * Every tunable gameplay value lives here so the entire game can be
 * rebalanced from a single file.
 */

import type {
  CareLevel,
  DifficultyConfig,
  DifficultyPhase,
  Equipment,
  EventType,
  RoomTemplate,
} from './types/game';

// ─── Care‑Level Lookup ──────────────────────────────────────────

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

// ─── Phase Display Names ────────────────────────────────────────

export const PHASE_DISPLAY: Record<DifficultyPhase, string> = {
  calmShift: 'Calm Shift',
  busyHours: 'Busy Hours',
  chaos: 'CHAOS',
};

// ─── Difficulty Tuning Per Phase ────────────────────────────────

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

// ─── Patient Spawning ───────────────────────────────────────────

export const GENDER_SPLIT = 0.5;
export const MEDIUM_CARE_BAND = 0.3;
export const EQUIPMENT_OXYGEN_CHANCE = 0.6;

export const SPAWN_LOOKAHEAD_MS = 10000;
export const MAX_SPAWN_RETRIES = 5;
export const SPAWN_RETRY_DELAY_MS = 1000;

// ─── Queue & Misses ─────────────────────────────────────────────

export const MAX_MISSES = 3;
export const MAX_VISIBLE_QUEUE = 5;
export const PRESSURE_OVERFLOW_PENALTY_MS = 1500;

// ─── Scoring ────────────────────────────────────────────────────

export const BASE_SCORE: Record<CareLevel, number> = {
  low: 50,
  medium: 100,
  high: 150,
};

export const SPEED_BONUS_MAX = 100;
export const SPEED_BONUS_DECAY_MS = 10000;
export const PERFECT_PLACEMENT_WINDOW_MS = 3000;
export const PERFECT_SCORE_MULTIPLIER = 2;
export const EMERGENCY_BONUS = 50;
export const COMBO_CAP = 5;
export const INVALID_PLACEMENT_PENALTY = 50;
export const INSPECTION_PENALTY_MULTIPLIER = 2;

// ─── Patient Stay & Discharge ───────────────────────────────────

export const STAY_DURATION_MS: Record<CareLevel, number> = {
  low: 15000,
  medium: 20000,
  high: 28000,
};

export const PERFECT_STAY_MULTIPLIER = 0.75;

// ─── Slow Motion ────────────────────────────────────────────────

export const SLOW_MO_DURATION_MS = 2000;
export const SLOW_MO_COOLDOWN_MS = 10000;
export const SLOW_MO_TIME_SCALE = 0.4;

// ─── Events ─────────────────────────────────────────────────────

export const EVENT_MIN_COOLDOWN_MS = 8000;

export const EVENT_DURATION_MS: Record<EventType, number> = {
  emergency: 5000,
  cleaning: 10000,
  worsened: 8000,
  inspection: 15000,
};

// ─── AI Suggestion ──────────────────────────────────────────────

export const AI_HIGH_CONFIDENCE = 0.55;
export const AI_MEDIUM_CONFIDENCE = 0.85;

// ─── Equipment Ranks ────────────────────────────────────────────

export const EQUIPMENT_RANK: Record<Equipment | 'none', number> = {
  none: 0,
  oxygen: 1,
  intensive: 2,
};

// ─── Room Setup ─────────────────────────────────────────────────

export const ROOM_TEMPLATES: RoomTemplate[] = [
  { capacity: 2, maxCareLevel: 'low', genderPolicy: 'female', isolationCapable: false, equipmentAvailable: 'none' },
  { capacity: 2, maxCareLevel: 'low', genderPolicy: 'male', isolationCapable: false, equipmentAvailable: 'none' },
  { capacity: 2, maxCareLevel: 'medium', genderPolicy: 'mixed', isolationCapable: false, equipmentAvailable: 'oxygen' },
  { capacity: 1, maxCareLevel: 'medium', genderPolicy: 'mixed', isolationCapable: true, equipmentAvailable: 'none' },
  { capacity: 2, maxCareLevel: 'high', genderPolicy: 'mixed', isolationCapable: false, equipmentAvailable: 'intensive' },
  { capacity: 1, maxCareLevel: 'high', genderPolicy: 'mixed', isolationCapable: true, equipmentAvailable: 'oxygen' },
];

export const ROOM_LABELS = [
  'Ward A',
  'Ward B',
  'Bay C',
  'Suite D',
  'Bay E',
  'Suite F',
];

// ─── UI Thresholds ──────────────────────────────────────────────

export const URGENT_TIMER_MS = 5000;
export const PRESSURE_BAR_MAX_QUEUE = 8;
export const PRESSURE_BAR_AMBER = 0.4;
export const PRESSURE_BAR_RED = 0.7;
export const EVENT_POPUP_DURATION_MS = 4000;
export const MAX_EVENT_POPUPS = 2;
export const PHASE_BANNER_DURATION_MS = 2500;
export const DRAG_ACTIVATION_DISTANCE = 5;
export const FRAME_CAP_MS = 100;
export const LEADERBOARD_MAX_ENTRIES = 10;
export const SHIFT_OVER_SCORE_HIGH = 3000;
export const SHIFT_OVER_SCORE_MEDIUM = 1000;
