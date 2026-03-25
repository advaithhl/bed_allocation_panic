import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { Room, ValidationResult } from '../types/game';
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
  low: 'bg-green-50/50',
  medium: 'bg-amber-50/50',
  high: 'bg-red-50/50',
};

const CARE_BORDER = {
  low: 'border-green-200',
  medium: 'border-amber-200',
  high: 'border-red-200',
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
    bgStyle = 'bg-cyan-50/50';
  }

  return (
    <motion.div
      ref={setNodeRef}
      className={`
        relative rounded-xl border-2 p-2 transition-all min-h-[120px]
        flex flex-col
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
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-slate-500 truncate flex-1">
          {room.label}
        </span>
        <div className="flex items-center gap-0.5 text-[10px] text-slate-400">
          {room.isolationCapable && <span title="Isolation">🔒</span>}
          {room.equipmentAvailable !== 'none' && (
            <span title={room.equipmentAvailable}>
              {room.equipmentAvailable === 'oxygen' ? '🫁' : '🏥'}
            </span>
          )}
          <span className="ml-0.5">
            {room.genderPolicy === 'male' ? '♂' : room.genderPolicy === 'female' ? '♀' : '⚤'}
          </span>
        </div>
      </div>

      {/* Capacity dots */}
      <div className="flex gap-1 mb-1.5">
        {Array.from({ length: room.capacity }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < room.occupants.length
                ? 'bg-slate-400'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Occupants */}
      <div className="flex-1 flex flex-col gap-1">
        {room.occupants.map((p) => (
          <PatientCard key={p.id} patient={p} source={room.id} compact />
        ))}
      </div>

      {/* Room disabled overlay */}
      {room.disabled && (
        <div className="absolute inset-0 rounded-xl bg-slate-200/60 flex items-center justify-center">
          <span className="text-2xl">🧹</span>
        </div>
      )}

      {/* Full indicator */}
      {isFull && !room.disabled && (
        <div className="absolute top-1 right-1 text-[8px] bg-slate-500 text-white px-1 rounded">
          FULL
        </div>
      )}

      {/* Perfect placement burst */}
      {isPerfect && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none flex items-center justify-center"
          initial={{ opacity: 1, scale: 0.5 }}
          animate={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.8 }}
          onAnimationComplete={() => {
            useGameStore.getState().clearPerfectPlacement();
          }}
        >
          <span className="text-lg font-black text-amber-500 drop-shadow-lg">
            ★ PERFECT
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
