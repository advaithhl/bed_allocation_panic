import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { Room, ValidationResult } from '../types/game';
import { CARE_LEVEL_LABEL } from '../types/game';
import { PatientCard } from './PatientCard';
import { useGameStore } from '../engine/gameStore';

interface Props {
  room: Room;
  validationResult: ValidationResult | null;
  isSuggested: boolean;
  onHover: (room: Room, e: React.MouseEvent) => void;
  onHoverEnd: () => void;
}

const CARE_BG = {
  low: 'bg-green-50/60',
  medium: 'bg-amber-50/60',
  high: 'bg-red-50/60',
};

const CARE_BORDER = {
  low: 'border-green-300',
  medium: 'border-amber-300',
  high: 'border-red-300',
};

const CARE_BADGE = {
  low: 'bg-green-500',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
};

const GENDER_LABEL: Record<string, string> = {
  male: '♂',
  female: '♀',
  mixed: '⚤',
};

export function RoomCell({
  room,
  validationResult,
  isSuggested,
  onHover,
  onHoverEnd,
}: Props) {
  const perfectPlacement = useGameStore((s) => s.perfectPlacement);
  const isPerfect = perfectPlacement?.roomId === room.id;

  const { setNodeRef, isOver } = useDroppable({
    id: room.id,
    data: { roomId: room.id },
  });

  const isValid = validationResult?.valid ?? true;
  const isFull = room.occupants.length >= room.capacity;

  let borderStyle = CARE_BORDER[room.maxCareLevel];
  let bgStyle = CARE_BG[room.maxCareLevel];

  if (room.disabled) {
    borderStyle = 'border-slate-300';
    bgStyle = 'bg-slate-100';
  } else if (isOver) {
    borderStyle = isValid ? 'border-green-400 ring-2 ring-green-200' : 'border-red-400 ring-2 ring-red-200';
    bgStyle = isValid ? 'bg-green-50' : 'bg-red-50';
  } else if (isSuggested) {
    borderStyle = 'border-cyan-400';
    bgStyle = 'bg-cyan-50/60';
  }

  const emptySlots = room.capacity - room.occupants.length;

  return (
    <motion.div
      ref={setNodeRef}
      className={`
        relative rounded-2xl border-2 p-3 transition-all
        flex flex-col h-full
        ${borderStyle} ${bgStyle}
        ${room.disabled ? 'opacity-60' : ''}
      `}
      animate={
        isSuggested
          ? {
              boxShadow: [
                '0 0 0 0 rgba(6,182,212,0)',
                '0 0 16px 4px rgba(6,182,212,0.4)',
                '0 0 0 0 rgba(6,182,212,0)',
              ],
            }
          : isPerfect
            ? {
                boxShadow: [
                  '0 0 0 0 rgba(245,158,11,0)',
                  '0 0 24px 8px rgba(245,158,11,0.5)',
                  '0 0 0 0 rgba(245,158,11,0)',
                ],
              }
            : {}
      }
      transition={
        isSuggested || isPerfect
          ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          : {}
      }
      onMouseEnter={(e) => onHover(room, e)}
      onMouseLeave={onHoverEnd}
    >
      {/* Room header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-bold text-slate-700">
          {room.label}
        </span>

        <div className={`w-2 h-2 rounded-full ${CARE_BADGE[room.maxCareLevel]}`} />
        <span className="text-xs text-slate-500 font-medium">
          {CARE_LEVEL_LABEL[room.maxCareLevel]}
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5 text-base text-slate-400">
          {room.isolationCapable && <span title="Isolation capable">🔒</span>}
          {room.equipmentAvailable !== 'none' && (
            <span title={room.equipmentAvailable}>
              {room.equipmentAvailable === 'oxygen' ? '🫁' : '🏥'}
            </span>
          )}
          <span className="text-lg" title={`Gender: ${room.genderPolicy}`}>
            {GENDER_LABEL[room.genderPolicy]}
          </span>
        </div>
      </div>

      {/* Capacity indicator */}
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: room.capacity }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border-2 transition-colors ${
              i < room.occupants.length
                ? 'bg-slate-400 border-slate-400'
                : 'bg-white border-slate-300'
            }`}
          />
        ))}
      </div>

      {/* Occupants */}
      <div className="flex-1 flex flex-col gap-2">
        {room.occupants.map((p) => (
          <PatientCard key={p.id} patient={p} source={room.id} compact />
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="border-2 border-dashed border-slate-200 rounded-lg py-3 text-center text-xs text-slate-300 font-medium"
          >
            Empty bed
          </div>
        ))}
      </div>

      {/* Disabled overlay */}
      {room.disabled && (
        <div className="absolute inset-0 rounded-2xl bg-slate-200/70 flex items-center justify-center">
          <span className="text-3xl">🧹</span>
        </div>
      )}

      {/* Full badge */}
      {isFull && !room.disabled && (
        <div className="absolute top-2 right-2 text-xs bg-slate-600 text-white px-2 py-0.5 rounded-md font-bold">
          FULL
        </div>
      )}

      {/* Perfect placement burst */}
      {isPerfect && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none flex items-center justify-center"
          initial={{ opacity: 1, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.8 }}
          onAnimationComplete={() => {
            useGameStore.getState().clearPerfectPlacement();
          }}
        >
          <span className="text-xl font-black text-amber-500 drop-shadow-lg">
            ★ PERFECT
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
