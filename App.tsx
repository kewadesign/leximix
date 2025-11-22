
import React, { useState, useEffect, useRef } from 'react';
import { GameMode, Tier, UserState, Language, GameConfig, ShopItem } from './types';
import { Button, Modal } from './components/UI';
import { SeasonPass } from './components/SeasonPass';
import { AuthModal } from './components/AuthModal';
import { PremiumStatus } from './components/PremiumStatus';
import { TIER_COLORS, TIER_BG, TUTORIALS, TRANSLATIONS, AVATARS, MATH_CHALLENGES, SHOP_ITEMS, PREMIUM_PLANS, VALID_CODES, COIN_CODES, SEASON_REWARDS } from './constants';
import { getLevelContent, checkGuess, generateSudoku, generateChallenge } from './utils/gameLogic';
import { audio } from './utils/audio';

import { Trophy, ArrowLeft, HelpCircle, Gem, Lock, User, Globe, Puzzle, Zap, Link as LinkIcon, BookOpen, Grid3X3, Play, Check, Star, Clock, Sparkles, Settings, Edit2, Skull, Brain, Info, ShoppingBag, Coins, CreditCard, AlertTriangle } from 'lucide-react';

// --- Sub Components for Game Logic ---

const Keyboard = ({ onChar, onDelete, onEnter, usedKeys, isMathMode, t }: any) => {
  const vibrate = (duration: number = 30) => {
    if (navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(duration);
    }
  };
  const rows = isMathMode ? [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0', '+', '-', '*', '/']
  ] : [
    "QWERTYUIOP".split(''),
    "ASDFGHJKL".split(''),
    "ZXCVBNM".split('')
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-2 select-none animate-slide-up">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5 mb-1.5">
          {row.map(char => {
            const status = usedKeys[char];
            let bg = "glass-button text-lexi-text";
            if (status === 'correct') bg = "bg-green-600 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]";
            else if (status === 'present') bg = "bg-yellow-600 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]";
            else if (status === 'absent') bg = "bg-red-900/80 text-white/50 border-red-900";

            return (
              <button
                key={char}
                onClick={() => onChar(char)}
                className={`${bg} h-12 sm:h-14 flex-1 rounded-lg font-bold text-base sm:text-lg active:scale-95 transition-all border-b-4 border-black/20 relative overflow-hidden`}
              >
                {char}
              </button>
            );
          })}
          {i === rows.length - 1 && (
            <button onClick={onDelete} className="glass-button h-12 sm:h-14 px-4 sm:px-6 rounded-lg text-sm uppercase font-bold active:scale-95 transition-all text-lexi-text">
              Del
            </button>
          )}
        </div>
      ))}
      <button onClick={onEnter} className="w-full bg-gradient-to-r from-lexi-fuchsia to-purple-600 h-14 sm:h-16 rounded-xl font-black text-sm sm:text-base md:text-lg mt-3 active:scale-95 uppercase shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:brightness-110 transition-all text-white tracking-widest">
        {t.GAME.ENTER_GUESS}
      </button>
    </div>
  );
};

const WordGrid = ({ guesses, currentGuess, targetLength, turn }: any) => {
  const empties = Array(Math.max(0, 6 - 1 - turn)).fill(null);

  return (
    <div className="flex flex-col gap-2 w-full max-w-[300px] md:max-w-[350px] mx-auto">
      {guesses.map((guess: any, i: number) => (
        <div key={i} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${targetLength}, 1fr)` }}>
          {guess.word.split('').map((char: string, j: number) => (
            <div key={j} className={`aspect-square flex items-center justify-center rounded-lg font-mono font-bold text-2xl md:text-3xl uppercase transition-all duration-500 animate-scale-in
              ${guess.result[j] === 'correct' ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)] rotate-x-0' :
                guess.result[j] === 'present' ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
                  'bg-red-600/80 text-white shadow-inner'}
            `}>
              {char}
            </div>
          ))}
        </div>
      ))}

      {turn < 6 && (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${targetLength}, 1fr)` }}>
          {Array(targetLength).fill(null).map((_, i) => (
            <div key={i} className={`aspect-square flex items-center justify-center rounded-lg border-4 ${currentGuess[i] ? 'border-lexi-fuchsia text-white bg-lexi-fuchsia/20 animate-pulse shadow-[0_0_15px_rgba(217,70,239,0.3)]' : 'border-lexi-border glass-panel'} font-mono font-bold text-2xl md:text-3xl uppercase transition-colors duration-200 text-lexi-text`}>
              {currentGuess[i] || ''}
            </div>
          ))}
        </div>
      )}

      {empties.map((_, i) => (
        <div key={`empty-${i}`} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${targetLength}, 1fr)` }}>
          {Array(targetLength).fill(null).map((__, j) => (
            <div key={j} className="aspect-square rounded-lg border-2 border-lexi-border/30 bg-lexi-surface/5"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

const SudokuBoard = ({ puzzle, original, onCellClick, selectedCell }: any) => {
  return (
    <div className="w-full max-w-[360px] md:max-w-[550px] mx-auto aspect-square p-2 relative animate-scale-in transition-all duration-500">
      {/* Outer Glow & Border */}
      <div className="absolute inset-0 bg-lexi-fuchsia/20 rounded-2xl blur-2xl animate-pulse-slow"></div>
      <div className="absolute inset-0 border-4 border-lexi-purple rounded-2xl bg-lexi-surface shadow-2xl"></div>

      {/* The Grid */}
      <div className="relative w-full h-full grid grid-cols-9 border-4 border-gray-800 bg-gray-900 rounded-xl overflow-hidden">
        {puzzle.map((row: string[], r: number) =>
          row.map((cell: string | null, c: number) => {
            const isFixed = original[r][c] !== null;
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;

            // Determine borders for 3x3 subgrids
            let borderClasses = "border border-gray-800/50";
            // Thick vertical borders
            if ((c + 1) % 3 === 0 && c !== 8) borderClasses += " border-r-4 border-r-lexi-fuchsia/50";
            // Thick horizontal borders
            if ((r + 1) % 3 === 0 && r !== 8) borderClasses += " border-b-4 border-b-lexi-fuchsia/50";

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => onCellClick(r, c)}
                className={`
                                ${borderClasses}
                                flex items-center justify-center
                                text-lg sm:text-2xl md:text-4xl font-mono font-bold cursor-pointer select-none
                                transition-all duration-100
                                ${isSelected ? 'bg-lexi-fuchsia text-white z-10 scale-110 shadow-[0_0_20px_rgba(217,70,239,0.8)] rounded-md' : ''}
                                ${!isSelected && isFixed ? 'text-lexi-text-muted bg-lexi-bg' : ''}
                                ${!isSelected && !isFixed ? 'text-lexi-cyan bg-lexi-surface-highlight hover:bg-lexi-surface' : ''}
                                ${!isSelected && !isFixed && cell ? 'text-cyan-300' : ''}
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

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<'ONBOARDING' | 'HOME' | 'MODES' | 'LEVELS' | 'GAME' | 'TUTORIAL' | 'SEASON' | 'SHOP'>('HOME');

  // Onboarding State
  const [onboardingStep, setOnboardingStep] = useState(0); // 0=Lang, 1=Name, 2=Age
  const [tempUser, setTempUser] = useState({ name: '', age: '', language: Language.EN });

  const [user, setUser] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('leximix_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...parsed, theme: parsed.theme || 'dark' };
      }
    } catch (error) {
      console.error('[LexiMix] localStorage error:', error);
      // Continue to default state
    }

    // Default state
    return {
      name: 'Player',
      age: 0,
      avatarId: AVATARS[0],
      ownedAvatars: [AVATARS[0]],
      xp: 0,
      level: 1,
      coins: 0,
      isPremium: false,
      completedLevels: {},
      language: Language.DE,
      theme: 'dark'
    };
  });

  // Cloud Save State
  const [cloudUsername, setCloudUsername] = useState<string | null>(() => {
    return localStorage.getItem('leximix_cloud_user');
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [lastCloudSync, setLastCloudSync] = useState<number | null>(null);

  // Check for saved user on mount to decide initial view
  useEffect(() => {
    try {
      const cloudUser = localStorage.getItem('leximix_cloud_user');

      // Must be logged in to use app
      if (!cloudUser) {
        setView('AUTH'); // Show login screen
      } else {
        setView('HOME'); // Go straight to home
      }
    } catch (error) {
      console.error('[LexiMix] Init error:', error);
      setView('AUTH');
    }
  }, []);

  // Anti-Cheat: Verify premium status with server every 60 seconds
  // Sync user state to cloud on changes
  useEffect(() => {
    if (!cloudUsername) return;
    const sync = async () => {
      try {
        const { saveToCloud } = await import('./utils/firebase');
        await saveToCloud(cloudUsername, user);
        console.log('[Sync] User data synced to cloud');
      } catch (e) {
        console.error('[Sync] Failed to sync:', e);
      }
    };
    sync();
  }, [cloudUsername, user]);
  useEffect(() => {
    if (!cloudUsername) return;

    const verifyPremiumStatus = async () => {
      try {
        const { loadFromCloud } = await import('./utils/firebase');
        const cloudData = await loadFromCloud(cloudUsername);

        if (cloudData) {
          // Check if local premium status matches server
          if (user.isPremium !== cloudData.isPremium) {
            console.warn('[Anti-Cheat] Premium status mismatch detected - correcting from server');
            setUser(prev => ({
              ...prev,
              isPremium: cloudData.isPremium,
              premiumActivatedAt: cloudData.premiumActivatedAt
            }));
          }
        }
      } catch (error) {
        console.error('[Anti-Cheat] Verification failed:', error);
      }
    };

    // Run immediately on mount
    verifyPremiumStatus();

    // Then run every 60 seconds
    const interval = setInterval(verifyPremiumStatus, 60000);

    return () => clearInterval(interval);
  }, [cloudUsername, user.isPremium]);

  const t = TRANSLATIONS[view === 'ONBOARDING' ? tempUser.language : user.language]; // Handle lang during onboarding

  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Modals
  const [showAd, setShowAd] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [hintCostMultiplier, setHintCostMultiplier] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false); // New Level Up State
  const [showProfile, setShowProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tutorialMode, setTutorialMode] = useState<GameMode | null>(null);
  const [winStats, setWinStats] = useState({ xp: 0, coins: 0 });
  const [levelUpData, setLevelUpData] = useState({ level: 1, xp: 0 }); // Data for Level Up Modal
  const [showRedeemModal, setShowRedeemModal] = useState(false); // Redeem Code Modal
  const [redeemCode, setRedeemCode] = useState(''); // Code Input
  const [redeemStep, setRedeemStep] = useState<'code' | 'plan'>('code'); // Redemption flow step
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null); // Selected plan
  const [redeemError, setRedeemError] = useState<string | null>(null); // Error message for redemption
  const [showPremiumInfo, setShowPremiumInfo] = useState(false); // Premium info modal

  // Edit Profile State
  const [editName, setEditName] = useState(user.name || "Player");
  const [editAge, setEditAge] = useState(user.age || 18);
  const [editAvatar, setEditAvatar] = useState(user.avatarId || AVATARS[0]);

  const [showPremiumRequiredModal, setShowPremiumRequiredModal] = useState(false);
  const [showCorrectWordModal, setShowCorrectWordModal] = useState(false);
  const [correctWord, setCorrectWord] = useState('');

  useEffect(() => {
    if (view !== 'ONBOARDING') {
      try {
        localStorage.setItem('leximix_user', JSON.stringify(user));

        // Auto-save to cloud if logged in
        if (cloudUsername) {
          import('./utils/firebase').then(({ saveToCloud }) => {
            saveToCloud(cloudUsername, user).then((success) => {
              if (success) {
                setLastCloudSync(Date.now());
              }
            });
          });
        }
      } catch (error) {
        console.error('[LexiMix] localStorage save error:', error);
      }
    }
  }, [user, view, cloudUsername]);

  useEffect(() => {
    const initAudio = () => audio.playClick();
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  // Speedrun / Challenge Timer
  useEffect(() => {
    let interval: any;
    // Check for both Speedrun AND Challenge mode if they have a timeLeft set
    const hasTimer = (gameConfig?.mode === GameMode.SPEEDRUN || gameConfig?.mode === GameMode.CHALLENGE) && gameState?.timeLeft !== undefined;

    if (view === 'GAME' && gameState?.status === 'playing' && hasTimer) {
      interval = setInterval(() => {
        setGameState((prev: any) => {
          if (prev.timeLeft <= 0) {
            audio.playLoss();
            return { ...prev, timeLeft: 0, status: 'lost' };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, gameState?.status, gameConfig?.mode]);

  // --- KEYBOARD EVENT LISTENER ---
  useEffect(() => {
    if (view !== 'GAME' || !gameConfig) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentGameState = gameStateRef.current;
      if (currentGameState?.status !== 'playing') return;

      const key = e.key.toUpperCase();
      const isSudoku = gameConfig.mode === GameMode.SUDOKU;

      // Sudoku Input
      if (isSudoku) {
        if (['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].includes(key)) {
          handleSudokuInput(key);
        }
        return;
      }

      // Math Mode Input
      if (currentGameState.isMath) {
        if (['BACKSPACE', 'DELETE'].includes(key)) {
          handleWordDelete();
        } else if (key === 'ENTER') {
          handleWordEnter();
        } else if (['+', '-', '*', '/'].includes(key) || /^[0-9]$/.test(key)) {
          handleWordKey(key);
        }
        return;
      }

      // Word Mode Input
      if (['BACKSPACE', 'DELETE'].includes(key)) {
        handleWordDelete();
      } else if (key === 'ENTER') {
        handleWordEnter();
      } else if (/^[A-Z]$/.test(key)) {
        handleWordKey(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, gameConfig]);


  const handleModeSelect = (mode: GameMode) => {
    audio.playClick();

    if (mode === GameMode.CHALLENGE) {
      if (!user.isPremium) {
        setShowPremiumRequiredModal(true);
        return;
      }

      const cost = 50 * (gameConfig?.tier || 1); // Cost scales with Tier (default 1 if not set yet, but usually set in next step)
      // Actually, tier is set AFTER this in handleLevelSelect usually, but for Challenge mode we might want to select Tier first?
      // For now, let's assume a base cost of 50 for entering the mode selection, or handle it per level.
      // The user request says "je höher die levels je teurer".
      // Let's move the cost check to handleLevelSelect for Challenge Mode to be accurate.
    }

    setGameConfig({ mode, tier: Tier.BEGINNER, levelId: 1 }); // Default
    setView('LEVELS');
  };

  const handleLevelSelect = (tier: Tier, levelId: number) => {
    audio.playClick();
    if (!gameConfig) return;

    // Challenge Mode Cost Check
    if (gameConfig.mode === GameMode.CHALLENGE) {
      const cost = tier * 50;
      if (user.coins < cost) {
        audio.playError();
        alert(`${t.SHOP.INSUFFICIENT} (${cost})`);
        return;
      }
      setUser(u => ({ ...u, coins: u.coins - cost }));
    }

    const config = { ...gameConfig, tier, levelId };
    setGameConfig(config);

    // Reset hints for new level
    setHintCostMultiplier(0);

    if (config.mode === GameMode.SUDOKU) {
      const data = generateSudoku(tier);
      setGameState({
        data,
        currentGrid: JSON.parse(JSON.stringify(data.sudokuPuzzle)),
        selectedCell: null,
        history: []
      });
    } else if (config.mode === GameMode.CHALLENGE) {
      const data = generateChallenge(user.language, tier, levelId);
      setGameState({
        targetWord: data.target,
        hintTitle: "CHALLENGE",
        hintDesc: data.question,
        guesses: [],
        currentGuess: '',
        status: 'playing',
        hintsUsed: 0,
        isMath: data.type === 'math',
        timeLeft: data.timeLimit
      });
    } else {
      // This block is now handled by the useEffect below
    }

    setTutorialMode(config.mode);
    setView('TUTORIAL');
  };

  const handleNextLevel = () => {
    if (!gameConfig) return;

    const currentTier = gameConfig.tier;
    const currentLevelId = gameConfig.levelId;

    // Calculate next level
    let nextTier = currentTier;
    let nextLevelId = currentLevelId + 1;

    // Handle tier transitions (50 levels per tier)
    if (nextLevelId > 50) {
      nextTier = (currentTier + 1) as Tier;
      nextLevelId = 1;

      // Check if next tier exists (max is Tier 5)
      if (nextTier > 5) {
        // No more levels, go back to level selection
        setView('LEVELS');
        return;
      }
    }

    // Start the next level and skip tutorial
    const config = { ...gameConfig, tier: nextTier, levelId: nextLevelId };
    setGameConfig(config);

    // Reset hints for new level
    setHintCostMultiplier(0);

    if (config.mode === GameMode.SUDOKU) {
      const data = generateSudoku(nextTier);
      setGameState({
        data,
        currentGrid: JSON.parse(JSON.stringify(data.sudokuPuzzle)),
        selectedCell: null,
        history: []
      });
    } else if (config.mode === GameMode.CHALLENGE) {
      const data = generateChallenge(user.language, nextTier, nextLevelId);
      setGameState({
        targetWord: data.target,
        hintTitle: "CHALLENGE",
        hintDesc: data.question,
        guesses: [],
        currentGuess: '',
        status: 'playing',
        hintsUsed: 0,
        isMath: data.type === 'math',
        timeLeft: data.timeLimit
      });
    }
    // For other modes, the useEffect will handle state initialization

    // Go directly to game, skip tutorial
    setView('GAME');
  };

  // Load Level Content and Initialize Game State for non-Sudoku/Challenge modes
  useEffect(() => {
    if (view === 'GAME' && gameConfig && gameConfig.mode !== GameMode.SUDOKU && gameConfig.mode !== GameMode.CHALLENGE) {
      const content = getLevelContent(
        gameConfig.mode,
        gameConfig.tier,
        gameConfig.levelId,
        user.language,
        user.playedWords || [] // Pass played words history
      );
      // setLevelData(content); // Removed undefined call

      // Reset Game State
      setGameState({
        guesses: [],
        currentGuess: '',
        status: 'playing',
        targetWord: content.target,
        hintTitle: content.hintTitle,
        hintDesc: content.hintDesc,
        timeLeft: content.timeLimit,
        startTime: Date.now(),
        hintsUsed: 0,
        isMath: false,
        isHintUnlocked: false,
        awaitingConfirmation: false,
        confirmedWord: null
      });

      setShowWin(false);
      console.log("Target Word:", content.target); // DEBUG: For verification
    }
  }, [view, gameConfig, user.language]);

  // Cloud Save Handlers
  const handleCloudLogin = async (username: string) => {
    setCloudUsername(username);
    localStorage.setItem('leximix_cloud_user', username);

    // Load from cloud
    const { loadFromCloud } = await import('./utils/firebase');
    const cloudData = await loadFromCloud(username);

    if (cloudData) {
      // Load existing data
      setUser(prev => ({
        ...prev,
        ...cloudData,
      }));
      console.log('[Cloud] Loaded save from cloud');
    } else {
      // New user - set defaults
      setUser(prev => ({
        ...prev,
        name: username,      // Use username as profile name
        age: 18,             // Default age
        avatarId: AVATARS[0],
        ownedAvatars: [AVATARS[0]],
        xp: 0,
        level: 1,
        coins: 0,
        isPremium: false,
        completedLevels: {},
        playedWords: [],
        language: Language.DE,
        theme: user.theme || 'dark'
      }));
      console.log('[Cloud] New user - set defaults');
    }

    // Always go to HOME (no onboarding)
    setView('HOME');
  };

  const handleCloudLogout = () => {
    // Clear cloud login
    setCloudUsername(null);
    localStorage.removeItem('leximix_cloud_user');

    // Clear user data
    localStorage.removeItem('leximix_user');
    setLastCloudSync(null);

    // Reset to default state
    setUser({
      name: 'Player',
      age: 0,
      avatarId: AVATARS[0],
      ownedAvatars: [AVATARS[0]],
      xp: 0,
      level: 1,
      coins: 0,
      isPremium: false,
      completedLevels: {},
      playedWords: [],
      language: Language.DE,
      theme: 'dark'
    });

    // Go back to AUTH
    setView('AUTH');
    console.log('[Cloud] Logged out - cleared all data');
  };

  const startGame = () => {
    setView('GAME');
    setTutorialMode(null);
  };

  const handleOnboardingComplete = () => {
    // Validate
    if (!tempUser.name || tempUser.name.length > 20) return;
    const ageNum = parseInt(tempUser.age.toString());
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) return;

    if (ageNum < 12) {
      alert("Access Denied: Minimum age is 12."); // Simple fallback
      return;
    }

    const startAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];

    setUser({
      ...user,
      name: tempUser.name,
      age: ageNum,
      language: tempUser.language,
      avatarId: startAvatar,
      ownedAvatars: [startAvatar],
      isPremium: false // Default to FALSE
    });
    setView('HOME');
    audio.playWin();
  };

  // --- Gameplay Logic ---

  const handleWordKey = (char: string) => {
    const currentGameState = gameStateRef.current;
    if (currentGameState?.status !== 'playing') return;
    if (currentGameState.currentGuess.length < currentGameState.targetWord.length) {
      const newGuess = currentGameState.currentGuess + char;
      setGameState((prev: any) => ({ ...prev, currentGuess: newGuess }));
      audio.playClick();

      // Auto-submit when word is complete
      if (newGuess.length === currentGameState.targetWord.length) {
        setTimeout(() => handleWordEnter(), 100);
      }
    }
  };

  const handleWordDelete = () => {
    const currentGameState = gameStateRef.current;
    if (currentGameState?.status !== 'playing') return;
    setGameState((prev: any) => ({ ...prev, currentGuess: prev.currentGuess.slice(0, -1) }));
  };

  const handleWordEnter = () => {
    try {
      const currentGameState = gameStateRef.current;
      if (currentGameState?.status !== 'playing') return;

      // Check if word is correct
      if (currentGameState.currentGuess === currentGameState.targetWord) {
        // Match! Proceed to win IMMEDIATELY
        if (!gameConfig) return;
        const { mode, tier, levelId } = gameConfig;
        const targetWord = currentGameState.targetWord; // Capture targetWord before state changes
        const newGuess = { word: currentGameState.currentGuess, result: Array(currentGameState.currentGuess.length).fill('correct') };

        setGameState((prev: any) => ({
          ...prev,
          guesses: [...prev.guesses, newGuess],
          status: 'won',
          currentGuess: ''
        }));

        audio.playWin();
        console.log('[handleWordEnter] Calling handleWin immediately with:', { mode, tier, levelId, targetWord });
        handleWin(mode, tier, levelId, targetWord); // Pass targetWord as parameter
        return;
      }

      // Check if word is valid length
      if (currentGameState.currentGuess.length !== currentGameState.targetWord.length) {
        audio.playError();
        // Shake animation could be triggered here
        return;
      }

      // Check if word is in dictionary (Optional, but good for UX)
      // For now, we just check if it's the target. If not, we process it as a guess.

      const result = checkGuess(currentGameState.currentGuess, currentGameState.targetWord);
      const newGuess = { word: currentGameState.currentGuess, result };

      // Incorrect guess - proceed as normal
      setGameState((prev: any) => {
        const nextState = {
          ...prev,
          guesses: [...prev.guesses, newGuess],
          currentGuess: '',
          status: prev.guesses.length + 1 >= 6 ? 'lost' : 'playing'
        };

        if (nextState.status === 'lost') audio.playLoss();

        return nextState;
      });
    } catch (error) {
      console.error('[handleWordEnter] Error:', error);
      alert(`Error in handleWordEnter: ${error}`);
    }
  };

  const handleSudokuInput = (char: string) => {
    const currentGameState = gameStateRef.current;
    if (!currentGameState?.selectedCell) return;
    const { r, c } = currentGameState.selectedCell;
    const newGrid = [...currentGameState.currentGrid];
    newGrid[r][c] = char;

    setGameState((prev: any) => ({ ...prev, currentGrid: newGrid }));
    audio.playClick();

    const isFull = newGrid.every((row: any) => row.every((cell: any) => cell !== null));
    if (isFull) {
      const isCorrect = JSON.stringify(newGrid) === JSON.stringify(currentGameState.data.sudokuGrid);
      if (isCorrect) {
        audio.playWin();
        // Move handleWin outside to prevent race condition
        if (gameConfig) {
          const { mode, tier, levelId } = gameConfig;
          setTimeout(() => handleWin(mode, tier, levelId, ''), 100); // Sudoku doesn't have a targetWord
        }
      }
    }
  }


  const handleWin = (mode: GameMode, tier: Tier, levelId: number, targetWord: string) => {
    try {
      console.log('[handleWin] Called with:', { mode, tier, levelId, targetWord });
      console.log('[handleWin] Current showWin state:', showWin);
      // Scaling Rewards
      let xpGain = tier * 20;
      let coinGain = tier * 5;

      // Challenge Mode Bonus
      if (mode === GameMode.CHALLENGE) {
        xpGain *= 2; // Double XP
        coinGain = tier * 80; // Net profit 30*Tier
      }

      console.log('[handleWin] Setting winStats:', { xp: xpGain, coins: coinGain });
      setWinStats({ xp: xpGain, coins: coinGain });
      console.log('[handleWin] Setting showWin to true');
      setShowWin(true);
      console.log('[handleWin] showWin set call completed');

      setUser(prev => {
        const newXp = prev.xp + xpGain;
        const oldLevel = Math.floor(prev.xp / 100) + 1;
        const newLevel = Math.floor(newXp / 100) + 1;

        // Level Up Check
        if (newLevel > oldLevel) {
          setTimeout(() => {
            setLevelUpData({ level: newLevel, xp: newXp });
            setShowLevelUp(true);
            audio.playWin(); // Extra fanfare
          }, 1000); // Show after Win modal appears
        }

        // Mark level as completed
        const levelKey = `${mode}_${tier}_${levelId}`;
        console.log('[handleWin] Marking level complete:', levelKey);
        const newCompleted = { ...prev.completedLevels, [levelKey]: true };

        // Add word to played history (if not already present)
        const newPlayedWords = targetWord && !prev.playedWords?.includes(targetWord)
          ? [...(prev.playedWords || []), targetWord]
          : (prev.playedWords || []);

        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          coins: prev.coins + coinGain,
          completedLevels: newCompleted,
          playedWords: newPlayedWords
        };
      });
    } catch (error) {
      console.error('[handleWin] Error:', error);
      alert(`Error in handleWin: ${error}`);
    }
  };
  const triggerHint = () => {
    setShowAd(true);
    const cost = 5 + (hintCostMultiplier * 10);
    setAdTimer(cost);
  };

  useEffect(() => {
    let interval: any;
    if (showAd && adTimer > 0) {
      interval = setInterval(() => setAdTimer(t => t - 1), 1000);
    } else if (showAd && adTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showAd, adTimer]);

  const closeAdAndReward = () => {
    if (adTimer > 0) return;
    setShowAd(false);
    setHintCostMultiplier(prev => prev + 1);

    const mode = gameConfig?.mode;

    // Sudoku Hint
    if (mode === GameMode.SUDOKU) {
      const puzzle = gameState.currentGrid;
      const solution = gameState.data.sudokuGrid;

      // Find empty cells
      const emptyCells = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!puzzle[r][c]) emptyCells.push({ r, c });
        }
      }

      if (emptyCells.length > 0) {
        const rand = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const correctChar = solution[rand.r][rand.c];

        setGameState((prev: any) => {
          const newGrid = [...prev.currentGrid];
          newGrid[rand.r][rand.c] = correctChar;
          return { ...prev, currentGrid: newGrid };
        });
      }
      return;
    }

    // Word Game Hint (Reveal next char in current row)
    if (gameState.status === 'playing') {
      const target = gameState.targetWord;
      const currentLen = gameState.currentGuess.length;

      if (currentLen < target.length) {
        const nextChar = target[currentLen];
        setGameState((prev: any) => ({
          ...prev,
          currentGuess: prev.currentGuess + nextChar,
          hintsUsed: (prev.hintsUsed || 0) + 1
        }));
      }
    }
  };

  const saveProfile = () => {
    // Validate Name
    if (editName.length > 20) return;
    const ageNum = parseInt(editAge.toString());
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) return;

    setUser(prev => ({
      ...prev,
      name: editName,
      age: ageNum,
      avatarId: editAvatar
    }));
    setShowProfile(false);
  };

  const deleteProfile = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    try {
      localStorage.removeItem('leximix_user');
    } catch (error) {
      console.error('[LexiMix] localStorage delete error:', error);
    }
    window.location.reload();
  };

  const openProfile = () => {
    setEditName(user.name || "");
    setEditAge(user.age || 18);
    setEditAvatar(user.avatarId || AVATARS[0]);
    setShowProfile(true);
  };

  const handleBuyItem = (item: ShopItem) => {
    if (item.type === 'currency') {
      if (item.paypalLink) {
        // Open PayPal Link
        window.open(item.paypalLink, '_blank');
      } else {
        // Simulate In-App Purchase (Fallback)
        audio.playWin(); // "Ca-ching"
        setUser(u => ({ ...u, coins: u.coins + (item.currencyAmount || 0) }));
        alert(`${t.SHOP.SUCCESS}: ${item.name}`);
      }
    } else {
      // Buy Avatar
      if (user.coins >= (item.cost as number)) {
        audio.playWin();
        setUser(u => ({
          ...u,
          coins: u.coins - (item.cost as number),
          ownedAvatars: [...(u.ownedAvatars || []), item.value as string]
        }));
      } else {
        audio.playError();
      }
    }
  };

  // --- Render Helpers ---

  const GameCard = ({ mode, title, desc, color, icon: Icon, locked = false, delay = 0 }: any) => (
    <button
      disabled={locked}
      onClick={() => handleModeSelect(mode)}
      className={`
        relative p-6 md:p-8 rounded-3xl text-left overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-95
        ${color} h-36 md:h-48 flex flex-col justify-between shadow-xl group animate-scale-in
        ${locked ? 'opacity-60 grayscale cursor-not-allowed' : ''}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute right-[-10px] top-[-10px] opacity-20 rotate-12 scale-125 group-hover:rotate-6 transition-transform duration-500">
        <Icon size={120} fill="currentColor" />
      </div>

      {locked ? (
        <div className="flex-1 flex flex-col justify-center items-center z-10">
          <Lock size={32} className="mb-2 text-gray-400" />
          <span className="font-bold text-xl text-gray-300 italic leading-none">{t.MODES.LOCKED.title}</span>
          <span className="text-xs text-gray-400 mt-1">{t.MODES.LOCKED.desc}</span>
        </div>
      ) : (
        <>
          <div className="relative z-10">
            <h3 className="font-black italic text-sm sm:text-base md:text-lg uppercase tracking-tight leading-none mb-2 drop-shadow-sm text-white">{title}</h3>
            <p className="text-[10px] sm:text-xs md:text-sm font-bold opacity-90 leading-tight max-w-full text-white/80 line-clamp-2">{desc}</p>
          </div>
          <div className="relative z-10 mt-1">
            <span className="bg-black/30 px-3 py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider border border-white/10 inline-flex items-center gap-1 text-white group-hover:bg-white group-hover:text-black transition-colors">
              <Play size={10} fill="currentColor" /> {t.HOME.PLAY}
            </span>
          </div>
        </>
      )}
    </button>
  );

  const renderOnboarding = () => {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-md relative z-10">
          {onboardingStep === 0 && (
            <div className="space-y-6 text-center animate-slide-up glass-panel p-8 rounded-3xl">
              <Globe size={64} className="mx-auto text-lexi-cyan mb-4 animate-spin-slow" />
              <h1 className="text-3xl font-black italic mb-8 text-transparent bg-clip-text bg-gradient-to-r from-lexi-text to-lexi-text-muted">{t.ONBOARDING.WELCOME}</h1>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setTempUser({ ...tempUser, language: Language.DE }); setOnboardingStep(1); audio.playClick(); }}
                  className="p-6 glass-button rounded-2xl hover:bg-lexi-fuchsia/20 hover:border-lexi-fuchsia transition-all group"
                >
                  <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform">🇩🇪</span>
                  <span className="font-bold">DEUTSCH</span>
                </button>
                <button
                  onClick={() => { setTempUser({ ...tempUser, language: Language.EN }); setOnboardingStep(1); audio.playClick(); }}
                  className="p-6 glass-button rounded-2xl hover:bg-lexi-cyan/20 hover:border-lexi-cyan transition-all group"
                >
                  <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform">🇺🇸</span>
                  <span className="font-bold">ENGLISH</span>
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 1 && (
            <div className="space-y-6 animate-slide-up glass-panel p-8 rounded-3xl">
              <div className="text-center">
                <User size={48} className="mx-auto text-lexi-fuchsia mb-4" />
                <h2 className="text-2xl font-bold mb-1">{t.ONBOARDING.NAME_TITLE}</h2>
              </div>
              <input
                type="text"
                maxLength={20}
                value={tempUser.name}
                onChange={(e) => setTempUser({ ...tempUser, name: e.target.value })}
                placeholder={t.ONBOARDING.NAME_PLACEHOLDER}
                className="w-full bg-gray-900 border-2 border-gray-700 rounded-xl p-4 text-center text-xl font-bold focus:border-lexi-fuchsia focus:outline-none transition-colors text-white"
                autoFocus
              />
              {tempUser.name.length === 20 && <p className="text-red-500 text-xs text-center font-bold">{t.ONBOARDING.ERR_NAME}</p>}

              <Button
                fullWidth
                disabled={!tempUser.name}
                onClick={() => { setOnboardingStep(2); audio.playClick(); }}
              >
                {t.ONBOARDING.CONTINUE}
              </Button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-6 animate-slide-up glass-panel p-8 rounded-3xl">
              <div className="text-center">
                <Settings size={48} className="mx-auto text-lexi-gold mb-4" />
                <h2 className="text-2xl font-bold mb-1">{t.ONBOARDING.AGE_TITLE}</h2>
              </div>
              <input
                type="number"
                min={1}
                max={120}
                value={tempUser.age}
                onChange={(e) => setTempUser({ ...tempUser, age: e.target.value })}
                placeholder={t.ONBOARDING.AGE_PLACEHOLDER}
                className="w-full bg-gray-900 border-2 border-gray-700 rounded-xl p-4 text-center text-xl font-bold focus:border-lexi-gold focus:outline-none transition-colors text-white"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleOnboardingComplete()}
              />
              <Button
                fullWidth
                disabled={!tempUser.age || parseInt(tempUser.age) < 1 || parseInt(tempUser.age) > 120}
                onClick={handleOnboardingComplete}
              >
                {t.ONBOARDING.START}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderSeasonPassView = () => {
    const levels = Array.from({ length: 100 }, (_, i) => i + 1);

    return (
      <div className="h-full flex flex-col animate-fade-in">
        <div className="p-4 bg-[#1e102e]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-20 shrink-0">
          <button onClick={() => setView('HOME')} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors border border-white/10">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{t.SEASON.TITLE}</h2>
          </div>
          <div className="w-10"></div>
        </div>

        {!user.isPremium && (
          <div className="p-4 flex flex-col items-center gap-4 border-b border-white/10 shrink-0">
            <button
              onClick={() => setShowPremiumInfo(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold uppercase hover:brightness-110 transition-all shadow-lg flex items-center gap-2"
            >
              <Info size={18} /> Premium Vorteile Ansehen
            </button>

            <h3 className="text-center text-sm font-bold text-gray-400 uppercase tracking-wider">Premium Pass Optionen</h3>

            <div className="w-full max-w-3xl grid grid-cols-2 gap-3">
              {/* Monthly Plan - 7,99€ */}
              <div className="bg-gradient-to-br from-purple-900/50 to-gray-900 border-2 border-purple-500/30 p-6 rounded-3xl">
                <div className="text-center mb-4">
                  <h4 className="text-2xl font-black text-yellow-400 mb-1">{PREMIUM_PLANS[0].cost}</h4>
                  <p className="text-xs text-gray-400">{PREMIUM_PLANS[0].duration}</p>
                </div>
                <ul className="text-xs space-y-2 mb-4">
                  {PREMIUM_PLANS[0].features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => window.open(`https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=${PREMIUM_PLANS[0].planId}`, "_blank")}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-black uppercase hover:scale-105 transition-transform shadow-lg"
                >
                  Monatlich Abonnieren
                </button>
              </div>

              {/* 30-Day Plan - 4,99€ */}
              <div className="bg-gradient-to-br from-blue-900/50 to-gray-900 border-2 border-blue-500/30 p-6 rounded-3xl">
                <div className="text-center mb-4">
                  <h4 className="text-2xl font-black text-cyan-400 mb-1">{PREMIUM_PLANS[1].cost}</h4>
                  <p className="text-xs text-gray-400">{PREMIUM_PLANS[1].duration}</p>
                </div>
                <ul className="text-xs space-y-2 mb-4">
                  {PREMIUM_PLANS[1].features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-300">
                      <span className="text-green-400">✓</span> {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => window.open(`https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=${PREMIUM_PLANS[1].planId}`, "_blank")}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-black uppercase hover:scale-105 transition-transform shadow-lg"
                >
                  30 Tage Kaufen
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowRedeemModal(true)}
              className="mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all active:scale-95"
            >
              {t.SEASON.REDEEM_CODE}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          <div className="max-w-2xl mx-auto w-full">
            {/* Tracks */}
            <div className="relative pt-8 pb-8">
              <div className="absolute left-[50%] top-0 bottom-0 w-1.5 bg-gray-800 -translate-x-1/2 rounded-full"></div>

              {levels.map((lvl, i) => {
                const isUnlocked = user.level >= lvl;
                const isPremiumNode = lvl % 2 === 0;
                const isClaimed = isUnlocked && (!isPremiumNode || user.isPremium);

                return (
                  <div
                    key={lvl}
                    className={`flex items-center mb-10 relative transition-all duration-500 ${isUnlocked ? 'opacity-100' : 'opacity-50 grayscale'}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Level Indicator */}
                    <div className={`absolute left-[50%] -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 border-lexi-dark z-10 transition-transform hover:scale-125
                                    ${isUnlocked ? 'bg-lexi-fuchsia text-white shadow-[0_0_20px_rgba(217,70,239,0.6)]' : 'bg-gray-800 text-gray-500'}
                                `}>
                      {lvl}
                    </div>

                    {/* Left Side: Free */}
                    <div className="flex-1 pr-10 text-right flex flex-col items-end">
                      {SEASON_REWARDS[lvl - 1]?.free && (
                        <div className={`bg-gray-800 p-4 rounded-2xl border border-white/10 w-36 md:w-44 flex flex-col items-center relative transition-all hover:scale-105 ${isClaimed ? 'ring-2 ring-green-500 bg-green-900/20' : ''}`}>
                          <Gem size={28} className="text-blue-400 mb-2" />
                          <span className="text-sm font-black text-white">{SEASON_REWARDS[lvl - 1].free.amount}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{SEASON_REWARDS[lvl - 1].free.name}</span>
                          {isClaimed && <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg"><Check size={12} /></div>}
                        </div>
                      )}
                    </div>

                    {/* Right Side: Premium */}
                    <div className="flex-1 pl-10">
                      {SEASON_REWARDS[lvl - 1]?.premium && (
                        <div className={`bg-gradient-to-br from-purple-900 to-gray-900 p-4 rounded-2xl border border-purple-500/30 w-36 md:w-44 flex flex-col items-center relative transition-all hover:scale-105 ${isClaimed ? 'ring-2 ring-yellow-400 bg-yellow-900/20' : ''}`}>
                          <Lock size={14} className={`absolute top-2 right-2 text-purple-400 ${user.isPremium ? 'hidden' : ''}`} />

                          {SEASON_REWARDS[lvl - 1].premium.type === 'avatar' ? (
                            <>
                              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400/30 mb-2">
                                <img src={SEASON_REWARDS[lvl - 1].premium.preview} alt={SEASON_REWARDS[lvl - 1].premium.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-xs font-black text-yellow-300 text-center leading-tight">{SEASON_REWARDS[lvl - 1].premium.name}</span>
                              <span className="text-[9px] text-yellow-100/60">{SEASON_REWARDS[lvl - 1].premium.desc}</span>
                            </>
                          ) : SEASON_REWARDS[lvl - 1].premium.type === 'cosmetic' ? (
                            <>
                              <Sparkles size={28} className="text-yellow-400 mb-2" fill="currentColor" />
                              <span className="text-xs font-black text-yellow-300 text-center leading-tight">{SEASON_REWARDS[lvl - 1].premium.name}</span>
                              <span className="text-[9px] text-yellow-100/60">{SEASON_REWARDS[lvl - 1].premium.desc}</span>
                            </>
                          ) : (
                            <>
                              <Gem size={28} className="text-blue-300 mb-2" />
                              <span className="text-sm font-black text-white">{SEASON_REWARDS[lvl - 1].premium.amount}</span>
                              <span className="text-[10px] font-bold text-gray-300 uppercase">{SEASON_REWARDS[lvl - 1].premium.name}</span>
                            </>
                          )}

                          {isClaimed && <div className="absolute -top-2 -left-2 bg-yellow-500 text-black rounded-full p-1 shadow-lg"><Check size={12} /></div>}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderShop = () => {
    return (
      <div className="h-full flex flex-col animate-fade-in glass-panel max-w-4xl mx-auto w-full rounded-none md:rounded-3xl overflow-hidden">
        {/* Shop Header */}
        <div className="p-4 glass-panel border-b border-lexi-border flex items-center justify-between z-20 sticky top-0 rounded-none">
          <button onClick={() => setView('HOME')} className="w-10 h-10 flex items-center justify-center rounded-full glass-button">
            <ArrowLeft size={20} className="text-lexi-text" />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag size={24} className="text-lexi-cyan" />
            <h2 className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-lexi-cyan to-blue-500 uppercase tracking-widest">{t.SHOP.TITLE}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowRedeemModal(true); setRedeemStep('code'); }}
              className="hidden md:flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white"
            >
              <Sparkles size={12} /> Gutschein
            </button>
            <div className="flex items-center gap-1 bg-black/50 px-3 py-1 rounded-full border border-white/10">
              <Gem size={14} className="text-blue-400" />
              <span className="text-sm font-bold">{Math.max(0, user.coins)}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {/* Mobile Redeem Button */}
          <div className="md:hidden w-full mb-4">
            <button
              onClick={() => { setShowRedeemModal(true); setRedeemStep('code'); }}
              className="w-full py-3 rounded-xl bg-gray-800/50 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Sparkles size={14} /> Gutschein einlösen
            </button>
          </div>

          {/* Avatar Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={16} /> {t.SHOP.AVATAR_SECTION}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SHOP_ITEMS.filter(i => i.type === 'avatar').map((item, idx) => {
                const isOwned = (user.ownedAvatars || []).includes(item.value as string);
                const isEquipped = user.avatarId === item.value;

                return (
                  <div
                    key={item.id}
                    className={`bg-gray-900/50 border ${isEquipped ? 'border-lexi-fuchsia bg-lexi-fuchsia/10' : 'border-white/10'} p-4 rounded-2xl flex flex-col items-center relative overflow-hidden group hover:border-lexi-fuchsia/50 transition-all animate-scale-in`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="w-20 h-20 bg-gray-800 rounded-full mb-3 overflow-hidden border-2 border-white/5 group-hover:scale-105 transition-transform">
                      <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${item.value}`} alt={item.name} />
                    </div>
                    <span className="text-sm font-bold text-white mb-1 text-center leading-tight">{item.name}</span>

                    <div className="mt-auto w-full">
                      {isOwned ? (
                        <button
                          disabled={isEquipped}
                          onClick={() => setUser({ ...user, avatarId: item.value as string })}
                          className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isEquipped ? 'bg-lexi-fuchsia text-white cursor-default' : 'glass-button'}`}
                        >
                          {isEquipped ? t.SHOP.EQUIPPED : t.SHOP.EQUIP}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuyItem(item)}
                          className="w-full py-2 rounded-lg bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 flex items-center justify-center gap-1"
                        >
                          <Gem size={10} className="text-blue-500" /> {item.cost}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Currency Section */}
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={16} /> {t.SHOP.CURRENCY_SECTION}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SHOP_ITEMS.filter(i => i.type === 'currency').map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 p-4 rounded-2xl flex flex-col items-center relative overflow-hidden group hover:border-blue-500/50 transition-all animate-scale-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="bg-blue-900/30 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform duration-500">
                    <Coins size={24} className="text-blue-300" />
                  </div>
                  <span className="text-lg font-black text-white mb-0 leading-none">{item.currencyAmount}</span>
                  <span className="text-[10px] text-blue-300 font-bold uppercase mb-3">{t.GAME.COINS_GAINED}</span>

                  <div className="w-full mt-auto">
                    {item.isRealMoney ? (
                      <button
                        onClick={() => handleBuyItem(item)}
                        className="px-2 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-black rounded-xl text-xs hover:scale-105 transition-transform shadow-[0_0_10px_rgba(234,179,8,0.3)] w-full uppercase flex flex-col items-center gap-0.5"
                      >
                        <span className="text-sm leading-none">{item.cost}</span>
                        <span className="text-[8px] font-bold opacity-80 leading-none">KAUFEN</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyItem(item)}
                        className="px-4 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-blue-50 transition-colors shadow-lg w-full"
                      >
                        {item.cost}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHome = () => (
    <div className="flex flex-col h-full p-6 w-full max-w-4xl mx-auto overflow-y-auto pb-10 scrollbar-hide animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 glass-panel p-4 rounded-3xl">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={openProfile}>
          <div className="w-16 h-16 bg-gradient-to-br from-lexi-surface-highlight to-lexi-surface rounded-2xl border border-lexi-border flex items-center justify-center shadow-inner relative overflow-hidden transition-transform group-hover:scale-105">
            <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.avatarId}`} alt="Avatar" className="w-14 h-14" />
          </div>
          <div>
            <div className={`font-bold text-2xl leading-none tracking-tight flex items-center gap-2 ${user.isPremium ? 'text-yellow-400 drop-shadow-sm' : ''}`}>
              {user.name} {user.isPremium && <CrownPattern className="w-4 h-4 text-yellow-500" />}
            </div>

            <div className="mt-2">
              <div className="text-[10px] text-lexi-text-muted font-bold tracking-widest uppercase flex flex-col items-start mb-1 gap-1">
                <span>{t.HOME.SEASON_LEVEL} {user.level}</span>
                <span className="text-lexi-fuchsia">{user.xp % 100}/100 XP</span>
              </div>
              <div className="h-1.5 w-32 bg-lexi-surface-highlight rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-lexi-fuchsia to-purple-500" style={{ width: `${user.xp % 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button onClick={() => setView('SHOP')} className="flex items-center gap-1 glass-button px-4 py-2 rounded-full text-lexi-text">
            <Gem size={16} className="text-blue-400" />
            <span className="text-sm font-bold">{Math.max(0, user.coins)}</span>
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-black font-bold ml-1">+</div>
          </button>
          <button
            onClick={() => setUser(u => ({ ...u, theme: u.theme === 'dark' ? 'light' : 'dark' }))}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-button text-[10px] font-bold text-lexi-text"
          >
            {user.theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={() => setUser(u => ({ ...u, language: u.language === Language.EN ? Language.DE : Language.EN }))}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-button text-[10px] font-bold text-lexi-text"
          >
            <Globe size={12} className="text-lexi-fuchsia animate-pulse-slow" />
            {user.language}
          </button>

          {/* Premium Status */}
          <PremiumStatus isPremium={user.isPremium} premiumActivatedAt={user.premiumActivatedAt} />
        </div>
      </header>

      {/* Logo Area */}
      <div className="flex flex-col items-center justify-center mb-8 relative animate-scale-in pt-4">
        <div className="relative flex items-center justify-center hover:scale-105 transition-transform duration-700">
          {/* Logo Image Only - Background cards removed to prevent double look */}

          {/* Text */}
          <img src="/logo_graphic.png" alt="LEXiMiX" className="relative z-10 h-56 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 invert dark:invert-0" />
        </div>
        <div className="mt-4 text-[10px] font-bold tracking-[0.5em] text-purple-200/60 uppercase animate-pulse">
          {t.HOME.TAGLINE}
        </div>
      </div>

      <div className="mb-8 w-full">
        <SeasonPass
          xp={user.xp}
          level={user.level}
          isPremium={user.isPremium}
          onBuyPremium={() => setView('SEASON')}
          lang={user.language}
        />
      </div>

      {/* Cloud Save Card */}
      <div className="mb-6 w-full px-2">
        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {cloudUsername ? (
              <>
                <div className="w-10 h-10 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center">
                  <User size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{cloudUsername}</p>
                  <p className="text-[10px] text-gray-400">
                    {lastCloudSync ? `Sync: ${new Date(lastCloudSync).toLocaleTimeString('de-DE')}` : 'Cloud Sync aktiv'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-gray-800 border border-white/10 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Cloud Save</p>
                  <p className="text-[10px] text-gray-400">Nicht angemeldet</p>
                </div>
              </>
            )}
          </div>
          {cloudUsername ? (
            <button
              onClick={handleCloudLogout}
              className="px-4 py-2 bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 rounded-xl text-xs font-bold uppercase transition-all"
            >
              Abmelden
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-xs font-bold uppercase hover:brightness-110 transition-all shadow-lg"
            >
              Anmelden
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
        <GameCard
          mode={GameMode.CLASSIC}
          title={t.MODES.CLASSIC.title}
          desc={t.MODES.CLASSIC.desc}
          color="bg-lexi-card-green"
          icon={Puzzle}
          delay={0}
        />
        <GameCard
          mode={GameMode.SPEEDRUN}
          title={t.MODES.SPEEDRUN.title}
          desc={t.MODES.SPEEDRUN.desc}
          color="bg-lexi-card-orange"
          icon={Zap}
          delay={50}
        />

        <GameCard
          mode={GameMode.CHAIN}
          title={t.MODES.CHAIN.title}
          desc={t.MODES.CHAIN.desc}
          color="bg-lexi-card-blue"
          icon={LinkIcon}
          delay={100}
        />
        <GameCard
          mode={GameMode.CATEGORY}
          title={t.MODES.CATEGORY.title}
          desc={t.MODES.CATEGORY.desc}
          color="bg-lexi-card-red"
          icon={BookOpen}
          delay={150}
        />

        <GameCard
          mode={GameMode.SUDOKU}
          title={t.MODES.SUDOKU.title}
          desc={t.MODES.SUDOKU.desc}
          color="bg-lexi-card-purple"
          icon={Grid3X3}
          delay={200}
        />
        <GameCard
          mode={GameMode.CHALLENGE}
          title={t.MODES.CHALLENGE.title}
          desc={t.MODES.CHALLENGE.desc}
          color="bg-lexi-card-dark border border-yellow-500/30"
          icon={Brain}
          delay={250}
        />
      </div>

      <div className="text-center text-[10px] text-lexi-text-muted font-bold mt-4 pb-8 uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
        Made by Kevin Wagner 2025
      </div>
    </div>
  );

  const renderLevels = () => (
    <div className="h-full overflow-y-auto animate-fade-in w-full max-w-4xl mx-auto">
      <div className="sticky top-0 z-20 glass-panel p-4 flex items-center justify-between rounded-b-3xl mb-4">
        <button onClick={() => setView('HOME')} className="w-10 h-10 flex items-center justify-center rounded-full glass-button">
          <ArrowLeft size={20} className="text-lexi-text" />
        </button>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          {t.MODES[gameConfig?.mode as keyof typeof t.MODES]?.title}
        </h2>
        <div className="px-4 py-2 rounded-full glass-button text-xs font-bold text-lexi-gold flex items-center gap-2">
          <User size={14} /> {user.level} {t.SEASON.LEVEL}
        </div>
      </div>

      <div className="p-8 w-full">
        {[Tier.BEGINNER, Tier.LEARNER, Tier.SKILLED, Tier.EXPERT, Tier.MASTER].map((tier, idx) => {
          const isLockedTier = tier > 2;
          const label = t.LEVELS.TIERS[tier - 1];
          const xpReward = tier * 20;

          return (
            <div key={tier} className="mb-12 animate-slide-up glass-panel p-6 rounded-3xl" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col items-start gap-1">
                  <div className={`text-sm sm:text-base md:text-lg font-black italic tracking-tight ${isLockedTier ? 'text-gray-600' : TIER_COLORS[tier]} drop-shadow-sm truncate max-w-[280px]`}>
                    {label}
                  </div>
                  {!isLockedTier && <span className="text-[10px] font-bold text-lexi-fuchsia bg-lexi-fuchsia/10 px-2 py-1 rounded border border-lexi-fuchsia/30 flex items-center gap-1"><Sparkles size={10} /> +{xpReward} XP</span>}
                </div>
                <div className="text-xs font-bold text-lexi-text-muted tracking-widest glass-button px-3 py-1.5 rounded cursor-default">
                  LEVEL {(tier - 1) * 50 + 1} — {tier * 50} {isLockedTier && <Lock size={12} className="inline ml-1" />}
                </div>
              </div>

              <div className="grid grid-cols-5 md:grid-cols-8 gap-3 md:gap-4">
                {Array.from({ length: 50 }).map((_, i) => {
                  const lvl = (tier - 1) * 50 + i + 1;
                  // Sequential Unlock Logic:
                  // Level 1 is always unlocked.
                  // Subsequent levels require the previous level to be completed.
                  const prevLevelKey = `${gameConfig?.mode}_${tier}_${lvl - 1}`;

                  let isUnlocked = false;

                  if (lvl === 1) {
                    // Very first level is always open
                    isUnlocked = true;
                  } else if (i === 0) {
                    // First level of a new tier (e.g. 51, 101, etc.)
                    // Check if the last level of the previous tier is done.
                    // Previous Tier Last Level ID: lvl - 1
                    const prevTierLastLevelKey = `${gameConfig?.mode}_${tier - 1}_${lvl - 1}`;
                    isUnlocked = !!user.completedLevels[prevTierLastLevelKey];
                  } else {
                    // Normal in-tier progression
                    isUnlocked = !!user.completedLevels[prevLevelKey];
                  }

                  if (isUnlocked) {
                    const levelKey = `${gameConfig?.mode}_${tier}_${lvl}`;
                    const isCompleted = user.completedLevels[levelKey];

                    return (
                      <button
                        key={lvl}
                        onClick={() => !isCompleted && handleLevelSelect(tier, lvl)}
                        disabled={isCompleted}
                        className={`aspect-square rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl
                             ${isCompleted
                            ? 'bg-green-600 border-green-500 text-white cursor-default shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                            : 'glass-button text-lexi-text hover:scale-110'}
                             relative group overflow-hidden transition-all`}
                      >
                        {!isCompleted && <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                        <span className={`relative z-10 ${!isCompleted ? 'group-hover:text-lexi-fuchsia' : ''} transition-colors`}>
                          {isCompleted ? <Check size={24} strokeWidth={4} /> : lvl}
                        </span>
                      </button>
                    )
                  }

                  return (
                    <button
                      key={lvl}
                      disabled={true}
                      className="aspect-square rounded-2xl flex items-center justify-center bg-lexi-bg/50 border border-lexi-border text-lexi-text-muted/50"
                    >
                      <Lock size={14} />
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );

  const renderTutorial = () => {
    const content = TUTORIALS[tutorialMode!]?.[user.language];
    if (!content) return null;

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-[#1e102e] w-full max-w-md rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden animate-scale-in">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lexi-fuchsia to-lexi-cyan animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>

          <div className="flex flex-col items-center mb-8">
            <Puzzle size={48} className="text-green-400 mb-4 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)] animate-bounce" fill="currentColor" fillOpacity={0.2} />
            <h2 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase">
              {content.title}
            </h2>
            <p className="text-[10px] font-bold text-gray-500 tracking-[0.3em] mt-1">{t.TUTORIAL.HEADER}</p>
          </div>

          <p className="text-center text-gray-300 mb-8 leading-relaxed font-medium">{content.text}</p>

          <div className="flex gap-3">
            <button
              onClick={() => setView('LEVELS')}
              className="flex-1 py-3 rounded-xl font-bold text-xs uppercase bg-gray-800 hover:bg-gray-700 text-gray-400 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} /> {t.TUTORIAL.BACK}
            </button>
            <button
              onClick={startGame}
              className="flex-[2] py-3 rounded-xl font-bold text-xs uppercase bg-gradient-to-r from-lexi-fuchsia to-purple-600 hover:brightness-110 shadow-[0_0_20px_rgba(217,70,239,0.4)] flex items-center justify-center gap-2 text-white transition-all active:scale-95"
            >
              {t.TUTORIAL.START} <Play size={14} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderGame = () => {
    if (!gameState) return null;
    const isSudoku = gameConfig?.mode === GameMode.SUDOKU;
    const isSpeedrun = gameConfig?.mode === GameMode.SPEEDRUN;
    const isChallenge = gameConfig?.mode === GameMode.CHALLENGE;
    const showTimer = gameState.timeLeft !== undefined;

    // Determine Help Text based on Mode for "Info Bar"
    let infoText = "Good Luck!";
    if (isSudoku) infoText = "Fill grid (A-I). No repeats.";
    else if (gameState.isMath) infoText = "Solve the math expression.";
    else infoText = `${gameState.targetWord.length} ${t.GAME.INFO_BAR}`;

    return (
      <div className="flex flex-col h-full max-h-screen relative z-10">
        {/* Header - Made more compact */}
        <div className="pt-4 pb-2 px-4 md:px-8 text-center relative glass-panel mb-4 mx-4 rounded-3xl mt-4">
          <button onClick={() => setView('LEVELS')} className="absolute left-4 top-4 w-10 h-10 flex items-center justify-center glass-button rounded-full"><ArrowLeft size={20} className="text-lexi-text" /></button>

          <div className="inline-block px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-widest mb-2 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
            {gameState.hintTitle || (isSudoku ? t.GAME.SUDOKU_TITLE : t.GAME.CLASSIC_TITLE)}
          </div>

          <h1 className="text-2xl md:text-4xl font-black italic text-lexi-text drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] animate-slide-up leading-tight mb-2">
            "{gameState.hintDesc || (isSudoku ? t.GAME.SUDOKU_DESC : "...")}" <span className="text-xs text-red-500">[{gameState.targetWord}]</span>
          </h1>

          {/* Info Status Bar */}
          <div className={`flex items-center justify-center gap-2 text-xs font-mono py-1 px-3 rounded-full inline-block border transition-colors duration-300 glass-button text-lexi-text-muted`}>
            <Info size={12} />
            {infoText}
          </div>

          {/* Timer (Speedrun / Challenge) */}
          {showTimer && (
            <div className={`mt-2 text-3xl font-mono font-black flex items-center justify-center gap-2 drop-shadow-lg ${gameState.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
              <Clock size={24} /> {gameState.timeLeft}s
            </div>
          )}

          <button onClick={triggerHint} className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center bg-yellow-500/20 rounded-full border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.2)] animate-pulse-slow">
            <HelpCircle size={20} />
          </button>
        </div>

        {/* Game Board - Scrollable container with proper centering */}
        <div className="flex-1 overflow-y-auto scrollbar-hide w-full relative">
          <div className="min-h-full flex flex-col items-center justify-center p-4">
            {isSudoku ? (
              <SudokuBoard
                puzzle={gameState.currentGrid}
                original={gameState.data.sudokuPuzzle}
                selectedCell={gameState.selectedCell}
                onCellClick={(r: number, c: number) => setGameState((prev: any) => ({ ...prev, selectedCell: { r, c } }))}
              />
            ) : (
              <WordGrid
                guesses={gameState.guesses}
                currentGuess={gameState.currentGuess}
                targetLength={gameState.targetWord.length}
                turn={gameState.guesses.length}
              />
            )}

            {/* Confirmation Prompt Removed */}
          </div>
        </div>

        {/* Controls - Keyboard */}
        <div className={`p-2 pb-6 glass-panel border-t border-lexi-border shrink-0 ${!isSudoku ? 'md:hidden' : ''} rounded-t-3xl`}>
          {isSudoku ? (
            <div className="grid grid-cols-9 gap-2 max-w-3xl mx-auto animate-slide-up p-2">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((char, i) => (
                <button
                  key={char}
                  onClick={() => handleSudokuInput(char)}
                  className="h-14 glass-button rounded-xl text-lexi-cyan text-xl font-bold active:bg-lexi-cyan active:text-black transition-colors hover:scale-105"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {char}
                </button>
              ))}
            </div>
          ) : (
            <Keyboard
              isMathMode={gameState.isMath}
              onChar={handleWordKey}
              onDelete={handleWordDelete}
              onEnter={handleWordEnter}
              t={t}
              usedKeys={gameState.guesses.reduce((acc: any, g: any) => {
                g.word.split('').forEach((char: string, i: number) => {
                  if (g.result[i] === 'correct') acc[char] = 'correct';
                  else if (g.result[i] === 'present' && acc[char] !== 'correct') acc[char] = 'present';
                  else if (!acc[char]) acc[char] = 'absent';
                });
                return acc;
              }, {})}
            />
          )}
        </div>
      </div>
    );
  };

  // Helper component for crown svg
  const CrownPattern = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M2 20h20v-2H2v2zm2-12l2 5h2l-2-5-2 5zm6 0l2 5h2l-2-5-2 5zm6 0l2 5h2l-2-5-2 5z" />
      <path d="M12 2l-3 6 3 2 3-2-3-6z" opacity="0.5" />
    </svg>
  );

  return (
    <div className={`${user.theme} h-screen w-full text-lexi-text font-sans overflow-hidden relative selection:bg-lexi-fuchsia selection:text-white py-4 transition-colors duration-300 ${user.theme === 'dark' ? 'bg-lexi-bg' : 'bg-gradient-to-br from-gray-200 to-gray-300'}`}>
      {/* Simplified grain texture using CSS */}
      <div className="fixed inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '180px 180px'
      }}></div>
      {/* Dynamic Background Layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/15 via-transparent to-blue-900/15 pointer-events-none"></div>

      {view === 'ONBOARDING' && renderOnboarding()}
      {view === 'HOME' && renderHome()}
      {view === 'SEASON' && renderSeasonPassView()}
      {view === 'LEVELS' && renderLevels()}
      {view === 'GAME' && renderGame()}
      {view === 'TUTORIAL' && renderTutorial()}
      {/* Navigation Icons */}

      {/* Auth Screen (First screen) */}
      {view === 'AUTH' && (
        <div className="h-full flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center space-y-4">
              <img src="/logo.png" alt="LexiMix" className="w-32 h-32 mx-auto invert dark:invert-0" />
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-lexi-cyan to-lexi-fuchsia uppercase tracking-wider">
                LexiMix
              </h1>
              <p className="text-gray-400 text-sm">
                Melde dich an um zu spielen
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full py-4 bg-gradient-to-r from-lexi-fuchsia to-purple-600 text-white font-black uppercase rounded-xl hover:brightness-110 transition-all shadow-lg"
              >
                Anmelden / Registrieren
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'SHOP' && renderShop()}

      {/* Ad/Hint Modal */}
      <Modal isOpen={showAd} title={t.GAME.HINT_MODAL_TITLE}>
        <div className="flex flex-col items-center justify-center py-6 space-y-6">
          <div className="w-full h-32 bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
            <span className="text-center text-xs text-gray-500 uppercase font-bold tracking-widest whitespace-pre-line">
              {t.GAME.AD_SIM}
            </span>
          </div>
          <div className="text-4xl font-mono text-lexi-fuchsia font-bold drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
            {adTimer > 0 ? `00:0${adTimer}` : t.GAME.REWARD}
          </div>
          {hintCostMultiplier > 0 && (
            <div className="text-xs text-red-400 font-bold uppercase tracking-wider">
              {t.GAME.HINT_COST_PREFIX}{hintCostMultiplier * 10}{t.GAME.HINT_COST_SUFFIX}
            </div>
          )}
          <Button
            fullWidth
            disabled={adTimer > 0}
            variant={adTimer > 0 ? 'ghost' : 'primary'}
            onClick={closeAdAndReward}
            className="transition-all duration-300"
          >
            {adTimer > 0 ? t.GAME.WATCHING : t.GAME.CLAIM}
          </Button>
        </div>
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={showProfile} onClose={() => setShowProfile(false)} title={t.PROFILE.TITLE}>
        <div className="flex flex-col space-y-6 pt-4">
          <div className="flex justify-center">
            <div className="relative group cursor-pointer" onClick={() => {
              // Only allow selecting owned avatars
              const owned = user.ownedAvatars || [AVATARS[0]];
              const currentIndex = owned.indexOf(editAvatar);
              const nextIndex = (currentIndex + 1) % owned.length;
              setEditAvatar(owned[nextIndex]);
            }}>
              <div className="w-32 h-32 bg-gray-800 rounded-full overflow-hidden border-4 border-lexi-fuchsia shadow-2xl transition-transform group-hover:scale-105">
                <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${editAvatar}`} alt="Avatar" />
              </div>
              <div className="absolute bottom-0 right-0 bg-gray-900 rounded-full p-3 border border-white/20 text-white">
                <Edit2 size={18} />
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 font-bold">
            Click avatar to cycle through your owned collection
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.PROFILE.NAME}</label>
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-lg text-white focus:border-lexi-fuchsia outline-none font-bold"
              value={editName}
              maxLength={20}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{t.PROFILE.AGE}</label>
            <input
              type="number"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-lg text-white focus:border-lexi-fuchsia outline-none font-bold"
              value={editAge}
              min={1} max={120}
              onChange={(e) => setEditAge(parseInt(e.target.value) || 0)}
            />
          </div>

          <Button fullWidth onClick={saveProfile}>{t.PROFILE.SAVE}</Button>

          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Avatar</h3>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto scrollbar-hide">
              {(user.ownedAvatars || [AVATARS[0]]).map(avatar => (
                <button
                  key={avatar}
                  onClick={() => setEditAvatar(avatar)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all ${editAvatar === avatar ? 'border-lexi-fuchsia scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${avatar}`} alt="Avatar" />
                  {editAvatar === avatar && <div className="absolute inset-0 bg-lexi-fuchsia/20"></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-2">
            <button
              onClick={deleteProfile}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase bg-red-900/20 text-red-500 hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2"
            >
              <Skull size={14} /> Delete Profile
            </button>
          </div>
        </div>
      </Modal>

      {/* Level Up Modal */}
      <Modal isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} title={t.GAME.LEVEL_UP || 'Level Up'}>
        <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-lexi-fuchsia/20 to-transparent animate-pulse-slow"></div>

          <div className="relative">
            <div className="absolute inset-0 bg-lexi-fuchsia blur-3xl opacity-50 animate-pulse"></div>
            <div className="w-32 h-32 bg-gradient-to-br from-lexi-fuchsia to-purple-800 rounded-full flex items-center justify-center border-4 border-white/20 shadow-[0_0_50px_rgba(217,70,239,0.6)] relative z-10 animate-bounce">
              <span className="text-6xl font-black text-white drop-shadow-lg">{levelUpData.level}</span>
            </div>
          </div>

          <div className="relative z-10 space-y-2">
            <h3 className="text-2xl font-black italic text-white">AGENT PROMOTED</h3>
            <p className="text-gray-400 font-bold">Total XP: {levelUpData.xp}</p>
          </div>
          <Button fullWidth onClick={() => setShowLevelUp(false)}>CONTINUE</Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="⚠️ PROFIL LÖSCHEN">
        <div className="flex flex-col items-center justify-center py-6 space-y-6 text-center">
          <div className="bg-red-900/30 border-2 border-red-500 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Skull className="text-red-500" size={32} />
              <h3 className="text-2xl font-black text-red-500 uppercase">Achtung!</h3>
              <Skull className="text-red-500" size={32} />
            </div>

            <div className="text-left space-y-3 text-sm">
              <p className="font-bold text-white">
                Diese Aktion löscht <span className="text-red-400 underline">UNWIDERRUFLICH</span>:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Deinen gesamten Spielfortschritt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Alle gesammelten Münzen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Season Pass Level & XP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span><strong className="text-yellow-400">Gekaufte Premium-Pässe</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span><strong className="text-yellow-400">Gekaufte Coin-Pakete</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Alle freigespielten Avatare</span>
                </li>
              </ul>

              <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-3 mt-4">
                <p className="text-red-400 font-bold text-xs">
                  ⚠️ Diese Aktion kann NICHT rückgängig gemacht werden!
                </p>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={confirmDelete}
              className="w-full py-4 rounded-xl font-black text-sm uppercase bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/50"
            >
              <Skull size={18} />
              JA, ALLES LÖSCHEN
            </button>

            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="w-full py-4 rounded-xl font-bold text-sm uppercase bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </Modal>

      {/* Win Modal */}
      <Modal isOpen={showWin} onClose={() => setShowWin(false)} title={t.GAME.WIN_TITLE}>
        <div className="text-center py-6">
          <div className="inline-block p-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)] relative">
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-yellow-500"></div>
            <Trophy className="text-yellow-400 drop-shadow-lg relative z-10 animate-pulse-fast" size={64} />
          </div>
          <div className="text-3xl font-black italic mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300">{t.GAME.WIN_DESC}</div>

          {/* Stats */}
          <div className="flex justify-center gap-4 mb-8 mt-4">
            <div className="bg-gray-800/50 p-3 rounded-xl border border-white/10 min-w-[100px] flex flex-col items-center animate-scale-in" style={{ animationDelay: '100ms' }}>
              <Sparkles className="text-lexi-fuchsia mb-1" size={20} />
              <span className="text-xl font-bold text-white">{winStats.xp}</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">{t.GAME.XP_GAINED}</span>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-xl border border-white/10 min-w-[100px] flex flex-col items-center animate-scale-in" style={{ animationDelay: '200ms' }}>
              <Gem className="text-blue-400 mb-1" size={20} />
              <span className="text-xl font-bold text-white">{winStats.coins}</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">{t.GAME.COINS_GAINED}</span>
            </div>
          </div>

          {/* Level Up Progress */}
          <div className="mb-8 px-4">
            <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
              <span>LVL {user.level}</span>
              <span>{(user.xp % 100)} / 100 XP</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-lexi-fuchsia to-purple-600 transition-all duration-1000 ease-out" style={{ width: `${user.xp % 100}%` }}></div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" variant="secondary" onClick={() => { setShowWin(false); setView('LEVELS'); }}>
              Zurück zur Übersicht
            </Button>
            <Button className="flex-1" onClick={() => { setShowWin(false); handleNextLevel(); }}>
              Nächstes Level
            </Button>
          </div>
        </div>
      </Modal>

      {/* Game Over Modal */}
      <Modal isOpen={gameState?.status === 'lost'} onClose={() => setView('LEVELS')} title="MISSION FAILED">
        <div className="text-center py-6">
          <div className="inline-block p-6 rounded-full bg-red-500/10 border border-red-500/20 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] relative">
            <Skull className="text-red-500 drop-shadow-lg relative z-10 animate-pulse" size={64} />
          </div>

          <div className="text-3xl font-black italic mb-2 tracking-tight text-white">GAME OVER</div>

          <div className="mb-8">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">TARGET IDENTIFIED</p>
            <div className="text-4xl font-mono font-black text-lexi-cyan drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              {gameState?.targetWord}
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1" variant="secondary" onClick={() => setView('LEVELS')}>MENU</Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-500 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              onClick={() => {
                const mode = gameConfig!.mode;

                if (mode === GameMode.SUDOKU) {
                  setGameState((prev: any) => ({
                    ...prev,
                    currentGrid: JSON.parse(JSON.stringify(prev.data.sudokuPuzzle)),
                    selectedCell: null,
                    history: [],
                    status: 'playing'
                  }));
                } else if (mode === GameMode.CHALLENGE) {
                  const data = generateChallenge(user.language, gameConfig!.tier, gameConfig!.levelId);
                  setGameState({
                    targetWord: data.target,
                    hintTitle: "CHALLENGE",
                    hintDesc: data.question,
                    guesses: [],
                    currentGuess: '',
                    status: 'playing',
                    hintsUsed: 0,
                    isMath: data.type === 'math',
                    timeLeft: data.timeLimit
                  });
                } else {
                  const content = getLevelContent(
                    mode,
                    gameConfig!.tier,
                    gameConfig!.levelId,
                    user.language,
                    user.playedWords || []
                  );
                  setGameState({
                    guesses: [],
                    currentGuess: '',
                    status: 'playing',
                    targetWord: content.target,
                    hintTitle: content.hintTitle,
                    hintDesc: content.hintDesc,
                    timeLeft: content.timeLimit,
                    startTime: Date.now(),
                    hintsUsed: 0,
                    isMath: false,
                    isHintUnlocked: false
                  });
                }
              }}
            >
              RETRY
            </Button>
          </div>
        </div>
      </Modal>

      {/* Redeem Code Modal */}
      <Modal
        isOpen={showRedeemModal}
        onClose={() => {
          setShowRedeemModal(false);
          setRedeemCode('');
          setRedeemStep('code');
          setSelectedPlanIndex(null);
          setRedeemError(null);
        }}
        title={redeemStep === 'code' ? t.SEASON.REDEEM_CODE : 'Plan Auswählen'}
      >
        <div className="text-center py-6 space-y-6">
          {redeemStep === 'code' ? (
            <>
              <div className="inline-block p-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-4 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                <Star className="text-yellow-400 drop-shadow-lg" size={48} fill="currentColor" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-300">Aktivierungscode eingeben</h3>
                <p className="text-xs text-gray-500">Format: LEXIMIX-XXXX-XXXX-XXXX</p>
              </div>

              <div className="w-full">
                <input
                  type="text"
                  value={redeemCode}
                  onChange={(e) => {
                    setRedeemCode(e.target.value.toUpperCase());
                    setRedeemError(null);
                  }}
                  placeholder={t.SEASON.CODE_PLACEHOLDER}
                  className={`w-full bg-gray-900 border-2 ${redeemError ? 'border-red-500 animate-shake' : 'border-gray-700 focus:border-yellow-400'} rounded-xl p-4 text-center text-sm font-mono font-bold focus:outline-none transition-colors text-white uppercase`}
                  maxLength={24}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const trimmedCode = redeemCode.trim();

                      // Check Coin Codes
                      if (COIN_CODES.includes(trimmedCode)) {
                        if (user.redeemedCodes?.includes(trimmedCode)) {
                          setRedeemError("Code bereits verwendet!");
                          audio.playError();
                          return;
                        }

                        audio.playWin();
                        setUser(u => ({
                          ...u,
                          coins: u.coins + 1000,
                          redeemedCodes: [...(u.redeemedCodes || []), trimmedCode]
                        }));
                        alert("Code erfolgreich eingelöst! +1000 Münzen");
                        setShowRedeemModal(false);
                        setRedeemCode('');
                        setRedeemError(null);
                        return;
                      }

                      // Check Premium Codes
                      if (VALID_CODES.includes(trimmedCode)) {
                        audio.playWin();
                        const plan = PREMIUM_PLANS[1];
                        const levelBoost = plan.levelBoost || 0;

                        setUser(u => ({
                          ...u,
                          isPremium: true,
                          level: u.level + levelBoost,
                          xp: (u.level + levelBoost - 1) * 100
                        }));

                        alert(`Premium Aktiviert! Willkommen, Legende.`);

                        setShowRedeemModal(false);
                        setRedeemCode('');
                        setRedeemStep('code');
                        setSelectedPlanIndex(null);
                        setRedeemError(null);
                        return;
                      }

                      setRedeemError(t.SEASON.INVALID_CODE);
                      audio.playError();
                    }
                  }}
                />
                {redeemError && (
                  <div className="mt-2 text-red-500 text-xs font-bold animate-pulse flex items-center justify-center gap-1">
                    <AlertTriangle size={12} /> {redeemError}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() => {
                    setShowRedeemModal(false);
                    setRedeemCode('');
                    setRedeemStep('code');
                    setRedeemError(null);
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:brightness-110"
                  onClick={() => {
                    const trimmedCode = redeemCode.trim();

                    // Check Coin Codes
                    if (COIN_CODES.includes(trimmedCode)) {
                      if (user.redeemedCodes?.includes(trimmedCode)) {
                        setRedeemError("Code bereits verwendet!");
                        audio.playError();
                        return;
                      }

                      audio.playWin();
                      setUser(u => ({
                        ...u,
                        coins: u.coins + 1000,
                        redeemedCodes: [...(u.redeemedCodes || []), trimmedCode]
                      }));
                      alert("Code erfolgreich eingelöst! +1000 Münzen");
                      setShowRedeemModal(false);
                      setRedeemCode('');
                      setRedeemError(null);
                      return;
                    }

                    // Check Premium Codes
                    if (VALID_CODES.includes(trimmedCode)) {
                      // Code is valid, immediately activate Standard Premium (30 days)
                      audio.playWin();

                      // Standard Plan is index 1 (30 days)
                      const plan = PREMIUM_PLANS[1];
                      const levelBoost = plan.levelBoost || 0;

                      setUser(u => ({
                        ...u,
                        isPremium: true,
                        level: u.level + levelBoost,
                        xp: (u.level + levelBoost - 1) * 100
                      }));

                      alert(`Premium Aktiviert! Willkommen, Legende.`);

                      setShowRedeemModal(false);
                      setRedeemCode('');
                      setRedeemStep('code');
                      setSelectedPlanIndex(null);
                      setRedeemError(null);
                      return;
                    }

                    setRedeemError(t.SEASON.INVALID_CODE);
                    audio.playError();
                  }}
                >
                  Code Einlösen
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="inline-block p-6 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <Star className="text-purple-400 drop-shadow-lg" size={48} fill="currentColor" />
              </div>

              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-bold text-gray-300">Welchen Pass hast du gekauft?</h3>
                <p className="text-xs text-gray-500">Wähle den gekauften Premium Pass</p>
              </div>

              {/* Plan Selection Cards */}
              <div className="space-y-3">
                {PREMIUM_PLANS.map((plan, index) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanIndex(index)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedPlanIndex === index
                      ? 'border-lexi-gold bg-lexi-gold/10 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                      : 'border-lexi-border bg-lexi-surface-highlight/50 hover:border-lexi-text-muted'
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-black text-base text-lexi-text">{plan.cost}</h4>
                        <p className="text-xs text-lexi-text-muted">{plan.duration}</p>
                      </div>
                      {plan.levelBoost > 0 && (
                        <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg text-xs font-bold">
                          +{plan.levelBoost} Level
                        </div>
                      )}
                    </div>
                    <ul className="text-xs space-y-1">
                      {plan.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-lexi-text-muted">
                          <span className="text-green-400">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() => {
                    setRedeemStep('code');
                    setSelectedPlanIndex(null);
                  }}
                >
                  Zurück
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:brightness-110"
                  disabled={selectedPlanIndex === null}
                  onClick={() => {
                    if (selectedPlanIndex === null) return;

                    const plan = PREMIUM_PLANS[selectedPlanIndex];
                    const levelBoost = plan.levelBoost || 0;

                    setUser(u => ({
                      ...u,
                      isPremium: true,
                      level: u.level + levelBoost,
                      xp: (u.level + levelBoost - 1) * 100
                    }));

                    audio.playWin();

                    if (levelBoost > 0) {
                      alert(`Premium Aktiviert! 🎁 Du hast ${levelBoost} Stufen freigeschaltet! Willkommen, Legende.`);
                    } else {
                      alert(`Premium Aktiviert! Willkommen, Legende.`);
                    }

                    setShowRedeemModal(false);
                    setRedeemCode('');
                    setRedeemStep('code');
                    setSelectedPlanIndex(null);
                  }}
                >
                  Aktivieren
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Premium Info Modal */}
      <Modal isOpen={showPremiumInfo} onClose={() => setShowPremiumInfo(false)} title="Premium Vorteile">
        <div className="py-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <Star className="text-white" size={48} fill="currentColor" />
            </div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Werde Premiummitglied!
            </h3>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-4">
              <h4 className="font-bold text-purple-300 mb-3 flex items-center gap-2">
                <Sparkles size={18} /> Exklusive Features
              </h4>
              <ul className="space-y-2 text-sm text-lexi-text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span><strong>Challenge Mode:</strong> Zugriff auf Premium Herausforderungen</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span><strong>Schnellere Hinweise:</strong> Reduzierte Wartezeiten</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span><strong>Goldener Name:</strong> Hebe dich von anderen ab</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  <span><strong>Exklusive Avatare:</strong> Freischaltung seltener Skins</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border border-yellow-500/30 rounded-xl p-4">
              <h4 className="font-bold text-yellow-300 mb-3 flex items-center gap-2">
                <Zap size={18} /> Zwei Optionen
              </h4>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="font-bold text-purple-300 mb-1">Monatlich (7,99€)</p>
                  <p className="text-xs">🎁 Sofort +10 Stufen Boost + alle Premium Features</p>
                </div>
                <div className="bg-black/30 rounded-lg p-3">
                  <p className="font-bold text-cyan-300 mb-1">30 Tage (4,99€)</p>
                  <p className="text-xs">⚡ Selbst hocharbeiten + alle Premium Features</p>
                </div>
              </div>
            </div>
          </div>

          <Button fullWidth onClick={() => setShowPremiumInfo(false)} variant="primary">
            Verstanden
          </Button>
        </div>
      </Modal>

      {/* Premium Required Modal */}
      <Modal isOpen={showPremiumRequiredModal} onClose={() => setShowPremiumRequiredModal(false)} title="Premium Erforderlich">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border-2 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <Lock size={32} className="text-yellow-500" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">Challenge Mode Gesperrt</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Dieser Modus ist exklusiv für Premium-Mitglieder. Hole dir den Season Pass, um tägliche Herausforderungen und exklusive Belohnungen freizuschalten!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => { setShowPremiumRequiredModal(false); setView('SEASON'); }}
              fullWidth
              className="bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black border-none hover:brightness-110"
            >
              Zum Season Pass
            </Button>
            <Button
              onClick={() => setShowPremiumRequiredModal(false)}
              fullWidth
              className="bg-transparent border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
            >
              Vielleicht später
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cloud Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleCloudLogin}
      />

    </div>
  );
}