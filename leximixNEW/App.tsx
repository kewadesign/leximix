
import React, { useState, useEffect, useRef } from 'react';
import { GameMode, Tier, UserState, Language, GameConfig, ShopItem } from './types';
import { Button, Modal } from './components/UI';
import { SeasonPass } from './components/SeasonPass';
import { TIER_COLORS, TIER_BG, TUTORIALS, TRANSLATIONS, AVATARS, MATH_CHALLENGES, SHOP_ITEMS } from './constants';
import { getLevelContent, checkGuess, generateSudoku, generateChallenge } from './utils/gameLogic';
import { audio } from './utils/audio';
import { Trophy, ArrowLeft, HelpCircle, Gem, Lock, User, Globe, Puzzle, Zap, Link as LinkIcon, BookOpen, Grid3X3, Play, Check, Star, Clock, Sparkles, Settings, Edit2, Skull, Brain, Info, ShoppingBag, Coins, CreditCard } from 'lucide-react';

// --- Sub Components for Game Logic ---

const Keyboard = ({ onChar, onDelete, onEnter, usedKeys, isMathMode }: any) => {
  const rows = isMathMode ? [
      ['1','2','3'],
      ['4','5','6'],
      ['7','8','9'],
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
            let bg = "bg-gray-800 text-white hover:bg-gray-700";
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
             <button onClick={onDelete} className="bg-gray-700 hover:bg-gray-600 h-12 sm:h-14 px-4 sm:px-6 rounded-lg text-sm uppercase font-bold active:scale-95 border-b-4 border-black/20 transition-all">
               Del
            </button>
          )}
        </div>
      ))}
      <button onClick={onEnter} className="w-full bg-gradient-to-r from-lexi-fuchsia to-purple-600 h-14 sm:h-16 rounded-xl font-black text-lg mt-3 active:scale-95 uppercase shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:brightness-110 transition-all text-white tracking-widest">
        Enter Guess
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
             <div key={i} className={`aspect-square flex items-center justify-center rounded-lg border-4 ${currentGuess[i] ? 'border-lexi-fuchsia text-white bg-lexi-fuchsia/20 animate-pulse shadow-[0_0_15px_rgba(217,70,239,0.3)]' : 'border-gray-800 bg-gray-900/50'} font-mono font-bold text-2xl md:text-3xl uppercase transition-colors duration-200`}>
               {currentGuess[i] || ''}
             </div>
           ))}
        </div>
      )}

      {empties.map((_, i) => (
        <div key={`empty-${i}`} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${targetLength}, 1fr)` }}>
          {Array(targetLength).fill(null).map((__, j) => (
            <div key={j} className="aspect-square rounded-lg border-2 border-gray-800/30 bg-gray-900/10"></div>
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
        <div className="absolute inset-0 border-4 border-[#4a2b6b] rounded-2xl bg-[#1e102e] shadow-2xl"></div>

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
                                ${!isSelected && isFixed ? 'text-gray-500 bg-[#130b1f]' : ''}
                                ${!isSelected && !isFixed ? 'text-cyan-400 bg-[#1a1225] hover:bg-gray-800' : ''}
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
    const saved = localStorage.getItem('leximix_user');
    return saved ? JSON.parse(saved) : {
      name: 'Agent',
      age: 0,
      avatarId: AVATARS[0],
      ownedAvatars: [AVATARS[0]],
      xp: 0, level: 1, coins: 0, isPremium: true, // PREMIUM ENABLED FOR EVERYONE TEMPORARILY
      completedLevels: {}, language: Language.DE
    };
  });

  // Check for saved user on mount to decide initial view
  useEffect(() => {
     const saved = localStorage.getItem('leximix_user');
     if (!saved) {
         setView('ONBOARDING');
     }
  }, []);

  const t = TRANSLATIONS[view === 'ONBOARDING' ? tempUser.language : user.language]; // Handle lang during onboarding

  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  
  // Modals
  const [showAd, setShowAd] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [hintCostMultiplier, setHintCostMultiplier] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [tutorialMode, setTutorialMode] = useState<GameMode | null>(null);
  const [winStats, setWinStats] = useState({ xp: 0, coins: 0 });

  // Edit Profile State
  const [editName, setEditName] = useState(user.name || "Agent");
  const [editAge, setEditAge] = useState(user.age || 18);
  const [editAvatar, setEditAvatar] = useState(user.avatarId || AVATARS[0]);

  useEffect(() => {
    if (view !== 'ONBOARDING') {
        localStorage.setItem('leximix_user', JSON.stringify(user));
    }
  }, [user, view]);

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
      if (gameState?.status !== 'playing') return;

      const key = e.key.toUpperCase();
      const isSudoku = gameConfig.mode === GameMode.SUDOKU;

      // Sudoku Input
      if (isSudoku) {
         if (['A','B','C','D','E','F','G','H','I'].includes(key)) {
             handleSudokuInput(key);
         }
         return;
      }

      // Math Mode Input
      if (gameState.isMath) {
         if (['BACKSPACE', 'DELETE'].includes(key)) {
             handleWordDelete();
         } else if (key === 'ENTER') {
             handleWordEnter();
         } else if (/^[0-9+\-*/]$/.test(key)) {
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
  }, [view, gameState, gameConfig]);


  const handleModeSelect = (mode: GameMode) => {
    audio.playClick();
    
    if (mode === GameMode.CHALLENGE) {
        if (user.coins < 50) {
            // audio.playError(); // Disabled for test
        }
        setUser(u => ({...u, coins: Math.max(0, u.coins - 50)})); // Prevent negative
    }

    setGameConfig({ mode, tier: Tier.BEGINNER, levelId: 1 }); // Default
    setView('LEVELS');
  };

  const handleLevelSelect = (tier: Tier, levelId: number) => {
    audio.playClick();
    if (!gameConfig) return;
    
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
            timeLeft: data.timeLimit // Set the timer from the generator
        });
    } else {
      const content = getLevelContent(config.mode, tier, levelId, user.language);
      setGameState({
        targetWord: content.target,
        hintTitle: content.hintTitle,
        hintDesc: content.hintDesc,
        timeLeft: content.timeLimit, // Will be undefined for non-speedrun
        guesses: [],
        currentGuess: '',
        status: 'playing',
        startTime: Date.now(),
        hintsUsed: 0,
        isMath: false
      });
    }
    
    setTutorialMode(config.mode);
    setView('TUTORIAL');
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
          isPremium: true // FORCE PREMIUM ON ONBOARDING TOO
      });
      setView('HOME');
      audio.playWin();
  };

  // --- Gameplay Logic ---

  const handleWordKey = (char: string) => {
    if (gameState.status !== 'playing') return;
    if (gameState.currentGuess.length < gameState.targetWord.length) {
      setGameState((prev: any) => ({ ...prev, currentGuess: prev.currentGuess + char }));
      audio.playClick();
    }
  };

  const handleWordDelete = () => {
    if (gameState.status !== 'playing') return;
    setGameState((prev: any) => ({ ...prev, currentGuess: prev.currentGuess.slice(0, -1) }));
  };

  const handleWordEnter = () => {
    if (gameState.status !== 'playing') return;
    if (gameState.currentGuess.length !== gameState.targetWord.length) {
       audio.playError();
       return;
    }

    const result = checkGuess(gameState.currentGuess, gameState.targetWord);
    const newGuess = { word: gameState.currentGuess, result };
    const won = gameState.currentGuess === gameState.targetWord;

    setGameState((prev: any) => {
      const nextState = {
        ...prev,
        guesses: [...prev.guesses, newGuess],
        currentGuess: '',
        status: won ? 'won' : (prev.guesses.length + 1 >= 6 ? 'lost' : 'playing')
      };
      
      if (won) handleWin(gameConfig!.tier);
      if (nextState.status === 'lost') audio.playLoss();
      if (won) audio.playWin();
      
      return nextState;
    });
  };

  const handleSudokuInput = (char: string) => {
     if (!gameState.selectedCell) return;
     const { r, c } = gameState.selectedCell;
     const newGrid = [...gameState.currentGrid];
     newGrid[r][c] = char;
     
     setGameState((prev: any) => ({ ...prev, currentGrid: newGrid }));
     audio.playClick();
     
     const isFull = newGrid.every((row: any) => row.every((cell: any) => cell !== null));
     if (isFull) {
        const isCorrect = JSON.stringify(newGrid) === JSON.stringify(gameState.data.sudokuGrid);
        if (isCorrect) {
           audio.playWin();
           handleWin(gameConfig!.tier);
        }
     }
  };

  const handleWin = (tier: Tier) => {
    const xpGain = tier * 20;
    const coinGain = tier * 5;
    
    setWinStats({ xp: xpGain, coins: coinGain });
    setShowWin(true);
    
    setUser(prev => {
      const newXp = prev.xp + xpGain;
      return {
        ...prev,
        xp: newXp,
        level: Math.floor(newXp / 100) + 1,
        coins: prev.coins + coinGain
      };
    });
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
        for(let r=0; r<9; r++) {
            for(let c=0; c<9; c++) {
                if(!puzzle[r][c]) emptyCells.push({r,c});
            }
        }

        if(emptyCells.length > 0) {
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

  const openProfile = () => {
      setEditName(user.name || "");
      setEditAge(user.age || 18);
      setEditAvatar(user.avatarId || AVATARS[0]);
      setShowProfile(true);
  };
  
  const handleBuyItem = (item: ShopItem) => {
     if (item.type === 'currency') {
         // Simulate In-App Purchase
         audio.playWin(); // "Ca-ching"
         setUser(u => ({ ...u, coins: u.coins + (item.currencyAmount || 0) }));
         alert(`${t.SHOP.SUCCESS}: ${item.name}`);
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
              <h3 className="font-black italic text-2xl md:text-3xl uppercase tracking-tight leading-none mb-2 drop-shadow-sm text-white">{title}</h3>
              <p className="text-xs md:text-sm font-bold opacity-90 leading-tight max-w-[80%] text-white/80">{desc}</p>
           </div>
           <div className="relative z-10 mt-1">
              <span className="bg-black/30 px-3 py-1 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider border border-white/10 inline-flex items-center gap-1 text-white group-hover:bg-white group-hover:text-black transition-colors">
                 <Play size={10} fill="currentColor"/> {t.HOME.PLAY}
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
                     <div className="space-y-6 text-center animate-slide-up bg-black/40 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
                         <Globe size={64} className="mx-auto text-lexi-cyan mb-4 animate-spin-slow" />
                         <h1 className="text-3xl font-black italic mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{t.ONBOARDING.WELCOME}</h1>
                         <div className="grid grid-cols-2 gap-4">
                             <button 
                                onClick={() => { setTempUser({...tempUser, language: Language.DE}); setOnboardingStep(1); audio.playClick(); }}
                                className="p-6 bg-gray-800 border border-white/10 rounded-2xl hover:bg-lexi-fuchsia/20 hover:border-lexi-fuchsia transition-all group"
                             >
                                 <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform">🇩🇪</span>
                                 <span className="font-bold">DEUTSCH</span>
                             </button>
                             <button 
                                onClick={() => { setTempUser({...tempUser, language: Language.EN}); setOnboardingStep(1); audio.playClick(); }}
                                className="p-6 bg-gray-800 border border-white/10 rounded-2xl hover:bg-lexi-cyan/20 hover:border-lexi-cyan transition-all group"
                             >
                                 <span className="text-4xl mb-2 block group-hover:scale-110 transition-transform">🇺🇸</span>
                                 <span className="font-bold">ENGLISH</span>
                             </button>
                         </div>
                     </div>
                 )}

                 {onboardingStep === 1 && (
                     <div className="space-y-6 animate-slide-up bg-black/40 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
                         <div className="text-center">
                             <User size={48} className="mx-auto text-lexi-fuchsia mb-4" />
                             <h2 className="text-2xl font-bold mb-1">{t.ONBOARDING.NAME_TITLE}</h2>
                         </div>
                         <input 
                            type="text"
                            maxLength={20}
                            value={tempUser.name}
                            onChange={(e) => setTempUser({...tempUser, name: e.target.value})}
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
                     <div className="space-y-6 animate-slide-up bg-black/40 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
                         <div className="text-center">
                             <Settings size={48} className="mx-auto text-lexi-gold mb-4" />
                             <h2 className="text-2xl font-bold mb-1">{t.ONBOARDING.AGE_TITLE}</h2>
                         </div>
                         <input 
                            type="number"
                            min={1}
                            max={120}
                            value={tempUser.age}
                            onChange={(e) => setTempUser({...tempUser, age: e.target.value})}
                            placeholder={t.ONBOARDING.AGE_PLACEHOLDER}
                            className="w-full bg-gray-900 border-2 border-gray-700 rounded-xl p-4 text-center text-xl font-bold focus:border-lexi-gold focus:outline-none transition-colors text-white"
                            autoFocus
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
      const levels = Array.from({length: 100}, (_, i) => i + 1);
      
      return (
        <div className="h-full flex flex-col animate-fade-in bg-black/40 backdrop-blur-sm">
             <div className="p-4 bg-[#1e102e]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-20 sticky top-0">
                 <button onClick={() => setView('HOME')} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors border border-white/10">
                    <ArrowLeft size={20}/> 
                 </button>
                 <div className="text-center">
                     <h2 className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{t.SEASON.TITLE}</h2>
                 </div>
                 <div className="w-10"></div>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide max-w-2xl mx-auto w-full">
                {/* Tracks */}
                <div className="relative pt-8">
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
                                    {!isPremiumNode && (
                                        <div className={`bg-gray-800 p-4 rounded-2xl border border-white/10 w-32 md:w-40 flex flex-col items-center relative transition-all hover:scale-105 ${isClaimed ? 'ring-2 ring-green-500 bg-green-900/20' : ''}`}>
                                            <Gem size={24} className="text-blue-400 mb-1" />
                                            <span className="text-xs font-bold text-gray-400">100 {t.SEASON.COINS}</span>
                                            {isClaimed && <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg"><Check size={12} /></div>}
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Premium */}
                                <div className="flex-1 pl-10">
                                    {isPremiumNode && (
                                        <div className={`bg-gradient-to-br from-purple-900 to-gray-900 p-4 rounded-2xl border border-purple-500/30 w-32 md:w-40 flex flex-col items-center relative transition-all hover:scale-105 ${isClaimed ? 'ring-2 ring-yellow-400 bg-yellow-900/20' : ''}`}>
                                            <Lock size={16} className={`absolute top-2 right-2 text-purple-400 ${user.isPremium ? 'hidden' : ''}`} />
                                            <Star size={24} className="text-yellow-400 mb-1" fill="currentColor" />
                                            <span className="text-xs font-bold text-yellow-100/80">{t.SEASON.RARE_ITEM}</span>
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
      )
  }

  const renderShop = () => {
      return (
        <div className="h-full flex flex-col animate-fade-in bg-black/40 backdrop-blur-sm max-w-4xl mx-auto w-full">
             {/* Shop Header */}
             <div className="p-4 bg-[#1e102e]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-20 sticky top-0">
                 <button onClick={() => setView('HOME')} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors border border-white/10">
                    <ArrowLeft size={20}/> 
                 </button>
                 <div className="flex items-center gap-2">
                     <ShoppingBag size={24} className="text-lexi-cyan" />
                     <h2 className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-lexi-cyan to-blue-500 uppercase tracking-widest">{t.SHOP.TITLE}</h2>
                 </div>
                 <div className="flex items-center gap-1 bg-black/50 px-3 py-1 rounded-full border border-white/10">
                    <Gem size={14} className="text-blue-400" />
                    <span className="text-xs font-bold">{Math.max(0, user.coins)}</span>
                 </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                 {/* Currency Section */}
                 <div>
                     <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={16}/> {t.SHOP.CURRENCY_SECTION}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {SHOP_ITEMS.filter(i => i.type === 'currency').map((item, idx) => (
                             <button 
                               key={item.id} 
                               onClick={() => handleBuyItem(item)}
                               className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 p-6 rounded-3xl flex flex-col items-center relative overflow-hidden group hover:border-blue-500/50 transition-all animate-scale-in"
                               style={{animationDelay: `${idx*100}ms`}}
                             >
                                 <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                 <div className="bg-blue-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-500">
                                     <Coins size={32} className="text-blue-300" />
                                 </div>
                                 <span className="text-2xl font-black text-white mb-1">{item.currencyAmount}</span>
                                 <span className="text-xs text-blue-300 font-bold uppercase mb-4">{t.GAME.COINS_GAINED}</span>
                                 <div className="px-6 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-blue-50 transition-colors shadow-lg w-full">
                                     {item.cost}
                                 </div>
                             </button>
                         ))}
                     </div>
                 </div>

                 {/* Avatar Section */}
                 <div>
                     <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={16}/> {t.SHOP.AVATAR_SECTION}</h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         {SHOP_ITEMS.filter(i => i.type === 'avatar').map((item, idx) => {
                             const isOwned = (user.ownedAvatars || []).includes(item.value as string);
                             const isEquipped = user.avatarId === item.value;
                             const canAfford = user.coins >= (item.cost as number);

                             return (
                                 <div 
                                   key={item.id} 
                                   className={`bg-gray-900 border border-white/10 p-4 rounded-3xl flex flex-col items-center relative overflow-hidden animate-scale-in ${isEquipped ? 'ring-2 ring-lexi-fuchsia bg-lexi-fuchsia/10' : ''}`}
                                   style={{animationDelay: `${(idx+3)*100}ms`}}
                                 >
                                     <div className="w-20 h-20 bg-gray-800 rounded-full mb-4 overflow-hidden border-2 border-white/10">
                                         <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${item.value}`} alt={item.name} />
                                     </div>
                                     <span className="font-bold text-sm text-white mb-3 text-center leading-tight">{item.name}</span>
                                     
                                     {isOwned ? (
                                         <button 
                                            onClick={() => { 
                                                setUser(u => ({...u, avatarId: item.value as string})); 
                                                audio.playClick(); 
                                            }}
                                            disabled={isEquipped}
                                            className={`w-full py-2 rounded-xl font-bold text-xs uppercase transition-colors ${isEquipped ? 'bg-lexi-fuchsia text-white cursor-default' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                         >
                                             {isEquipped ? t.SHOP.EQUIPPED : t.SHOP.EQUIP}
                                         </button>
                                     ) : (
                                         <button 
                                            onClick={() => handleBuyItem(item)}
                                            className={`w-full py-2 rounded-xl font-bold text-xs uppercase transition-colors flex items-center justify-center gap-1 ${canAfford ? 'bg-lexi-cyan/20 text-lexi-cyan hover:bg-lexi-cyan hover:text-black' : 'bg-red-900/20 text-red-500 opacity-50 cursor-not-allowed'}`}
                                         >
                                             {canAfford ? t.SHOP.BUY : t.SHOP.INSUFFICIENT}
                                             <span className="text-[10px] opacity-80">({item.cost})</span>
                                         </button>
                                     )}
                                 </div>
                             );
                         })}
                     </div>
                 </div>
             </div>
        </div>
      );
  };

  const renderHome = () => (
    <div className="flex flex-col h-full p-6 w-full max-w-4xl mx-auto overflow-y-auto pb-10 scrollbar-hide animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 bg-black/30 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={openProfile}>
           <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden transition-transform group-hover:scale-105">
             <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.avatarId}`} alt="Avatar" className="w-14 h-14" />
           </div>
           <div>
             <div className={`font-bold text-2xl leading-none tracking-tight flex items-center gap-2 ${user.isPremium ? 'text-yellow-400 drop-shadow-sm' : ''}`}>
                {user.name} {user.isPremium && <CrownPattern className="w-4 h-4 text-yellow-500" />}
             </div>
             
             <div className="mt-2">
                 <div className="text-[10px] text-gray-400 font-bold tracking-widest uppercase flex justify-between mb-1">
                     <span>{t.HOME.SEASON_LEVEL} {user.level}</span>
                     <span className="text-lexi-fuchsia">{user.xp % 100}/100 XP</span>
                 </div>
                 <div className="h-1.5 w-32 bg-gray-800 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-lexi-fuchsia to-purple-500" style={{ width: `${user.xp % 100}%` }}></div>
                 </div>
             </div>
           </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <button onClick={() => setView('SHOP')} className="flex items-center gap-1 bg-black/50 px-4 py-2 rounded-full border border-white/10 shadow-lg hover:bg-white/5 transition-colors active:scale-95">
                <Gem size={16} className="text-blue-400" />
                <span className="text-sm font-bold">{Math.max(0, user.coins)}</span>
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-black font-bold ml-1">+</div>
            </button>
            <button 
              onClick={() => setUser(u => ({...u, language: u.language === Language.EN ? Language.DE : Language.EN}))} 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-white/10 text-[10px] font-bold hover:bg-gray-700 transition-all active:scale-95 hover:border-lexi-fuchsia/50"
            >
              <Globe size={12} className="text-lexi-fuchsia animate-pulse-slow" />
              {user.language}
            </button>
        </div>
      </header>

      {/* Logo Area */}
      <div className="flex flex-col items-center justify-center mb-12 relative animate-scale-in pt-4">
         <div className="relative h-40 w-80 flex items-center justify-center hover:scale-105 transition-transform duration-700">
            {/* Left Card */}
            <div className="absolute left-8 w-32 h-40 bg-gradient-to-br from-purple-400 to-blue-600 rounded-3xl transform -rotate-12 shadow-[0_0_30px_rgba(147,51,234,0.4)]"></div>
            {/* Right Card */}
            <div className="absolute right-8 w-32 h-40 bg-gradient-to-bl from-blue-400 to-blue-700 rounded-3xl transform rotate-12 shadow-[0_0_30px_rgba(37,99,235,0.4)]"></div>
            
            {/* Text */}
            <h1 className="relative z-10 text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
               LEXiMiX
            </h1>
         </div>
         <div className="mt-8 text-[10px] font-bold tracking-[0.5em] text-purple-200/60 uppercase animate-pulse">
            {t.HOME.TAGLINE}
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

      <SeasonPass 
        xp={user.xp} 
        level={user.level} 
        isPremium={user.isPremium} 
        onBuyPremium={() => setView('SEASON')} 
        lang={user.language}
      />
    </div>
  );

  const renderLevels = () => (
    <div className="h-full overflow-y-auto animate-fade-in w-full max-w-4xl mx-auto">
       <div className="sticky top-0 z-20 bg-lexi-dark/80 backdrop-blur-xl p-4 flex items-center justify-between border-b border-white/5">
          <button onClick={() => setView('HOME')} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors border border-white/10">
            <ArrowLeft size={20}/> 
          </button>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {t.MODES[gameConfig?.mode as keyof typeof t.MODES]?.title}
          </h2>
          <div className="px-4 py-2 rounded-full bg-black/40 border border-white/10 text-xs font-bold text-lexi-gold flex items-center gap-2 shadow-inner">
             <User size={14} /> {user.level} {t.SEASON.LEVEL}
          </div>
       </div>
       
       <div className="p-8 w-full">
          {[Tier.BEGINNER, Tier.LEARNER, Tier.SKILLED, Tier.EXPERT, Tier.MASTER].map((tier, idx) => {
             const isLockedTier = tier > 2; 
             const label = t.LEVELS.TIERS[tier - 1];
             const xpReward = tier * 20;

             return (
              <div key={tier} className="mb-12 animate-slide-up bg-black/20 p-6 rounded-3xl border border-white/5" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                       <div className={`text-3xl font-black italic tracking-tight ${isLockedTier ? 'text-gray-600' : TIER_COLORS[tier]} drop-shadow-sm`}>
                         {label}
                       </div>
                       {!isLockedTier && <span className="text-[10px] font-bold text-lexi-fuchsia bg-lexi-fuchsia/10 px-2 py-1 rounded border border-lexi-fuchsia/30 flex items-center gap-1"><Sparkles size={10}/> +{xpReward} XP</span>}
                   </div>
                   <div className="text-xs font-bold text-gray-500 tracking-widest bg-gray-900 px-3 py-1.5 rounded border border-white/5">
                     LEVEL {(tier-1)*50 + 1} — {tier*50} {isLockedTier && <Lock size={12} className="inline ml-1"/>}
                   </div>
                </div>
                
                <div className="grid grid-cols-5 md:grid-cols-8 gap-3 md:gap-4">
                  {Array.from({length: 10}).map((_, i) => { 
                    const lvl = (tier - 1) * 50 + i + 1;
                    const isUnlocked = lvl <= 10 && tier === 1; 
                    
                    if (isUnlocked) {
                       return (
                         <button 
                           key={lvl}
                           onClick={() => handleLevelSelect(tier, lvl)}
                           className={`aspect-square rounded-2xl flex items-center justify-center font-bold text-lg md:text-xl
                             bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10
                             text-white relative group overflow-hidden hover:border-lexi-fuchsia/50 hover:scale-110 transition-all shadow-lg`}
                         >
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="relative z-10 group-hover:text-lexi-fuchsia transition-colors">{lvl}</span>
                         </button>
                       )
                    }

                    return (
                      <button 
                        key={lvl}
                        disabled={true}
                        className="aspect-square rounded-2xl flex items-center justify-center bg-[#0a0510] border border-white/5 text-gray-800"
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
                 {t.TUTORIAL.START} <Play size={14} fill="currentColor"/>
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
    if(isSudoku) infoText = "Fill grid (A-I). No repeats.";
    else if(gameState.isMath) infoText = "Solve the math expression.";
    else infoText = `${gameState.targetWord.length} letters. Green = Correct.`;

    return (
      <div className="flex flex-col h-full max-h-screen relative z-10">
        {/* Header - Made more compact */}
        <div className="pt-4 pb-2 px-4 md:px-8 text-center relative bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm shrink-0 max-w-4xl mx-auto w-full rounded-b-3xl">
           <button onClick={() => setView('LEVELS')} className="absolute left-4 top-4 w-10 h-10 flex items-center justify-center bg-gray-800/50 rounded-full border border-white/10 hover:bg-gray-700 transition-colors"><ArrowLeft size={20}/></button>
           
           <div className="inline-block px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-widest mb-2 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
              {gameState.hintTitle || (isSudoku ? t.GAME.SUDOKU_TITLE : t.GAME.CLASSIC_TITLE)}
           </div>
           
           <h1 className="text-2xl md:text-4xl font-black italic text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)] animate-slide-up leading-tight mb-2">
               "{gameState.hintDesc || (isSudoku ? t.GAME.SUDOKU_DESC : "...")}"
           </h1>

           {/* Info Status Bar */}
           <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-400 bg-black/40 py-1 px-3 rounded-full inline-block border border-white/5">
               <Info size={12} /> {infoText}
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
                 onCellClick={(r: number, c: number) => setGameState((prev: any) => ({...prev, selectedCell: {r,c}}))}
               />
            ) : (
               <WordGrid 
                 guesses={gameState.guesses} 
                 currentGuess={gameState.currentGuess} 
                 targetLength={gameState.targetWord.length}
                 turn={gameState.guesses.length}
               />
            )}
          </div>
        </div>

        {/* Controls - Keyboard */}
        <div className={`p-2 pb-6 bg-[#0f0718]/95 border-t border-white/5 backdrop-blur-md shrink-0 ${!isSudoku ? 'md:hidden' : ''}`}>
           {isSudoku ? (
             <div className="grid grid-cols-9 gap-2 max-w-3xl mx-auto animate-slide-up p-2">
               {['A','B','C','D','E','F','G','H','I'].map((char, i) => (
                 <button 
                   key={char} 
                   onClick={() => handleSudokuInput(char)}
                   className="h-14 bg-gray-800 rounded-xl text-lexi-cyan text-xl font-bold active:bg-lexi-cyan active:text-black transition-colors border-b-4 border-black/40 hover:bg-gray-700 hover:scale-105"
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
  const CrownPattern = ({className}: {className?: string}) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <path d="M2 20h20v-2H2v2zm2-12l2 5h2l-2-5-2 5zm6 0l2 5h2l-2-5-2 5zm6 0l2 5h2l-2-5-2 5z"/>
          <path d="M12 2l-3 6 3 2 3-2-3-6z" opacity="0.5"/>
      </svg>
  );

  return (
    <div className="h-screen w-full text-white font-sans overflow-hidden relative selection:bg-lexi-fuchsia selection:text-white animate-nebula bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-fixed" style={{ backgroundColor: '#0f0718', backgroundImage: 'radial-gradient(circle at 50% 50%, #2d1b4e 0%, #0f0718 100%)' }}>
      {/* Dynamic Background Layers */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none"></div>
      <div className="fixed top-[-20%] left-[-20%] w-[140%] h-[140%] bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 animate-pulse-slow pointer-events-none blur-3xl"></div>
      
      {view === 'ONBOARDING' && renderOnboarding()}
      {view === 'HOME' && renderHome()}
      {view === 'SEASON' && renderSeasonPassView()}
      {view === 'LEVELS' && renderLevels()}
      {view === 'GAME' && renderGame()}
      {view === 'TUTORIAL' && renderTutorial()}
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
                           <Edit2 size={18}/>
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
             <Button className="flex-1" variant="secondary" onClick={() => { setShowWin(false); setView('SEASON'); }}>{t.GAME.PASS_BTN}</Button>
             <Button className="flex-1" onClick={() => { setShowWin(false); setView('LEVELS'); }}>{t.GAME.NEXT_BTN}</Button>
           </div>
         </div>
      </Modal>
    </div>
  );
}