import React from 'react';
import { sfx } from '../utils/audio';

interface SudokuControlsProps {
  onInput: (char: string) => void;
  onDelete: () => void;
}

export const SudokuControls: React.FC<SudokuControlsProps> = ({ onInput, onDelete }) => {
  const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

  return (
    <div className="w-full max-w-sm mx-auto mt-4 px-2" style={{ transform: 'skewX(-2deg)' }}>
      <div className="grid grid-cols-5 gap-2 mb-2">
        {keys.slice(0, 5).map(key => (
          <button
            key={key}
            onClick={() => { sfx.playClick(); onInput(key); }}
            className="h-12 font-black text-lg transition-all active:translate-y-1"
            style={{ 
              background: '#8338EC', 
              color: 'var(--color-text)', 
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000',
              transform: 'skewX(2deg)'
            }}
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
            className="h-12 font-black text-lg transition-all active:translate-y-1"
            style={{ 
              background: '#8338EC', 
              color: 'var(--color-text)', 
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000',
              transform: 'skewX(2deg)'
            }}
          >
            {key}
          </button>
        ))}
        <button
          onClick={() => { sfx.playClick(); onDelete(); }}
          className="h-12 font-black text-xs transition-all active:translate-y-1 flex items-center justify-center"
          style={{ 
            background: '#FF006E', 
            color: 'var(--color-text)', 
            border: '3px solid #000',
            boxShadow: '4px 4px 0px #000',
            transform: 'skewX(2deg)'
          }}
        >
          DEL
        </button>
      </div>
    </div>
  );
};
