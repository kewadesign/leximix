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
  // Neo-brutalist cell styles
  const getCellStyle = (r: number, c: number, cell: string | null, isFixed: boolean, isSelected: boolean, isRelated: boolean, status: string | null | undefined) => {
    if (status === 'correct') return { 
      background: '#06FFA5', 
      color: '#000'
    };
    if (status === 'error') return { 
      background: '#FF006E', 
      color: '#FFF'
    };
    if (isSelected) return { 
      background: '#FFBE0B', 
      color: '#000',
      boxShadow: 'inset 0 0 0 3px #000'
    };
    if (isRelated) return { 
      background: '#FFF8E7', 
      color: '#8338EC'
    };
    if (isFixed) return { 
      background: '#E5E5E5', 
      color: '#000'
    };
    return { 
      background: '#FFF', 
      color: '#8338EC'
    };
  };

  return (
    <div 
      className="w-full max-w-sm mx-auto aspect-square select-none overflow-hidden"
      style={{ 
        border: '4px solid #000',
        boxShadow: '8px 8px 0px #8338EC', 
        background: '#FFF',
        transform: 'skewX(-2deg)'
      }}
    >
      <div className="w-full h-full grid grid-cols-9 grid-rows-9" style={{ transform: 'skewX(2deg)' }}>
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
            const isRelated = selectedCell && (selectedCell.r === r || selectedCell.c === c);
            const isFixed = original[r][c] !== null;
            const status = validation?.[r]?.[c];

            // Subgrid borders - bold
            const borderRight = (c + 1) % 3 === 0 && c !== 8 ? '3px solid #000' : '1px solid #CCC';
            const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? '3px solid #000' : '1px solid #CCC';

            const cellStyle = getCellStyle(r, c, cell, isFixed, isSelected, isRelated || false, status);

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => { sfx.playClick(); onCellSelect(r, c); }}
                className="relative flex items-center justify-center text-base sm:text-xl md:text-2xl cursor-pointer transition-all font-black"
                style={{
                  ...cellStyle,
                  borderRight,
                  borderBottom
                }}
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
