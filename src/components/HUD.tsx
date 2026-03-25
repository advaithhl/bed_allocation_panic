import { motion } from 'framer-motion';
import { useGameStore } from '../engine/gameStore';
import { MAX_MISSES, PHASE_DISPLAY, SLOW_MO_COOLDOWN_MS, COMBO_CAP } from '../types/game';

export function HUD() {
  const score = useGameStore((s) => s.score);
  const combo = useGameStore((s) => s.combo);
  const gameClock = useGameStore((s) => s.gameClock);
  const difficultyPhase = useGameStore((s) => s.difficultyPhase);
  const missCount = useGameStore((s) => s.stats.missCount);
  const slowMo = useGameStore((s) => s.slowMo);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const requestAISuggestion = useGameStore((s) => s.requestAISuggestion);
  const aiSuggestion = useGameStore((s) => s.aiSuggestion);
  const clearAISuggestion = useGameStore((s) => s.clearAISuggestion);

  const minutes = Math.floor(gameClock / 60000);
  const seconds = Math.floor((gameClock % 60000) / 1000);

  const phaseColor =
    difficultyPhase === 'calmShift'
      ? 'text-green-600'
      : difficultyPhase === 'busyHours'
        ? 'text-amber-600'
        : 'text-red-600';

  const cooldownRemaining = Math.max(
    0,
    slowMo.cooldownUntilGameTime - gameClock,
  );
  const cooldownFraction = slowMo.active
    ? 1
    : cooldownRemaining > 0
      ? 1 - cooldownRemaining / SLOW_MO_COOLDOWN_MS
      : 1;
  const slowMoReady = !slowMo.active && cooldownRemaining <= 0;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      {/* Left: Score + Combo */}
      <div className="flex items-center gap-4">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Score</div>
          <motion.div
            key={score}
            className="text-xl font-black text-slate-800 tabular-nums"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {score.toLocaleString()}
          </motion.div>
        </div>

        {combo > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="text-xs text-slate-400">Combo</div>
            <div className={`text-lg font-black ${combo >= COMBO_CAP ? 'text-purple-600' : 'text-indigo-600'}`}>
              x{Math.min(combo + 1, COMBO_CAP)}
            </div>
          </motion.div>
        )}
      </div>

      {/* Center: Phase + Timer */}
      <div className="flex flex-col items-center">
        <div className={`text-sm font-bold uppercase tracking-wide ${phaseColor}`}>
          {PHASE_DISPLAY[difficultyPhase]}
        </div>
        <div className="text-xs text-slate-400 tabular-nums">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-3">
        {/* Misses */}
        <div className="flex gap-0.5">
          {Array.from({ length: MAX_MISSES }).map((_, i) => (
            <span key={i} className={`text-lg ${i < missCount ? 'opacity-30' : ''}`}>
              {i < missCount ? '🖤' : '❤️'}
            </span>
          ))}
        </div>

        {/* Slow-mo */}
        <button
          onClick={() => useGameStore.getState().activateSlowMo()}
          disabled={!slowMoReady}
          className={`
            relative w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm
            transition-all
            ${slowMoReady
              ? 'border-indigo-400 bg-indigo-50 hover:bg-indigo-100 cursor-pointer'
              : slowMo.active
                ? 'border-indigo-500 bg-indigo-200'
                : 'border-slate-300 bg-slate-100 cursor-not-allowed'
            }
          `}
          title="Slow-Mo (SPACE)"
        >
          ⏳
          {!slowMoReady && !slowMo.active && (
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="rgb(99 102 241)"
                strokeWidth="2"
                strokeDasharray={`${cooldownFraction * 100} 100`}
                strokeLinecap="round"
                opacity="0.4"
              />
            </svg>
          )}
        </button>

        {/* AI Suggest */}
        <div className="relative">
          <button
            onClick={() => {
              if (aiSuggestion) {
                clearAISuggestion();
              } else {
                requestAISuggestion();
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-violet-100 text-violet-700 text-xs font-semibold hover:bg-violet-200 transition-colors"
          >
            🤖 Suggest
          </button>
          {aiSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 p-2 text-xs text-slate-600 w-44 z-50"
            >
              <span className="italic">"{aiSuggestion.message}"</span>
              <div className="mt-1 text-[10px] text-slate-400">
                Confidence: {aiSuggestion.confidence}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sound */}
        <button
          onClick={toggleSound}
          className="text-lg hover:scale-110 transition-transform"
          title="Toggle Sound"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    </div>
  );
}
