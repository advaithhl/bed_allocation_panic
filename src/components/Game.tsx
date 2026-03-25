import { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { useGameStore } from '../engine/gameStore';
import { validatePlacement } from '../engine/validation';
import { useGameLoop } from '../hooks/useGameLoop';
import { useSlowMo } from '../hooks/useSlowMo';
import type { DragData, Patient, ValidationResult } from '../types/game';

import { HUD } from './HUD';
import { PatientQueue } from './PatientQueue';
import { RoomGrid } from './RoomGrid';
import { EventPopup } from './EventPopup';
import { SlowMoOverlay } from './SlowMoOverlay';
import { PhaseTransitionBanner } from './PhaseTransitionBanner';
import { DragOverlayContent } from './DragOverlayContent';
import { playPop, playBuzz, playSparkle, playWhoosh, playAlarm, playDischarge } from '../utils/sound';

export function Game() {
  useGameLoop();
  useSlowMo();

  const queue = useGameStore((s) => s.queue);
  const rooms = useGameStore((s) => s.rooms);
  const placePatient = useGameStore((s) => s.placePatient);
  const unplacePatient = useGameStore((s) => s.unplacePatient);
  const movePatient = useGameStore((s) => s.movePatient);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const slowMo = useGameStore((s) => s.slowMo);

  const [activeDragPatient, setActiveDragPatient] = useState<Patient | null>(null);
  const [activeDragSource, setActiveDragSource] = useState<string | null>(null);
  const [dragOverRoomId, setDragOverRoomId] = useState<string | null>(null);
  const [roomValidations, setRoomValidations] = useState<Map<string, ValidationResult>>(new Map());

  const prevSlowMoActive = useRef(false);
  const prevEventCount = useRef(0);
  const prevDischargeCount = useRef(0);

  useEffect(() => {
    if (slowMo.active && !prevSlowMoActive.current && soundEnabled) {
      playWhoosh();
    }
    prevSlowMoActive.current = slowMo.active;
  }, [slowMo.active, soundEnabled]);

  const activeEvents = useGameStore((s) => s.activeEvents);
  useEffect(() => {
    if (activeEvents.length > prevEventCount.current && soundEnabled) {
      const newest = activeEvents[activeEvents.length - 1];
      if (newest?.type === 'emergency') {
        playAlarm();
      }
    }
    prevEventCount.current = activeEvents.length;
  }, [activeEvents, soundEnabled]);

  const dischargeCount = useGameStore((s) => s.stats.patientsDischarged);
  useEffect(() => {
    if (dischargeCount > prevDischargeCount.current && soundEnabled) {
      playDischarge();
    }
    prevDischargeCount.current = dischargeCount;
  }, [dischargeCount, soundEnabled]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const findPatient = useCallback(
    (id: string): Patient | undefined => {
      const fromQueue = queue.find((p) => p.id === id);
      if (fromQueue) return fromQueue;
      for (const room of rooms) {
        const fromRoom = room.occupants.find((p) => p.id === id);
        if (fromRoom) return fromRoom;
      }
      return undefined;
    },
    [queue, rooms],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as DragData | undefined;
      if (!data) return;
      const patient = findPatient(data.patientId);
      if (patient) {
        setActiveDragPatient(patient);
        setActiveDragSource(data.source);
      }
    },
    [findPatient],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const overId = event.over?.id as string | undefined;
      if (!overId || !activeDragPatient) {
        setDragOverRoomId(null);
        setRoomValidations(new Map());
        return;
      }

      if (overId === 'queue-drop-zone') {
        setDragOverRoomId(null);
        setRoomValidations(new Map());
        return;
      }

      const room = rooms.find((r) => r.id === overId);
      if (room) {
        setDragOverRoomId(room.id);

        let roomForValidation = room;
        if (activeDragSource && activeDragSource !== 'queue' && activeDragSource === room.id) {
          roomForValidation = {
            ...room,
            occupants: room.occupants.filter((p) => p.id !== activeDragPatient.id),
          };
        }

        const result = validatePlacement(activeDragPatient, roomForValidation);
        setRoomValidations(new Map([[room.id, result]]));
      }
    },
    [activeDragPatient, activeDragSource, rooms],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const data = event.active.data.current as DragData | undefined;
      if (!data || !activeDragPatient) {
        setActiveDragPatient(null);
        setActiveDragSource(null);
        setDragOverRoomId(null);
        setRoomValidations(new Map());
        return;
      }

      const overId = event.over?.id as string | undefined;

      if (!overId) {
        setActiveDragPatient(null);
        setActiveDragSource(null);
        setDragOverRoomId(null);
        setRoomValidations(new Map());
        return;
      }

      if (overId === 'queue-drop-zone' && data.source !== 'queue') {
        unplacePatient(data.patientId, data.source);
        if (soundEnabled) playPop();
      } else if (data.source === 'queue' && overId !== 'queue-drop-zone') {
        const result = placePatient(data.patientId, overId);
        if (result.success) {
          if (soundEnabled) {
            if (result.isPerfect) {
              playSparkle();
            } else {
              playPop();
            }
          }
        } else {
          if (soundEnabled) playBuzz();
        }
      } else if (data.source !== 'queue' && overId !== 'queue-drop-zone' && data.source !== overId) {
        const success = movePatient(data.patientId, data.source, overId);
        if (success) {
          if (soundEnabled) playPop();
        } else {
          if (soundEnabled) playBuzz();
        }
      }

      setActiveDragPatient(null);
      setActiveDragSource(null);
      setDragOverRoomId(null);
      setRoomValidations(new Map());
    },
    [activeDragPatient, placePatient, unplacePatient, movePatient, soundEnabled],
  );

  const currentValidation = dragOverRoomId
    ? roomValidations.get(dragOverRoomId) ?? null
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full flex flex-col overflow-hidden">
        <HUD />

        <div className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden">
          {/* Left: Queue */}
          <div className="w-72 flex-shrink-0 overflow-auto">
            <PatientQueue />
          </div>

          {/* Center: Room Grid */}
          <div className="flex-1 overflow-auto">
            <RoomGrid
              dragOverRoomId={dragOverRoomId}
              roomValidations={roomValidations}
            />
          </div>
        </div>
      </div>

      {/* Overlays */}
      <EventPopup />
      <SlowMoOverlay />
      <PhaseTransitionBanner />

      {/* Drag overlay */}
      <DragOverlay dropAnimation={null}>
        {activeDragPatient && (
          <DragOverlayContent
            patient={activeDragPatient}
            validation={currentValidation}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
