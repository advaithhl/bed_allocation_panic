import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../engine/gameStore';

export function SlowMoOverlay() {
  const slowMoActive = useGameStore((s) => s.slowMo.active);

  return (
    <AnimatePresence>
      {slowMoActive && (
        <motion.div
          className="fixed inset-0 z-30 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(99, 102, 241, 0.08) 100%)',
            backdropFilter: 'blur(1px)',
          }}
        >
          <div className="absolute top-20 left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.6, 1, 0.6], scale: 1 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-indigo-400 text-sm font-bold uppercase tracking-widest"
            >
              ⏳ Slow Motion
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
