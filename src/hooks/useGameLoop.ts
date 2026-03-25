import { useEffect, useRef } from 'react';
import { useGameStore } from '../engine/gameStore';

export function useGameLoop() {
  const phase = useGameStore((s) => s.phase);
  const timeScale = useGameStore((s) => s.timeScale);
  const tick = useGameStore((s) => s.tick);
  const lastRealTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  // Store current values in refs to avoid stale closures
  const timeScaleRef = useRef(timeScale);
  timeScaleRef.current = timeScale;
  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    if (phase !== 'playing') {
      lastRealTimeRef.current = 0;
      return;
    }

    const loop = (now: number) => {
      if (lastRealTimeRef.current === 0) {
        lastRealTimeRef.current = now;
      }

      const realDeltaMs = Math.min(now - lastRealTimeRef.current, 100);
      lastRealTimeRef.current = now;

      const gameDeltaMs = realDeltaMs * timeScaleRef.current;
      if (gameDeltaMs > 0) {
        tickRef.current(gameDeltaMs);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);
}
