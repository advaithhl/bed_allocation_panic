import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence } from 'framer-motion';
import { PatientCard } from './PatientCard';
import { PressureBar } from './PressureBar';
import { useGameStore } from '../engine/gameStore';
import { MAX_VISIBLE_QUEUE } from '../config';

export function PatientQueue() {
  const queue = useGameStore((s) => s.queue);

  const { setNodeRef, isOver } = useDroppable({ id: 'queue-drop-zone' });

  const visible = queue.slice(0, MAX_VISIBLE_QUEUE);
  const overflow = Math.max(0, queue.length - MAX_VISIBLE_QUEUE);

  return (
    <div
      ref={setNodeRef}
      className={`
        flex flex-col gap-3 p-4 rounded-2xl transition-colors h-full
        ${isOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-white/60'}
      `}
    >
      <div className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
        <span>Waiting Room</span>
        <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {queue.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 flex-1 overflow-hidden">
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
          <div className="text-center text-sm text-slate-400 font-semibold py-2 bg-slate-100 rounded-xl">
            +{overflow} more waiting...
          </div>
        )}

        {queue.length === 0 && (
          <div className="text-center text-sm text-slate-300 py-10 font-medium">
            All clear!
          </div>
        )}
      </div>

      <PressureBar />
    </div>
  );
}
