
import React from 'react';
import { motion } from 'framer-motion';
import { CellData, LetterStatus } from '../types';

interface GridProps {
  guesses: CellData[][];
  currentGuess: string;
  wordLength: number;
  currentRow: number;
  isShake: boolean;
  hintData?: Record<number, string>;
}

export const Grid: React.FC<GridProps> = ({ guesses, currentGuess, wordLength, currentRow, isShake, hintData = {} }) => {
  // Generate empty rows
  const empties = Array.from({ length: Math.max(0, 6 - 1 - currentRow) });

  return (
    <div className="flex flex-col gap-2 mb-4 p-2 w-full max-w-md mx-auto">
      {guesses.map((guess, i) => (
        <Row key={i} word={guess} />
      ))}
      {guesses.length < 6 && (
        <CurrentRow
          word={currentGuess}
          length={wordLength}
          isShake={isShake}
          hintData={hintData}
        />
      )}
      {empties.map((_, i) => (
        <EmptyRow key={`empty-${i}`} length={wordLength} hintData={hintData} />
      ))}
    </div>
  );
};

const Row: React.FC<{ word: CellData[] }> = ({ word }) => (
  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${word.length}, 1fr)` }}>
    {word.map((cell, i) => (
      <Cell key={i} data={cell} index={i} />
    ))}
  </div>
);

const CurrentRow: React.FC<{ word: string; length: number; isShake: boolean; hintData: Record<number, string> }> = ({ word, length, isShake, hintData }) => {
  const split = word.split('');
  const cells = Array.from({ length }).map((_, i) => split[i] || '');

  return (
    <motion.div
      animate={isShake ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${length}, 1fr)` }}
    >
      {cells.map((char, i) => {
        // Show hint only if user hasn't typed a character there yet
        const isHint = !char && hintData[i];
        const displayChar = char || hintData[i] || '';

        return (
          <div
            key={i}
            className={`
              aspect-square flex items-center justify-center text-xl md:text-3xl font-bold uppercase border-2 rounded-lg transition-colors
              ${char
                ? 'border-gray-400 text-white animate-pulse-once'
                : isHint
                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
                  : 'border-gray-700 text-transparent'}
            `}
          >
            {displayChar}
          </div>
        );
      })}
    </motion.div>
  );
};

const EmptyRow: React.FC<{ length: number; hintData: Record<number, string> }> = ({ length, hintData }) => {
  const cells = Array.from({ length });
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${length}, 1fr)` }}>
      {cells.map((_, i) => (
        <div
          key={i}
          className={`aspect-square border-2 rounded-lg flex items-center justify-center text-xl md:text-3xl font-bold uppercase 
            ${hintData[i]
              ? 'border-yellow-500/50 text-yellow-400/60 bg-yellow-500/5'
              : 'border-gray-800'}
          `}
        >
          {hintData[i] || ''}
        </div>
      ))}
    </div>
  );
};

const Cell: React.FC<{ data: CellData; index: number }> = ({ data, index }) => {
  const getBg = (status: LetterStatus) => {
    switch (status) {
      case LetterStatus.CORRECT: return 'bg-green-500 border-green-500';
      case LetterStatus.PRESENT: return 'bg-yellow-500 border-yellow-500';
      case LetterStatus.ABSENT: return 'bg-gray-600 border-gray-600';
      default: return 'bg-gray-900 border-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ rotateX: 90 }}
      animate={{ rotateX: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`
        aspect-square flex items-center justify-center text-xl md:text-3xl font-bold uppercase border-2 rounded-lg text-white
        ${getBg(data.status)}
      `}
    >
      {data.char}
    </motion.div>
  );
};
