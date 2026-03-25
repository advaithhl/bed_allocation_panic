import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'bedpanic_tutorial_seen';

const STEPS = [
  {
    icon: '🖱️',
    title: 'Drag & Drop',
    text: 'Drag patients from the queue into matching rooms. You can also drag them back out or between rooms.',
  },
  {
    icon: '⚖️',
    title: 'Match Constraints',
    text: 'Care level, gender, equipment, and isolation must all match. Invalid reasons show while dragging.',
  },
  {
    icon: '⏳',
    title: 'Slow Motion',
    text: 'Press SPACE to slow time to 40% for 2 seconds. Use it wisely — 10 second cooldown!',
  },
  {
    icon: '❤️',
    title: 'Don\'t Miss!',
    text: '3 expired patients and your shift is over. Emergency patients expire instantly if unplaced!',
  },
];

export function TutorialOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key={step}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="text-5xl mb-4">{STEPS[step].icon}</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {STEPS[step].title}
            </h3>
            <p className="text-sm text-slate-500 mb-6">{STEPS[step].text}</p>

            <div className="flex gap-1 justify-center mb-4">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === step ? 'bg-indigo-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={dismiss}
                className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1"
              >
                Skip
              </button>
              <button
                onClick={next}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {step < STEPS.length - 1 ? 'Next' : 'Got it!'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
