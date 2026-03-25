import { motion } from 'framer-motion';
import { useGameStore } from '../engine/gameStore';
import { Leaderboard } from './Leaderboard';
import { useState } from 'react';
import { FACILITY_NAMES } from '../data/names';

export function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const facilityName =
    FACILITY_NAMES[Math.floor(Math.random() * FACILITY_NAMES.length)];

  if (showLeaderboard) {
    return <Leaderboard onBack={() => setShowLeaderboard(false)} />;
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ rotate: [0, -5, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          🛏️
        </motion.div>

        <h1 className="text-4xl font-black text-slate-800 mb-2">
          Bed Allocation
          <br />
          <span className="text-red-500">Panic</span>
        </h1>

        <p className="text-slate-500 text-sm mb-1">
          Welcome to <span className="font-semibold">{facilityName}</span>
        </p>
        <p className="text-slate-400 text-xs mb-8">
          Drag patients into beds. Don't let anyone wait too long.
          <br />
          Try not to panic. (You will panic.)
        </p>

        <div className="flex flex-col gap-3 items-center">
          <motion.button
            onClick={startGame}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Shift
          </motion.button>

          <button
            onClick={() => setShowLeaderboard(true)}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            View Leaderboard
          </button>
        </div>

        <div className="mt-10 text-[10px] text-slate-300 space-y-1">
          <p>🖱️ Drag & drop patients into rooms</p>
          <p>⌨️ SPACE for slow-motion</p>
          <p>🤖 AI suggestions may or may not help</p>
        </div>
      </motion.div>
    </div>
  );
}
