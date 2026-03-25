import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../engine/gameStore';

export function EventPopup() {
  const activeEvents = useGameStore((s) => s.activeEvents);
  const gameClock = useGameStore((s) => s.gameClock);

  // Show only the two most recent, still-active events
  const recentEvents = activeEvents
    .filter((e) => gameClock - e.startedAtGameTime < 4000)
    .slice(-2);

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {recentEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`
              px-4 py-2 rounded-xl shadow-lg backdrop-blur-sm text-sm font-semibold
              max-w-md text-center
              ${event.type === 'emergency'
                ? 'bg-red-500/90 text-white'
                : event.type === 'inspection'
                  ? 'bg-amber-500/90 text-white'
                  : 'bg-slate-800/80 text-white'
              }
            `}
          >
            {event.displayText}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
