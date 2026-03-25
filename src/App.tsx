import { useGameStore } from './engine/gameStore';
import { StartScreen } from './components/StartScreen';
import { Game } from './components/Game';
import { ShiftOverScreen } from './components/ShiftOverScreen';

function App() {
  const phase = useGameStore((s) => s.phase);

  if (phase === 'start') {
    return <StartScreen />;
  }

  return (
    <>
      <Game />
      {phase === 'shiftOver' && <ShiftOverScreen />}
    </>
  );
}

export default App;
