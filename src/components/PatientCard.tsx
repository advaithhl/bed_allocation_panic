import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { Patient, DragData } from '../types/game';
import { useGameStore } from '../engine/gameStore';

interface Props {
  patient: Patient;
  source: 'queue' | string;
  compact?: boolean;
}

const CARE_COLORS = {
  low: 'border-green-400 bg-green-50',
  medium: 'border-amber-400 bg-amber-50',
  high: 'border-red-400 bg-red-50',
};

const CARE_BADGES = {
  low: 'bg-green-400',
  medium: 'bg-amber-400',
  high: 'bg-red-400',
};

const GENDER_ICONS: Record<string, string> = {
  male: '♂',
  female: '♀',
};

const EQUIP_ICONS: Record<string, string> = {
  none: '',
  oxygen: '🫁',
  intensive: '🏥',
};

export function PatientCard({ patient, source, compact }: Props) {
  const gameClock = useGameStore((s) => s.gameClock);
  const dragData: DragData = { patientId: patient.id, source };

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: patient.id,
      data: dragData,
    });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const timeLeft = Math.max(0, patient.expiresAtGameTime - gameClock);
  const timeLeftSec = Math.ceil(timeLeft / 1000);
  const isUrgent = timeLeft < 5000;

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          text-xs px-1.5 py-1 rounded border cursor-grab active:cursor-grabbing select-none
          flex items-center gap-1
          ${CARE_COLORS[patient.careLevel]}
          ${isDragging ? 'opacity-40' : 'hover:shadow-sm'}
        `}
      >
        <span className="truncate flex-1">{patient.name.split(' ').slice(0, 2).join(' ')}</span>
        <span className="text-[10px] opacity-60">{GENDER_ICONS[patient.gender]}</span>
      </div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative cursor-grab active:cursor-grabbing select-none
        rounded-xl border-2 p-2.5 shadow-sm transition-shadow
        ${CARE_COLORS[patient.careLevel]}
        ${isDragging ? 'opacity-40 shadow-lg' : 'hover:shadow-md'}
        ${patient.isEmergency ? 'ring-2 ring-red-500 ring-offset-1' : ''}
        ${isUrgent && !patient.isEmergency ? 'animate-pressure-pulse' : ''}
      `}
      layout
      layoutId={`queue-${patient.id}`}
      initial={{ opacity: 0, scale: 0.8, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {patient.isEmergency && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          SOS
        </div>
      )}

      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-2 h-2 rounded-full ${CARE_BADGES[patient.careLevel]}`} />
        <span className="text-xs font-semibold truncate flex-1">
          {patient.name}
        </span>
        <span className="text-sm">{GENDER_ICONS[patient.gender]}</span>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-slate-500">
        {patient.isolationRequired && <span title="Isolation">🔒</span>}
        {EQUIP_ICONS[patient.equipment] && (
          <span title={patient.equipment}>{EQUIP_ICONS[patient.equipment]}</span>
        )}
        <span className="truncate opacity-70">{patient.funTrait}</span>
      </div>

      <div className={`mt-1 text-[10px] font-mono ${isUrgent ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
        {timeLeftSec}s
      </div>
    </motion.div>
  );
}
