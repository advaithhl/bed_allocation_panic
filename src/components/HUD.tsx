import { motion } from 'framer-motion';
import { useGameStore } from '../engine/gameStore';
import { MAX_MISSES, PHASE_DISPLAY, SLOW_MO_COOLDOWN_MS, COMBO_CAP } from '../config';

export function HUD() {
  const score = useGameStore((s) => s.score);
  const combo = useGameStore((s) => s.combo);
  const gameClock = useGameStore((s) => s.gameClock);
  const difficultyPhase = useGameStore((s) => s.difficultyPhase);
  const missCount = useGameStore((s) => s.stats.missCount);
  const discharged = useGameStore((s) => s.stats.patientsDischarged);
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
      ? 'text-green-600 bg-green-50'
      : difficultyPhase === 'busyHours'
        ? 'text-amber-600 bg-amber-50'
        : 'text-red-600 bg-red-50';

  const cooldownRemaining = Math.max(0, slowMo.cooldownUntilGameTime - gameClock);
  const cooldownFraction = slowMo.active
    ? 1
    : cooldownRemaining > 0
      ? 1 - cooldownRemaining / SLOW_MO_COOLDOWN_MS
      : 1;
  const slowMoReady = !slowMo.active && cooldownRemaining <= 0;

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      {/* Left: Score + Combo */}
      <div className="flex items-center gap-5">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Score</div>
          <motion.div
            key={score}
            className="text-2xl font-black text-slate-800 tabular-nums"
            initial={{ scale: 1.15 }}
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
            <div className="text-xs text-slate-400 font-medium">Combo</div>
            <div className={`text-xl font-black ${combo >= COMBO_CAP ? 'text-purple-600' : 'text-indigo-600'}`}>
              x{Math.min(combo + 1, COMBO_CAP)}
            </div>
          </motion.div>
        )}
      </div>

      {/* Center: Phase + Timer */}
      <div className="flex flex-col items-center gap-0.5">
        <div className={`text-sm font-bold uppercase tracking-wide px-3 py-0.5 rounded-full ${phaseColor}`}>
          {PHASE_DISPLAY[difficultyPhase]}
        </div>
        <div className="text-lg text-slate-600 tabular-nums font-mono font-bold">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-4">
        {/* Discharged */}
        <div className="flex items-center gap-1 text-sm text-slate-500" title="Patients discharged">
          <span className="text-base">🏠</span>
          <span className="font-bold tabular-nums">{discharged}</span>
        </div>

        {/* Misses */}
        <div className="flex gap-1">
          {Array.from({ length: MAX_MISSES }).map((_, i) => (
            <span key={i} className={`text-xl transition-opacity ${i < missCount ? 'opacity-25' : ''}`}>
              {i < missCount ? '🖤' : '❤️'}
            </span>
          ))}
        </div>

        {/* Slow-mo */}
        <button
          onClick={() => useGameStore.getState().activateSlowMo()}
          disabled={!slowMoReady}
          className={`
            relative w-10 h-10 rounded-full border-2 flex items-center justify-center text-base
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
            className="px-3 py-2 rounded-lg bg-violet-100 text-violet-700 text-sm font-semibold hover:bg-violet-200 transition-colors"
          >
            🤖 Hint
          </button>
          {aiSuggestion && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 p-3 text-sm text-slate-600 w-52 z-50"
            >
              <span className="italic">"{aiSuggestion.message}"</span>
              <div className="mt-1.5 text-xs text-slate-400">
                Confidence: {aiSuggestion.confidence}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sound */}
        <button
          onClick={toggleSound}
          className="text-xl hover:scale-110 transition-transform"
          title="Toggle Sound"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    </div>
  );
}
