export type CareLevel = 'low' | 'medium' | 'high';
export type Gender = 'male' | 'female';
export type Equipment = 'none' | 'oxygen' | 'intensive';
export type GenderPolicy = 'male' | 'female' | 'mixed';
export type DifficultyPhase = 'calmShift' | 'busyHours' | 'chaos';
export type GamePhase = 'start' | 'playing' | 'shiftOver';
export type EventType = 'emergency' | 'cleaning' | 'worsened' | 'inspection';

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

export interface RoomTemplate {
  capacity: 1 | 2;
  maxCareLevel: CareLevel;
  genderPolicy: GenderPolicy;
  isolationCapable: boolean;
  equipmentAvailable: Equipment;
}
