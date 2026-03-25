import { motion } from 'framer-motion';
import { useGameStore } from '../engine/gameStore';
import { PHASE_DISPLAY, LEADERBOARD_MAX_ENTRIES, SHIFT_OVER_SCORE_HIGH, SHIFT_OVER_SCORE_MEDIUM } from '../config';
import { SHIFT_OVER_MESSAGES } from '../data/names';
import { useEffect } from 'react';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getLeaderboard(): { score: number; date: string }[] {
  try {
    return JSON.parse(localStorage.getItem('bedpanic_leaderboard') || '[]');
  } catch {
    return [];
  }
}

function saveToLeaderboard(score: number) {
  const board = getLeaderboard();
  board.push({ score, date: new Date().toLocaleDateString() });
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem(
    'bedpanic_leaderboard',
    JSON.stringify(board.slice(0, LEADERBOARD_MAX_ENTRIES)),
  );
}

export function ShiftOverScreen() {
  const stats = useGameStore((s) => s.stats);
  const score = useGameStore((s) => s.score);
  const shiftOverReason = useGameStore((s) => s.shiftOverReason);
  const startGame = useGameStore((s) => s.startGame);

  useEffect(() => {
    saveToLeaderboard(score);
  }, [score]);

  const messagePool =
    score >= SHIFT_OVER_SCORE_HIGH
      ? SHIFT_OVER_MESSAGES.high
      : score >= SHIFT_OVER_SCORE_MEDIUM
        ? SHIFT_OVER_MESSAGES.medium
        : SHIFT_OVER_MESSAGES.low;
  const personalityMessage = pick(messagePool);

  const statItems = [
    { label: 'Final Score', value: score.toLocaleString(), big: true },
    { label: 'Patients Placed', value: `${stats.patientsPlaced} / ${stats.totalSpawned}` },
    { label: 'Discharged', value: String(stats.patientsDischarged) },
    { label: 'Efficiency', value: `${stats.efficiency}%` },
    { label: 'Perfect Placements', value: String(stats.perfectPlacements) },
    { label: 'Best Combo', value: `x${stats.bestCombo}` },
    { label: 'Rearrangements', value: String(stats.rearrangements) },
    { label: 'Phase Reached', value: PHASE_DISPLAY[stats.highestPhaseReached] },
    { label: 'Strikes Used', value: `${stats.missCount} / 3` },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
      >
        <h2 className="text-3xl font-black text-center text-slate-800 mb-1">
          Shift Over 🏥
        </h2>
        <p className="text-center text-sm text-slate-400 mb-2">
          {shiftOverReason}
        </p>
        <p className="text-center text-sm text-indigo-600 italic mb-6">
          "{personalityMessage}"
        </p>

        <div className="space-y-2 mb-6">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className={`flex justify-between items-center ${
                item.big
                  ? 'py-2 border-b border-slate-100'
                  : 'py-0.5'
              }`}
            >
              <span className={`text-slate-500 ${item.big ? 'font-semibold' : 'text-xs'}`}>
                {item.label}
              </span>
              <span
                className={`font-bold tabular-nums ${
                  item.big ? 'text-2xl text-indigo-600' : 'text-sm text-slate-700'
                }`}
              >
                {item.value}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={startGame}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(99,102,241,0)',
              '0 0 20px 4px rgba(99,102,241,0.3)',
              '0 0 0 0 rgba(99,102,241,0)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Try Another Shift
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
