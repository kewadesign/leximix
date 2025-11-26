import React from 'react';
import { sfx } from '../utils/audio';

interface SudokuGridProps {
  board: string[][];
  selectedCell: { r: number, c: number } | null;
  onCellSelect: (r: number, c: number) => void;
  original: string[][]; // To distinguish fixed vs user cells
  validation?: (string | null)[][];
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({ board, selectedCell, onCellSelect, original, validation }) => {
  return (
    <div className="w-full max-w-md mx-auto aspect-square p-1 bg-gray-800/50 rounded-xl border-2 border-white/10 select-none shadow-xl backdrop-blur-sm">
      <div className="w-full h-full grid grid-cols-9 grid-rows-9 rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
        {board.map((row, r) => 
          row.map((cell, c) => {
            // Determine borders for 3x3 subgrids
            const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-lexi-fuchsia/50' : 'border-r border-r-white/5';
            const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-lexi-fuchsia/50' : 'border-b border-b-white/5';
            
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
            const isRelated = selectedCell && (selectedCell.r === r || selectedCell.c === c);
            const isFixed = original[r][c] !== null;
            const status = validation?.[r]?.[c];
            
            // Styling
            let cellBg = 'bg-transparent';
            if (status === 'correct') cellBg = 'bg-green-500/30';
            else if (status === 'error') cellBg = 'bg-red-500/30';
            else if (isSelected) cellBg = 'bg-lexi-fuchsia/60';
            else if (isRelated) cellBg = 'bg-lexi-fuchsia/10';
            else if (isFixed) cellBg = 'bg-black/20';

            let textColor = 'text-white';
            if (isFixed) textColor = 'text-gray-400 font-bold';
            else if (cell) textColor = 'text-lexi-cyan font-black';
            
            // Status text color override
            if (status === 'correct') textColor = 'text-green-200 font-bold';
            if (status === 'error') textColor = 'text-red-200 font-bold';

            return (
              <div 
                key={`${r}-${c}`}
                onClick={() => { sfx.playClick(); onCellSelect(r, c); }}
                className={`
                  relative flex items-center justify-center text-base sm:text-xl md:text-2xl cursor-pointer transition-colors duration-75
                  ${borderRight} ${borderBottom} ${cellBg} ${textColor}
                  hover:bg-white/10 active:bg-white/20
                `}
              >
                {cell || ''}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
