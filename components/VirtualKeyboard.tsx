import React from 'react';
import { LetterStatus } from '../types';
import { sfx } from '../utils/audio';

interface KeyboardProps {
  onChar: (char: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  letterStates: Record<string, LetterStatus>;
}

const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
];

export const VirtualKeyboard: React.FC<KeyboardProps> = ({ onChar, onDelete, onEnter, letterStates }) => {
  const getKeyStyle = (key: string) => {
    const status = letterStates[key] || LetterStatus.TBD;
    // Darker, more modern keys
    const base = "h-14 rounded-lg font-bold text-sm transition-all active:scale-95 select-none flex items-center justify-center shadow-md";
    
    if (key === 'ENTER') return `${base} bg-fuchsia-700 text-white px-2 text-[10px] md:text-xs`;
    if (key === 'DEL') return `${base} bg-gray-700 text-white px-2`;

    switch (status) {
      case LetterStatus.CORRECT: return `${base} bg-green-600 text-white flex-1 shadow-[0_0_10px_rgba(34,197,94,0.4)]`;
      case LetterStatus.PRESENT: return `${base} bg-yellow-600 text-white flex-1`;
      case LetterStatus.ABSENT: return `${base} bg-gray-900 text-gray-600 flex-1 border border-gray-800`;
      default: return `${base} bg-gray-800 text-gray-200 flex-1 hover:bg-gray-700`;
    }
  };

  const handlePress = (key: string) => {
    if (key === 'ENTER') {
      onEnter();
      sfx.playClick();
    } else if (key === 'DEL') {
      onDelete();
      sfx.playClick();
    } else {
      onChar(key);
      sfx.playType();
    }
  };

  return (
    // Hidden on MD (desktop) screens as requested
    <div className="w-full max-w-md mx-auto flex flex-col gap-2 p-2 md:hidden">
      {KEYS.map((row, i) => (
        <div key={i} className="flex gap-1 justify-center w-full">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => handlePress(key)}
              className={getKeyStyle(key)}
            >
              {key === 'DEL' ? '⌫' : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};