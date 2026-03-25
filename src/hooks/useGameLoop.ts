import { useEffect, useRef } from 'react';
import { useGameStore } from '../engine/gameStore';

export function useGameLoop() {
  const phase = useGameStore((s) => s.phase);
  const lastRealTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (phase !== 'playing') {
      lastRealTimeRef.current = 0;
      return;
    }

    const loop = (now: number) => {
      const { paused, timeScale, tick } = useGameStore.getState();

      if (lastRealTimeRef.current === 0 || paused) {
        lastRealTimeRef.current = now;
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const realDeltaMs = Math.min(now - lastRealTimeRef.current, 100);
      lastRealTimeRef.current = now;

      const gameDeltaMs = realDeltaMs * timeScale;
      if (gameDeltaMs > 0) {
        tick(gameDeltaMs);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [phase]);
}
