import { useEffect } from 'react';
import { useGameStore } from '../engine/gameStore';

export function useSlowMo() {
  const activateSlowMo = useGameStore((s) => s.activateSlowMo);
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    if (phase !== 'playing') return;

    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        activateSlowMo();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, activateSlowMo]);
}
