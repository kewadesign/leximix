import React, { useState, useEffect, useRef, useMemo } from 'react';
// KW1998 - Core Application Logic
import { GameMode, Tier, UserState, Language, GameConfig, ShopItem } from './types';
import { Button, Modal } from './components/UI';
import { VersionManager } from './components/VersionManager';
import { SeasonPass } from './components/SeasonPass';
import { SeasonPassView } from './components/SeasonPassView';
import { PayPalButton } from './components/PayPalButton';
import { AuthModal } from './components/AuthModal';
import { PremiumStatus } from './components/PremiumStatus';
import { ShopView } from './components/ShopView';
import { SudokuGrid } from './components/SudokuGrid';
import { SudokuControls } from './components/SudokuControls';
import { MusicPlayer } from './components/MusicPlayer';
import { TIER_COLORS, TIER_BG, TUTORIALS, TRANSLATIONS, AVATARS, MATH_CHALLENGES, SHOP_ITEMS, PREMIUM_PLANS, VALID_CODES, COIN_CODES, SEASON_REWARDS, getCurrentSeason, generateSeasonRewards, SEASONS, APP_VERSION } from './constants';
import { getLevelContent, checkGuess, generateSudoku, generateChallenge, generateRiddle } from './utils/gameLogic';
import { validateSudoku } from './utils/sudokuValidation';
import { audio } from './utils/audio';

import { Trophy, ArrowLeft, HelpCircle, Gem, Lock, User, Globe, Puzzle, Zap, Link as LinkIcon, BookOpen, Grid3X3, Play, Check, Star, Clock, Sparkles, Settings, Edit2, Skull, Brain, Info, ShoppingBag, Coins, CreditCard, AlertTriangle, Crown, Sun, Moon, Plus, WifiOff, Database, Download } from 'lucide-react';

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

  // CSS Grid Logic for perfect sizing:
  // min(14vw, 3.5rem) ensures cells are max 56px but shrink for mobile/long words
  // w-fit ensures the container is only as wide as the grid
  const gridStyle = {
    gridTemplateColumns: `repeat(${targetLength}, min(14vw, 3.5rem))`
  };

  return (
    <div className="flex flex-col gap-2 w-fit mx-auto transition-all">
      {guesses.map((guess: any, i: number) => (
        <div key={i} className="grid gap-2 justify-center" style={gridStyle}>
          {guess.word.split('').map((char: string, j: number) => (
            <div key={j} className={`aspect-square flex items-center justify-center rounded-lg font-mono font-bold text-2xl md:text-3xl uppercase transition-all duration-500 animate-scale-in
  ${guess.result[j] === 'correct' ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.5)] rotate-x-0' :
                guess.result[j] === 'present' ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' :
                  'bg-red-600/80 text-white shadow-inner'
              }
`}>
              {char}
            </div>
          ))}
        </div>
      ))}

      {turn < 6 && (
        <div className="grid gap-2 justify-center" style={gridStyle}>
          {Array(targetLength).fill(null).map((_, i) => (
            <div key={i} className={`aspect-square flex items-center justify-center rounded-xl border-2 ${currentGuess[i] ? 'border-cyan-400 text-white bg-cyan-900/40 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'border-white/10 bg-white/5'} font-mono font-bold text-2xl md:text-3xl uppercase transition-colors duration-200 text-white`}>
              {currentGuess[i] || ''}
            </div>
          ))}
        </div>
      )}

      {empties.map((_, i) => (
        <div key={`empty - ${i} `} className="grid gap-2 justify-center" style={gridStyle}>
          {Array(targetLength).fill(null).map((__, j) => (
            <div key={j} className="aspect-square rounded-lg border-2 border-lexi-border/30 bg-lexi-surface/5"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// --- Main App Component ---

// Define ViewType
type ViewType = 'ONBOARDING' | 'HOME' | 'MODES' | 'LEVELS' | 'GAME' | 'TUTORIAL' | 'SEASON' | 'SHOP' | 'AUTH' | 'LANGUAGE_SELECT';

export default function App() {
  const [view, setView] = useState<ViewType>('ONBOARDING');

  // Navigation
  const navigateTo = (newView: ViewType) => {
    if (newView === view) return;
    setView(newView);
  };

  const handleNavigate = (target: ViewType) => {
    if (target === view) return;
    setView(target);
  };

  // Onboarding State
  const [onboardingStep, setOnboardingStep] = useState(0); // 0=Lang, 1=Name, 2=Age
  const [tempUser, setTempUser] = useState({ name: '', age: '', language: Language.EN });

  const [user, setUser] = useState<UserState>(() => {
    try {
      const saved = localStorage.getItem('leximix_user_v2');

      // Initial Unlock State: Start with NO levels completed
      // Level 1 is always unlocked by default in the render logic
      const initialLevelsUnlocked: Record<string, boolean> = {};

      if (saved) {
        const parsed = JSON.parse(saved);

        // Sanitize Debug State: If user has exactly 100,000 XP (debug value), reset to 0
        // unless they have played a significant number of levels (unlikely to hit exactly 100k)
        let sanitizedXp = parsed.xp;
        let sanitizedLevel = parsed.level;

        if (sanitizedXp === 100000 && (!parsed.playedWords || parsed.playedWords.length < 50)) {
          console.log("Resetting debug XP/Level state");
          sanitizedXp = 0;
          sanitizedLevel = 1;
        }

        return {
          ...parsed,
          xp: sanitizedXp,
          level: sanitizedLevel,
          // Ensure default unlock structure exists if migrating
          completedLevels: { ...initialLevelsUnlocked, ...parsed.completedLevels },
          theme: parsed.theme || 'dark',
          claimedSeasonRewards: parsed.claimedSeasonRewards || [],
          ownedFrames: parsed.ownedFrames || [],
          hintBooster: parsed.hintBooster || 0,
          ownedAvatars: parsed.ownedAvatars || [AVATARS[0]],
          isPremium: parsed.isPremium || false
        };
      }

      // Default state for NEW USERS
      return {
        name: 'Player',
        age: 0,
        language: Language.DE,
        avatarId: AVATARS[0],
        coins: 0, // Start with 0 coins
        xp: 0, // Start with 0 XP
        level: 1, // Start at Level 1
        completedLevels: initialLevelsUnlocked, // Start with NO levels completed
        theme: 'dark',
        inventory: [],
        ownedAvatars: [AVATARS[0]],
        isPremium: false, // No premium
        playedWords: [],
        activeFrame: undefined,
        ownedFrames: [],
        hintBooster: 0,
        claimedSeasonRewards: []
      };
    } catch (error) {
      console.error('[LexiMix] localStorage error:', error);
      // Continue to default state
    }

    // Fallback default state
    const fallbackLevelsUnlocked: Record<string, boolean> = {};

    return {
      name: 'Player',
      age: 0,
      avatarId: AVATARS[0],
      ownedAvatars: [AVATARS[0]],
      xp: 0,
      level: 1,
      coins: 0,
      isPremium: false,
      completedLevels: fallbackLevelsUnlocked,
      language: Language.DE,
      theme: 'dark',
      activeFrame: undefined,
      ownedFrames: [],
      hintBooster: 0,
      claimedSeasonRewards: []
    };
  });

  // Cloud Save State
  const [cloudUsername, setCloudUsername] = useState<string | null>(() => {
    return localStorage.getItem('leximix_cloud_user');
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');
  const [lastCloudSync, setLastCloudSync] = useState<number | null>(null);

  // Season System
  const [currentSeason, setCurrentSeason] = useState(() => getCurrentSeason());

  // Apply Season Colors to CSS Variables
  useEffect(() => {
    const season = getCurrentSeason();
    setCurrentSeason(season);

    // Apply season colors to CSS variables
    const root = document.documentElement;
    root.style.setProperty('--season-primary', season.colors.primary);
    root.style.setProperty('--season-secondary', season.colors.secondary);
    root.style.setProperty('--season-accent', season.colors.accent);
    root.style.setProperty('--season-bg-dark', season.colors.bgDark);
    root.style.setProperty('--season-bg-card', season.colors.bgCard);

    console.log(`[Season] Active: ${season.name} (ID: ${season.id})`);
  }, []);

  // Check for saved user on mount to decide initial view
  useEffect(() => {
    try {
      const cloudUser = localStorage.getItem('leximix_cloud_user');
      const hasLanguageSelected = localStorage.getItem('leximix_language_selected');

      // Must be logged in to use app
      if (!cloudUser) {
        if (!hasLanguageSelected) {
          setView('LANGUAGE_SELECT');
        } else {
          setView('AUTH'); // Show login screen
        }
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
  }, [cloudUsername]);

  const t = TRANSLATIONS[view === 'ONBOARDING' ? tempUser.language : user.language]; // Handle lang during onboarding

  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const gameStateRef = useRef<any>(null); // Ref to access latest state in event listeners
  const hiddenInputRef = useRef<HTMLInputElement>(null); // Ref for hidden mobile keyboard input

  // Update ref whenever gameState changes
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
  const [showChallengeIntro, setShowChallengeIntro] = useState(false);
  const [challengeIntroCallback, setChallengeIntroCallback] = useState<(() => void) | null>(null);

  const [winStats, setWinStats] = useState({ xp: 0, coins: 0 });
  const [levelUpData, setLevelUpData] = useState({ level: 1, xp: 0 }); // Data for Level Up Modal
  const [showRedeemModal, setShowRedeemModal] = useState(false); // Redeem Code Modal
  const [redeemCode, setRedeemCode] = useState(''); // Code Input
  const [redeemStep, setRedeemStep] = useState<'code' | 'plan'>('code'); // Redemption flow step
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number | null>(null); // Selected plan
  const [redeemError, setRedeemError] = useState<string | null>(null); // Error message for redemption
  const [showPremiumInfo, setShowPremiumInfo] = useState(false); // Premium info modal
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | '30days'>('monthly'); // Selected premium plan
  const [showUsernameConfirm, setShowUsernameConfirm] = useState(false); // Username change confirmation
  const [deleteInput, setDeleteInput] = useState(''); // For delete confirmation

  // Edit Profile State
  const [editName, setEditName] = useState(user.name || "Player");
  const [editAge, setEditAge] = useState(user.age || 18);
  const [editAvatar, setEditAvatar] = useState(user.avatarId || AVATARS[0]);
  const [editFrame, setEditFrame] = useState(user.activeFrame || 'none');
  const [editUsername, setEditUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const [showPremiumRequiredModal, setShowPremiumRequiredModal] = useState(false);
  const [showCorrectWordModal, setShowCorrectWordModal] = useState(false);
  const [correctWord, setCorrectWord] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Online/Offline monitoring
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Connection restored');
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.log('[Network] Connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check periodically (every 10 seconds)
    const interval = setInterval(() => {
      setIsOnline(navigator.onLine);
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

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

  const handleClaimReward = (level: number, isPremiumClaim: boolean = false) => {
    const reward = SEASON_REWARDS[level - 1];
    if (!reward) return;

    // Check if already claimed based on type
    if (isPremiumClaim) {
      if (!user.isPremium) return;
      if (user.claimedPremiumRewards?.includes(level)) return;
    } else {
      if (user.claimedSeasonRewards?.includes(level)) return;
    }

    let coinsToAdd = 0;
    const newAvatars = [...(user.ownedAvatars || [])];
    const newFrames = [...(user.ownedFrames || [])];
    const newStickers = [...(user.stickers || [])];
    let newBooster = user.hintBooster || 0;

    const processReward = (item: any) => {
      if (!item) return;
      if (item.type === 'coins') coinsToAdd += (item.amount as number);

      if (item.type === 'avatar') {
        const avatarId = item.value as string;
        if (!newAvatars.includes(avatarId)) newAvatars.push(avatarId);
      }

      if (item.type === 'cosmetic' || item.type === 'effect') {
        const frameId = item.value as string;
        if (!newFrames.includes(frameId)) newFrames.push(frameId);
      }

      if (item.type === 'booster') {
        // Increase booster level (reduces hint wait time)
        newBooster += 1;
      }

      if (item.type === 'sticker') {
        const stickerId = item.value as string;
        if (!newStickers.includes(stickerId)) newStickers.push(stickerId);
      }

      if (item.type === 'mystery') {
        // Mystery Box Logic: Random Coins (500-2000) or XP (handled via alert for now)
        const roll = Math.random();
        if (roll > 0.5) {
          const bonusCoins = Math.floor(Math.random() * 1500) + 500;
          coinsToAdd += bonusCoins;
          alert(`Mystery Box: Du hast ${bonusCoins} Münzen gefunden!`);
        } else {
          // Just give coins for now as XP is hard to set directly without recalc
          const bonusCoins = 1000;
          coinsToAdd += bonusCoins;
          alert(`Mystery Box: Du hast ${bonusCoins} Münzen gefunden!`);
        }
      }
    };

    if (isPremiumClaim) {
      processReward(reward.premium);
    } else {
      processReward(reward.free);
    }

    setUser(prev => ({
      ...prev,
      coins: prev.coins + coinsToAdd,
      ownedAvatars: newAvatars,
      ownedFrames: newFrames,
      stickers: newStickers,
      hintBooster: newBooster,
      claimedSeasonRewards: !isPremiumClaim ? [...(prev.claimedSeasonRewards || []), level] : prev.claimedSeasonRewards,
      claimedPremiumRewards: isPremiumClaim ? [...(prev.claimedPremiumRewards || []), level] : prev.claimedPremiumRewards
    }));

    audio.playWin(); // Simple feedback
  };

  // Helper to get active effect style
  const getAvatarEffect = (effectId?: string) => {
    if (!effectId || effectId === 'none') return "";

    // Original 5 effects
    if (effectId === 'effect_glow') return 'frame-glow';
    if (effectId === 'effect_fire') return 'frame-fire';
    if (effectId === 'effect_ice') return 'frame-ice';
    if (effectId === 'effect_neon') return 'frame-neon';
    if (effectId === 'effect_sparkle') return 'frame-sparkle';

    // Elemental frames
    if (effectId === 'effect_flame_burst') return 'frame-flame-burst';
    if (effectId === 'effect_frost_aura') return 'frame-frost-aura';
    if (effectId === 'effect_lightning_arc') return 'frame-lightning-arc';
    if (effectId === 'effect_water_ripple') return 'frame-water-ripple';

    // Cosmic frames
    if (effectId === 'effect_galaxy_swirl') return 'frame-galaxy-swirl';
    if (effectId === 'effect_star_field') return 'frame-star-field';
    if (effectId === 'effect_nebula_glow') return 'frame-nebula-glow';
    if (effectId === 'effect_void_edge') return 'frame-void-edge';

    // NEW: Advanced Effects (Nano Banana Update)
    if (effectId === 'effect_rainbow') return 'frame-rainbow-pulse';
    if (effectId === 'effect_gold') return 'frame-gold-luxury';
    if (effectId === 'effect_diamond') return 'frame-diamond-shine';
    if (effectId === 'effect_shadow') return 'frame-shadow-flame';
    if (effectId === 'effect_aurora') return 'frame-aurora-wave';
    if (effectId === 'effect_pixel') return 'frame-pixel-glitch';
    if (effectId === 'effect_holo') return 'frame-holo-shimmer';
    if (effectId === 'effect_matrix') return 'frame-matrix-rain';
    if (effectId === 'effect_pixel_glitch') return 'frame-pixel-glitch';
    if (effectId === 'effect_holo_shimmer') return 'frame-holo-shimmer';

    // Advanced frames
    if (effectId === 'effect_wave_motion') return 'frame-wave-motion';
    if (effectId === 'effect_color_morph') return 'frame-color-morph';
    if (effectId === 'effect_matrix_rain') return 'frame-matrix-rain';
    if (effectId === 'effect_prism_split') return 'frame-prism-split';
    if (effectId === 'effect_glitch_wild') return 'frame-glitch-wild';
    if (effectId === 'effect_lava_flow') return 'frame-lava-flow';
    if (effectId === 'effect_electric_pulse') return 'frame-electric-pulse';
    if (effectId === 'effect_oil_slick') return 'frame-oil-slick';
    if (effectId === 'effect_chromatic_abberation') return 'frame-chromatic-abberation';
    if (effectId === 'effect_quantum_flux') return 'frame-quantum-flux';

    // Fallback for legacy frames
    if (effectId.includes('frame_')) return "shadow-[0_0_20px_rgba(34,211,238,0.5)] ring-2 ring-cyan-400";
    return "";
  };

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

      // Prevent double input: If typing in the hidden input, ignore keys that are handled by its onChange/onKeyDown
      if (document.activeElement === hiddenInputRef.current) {
        if (/^[A-Z0-9]$/.test(key) || key === 'BACKSPACE' || key === 'ENTER') {
          return;
        }
      }

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


  const startGame = (config: GameConfig) => {
    audio.playClick();

    // Deduct coins for Challenge mode
    if (config.mode === GameMode.CHALLENGE) {
      const cost = 100 + ((config.tier - 1) * 100);
      setUser(u => ({ ...u, coins: u.coins - cost }));
    }

    if (config.mode === GameMode.SUDOKU) {
      if (!user.isPremium) {
        setShowPremiumRequiredModal(true);
        return;
      }
      const data = generateSudoku(config.tier);
      setGameState({
        data,
        currentGrid: JSON.parse(JSON.stringify(data.sudokuPuzzle)),
        selectedCell: null,
        history: []
      });
    } else if (config.mode === GameMode.CHALLENGE) {
      const data = generateChallenge(user.language, config.tier, config.levelId);
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

    setTutorialMode(config.mode);
    setView('TUTORIAL');
  };

  const handleModeSelect = (mode: GameMode) => {
    audio.playClick();

    if (mode === GameMode.CHALLENGE) {
      if (!user.isPremium) {
        setShowPremiumRequiredModal(true);
        return;
      }

      // Show Intro Modal first
      setChallengeIntroCallback(() => () => {
        setGameConfig({ mode, tier: Tier.BEGINNER, levelId: 1 });
        setView('LEVELS');
      });
      setShowChallengeIntro(true);
      return;
    }

    setGameConfig({ mode, tier: Tier.BEGINNER, levelId: 1 }); // Default
    setView('LEVELS');
  };

  const handleLevelSelect = (tier: Tier, levelId: number) => {
    audio.playClick();
    if (!gameConfig) return;

    // Challenge Mode Cost Check - will be charged when game starts
    if (gameConfig.mode === GameMode.CHALLENGE) {
      const cost = 100 + ((tier - 1) * 100); // Tier 1 = 100, Tier 2 = 200, Tier 3 = 300
      if (user.coins < cost) {
        audio.playError();
        alert(`${t.SHOP.INSUFFICIENT} (${cost} Münzen benötigt)`);
        return;
      }
      // Don't deduct yet - will deduct in startGame
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
    setTutorialMode(null);
  };

  // ...

  useEffect(() => {
    if (view === 'GAME' && gameConfig && gameConfig.mode !== GameMode.SUDOKU && gameConfig.mode !== GameMode.CHALLENGE) {
      const isSudoku = gameConfig?.mode === GameMode.SUDOKU;
      const isChallenge = gameConfig?.mode === GameMode.CHALLENGE;
      const isRiddle = gameConfig?.mode === GameMode.RIDDLE;

      let content;
      if (isChallenge) {
        content = generateChallenge(user.language, gameConfig.tier, gameConfig.levelId);
      } else if (isSudoku) {
        content = generateSudoku(gameConfig.tier);
      } else if (isRiddle) {
        content = generateRiddle(user.language, gameConfig.tier, gameConfig.levelId);
      } else {
        content = getLevelContent(gameConfig.mode, gameConfig.tier, gameConfig.levelId, user.language, user.playedWords);
      }

      setGameState({
        guesses: [],
        currentGuess: '',
        status: 'playing',
        targetWord: content.target,
        hintTitle: content.hintTitle || (isChallenge ? t.MODES.CHALLENGE.title : (isRiddle ? t.MODES.RIDDLE.title : t.GAME.HINT_TITLE)),
        hintDesc: content.hintDesc || (isChallenge ? content.question : (isRiddle ? content.question : t.GAME.UNLOCK_HINT)),
        data: content, // Store full content for Sudoku/Challenge validation
        timeLeft: content.timeLimit,
        startTime: Date.now(),
        hintsUsed: 0,
        isMath: content.type === 'math',
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
    const { normalizeUsername, loadFromCloud } = await import('./utils/firebase');
    const normalizedUser = normalizeUsername(username);

    setCloudUsername(normalizedUser);
    localStorage.setItem('leximix_cloud_user', normalizedUser);

    // Load from cloud
    const cloudData = await loadFromCloud(normalizedUser);

    if (cloudData) {
      // Load existing data
      setUser(prev => ({
        ...prev,
        ...cloudData,
        name: normalizedUser // Enforce name consistency
      }));
      console.log('[Cloud] Loaded save from cloud');
      setView('HOME');
    } else {
      // New user - set defaults but require onboarding
      const initialLevelsUnlocked: Record<string, boolean> = {};
      Object.values(GameMode).forEach(mode => {
        initialLevelsUnlocked[`${mode}_${Tier.BEGINNER}_1`] = true;
      });

      setUser(prev => ({
        ...prev,
        name: normalizedUser, // Use username as initial display name
        age: 0, // Reset age to force entry
        avatarId: AVATARS[0],
        ownedAvatars: [AVATARS[0]],
        xp: 0,
        level: 1,
        coins: 0,
        isPremium: false,
        completedLevels: initialLevelsUnlocked,
        playedWords: [],
        language: Language.DE, // Default, will be chosen in onboarding
        theme: user.theme || 'dark'
      }));

      // Pre-fill onboarding name with username
      setTempUser(prev => ({ ...prev, name: normalizedUser }));

      console.log('[Cloud] New user - redirecting to onboarding');
      setView('ONBOARDING');
      setOnboardingStep(0); // Start at Language
    }
  };

  const handleCloudLogout = () => {
    // Clear cloud login
    setCloudUsername(null);
    localStorage.removeItem('leximix_cloud_user');

    // Clear user data
    localStorage.removeItem('leximix_user');
    setLastCloudSync(null);

    // Reset to default state
    const initialLevelsUnlocked: Record<string, boolean> = {};
    Object.values(GameMode).forEach(mode => {
      initialLevelsUnlocked[`${mode}_${Tier.BEGINNER}_1`] = true;
    });

    setUser({
      name: 'Player',
      age: 0,
      avatarId: AVATARS[0],
      ownedAvatars: [AVATARS[0]],
      xp: 0,
      level: 1,
      coins: 0,
      isPremium: false,
      completedLevels: initialLevelsUnlocked,
      playedWords: [],
      language: Language.DE,
      theme: 'dark'
    });

    // Go back to AUTH
    setView('AUTH');
    console.log('[Cloud] Logged out - cleared all data');
  };

  const startGameFromTutorial = () => {
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
      alert(`Error in handleWordEnter: ${error} `);
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

      // Grant bonus XP for challenge mode completion
      if (mode === GameMode.CHALLENGE) {
        const bonusXP = 50 * tier; // 50/100/150 XP for tiers 1/2/3
        xpGain += bonusXP;
      }

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
      alert(`Error in handleWin: ${error} `);
    }
  };
  const triggerHint = () => {
    setShowAd(true);
    const baseCost = 5 + (hintCostMultiplier * 10);
    // Booster reduces wait time by 1 second per level, minimum 1 second
    const reducedCost = Math.max(1, baseCost - (user.hintBooster || 0));
    setAdTimer(reducedCost);
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

    // Word Game Hint (Reveal next missing or incorrect char)
    if (gameState.status === 'playing') {
      const target = gameState.targetWord;
      let currentGuess = gameState.currentGuess;

      // Find first index where guess is missing or incorrect
      let revealIndex = -1;
      for (let i = 0; i < target.length; i++) {
        if (!currentGuess[i] || currentGuess[i] !== target[i]) {
          revealIndex = i;
          break;
        }
      }

      if (revealIndex !== -1) {
        // Construct new guess with correct char at revealIndex
        // We need to preserve existing correct chars if possible, but simplest is to just append if we are at the end,
        // or replace if we are in the middle.
        // Actually, the game input is usually sequential. If `currentGuess` is "AP", and we want to reveal index 2 (P), we make it "APP".
        // If `currentGuess` is "AB" (wrong), and we want to reveal index 1 (P), we make it "AP".

        const nextChar = target[revealIndex];
        const newGuess = currentGuess.slice(0, revealIndex) + nextChar;

        setGameState((prev: any) => ({
          ...prev,
          currentGuess: newGuess,
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
      avatarId: editAvatar,
      activeFrame: editFrame !== 'none' ? editFrame : undefined
    }));
    setShowProfile(false);
  };

  const deleteProfile = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (cloudUsername) {
        const { deleteUserAccount } = await import('./utils/firebase');
        const success = await deleteUserAccount(cloudUsername);
        if (success) {
          console.log('[LexiMix] Account deleted from cloud');
        } else {
          alert("Fehler beim Löschen des Accounts. Bitte versuche es später erneut.");
          return;
        }
      }

      // Use the existing logout handler to ensure clean state and redirection
      handleCloudLogout();

      // Optional: Reload to ensure memory is completely fresh
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error('[LexiMix] Delete error:', error);
      // Fallback
      localStorage.removeItem('leximix_user');
      localStorage.removeItem('leximix_cloud_user');
      window.location.reload();
    }
  };

  const openProfile = () => {
    setEditName(user.name || "");
    setEditAge(user.age || 18);
    setEditAvatar(user.avatarId || AVATARS[0]);
    setEditFrame(user.activeFrame || 'none');
    setEditUsername('');
    setUsernameError('');
    setShowProfile(true);
  };

  const handleUsernameChange = async () => {
    setUsernameError('');

    // Validation
    if (!editUsername || editUsername.length < 3) {
      setUsernameError('Benutzername zu kurz (mindestens 3 Zeichen)');
      return;
    }

    if (editUsername.length > 30) {
      setUsernameError('Benutzername zu lang (maximal 30 Zeichen)');
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(editUsername)) {
      setUsernameError('Nur Buchstaben und Zahlen erlaubt (a-z, 0-9)');
      return;
    }

    // Check coins
    if (user.coins < 2500) {
      setUsernameError('Nicht genug Münzen (2500 benötigt)');
      audio.playError();
      return;
    }

    try {
      // Check if username is taken
      const { normalizeUsername, database } = await import('./utils/firebase');
      const { ref, get } = await import('firebase/database');
      const normalizedNew = normalizeUsername(editUsername);

      const userRef = ref(database, `users/${normalizedNew}`);
      const snapshot = await get(userRef);

      if (snapshot.exists() && normalizedNew !== normalizeUsername(cloudUsername || '')) {
        setUsernameError('Benutzername bereits vergeben');
        audio.playError();
        return;
      }

      // Show confirmation modal
      setShowUsernameConfirm(true);
    } catch (error) {
      console.error('[Username Change] Error:', error);
      setUsernameError('Fehler beim Ändern des Benutzernamens');
      audio.playError();
    }
  };

  const confirmUsernameChange = async () => {
    try {
      const { normalizeUsername } = await import('./utils/firebase');
      const normalizedNew = normalizeUsername(editUsername);

      // Deduct coins and update
      setUser(u => ({ ...u, coins: u.coins - 2500 }));
      setCloudUsername(normalizedNew);
      localStorage.setItem('leximix_cloud_user', normalizedNew);

      audio.playWin();
      setShowUsernameConfirm(false);
      setEditUsername('');
      setShowProfile(false);

      // Show success message
      setTimeout(() => {
        alert('Benutzername erfolgreich geändert!');
      }, 100);
    } catch (error) {
      console.error('[Confirm Username Change] Error:', error);
      setUsernameError('Fehler beim Ändern des Benutzernamens');
      audio.playError();
      setShowUsernameConfirm(false);
    }
  };

  const handleVoucherRedeem = async () => {
    if (!cloudUsername) {
      setVoucherError('Du musst angemeldet sein, um Gutscheine einzulösen');
      return;
    }

    if (!voucherCode.trim()) {
      setVoucherError('Bitte gib einen Gutscheincode ein');
      return;
    }

    try {
      const { redeemVoucher } = await import('./utils/firebase');
      const result = await redeemVoucher(cloudUsername, voucherCode);

      if (result.success) {
        // Award coins to user if applicable
        if (result.coinsAwarded) {
          setUser(u => ({ ...u, coins: u.coins + result.coinsAwarded! }));
        }

        // Activating Premium if applicable
        if (result.isPremium) {
          setUser(u => ({ ...u, isPremium: true, premiumActivatedAt: Date.now() }));
        }

        // Show success message
        let msg = result.coinsAwarded
          ? `🎉 Gutschein eingelöst! + ${result.coinsAwarded} Münzen`
          : `🎉 Gutschein erfolgreich eingelöst!`;

        if (result.isPremium) {
          msg = "🎉 PREMIUM STATUS AKTIVIERT! 👑";
        }

        setVoucherSuccess(msg);
        setVoucherError('');
        setVoucherCode('');
        audio.playWin();

        // Close modal after 2 seconds
        setTimeout(() => {
          setShowRedeemModal(false);
          setVoucherSuccess('');
        }, 2000);
      } else {
        setVoucherError(result.error || 'Fehler beim Einlösen');
        setVoucherSuccess('');
        audio.playError();
      }
    } catch (error) {
      console.error('[Voucher Redeem] Error:', error);
      setVoucherError('Fehler beim Einlösen des Gutscheins');
      setVoucherSuccess('');
      audio.playError();
    }
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
        alert(`${t.SHOP.SUCCESS}: ${item.name} `);
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
      style={{ animationDelay: `${delay} ms` }}
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
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => { setTempUser({ ...tempUser, language: Language.DE }); setOnboardingStep(1); audio.playClick(); }}
                  className="p-4 glass-button rounded-2xl hover:bg-lexi-fuchsia/20 hover:border-lexi-fuchsia transition-all group flex flex-col items-center justify-center"
                >
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🇩🇪</span>
                  <span className="font-bold text-xs md:text-sm">DEUTSCH</span>
                </button>
                <button
                  onClick={() => { setTempUser({ ...tempUser, language: Language.EN }); setOnboardingStep(1); audio.playClick(); }}
                  className="p-4 glass-button rounded-2xl hover:bg-lexi-cyan/20 hover:border-lexi-cyan transition-all group flex flex-col items-center justify-center"
                >
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🇺🇸</span>
                  <span className="font-bold text-xs md:text-sm">ENGLISH</span>
                </button>
                <button
                  onClick={() => { setTempUser({ ...tempUser, language: Language.ES }); setOnboardingStep(1); audio.playClick(); }}
                  className="p-4 glass-button rounded-2xl hover:bg-yellow-500/20 hover:border-yellow-500 transition-all group flex flex-col items-center justify-center"
                >
                  <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">🇪🇸</span>
                  <span className="font-bold text-xs md:text-sm">ESPAÑOL</span>
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
                maxLength={30}
                value={tempUser.name}
                onChange={(e) => setTempUser({ ...tempUser, name: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })}
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

  const handlePayPalSuccess = async (details: any, planType: 'monthly' | '30days') => {
    console.log('PayPal Success:', details);
    audio.playWin();

    // Update User State
    setUser(prev => {
      const newState = {
        ...prev,
        isPremium: true,
        premiumActivatedAt: Date.now()
      };

      // Bonus for Monthly Plan (7.99)
      if (planType === 'monthly') {
        newState.level = (newState.level || 1) + 10; // +10 Levels
      }

      return newState;
    });

    // Save to Cloud
    if (cloudUsername) {
      try {
        const { saveToCloud } = await import('./utils/firebase');
        // We need to save the new state. 
        // Since we can't easily access the *new* state from setUser here without a ref or waiting,
        // we'll construct a temporary object for saving.
        const tempState = {
          ...user,
          isPremium: true,
          premiumActivatedAt: Date.now(),
          level: planType === 'monthly' ? (user.level || 1) + 10 : user.level
        };
        await saveToCloud(cloudUsername, tempState);
      } catch (e) {
        console.error("Failed to save premium status", e);
      }
    }

    alert(`Premium erfolgreich aktiviert!(${planType === 'monthly' ? '+10 Level Boost' : '30 Tage'})`);
    setShowPremiumInfo(false);
  };


  const toggleTheme = () => {
    const newTheme = user.theme === 'dark' ? 'light' : 'dark';
    setUser(prev => ({ ...prev, theme: newTheme }));
    audio.playClick();
  };

  const toggleLanguage = () => {
    const langs = [Language.DE, Language.EN, Language.ES];
    const currentIndex = langs.indexOf(user.language);
    const nextIndex = (currentIndex + 1) % langs.length;
    setUser(prev => ({ ...prev, language: langs[nextIndex] }));
    audio.playClick();
  };

  const getLanguageName = (lang: Language) => {
    switch (lang) {
      case Language.DE: return "DEUTSCH";
      case Language.EN: return "ENGLISH";
      case Language.ES: return "ESPAÑOL";
      default: return "DEUTSCH";
    }
  };

  const renderLanguageSelect = () => (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
            Select Language
          </h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
            Wähle deine Sprache / Elige tu idioma
          </p>
        </div>

        <div className="grid gap-4">
          {[
            { code: Language.EN, label: 'English', flag: '🇺🇸' },
            { code: Language.DE, label: 'Deutsch', flag: '🇩🇪' },
            { code: Language.ES, label: 'Español', flag: '🇪🇸' }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setUser(prev => ({ ...prev, language: lang.code }));
                localStorage.setItem('leximix_language_selected', 'true');
                setView('AUTH');
              }}
              className="group relative overflow-hidden p-1 rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl"></div>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-xl p-6 flex items-center justify-between border border-white/10 group-hover:border-white/20">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{lang.flag}</span>
                  <div className="text-left">
                    <div className="text-xl font-black text-white uppercase tracking-wide">
                      {lang.label}
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <ArrowLeft className="rotate-180 text-white" size={16} />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="h-full flex flex-col relative z-10 overflow-y-auto pb-20">
      <div className="flex justify-between items-center p-6 animate-slide-down">
        <div className="flex items-center gap-3" onClick={openProfile}>
          <div className={`w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-gray-800 cursor-pointer ${getAvatarEffect(user.activeFrame)}`}>
            <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.avatarId}`} alt="Avatar" className="w-full h-full" />
          </div>
          <div>
            <h2 className={`font-black text-lg leading-none ${user.isPremium ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 animate-shimmer' : 'text-white'}`}>
              {user.name}
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/30">
                <Coins size={10} className="fill-yellow-400" /> {user.coins}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-lexi-fuchsia bg-lexi-fuchsia/10 px-2 py-0.5 rounded-full border border-lexi-fuchsia/30">
                <Trophy size={10} /> Lvl {user.level}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setView('SHOP')} className="glass-button px-3 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors group">
            <div className="relative">
              <Coins className="text-yellow-400 group-hover:rotate-12 transition-transform" size={18} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <span className="font-black text-base text-yellow-400 drop-shadow-md">{user.coins}</span>
            <Plus size={12} className="bg-yellow-400 text-black rounded-full p-0.5" />
          </button>

          <button onClick={toggleLanguage} className="glass-button px-3 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors">
            <Globe size={18} className="text-lexi-cyan" />
            <span className="font-bold text-xs text-lexi-cyan uppercase">{getLanguageName(user.language)}</span>
          </button>
        </div>
      </div>

      {/* Cloud Save Card - MOVED TO TOP! */}
      < div className="mb-6 w-full px-2" >
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
      </div >

      {/* Logo & Title */}
      < div className="flex flex-col items-center justify-center mb-6 animate-fade-in" >
        <div className="mb-4 relative">
          <img
            src={user.theme !== 'dark' ? "/logo.png?invert" : "/logo.png"}
            alt="LexiMix"
            className={`h-32 md:h-40 w-auto drop-shadow-xl ${user.theme !== 'dark' ? 'invert' : ''}`}
          />
        </div>
        <div className="mt-4 text-[10px] font-bold tracking-[0.5em] text-purple-200/60 uppercase animate-pulse">
          {t.HOME.TAGLINE}
        </div>
      </div >

      <div className="mb-8 w-full">
      </div>

      <div className="mb-8 w-full">
        <SeasonPass
          xp={user.xp}
          level={user.level}
          isPremium={user.isPremium}
          onBuyPremium={() => setView('SEASON')}
          lang={user.language}
        />

        {/* Season & Premium Info */}
        <div className="flex gap-2 mt-2 px-2">
          {/* Season Timer */}
          <div className="flex-1 bg-gray-900/40 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Season Ende</span>
            <div className="flex items-center gap-2 text-lexi-cyan font-mono font-bold">
              <Clock size={14} />
              {Math.max(0, Math.ceil((getCurrentSeason().endDate - Date.now()) / (1000 * 60 * 60 * 24)))} Tage
            </div>
          </div>

          {/* Premium Status */}
          <div className="flex-1 bg-gray-900/40 border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Premium Status</span>
            {user.isPremium ? (
              <div className="scale-90 origin-center">
                <PremiumStatus isPremium={user.isPremium} premiumActivatedAt={user.premiumActivatedAt} />
              </div>
            ) : (
              <div className="text-gray-500 text-xs font-bold flex items-center gap-1">
                <Lock size={12} /> Inaktiv
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Grid */}
      {/* Grid */}
      <div id="gamemodes" className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
        />
        <GameCard
          mode={GameMode.CHAIN}
          title={t.MODES.CHAIN.title}
          desc={t.MODES.CHAIN.desc}
          color="bg-lexi-card-blue"
          icon={LinkIcon}
        />
        <GameCard
          mode={GameMode.CATEGORY}
          title={t.MODES.CATEGORY.title}
          desc={t.MODES.CATEGORY.desc}
          color="bg-lexi-card-yellow"
          icon={BookOpen}
        />
        <GameCard
          mode={GameMode.SUDOKU}
          title={t.MODES.SUDOKU.title}
          desc={t.MODES.SUDOKU.desc}
          color="bg-lexi-card-purple"
          icon={Grid3X3}
          locked={!user.isPremium}
        />
        <GameCard
          mode={GameMode.CHALLENGE}
          title={t.MODES.CHALLENGE.title}
          desc={t.MODES.CHALLENGE.desc}
          color="bg-lexi-card-dark border border-yellow-500/30"
          icon={Brain}
          delay={250}
          locked={!user.isPremium}
        />
        <GameCard
          mode={GameMode.RIDDLE}
          title={t.MODES.RIDDLE.title}
          desc={t.MODES.RIDDLE.desc}
          color="bg-lexi-card-pink border border-pink-500/30"
          icon={HelpCircle}
          delay={350}
        />
      </div>

      <div className="text-center text-[10px] text-lexi-text-muted font-bold mt-4 pb-8 uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
        Made by Kevin Wagner 2025
      </div>
    </div >
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
              onClick={startGameFromTutorial}
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
    const isRiddle = gameConfig?.mode === GameMode.RIDDLE;
    const showTimer = gameState.timeLeft !== undefined;

    // Determine Help Text based on Mode for "Info Bar"
    let infoText = "Good Luck!";
    if (isSudoku) infoText = "Fill grid (A-I). No repeats.";
    else if (gameState.isMath) infoText = "Solve the math expression.";
    else if (isRiddle) infoText = "Solve the riddle.";
    else infoText = `${gameState.targetWord.length} ${t.GAME.INFO_BAR}`;

    const validationStatus = (isSudoku && gameState.data?.sudokuGrid)
      ? validateSudoku(gameState.currentGrid, gameState.data.sudokuGrid)
      : undefined;

    return (
      <div className="flex flex-col h-full max-h-screen relative z-10">
        {/* Header - Completely Redesigned for Space and Boldness */}
        <div className="relative z-20 pt-6 pb-4 px-6 animate-slide-down flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-between mb-4">
            <button onClick={() => handleNavigate('LEVELS')} className="w-12 h-12 flex items-center justify-center glass-button rounded-full hover:bg-white/10 transition-colors active:scale-95">
              <ArrowLeft size={24} className="text-lexi-text" />
            </button>

            {/* Timer (Speedrun / Challenge) */}
            {showTimer && (
              <div className={`text-2xl font-black font-mono flex items-center gap-2 px-4 py-2 rounded-xl glass-panel ${gameState.timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-lexi-cyan'}`}>
                <Clock size={20} /> {gameState.timeLeft}s
              </div>
            )}

            <div className="w-12"></div> {/* Spacer for balance */}
          </div>

          <h1 className="text-4xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-scale-in leading-none text-center mb-2">
            {gameState.hintTitle || (isSudoku ? t.GAME.SUDOKU_TITLE : (isRiddle ? t.MODES.RIDDLE.title : t.GAME.CLASSIC_TITLE))}
          </h1>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl shadow-xl animate-fade-in">
            <p className="text-lg md:text-xl font-bold text-lexi-text-muted text-center">
              "{gameState.hintDesc || (isSudoku ? t.GAME.SUDOKU_DESC : "...")}"
            </p>
          </div>

          {/* Target Word (Debug/Info) - Hidden or Subtle */}
          {/* <span className="text-xs text-red-500/50">[{gameState.targetWord}]</span> */}
        </div>

        {/* Game Board - Centered with more breathing room */}
        <div className="flex-1 w-full relative flex flex-col justify-center py-8 overflow-hidden">
          <div className="w-full max-w-3xl mx-auto px-4 animate-float-slow">
            {isSudoku ? (
              <div className="flex flex-col items-center gap-4 transform scale-95 md:scale-100 transition-transform">
                <SudokuGrid
                  board={gameState.currentGrid}
                  original={gameState.data.sudokuPuzzle}
                  selectedCell={gameState.selectedCell}
                  validation={validationStatus}
                  onCellSelect={(r: number, c: number) => {
                    setGameState((prev: any) => ({ ...prev, selectedCell: { r, c } }));
                    // Focus input to ensure mobile keyboard opens
                    if (hiddenInputRef.current) {
                      hiddenInputRef.current.focus();
                    }
                  }}
                />
                <SudokuControls
                  onInput={(char) => handleSudokuInput(char)}
                  onDelete={() => {
                    const currentGameState = gameStateRef.current;
                    if (currentGameState?.selectedCell) {
                      const { r, c } = currentGameState.selectedCell;
                      // Only delete if not fixed
                      if (currentGameState.data.sudokuPuzzle[r][c] === null) {
                        const newGrid = [...currentGameState.currentGrid];
                        newGrid[r][c] = null;
                        setGameState((prev: any) => ({ ...prev, currentGrid: newGrid }));
                        audio.playClick();
                      }
                    }
                  }}
                />
              </div>
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

        {/* Hint Button - Prominent, Animated, Lower */}
        <div className="absolute bottom-8 right-6 z-30">
          <button
            onClick={triggerHint}
            className="group relative w-20 h-20 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-all hover:scale-110 active:scale-95 animate-bounce-slow"
          >
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-20"></div>
            <HelpCircle size={40} className="text-white drop-shadow-md group-hover:rotate-12 transition-transform" />
            {/* Badge for Cost */}
            {hintCostMultiplier > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border-2 border-white">
                -{hintCostMultiplier * 10}
              </div>
            )}
          </button>
        </div>

        {/* Controls - Native Keyboard Input */}
        <input
          ref={hiddenInputRef}
          type="text"
          className={`opacity-0 absolute top-0 left-0 z-0 ${isSudoku ? 'w-px h-px pointer-events-none' : 'h-full w-full cursor-default'}`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck="false"
          value=""
          onChange={(e) => {
            const val = e.target.value.toUpperCase();
            const char = val.slice(-1);
            if (/^[A-Z0-9]$/.test(char)) {
              if (isSudoku) handleSudokuInput(char);
              else handleWordKey(char);
            }
            // Reset input to keep it empty
            e.target.value = "";
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              if (!isSudoku) handleWordDelete();
            } else if (e.key === 'Enter') {
              if (!isSudoku) handleWordEnter();
            }
          }}
          onBlur={(e) => {
            // Try to keep focus if playing
            if (gameState?.status === 'playing') {
              setTimeout(() => e.target.focus(), 10);
            }
          }}
        />
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
    <div className={`${user.theme} h-screen w-full text-lexi-text font-sans overflow-hidden relative selection:bg-cyan-400 selection:text-black py-4 transition-colors duration-300 ${user.theme === 'dark' ? 'bg-[#0b1120]' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Simplified grain texture using CSS */}
      <div className="fixed inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '180px 180px'
      }}></div>
      {/* Dynamic Background Layers */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-900/50 to-cyan-900/20 pointer-events-none"></div>
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Fade Transition Removed */}

      {/* Version Manager - Handles Updates & Changelog */}
      <VersionManager isOnline={isOnline} t={t} />

      {/* Offline Blocking Overlay */}
      {!isOnline && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-panel p-8 rounded-3xl max-w-md mx-4 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500 animate-pulse">
              <WifiOff size={40} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2 uppercase">Keine Verbindung</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                LexiMix benötigt eine aktive Internetverbindung, um deine Fortschritte mit Firebase zu synchronisieren. Bitte stelle eine Verbindung her und versuche es erneut.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-xs text-gray-400">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Offline-Modus nicht verfügbar</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Database size={12} />
                <span>Firebase-Synchronisation erforderlich</span>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:brightness-110 text-white font-black uppercase rounded-xl transition-all"
            >
              Neu laden
            </button>
          </div>
        </div>
      )}

      {view === 'ONBOARDING' && renderOnboarding()}
      {view === 'LANGUAGE_SELECT' && renderLanguageSelect()}
      {view === 'HOME' && renderHome()}
      {view === 'SEASON' && (
        <SeasonPassView
          user={user}
          onClose={() => handleNavigate('HOME')}
          onClaim={handleClaimReward}
          onShowPremium={() => setShowPremiumInfo(true)}
        />
      )}
      {view === 'LEVELS' && renderLevels()}
      {view === 'GAME' && renderGame()}
      {view === 'TUTORIAL' && renderTutorial()}
      {/* Navigation Icons */}

      {/* Challenge Mode Intro Modal */}
      <Modal isOpen={showChallengeIntro} onClose={() => setShowChallengeIntro(false)} title={t.MODES.CHALLENGE.title}>
        <div className="p-6 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
            <Brain size={40} className="text-white" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white mb-2 uppercase italic">Bereit für die ultimative Prüfung?</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Der Challenge Mode kombiniert <strong>Worträtsel</strong> und <strong>Matheaufgaben</strong>.
              Die Schwierigkeit steigt mit jedem Level an!
            </p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-xl border border-white/10 text-left space-y-2">
            <div className="flex items-center gap-3">
              <Zap size={16} className="text-yellow-400" />
              <span className="text-xs text-gray-300">Begrenzte Zeit pro Aufgabe</span>
            </div>
            <div className="flex items-center gap-3">
              <Skull size={16} className="text-red-400" />
              <span className="text-xs text-gray-300">Keine Hinweise verfügbar</span>
            </div>
            <div className="flex items-center gap-3">
              <Trophy size={16} className="text-purple-400" />
              <span className="text-xs text-gray-300">Doppelte XP & Münzen</span>
            </div>
          </div>

          <button
            onClick={() => {
              setShowChallengeIntro(false);
              if (challengeIntroCallback) challengeIntroCallback();
            }}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:brightness-110 text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Play size={20} fill="currentColor" /> Challenge Starten
          </button>
        </div>
      </Modal>

      {/* Auth Screen (First screen) */}
      {view === 'AUTH' && (
        <div className="h-full flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center space-y-4">
              <img
                src="/logo.png"
                alt="LexiMix Logo"
                className="w-32 h-32 mx-auto"
              />
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

      {view === 'SHOP' && (
        <ShopView
          user={user}
          setUser={setUser}
          setView={setView}
          t={t}
          setShowRedeemModal={setShowRedeemModal}
          setRedeemStep={setRedeemStep}
          handleBuyItem={handleBuyItem}
        />
      )}

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
              </ul>

              <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-3 mt-4">
                <p className="text-red-400 font-bold text-xs mb-2">
                  ⚠️ Zur Bestätigung bitte "DELETE" eingeben:
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-black/50 border border-red-500/50 rounded p-2 text-white font-bold text-center focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={confirmDelete}
              disabled={deleteInput !== 'DELETE'}
              className="w-full py-4 rounded-xl font-black text-sm uppercase bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Skull size={18} />
              JA, ALLES LÖSCHEN
            </button>

            <button
              onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
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

      {/* Redeem Code Modal - NEW VOUCHER SYSTEM */}
      <Modal
        isOpen={showRedeemModal}
        onClose={() => {
          setShowRedeemModal(false);
          setVoucherCode('');
          setVoucherError('');
          setVoucherSuccess('');
        }}
        title="🎁 Gutschein Einlösen"
      >
        <div className="text-center py-6 space-y-6">
          <div className="inline-block p-6 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Sparkles className="text-blue-400 drop-shadow-lg" size={48} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-300">Gutscheincode eingeben</h3>
            <p className="text-xs text-gray-500">Gib deinen Gutscheincode ein um Münzen zu erhalten</p>
          </div>

          <div className="w-full">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => {
                setVoucherCode(e.target.value.toUpperCase());
                setVoucherError('');
                setVoucherSuccess('');
              }}
              placeholder="GUTSCHEIN123"
              className={`w-full bg-gray-900 border-2 ${voucherError
                ? 'border-red-500 animate-shake'
                : voucherSuccess
                  ? 'border-green-500'
                  : 'border-gray-700 focus:border-blue-400'
                } rounded-xl p-4 text-center text-sm font-mono font-bold focus:outline-none transition-colors text-white uppercase`}
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleVoucherRedeem();
                }
              }}
            />

            {voucherError && (
              <div className="mt-2 text-red-500 text-xs font-bold animate-pulse flex items-center justify-center gap-1">
                <AlertTriangle size={12} /> {voucherError}
              </div>
            )}

            {voucherSuccess && (
              <div className="mt-2 text-green-500 text-xs font-bold flex items-center justify-center gap-1">
                <Check size={12} /> {voucherSuccess}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => {
                setShowRedeemModal(false);
                setVoucherCode('');
                setVoucherError('');
                setVoucherSuccess('');
              }}
            >
              Abbrechen
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:brightness-110"
              onClick={handleVoucherRedeem}
              disabled={!voucherCode.trim() || !!voucherSuccess}
            >
              {voucherSuccess ? '✓ Eingelöst' : 'Einlösen'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Premium Info Modal */}
      {/* Premium Info Modal */}
      <Modal isOpen={showPremiumInfo} onClose={() => setShowPremiumInfo(false)} title="Premium Store">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-block p-3 sm:p-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 shadow-[0_0_30px_rgba(168,85,247,0.4)] mb-3 sm:mb-4">
              <Crown className="text-white" size={24} fill="currentColor" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Wähle deinen Plan
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Schalte alle Features frei & dominiere die Liga!</p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Plan 1: 7.99 */}
            <div
              className={`relative p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedPlan === 'monthly' ? 'border-yellow-400 bg-yellow-900/20 scale-[1.02] shadow-xl' : 'border-white/10 bg-black/20 hover:bg-white/5'}`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <div className="absolute -top-2 sm:-top-3 right-2 sm:right-4 bg-yellow-500 text-black text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-lg animate-pulse">BEST VALUE</div>
              <h4 className="font-bold text-base sm:text-lg text-white">Monatlich</h4>
              <div className="text-2xl sm:text-3xl font-black text-yellow-400 my-1 sm:my-2">7,99€</div>
              <ul className="text-[10px] sm:text-xs text-gray-300 space-y-1 sm:space-y-2">
                <li className="flex items-center gap-1 sm:gap-2"><Check size={10} className="sm:w-3 sm:h-3 text-green-400" /> Alle Premium Features</li>
                <li className="flex items-center gap-1 sm:gap-2 text-yellow-300 font-bold"><Sparkles size={10} className="sm:w-3 sm:h-3" /> + 10 Level Boost (Sofort!)</li>
                <li className="flex items-center gap-1 sm:gap-2"><Clock size={10} className="sm:w-3 sm:h-3 text-blue-400" /> Automatische Verlängerung</li>
              </ul>
            </div>

            {/* Plan 2: 4.99 */}
            <div
              className={`relative p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${selectedPlan === '30days' ? 'border-purple-400 bg-purple-900/20 scale-[1.02] shadow-xl' : 'border-white/10 bg-black/20 hover:bg-white/5'}`}
              onClick={() => setSelectedPlan('30days')}
            >
              <h4 className="font-bold text-base sm:text-lg text-white">30 Tage Pass</h4>
              <div className="text-2xl sm:text-3xl font-black text-purple-400 my-1 sm:my-2">4,99€</div>
              <ul className="text-[10px] sm:text-xs text-gray-300 space-y-1 sm:space-y-2">
                <li className="flex items-center gap-1 sm:gap-2"><Check size={10} className="sm:w-3 sm:h-3 text-green-400" /> Alle Premium Features</li>
                <li className="flex items-center gap-1 sm:gap-2"><CreditCard size={10} className="sm:w-3 sm:h-3 text-gray-400" /> Kein Abo (Einmalig)</li>
              </ul>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-black/40 p-3 sm:p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px]">
            <h4 className="text-xs sm:text-sm font-bold text-gray-400 mb-3 sm:mb-4 uppercase tracking-wider text-center flex items-center gap-2">
              <CreditCard size={14} className="sm:w-4 sm:h-4" /> Bezahlen mit PayPal
            </h4>
            <div className="w-full max-w-[250px] relative z-0">
              {selectedPlan === 'monthly' && (
                <PayPalButton amount="7.99" onSuccess={(d: any) => handlePayPalSuccess(d, 'monthly')} />
              )}
              {selectedPlan === '30days' && (
                <PayPalButton amount="4.99" onSuccess={(d: any) => handlePayPalSuccess(d, '30days')} />
              )}
            </div>
          </div>

          {/* Voucher Section */}
          <div className="border-t border-white/10 pt-4 sm:pt-6">
            <h4 className="text-xs sm:text-sm font-bold text-gray-400 mb-2 sm:mb-3 flex items-center gap-2">
              <Gem size={14} className="sm:w-4 sm:h-4" /> Gutscheincode einlösen
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Code eingeben..."
                className="flex-1 bg-black/30 border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-sm sm:text-base text-white focus:border-yellow-400 outline-none transition-colors font-mono uppercase"
              />
              <button
                onClick={handleVoucherRedeem}
                className="bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors"
              >
                Einlösen
              </button>
            </div>
            {/* Error/Success Messages reuse existing states */}
            {voucherError && (
              <div className="mt-2 text-red-500 text-xs font-bold animate-pulse flex items-center gap-1">
                <AlertTriangle size={12} /> {voucherError}
              </div>
            )}
            {voucherSuccess && (
              <div className="mt-2 text-green-500 text-xs font-bold flex items-center gap-1">
                <Check size={12} /> {voucherSuccess}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Premium Required Modal */}
      < Modal isOpen={showPremiumRequiredModal} onClose={() => setShowPremiumRequiredModal(false)} title="Premium Erforderlich" >
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
      </Modal >

      {/* Username Change Confirmation Modal */}
      < Modal
        isOpen={showUsernameConfirm}
        onClose={() => setShowUsernameConfirm(false)}
        title="Benutzername ändern?"
      >
        <div className="text-center space-y-6">
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <User size={24} className="text-yellow-400" />
              <h3 className="text-lg font-bold text-white">Bestätigung erforderlich</h3>
            </div>
            <p className="text-sm text-yellow-300 font-bold">
              Neuer Benutzername: <span className="text-white">{editUsername}</span>
            </p>
            <p className="text-sm text-yellow-400 mt-2">
              Kosten: 2500 Münzen
            </p>
            <p className="text-xs text-red-400 mt-3 font-bold">
              ⚠️ Diese Änderung kann nicht rückgängig gemacht werden!
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowUsernameConfirm(false)}
              className="flex-1 py-3 rounded-xl font-bold text-sm uppercase bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={confirmUsernameChange}
              className="flex-1 py-3 rounded-xl font-bold text-sm uppercase bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              <User size={16} /> Bestätigen
            </button>
          </div>
        </div>
      </Modal >

      {/* Profile Modal */}
      <Modal isOpen={showProfile} onClose={() => setShowProfile(false)} title={t.PROFILE.TITLE}>
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Username Section */}
          {cloudUsername && (
            <>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Benutzername</h3>
              <div className="bg-gray-900 p-4 rounded-xl border border-white/10">
                <p className="text-xs text-gray-400 mb-2">Aktuell: <span className="text-white font-bold">{cloudUsername}</span></p>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-2"
                  value={editUsername}
                  onChange={(e) => {
                    setEditUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                  }}
                  placeholder="Neuer Benutzername"
                />
                {usernameError && <p className="text-red-400 text-xs font-bold">{usernameError}</p>}
                <p className="text-xs text-yellow-400 mt-2">Kosten: 2500 Münzen</p>
                <button
                  onClick={handleUsernameChange}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase rounded-lg mt-2 transition-colors"
                >
                  Ändern
                </button>
              </div>
            </>
          )}

          {/* Avatar Preview */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Avatar Vorschau</h3>
            <div className="flex justify-center mb-4">
              <div className={`w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden ${getAvatarEffect(editFrame)}`}>
                <img
                  src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${editAvatar}`}
                  alt="Avatar"
                  className="w-full h-full bg-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Avatar Wählen</h3>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
              {(user.ownedAvatars || [AVATARS[0]]).map(avatar => (
                <button
                  key={avatar}
                  onClick={() => setEditAvatar(avatar)}
                  className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${editAvatar === avatar ? 'border-lexi-fuchsia scale-105' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                >
                  <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${avatar}`} alt="Avatar" className="w-full h-full bg-gray-800" />
                </button>
              ))}
            </div>
          </div>

          {/* Age Input (LOCKED) */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              Alter <Lock size={12} className="text-red-400" />
            </h3>
            <div className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-400 font-bold cursor-not-allowed flex items-center justify-between">
              <span>{editAge}</span>
              <span className="text-xs text-red-500 uppercase">Fixiert</span>
            </div>
            <p className="text-[10px] text-gray-600 mt-1">Das Alter kann nachträglich nicht geändert werden.</p>
          </div>

          {/* Stats Display */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Statistiken</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-900 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-gray-500">Level</p>
                <p className="text-xl font-black text-white">{user.level}</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-gray-500">Gesamt XP</p>
                <p className="text-xl font-black text-white">{user.xp}</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-gray-500">Münzen</p>
                <p className="text-xl font-black text-yellow-400">{user.coins}</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-xl border border-white/10">
                <p className="text-xs text-gray-500">Gelöste Rätsel</p>
                <p className="text-xl font-black text-cyan-400">{user.completedLevels?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Frames / Effects Selection */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rahmen & Effekte</h3>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setEditFrame('none')}
                className={`aspect-square rounded-xl border-2 flex items-center justify-center bg-gray-800 ${editFrame === 'none' ? 'border-lexi-fuchsia' : 'border-white/10'}`}
              >
                <span className="text-xs text-gray-500">Kein</span>
              </button>
              {(user.ownedFrames || []).map((frameId) => {
                const effectClass = getAvatarEffect(frameId);
                return (
                  <button
                    key={frameId}
                    onClick={() => setEditFrame(frameId)}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center bg-gray-800 relative overflow-hidden ${editFrame === frameId ? 'border-lexi-fuchsia' : 'border-white/10'}`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-gray-700 ${effectClass}`}></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delete Profile Button */}
          <div className="border-t border-white/10 pt-4 mt-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 bg-red-900/20 hover:bg-red-900/40 text-red-500 font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Skull size={16} /> Profil Löschen
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowProfile(false)}
              className="flex-1 py-4 rounded-xl font-bold text-sm uppercase bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={saveProfile}
              className="flex-1 py-4 rounded-xl font-black text-sm uppercase bg-lexi-fuchsia hover:bg-lexi-fuchsia/80 text-white transition-colors shadow-[0_0_20px_rgba(217,70,239,0.4)]"
            >
              {t.PROFILE.SAVE}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Profile Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} title="Profil Löschen">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 bg-red-900/20 p-4 rounded-xl border border-red-500/30">
            <AlertTriangle size={24} className="text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-2">Warnung!</h3>
              <p className="text-sm text-gray-300">
                Diese Aktion kann NICHT rückgängig gemacht werden. Alle deine Fortschritte, Käufe und Erfolge werden permanent gelöscht.
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
              Tippe "delete" um zu bestätigen:
            </label>
            <input
              type="text"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="delete"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
              className="flex-1 py-3 rounded-xl font-bold text-sm uppercase bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={() => {
                if (deleteInput.toLowerCase() === 'delete') {
                  // TODO: Implement server deletion via Firebase
                  alert('Profil-Löschung noch nicht implementiert. Bald verfügbar!');
                  setShowDeleteConfirm(false);
                  setDeleteInput('');
                } else {
                  alert('Bitte tippe "delete" um zu bestätigen.');
                }
              }}
              disabled={deleteInput.toLowerCase() !== 'delete'}
              className="flex-1 py-3 rounded-xl font-bold text-sm uppercase bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Skull size={16} /> Endgültig Löschen
            </button>
          </div>
        </div>
      </Modal>

      {/* Cloud Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleCloudLogin}
      />

      {/* Web Version: APK Download Button */}
      {(window as any).Capacitor === undefined && (
        <div className="fixed bottom-4 right-4 z-[50]">
          <a
            href="https://leximix.de/app-release.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black/40 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white/50 hover:text-white px-4 py-2 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest group"
          >
            <Download size={14} className="group-hover:text-lexi-fuchsia transition-colors" />
            <span>Android App</span>
          </a>
        </div>
      )}

      {/* Version Display (Bottom Left) */}
      <div className="fixed bottom-4 left-4 z-[50] pointer-events-none">
        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">
          v{APP_VERSION}
        </div>
      </div>

    </div>
  );
}
// (c) KW 1998
1998
