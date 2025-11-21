
import { Language, Tier, LevelData, GameMode } from '../types';
import { WORDS_EN, WORDS_DE, CHAIN_PAIRS_DE, CHAIN_PAIRS_EN, CATEGORY_DATA_DE, CATEGORY_DATA_EN, MATH_CHALLENGES } from '../constants';

// --- Word Logic ---

export const getLevelContent = (mode: GameMode, tier: Tier, levelId: number, lang: Language) => {
  // Deterministic RNG based on inputs
  const seed = levelId + tier * 1000;
  const pseudoRandom = (offset: number) => (seed + offset) * 9301 + 49297 % 233280;

  if (mode === GameMode.CHAIN) {
      const pairs = lang === Language.DE ? CHAIN_PAIRS_DE : CHAIN_PAIRS_EN;
      const pair = pairs[Math.floor(pseudoRandom(0) % pairs.length)];
      return {
          target: pair[1],
          hintTitle: lang === Language.DE ? "WORTKETTE" : "CHAIN LINK",
          hintDesc: `${lang === Language.DE ? "Vorher:" : "Prev:"} ${pair[0]}`,
          timeLimit: undefined
      };
  }

  if (mode === GameMode.CATEGORY) {
      const cats = lang === Language.DE ? CATEGORY_DATA_DE : CATEGORY_DATA_EN;
      const catKeys = Object.keys(cats);
      const cat = catKeys[Math.floor(pseudoRandom(0) % catKeys.length)];
      const words = cats[cat];
      const word = words[Math.floor(pseudoRandom(1) % words.length)];
      return {
          target: word,
          hintTitle: lang === Language.DE ? "THEMA" : "TOPIC",
          hintDesc: cat,
          timeLimit: undefined
      };
  }

  // Fallback / Classic / Speedrun
  const list = lang === Language.EN ? WORDS_EN : WORDS_DE;
  const index = Math.floor(pseudoRandom(0) % list.length);
  const word = list[index];
  
  let timeLimit = undefined;
  if (mode === GameMode.SPEEDRUN) {
      timeLimit = 30 + (word.length * 5) - (tier * 2); // Harder with higher tiers
      if (timeLimit < 15) timeLimit = 15;
  }

  return {
      target: word,
      hintTitle: mode === GameMode.SPEEDRUN ? (lang === Language.DE ? "ZEITRENNEN" : "SPEEDRUN") : (lang === Language.DE ? "KLASSISCH" : "CLASSIC"),
      hintDesc: userFriendlyHint(word, lang),
      timeLimit
  };
};

// Simple helper to give a vague hint instead of "Runde Frucht" for everything
const userFriendlyHint = (word: string, lang: Language) => {
    return lang === Language.DE ? `${word.length} Buchstaben` : `${word.length} Letters`;
};

export const checkGuess = (guess: string, target: string) => {
  const result = Array(guess.length).fill('absent');
  const targetArr = target.split('');
  const guessArr = guess.split('');

  // Pass 1: Correct position
  guessArr.forEach((char, i) => {
    if (char === targetArr[i]) {
      result[i] = 'correct';
      targetArr[i] = null as any; // Consume
    }
  });

  // Pass 2: Present but wrong position
  guessArr.forEach((char, i) => {
    if (result[i] !== 'correct') {
      const index = targetArr.indexOf(char);
      if (index !== -1) {
        result[i] = 'present';
        targetArr[index] = null as any; // Consume
      }
    }
  });

  return result;
};

// --- Sudoku Logic ---

const SUDOKU_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

const BASE_BOARD = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
  [3, 4, 5, 6, 7, 8, 0, 1, 2],
  [6, 7, 8, 0, 1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5, 6, 7, 8, 0],
  [4, 5, 6, 7, 8, 0, 1, 2, 3],
  [7, 8, 0, 1, 2, 3, 4, 5, 6],
  [2, 3, 4, 5, 6, 7, 8, 0, 1],
  [5, 6, 7, 8, 0, 1, 2, 3, 4],
  [8, 0, 1, 2, 3, 4, 5, 6, 7]
];

export const generateSudoku = (tier: Tier): LevelData => {
  // Better randomization: Shuffle Rows within bands, then Columns within bands
  let board = JSON.parse(JSON.stringify(BASE_BOARD));

  const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

  // Shuffle row bands (0-2, 3-5, 6-8)
  // Simplify for demo: just shuffle rows within the predefined valid bands
  const b1 = shuffle(board.slice(0, 3));
  const b2 = shuffle(board.slice(3, 6));
  const b3 = shuffle(board.slice(6, 9));
  board = [...b1, ...b2, ...b3];

  // Transpose to shuffle columns (as rows), then transpose back
  const transpose = (m: any[][]) => m[0].map((_, i) => m.map(r => r[i]));
  board = transpose(board);
  const cb1 = shuffle(board.slice(0, 3));
  const cb2 = shuffle(board.slice(3, 6));
  const cb3 = shuffle(board.slice(6, 9));
  board = [...cb1, ...cb2, ...cb3];
  board = transpose(board);

  // Convert to Letters
  const fullGrid = board.map((row: number[]) => row.map((n: number) => SUDOKU_LETTERS[n]));

  // Remove cells based on Tier
  const puzzleGrid = fullGrid.map((row: string[]) => [...row]);
  const cellsToRemove = 20 + (tier * 5); 

  let removed = 0;
  while (removed < cellsToRemove) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (puzzleGrid[r][c] !== null) {
      puzzleGrid[r][c] = null;
      removed++;
    }
  }

  return {
    id: Date.now(),
    tier,
    targetWord: "",
    hint: "",
    sudokuGrid: fullGrid,
    sudokuPuzzle: puzzleGrid
  };
};

// --- Challenge Logic ---

export const generateChallenge = (lang: Language, tier: Tier, levelId: number) => {
    const challenge = MATH_CHALLENGES[Math.floor(Math.random() * MATH_CHALLENGES.length)];
    
    let timeLimit = 180; // Tier 1: 3 min

    switch (tier) {
        case Tier.BEGINNER: 
            timeLimit = 180; 
            break;
        case Tier.LEARNER: 
            timeLimit = 150; // 2.5 min
            break;
        case Tier.SKILLED: 
            timeLimit = 120; // 2 min
            break;
        case Tier.EXPERT: 
            timeLimit = 90; // 1.5 min
            break;
        case Tier.MASTER: 
            // Last 6 levels (assuming 50 levels/tier, so 45-50) get 45s, else 60s
            if (levelId >= 45) {
                timeLimit = 45;
            } else {
                timeLimit = 60; // 1 min
            }
            break;
    }

    return {
        type: 'math',
        target: challenge.a,
        question: challenge.q,
        timeLimit
    };
};
