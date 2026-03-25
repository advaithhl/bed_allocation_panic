import { useState } from 'react';
import { useGameStore } from './engine/gameStore';
import { StartScreen } from './components/StartScreen';
import { Game } from './components/Game';
import { ShiftOverScreen } from './components/ShiftOverScreen';
import { TutorialOverlay, needsTutorial } from './components/TutorialOverlay';

function App() {
  const phase = useGameStore((s) => s.phase);
  const startGame = useGameStore((s) => s.startGame);
  const [showingTutorial, setShowingTutorial] = useState(false);

  const handleStartClick = () => {
    if (needsTutorial()) {
      setShowingTutorial(true);
    } else {
      startGame();
    }
  };

  const handleTutorialDismiss = () => {
    setShowingTutorial(false);
    startGame();
  };

  if (showingTutorial) {
    return <TutorialOverlay onDismiss={handleTutorialDismiss} />;
  }

  if (phase === 'start') {
    return <StartScreen onStart={handleStartClick} />;
  }

  return (
    <>
      <Game />
      {phase === 'shiftOver' && <ShiftOverScreen />}
    </>
  );
}

export default App;
