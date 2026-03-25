import { motion, AnimatePresence } from 'framer-motion';
import type { Room } from '../types/game';

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
          className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-3 w-52 pointer-events-none"
          style={{
            left: Math.min(position.x, window.innerWidth - 220),
            top: Math.min(position.y + 8, window.innerHeight - 200),
          }}
        >
          <div className="text-sm font-bold text-slate-700 mb-2">{room.label}</div>
          <div className="space-y-1 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Beds</span>
              <span className="font-medium text-slate-700">
                {room.occupants.length}/{room.capacity}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Max Care</span>
              <span className={`font-medium capitalize ${CARE_COLORS[room.maxCareLevel]}`}>
                {room.maxCareLevel}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Gender</span>
              <span className="font-medium">{GENDER_LABELS[room.genderPolicy]}</span>
            </div>
            <div className="flex justify-between">
              <span>Equipment</span>
              <span className="font-medium capitalize">
                {room.equipmentAvailable === 'none' ? '—' : room.equipmentAvailable}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Isolation</span>
              <span className="font-medium">{room.isolationCapable ? '✓ Yes' : '—'}</span>
            </div>
          </div>
          {room.occupants.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="text-[10px] text-slate-400 uppercase mb-1">Occupants</div>
              {room.occupants.map((p) => (
                <div key={p.id} className="text-xs text-slate-600 truncate">
                  {p.name}
                </div>
              ))}
            </div>
          )}
          {room.disabled && (
            <div className="mt-2 text-xs text-amber-600 font-medium">
              🧹 Currently being cleaned
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
