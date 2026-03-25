import { motion } from 'framer-motion';

interface Props {
  onBack: () => void;
}

function getLeaderboard(): { score: number; date: string }[] {
  try {
    return JSON.parse(localStorage.getItem('bedpanic_leaderboard') || '[]');
  } catch {
    return [];
  }
}

export function Leaderboard({ onBack }: Props) {
  const entries = getLeaderboard();

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <motion.div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-black text-slate-800 mb-4 text-center">
          🏆 Leaderboard
        </h2>

        {entries.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">
            No shifts completed yet. Get in there!
          </p>
        ) : (
          <div className="space-y-1.5">
            {entries.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400 w-6">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 tabular-nums">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{entry.date}</span>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={onBack}
          className="mt-4 w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          ← Back
        </button>
      </motion.div>
    </div>
  );
}
