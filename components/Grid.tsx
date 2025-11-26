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

// Helper for dynamic sizing
const getDynamicStyles = (length: number) => {
  if (length > 10) return { gap: 'gap-1', text: 'text-sm md:text-lg', size: 'h-8 w-8 md:h-10 md:w-10' };
  if (length > 7) return { gap: 'gap-1.5', text: 'text-lg md:text-xl', size: 'h-10 w-10 md:h-12 md:w-12' };
  return { gap: 'gap-2', text: 'text-2xl md:text-4xl', size: 'h-12 w-12 md:h-14 md:w-14' };
};

export const Grid: React.FC<GridProps> = ({ guesses, currentGuess, wordLength, currentRow, isShake, hintData = {} }) => {
  // Generate empty rows
  const empties = Array.from({ length: Math.max(0, 6 - 1 - currentRow) });
  const styles = getDynamicStyles(wordLength);

  return (
    <div className={`flex flex-col ${styles.gap} mb-4 p-2 w-full mx-auto transition-all duration-300 ease-in-out`} style={{ maxWidth: wordLength > 8 ? '40rem' : '28rem' }}>
      {guesses.map((guess, i) => (
        <Row key={i} word={guess} length={wordLength} styles={styles} />
      ))}
      {guesses.length < 6 && (
        <CurrentRow
          word={currentGuess}
          length={wordLength}
          isShake={isShake}
          hintData={hintData}
          styles={styles}
        />
      )}
      {empties.map((_, i) => (
        <EmptyRow key={`empty-${i}`} length={wordLength} hintData={hintData} styles={styles} />
      ))}
    </div>
  );
};

const Row: React.FC<{ word: CellData[]; length: number; styles: any }> = ({ word, length, styles }) => (
  <div className={`grid ${styles.gap} justify-center`} style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
    {word.map((cell, i) => (
      <Cell key={i} data={cell} index={i} styles={styles} />
    ))}
  </div>
);

const CurrentRow: React.FC<{ word: string; length: number; isShake: boolean; hintData: Record<number, string>; styles: any }> = ({ word, length, isShake, hintData, styles }) => {
  const split = word.split('');
  const cells = Array.from({ length }).map((_, i) => split[i] || '');

  return (
    <motion.div
      animate={isShake ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={`grid ${styles.gap} justify-center`}
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
    >
      {cells.map((char, i) => {
        // Show hint only if user hasn't typed a character there yet
        const isHint = !char && hintData[i];
        const displayChar = char || hintData[i] || '';
        const isCursor = !char && !isHint && (i === 0 || cells[i - 1]); // First empty cell is cursor

        return (
          <div
            key={i}
            className={`
              aspect-square flex items-center justify-center ${styles.text} font-black uppercase border-2 rounded-xl transition-all duration-200
              ${char
                ? 'border-lexi-primary-light/50 bg-lexi-primary-light/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105'
                : isHint
                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.3)]'
                  : isCursor
                    ? 'border-white/40 bg-white/5 animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                    : 'border-white/10 text-transparent'}
            `}
          >
            {displayChar}
            {isCursor && (
              <motion.div
                layoutId="cursor"
                className="absolute bottom-2 w-1/2 h-0.5 bg-lexi-cyan rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

const EmptyRow: React.FC<{ length: number; hintData: Record<number, string>; styles: any }> = ({ length, hintData, styles }) => {
  const cells = Array.from({ length });
  return (
    <div className={`grid ${styles.gap} justify-center`} style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
      {cells.map((_, i) => (
        <div
          key={i}
          className={`aspect-square border-2 rounded-xl flex items-center justify-center ${styles.text} font-bold uppercase transition-colors
            ${hintData[i]
              ? 'border-yellow-500/30 text-yellow-400/50 bg-yellow-500/5'
              : 'border-white/5 bg-black/20'}
          `}
        >
          {hintData[i] || ''}
        </div>
      ))}
    </div>
  );
};

const Cell: React.FC<{ data: CellData; index: number; styles: any }> = ({ data, index, styles }) => {
  const getBg = (status: LetterStatus) => {
    switch (status) {
      case LetterStatus.CORRECT: return 'bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]';
      case LetterStatus.PRESENT: return 'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]';
      case LetterStatus.ABSENT: return 'bg-gray-700/50 border-gray-600';
      default: return 'bg-gray-900 border-gray-700';
    }
  };

  return (
    <motion.div
      initial={{ rotateX: 90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4, type: 'spring', stiffness: 200 }}
      className={`
        aspect-square flex items-center justify-center ${styles.text} font-black uppercase border-2 rounded-xl text-white
        ${getBg(data.status)}
      `}
    >
      {data.char}
    </motion.div>
  );
};
