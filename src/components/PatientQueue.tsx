import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence } from 'framer-motion';
import { PatientCard } from './PatientCard';
import { PressureBar } from './PressureBar';
import { useGameStore } from '../engine/gameStore';
import { MAX_VISIBLE_QUEUE } from '../types/game';

export function PatientQueue() {
  const queue = useGameStore((s) => s.queue);

  const { setNodeRef, isOver } = useDroppable({ id: 'queue-drop-zone' });

  const visible = queue.slice(0, MAX_VISIBLE_QUEUE);
  const overflow = Math.max(0, queue.length - MAX_VISIBLE_QUEUE);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col gap-2 p-3 rounded-2xl transition-colors min-h-0
        ${isOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-white/50'}
      `}
    >
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
        <span>Waiting Room</span>
        <span className="text-slate-400">{queue.length}</span>
      </div>

      <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {visible.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              source="queue"
            />
          ))}
        </AnimatePresence>

        {overflow > 0 && (
          <div className="text-center text-xs text-slate-400 font-semibold py-1 bg-slate-100 rounded-lg">
            +{overflow} more waiting...
          </div>
        )}

        {queue.length === 0 && (
          <div className="text-center text-xs text-slate-300 py-8">
            All clear!
          </div>
        )}
      </div>

      <PressureBar />
    </div>
  );
}
