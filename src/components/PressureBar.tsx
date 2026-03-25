import { motion } from 'framer-motion';
import { useGameStore } from '../engine/gameStore';

const MAX_QUEUE_FOR_BAR = 8;

export function PressureBar() {
  const queueLength = useGameStore((s) => s.queue.length);
  const fill = Math.min(1, queueLength / MAX_QUEUE_FOR_BAR);

  const color =
    fill < 0.4 ? 'bg-green-400' : fill < 0.7 ? 'bg-amber-400' : 'bg-red-500';

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
