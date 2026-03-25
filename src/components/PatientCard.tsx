import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { Patient, DragData } from '../types/game';
import { STAY_DURATION_MS, URGENT_TIMER_MS } from '../config';
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
  low: 'bg-green-500 text-white',
  medium: 'bg-amber-500 text-white',
  high: 'bg-red-500 text-white',
};

const CARE_LABEL = { low: 'LOW', medium: 'MED', high: 'HIGH' };

const GENDER_ICONS: Record<string, string> = {
  male: '♂',
  female: '♀',
};

const EQUIP_ICONS: Record<string, string> = {
  none: '',
  oxygen: '🫁',
  intensive: '🏥',
};

const DISCHARGE_BAR_COLOR = {
  low: 'bg-green-400',
  medium: 'bg-amber-400',
  high: 'bg-red-400',
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
  const isUrgent = timeLeft < URGENT_TIMER_MS;

  if (compact) {
    const isPlaced = patient.dischargeAtGameTime > 0;
    const maxStay = STAY_DURATION_MS[patient.careLevel];
    const dischargeLeft = isPlaced
      ? Math.max(0, patient.dischargeAtGameTime - gameClock)
      : maxStay;
    const dischargeFraction = isPlaced ? dischargeLeft / maxStay : 1;

    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        layout
        layoutId={`room-${patient.id}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, y: -8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`
          relative text-sm px-2.5 py-1.5 rounded-lg border-2 cursor-grab active:cursor-grabbing select-none
          flex items-center gap-2 overflow-hidden
          ${CARE_COLORS[patient.careLevel]}
          ${isDragging ? 'opacity-40' : 'hover:shadow-sm'}
        `}
      >
        <span className="truncate flex-1 font-medium">{patient.name.split(' ').slice(0, 2).join(' ')}</span>
        <span className="text-base opacity-70">{GENDER_ICONS[patient.gender]}</span>
        {isPlaced ? (
          <span className="text-xs font-mono tabular-nums text-slate-400">
            {Math.ceil(dischargeLeft / 1000)}s
          </span>
        ) : (
          <span className={`text-xs font-mono tabular-nums ${isUrgent ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
            {timeLeftSec}s
          </span>
        )}
        {/* Discharge progress bar */}
        {isPlaced && (
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <div
              className={`h-full transition-all duration-300 ${DISCHARGE_BAR_COLOR[patient.careLevel]}`}
              style={{ width: `${Math.min(100, dischargeFraction * 100)}%` }}
            />
          </div>
        )}
      </motion.div>
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
        rounded-xl border-2 p-3 shadow-sm transition-shadow
        ${CARE_COLORS[patient.careLevel]}
        ${isDragging ? 'opacity-40 shadow-lg' : 'hover:shadow-md'}
        ${patient.isEmergency ? 'ring-2 ring-red-500 ring-offset-2' : ''}
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
        <div className="absolute -top-2.5 -right-2.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
          SOS
        </div>
      )}

      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${CARE_BADGES[patient.careLevel]}`}>
          {CARE_LABEL[patient.careLevel]}
        </span>
        <span className="text-sm font-bold truncate flex-1 text-slate-800">
          {patient.name}
        </span>
        <span className="text-lg">{GENDER_ICONS[patient.gender]}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          {patient.isolationRequired && <span title="Needs isolation">🔒</span>}
          {EQUIP_ICONS[patient.equipment] && (
            <span title={patient.equipment}>{EQUIP_ICONS[patient.equipment]}</span>
          )}
        </div>
        <div className={`text-sm font-mono font-bold tabular-nums ${isUrgent ? 'text-red-600' : 'text-slate-500'}`}>
          {timeLeftSec}s
        </div>
      </div>
    </motion.div>
  );
}
