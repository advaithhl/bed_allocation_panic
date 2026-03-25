import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../engine/gameStore';
import { PHASE_DISPLAY } from '../types/game';
import { useEffect, useState } from 'react';

export function PhaseTransitionBanner() {
  const phaseTransition = useGameStore((s) => s.phaseTransition);
  const clearPhaseTransition = useGameStore((s) => s.clearPhaseTransition);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (phaseTransition) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        clearPhaseTransition();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [phaseTransition, clearPhaseTransition]);

  const phaseColor =
    phaseTransition?.phase === 'busyHours'
      ? 'from-amber-500 to-orange-500'
      : 'from-red-500 to-rose-600';

  return (
    <AnimatePresence>
      {visible && phaseTransition && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`
              bg-gradient-to-r ${phaseColor}
              text-white text-3xl font-black uppercase tracking-wider
              px-10 py-4 rounded-2xl shadow-2xl
            `}
          >
            {PHASE_DISPLAY[phaseTransition.phase]}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
