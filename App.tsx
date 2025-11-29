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
import { LetterMauMauGame } from './components/LetterMauMauGame';
import { ChainGame } from './components/ChainGame';
import { ChessGame } from './components/ChessGame';
import { CheckersGame } from './components/CheckersGame';
import { NineMensMorrisGame } from './components/NineMensMorrisGame';
import { RummyGame } from './components/RummyGame';
import { ProfileEditor } from './components/ProfileEditor';
import { StickerAlbumView } from './components/StickerAlbumView';

import SkatMauMauGame from './components/SkatMauMauGame';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { FriendsManager } from './components/FriendsManager';
import { TIER_COLORS, TIER_BG, TUTORIALS, TRANSLATIONS, AVATARS, MATH_CHALLENGES, SHOP_ITEMS, PREMIUM_PLANS, VALID_CODES, COIN_CODES, SEASON_REWARDS, getCurrentSeason, generateSeasonRewards, SEASONS, APP_VERSION } from './constants';
import { auth, database } from './utils/firebase';
import { ref, onValue } from 'firebase/database';
import { getLevelContent, checkGuess, generateSudoku, generateChallenge, generateRiddle } from './utils/gameLogic';
import { validateSudoku } from './utils/sudokuValidation';
import { audio } from './utils/audio';
import catDanceGif from './assets/cat-dance.gif';


import { Trophy, ArrowLeft, HelpCircle, Gem, Lock, User, Users, Globe, Puzzle, Zap, Link as LinkIcon, BookOpen, Grid3X3, Play, Check, Star, Clock, Sparkles, Settings, Edit2, Skull, Brain, Info, ShoppingBag, Coins, CreditCard, AlertTriangle, Crown, Sun, Moon, Plus, WifiOff, Database, Download, Menu, X, Smartphone, Cpu, Circle, Target, Layers } from 'lucide-react';

// React Icons for brutal design
import { IoGlobeSharp, IoPersonSharp, IoSettingsSharp } from 'react-icons/io5';


// --- Sub Components for Game Logic ---

const Keyboard = ({ onChar, onDelete, onEnter, usedKeys, isMathMode, t }: any) => {
  const rows = isMathMode ? [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0', '+', '-', '*', '/']
  ] : [
    "QWERTYUIOPÜ".split(''),
    "ASDFGHJKLÖÄ".split(''),
    "ZXCVBNMß".split('')
  ];

  // Soft colorful key styles
  const getKeyStyle = (status: string) => {
    if (status === 'correct') return {
      background: 'linear-gradient(135deg, #06FFA5, #00D68F)',
      color: '#FFF',
      borderRadius: '8px',
      boxShadow: '0 3px 10px rgba(6,255,165,0.3)'
    };
    if (status === 'present') return {
      background: 'linear-gradient(135deg, #FFBE0B, #FF9500)',
      color: '#FFF',
      borderRadius: '8px',
      boxShadow: '0 3px 10px rgba(255,190,11,0.3)'
    };
    if (status === 'absent') return {
      background: '#E5E5E5',
      color: '#999',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
    };
    return {
      background: '#FFF',
      color: '#1a1a2e',
      borderRadius: '8px',
      boxShadow: '0 3px 10px rgba(0,0,0,0.08)'
    };
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 pb-4 select-none">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5 mb-2">
          {row.map(char => {
            const status = usedKeys[char];
            return (
              <button
                key={char}
                onClick={() => onChar(char)}
                className="h-11 sm:h-12 flex-1 font-black text-sm sm:text-base uppercase transition-all active:scale-95"
                style={getKeyStyle(status)}
              >
                {char}
              </button>
            );
          })}
          {i === rows.length - 1 && (
            <button
              onClick={onDelete}
              className="h-11 sm:h-12 px-3 sm:px-4 font-black text-xs uppercase transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #FF006E, #D60054)',
                color: '#FFF',
                borderRadius: '8px',
                boxShadow: '0 3px 10px rgba(255,0,110,0.3)'
              }}
            >
              DEL
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onEnter}
        className="w-full h-12 sm:h-14 font-black text-base sm:text-lg uppercase mt-2 transition-all active:scale-98"
        style={{
          background: 'linear-gradient(135deg, #06FFA5, #00D68F)',
          color: '#FFF',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(6,255,165,0.3)'
        }}
      >
        {t.GAME.ENTER_GUESS}
      </button>
    </div>
  );
};

const WordGrid = ({ guesses, currentGuess, targetLength, turn }: any) => {
  const empties = Array(Math.max(0, 6 - 1 - turn)).fill(null);

  const gridStyle = {
    gridTemplateColumns: `repeat(${targetLength}, min(13vw, 3.2rem))`
  };

  // Soft colorful cell styles
  const getCellStyle = (result: string) => {
    if (result === 'correct') return {
      background: 'linear-gradient(135deg, #06FFA5, #00D68F)',
      color: '#FFF',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(6,255,165,0.3)'
    };
    if (result === 'present') return {
      background: 'linear-gradient(135deg, #FFBE0B, #FF9500)',
      color: '#FFF',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(255,190,11,0.3)'
    };
    return {
      background: 'linear-gradient(135deg, #FF006E, #D60054)',
      color: '#FFF',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(255,0,110,0.3)'
    };
  };

  return (
    <div className="flex flex-col gap-2 w-fit mx-auto">
      {/* Submitted guesses */}
      {guesses.map((guess: any, i: number) => (
        <div key={i} className="grid gap-2 justify-center" style={gridStyle}>
          {guess.word.split('').map((char: string, j: number) => (
            <div
              key={j}
              className="aspect-square flex items-center justify-center font-black text-xl md:text-2xl uppercase transition-all"
              style={getCellStyle(guess.result[j])}
            >
              {char}
            </div>
          ))}
        </div>
      ))}

      {/* Current guess row */}
      {turn < 6 && (
        <div className="grid gap-2 justify-center" style={gridStyle}>
          {Array(targetLength).fill(null).map((_, i) => (
            <div
              key={i}
              className="aspect-square flex items-center justify-center font-black text-xl md:text-2xl uppercase transition-all"
              style={{
                background: currentGuess[i] ? '#FFF' : 'rgba(255,255,255,0.6)',
                color: '#1a1a2e',
                borderRadius: '10px',
                boxShadow: currentGuess[i] ? '0 4px 16px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
                border: currentGuess[i] ? '2px solid rgba(0,0,0,0.1)' : '2px solid transparent'
              }}
            >
              {currentGuess[i] || ''}
            </div>
          ))}
        </div>
      )}

      {/* Empty rows */}
      {empties.map((_, i) => (
        <div key={`empty-${i}`} className="grid gap-2 justify-center" style={gridStyle}>
          {Array(targetLength).fill(null).map((__, j) => (
            <div
              key={j}
              className="aspect-square"
              style={{
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '10px',
                border: '2px dashed rgba(0,0,0,0.1)'
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// --- Main App Component ---

// Define ViewType
type ViewType = 'ONBOARDING' | 'HOME' | 'MODES' | 'LEVELS' | 'GAME' | 'TUTORIAL' | 'SEASON' | 'SHOP' | 'AUTH' | 'MAU_MAU' | 'SKAT_MAU_MAU' | 'CHESS' | 'CHECKERS' | 'NINE_MENS_MORRIS' | 'RUMMY';

const FALLBACK_SEASON_CONFIG = {
  "activeSeasonId": 1,
  "currentSeasonId": 1,
  "seasons": [
    {
      "id": 1,
      "name": "Genesis",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "colors": {
        "primary": "#8B5CF6",
        "secondary": "#EC4899",
        "accent": "#F59E0B",
        "bgDark": "#1F2937",
        "bgCard": "#374151"
      },
      "rewards": []
    },
    {
      "id": 2,
      "name": "Neon Uprising",
      "startDate": "2025-01-01",
      "endDate": "2025-03-31",
      "colors": {
        "primary": "#00f2ff",
        "secondary": "#ff0099",
        "accent": "#ccff00",
        "bgDark": "#0a0a12",
        "bgCard": "#161622"
      },
      "rewards": []
    }
  ]
};

export default function App() {
  const [view, setView] = useState<ViewType>('ONBOARDING');
  const [apkDownloadUrl, setApkDownloadUrl] = useState('http://leximix.de/LexiMix-v3.0.2-Release.apk');

  useEffect(() => {
    const systemRef = ref(database, 'system');
    const unsubscribe = onValue(systemRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.download_url) {
          setApkDownloadUrl(data.download_url);
        }
      }
    });
    return () => unsubscribe();
  }, []);

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
  const [tempUser, setTempUser] = useState<{ name: string; age: string | number; language: Language }>({ name: '', age: '', language: Language.EN });

  const [user, setUser] = useState<UserState>(() => {
    const savedLang = localStorage.getItem('leximix_language_pref') as Language;

    try {
      const saved = localStorage.getItem('leximix_user'); // FIXED: Was leximix_user_v2

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
          isPremium: parsed.isPremium || false,
          language: savedLang || parsed.language || Language.DE
        };
      }

      // Default state for NEW USERS
      return {
        name: 'Player',
        age: 0,
        language: savedLang || Language.DE,
        avatarId: AVATARS[0],
        coins: 0, // Start with 0 coins
        xp: 0, // Start with 0 XP
        level: 1, // Start at Level 1
        completedLevels: initialLevelsUnlocked, // Start with NO levels completed
        theme: 'light',
        inventory: [],
        ownedAvatars: [AVATARS[0]],
        isPremium: false, // No premium
        playedWords: [],
        activeFrame: null,
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
      language: savedLang || Language.DE,
      theme: 'dark',
      activeFrame: null,
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
  const [seasonConfig, setSeasonConfig] = useState<{ activeId: number, seasons: any[] } | null>(null);
  const [currentSeason, setCurrentSeason] = useState(() => getCurrentSeason());
  const [dynamicRewards, setDynamicRewards] = useState(SEASON_REWARDS);

  // Fetch Season Settings from Ionos & Firebase
  useEffect(() => {
    let unsubscribeSeasonId: (() => void) | undefined;

    const fetchSeasonSettings = async () => {
      try {
        // 1. Setup Real-time Listener for Active Season ID from Firebase
        // Import the initialized database instance to avoid initialization errors
        let db;
        let seasonRef;

        try {
          const { database } = await import('./utils/firebase');
          const { ref } = await import('firebase/database');
          db = database;
          seasonRef = ref(db, 'system/active_season_id');
        } catch (initError) {
          console.warn('[Season] Failed to import initialized database, falling back to getDatabase:', initError);
          const { getDatabase, ref } = await import('firebase/database');
          db = getDatabase();
          seasonRef = ref(db, 'system/active_season_id');
        }

        const { onValue } = await import('firebase/database');

        // 2. Fetch Season Data from Ionos (static config)
        let settings = null; // Declare settings here
        let response;
        try {
          response = await fetch('http://leximix.de/season_settings.json');
          if (!response.ok) throw new Error('Network response was not ok');
        } catch (e) {
          console.warn('[Season] Remote fetch failed, trying local fallback');
          try {
            response = await fetch('/season_settings.json');
          } catch (e2) {
            console.warn('[Season] Local fallback failed');
          }
        }

        if (response.ok) {
          settings = await response.json(); // Assign to settings
          setSeasonConfig(settings);
        } else {
          console.warn('[Season] Fetch failed, using hardcoded fallback');
          settings = FALLBACK_SEASON_CONFIG;
          setSeasonConfig(settings);
        }

        // 3. Listen for ID changes (Moved outside try/catch of fetch to ensure it runs)
        unsubscribeSeasonId = onValue(seasonRef, (snapshot) => {
          const firebaseActiveId = snapshot.exists() ? snapshot.val() : null;

          // Priority: Firebase ID > JSON activeSeasonId > Date-based fallback
          // Use currentSeasonId which is the correct key from the JSON
          // Use local 'settings' variable if available, otherwise fallback to state (which might be null initially but we are inside the function where we try to fetch it)
          // Actually, we should use the 'settings' object we just fetched/derived.

          const currentSettings = settings || seasonConfig;
          const activeId = firebaseActiveId || (currentSettings ? ((currentSettings as any).currentSeasonId || currentSettings.activeId) : null);

          if (activeId && currentSettings) {
            const activeSeasonData = currentSettings.seasons.find((s: any) => s.id === activeId);
            if (activeSeasonData) {
              console.log(`[Season] Loaded Dynamic Season: ${activeSeasonData.name} (ID: ${activeId})`);
              setCurrentSeason(activeSeasonData);

              // Update Rewards
              if (activeSeasonData.rewards) {
                setDynamicRewards(activeSeasonData.rewards);
              }

              // Apply Colors
              const root = document.documentElement;
              root.style.setProperty('--season-primary', activeSeasonData.colors.primary);
              root.style.setProperty('--season-secondary', activeSeasonData.colors.secondary);
              root.style.setProperty('--season-accent', activeSeasonData.colors.accent);
              root.style.setProperty('--season-bg-dark', activeSeasonData.colors.bgDark);
              root.style.setProperty('--season-bg-card', activeSeasonData.colors.bgCard);
            }
          }
        });

      } catch (error) {
        console.error('[Season] Failed to load dynamic settings:', error);
      }
    };

    fetchSeasonSettings();

    return () => {
      if (unsubscribeSeasonId) unsubscribeSeasonId();
    };
  }, []); // Removed dependency on seasonConfig to prevent infinite loop

  // Apply Season Colors to CSS Variables (Initial / Fallback)
  useEffect(() => {
    if (seasonConfig) return; // Skip if dynamic loaded

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
  }, [seasonConfig]);

  // Persist Language Preference
  useEffect(() => {
    if (user.language) {
      localStorage.setItem('leximix_language_pref', user.language);
    }
  }, [user.language]);

  // Check for saved user on mount to decide initial view
  useEffect(() => {
    try {
      const cloudUser = localStorage.getItem('leximix_cloud_user');
      const hasLanguageSelected = localStorage.getItem('leximix_language_selected');

      // Must be logged in to use app
      if (!cloudUser) {
        setView('AUTH');
      } else {
        setView('HOME'); // Go straight to home

        // Background Sync on Startup: Ensure we have the latest cloud data
        // This fixes issues where local data might be stale or missing
        import('./utils/firebase').then(async ({ loadFromCloud, normalizeUsername, generateFriendCode }) => {
          const normalizedUser = normalizeUsername(cloudUser);
          try {
            const cloudData = await loadFromCloud(normalizedUser);
            if (cloudData) {
              let friendCode = cloudData.friendCode;
              // Generate Friend Code if missing
              if (!friendCode) {
                friendCode = await generateFriendCode(normalizedUser);
              }

              setUser(prev => ({
                ...prev,
                ...cloudData,
                name: normalizedUser, // Ensure username consistency
                friendCode: friendCode // Ensure friend code is in state
              }));
              console.log('[Cloud] Startup sync successful');
            } else {
              // If no cloud data but logged in (rare), generate friend code for new user
              // Note: generateFriendCode already saves to Firebase
              const friendCode = await generateFriendCode(normalizedUser);

              setUser(prev => ({
                ...prev, friendCode: friendCode || undefined
              }));
            }
          } catch (err) {
            console.error('[Cloud] Startup sync failed:', err);
          }
        });
      }
    } catch (error) {
      console.error('[LexiMix] Init error:', error);
      setView('AUTH');
    }
  }, []);

  // Anti-Cheat: Verify premium status with server every 60 seconds
  // Sync user state to cloud on changes (with debouncing)
  useEffect(() => {
    if (!cloudUsername) return;

    // Debounce: Wait 3 seconds before syncing to avoid too many requests
    const syncTimer = setTimeout(async () => {
      try {
        const { saveToCloud } = await import('./utils/firebase');
        const success = await saveToCloud(cloudUsername, user);
        if (success) {
          console.log('[Sync] User data synced to cloud');
        } else {
          console.warn('[Sync] Save failed (rate limit or error)');
        }
      } catch (e) {
        console.error('[Sync] Failed to sync:', e);
      }
    }, 3000);

    return () => clearTimeout(syncTimer);
  }, [cloudUsername, user.level, user.coins, user.xp, user.isPremium, JSON.stringify(user.completedLevels), user.language, user.theme, user.name, user.avatarId, user.activeFrame, JSON.stringify(user.ownedAvatars), JSON.stringify(user.claimedSeasonRewards), JSON.stringify(user.claimedPremiumRewards)]);
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
  const [editFrame, setEditFrame] = useState(user.activeFrame || 'frame_none');
  const [editFont, setEditFont] = useState(user.activeFont || 'font_default');
  const [editEffect, setEditEffect] = useState(user.activeEffect || 'effect_none');
  const [showStickerAlbum, setShowStickerAlbum] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const [showPremiumRequiredModal, setShowPremiumRequiredModal] = useState(false);
  const [showCorrectWordModal, setShowCorrectWordModal] = useState(false);
  const [correctWord, setCorrectWord] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Mau Mau Modal Flow
  const [showMauMauIntro, setShowMauMauIntro] = useState(false);
  const [showMauMauModeSelect, setShowMauMauModeSelect] = useState(false);
  const [showBoardGameModeSelect, setShowBoardGameModeSelect] = useState(false);
  const [selectedBoardGame, setSelectedBoardGame] = useState<GameMode | null>(null);
  const [showChessModeSelect, setShowChessModeSelect] = useState(false);
  const [showMultiplayerLobby, setShowMultiplayerLobby] = useState(false);
  const [showFriendsManager, setShowFriendsManager] = useState(false);
  const [multiplayerGameId, setMultiplayerGameId] = useState<string | null>(null);
  const [multiplayerOpponent, setMultiplayerOpponent] = useState<string | null>(null);
  const [isMultiplayerHost, setIsMultiplayerHost] = useState(false);
  const [globalGameInvite, setGlobalGameInvite] = useState<{ from: string; gameId: string; mode?: GameMode } | null>(null);
  const [pendingSentInvite, setPendingSentInvite] = useState<{ to: string; gameId: string } | null>(null);

  // Global listener for sent invite acceptance (host side)
  useEffect(() => {
    if (!cloudUsername || !pendingSentInvite) {
      console.log('[App] Listener skipped - cloudUsername:', cloudUsername, 'pendingInvite:', pendingSentInvite);
      return;
    }

    console.log('[App] Setting up listener for game:', pendingSentInvite.gameId);
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      const { ref, onValue, off } = await import('firebase/database');
      const { database } = await import('./utils/firebase');

      const gameRef = ref(database, `games/${pendingSentInvite.gameId}`);

      const listener = onValue(gameRef, (snapshot) => {
        if (snapshot.exists()) {
          const gameData = snapshot.val();
          console.log('[App] Game update received:', gameData.status, gameData.players);

          // Game is playing and we're the host - guest accepted!
          if (gameData.status === 'playing' && gameData.players?.host === cloudUsername) {
            console.log('[App] Game accepted by guest, starting game for host');
            setMultiplayerOpponent(pendingSentInvite.to);
            setMultiplayerGameId(pendingSentInvite.gameId);
            setIsMultiplayerHost(true);
            setPendingSentInvite(null);
            setShowMultiplayerLobby(false);
            setView('MAU_MAU');
          }
        } else {
          console.log('[App] Game snapshot does not exist yet');
        }
      });

      unsubscribe = () => off(gameRef);
    };

    setupListener();

    return () => {
      console.log('[App] Cleaning up listener');
      if (unsubscribe) unsubscribe();
    };
  }, [cloudUsername, pendingSentInvite]);

  // Global listener for game invitations (shows popup anywhere in app)
  useEffect(() => {
    if (!cloudUsername) return;

    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      const { ref, onValue, off } = await import('firebase/database');
      const { database } = await import('./utils/firebase');

      const invitesRef = ref(database, `gameInvites/${cloudUsername}`);

      unsubscribe = onValue(invitesRef, (snapshot) => {
        if (snapshot.exists()) {
          const invitesData = snapshot.val();
          const invites = Object.values(invitesData) as any[];
          const pendingInvite = invites.find((inv: any) => inv.status === 'pending');

          if (pendingInvite && !showMultiplayerLobby) {
            // Show global popup only if not already in lobby
            setGlobalGameInvite({
              from: pendingInvite.from,
              gameId: pendingInvite.gameId,
              mode: pendingInvite.mode
            });
          }
        }
      });
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        import('firebase/database').then(({ ref, off }) => {
          import('./utils/firebase').then(({ database }) => {
            off(ref(database, `gameInvites/${cloudUsername}`));
          });
        });
      }
    };
  }, [cloudUsername, showMultiplayerLobby]);

  const handleAcceptGlobalInvite = async () => {
    if (!globalGameInvite || !cloudUsername) {
      console.error('[App] Cannot accept invite - missing data', { globalGameInvite, cloudUsername });
      return;
    }

    console.log('[App] Accepting invite...', globalGameInvite);

    try {
      const { ref, set } = await import('firebase/database');
      const { database } = await import('./utils/firebase');
      const { initializeMultiplayerGame, initializeChessGame } = await import('./utils/multiplayerGame');

      // Update invite status
      console.log('[App] Updating invite status to accepted...');
      await set(ref(database, `gameInvites/${cloudUsername}/${globalGameInvite.gameId}/status`), 'accepted');

      const inviteMode = globalGameInvite.mode || GameMode.SKAT_MAU_MAU;

      if (inviteMode === GameMode.CHESS) {
        console.log('[App] Initializing CHESS game...');
        const initSuccess = await initializeChessGame(
          globalGameInvite.gameId,
          globalGameInvite.from,  // host
          cloudUsername           // guest
        );

        if (!initSuccess) {
          throw new Error('Failed to initialize chess game');
        }

        // Start game
        setMultiplayerOpponent(globalGameInvite.from);
        setMultiplayerGameId(globalGameInvite.gameId);
        setIsMultiplayerHost(false);
        setGameConfig({ mode: GameMode.CHESS, tier: Tier.BEGINNER, levelId: 1 }); // Set config for render
        setGlobalGameInvite(null);
        setView('GAME'); // Chess uses generic GAME view wrapper or renderGame check
      } else {
        // Mau Mau Logic
        const { generateDeck, shuffleDeck, drawCards } = await import('./utils/maumau');

        // Generate and shuffle deck
        console.log('[App] Generating deck...');
        let deck = generateDeck();
        deck = shuffleDeck(deck);

        // Deal cards (5 each)
        const hostHandResult = drawCards(deck, 5);
        const hostHand = hostHandResult.drawn;
        deck = hostHandResult.remaining;

        const guestHandResult = drawCards(deck, 5);
        const guestHand = guestHandResult.drawn;
        deck = guestHandResult.remaining;

        // Draw first card for discard pile
        const firstCardResult = drawCards(deck, 1);
        const discardPile = firstCardResult.drawn;
        deck = firstCardResult.remaining;

        // Initialize full game state with cards
        console.log('[App] Initializing multiplayer game state...');
        const initSuccess = await initializeMultiplayerGame(
          globalGameInvite.gameId,
          globalGameInvite.from,  // host
          cloudUsername,          // guest
          deck,
          discardPile,
          hostHand,
          guestHand
        );

        if (!initSuccess) {
          throw new Error('Failed to initialize multiplayer game');
        }

        console.log('[App] Game initialized successfully! Switching view...');

        // Start game
        setMultiplayerOpponent(globalGameInvite.from);
        setMultiplayerGameId(globalGameInvite.gameId);
        setIsMultiplayerHost(false);
        setGlobalGameInvite(null);
        setView('MAU_MAU');
      }
    } catch (error) {
      console.error('[Global Invite] Accept error:', error);
    }
  };

  const handleDeclineGlobalInvite = async () => {
    if (!globalGameInvite || !cloudUsername) return;

    try {
      const { ref, set } = await import('firebase/database');
      const { database } = await import('./utils/firebase');

      await set(ref(database, `gameInvites/${cloudUsername}/${globalGameInvite.gameId}/status`), 'declined');
      setGlobalGameInvite(null);
    } catch (error) {
      console.error('[Global Invite] Decline error:', error);
    }
  };

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

  // Save to localStorage (but NOT to cloud - that's handled by the debounced sync above)
  useEffect(() => {
    if (view !== 'ONBOARDING') {
      try {
        localStorage.setItem('leximix_user', JSON.stringify(user));
      } catch (error) {
        console.error('[LexiMix] localStorage save error:', error);
      }
    }
  }, [user, view]);

  // SELF-CORRECTING: Ensure Friend Code Exists
  useEffect(() => {
    const ensureFriendCode = async () => {
      // Only run if we have a valid user (not default Player) and NO friend code
      if (user.name && user.name !== 'Player' && !user.friendCode) {
        console.log('[Fix] Missing friend code detected for:', user.name);

        try {
          const { generateFriendCode, saveFriendCodeToFirebase } = await import('./utils/multiplayer');
          const newCode = generateFriendCode();

          await saveFriendCodeToFirebase(user.name, newCode);

          // Update local state immediately
          setUser(prev => ({ ...prev, friendCode: newCode }));

          console.log('[Fix] Generated and saved new friend code:', newCode);
        } catch (err: any) {
          const errorCode = err?.code || 'unknown';
          const errorMessage = err?.message || String(err);
          console.error(`[Fix] Failed to generate friend code. Code: ${errorCode}, Message: ${errorMessage}`);
          if (errorCode === 'PERMISSION_DENIED') {
            console.error('[Fix] Firebase rules are blocking write to friendCodes. Update database.rules.json');
          }
        }
      }
    };

    ensureFriendCode();
  }, [user.name, user.friendCode]);

  const handleClaimReward = (level: number, isPremiumClaim: boolean = false) => {
    const reward = dynamicRewards[level - 1];
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
      } else if (/^[A-ZÄÖÜß]$/.test(key)) {
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

    // Letter Mau Mau goes to intro modal first
    if (mode === GameMode.LETTER_MAU_MAU) {
      setShowMauMauIntro(true);
      return;
    }

    // Skat Mau Mau (Classic Mau Mau) - Show tutorial modal first, then mode select
    if (mode === GameMode.SKAT_MAU_MAU) {
      setGameConfig({ mode, tier: Tier.BEGINNER, levelId: 1 });
      setTutorialMode(mode);
      setView('TUTORIAL');
      return;
    }

    // Chess Mode - Show tutorial first, then mode select
    if (mode === GameMode.CHESS) {
      setGameConfig({ mode, tier: Tier.BEGINNER, levelId: 1 });
      setTutorialMode(mode);
      setView('TUTORIAL');
      return;
    }

    // Checkers, Nine Men's Morris, Rummy - Show tutorial first, then level selection
    if (mode === GameMode.CHECKERS || mode === GameMode.NINE_MENS_MORRIS || mode === GameMode.RUMMY) {
      setGameConfig({ mode, tier: Tier.BEGINNER, levelId: 1 });
      setTutorialMode(mode);
      setView('TUTORIAL');
      return;
    }

    setGameConfig({ mode, tier: Tier.BEGINNER, levelId: 1 }); // Default
    setTutorialMode(mode);
    setView('TUTORIAL');
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
      setTutorialMode(null);
      setView('GAME');
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
      setTutorialMode(null);
      setView('GAME');
    } else if (config.mode === GameMode.CHAIN) {
      setGameConfig(config);
      setView('GAME');
      return;
    } else if (config.mode === GameMode.CHECKERS) {
      // Go directly to Checkers game
      setView('CHECKERS');
      return;
    } else if (config.mode === GameMode.NINE_MENS_MORRIS) {
      // Go directly to Nine Men's Morris game
      setView('NINE_MENS_MORRIS');
      return;
    } else if (config.mode === GameMode.RUMMY) {
      // Go directly to Rummy game
      setView('RUMMY');
      return;
    } else {
      // This block is now handled by the useEffect below
      setTutorialMode(null);
      setView('GAME');
    }
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
      const isRiddle = gameConfig?.mode === GameMode.RIDDLE;

      let content;
      if (isRiddle) {
        content = generateRiddle(user.language, gameConfig.tier, gameConfig.levelId);
      } else {
        content = getLevelContent(gameConfig.mode, gameConfig.tier, gameConfig.levelId, user.language, user.playedWords);
      }

      setGameState({
        guesses: [],
        currentGuess: '',
        status: 'playing',
        targetWord: content.target,
        hintTitle: content.hintTitle || (isRiddle ? t.MODES.RIDDLE.title : t.GAME.HINT_TITLE),
        hintDesc: content.hintDesc || (isRiddle ? content.question : t.GAME.UNLOCK_HINT),
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
    const { getFriendsFromFirebase, generateFriendCode, saveFriendCodeToFirebase } = await import('./utils/multiplayer');
    const normalizedUser = normalizeUsername(username);

    setCloudUsername(normalizedUser);
    localStorage.setItem('leximix_cloud_user', normalizedUser);

    // Load from cloud
    const cloudData = await loadFromCloud(normalizedUser);

    if (cloudData) {
      // Load existing data
      const friends = await getFriendsFromFirebase(normalizedUser);

      // Check for Friend Code (and generate if missing)
      let currentFriendCode = cloudData.friendCode;
      if (!currentFriendCode) {
        console.log("Generating missing friend code for:", normalizedUser);
        currentFriendCode = generateFriendCode();
        // Save to global lookup
        await saveFriendCodeToFirebase(normalizedUser, currentFriendCode);
        // Save to user profile (update local cloudData object for immediate use)
        cloudData.friendCode = currentFriendCode;
        // We should ideally update the cloud profile here too, but the next auto-sync will catch it
        // Or we can force a save:
        // await saveToCloud(normalizedUser, { ...cloudData, friendCode: currentFriendCode });
      }

      setUser(prev => ({
        ...prev,
        ...cloudData,
        name: normalizedUser, // Enforce name consistency
        friends: friends || [],
        friendCode: currentFriendCode // Ensure it's set in state
      }));

      console.log('[Cloud] Loaded save from cloud');
      setView('HOME');
    } else {
      // New user - set defaults but require onboarding
      const initialLevelsUnlocked: Record<string, boolean> = {};
      Object.values(GameMode).forEach(mode => {
        initialLevelsUnlocked[`${mode}_${Tier.BEGINNER}_1`] = true;
      });

      // Generate friend code for new user
      const friendCode = generateFriendCode();
      await saveFriendCodeToFirebase(normalizedUser, friendCode);

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
        theme: user.theme || 'dark',
        friendCode: friendCode,
        friends: []
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
      language: (localStorage.getItem('leximix_language_pref') as Language) || Language.DE,
      theme: 'dark'
    });

    // Go back to AUTH
    setView('AUTH');
    console.log('[Cloud] Logged out - cleared all data');
  };

  const startGameFromTutorial = () => {
    const mode = gameConfig?.mode;

    // Mau Mau - Show intro modal first (Letter-based Mau Mau)
    if (mode === GameMode.LETTER_MAU_MAU) {
      setShowMauMauIntro(true);
      return;
    }

    // Skat Mau Mau (Classic Mau Mau) - Show multiplayer selection modal
    if (mode === GameMode.SKAT_MAU_MAU) {
      setShowMauMauModeSelect(true);
      setTutorialMode(null);
      return;
    }

    // Chess - Show multiplayer selection modal  
    if (mode === GameMode.CHESS) {
      setShowChessModeSelect(true);
      setTutorialMode(null);
      return;
    }

    // Checkers, Nine Men's Morris, Rummy - Show board game mode select
    if (mode === GameMode.CHECKERS || mode === GameMode.NINE_MENS_MORRIS || mode === GameMode.RUMMY) {
      setSelectedBoardGame(mode);
      setShowBoardGameModeSelect(true);
      setTutorialMode(null);
      return;
    }

    // Default: Go to level selection for other modes
    setView('LEVELS');
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
      activeFrame: editFrame !== 'frame_none' ? editFrame : undefined,
      activeFont: editFont !== 'font_default' ? editFont : undefined,
      activeEffect: editEffect !== 'effect_none' ? editEffect : undefined
    }));
    setShowProfile(false);
  };

  // Handle sticker album category completion reward
  const handleClaimCategoryReward = (categoryId: string) => {
    const { STICKER_CATEGORIES } = require('./constants');
    const category = STICKER_CATEGORIES.find((c: any) => c.id === categoryId);
    if (!category) return;

    setUser(prev => {
      const newUser = { ...prev };
      
      // Add reward frame if exists
      if (category.rewardFrame) {
        newUser.ownedFrames = [...(prev.ownedFrames || []), category.rewardFrame];
      }
      
      // Add reward coins
      newUser.coins = (prev.coins || 0) + category.rewardCoins;
      
      // Mark category as completed
      newUser.completedCategories = [...(prev.completedCategories || []), categoryId];
      
      return newUser;
    });
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
    setEditFrame(user.activeFrame || 'frame_none');
    setEditFont(user.activeFont || 'font_default');
    setEditEffect(user.activeEffect || 'effect_none');
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

  // Neo-Brutalist color mapping for game modes - all unique colors
  const brutalColors: Record<string, { bg: string; accent: string }> = {
    [GameMode.CLASSIC]: { bg: '#06FFA5', accent: '#000' },
    [GameMode.SPEEDRUN]: { bg: '#FF7F00', accent: '#000' },
    [GameMode.CHAIN]: { bg: '#0096FF', accent: '#000' },
    [GameMode.CATEGORY]: { bg: '#FFBE0B', accent: '#000' },
    [GameMode.SUDOKU]: { bg: '#A855F7', accent: '#000' },       // Helles Lila
    [GameMode.CHALLENGE]: { bg: '#FF006E', accent: '#000' },    // Pink
    [GameMode.RIDDLE]: { bg: '#EC4899', accent: '#000' },       // Rosa/Magenta
    [GameMode.LETTER_MAU_MAU]: { bg: '#C084FC', accent: '#000' }, // Helleres Lila
    [GameMode.CHESS]: { bg: '#4B5563', accent: '#000' },        // Grau für Schach
    [GameMode.CHECKERS]: { bg: '#DC2626', accent: '#000' },     // Rot für Dame
    [GameMode.NINE_MENS_MORRIS]: { bg: '#D97706', accent: '#000' }, // Amber für Mühle
    [GameMode.RUMMY]: { bg: '#059669', accent: '#000' },        // Smaragd für Rommé
  };

  const GameCard = ({ mode, title, desc, icon: Icon, locked = false, comingSoon = false }: any) => {
    const colors = brutalColors[mode] || { bg: '#FF006E', accent: '#000' };

    return (
      <button
        disabled={comingSoon}
        onClick={() => handleModeSelect(mode)}
        className={`relative text-left overflow-hidden transition-all duration-200 group ${comingSoon ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        style={{
          background: 'var(--color-surface)',
          border: '3px solid var(--color-border)',
          borderRadius: '16px',
          boxShadow: '6px 6px 0px var(--color-border)'
        }}
        onMouseEnter={(e) => {
          if (!comingSoon) {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '10px 10px 0px #000';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '6px 6px 0px #000';
        }}
      >
        {/* Rainbow top border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex" style={{ borderRadius: '13px 13px 0 0', overflow: 'hidden' }}>
          <div className="flex-1" style={{ background: '#FF006E' }}></div>
          <div className="flex-1" style={{ background: '#FF7F00' }}></div>
          <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
          <div className="flex-1" style={{ background: '#06FFA5' }}></div>
          <div className="flex-1" style={{ background: '#0096FF' }}></div>
          <div className="flex-1" style={{ background: '#8338EC' }}></div>
        </div>

        {/* Large animated icon - half cut off */}
        <div
          className="absolute -right-6 -bottom-6 opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
        >
          <Icon size={100} style={{ color: colors.bg }} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="p-5 pt-6 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="p-2.5 transition-all group-hover:scale-110"
              style={{
                background: colors.bg,
                border: '3px solid var(--color-border)',
                transform: 'rotate(-3deg)',
                boxShadow: '3px 3px 0px var(--color-border)'
              }}
            >
              <Icon size={24} style={{ color: '#000' }} strokeWidth={2.5} />
            </div>
            {locked && (
              <span
                className="px-2 py-1 text-[10px] font-black uppercase"
                style={{ background: '#000', color: '#FFBE0B', transform: 'skewX(-5deg)' }}
              >
                PRO
              </span>
            )}
          </div>
          <h3
            className="font-black text-lg sm:text-xl uppercase leading-tight mb-2"
            style={{ color: 'var(--color-text)', transform: 'skewX(-3deg)' }}
          >
            {title}
          </h3>
          <p
            className="text-xs sm:text-sm font-bold leading-tight mb-4"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {desc}
          </p>

          {/* Play Button */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 font-black text-xs uppercase transition-all group-hover:scale-105"
            style={{
              background: colors.bg,
              color: '#000',
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000',
              transform: 'skewX(-5deg)'
            }}
          >
            <Play size={12} fill="currentColor" style={{ transform: 'skewX(5deg)' }} />
            <span style={{ transform: 'skewX(5deg)' }}>{locked ? 'UNLOCK' : t.HOME.PLAY}</span>
          </div>
        </div>
      </button>
    );
  };

  const completeOnboarding = () => {
    const ageNum = typeof tempUser.age === 'string' ? parseInt(tempUser.age) || 0 : tempUser.age;
    const newUser: UserState = {
      ...user,
      name: tempUser.name,
      age: ageNum,
      language: tempUser.language
    };
    setUser(newUser);
    localStorage.setItem('leximix_user', JSON.stringify(newUser));
    // If we want to auto-trigger auth modal after onboarding:
    // setView('AUTH'); 
    // But for now let's go to HOME as requested in older memories (or default flow)
    // Actually, memory [8142df70] says "App now automatically opens the AuthModal on startup if the user is not logged in".
    // Since new user is not logged in (no cloudUsername), useEffect will redirect to AUTH anyway if we set view to HOME?
    // Let's check useEffect at line 504. "if (!cloudUser) setView('AUTH')".
    // So if I setView('HOME'), it might bounce back to AUTH if I don't set cloudUser.
    // But wait, Onboarding is for "Local Profile".
    // If I setView('AUTH'), they can register.
    // Let's setView('AUTH') to be safe and consistent with "Login/Register selection screen is immediately presented".
    setView('AUTH');
    audio.playWin();
  };

  const renderOnboarding = () => {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-md relative z-10">
          {onboardingStep === 0 && (
            <div className="space-y-6 text-center p-6 relative overflow-hidden" style={{ background: '#FFF', border: '4px solid #000', boxShadow: '8px 8px 0 #000' }}>
              {/* Rainbow Stripe */}
              <div className="absolute top-0 left-0 right-0 h-3 flex">
                <div className="flex-1" style={{ background: '#FF006E' }}></div>
                <div className="flex-1" style={{ background: '#FF7F00' }}></div>
                <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
                <div className="flex-1" style={{ background: '#06FFA5' }}></div>
                <div className="flex-1" style={{ background: '#0096FF' }}></div>
                <div className="flex-1" style={{ background: '#8338EC' }}></div>
              </div>

              {/* Globe Icon */}
              <div className="w-20 h-20 mx-auto flex items-center justify-center mt-4 rounded-full" style={{ background: '#000' }}>
                <IoGlobeSharp size={40} style={{ color: '#FFF' }} />
              </div>

              <h1 className="text-3xl font-black uppercase tracking-wide mt-2" style={{ color: '#000' }}>
                {t.ONBOARDING.WELCOME}
              </h1>

              <p className="font-bold text-sm" style={{ color: '#666' }}>
                {t.ONBOARDING.SELECT_LANG}
              </p>

              {/* Language Cards - Vertical List */}
              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={() => { setTempUser({ ...tempUser, language: Language.EN }); setOnboardingStep(1); audio.playClick(); }}
                  className="w-full py-4 flex items-center justify-between px-6 transition-all active:scale-95 group relative overflow-hidden"
                  style={{ background: '#0096FF', border: '3px solid #000', boxShadow: '4px 4px 0 #000' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇺🇸</span>
                    <span className="font-black text-lg uppercase text-white">English</span>
                  </div>
                  <ArrowLeft className="rotate-180 text-white group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => { setTempUser({ ...tempUser, language: Language.DE }); setOnboardingStep(1); audio.playClick(); }}
                  className="w-full py-4 flex items-center justify-between px-6 transition-all active:scale-95 group relative overflow-hidden"
                  style={{ background: '#FF006E', border: '3px solid #000', boxShadow: '4px 4px 0 #000' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇩🇪</span>
                    <span className="font-black text-lg uppercase text-white">Deutsch</span>
                  </div>
                  <ArrowLeft className="rotate-180 text-white group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => { setTempUser({ ...tempUser, language: Language.ES }); setOnboardingStep(1); audio.playClick(); }}
                  className="w-full py-4 flex items-center justify-between px-6 transition-all active:scale-95 group relative overflow-hidden"
                  style={{ background: '#FFBE0B', border: '3px solid #000', boxShadow: '4px 4px 0 #000' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇪🇸</span>
                    <span className="font-black text-lg uppercase text-white">Español</span>
                  </div>
                  <ArrowLeft className="rotate-180 text-white group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {onboardingStep === 1 && (
            <div className="space-y-8 bg-white p-8 relative" style={{ border: '6px solid #000', boxShadow: '12px 12px 0 #000', transform: 'translate(20px, -10px) skew(-3deg)' }}>
              <div className="absolute top-0 left-0 right-0 h-4" style={{ background: 'linear-gradient(90deg, #FF7F00 0%, #FFBE0B 50%, #06FFA5 100%)' }}></div>

              <div className="w-24 h-24 mx-auto flex items-center justify-center mt-4" style={{ backgroundColor: '#FF006E', border: '4px solid #000', boxShadow: '8px 8px 0 #000', transform: 'skew(-8deg)' }}>
                <IoPersonSharp size={56} style={{ color: '#FFF' }} />
              </div>

              <h2 className="text-4xl font-black uppercase tracking-wider text-center" style={{ color: '#000' }}>
                {t.ONBOARDING.NAME_TITLE}
              </h2>

              <input
                type="text"
                maxLength={30}
                value={tempUser.name}
                onChange={(e) => setTempUser({ ...tempUser, name: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })}
                placeholder={t.ONBOARDING.NAME_PLACEHOLDER}
                className="w-full text-center text-3xl font-black uppercase p-4"
                style={{ backgroundColor: '#FFF', border: '4px solid #000', color: '#000', transform: 'skew(-2deg)' }}
                autoFocus
              />
              {tempUser.name.length === 20 && (
                <p className="text-sm text-center font-black uppercase" style={{ color: '#FF006E' }}>
                  {t.ONBOARDING.ERR_NAME}
                </p>
              )}

              <button
                disabled={!tempUser.name}
                onClick={() => { setOnboardingStep(2); audio.playClick(); }}
                className="w-full text-xl font-black uppercase p-4 transition-all duration-100"
                style={{
                  backgroundColor: '#FF006E',
                  border: '4px solid #000',
                  boxShadow: '8px 8px 0 #000',
                  color: '#FFF',
                  transform: 'skew(-5deg)',
                  opacity: !tempUser.name ? 0.5 : 1,
                  cursor: !tempUser.name ? 'not-allowed' : 'pointer'
                }}
              >
                {t.ONBOARDING.CONTINUE}
              </button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="space-y-8 bg-white p-8 relative" style={{ border: '6px solid #000', boxShadow: '12px 12px 0 #000', transform: 'translate(-15px, 5px) skew(4deg)' }}>
              <div className="absolute top-0 left-0 right-0 h-4" style={{ background: 'linear-gradient(90deg, #8338EC 0%, #0096FF 50%, #06FFA5 100%)' }}></div>

              <div className="w-24 h-24 mx-auto flex items-center justify-center mt-4" style={{ backgroundColor: '#FFBE0B', border: '4px solid #000', boxShadow: '8px 8px 0 #000', transform: 'skew(8deg)' }}>
                <IoSettingsSharp size={56} style={{ color: '#000' }} />
              </div>

              <h2 className="text-4xl font-black uppercase tracking-wider text-center" style={{ color: '#000' }}>
                {t.ONBOARDING.AGE_TITLE}
              </h2>

              <input
                type="number"
                min={1}
                max={120}
                value={tempUser.age || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = parseInt(val);
                  if (val === '' || (num >= 1 && num <= 120)) {
                    setTempUser({ ...tempUser, age: val ? num : 0 });
                  }
                }}
                placeholder={t.ONBOARDING.AGE_PLACEHOLDER}
                className="w-full text-center text-5xl font-black p-4"
                style={{ backgroundColor: '#FFF', border: '4px solid #000', color: '#000', transform: 'skew(-2deg)' }}
                autoFocus
              />

              <button
                disabled={!tempUser.age || Number(tempUser.age) < 1}
                onClick={completeOnboarding}
                className="w-full text-xl font-black uppercase p-4 transition-all duration-100"
                style={{
                  backgroundColor: '#8338EC',
                  border: '4px solid #000',
                  boxShadow: '8px 8px 0 #000',
                  color: '#FFF',
                  transform: 'skew(-5deg)',
                  opacity: (!tempUser.age || Number(tempUser.age) < 1) ? 0.5 : 1,
                  cursor: (!tempUser.age || Number(tempUser.age) < 1) ? 'not-allowed' : 'pointer'
                }}
              >
                {t.ONBOARDING.START}
              </button>
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

  const handleBoardGameSingleplayer = () => {
    setShowBoardGameModeSelect(false);
    setView('LEVELS');
  };

  const handleBoardGameMultiplayer = () => {
    setShowBoardGameModeSelect(false);
    setShowMultiplayerLobby(true);
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



  const renderHome = () => (
    <div className="h-full flex flex-col relative z-10 overflow-y-auto pb-24" style={{ background: 'var(--color-bg)' }}>
      {/* Rainbow Top Bar */}
      <div className="flex h-4 w-full">
        <div className="flex-1" style={{ background: '#FF006E' }}></div>
        <div className="flex-1" style={{ background: '#FF7F00' }}></div>
        <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
        <div className="flex-1" style={{ background: '#06FFA5' }}></div>
        <div className="flex-1" style={{ background: '#8338EC' }}></div>
      </div>

      {/* Header - Simplified */}
      <div className="flex flex-wrap justify-between items-start gap-3 p-4">
        {/* Profile Button */}
        <button
          onClick={openProfile}
          className="flex items-center gap-3 p-3 transition-all duration-100"
          style={{
            background: '#FFF',
            border: '4px solid #000',
            boxShadow: '6px 6px 0px #000'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '10px 10px 0px #000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '6px 6px 0px #000';
          }}
        >
          <div className="w-14 h-14 overflow-hidden" style={{ border: '3px solid #000', background: 'var(--color-bg)' }}>
            <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.avatarId}`} alt="Avatar" className="w-full h-full" />
          </div>
          <div>
            <h2 className="font-black text-lg uppercase leading-none" style={{ color: '#000' }}>
              {cloudUsername || user.name}
            </h2>
            <div
              className="mt-2 px-3 py-1 font-black text-xs uppercase inline-block"
              style={{ background: '#FF006E', color: '#FFF', border: '2px solid #000' }}
            >
              LVL {user.level} • {user.xp % 100}/100 XP
            </div>
          </div>
        </button>

        {/* Action Buttons - Compact for mobile */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Coins Button */}
          <button
            onClick={() => setView('SHOP')}
            className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 font-black text-sm transition-all duration-100"
            style={{
              background: '#FFBE0B',
              border: '3px solid #000',
              borderRadius: '10px',
              boxShadow: '4px 4px 0px #000'
            }}
          >
            <Gem size={16} style={{ color: '#000' }} />
            <span style={{ color: '#000' }}>{user.coins}</span>
          </button>

          {/* Language Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 sm:gap-1.5 font-black text-sm transition-all duration-100"
            style={{
              background: '#8338EC',
              color: '#FFF',
              border: '3px solid #000',
              borderRadius: '10px',
              boxShadow: '4px 4px 0px #000'
            }}
          >
            <Globe size={16} />
            <span className="hidden sm:inline">{getLanguageName(user.language)}</span>
          </button>

          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-3 sm:py-2 sm:gap-1.5 font-black text-sm transition-all duration-100"
            style={{
              background: user.theme === 'dark' ? '#FFBE0B' : '#1a1a2e',
              color: user.theme === 'dark' ? '#000' : '#FFF',
              border: '3px solid #000',
              borderRadius: '10px',
              boxShadow: '4px 4px 0px #000'
            }}
            title={user.theme === 'dark' ? ((t as any).THEME?.LIGHT || 'LIGHT') : ((t as any).THEME?.DARK || 'DARK')}
          >
            {user.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{user.theme === 'dark' ? ((t as any).THEME?.LIGHT || 'LIGHT') : ((t as any).THEME?.DARK || 'DARK')}</span>
          </button>
        </div>
      </div>

      {/* Cloud Save Card */}
      <div className="mx-4 mb-6">
        <div
          className="p-4 flex flex-wrap items-center justify-between gap-3 geo-dots relative overflow-hidden"
          style={{
            background: cloudUsername ? '#06FFA5' : '#FFF',
            border: '4px solid #000',
            boxShadow: '6px 6px 0px #000'
          }}
        >
          {/* Background Icon */}
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <Database size={80} style={{ color: '#000' }} />
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <User size={28} style={{ color: cloudUsername ? '#000' : '#FF006E' }} strokeWidth={2.5} />
            <div>
              <p className="font-black text-sm uppercase" style={{ color: '#000' }}>
                {cloudUsername || 'Cloud Save'}
              </p>
              <p className="text-xs font-bold" style={{ color: 'rgba(0,0,0,0.6)' }}>
                {cloudUsername
                  ? (lastCloudSync ? `Sync: ${new Date(lastCloudSync).toLocaleTimeString('de-DE')}` : 'Cloud Sync aktiv')
                  : 'Nicht angemeldet'
                }
              </p>
            </div>
          </div>
          {cloudUsername ? (
            <button
              onClick={handleCloudLogout}
              className="px-4 py-2 font-black uppercase text-sm transition-all duration-100"
              style={{
                background: '#FF006E',
                color: '#FFF',
                border: '3px solid #000',
                boxShadow: '4px 4px 0px #000'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '6px 6px 0px #000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 font-black uppercase text-sm transition-all duration-100"
              style={{
                background: '#FF7F00',
                color: '#000',
                border: '3px solid #000',
                boxShadow: '4px 4px 0px #000'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '6px 6px 0px #000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              }}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Logo & Title - Brutal Style */}
      <div className="flex flex-col items-center justify-center mb-6 px-4">
        <div
          className="p-6 mb-4"
          style={{
            background: '#FFF',
            border: '6px solid #000',
            boxShadow: '12px 12px 0px #8338EC',
            transform: 'rotate(-2deg)'
          }}
        >
          <img
            src="/LexiMix_Logo_Dark.png"
            alt="LexiMix"
            className="h-24 md:h-32 w-auto"
          />
        </div>
        <div
          className="px-6 py-2 font-black text-sm tracking-[0.3em] uppercase"
          style={{
            background: '#FF006E',
            color: '#FFF',
            border: '4px solid #000',
            boxShadow: '6px 6px 0px #000',
            transform: 'skew(-5deg)'
          }}
        >
          <span style={{ transform: 'skew(5deg)', display: 'inline-block' }}>{t.HOME.TAGLINE}</span>
        </div>
      </div>

      {/* Season Pass Section - Brutal */}
      <div className="mb-6 px-4">
        <SeasonPass
          xp={user.xp}
          level={user.level}
          isPremium={user.isPremium}
          onBuyPremium={() => setView('SEASON')}
          lang={user.language}
        />

        {/* Season & Premium Info - Brutal Cards */}
        <div className="flex gap-3 mt-4">
          {/* Season Timer */}
          <div
            className="flex-1 p-4 flex flex-col items-center justify-center"
            style={{
              background: '#FFF',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px #000',
              transform: 'skew(-2deg)'
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#4A4A4A', transform: 'skew(2deg)' }}>Season Ende</span>
            <div className="flex items-center gap-2 font-black" style={{ color: '#000', transform: 'skew(2deg)' }}>
              <Clock size={16} />
              {Math.max(0, Math.ceil((getCurrentSeason().endDate - Date.now()) / (1000 * 60 * 60 * 24)))} Tage
            </div>
          </div>

          {/* Premium Status */}
          <div
            className="flex-1 p-4 flex flex-col items-center justify-center"
            style={{
              background: user.isPremium ? '#FFBE0B' : '#FFF',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px #000',
              transform: 'skew(2deg)'
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#4A4A4A', transform: 'skew(-2deg)' }}>Premium</span>
            {user.isPremium ? (
              <div className="flex items-center gap-2 font-black" style={{ color: '#000', transform: 'skew(-2deg)' }}>
                <Crown size={16} /> AKTIV
              </div>
            ) : (
              <div className="flex items-center gap-1 font-black text-sm" style={{ color: '#000', transform: 'skew(-2deg)' }}>
                <Lock size={14} /> Inaktiv
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Header */}
      <div className="px-4 mb-5">
        <div
          className="inline-block px-5 py-2 font-black text-lg uppercase tracking-wider"
          style={{ background: '#000', color: '#FFF' }}
        >
          Game Modes
        </div>
      </div>

      {/* Game Cards Grid - Clean 2-Column Layout */}
      <div id="gamemodes" className="grid grid-cols-2 gap-4 mb-8 px-4">
        <GameCard mode={GameMode.CLASSIC} title={t.MODES.CLASSIC.title} desc={t.MODES.CLASSIC.desc} icon={Puzzle} />
        <GameCard mode={GameMode.SPEEDRUN} title={t.MODES.SPEEDRUN.title} desc={t.MODES.SPEEDRUN.desc} icon={Zap} />
        <GameCard mode={GameMode.CHAIN} title={t.MODES.CHAIN.title} desc={t.MODES.CHAIN.desc} icon={LinkIcon} />
        <GameCard mode={GameMode.CATEGORY} title={t.MODES.CATEGORY.title} desc={t.MODES.CATEGORY.desc} icon={BookOpen} />
        <GameCard mode={GameMode.SUDOKU} title={t.MODES.SUDOKU.title} desc={t.MODES.SUDOKU.desc} icon={Grid3X3} />
        <GameCard mode={GameMode.CHALLENGE} title={t.MODES.CHALLENGE.title} desc={t.MODES.CHALLENGE.desc} icon={Brain} locked={!user.isPremium} />
        <GameCard mode={GameMode.RIDDLE} title={t.MODES.RIDDLE.title} desc={t.MODES.RIDDLE.desc} icon={HelpCircle} />
        <GameCard mode={GameMode.LETTER_MAU_MAU} title="Mau Mau" desc="Karten Spiel" icon={Sparkles} />
        <GameCard mode={GameMode.CHESS} title={t.MODES.CHESS.title} desc={t.MODES.CHESS.desc} icon={Cpu} />
        <GameCard mode={GameMode.CHECKERS} title={t.MODES.CHECKERS.title} desc={t.MODES.CHECKERS.desc} icon={Circle} />
        <GameCard mode={GameMode.NINE_MENS_MORRIS} title={t.MODES.NINE_MENS_MORRIS.title} desc={t.MODES.NINE_MENS_MORRIS.desc} icon={Target} />
        <GameCard mode={GameMode.RUMMY} title={t.MODES.RUMMY.title} desc={t.MODES.RUMMY.desc} icon={Layers} />
      </div>

      {/* Footer */}
      <div
        className="mx-4 mb-8 p-3 text-center"
        style={{
          background: '#000',
          border: '4px solid #000'
        }}
      >
        <span className="font-black text-xs uppercase tracking-widest" style={{ color: '#FFF8E7' }}>
          Made by Kevin Wagner 2025
        </span>
      </div>
    </div>
  );

  const renderLevels = () => {
    // Brutal tier colors
    const tierBrutalColors = ['#06FFA5', '#FFBE0B', '#FF7F00', '#FF006E', '#8338EC'];

    return (
      <div className="h-full overflow-y-auto w-full max-w-4xl mx-auto geo-pattern geo-shapes" style={{ background: 'var(--color-bg)' }}>
        {/* Rainbow Top Bar */}
        <div className="flex h-3 w-full sticky top-0 z-30">
          <div className="flex-1" style={{ background: '#FF006E' }}></div>
          <div className="flex-1" style={{ background: '#FF7F00' }}></div>
          <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
          <div className="flex-1" style={{ background: '#06FFA5' }}></div>
          <div className="flex-1" style={{ background: '#8338EC' }}></div>
        </div>

        {/* Brutal Header */}
        <div
          className="sticky top-3 z-20 mx-4 mt-4 p-4 flex items-center justify-between"
          style={{
            background: 'var(--color-surface)',
            border: '4px solid var(--color-border)',
            boxShadow: '6px 6px 0px var(--color-border)'
          }}
        >
          <button
            onClick={() => setView('HOME')}
            className="w-12 h-12 flex items-center justify-center transition-all active:translate-y-1"
            style={{
              background: '#FF006E',
              border: '3px solid var(--color-border)',
              boxShadow: '4px 4px 0px var(--color-border)'
            }}
          >
            <ArrowLeft size={24} style={{ color: '#000' }} />
          </button>
          <h2
            className="text-xl md:text-2xl font-black uppercase tracking-wide"
            style={{ color: 'var(--color-text)', transform: 'skew(-3deg)' }}
          >
            {t.MODES[gameConfig?.mode as keyof typeof t.MODES]?.title}
          </h2>
          <div
            className="px-4 py-2 flex items-center gap-2 font-black text-sm uppercase"
            style={{
              background: '#FFBE0B',
              border: '3px solid var(--color-border)',
              boxShadow: '4px 4px 0px var(--color-border)',
              transform: 'skew(3deg)'
            }}
          >
            <User size={16} style={{ color: '#000' }} />
            <span style={{ color: '#000', transform: 'skew(-3deg)' }}>LVL {user.level}</span>
          </div>
        </div>

        <div className="p-4 md:p-8 w-full">
          {[Tier.BEGINNER, Tier.LEARNER, Tier.SKILLED, Tier.EXPERT, Tier.MASTER].map((tier, idx) => {
            const isLockedTier = tier > 2;
            const label = t.LEVELS.TIERS[tier - 1];
            const xpReward = tier * 20;
            const tierColor = tierBrutalColors[idx];
            const skewDeg = idx % 2 === 0 ? -2 : 2;

            return (
              <div
                key={tier}
                className="mb-8 p-5 md:p-6"
                style={{
                  background: 'var(--color-surface)',
                  border: '4px solid var(--color-border)',
                  boxShadow: `8px 8px 0px ${tierColor}`,
                  transform: `skew(${skewDeg}deg)`,
                  animationDelay: `${idx * 100}ms`
                }}
              >
                <div className="flex items-center justify-between mb-5" style={{ transform: `skew(${-skewDeg}deg)` }}>
                  <div className="flex flex-col items-start gap-2">
                    <div
                      className="px-4 py-1 font-black text-base md:text-lg uppercase tracking-wide"
                      style={{
                        background: isLockedTier ? '#CCC' : tierColor,
                        color: '#000',
                        border: '3px solid var(--color-border)'
                      }}
                    >
                      {label}
                    </div>
                    {!isLockedTier && (
                      <span
                        className="text-xs font-black uppercase flex items-center gap-1 px-3 py-1"
                        style={{ background: '#FF006E', color: '#FFF', border: '2px solid var(--color-border)' }}
                      >
                        <Sparkles size={12} /> +{xpReward} XP
                      </span>
                    )}
                  </div>
                  <div
                    className="text-xs font-black uppercase tracking-wider px-3 py-2"
                    style={{
                      background: '#000',
                      color: tierColor,
                      border: '2px solid var(--color-border)'
                    }}
                  >
                    LEVEL {(tier - 1) * 50 + 1} — {tier * 50} {isLockedTier && <Lock size={12} className="inline ml-1" />}
                  </div>
                </div>

                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3" style={{ transform: `skew(${-skewDeg}deg)` }}>
                  {Array.from({ length: 50 }).map((_, i) => {
                    const lvl = (tier - 1) * 50 + i + 1;
                    const prevLevelKey = `${gameConfig?.mode}_${tier}_${lvl - 1}`;

                    let isUnlocked = false;

                    if (lvl === 1) {
                      isUnlocked = true;
                    } else if (i === 0) {
                      const prevTierLastLevelKey = `${gameConfig?.mode}_${tier - 1}_${lvl - 1}`;
                      isUnlocked = !!user.completedLevels[prevTierLastLevelKey];
                    } else {
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
                          className="aspect-square flex items-center justify-center font-black text-sm md:text-base transition-all duration-100"
                          style={{
                            background: isCompleted ? '#06FFA5' : 'var(--color-surface)',
                            color: isCompleted ? '#000' : 'var(--color-text)',
                            border: '3px solid var(--color-border)',
                            boxShadow: isCompleted ? '4px 4px 0px var(--color-border)' : '3px 3px 0px var(--color-border)'
                          }}
                          onMouseEnter={(e) => {
                            if (!isCompleted) {
                              e.currentTarget.style.transform = 'translateY(-3px)';
                              e.currentTarget.style.boxShadow = '6px 6px 0px var(--color-border)';
                              e.currentTarget.style.background = tierColor;
                              e.currentTarget.style.color = '#000';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isCompleted) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '3px 3px 0px var(--color-border)';
                              e.currentTarget.style.background = 'var(--color-surface)';
                              e.currentTarget.style.color = 'var(--color-text)';
                            }
                          }}
                        >
                          {isCompleted ? <Check size={20} strokeWidth={4} /> : lvl}
                        </button>
                      )
                    }

                    return (
                      <button
                        key={lvl}
                        disabled={true}
                        className="aspect-square flex items-center justify-center"
                        style={{
                          background: 'var(--color-bg)',
                          color: 'var(--color-text-muted)',
                          border: '3px solid var(--color-border)',
                          opacity: 0.5
                        }}
                      >
                        <Lock size={12} />
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
  };

  const renderTutorial = () => {
    const content = TUTORIALS[tutorialMode!]?.[user.language];
    if (!content) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
        {/* Rainbow Top Bar */}
        <div className="fixed top-0 left-0 right-0 flex h-3 w-full z-50">
          <div className="flex-1" style={{ background: '#FF006E' }}></div>
          <div className="flex-1" style={{ background: '#FF7F00' }}></div>
          <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
          <div className="flex-1" style={{ background: '#06FFA5' }}></div>
          <div className="flex-1" style={{ background: '#8338EC' }}></div>
        </div>

        <div
          className="w-full max-w-md p-8 relative"
          style={{
            background: 'var(--color-surface)',
            border: '6px solid var(--color-border)',
            boxShadow: '12px 12px 0px #8338EC',
            transform: 'rotate(-1deg)'
          }}
        >
          <div className="flex flex-col items-center mb-8" style={{ transform: 'rotate(1deg)' }}>
            <div
              className="p-4 mb-4"
              style={{
                background: '#06FFA5',
                border: '4px solid var(--color-border)',
                boxShadow: '6px 6px 0px var(--color-border)',
                transform: 'skew(-5deg)'
              }}
            >
              <Puzzle size={48} style={{ color: '#000' }} />
            </div>
            <h2
              className="text-2xl font-black uppercase tracking-wide"
              style={{ color: 'var(--color-text)', transform: 'skew(-3deg)' }}
            >
              {content.title}
            </h2>
            <span
              className="text-xs font-black uppercase tracking-widest mt-2 px-4 py-1"
              style={{ background: '#FF006E', color: '#FFF', border: '2px solid var(--color-border)' }}
            >
              {t.TUTORIAL.HEADER}
            </span>
          </div>

          <p
            className="text-center mb-8 leading-relaxed font-bold"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {content.text}
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => setView('LEVELS')}
              className="flex-1 py-4 font-black text-sm uppercase flex items-center justify-center gap-2 transition-all duration-100"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '4px solid var(--color-border)',
                boxShadow: '4px 4px 0px var(--color-border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '6px 6px 0px var(--color-border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '4px 4px 0px var(--color-border)';
              }}
            >
              <ArrowLeft size={16} /> {t.TUTORIAL.BACK}
            </button>
            <button
              onClick={startGameFromTutorial}
              className="flex-[2] py-4 font-black text-sm uppercase flex items-center justify-center gap-2 transition-all duration-100"
              style={{
                background: '#FF006E',
                color: '#FFF',
                border: '4px solid var(--color-border)',
                boxShadow: '6px 6px 0px var(--color-border)',
                transform: 'skew(-3deg)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'skew(-3deg) translateY(-4px)';
                e.currentTarget.style.boxShadow = '10px 10px 0px var(--color-border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'skew(-3deg)';
                e.currentTarget.style.boxShadow = '6px 6px 0px var(--color-border)';
              }}
            >
              <span style={{ transform: 'skew(3deg)' }}>{t.TUTORIAL.START}</span> <Play size={16} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderGame = () => {
    // Letter Mau Mau - Now uses Skat Cards
    if (gameConfig?.mode === GameMode.LETTER_MAU_MAU) {
      return (
        <SkatMauMauGame
          onBack={() => setView('HOME')}
          friendCode={user.friendCode}
          onGameEnd={(coins, xp) => {
            setUser(prev => ({
              ...prev,
              coins: prev.coins + coins,
              xp: prev.xp + xp,
              level: Math.floor((prev.xp + xp) / 100) + 1
            }));
            audio.playWin();
            setView('HOME');
          }}
        />
      );
    }

    // Chain Reaction Mode
    if (gameConfig?.mode === GameMode.CHAIN) {
      return (
        <ChainGame
          language={user.language}
          user={user}
          onUpdateUser={setUser}
          onBack={() => setView('LEVELS')}
          onGameEnd={(coins, xp) => {
            setUser(prev => {
              let newCompleted = prev.completedLevels;
              // Mark level as completed if user gained XP (played successfully)
              if (xp > 0 && gameConfig) {
                const levelKey = `${GameMode.CHAIN}_${gameConfig.tier}_${gameConfig.levelId}`;
                newCompleted = { ...prev.completedLevels, [levelKey]: true };
              }

              return {
                ...prev,
                coins: prev.coins + coins,
                xp: prev.xp + xp,
                level: Math.floor((prev.xp + xp) / 100) + 1,
                completedLevels: newCompleted
              };
            });
            if (coins > 0) audio.playWin();
            setView('LEVELS');
          }}
        />
      );
    }

    // Chess Mode
    if (gameConfig?.mode === GameMode.CHESS) {
      return (
        <ChessGame
          language={user.language}
          user={user}
          onBack={() => setView('HOME')}
          onGameEnd={(xp, coins) => {
            if (xp > 0) {
              setUser(prev => ({
                ...prev,
                coins: prev.coins + coins,
                xp: prev.xp + xp,
                level: Math.floor((prev.xp + xp) / 100) + 1
              }));
              audio.playWin();
            }
            setView('HOME');
          }}
          multiplayerGameId={multiplayerGameId}
          opponentName={multiplayerOpponent}
          isHost={isMultiplayerHost}
          levelId={gameConfig?.levelId || 1}
        />
      );
    }

    if (!gameState) return null;
    const isSudoku = gameConfig?.mode === GameMode.SUDOKU;
    const isSpeedrun = gameConfig?.mode === GameMode.SPEEDRUN;
    const isChallenge = gameConfig?.mode === GameMode.CHALLENGE;
    const isRiddle = gameConfig?.mode === GameMode.RIDDLE;
    const showTimer = gameState.timeLeft !== undefined;

    const validationStatus = (isSudoku && gameState.data?.sudokuGrid)
      ? validateSudoku(gameState.currentGrid, gameState.data.sudokuGrid)
      : undefined;

    // Get mode color
    const modeColor = brutalColors[gameConfig?.mode || GameMode.CLASSIC]?.bg || '#06FFA5';

    return (
      <div className="flex flex-col h-full max-h-screen relative geo-pattern geo-shapes geo-confetti" style={{ background: 'var(--color-bg)' }}>
        {/* Rainbow Top Bar */}
        <div className="flex h-3 w-full">
          <div className="flex-1" style={{ background: '#FF006E' }}></div>
          <div className="flex-1" style={{ background: '#FF7F00' }}></div>
          <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
          <div className="flex-1" style={{ background: '#06FFA5' }}></div>
          <div className="flex-1" style={{ background: '#8338EC' }}></div>
        </div>

        {/* Header - Neo Brutal */}
        <div
          className="mx-4 mt-4 p-4 flex items-center justify-between relative z-50"
          style={{
            background: '#FFF',
            border: '4px solid #000',
            boxShadow: '6px 6px 0px #000'
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => { audio.playClick(); setView('LEVELS'); }}
            className="w-12 h-12 flex items-center justify-center transition-all active:translate-y-1"
            style={{
              background: modeColor,
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000'
            }}
          >
            <ArrowLeft size={24} style={{ color: '#000' }} />
          </button>

          {/* Title */}
          <div className="flex-1 mx-4 text-center">
            <h1
              className="font-black text-lg md:text-xl uppercase tracking-wide"
              style={{ color: '#000', transform: 'skewX(-3deg)' }}
            >
              {gameState.hintTitle || (isSudoku ? t.GAME.SUDOKU_TITLE : (isRiddle ? t.MODES.RIDDLE.title : t.GAME.CLASSIC_TITLE))}
            </h1>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            {showTimer && (
              <div
                className="px-4 py-2 font-mono font-black text-lg flex items-center gap-2"
                style={{
                  background: gameState.timeLeft < 10 ? '#FF006E' : modeColor,
                  color: '#000',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0px #000'
                }}
              >
                <Clock size={16} /> {gameState.timeLeft}s
              </div>
            )}
          </div>
        </div>

        {/* Hint Card - Neo Brutal with Black Text */}
        <div
          className="mx-4 mt-4 p-4 relative overflow-hidden"
          style={{
            background: modeColor,
            border: '4px solid #000',
            boxShadow: '6px 6px 0px #000'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-3 right-3 opacity-20">
            <Star size={14} fill="currentColor" style={{ color: '#000' }} />
          </div>
          <div className="absolute bottom-3 right-12 opacity-15">
            <Sparkles size={18} style={{ color: '#000' }} />
          </div>
          <div className="absolute top-1/2 right-4 opacity-10">
            <HelpCircle size={50} style={{ color: '#000' }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5" style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '6px' }}>
                <HelpCircle size={16} style={{ color: '#000' }} />
              </div>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: 'rgba(0,0,0,0.6)' }}>HINWEIS</p>
            </div>
            <p className="font-black text-base md:text-lg leading-snug" style={{ color: '#000' }}>
              "{gameState.hintDesc || (isSudoku ? t.GAME.SUDOKU_DESC : "...")}"
            </p>
            {!isSudoku && (
              <div
                className="inline-block mt-3 px-3 py-1 text-sm font-black"
                style={{ background: 'rgba(0,0,0,0.15)', color: '#000', border: '2px solid #000' }}
              >
                {gameState.targetWord.length} Buchstaben
              </div>
            )}
          </div>
        </div>

        {/* Game Board - Neo Brutal Style */}
        <div className="flex-1 w-full flex flex-col justify-center py-6 overflow-hidden">
          <div className="w-full max-w-xl mx-auto px-4">
            {isSudoku ? (
              <div className="flex flex-col items-center gap-4">
                <SudokuGrid
                  board={gameState.currentGrid}
                  original={gameState.data.sudokuPuzzle}
                  selectedCell={gameState.selectedCell}
                  validation={validationStatus}
                  onCellSelect={(r: number, c: number) => {
                    setGameState((prev: any) => ({ ...prev, selectedCell: { r, c } }));
                    if (hiddenInputRef.current) hiddenInputRef.current.focus();
                  }}
                />
                <SudokuControls
                  onInput={(char) => handleSudokuInput(char)}
                  onDelete={() => {
                    const currentGameState = gameStateRef.current;
                    if (currentGameState?.selectedCell) {
                      const { r, c } = currentGameState.selectedCell;
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

        {/* Hint Button - Redesigned */}
        <div className="absolute bottom-6 right-6 z-30">
          <button
            onClick={triggerHint}
            className="relative w-16 h-16 flex items-center justify-center transition-all active:scale-95 group"
            style={{
              background: '#FFBE0B',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px #000'
            }}
          >
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity animate-bounce">
              <Sparkles size={24} style={{ color: '#FF006E' }} />
            </div>
            <HelpCircle size={32} style={{ color: '#000' }} strokeWidth={2.5} />
            {hintCostMultiplier > 0 && (
              <div
                className="absolute -top-3 -right-3 px-2 py-1 text-xs font-black shadow-sm"
                style={{
                  background: '#FF006E',
                  color: '#FFF',
                  border: '2px solid #000',
                  transform: 'rotate(12deg)'
                }}
              >
                -{hintCostMultiplier * 10}
              </div>
            )}
          </button>
        </div>

        {/* Hidden Input for Keyboard */}
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
    <div className={`${user.theme} h-screen w-full text-[var(--color-text)] font-sans overflow-hidden relative selection:bg-brutal-pink selection:text-white transition-colors duration-300 geo-pattern geo-shapes`}>
      {/* Global Grain Overlay */}
      <div className="grain-overlay"></div>

      {/* Fade Transition Removed */}

      {/* Version Manager - Handles Updates & Changelog */}
      <VersionManager isOnline={isOnline} t={t} />

      {/* Offline Blocking Overlay - Neo Brutal */}
      {!isOnline && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4" style={{ background: 'var(--color-bg)' }}>
          {/* Rainbow Top Bar */}
          <div className="fixed top-0 left-0 right-0 flex h-3 w-full">
            <div className="flex-1" style={{ background: '#FF006E' }}></div>
            <div className="flex-1" style={{ background: '#FF7F00' }}></div>
            <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
            <div className="flex-1" style={{ background: '#06FFA5' }}></div>
            <div className="flex-1" style={{ background: '#8338EC' }}></div>
          </div>

          <div
            className="max-w-md w-full p-8 text-center space-y-6"
            style={{
              background: '#FFF',
              border: '6px solid #000',
              boxShadow: '12px 12px 0px #FF006E',
              transform: 'rotate(-1deg)'
            }}
          >
            <div
              className="w-20 h-20 mx-auto flex items-center justify-center"
              style={{
                background: '#FF006E',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000',
                transform: 'skew(-5deg)'
              }}
            >
              <WifiOff size={40} style={{ color: '#FFF' }} />
            </div>
            <div style={{ transform: 'rotate(1deg)' }}>
              <h2
                className="text-2xl font-black uppercase mb-3"
                style={{ color: '#000', transform: 'skew(-3deg)' }}
              >
                Keine Verbindung
              </h2>
              <p className="text-sm font-bold leading-relaxed" style={{ color: '#4A4A4A' }}>
                LexiMix benötigt eine aktive Internetverbindung, um deine Fortschritte mit Firebase zu synchronisieren.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div
                className="flex items-center gap-3 justify-center py-2 px-4 font-bold text-xs uppercase"
                style={{ background: '#000', color: '#FF006E' }}
              >
                <div className="w-3 h-3" style={{ background: '#FF006E' }}></div>
                <span>Offline-Modus nicht verfügbar</span>
              </div>
              <div
                className="flex items-center gap-3 justify-center py-2 px-4 font-bold text-xs uppercase"
                style={{ background: '#FFBE0B', color: '#000', border: '2px solid #000' }}
              >
                <Database size={14} />
                <span>Firebase-Synchronisation erforderlich</span>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 font-black uppercase text-lg transition-all duration-100"
              style={{
                background: '#FF7F00',
                color: '#000',
                border: '4px solid #000',
                boxShadow: '6px 6px 0px #000',
                transform: 'skew(-3deg)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'skew(-3deg) translateY(-4px)';
                e.currentTarget.style.boxShadow = '10px 10px 0px #000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'skew(-3deg)';
                e.currentTarget.style.boxShadow = '6px 6px 0px #000';
              }}
            >
              <span style={{ transform: 'skew(3deg)', display: 'inline-block' }}>Neu laden</span>
            </button>
          </div>
        </div>
      )}

      {view === 'ONBOARDING' && renderOnboarding()}

      {view === 'HOME' && renderHome()}
      {view === 'SEASON' && (
        <SeasonPassView
          user={user}
          rewards={dynamicRewards}
          onClose={() => handleNavigate('HOME')}
          onClaim={handleClaimReward}
          onShowPremium={() => setShowPremiumInfo(true)}
        />
      )}
      {view === 'LEVELS' && renderLevels()}
      {view === 'GAME' && renderGame()}
      {view === 'TUTORIAL' && renderTutorial()}
      {view === 'MAU_MAU' && (
        <SkatMauMauGame
          onBack={() => {
            setView('HOME');
            setMultiplayerGameId(null);
            setMultiplayerOpponent(null);
          }}
          friendCode={user.friendCode}
          gameId={multiplayerGameId}
          opponentUsername={multiplayerOpponent}
          currentUsername={cloudUsername || user.name}
          onGameEnd={(coins, xp) => {
            setUser(prev => ({
              ...prev,
              coins: prev.coins + coins,
              xp: prev.xp + xp,
              level: Math.floor((prev.xp + xp) / 100) + 1
            }));
            setMultiplayerGameId(null);
            setMultiplayerOpponent(null);
            setView('HOME');
            audio.playWin();
          }}
        />
      )}
      {view === 'SKAT_MAU_MAU' && (
        <SkatMauMauGame
          onBack={() => setView('HOME')}
          friendCode={user.friendCode}
          onGameEnd={(coins, xp) => {
            setUser(prev => ({
              ...prev,
              coins: prev.coins + coins,
              xp: prev.xp + xp,
              level: Math.floor((prev.xp + xp) / 100) + 1
            }));
            setView('HOME');
            audio.playWin();
          }}
        />
      )}
      {view === 'CHECKERS' && (
        <CheckersGame
          language={user.language}
          user={user}
          onBack={() => setView('HOME')}
          onGameEnd={(xp, coins) => {
            setUser(prev => ({
              ...prev,
              coins: prev.coins + coins,
              xp: prev.xp + xp,
              level: Math.floor((prev.xp + xp) / 100) + 1
            }));
            setView('HOME');
            audio.playWin();
          }}
          levelId={gameConfig?.levelId || 1}
        />
      )}
      {view === 'NINE_MENS_MORRIS' && (
        <NineMensMorrisGame
          language={user.language}
          user={user}
          onBack={() => setView('HOME')}
          onGameEnd={(xp, coins) => {
            setUser(prev => ({
              ...prev,
              coins: prev.coins + coins,
              xp: prev.xp + xp,
              level: Math.floor((prev.xp + xp) / 100) + 1
            }));
            setView('HOME');
            audio.playWin();
          }}
          levelId={gameConfig?.levelId || 1}
        />
      )}
      {view === 'RUMMY' && (
        <RummyGame
          language={user.language}
          user={user}
          onBack={() => setView('HOME')}
          onGameEnd={(xp, coins) => {
            setUser(prev => ({
              ...prev,
              coins: prev.coins + coins,
              xp: prev.xp + xp,
              level: Math.floor((prev.xp + xp) / 100) + 1
            }));
            setView('HOME');
            audio.playWin();
          }}
          levelId={gameConfig?.levelId || 1}
          onThemeToggle={toggleTheme}
        />
      )}
      {/* Navigation Icons */}

      {/* Challenge Mode Intro Modal */}
      <Modal isOpen={showChallengeIntro} onClose={() => { setShowChallengeIntro(false); setView('HOME'); }} title={t.MODES.CHALLENGE.title}>
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

      {/* Mau Mau Intro Modal */}
      <Modal isOpen={showMauMauIntro} onClose={() => { setShowMauMauIntro(false); setView('HOME'); }} title="Mau Mau">
        <div className="p-6 text-center space-y-6">
          <div
            className="w-24 h-24 mx-auto flex items-center justify-center relative"
            style={{
              background: '#C084FC',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px #000',
              transform: 'rotate(-3deg)'
            }}
          >
            <div className="absolute -top-3 -right-3 animate-spin-slow">
              <Sparkles size={24} style={{ color: '#FFBE0B' }} />
            </div>
            <span className="text-5xl">🎴</span>
          </div>

          <div style={{ transform: 'skewX(-2deg)' }}>
            <h3 className="text-xl font-black mb-2 uppercase italic" style={{ color: '#000' }}>Das klassische Kartenspiel!</h3>
            <p className="font-bold text-sm leading-relaxed" style={{ color: '#4A4A4A' }}>
              Spiele deine Karten geschickt aus und werde alle los, bevor es dein Gegner schafft!
            </p>
          </div>

          <div
            className="p-4 text-left space-y-3 relative overflow-hidden"
            style={{
              background: '#FFF',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px #8338EC'
            }}
          >
            {/* Rainbow Left Border */}
            <div className="absolute top-0 bottom-0 left-0 w-2 flex flex-col border-r-2 border-black">
              <div className="flex-1 bg-[#FF006E]"></div>
              <div className="flex-1 bg-[#FF7F00]"></div>
              <div className="flex-1 bg-[#FFBE0B]"></div>
              <div className="flex-1 bg-[#06FFA5]"></div>
              <div className="flex-1 bg-[#0096FF]"></div>
              <div className="flex-1 bg-[#8338EC]"></div>
            </div>

            <div className="flex items-start gap-3 pl-2">
              <span className="font-black text-lg" style={{ color: '#8338EC' }}>♠️</span>
              <span className="text-xs font-bold" style={{ color: '#000' }}>Spiele Karten mit gleicher Farbe oder gleichem Wert</span>
            </div>
            <div className="flex items-start gap-3 pl-2">
              <span className="font-black text-lg" style={{ color: '#FF006E' }}>7️⃣</span>
              <span className="text-xs font-bold" style={{ color: '#000' }}>Sieben: Gegner muss 2 Karten ziehen</span>
            </div>
            <div className="flex items-start gap-3 pl-2">
              <span className="font-black text-lg" style={{ color: '#06FFA5' }}>8️⃣</span>
              <span className="text-xs font-bold" style={{ color: '#000' }}>Acht: Aussetzen - du spielst nochmal</span>
            </div>
            <div className="flex items-start gap-3 pl-2">
              <span className="font-black text-lg" style={{ color: '#FFBE0B' }}>🃏</span>
              <span className="text-xs font-bold" style={{ color: '#000' }}>Bube: Wünsche dir eine Farbe</span>
            </div>
          </div>

          <button
            onClick={() => {
              setShowMauMauIntro(false);
              setShowMauMauModeSelect(true);
            }}
            className="w-full py-4 font-black uppercase tracking-widest transition-all active:translate-y-1 flex items-center justify-center gap-2"
            style={{
              background: '#C084FC',
              color: '#000',
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000'
            }}
          >
            <Play size={20} fill="currentColor" /> Weiter
          </button>
        </div>
      </Modal>

      {/* Board Game Mode Select Modal (Checkers, Rummy, Nine Men's Morris) */}
      <Modal isOpen={showBoardGameModeSelect} onClose={() => { setShowBoardGameModeSelect(false); setView('HOME'); }} title="Spielmodus wählen">
        <div className="p-6 space-y-4">
          <p className="text-center text-sm font-bold mb-6" style={{ color: '#4A4A4A' }}>
            Wähle deinen bevorzugten Spielmodus:
          </p>

          {/* Singleplayer Button */}
          <button
            onClick={handleBoardGameSingleplayer}
            className="w-full p-5 transition-all active:scale-95 group relative overflow-hidden"
            style={{
              background: '#FFF',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px #8338EC',
              transform: 'skewX(-2deg)'
            }}
          >
            <div className="flex items-center gap-4" style={{ transform: 'skewX(2deg)' }}>
              <div
                className="w-14 h-14 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: '#8338EC', border: '3px solid #000' }}
              >
                <User size={28} style={{ color: '#FFF' }} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-xl font-black uppercase mb-1" style={{ color: '#000' }}>Einzelspieler</h4>
                <p className="text-xs font-bold" style={{ color: '#666' }}>gegen KI spielen</p>
              </div>
              <ArrowLeft size={24} className="rotate-180" style={{ color: '#000' }} />
            </div>
          </button>

          {/* Multiplayer Button */}
          <button
            onClick={handleBoardGameMultiplayer}
            className="w-full p-5 transition-all active:scale-95 group relative overflow-hidden"
            style={{
              background: '#FFF',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px #06FFA5',
              transform: 'skewX(-2deg)'
            }}
          >
            <div className="flex items-center gap-4" style={{ transform: 'skewX(2deg)' }}>
              <div
                className="w-14 h-14 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: '#06FFA5', border: '3px solid #000' }}
              >
                <Users size={28} style={{ color: '#000' }} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-xl font-black uppercase mb-1" style={{ color: '#000' }}>Mehrspieler</h4>
                <p className="text-xs font-bold" style={{ color: '#666' }}>Gegen Freunde spielen</p>
              </div>
              <ArrowLeft size={24} className="rotate-180" style={{ color: '#000' }} />
            </div>
          </button>
        </div>
      </Modal>

      {/* Chess Mode Select Modal */}
      <Modal isOpen={showChessModeSelect} onClose={() => { setShowChessModeSelect(false); setView('HOME'); }} title={t.CHESS.TITLE}>
        <div className="space-y-4">
          <div className="p-4 bg-white border-4 border-black shadow-[6px_6px_0px_#000]">
            <p className="font-bold text-center mb-6">Select Mode</p>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => {
                  setShowChessModeSelect(false);
                  setGameConfig({ mode: GameMode.CHESS, tier: Tier.BEGINNER, levelId: 1 });
                  setView('GAME');
                }}
                className="p-4 bg-[#06FFA5] border-4 border-black font-black text-xl uppercase hover:translate-y-1 active:translate-y-2 transition-all shadow-[4px_4px_0px_#000] flex items-center justify-center gap-3"
              >
                <Cpu size={24} /> Singleplayer
              </button>

              <button
                onClick={() => {
                  setShowChessModeSelect(false);
                  // Set game config for multiplayer context if needed
                  setGameConfig({ mode: GameMode.CHESS, tier: Tier.BEGINNER, levelId: 1 });
                  setShowMultiplayerLobby(true);
                }}
                className="p-4 bg-[#8338EC] text-white border-4 border-black font-black text-xl uppercase hover:translate-y-1 active:translate-y-2 transition-all shadow-[4px_4px_0px_#000] flex items-center justify-center gap-3"
              >
                <Users size={24} /> Multiplayer
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Mau Mau Mode Selection Modal */}
      <Modal isOpen={showMauMauModeSelect} onClose={() => { setShowMauMauModeSelect(false); setView('HOME'); }} title="Spielmodus wählen">
        <div className="p-6 space-y-4">
          <p className="text-center text-sm font-bold mb-6" style={{ color: '#4A4A4A' }}>
            Wähle deinen bevorzugten Spielmodus:
          </p>

          {/* Singleplayer Button */}
          <button
            onClick={() => {
              setShowMauMauModeSelect(false);
              setView('MAU_MAU');
            }}
            className="w-full p-5 transition-all active:scale-95 group relative overflow-hidden"
            style={{
              background: '#FFF',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px #8338EC',
              transform: 'skewX(-2deg)'
            }}
          >
            <div className="flex items-center gap-4" style={{ transform: 'skewX(2deg)' }}>
              <div
                className="w-14 h-14 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: '#8338EC', border: '3px solid #000' }}
              >
                <User size={28} style={{ color: '#FFF' }} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-xl font-black uppercase mb-1" style={{ color: '#000' }}>Singleplayer</h4>
                <p className="text-xs font-bold" style={{ color: '#666' }}>Spiele gegen die KI</p>
              </div>
              <ArrowLeft size={24} className="rotate-180" style={{ color: '#000' }} />
            </div>
          </button>

          {/* Multiplayer Button */}
          <button
            onClick={() => {
              setShowMauMauModeSelect(false);
              setShowMultiplayerLobby(true);
            }}
            className="w-full p-5 transition-all active:scale-95 group relative overflow-hidden"
            style={{
              background: '#FFF',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px #06FFA5',
              transform: 'skewX(-2deg)'
            }}
          >
            <div className="flex items-center gap-4" style={{ transform: 'skewX(2deg)' }}>
              <div
                className="w-14 h-14 flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: '#06FFA5', border: '3px solid #000' }}
              >
                <Users size={28} style={{ color: '#000' }} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-xl font-black uppercase mb-1" style={{ color: '#000' }}>Multiplayer</h4>
                <p className="text-xs font-bold" style={{ color: '#666' }}>Spiele gegen Freunde</p>
              </div>
              <ArrowLeft size={24} className="rotate-180" style={{ color: '#000' }} />
            </div>
          </button>

          <button
            onClick={() => setShowMauMauModeSelect(false)}
            className="w-full py-3 font-black uppercase text-sm transition-all active:translate-y-1 mt-4"
            style={{
              background: '#F5F5F5',
              color: '#000',
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000'
            }}
          >
            Zurück
          </button>
        </div>
      </Modal>

      {/* Multiplayer Lobby */}
      <MultiplayerLobby
        isOpen={showMultiplayerLobby}
        onClose={() => setShowMultiplayerLobby(false)}
        currentUsername={cloudUsername || user.name}
        friends={user.friends || []}
        mode={gameConfig?.mode || GameMode.SKAT_MAU_MAU}
        onStartGame={(opponentUsername, gameId) => {
          setMultiplayerOpponent(opponentUsername);
          setMultiplayerGameId(gameId);
          setIsMultiplayerHost(true);
          setShowMultiplayerLobby(false);
          // Redirect based on mode
          if (gameConfig?.mode === GameMode.CHESS) {
            setView('GAME'); // Or whatever view Chess uses. Actually it uses 'GAME' but renders ChessGame if mode is CHESS
            // Wait, renderGame handles CHESS.
            // renderGame is called when view === 'GAME'? No, let's check render logic.
            // In renderContent: if (view === 'GAME') return renderGame();
            // And renderGame checks gameConfig.mode.
            // So setting view to 'GAME' should work if gameConfig is set.
            // But wait, renderGame has specific checks.
            // Mau Mau uses 'MAU_MAU' view usually? 
            // Let's check renderGame again.
            // if (gameConfig?.mode === GameMode.LETTER_MAU_MAU) return <SkatMauMauGame ... />
            // if (gameConfig?.mode === GameMode.CHESS) return <ChessGame ... />
            // So yes, if I set gameConfig correctly, I just need to set view to 'GAME'? 
            // Or does Mau Mau use a separate view?
            // Line 1176: setView('SKAT_MAU_MAU');
            // Let's check renderContent for SKAT_MAU_MAU.
          } else {
            setView('SKAT_MAU_MAU'); // Assuming this is what Mau Mau uses
          }
        }}
        onInviteSent={(to, gameId) => {
          setPendingSentInvite({ to, gameId });
        }}
      />

      {/* Friends Manager */}
      <FriendsManager
        isOpen={showFriendsManager}
        onClose={() => setShowFriendsManager(false)}
        currentUsername={cloudUsername || user.name}
        friendCode={user.friendCode || ''}
        friends={user.friends || []}
        onFriendsUpdate={(newFriends) => {
          setUser(prev => ({ ...prev, friends: newFriends }));
        }}
      />

      {/* Global Game Invite Popup */}
      {globalGameInvite && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-yellow-500/50 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="text-center space-y-4">
              {/* Animated Icon */}
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-yellow-500/30">
                <Users size={40} className="text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-black text-white">Spieleinladung!</h3>

              {/* From */}
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Einladung von</p>
                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  {globalGameInvite.from}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  möchte {globalGameInvite.mode === GameMode.CHESS ? 'Schach' : 'Mau Mau'} spielen
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDeclineGlobalInvite}
                  className="flex-1 py-3 px-4 bg-red-600/20 border-2 border-red-500/50 hover:bg-red-600/40 rounded-xl text-red-400 font-bold transition-all active:scale-95"
                >
                  <X size={20} className="inline mr-2" />
                  Ablehnen
                </button>
                <button
                  onClick={handleAcceptGlobalInvite}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:brightness-110 rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg shadow-green-500/30"
                >
                  <Check size={20} className="inline mr-2" />
                  Annehmen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Screen (First screen) */}
      {view === 'AUTH' && (
        <div className="h-full flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center space-y-4">
              <img
                src={user.theme === 'dark' ? "/LexiMix_Logo_Bright.png" : "/LexiMix_Logo_Dark.png"}
                alt="LexiMix Logo"
                className="w-32 h-32 mx-auto"
              />
              <p className="text-gray-400 text-sm">
                Melde dich an um zu spielen
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl">
              <AuthModal
                isOpen={true}
                onClose={() => { }}
                onSuccess={(username) => {
                  handleCloudLogin(username);
                }}
                lang={user.language}
                onLanguageChange={(lang) => {
                  setUser(prev => ({ ...prev, language: lang }));
                }}
                embedded={true}
                initialMode={'language_select'}
              />
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
        <div className="flex flex-col items-center justify-center py-4 space-y-6">
          <div className="w-full h-40 bg-black flex items-center justify-center relative overflow-hidden group border-4 border-black shadow-[6px_6px_0px_#000]">
            <img
              src={catDanceGif}
              alt="Ad Simulation"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl font-black font-mono text-white drop-shadow-[4px_4px_0px_#000]">
                {adTimer > 0 ? `${adTimer}s` : 'DONE'}
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-[#FF006E] px-2 py-1 text-[10px] font-black text-white border-2 border-black">
              AD
            </div>
          </div>

          {hintCostMultiplier > 0 && (
            <div className="inline-block px-3 py-1 font-black text-xs uppercase bg-[#FF006E] text-white border-2 border-black transform -rotate-2">
              +{hintCostMultiplier * 10}s Wartezeit
            </div>
          )}

          {/* Skip Button */}
          {adTimer > 0 && (
            <button
              onClick={() => {
                const skipCost = 30 + (hintCostMultiplier * 10);
                if (user.coins >= skipCost) {
                  setUser(prev => ({ ...prev, coins: prev.coins - skipCost }));
                  setAdTimer(0);
                } else {
                  alert('Nicht genügend Coins!');
                }
              }}
              className="w-full py-4 font-black uppercase text-sm flex items-center justify-center gap-2 transition-all active:translate-y-1"
              style={{
                background: '#FFBE0B',
                color: '#000',
                border: '3px solid #000',
                boxShadow: '4px 4px 0px #000',
                opacity: user.coins >= (30 + (hintCostMultiplier * 10)) ? 1 : 0.5
              }}
            >
              <Gem size={16} /> Skip ({30 + (hintCostMultiplier * 10)})
            </button>
          )}

          <button
            disabled={adTimer > 0}
            onClick={closeAdAndReward}
            className="w-full py-4 font-black uppercase text-sm transition-all active:translate-y-1"
            style={{
              background: adTimer > 0 ? '#E5E5E5' : '#06FFA5',
              color: adTimer > 0 ? '#999' : '#000',
              border: '3px solid #000',
              boxShadow: adTimer > 0 ? 'none' : '4px 4px 0px #000',
              cursor: adTimer > 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {adTimer > 0 ? 'Bitte warten...' : 'Hinweis ansehen'}
          </button>
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

      {/* Win Modal - Neo Brutal */}
      <Modal isOpen={showWin} onClose={() => setShowWin(false)} title={t.GAME.WIN_TITLE}>
        <div className="text-center space-y-6">
          <div
            className="inline-block p-6 mb-4"
            style={{ background: '#FFBE0B', border: '4px solid #000', boxShadow: '8px 8px 0px #000', transform: 'rotate(-3deg)' }}
          >
            <Trophy size={64} style={{ color: '#000' }} />
          </div>
          <div className="text-2xl font-black uppercase tracking-wide" style={{ color: '#000' }}>{t.GAME.WIN_DESC}</div>

          {/* Stats */}
          <div className="flex justify-center gap-4">
            <div
              className="p-4 min-w-[100px] flex flex-col items-center"
              style={{ background: '#FF006E', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
            >
              <Sparkles size={24} style={{ color: '#FFF' }} className="mb-1" />
              <span className="text-2xl font-black" style={{ color: '#FFF' }}>{winStats.xp}</span>
              <span className="text-xs font-black uppercase" style={{ color: 'rgba(255,255,255,0.8)' }}>{t.GAME.XP_GAINED}</span>
            </div>
            <div
              className="p-4 min-w-[100px] flex flex-col items-center"
              style={{ background: '#0096FF', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
            >
              <Gem size={24} style={{ color: '#FFF' }} className="mb-1" />
              <span className="text-2xl font-black" style={{ color: '#FFF' }}>{winStats.coins}</span>
              <span className="text-xs font-black uppercase" style={{ color: 'rgba(255,255,255,0.8)' }}>{t.GAME.COINS_GAINED}</span>
            </div>
          </div>

          {/* Level Progress */}
          <div className="px-4">
            <div className="flex justify-between text-xs font-black mb-2" style={{ color: '#4A4A4A' }}>
              <span>LVL {user.level}</span>
              <span>{(user.xp % 100)} / 100 XP</span>
            </div>
            <div className="h-4" style={{ background: '#000', border: '3px solid #000' }}>
              <div className="h-full transition-all duration-1000" style={{ width: `${user.xp % 100}%`, background: '#06FFA5' }}></div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              className="flex-1 py-4 font-black uppercase text-sm transition-all"
              style={{ background: '#FFF', color: '#000', border: '4px solid #000', boxShadow: '4px 4px 0px #000' }}
              onClick={() => { setShowWin(false); setView('LEVELS'); }}
            >
              Übersicht
            </button>
            <button
              className="flex-1 py-4 font-black uppercase text-sm transition-all"
              style={{ background: '#06FFA5', color: '#000', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
              onClick={() => { setShowWin(false); handleNextLevel(); }}
            >
              Weiter
            </button>
          </div>
        </div>
      </Modal>

      {/* Game Over Modal - Neo Brutal */}
      <Modal isOpen={gameState?.status === 'lost'} onClose={() => { setView('LEVELS'); setGameState(null); }} title="MISSION FAILED">
        <div className="text-center space-y-6">
          <div
            className="inline-block p-6"
            style={{ background: '#FF006E', border: '4px solid #000', boxShadow: '8px 8px 0px #000', transform: 'rotate(3deg)' }}
          >
            <Skull size={64} style={{ color: '#FFF' }} />
          </div>

          <div className="text-2xl font-black uppercase" style={{ color: '#000' }}>GAME OVER</div>

          <div>
            <p className="text-sm font-black uppercase tracking-widest mb-2" style={{ color: '#4A4A4A' }}>LÖSUNG</p>
            <div
              className="text-3xl font-mono font-black p-4"
              style={{ background: '#06FFA5', border: '4px solid #000', color: '#000' }}
            >
              {gameState?.targetWord}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              className="flex-1 py-4 font-black uppercase text-sm transition-all"
              style={{ background: '#FFF', color: '#000', border: '4px solid #000', boxShadow: '4px 4px 0px #000' }}
              onClick={() => { setView('LEVELS'); setGameState(null); }}
            >
              MENU
            </button>
            <button
              className="flex-1 py-4 font-black uppercase text-sm transition-all"
              style={{ background: '#FF7F00', color: '#000', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
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
                  const content = getLevelContent(mode, gameConfig!.tier, gameConfig!.levelId, user.language, user.playedWords || []);
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
            </button>
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
        title={t.HOME.VOUCHER_TITLE}
      >
        <div className="text-center py-6 space-y-6">
          <div className="inline-block p-6 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Sparkles className="text-blue-400 drop-shadow-lg" size={48} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-300">{t.HOME.VOUCHER_HEADING}</h3>
            <p className="text-xs text-gray-500">{t.HOME.VOUCHER_DESC}</p>
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
              placeholder={t.HOME.VOUCHER_PLACEHOLDER}
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
              {t.HOME.VOUCHER_CANCEL}
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:brightness-110"
              onClick={handleVoucherRedeem}
              disabled={!voucherCode.trim() || !!voucherSuccess}
            >
              {voucherSuccess ? t.HOME.VOUCHER_REDEEMED : t.HOME.VOUCHER_REDEEM}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Premium Info Modal - Neo Brutal */}
      <Modal isOpen={showPremiumInfo} onClose={() => setShowPremiumInfo(false)} title="PREMIUM STORE">
        <div className="space-y-5">
          {/* Header */}
          <div className="text-center">
            <div
              className="inline-block p-4 mb-4"
              style={{ background: '#FFBE0B', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
            >
              <Crown size={32} fill="currentColor" style={{ color: '#000' }} />
            </div>
            <h3 className="text-xl font-black uppercase" style={{ color: '#000' }}>Wähle deinen Plan</h3>
            <p className="text-sm font-bold mt-1" style={{ color: '#4A4A4A' }}>Schalte alle Features frei!</p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Plan 1: Monthly */}
            <button
              className="relative p-4 text-left transition-all"
              style={{
                background: selectedPlan === 'monthly' ? '#FFBE0B' : '#FFF',
                border: '4px solid #000',
                boxShadow: selectedPlan === 'monthly' ? '8px 8px 0px #000' : '4px 4px 0px #000',
                transform: selectedPlan === 'monthly' ? 'translateY(-4px)' : 'translateY(0)'
              }}
              onClick={() => setSelectedPlan('monthly')}
            >
              <div
                className="absolute -top-3 right-2 px-2 py-1 text-[10px] font-black uppercase"
                style={{ background: '#FF006E', color: '#FFF', border: '2px solid #000' }}
              >
                BEST VALUE
              </div>
              <h4 className="font-black text-lg uppercase" style={{ color: '#000' }}>Monatlich</h4>
              <div className="text-3xl font-black my-2" style={{ color: '#000' }}>7,99€</div>
              <ul className="text-xs font-bold space-y-1" style={{ color: '#4A4A4A' }}>
                <li className="flex items-center gap-2"><Check size={12} style={{ color: '#06FFA5' }} /> Premium Features</li>
                <li className="flex items-center gap-2" style={{ color: '#FF006E' }}><Sparkles size={12} /> +10 Level Boost</li>
                <li className="flex items-center gap-2"><Clock size={12} /> Auto-Verlängerung</li>
              </ul>
            </button>

            {/* Plan 2: 30 Days */}
            <button
              className="relative p-4 text-left transition-all"
              style={{
                background: selectedPlan === '30days' ? '#8338EC' : '#FFF',
                border: '4px solid #000',
                boxShadow: selectedPlan === '30days' ? '8px 8px 0px #000' : '4px 4px 0px #000',
                transform: selectedPlan === '30days' ? 'translateY(-4px)' : 'translateY(0)'
              }}
              onClick={() => setSelectedPlan('30days')}
            >
              <h4 className="font-black text-lg uppercase" style={{ color: selectedPlan === '30days' ? '#FFF' : '#000' }}>30 Tage Pass</h4>
              <div className="text-3xl font-black my-2" style={{ color: selectedPlan === '30days' ? '#FFF' : '#8338EC' }}>4,99€</div>
              <ul className="text-xs font-bold space-y-1" style={{ color: selectedPlan === '30days' ? 'rgba(255,255,255,0.8)' : '#4A4A4A' }}>
                <li className="flex items-center gap-2"><Check size={12} style={{ color: '#06FFA5' }} /> Premium Features</li>
                <li className="flex items-center gap-2"><CreditCard size={12} /> Einmalzahlung</li>
              </ul>
            </button>
          </div>

          {/* Payment Section */}
          <div
            className="p-4 flex flex-col items-center"
            style={{ background: 'var(--color-bg)', border: '4px solid #000' }}
          >
            <div className="flex items-center gap-2 mb-4 font-black text-sm uppercase" style={{ color: '#000' }}>
              <CreditCard size={16} /> Bezahlen mit PayPal
            </div>
            <div className="w-full max-w-[250px]">
              {selectedPlan === 'monthly' && (
                <PayPalButton amount="7.99" onSuccess={(d: any) => handlePayPalSuccess(d, 'monthly')} />
              )}
              {selectedPlan === '30days' && (
                <PayPalButton amount="4.99" onSuccess={(d: any) => handlePayPalSuccess(d, '30days')} />
              )}
            </div>
          </div>

          {/* Voucher Section */}
          <div className="pt-4" style={{ borderTop: '3px solid #000' }}>
            <div className="flex items-center gap-2 mb-3 font-black text-sm uppercase" style={{ color: '#000' }}>
              <Gem size={16} /> Gutscheincode einlösen
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="CODE EINGEBEN..."
                className="flex-1 p-3 font-mono font-bold uppercase"
                style={{ background: 'var(--color-bg)', border: '3px solid #000', color: '#000' }}
              />
              <button
                onClick={handleVoucherRedeem}
                className="px-4 py-3 font-black text-sm uppercase transition-all"
                style={{ background: '#06FFA5', color: '#000', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}
              >
                Einlösen
              </button>
            </div>
            {voucherError && (
              <div className="mt-2 text-xs font-black flex items-center gap-1" style={{ color: '#FF006E' }}>
                <AlertTriangle size={12} /> {voucherError}
              </div>
            )}
            {voucherSuccess && (
              <div className="mt-2 text-xs font-black flex items-center gap-1" style={{ color: '#06FFA5' }}>
                <Check size={12} /> {voucherSuccess}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Premium Required Modal - Neo Brutal */}
      <Modal isOpen={showPremiumRequiredModal} onClose={() => setShowPremiumRequiredModal(false)} title={t.HOME.PREMIUM_REQUIRED_TITLE}>
        <div className="text-center space-y-5">
          <div
            className="w-20 h-20 mx-auto flex items-center justify-center"
            style={{ background: '#FFBE0B', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
          >
            <Lock size={36} style={{ color: '#000' }} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase" style={{ color: '#000' }}>{t.HOME.PREMIUM_REQUIRED_LOCKED}</h3>
            <p className="text-sm font-bold leading-relaxed" style={{ color: '#4A4A4A' }}>
              {t.HOME.PREMIUM_REQUIRED_DESC}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => { setShowPremiumRequiredModal(false); setView('SEASON'); }}
              className="w-full py-4 font-black uppercase text-sm transition-all"
              style={{ background: '#FFBE0B', color: '#000', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
            >
              {t.HOME.PREMIUM_REQUIRED_GO}
            </button>
            <button
              onClick={() => setShowPremiumRequiredModal(false)}
              className="w-full py-4 font-black uppercase text-sm transition-all"
              style={{ background: '#FFF', color: '#000', border: '4px solid #000', boxShadow: '4px 4px 0px #000' }}
            >
              {t.HOME.PREMIUM_REQUIRED_LATER}
            </button>
          </div>
        </div>
      </Modal>

      {/* Username Change Confirmation Modal - Neo Brutal */}
      <Modal isOpen={showUsernameConfirm} onClose={() => setShowUsernameConfirm(false)} title="BESTÄTIGUNG">
        <div className="space-y-5">
          <div
            className="p-4 text-center"
            style={{ background: '#FFBE0B', border: '4px solid #000' }}
          >
            <User size={32} style={{ color: '#000' }} className="mx-auto mb-2" />
            <p className="font-black text-sm uppercase" style={{ color: '#000' }}>
              Neuer Name: <span style={{ color: '#000' }}>{editUsername}</span>
            </p>
            <p className="font-bold text-sm mt-2" style={{ color: '#000' }}>
              Kosten: 2500 Münzen
            </p>
          </div>

          <div
            className="p-3 text-center"
            style={{ background: '#FFF', border: '3px solid #FF006E' }}
          >
            <p className="text-xs font-black" style={{ color: '#FF006E' }}>
              ⚠️ Diese Änderung kann nicht rückgängig gemacht werden!
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowUsernameConfirm(false)}
              className="flex-1 py-4 font-black text-sm uppercase transition-all"
              style={{ background: '#FFF', color: '#000', border: '4px solid #000', boxShadow: '4px 4px 0px #000' }}
            >
              Abbrechen
            </button>
            <button
              onClick={confirmUsernameChange}
              className="flex-1 py-4 font-black text-sm uppercase flex items-center justify-center gap-2 transition-all"
              style={{ background: '#06FFA5', color: '#000', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
            >
              <User size={16} /> Bestätigen
            </button>
          </div>
        </div>
      </Modal>

      {/* Profile Modal - Neo Brutal */}
      <Modal isOpen={showProfile} onClose={() => setShowProfile(false)} title={t.PROFILE.TITLE}>
        <div className="space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Username Section */}
          {cloudUsername && (
            <>
              <div
                className="p-4"
                style={{ background: '#FFF', border: '4px solid #000', boxShadow: '6px 6px 0px #FFBE0B' }}
              >
                <div className="inline-block px-3 py-1 mb-3 font-black text-xs uppercase" style={{ background: '#FFBE0B', color: '#000', border: '2px solid #000' }}>
                  {t.PROFILE.USERNAME}
                </div>
                <p className="text-xs font-bold mb-2" style={{ color: '#4A4A4A' }}>
                  {t.PROFILE.CURRENT}: <span style={{ color: '#000' }}>{cloudUsername}</span>
                </p>
                <input
                  type="text"
                  className="w-full p-3 font-bold mb-2"
                  style={{ background: 'var(--color-bg)', border: '3px solid #000', color: '#000' }}
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  placeholder={t.PROFILE.NEW_USER_PLACEHOLDER}
                />
                {usernameError && <p className="text-xs font-black mb-2" style={{ color: '#FF006E' }}>{usernameError}</p>}
                <p className="text-xs font-bold mb-2" style={{ color: '#FF7F00' }}>{t.PROFILE.COST}: 2500 Coins</p>
                <button
                  onClick={handleUsernameChange}
                  className="w-full py-3 font-black uppercase text-sm transition-all"
                  style={{ background: '#FFBE0B', color: '#000', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}
                >
                  {t.PROFILE.CHANGE}
                </button>
              </div>

              {/* Account Security */}
              <div
                className="p-4"
                style={{ background: '#FFF', border: '4px solid #000', boxShadow: '6px 6px 0px #8338EC' }}
              >
                <div className="inline-block px-3 py-1 mb-3 font-black text-xs uppercase" style={{ background: '#8338EC', color: '#FFF', border: '2px solid #000' }}>
                  ACCOUNT SICHERHEIT
                </div>
                {auth.currentUser?.email && (
                  <div className="mb-3">
                    <p className="text-xs font-bold uppercase" style={{ color: '#4A4A4A' }}>E-MAIL</p>
                    <p className="font-black" style={{ color: '#000' }}>{auth.currentUser.email}</p>
                  </div>
                )}
                <button
                  onClick={async () => {
                    if (!auth.currentUser?.email) return;
                    if (confirm(`Passwort-Reset E-Mail an ${auth.currentUser.email} senden?`)) {
                      const { resetPassword } = await import('./utils/firebase');
                      const result = await resetPassword(auth.currentUser.email);
                      alert(result.success ? 'E-Mail gesendet!' : 'Fehler: ' + result.error);
                    }
                  }}
                  className="w-full py-3 font-black uppercase text-xs flex items-center justify-center gap-2 transition-all"
                  style={{ background: '#FFF', color: '#000', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}
                >
                  <Lock size={14} /> Passwort zurücksetzen
                </button>
              </div>

              {/* Friend Code */}
              <div
                className="p-4 text-center"
                style={{ background: '#06FFA5', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
              >
                <div className="inline-block px-3 py-1 mb-3 font-black text-xs uppercase" style={{ background: '#FFF', color: '#000', border: '2px solid #000' }}>
                  FREUNDESCODE
                </div>
                <div
                  className="text-2xl font-mono font-black tracking-[0.2em] select-all cursor-pointer p-3 transition-all"
                  style={{ background: '#FFF', border: '3px solid #000', color: '#000' }}
                  onClick={() => user.friendCode && navigator.clipboard.writeText(user.friendCode)}
                >
                  {user.friendCode || '-----'}
                </div>
                <p className="text-xs font-bold mt-2" style={{ color: '#000' }}>Tippen zum Kopieren</p>
              </div>

              <button
                onClick={() => { setShowProfile(false); setShowFriendsManager(true); }}
                className="w-full py-4 font-black uppercase text-sm flex items-center justify-center gap-2 transition-all"
                style={{ background: '#8338EC', color: '#FFF', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
              >
                <Users size={18} /> Freunde verwalten
              </button>
            </>
          )}

          {/* Avatar Preview */}
          <div
            className="p-4"
            style={{ background: '#FFF', border: '4px solid #000', boxShadow: '6px 6px 0px #FF006E' }}
          >
            <div className="inline-block px-3 py-1 mb-3 font-black text-xs uppercase" style={{ background: '#FF006E', color: '#FFF', border: '2px solid #000' }}>
              {t.PROFILE.AVATAR_PREVIEW}
            </div>
            <div className="flex justify-center mb-4">
              <div
                className={`w-24 h-24 overflow-hidden bg-[#FFF8E7] ${getAvatarEffect(editFrame)}`}
                style={{ border: '4px solid #000' }}
              >
                <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${editAvatar}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="inline-block px-3 py-1 mb-3 font-black text-xs uppercase" style={{ background: 'var(--color-bg)', color: '#000', border: '2px solid #000' }}>
              {t.PROFILE.CHOOSE_AVATAR}
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {(user.ownedAvatars || [AVATARS[0]]).map(avatar => (
                <button
                  key={avatar}
                  onClick={() => setEditAvatar(avatar)}
                  className="aspect-square overflow-hidden transition-all"
                  style={{
                    border: editAvatar === avatar ? '4px solid #FF006E' : '3px solid #000',
                    background: '#FFF8E7',
                    transform: editAvatar === avatar ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${avatar}`} alt="Avatar" className="w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 text-center" style={{ background: '#FFBE0B', border: '4px solid #000', boxShadow: '4px 4px 0px #000' }}>
              <p className="text-xs font-black uppercase" style={{ color: '#000' }}>Level</p>
              <p className="text-3xl font-black" style={{ color: '#000' }}>{user.level}</p>
            </div>
            <div className="p-4 text-center" style={{ background: '#FF006E', border: '4px solid #000', boxShadow: '4px 4px 0px #000' }}>
              <p className="text-xs font-black uppercase" style={{ color: '#FFF' }}>XP</p>
              <p className="text-3xl font-black" style={{ color: '#FFF' }}>{user.xp}</p>
            </div>
          </div>

          {/* Age (Locked) */}
          <div className="p-3 flex items-center justify-between" style={{ background: '#E5E5E5', border: '3px solid #CCC' }}>
            <div>
              <span className="text-xs font-black uppercase" style={{ color: '#999' }}>{t.PROFILE.AGE}</span>
              <span className="ml-2 font-black" style={{ color: '#666' }}>{editAge}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-black uppercase" style={{ color: '#999' }}>
              <Lock size={12} /> {t.PROFILE.LOCKED}
            </div>
          </div>

          {/* Profile Customization - Frames, Fonts, Effects, Sticker Album */}
          <ProfileEditor
            user={user}
            selectedFrame={editFrame}
            selectedFont={editFont}
            selectedEffect={editEffect}
            onFrameChange={setEditFrame}
            onFontChange={setEditFont}
            onEffectChange={setEditEffect}
            onOpenAlbum={() => { setShowProfile(false); setShowStickerAlbum(true); }}
          />

          {/* Delete Account */}
          <div className="p-4" style={{ background: '#FFF', border: '3px solid #ccc' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-xs" style={{ color: '#666' }}>{t.PROFILE.DELETE_ACCOUNT}</span>
            </div>
            <p className="text-xs mb-3" style={{ color: '#999' }}>{t.PROFILE.DELETE_INFO || 'Dein Account und alle Daten werden gelöscht.'}</p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 font-black uppercase text-xs transition-all"
              style={{ background: '#FFF', color: '#FF006E', border: '3px solid #FF006E' }}
            >
              {t.PROFILE.DELETE_ACCOUNT}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowProfile(false)}
              className="flex-1 py-4 font-black uppercase text-sm transition-all"
              style={{ background: '#FFF', color: '#000', border: '4px solid #000', boxShadow: '4px 4px 0px #000' }}
            >
              {t.PROFILE.CANCEL}
            </button>
            <button
              onClick={saveProfile}
              className="flex-1 py-4 font-black uppercase text-sm transition-all"
              style={{ background: '#06FFA5', color: '#000', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
            >
              Speichern
            </button>
          </div>
        </div>
      </Modal>

      {/* Sticker Album View */}
      {showStickerAlbum && (
        <StickerAlbumView
          user={user}
          onClose={() => setShowStickerAlbum(false)}
          onClaimCategoryReward={handleClaimCategoryReward}
        />
      )}

      {/* Delete Confirmation Modal - Neo Brutal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} title={t.PROFILE.DELETE_ACCOUNT}>
        <div className="space-y-5">
          <div
            className="p-4 flex items-start gap-3"
            style={{ background: '#FFF', border: '4px solid #FF006E' }}
          >
            <AlertTriangle size={24} style={{ color: '#FF006E' }} className="shrink-0 mt-1" />
            <div>
              <h3 className="font-black mb-1" style={{ color: '#FF006E' }}>{t.PROFILE.DELETE_WARNING}</h3>
              <p className="text-xs font-bold leading-relaxed" style={{ color: 'rgba(255,0,110,0.7)' }}>
                {t.PROFILE.DELETE_INFO || 'Alle deine Fortschritte werden unwiderruflich gelöscht.'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase" style={{ color: '#4A4A4A' }}>{t.PROFILE.CONFIRM_MSG}</label>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder={t.PROFILE.CONFIRM_PLACEHOLDER}
              className="w-full p-4 font-mono text-center"
              style={{ background: 'var(--color-bg)', border: '4px solid #FF006E', color: '#000' }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
              className="flex-1 py-4 font-black text-sm uppercase transition-all"
              style={{ background: '#FFF', color: '#000', border: '4px solid #000', boxShadow: '4px 4px 0px #000' }}
            >
              {t.PROFILE.CANCEL}
            </button>
            <button
              onClick={() => {
                if (deleteInput.toUpperCase() === t.PROFILE.CONFIRM_PLACEHOLDER) {
                  alert('Profil-Löschung noch nicht implementiert. Bald verfügbar!');
                  setShowDeleteConfirm(false);
                  setDeleteInput('');
                } else {
                  alert(t.PROFILE.CONFIRM_MSG);
                }
              }}
              disabled={deleteInput.toUpperCase() !== t.PROFILE.CONFIRM_PLACEHOLDER}
              className="flex-1 py-4 font-black text-sm uppercase flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#FF006E', color: '#FFF', border: '4px solid #000', boxShadow: '4px 4px 0px #000' }}
            >
              <Skull size={16} /> {t.PROFILE.CONFIRM_DELETE}
            </button>
          </div>
        </div>
      </Modal>

      {/* Cloud Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(username) => {
          handleCloudLogin(username);
          setShowAuthModal(false);
        }}
        lang={user.language}
        onLanguageChange={(lang) => setUser(prev => ({ ...prev, language: lang }))}
      />

      {/* Web Version: APK Download Button */}
      {(window as any).Capacitor === undefined && (
        <div className="fixed bottom-4 right-4 z-[50]">
          <a
            href={apkDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 transition-all duration-100 group"
            style={{
              backgroundColor: '#06FFA5',
              border: '2px solid #000',
              boxShadow: '3px 3px 0px #000',
              transform: 'skew(-2deg)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'skew(-2deg) translateY(-1px)';
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'skew(-2deg)';
              e.currentTarget.style.boxShadow = '3px 3px 0px #000';
            }}
          >
            <Smartphone size={16} className="text-black" />
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-black uppercase tracking-widest text-black leading-none">Android App</span>
              <span className="text-xs font-black uppercase tracking-wider text-black leading-none">Download</span>
            </div>
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
