import React from 'react';
import { sfx } from '../utils/audio';

interface SudokuControlsProps {
  onInput: (char: string) => void;
  onDelete: () => void;
}

export const SudokuControls: React.FC<SudokuControlsProps> = ({ onInput, onDelete }) => {
  const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  return (
    <div className="w-full max-w-md mx-auto mt-4 px-2">
      <div className="grid grid-cols-5 gap-2 mb-2">
        {keys.slice(0, 5).map(key => (
          <button
            key={key}
            onClick={() => { sfx.playClick(); onInput(key); }}
            className="h-12 rounded-lg bg-white/5 border border-white/10 font-bold text-xl text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
          >
            {key}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {keys.slice(5).map(key => (
          <button
            key={key}
            onClick={() => { sfx.playClick(); onInput(key); }}
            className="h-12 rounded-lg bg-white/5 border border-white/10 font-bold text-xl text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
          >
            {key}
          </button>
        ))}
        <button
          onClick={() => { sfx.playClick(); onDelete(); }}
          className="h-12 rounded-lg bg-red-900/50 border border-red-500/30 font-bold text-white hover:bg-red-800/50 active:scale-95 transition-all flex items-center justify-center"
        >
          DEL
        </button>
      </div>
    </div>
  );
};
