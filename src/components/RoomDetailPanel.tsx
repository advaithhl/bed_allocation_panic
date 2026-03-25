import { motion, AnimatePresence } from 'framer-motion';
import type { Room } from '../types/game';
import { CARE_LEVEL_LABEL } from '../types/game';

interface Props {
  room: Room | null;
  position: { x: number; y: number } | null;
}

const CARE_COLORS = {
  low: 'text-green-600',
  medium: 'text-amber-600',
  high: 'text-red-600',
};

const GENDER_LABELS: Record<string, string> = {
  male: '♂ Male only',
  female: '♀ Female only',
  mixed: '⚤ Mixed',
};

export function RoomDetailPanel({ room, position }: Props) {
  return (
    <AnimatePresence>
      {room && position && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 w-60 pointer-events-none"
          style={{
            left: Math.min(position.x + 12, window.innerWidth - 260),
            top: Math.min(position.y + 12, window.innerHeight - 260),
          }}
        >
          <div className="text-base font-bold text-slate-700 mb-3">{room.label}</div>
          <div className="space-y-2 text-sm text-slate-500">
            <div className="flex justify-between">
              <span>Beds</span>
              <span className="font-semibold text-slate-700">
                {room.occupants.length} / {room.capacity}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Max Care</span>
              <span className={`font-semibold capitalize ${CARE_COLORS[room.maxCareLevel]}`}>
                {CARE_LEVEL_LABEL[room.maxCareLevel]}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Gender</span>
              <span className="font-semibold">{GENDER_LABELS[room.genderPolicy]}</span>
            </div>
            <div className="flex justify-between">
              <span>Equipment</span>
              <span className="font-semibold capitalize">
                {room.equipmentAvailable === 'none' ? '—' : room.equipmentAvailable}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Isolation</span>
              <span className="font-semibold">{room.isolationCapable ? '✓ Yes' : '—'}</span>
            </div>
          </div>
          {room.occupants.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1.5 font-medium">Occupants</div>
              {room.occupants.map((p) => (
                <div key={p.id} className="text-sm text-slate-600 mb-1">
                  <span className="font-medium">{p.name}</span>
                  {p.funTrait && (
                    <span className="text-xs text-slate-400 ml-1.5">{p.funTrait}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {room.disabled && (
            <div className="mt-3 text-sm text-amber-600 font-semibold">
              🧹 Currently being cleaned
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
