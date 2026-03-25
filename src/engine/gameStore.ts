import { create } from 'zustand';
import type {
  AISuggestion,
  DifficultyPhase,
  GameEvent,
  GamePhase,
  GameStats,
  Patient,
  PerfectPlacementEvent,
  PhaseTransitionEvent,
  Room,
  SlowMoState,
} from '../types/game';
import {
  DIFFICULTY_CONFIGS,
  MAX_MISSES,
  MAX_VISIBLE_QUEUE,
  PHASE_THRESHOLDS,
  PRESSURE_OVERFLOW_PENALTY_MS,
  SLOW_MO_COOLDOWN_MS,
  SLOW_MO_DURATION_MS,
  SLOW_MO_TIME_SCALE,
} from '../types/game';
import { createRooms } from './roomSetup';
import { generatePatient, resetPatientIdCounter } from './patientGenerator';
import { generateEvent, resetEventIdCounter } from './eventSystem';
import { validatePlacement } from './validation';
import { calculatePlacementScore } from './scoreManager';
import { getSuggestion } from './aiSuggestion';

export interface GameState {
  // Core state
  phase: GamePhase;
  gameClock: number;
  timeScale: number;
  difficultyPhase: DifficultyPhase;

  // Entities
  queue: Patient[];
  rooms: Room[];
  activeEvents: GameEvent[];

  // Scoring
  score: number;
  combo: number;
  stats: GameStats;

  // Slow-mo
  slowMo: SlowMoState;

  // UI state
  aiSuggestion: AISuggestion | null;
  perfectPlacement: PerfectPlacementEvent | null;
  phaseTransition: PhaseTransitionEvent | null;
  shiftOverReason: string;
  inspectionActive: boolean;
  soundEnabled: boolean;

  // Spawn tracking
  lastSpawnGameTime: number;
  lastEventGameTime: number;

  // Actions
  startGame: () => void;
  tick: (gameDeltaMs: number) => void;
  placePatient: (patientId: string, roomId: string) => {
    success: boolean;
    isPerfect: boolean;
    points: number;
  };
  unplacePatient: (patientId: string, roomId: string) => void;
  movePatient: (patientId: string, fromRoomId: string, toRoomId: string) => boolean;
  activateSlowMo: () => boolean;
  requestAISuggestion: () => void;
  clearAISuggestion: () => void;
  clearPerfectPlacement: () => void;
  clearPhaseTransition: () => void;
  toggleSound: () => void;
}

const initialStats: GameStats = {
  patientsPlaced: 0,
  perfectPlacements: 0,
  bestCombo: 0,
  totalScore: 0,
  efficiency: 0,
  highestPhaseReached: 'calmShift',
  rearrangements: 0,
  missCount: 0,
  totalSpawned: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'start',
  gameClock: 0,
  timeScale: 1,
  difficultyPhase: 'calmShift',

  queue: [],
  rooms: createRooms(),
  activeEvents: [],

  score: 0,
  combo: 0,
  stats: { ...initialStats },

  slowMo: { active: false, endsAtGameTime: 0, cooldownUntilGameTime: 0 },

  aiSuggestion: null,
  perfectPlacement: null,
  phaseTransition: null,
  shiftOverReason: '',
  inspectionActive: false,
  soundEnabled: true,

  lastSpawnGameTime: 0,
  lastEventGameTime: 0,

  startGame: () => {
    resetPatientIdCounter();
    resetEventIdCounter();
    set({
      phase: 'playing',
      gameClock: 0,
      timeScale: 1,
      difficultyPhase: 'calmShift',
      queue: [],
      rooms: createRooms(),
      activeEvents: [],
      score: 0,
      combo: 0,
      stats: { ...initialStats },
      slowMo: { active: false, endsAtGameTime: 0, cooldownUntilGameTime: 0 },
      aiSuggestion: null,
      perfectPlacement: null,
      phaseTransition: null,
      shiftOverReason: '',
      inspectionActive: false,
      lastSpawnGameTime: 0,
      lastEventGameTime: 0,
    });
  },

  tick: (gameDeltaMs: number) => {
    const state = get();
    if (state.phase !== 'playing') return;

    const newClock = state.gameClock + gameDeltaMs;
    const config = DIFFICULTY_CONFIGS[state.difficultyPhase];

    // --- Phase transitions ---
    let newPhase = state.difficultyPhase;
    let phaseTransition = state.phaseTransition;
    if (newClock >= PHASE_THRESHOLDS.chaos && state.difficultyPhase !== 'chaos') {
      newPhase = 'chaos';
      phaseTransition = { phase: 'chaos', triggeredAtGameTime: newClock };
    } else if (
      newClock >= PHASE_THRESHOLDS.busyHours &&
      state.difficultyPhase === 'calmShift'
    ) {
      newPhase = 'busyHours';
      phaseTransition = { phase: 'busyHours', triggeredAtGameTime: newClock };
    }

    // --- Slow-mo check ---
    let timeScale = state.timeScale;
    let slowMo = { ...state.slowMo };
    if (slowMo.active && newClock >= slowMo.endsAtGameTime) {
      slowMo.active = false;
      timeScale = 1;
    }

    // --- Re-enable disabled rooms ---
    const rooms = state.rooms.map((room) => {
      if (room.disabled && newClock >= room.disabledUntilGameTime) {
        return { ...room, disabled: false, disabledUntilGameTime: 0 };
      }
      return room;
    });

    // --- Expire events ---
    const activeEvents = state.activeEvents.filter(
      (e) => newClock < e.startedAtGameTime + e.durationMs,
    );
    const inspectionActive = activeEvents.some((e) => e.type === 'inspection');

    // --- Patient expiry ---
    let queue = [...state.queue];
    let missCount = state.stats.missCount;
    let shiftOverReason = '';
    let gamePhase: GamePhase = 'playing';

    // Apply pressure overflow acceleration
    const overflow = Math.max(0, queue.length - MAX_VISIBLE_QUEUE);
    if (overflow > 0) {
      queue = queue.map((p) => ({
        ...p,
        expiresAtGameTime:
          p.expiresAtGameTime - PRESSURE_OVERFLOW_PENALTY_MS * overflow * (gameDeltaMs / 1000),
      }));
    }

    const expired: Patient[] = [];
    queue = queue.filter((p) => {
      if (newClock >= p.expiresAtGameTime) {
        expired.push(p);
        return false;
      }
      return true;
    });

    for (const p of expired) {
      if (p.isEmergency) {
        shiftOverReason = `Emergency patient ${p.name} was not placed in time!`;
        gamePhase = 'shiftOver';
        break;
      } else {
        missCount++;
        if (missCount >= MAX_MISSES) {
          shiftOverReason = 'Too many patients left unattended!';
          gamePhase = 'shiftOver';
          break;
        }
      }
    }

    // --- Spawn patients ---
    let lastSpawnGameTime = state.lastSpawnGameTime;
    let totalSpawned = state.stats.totalSpawned;
    const spawnInterval =
      config.spawnIntervalMs + (Math.random() - 0.5) * config.spawnVarianceMs;
    if (newClock - lastSpawnGameTime >= spawnInterval && gamePhase === 'playing') {
      const newPatient = generatePatient(newClock, config);
      queue.push(newPatient);
      lastSpawnGameTime = newClock;
      totalSpawned++;
    }

    // --- Trigger events ---
    let lastEventGameTime = state.lastEventGameTime;
    let newRooms = rooms;
    let newQueue = queue;

    if (
      gamePhase === 'playing' &&
      Math.random() < config.eventProbability &&
      newClock - lastEventGameTime >= 8000
    ) {
      const event = generateEvent(newClock, rooms, queue);
      if (event) {
        activeEvents.push(event);
        lastEventGameTime = newClock;

        // Apply event effects
        if (event.type === 'cleaning' && event.affectedEntityId) {
          newRooms = newRooms.map((r) => {
            if (r.id === event.affectedEntityId) {
              const evicted = r.occupants;
              newQueue = [...newQueue, ...evicted.map((p) => ({
                ...p,
                expiresAtGameTime: newClock + config.patientExpiryMs,
              }))];
              return {
                ...r,
                occupants: [],
                disabled: true,
                disabledUntilGameTime: newClock + event.durationMs,
              };
            }
            return r;
          });
        }

        if (event.type === 'worsened' && event.affectedEntityId) {
          const upgrade = (level: string) =>
            level === 'low' ? 'medium' : level === 'medium' ? 'high' : 'high';

          newRooms = newRooms.map((r) => {
            const idx = r.occupants.findIndex(
              (p) => p.id === event.affectedEntityId,
            );
            if (idx === -1) return r;

            const patient = r.occupants[idx];
            const upgraded = {
              ...patient,
              careLevel: upgrade(patient.careLevel) as Patient['careLevel'],
            };

            const roomWithout = {
              ...r,
              occupants: r.occupants.filter((_, i) => i !== idx),
            };
            const validation = validatePlacement(upgraded, roomWithout);
            if (validation.valid) {
              return {
                ...r,
                occupants: r.occupants.map((p, i) => (i === idx ? upgraded : p)),
              };
            } else {
              newQueue = [
                ...newQueue,
                { ...upgraded, expiresAtGameTime: newClock + config.patientExpiryMs },
              ];
              return roomWithout;
            }
          });
        }

        if (event.type === 'emergency') {
          const emergencyPatient = generatePatient(newClock, {
            ...config,
            emergencyChance: 1,
          });
          newQueue = [...newQueue, emergencyPatient];
          totalSpawned++;
        }
      }
    }

    const newStats: GameStats = {
      ...state.stats,
      missCount,
      totalSpawned,
      highestPhaseReached: newPhase,
      totalScore: state.score,
      efficiency:
        totalSpawned > 0
          ? Math.round((state.stats.patientsPlaced / totalSpawned) * 100)
          : 100,
    };

    set({
      gameClock: newClock,
      difficultyPhase: newPhase,
      phaseTransition:
        phaseTransition !== state.phaseTransition ? phaseTransition : state.phaseTransition,
      timeScale,
      slowMo,
      rooms: newRooms,
      queue: newQueue,
      activeEvents,
      inspectionActive,
      stats: newStats,
      lastSpawnGameTime,
      lastEventGameTime,
      phase: gamePhase,
      shiftOverReason: shiftOverReason || state.shiftOverReason,
    });
  },

  placePatient: (patientId: string, roomId: string) => {
    const state = get();
    const patientIdx = state.queue.findIndex((p) => p.id === patientId);
    if (patientIdx === -1) return { success: false, isPerfect: false, points: 0 };

    const patient = state.queue[patientIdx];
    const room = state.rooms.find((r) => r.id === roomId);
    if (!room) return { success: false, isPerfect: false, points: 0 };

    const validation = validatePlacement(patient, room);
    if (!validation.valid) {
      // Penalty for invalid placement attempt
      const penalty = state.inspectionActive ? 100 : 50;
      set({
        score: Math.max(0, state.score - penalty),
        combo: 0,
      });
      return { success: false, isPerfect: false, points: -penalty };
    }

    const { points, isPerfect } = calculatePlacementScore(
      patient,
      state.gameClock,
      state.combo,
    );

    const newQueue = state.queue.filter((_, i) => i !== patientIdx);
    const newRooms = state.rooms.map((r) =>
      r.id === roomId ? { ...r, occupants: [...r.occupants, patient] } : r,
    );

    const newCombo = state.combo + 1;
    const newScore = state.score + points;

    set({
      queue: newQueue,
      rooms: newRooms,
      score: newScore,
      combo: newCombo,
      aiSuggestion: null,
      perfectPlacement: isPerfect
        ? { roomId, triggeredAtGameTime: state.gameClock }
        : state.perfectPlacement,
      stats: {
        ...state.stats,
        patientsPlaced: state.stats.patientsPlaced + 1,
        perfectPlacements: state.stats.perfectPlacements + (isPerfect ? 1 : 0),
        bestCombo: Math.max(state.stats.bestCombo, newCombo),
        totalScore: newScore,
      },
    });

    return { success: true, isPerfect, points };
  },

  unplacePatient: (patientId: string, roomId: string) => {
    const state = get();
    const room = state.rooms.find((r) => r.id === roomId);
    if (!room) return;

    const patient = room.occupants.find((p) => p.id === patientId);
    if (!patient) return;

    const config = DIFFICULTY_CONFIGS[state.difficultyPhase];
    const returnedPatient: Patient = {
      ...patient,
      expiresAtGameTime: state.gameClock + config.patientExpiryMs,
    };

    set({
      rooms: state.rooms.map((r) =>
        r.id === roomId
          ? { ...r, occupants: r.occupants.filter((p) => p.id !== patientId) }
          : r,
      ),
      queue: [returnedPatient, ...state.queue],
      aiSuggestion: null,
      stats: { ...state.stats, rearrangements: state.stats.rearrangements + 1 },
    });
  },

  movePatient: (patientId: string, fromRoomId: string, toRoomId: string) => {
    const state = get();
    const fromRoom = state.rooms.find((r) => r.id === fromRoomId);
    const toRoom = state.rooms.find((r) => r.id === toRoomId);
    if (!fromRoom || !toRoom) return false;

    const patient = fromRoom.occupants.find((p) => p.id === patientId);
    if (!patient) return false;

    const validation = validatePlacement(patient, toRoom);
    if (!validation.valid) return false;

    set({
      rooms: state.rooms.map((r) => {
        if (r.id === fromRoomId) {
          return { ...r, occupants: r.occupants.filter((p) => p.id !== patientId) };
        }
        if (r.id === toRoomId) {
          return { ...r, occupants: [...r.occupants, patient] };
        }
        return r;
      }),
      aiSuggestion: null,
      stats: { ...state.stats, rearrangements: state.stats.rearrangements + 1 },
    });
    return true;
  },

  activateSlowMo: () => {
    const state = get();
    if (state.phase !== 'playing') return false;
    if (state.slowMo.active) return false;
    if (state.gameClock < state.slowMo.cooldownUntilGameTime) return false;

    set({
      slowMo: {
        active: true,
        endsAtGameTime: state.gameClock + SLOW_MO_DURATION_MS,
        cooldownUntilGameTime:
          state.gameClock + SLOW_MO_DURATION_MS + SLOW_MO_COOLDOWN_MS,
      },
      timeScale: SLOW_MO_TIME_SCALE,
    });
    return true;
  },

  requestAISuggestion: () => {
    const state = get();
    const patient = state.queue[0] || null;
    const suggestion = getSuggestion(patient, state.rooms);
    set({ aiSuggestion: suggestion });
  },

  clearAISuggestion: () => set({ aiSuggestion: null }),
  clearPerfectPlacement: () => set({ perfectPlacement: null }),
  clearPhaseTransition: () => set({ phaseTransition: null }),
  toggleSound: () => set({ soundEnabled: !get().soundEnabled }),
}));
