import { motion, AnimatePresence } from 'framer-motion';
import type { Patient, ValidationResult } from '../types/game';

interface Props {
  patient: Patient;
  validation: ValidationResult | null;
}

const CARE_COLORS = {
  low: 'border-green-400 bg-green-50',
  medium: 'border-amber-400 bg-amber-50',
  high: 'border-red-400 bg-red-50',
};

export function DragOverlayContent({ patient, validation }: Props) {
  return (
    <div className="pointer-events-none">
      <div
        className={`
          rounded-xl border-2 p-2.5 shadow-xl
          ${CARE_COLORS[patient.careLevel]}
          ${patient.isEmergency ? 'ring-2 ring-red-500' : ''}
        `}
        style={{ width: 180 }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-semibold truncate">{patient.name}</span>
        </div>
        <div className="text-[10px] text-slate-500">{patient.funTrait}</div>
      </div>

      <AnimatePresence>
        {validation && !validation.valid && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 flex flex-col gap-0.5"
          >
            {validation.reasons.map((reason, i) => (
              <div
                key={i}
                className="flex items-center gap-1 bg-red-100 text-red-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
              >
                <span>{reason.icon}</span>
                <span>{reason.text}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
