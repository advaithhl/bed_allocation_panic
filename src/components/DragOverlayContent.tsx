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

const CARE_BADGES = {
  low: 'bg-green-500 text-white',
  medium: 'bg-amber-500 text-white',
  high: 'bg-red-500 text-white',
};

const CARE_LABEL = { low: 'LOW', medium: 'MED', high: 'HIGH' };
const GENDER_ICONS: Record<string, string> = { male: '♂', female: '♀' };

export function DragOverlayContent({ patient, validation }: Props) {
  return (
    <div className="pointer-events-none">
      <div
        className={`
          rounded-xl border-2 p-3 shadow-xl
          ${CARE_COLORS[patient.careLevel]}
          ${patient.isEmergency ? 'ring-2 ring-red-500' : ''}
        `}
        style={{ width: 220 }}
      >
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${CARE_BADGES[patient.careLevel]}`}>
            {CARE_LABEL[patient.careLevel]}
          </span>
          <span className="text-sm font-bold truncate flex-1">{patient.name}</span>
          <span className="text-lg">{GENDER_ICONS[patient.gender]}</span>
        </div>
      </div>

      <AnimatePresence>
        {validation && !validation.valid && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 flex flex-col gap-1"
          >
            {validation.reasons.map((reason, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-lg"
              >
                <span className="text-sm">{reason.icon}</span>
                <span>{reason.text}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
