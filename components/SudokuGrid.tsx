
import React from 'react';
import { motion } from 'framer-motion';
import { CellData, LetterStatus } from '../types';
import { sfx } from '../utils/audio';

interface SudokuGridProps {
  board: CellData[][];
  selectedCell: { r: number, c: number } | null;
  onCellSelect: (r: number, c: number) => void;
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({ board, selectedCell, onCellSelect }) => {
  return (
    <div className="w-full max-w-md mx-auto aspect-square p-2 bg-gray-800 rounded-xl border-4 border-gray-700 select-none">
      <div className="w-full h-full grid grid-cols-9 grid-rows-9 border-2 border-gray-900">
        {board.map((row, r) => 
          row.map((cell, c) => {
            // Check boundaries for thicker lines for 3x3 subgrids
            const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-gray-400' : 'border-r border-r-gray-700';
            const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-gray-400' : 'border-b border-b-gray-700';
            
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
            const isRelated = selectedCell && (selectedCell.r === r || selectedCell.c === c);
            
            // Styling for fixed clues vs user input
            const textColor = cell.isFixed ? 'text-cyan-400 font-black' : cell.char ? 'text-white font-bold' : '';
            const bgColor = isSelected 
                ? 'bg-fuchsia-600/40' 
                : isRelated 
                    ? 'bg-white/5' 
                    : 'bg-transparent';

            return (
              <div 
                key={`${r}-${c}`}
                onClick={() => { sfx.playClick(); onCellSelect(r, c); }}
                className={`
                  relative flex items-center justify-center text-sm md:text-xl cursor-pointer transition-colors
                  ${borderRight} ${borderBottom} ${bgColor} ${textColor}
                  hover:bg-white/10
                `}
              >
                {cell.char}
                {isSelected && (
                   <motion.div layoutId="cursor" className="absolute inset-0 border-2 border-fuchsia-500 z-10" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
