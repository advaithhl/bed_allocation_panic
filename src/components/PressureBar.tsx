import { motion } from 'framer-motion';
import { useGameStore } from '../engine/gameStore';
import { PRESSURE_BAR_MAX_QUEUE, PRESSURE_BAR_AMBER, PRESSURE_BAR_RED } from '../config';

export function PressureBar() {
  const queueLength = useGameStore((s) => s.queue.length);
  const fill = Math.min(1, queueLength / PRESSURE_BAR_MAX_QUEUE);

  const color =
    fill < PRESSURE_BAR_AMBER ? 'bg-green-400' : fill < PRESSURE_BAR_RED ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        animate={{ width: `${fill * 100}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </div>
  );
}
