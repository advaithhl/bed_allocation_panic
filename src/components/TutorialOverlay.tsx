import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'bedpanic_tutorial_seen';

const STEPS = [
  {
    icon: '🖱️',
    title: 'Drag Patients to Beds',
    text: 'Drag patients from the waiting room on the left into a matching room on the right. You can drag them back or between rooms too.',
  },
  {
    icon: '🎨',
    title: 'Match the Colors',
    text: 'Each patient and room has a care level: green (low), amber (medium), or red (high). A patient\'s care level must not exceed the room\'s max.',
  },
  {
    icon: '♂♀',
    title: 'Check Gender & Icons',
    text: 'Some rooms are male-only or female-only. Watch for 🔒 (isolation) and equipment icons — they must match too. Hover rooms for full details.',
  },
  {
    icon: '⏳',
    title: 'Take It Slow',
    text: 'The first phase is gentle — no emergencies, no surprises. Place patients before their timer runs out. Press SPACE to slow time!',
  },
];

export function needsTutorial(): boolean {
  return !localStorage.getItem(STORAGE_KEY);
}

interface Props {
  onDismiss: () => void;
}

export function TutorialOverlay({ onDismiss }: Props) {
  const [step, setStep] = useState(0);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    onDismiss();
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
      <motion.div
        className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          key={step}
          className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="text-6xl mb-5">{STEPS[step].icon}</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">
            {STEPS[step].title}
          </h3>
          <p className="text-base text-slate-500 mb-8 leading-relaxed">{STEPS[step].text}</p>

          <div className="flex gap-1.5 justify-center mb-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === step ? 'bg-indigo-500' : i < step ? 'bg-indigo-300' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={dismiss}
              className="text-sm text-slate-400 hover:text-slate-600 px-4 py-2 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={next}
              className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-base"
            >
              {step < STEPS.length - 1 ? 'Next' : 'Start Shift!'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
