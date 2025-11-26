import { Language, Tier, LevelData, GameMode } from '../types';
import { WORDS_EN, WORDS_DE, WORDS_ES, CHAIN_PAIRS_DE, CHAIN_PAIRS_EN, CHAIN_PAIRS_ES, CATEGORY_DATA_DE, CATEGORY_DATA_EN, CATEGORY_DATA_ES, MATH_CHALLENGES } from '../constants';
import { LEVEL_DATA } from './levelData';

// --- Word Logic ---

export const getLevelContent = (mode: GameMode, tier: Tier, levelId: number, lang: Language, playedWords: string[] = []) => {
  // 1. Check for Static Data in LEVEL_DATA
  const staticData = LEVEL_DATA[mode]?.[lang]?.[tier]?.[levelId];
  if (staticData) {
    return {
      target: staticData.target,
      hintTitle: staticData.hintTitle,
      hintDesc: staticData.hintDesc,
      timeLimit: staticData.timeLimit
    };
  }

  // 2. Fallback to Procedural Generation (Old Logic)
  // Deterministic RNG based on inputs (still used for other modes)
  const seed = levelId + tier * 1000;
  const pseudoRandom = (offset: number) => (seed + offset) * 9301 + 49297 % 233280;

  if (mode === GameMode.CHAIN) {
    let pairs = lang === Language.DE ? CHAIN_PAIRS_DE : CHAIN_PAIRS_EN;
    if (lang === Language.ES) pairs = CHAIN_PAIRS_ES;

    const pair = pairs[Math.floor(pseudoRandom(0) % pairs.length)];

    let hintTitle = "CHAIN LINK";
    if (lang === Language.DE) hintTitle = "WORTKETTE";
    if (lang === Language.ES) hintTitle = "CADENA";

    let hintPrefix = "Prev:";
    if (lang === Language.DE) hintPrefix = "Vorher:";
    if (lang === Language.ES) hintPrefix = "Ant:";

    return {
      target: pair[1],
      hintTitle,
      hintDesc: `${hintPrefix} ${pair[0]}`,
      timeLimit: undefined
    };
  }

  if (mode === GameMode.CATEGORY) {
    let cats = lang === Language.DE ? CATEGORY_DATA_DE : CATEGORY_DATA_EN;
    if (lang === Language.ES) cats = CATEGORY_DATA_ES;

    const catKeys = Object.keys(cats);
    const cat = catKeys[Math.floor(pseudoRandom(0) % catKeys.length)];
    const words = cats[cat];
    const word = words[Math.floor(pseudoRandom(1) % words.length)];

    let hintTitle = "TOPIC";
    if (lang === Language.DE) hintTitle = "THEMA";
    if (lang === Language.ES) hintTitle = "TEMA";

    return {
      target: word,
      hintTitle,
      hintDesc: cat,
      timeLimit: undefined
    };
  }

  // Fallback / Classic / Speedrun
  let allWords = lang === Language.EN ? WORDS_EN : WORDS_DE;
  if (lang === Language.ES) allWords = WORDS_ES;

  // Filter by Tier
  let availableWords = allWords.filter(w => w.tier === tier);

  // If no words for this tier (fallback), use all words
  if (availableWords.length === 0) availableWords = allWords;

  // Deterministic selection based on Level ID
  // This ensures Level 1 is always the 1st word, Level 2 is the 2nd, etc.
  const wordIndex = (levelId - 1) % availableWords.length;
  const wordData = availableWords[wordIndex];
  const word = wordData.word;

  let timeLimit = undefined;
  if (mode === GameMode.SPEEDRUN) {
    timeLimit = 30 + (word.length * 5) - (tier * 2); // Harder with higher tiers
    if (timeLimit < 15) timeLimit = 15;
  }

  let hintTitle = "CLASSIC";
  if (mode === GameMode.SPEEDRUN) hintTitle = "SPEEDRUN";

  if (lang === Language.DE) {
    hintTitle = mode === GameMode.SPEEDRUN ? "ZEITRENNEN" : "KLASSISCH";
  }
  if (lang === Language.ES) {
    hintTitle = mode === GameMode.SPEEDRUN ? "CONTRARRELOJ" : "CLÁSICO";
  }

  return {
    target: word,
    hintTitle,
    hintDesc: wordData.hint, // Use specific hint
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
  // console.log("generateChallenge called with:", { lang, tier, levelId });
  // 1. Check for Static Data in LEVEL_DATA
  const challengeData = LEVEL_DATA[GameMode.CHALLENGE];
  // console.log("Challenge Data Root:", challengeData);

  const staticData = challengeData?.[lang]?.[tier]?.[levelId];
  // console.log("Found Static Data:", staticData);

  // DEBUG ALERT
  // alert(`Debug: Lang=${lang}, Tier=${tier}, Level=${levelId}, Found=${!!staticData}`);

  if (staticData) {
    return {
      type: staticData.type || 'math',
      target: staticData.target,
      question: staticData.hintDesc, // Re-use hintDesc as the question
      timeLimit: staticData.timeLimit || 60
    };
  }

  // 2. Fallback to Algorithmic Math Generation
  // Ensures progressive difficulty and uniqueness

  let q = "";
  let a = "";
  let timeLimit = 60;

  const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  switch (tier) {
    case Tier.BEGINNER: // Simple Add/Sub
      timeLimit = 180;
      if (Math.random() > 0.5) {
        const n1 = r(5, 50);
        const n2 = r(5, 50);
        q = `${n1} + ${n2}`;
        a = (n1 + n2).toString();
      } else {
        const n1 = r(20, 100);
        const n2 = r(5, n1); // Ensure positive result
        q = `${n1} - ${n2}`;
        a = (n1 - n2).toString();
      }
      break;

    case Tier.LEARNER: // Mul/Div (Tables)
      timeLimit = 150;
      if (Math.random() > 0.5) {
        const n1 = r(2, 12);
        const n2 = r(2, 12);
        q = `${n1} * ${n2}`;
        a = (n1 * n2).toString();
      } else {
        const n2 = r(2, 12);
        const ans = r(2, 12);
        const n1 = n2 * ans; // Ensure clean division
        q = `${n1} / ${n2}`;
        a = ans.toString();
      }
      break;

    case Tier.SKILLED: // Mixed Operations (A + B * C)
      timeLimit = 120;
      {
        const n1 = r(2, 10);
        const n2 = r(2, 10);
        const n3 = r(2, 20);
        if (Math.random() > 0.5) {
          q = `${n3} + ${n1} * ${n2}`;
          a = (n3 + (n1 * n2)).toString();
        } else {
          q = `${n1} * ${n2} - ${n3}`;
          a = ((n1 * n2) - n3).toString();
        }
      }
      break;

    case Tier.EXPERT: // Harder Mixed
      timeLimit = 90;
      {
        const n1 = r(10, 20);
        const n2 = r(5, 15);
        const n3 = r(50, 100);
        if (Math.random() > 0.5) {
          q = `(${n1} + ${n2}) * 2`;
          a = ((n1 + n2) * 2).toString();
        } else {
          q = `${n3} - ${n1} * 3`;
          a = (n3 - (n1 * 3)).toString();
        }
      }
      break;

    case Tier.MASTER: // Complex
      timeLimit = 60;
      {
        const n1 = r(11, 19);
        const n2 = r(11, 19);
        q = `${n1} * ${n2}`;
        a = (n1 * n2).toString();
      }
      break;
  }

  // Adjust time limit based on level within tier (slightly less time for higher levels)
  // But cap it at a reasonable minimum
  timeLimit = Math.max(30, timeLimit - (levelId % 50));

  return {
    type: 'math',
    target: a,
    question: q,
    timeLimit
  };
};

// --- Riddle Logic ---

import { BUDDY_RIDDLES } from '../components/BuddyRiddles';

export const generateRiddle = (lang: Language, tier: Tier, levelId: number) => {
  // Use BUDDY_RIDDLES as the source
  // Filter by difficulty based on Tier if desired, or just random/sequential
  // For now, let's map Tiers to difficulties roughly

  let difficulty = 'easy';
  if (tier === Tier.SKILLED || tier === Tier.EXPERT) difficulty = 'medium';
  if (tier === Tier.MASTER) difficulty = 'hard';

  // Filter riddles by difficulty (optional, or just use all)
  // Let's use all for now to have more content, or filter if we have enough
  // const availableRiddles = BUDDY_RIDDLES.filter(r => r.difficulty === difficulty);
  const availableRiddles = BUDDY_RIDDLES;

  if (availableRiddles.length === 0) {
    return {
      target: "EMPTY",
      question: "No riddles available.",
      timeLimit: undefined
    };
  }

  // Deterministic selection based on levelId
  const index = (levelId - 1) % availableRiddles.length;
  const riddle = availableRiddles[index];

  return {
    target: riddle.answer.toUpperCase(), // Ensure uppercase for game logic
    question: riddle.question,
    hintTitle: "RÄTSEL", // Or localized title
    hintDesc: riddle.question,
    timeLimit: undefined
  };
};
