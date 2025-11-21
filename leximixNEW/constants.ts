import { Tier, GameMode, Language, TutorialContent, ShopItem } from './types';

export const TIER_COLORS: Record<Tier, string> = {
  [Tier.BEGINNER]: 'text-green-400',
  [Tier.LEARNER]: 'text-cyan-400',
  [Tier.SKILLED]: 'text-blue-400',
  [Tier.EXPERT]: 'text-purple-400',
  [Tier.MASTER]: 'text-red-500',
};

export const TIER_BG: Record<Tier, string> = {
  [Tier.BEGINNER]: 'bg-green-500/20 border-green-500/50',
  [Tier.LEARNER]: 'bg-cyan-500/20 border-cyan-500/50',
  [Tier.SKILLED]: 'bg-blue-500/20 border-blue-500/50',
  [Tier.EXPERT]: 'bg-purple-500/20 border-purple-500/50',
  [Tier.MASTER]: 'bg-red-500/20 border-red-500/50',
};

// --- Translations ---

export const TRANSLATIONS = {
  [Language.EN]: {
    ONBOARDING: {
      WELCOME: "WELCOME",
      SELECT_LANG: "SELECT LANGUAGE",
      NAME_TITLE: "IDENTIFY YOURSELF",
      NAME_PLACEHOLDER: "Enter Agent Name",
      AGE_TITLE: "VERIFY AGE",
      AGE_PLACEHOLDER: "Enter Age",
      CONTINUE: "CONTINUE",
      START: "INITIALIZE SYSTEM",
      ERR_NAME: "Max 20 characters",
      ERR_AGE: "Invalid age (1-120)"
    },
    HOME: {
      PLAYER: "Agent",
      SEASON_LEVEL: "Season Level",
      TAGLINE: "THE DAILY WORD TRAINING",
      LANG_BTN: "DEUTSCH",
      PLAY: "PLAY"
    },
    MODES: {
      CLASSIC: { title: "CLASSIC", desc: "The Standard" },
      SPEEDRUN: { title: "SPEEDRUN", desc: "Race against time" },
      CHAIN: { title: "CHAIN", desc: "Link words" },
      CATEGORY: { title: "TOPICS", desc: "Context based" },
      SUDOKU: { title: "SUDOKU", desc: "Logic (A-I)" },
      CHALLENGE: { title: "CHALLENGE", desc: "Premium Brain" },
      LOCKED: { title: "LOCKED", desc: "Coming Soon" }
    },
    SEASON: {
      TITLE: "SEASON I: GENESIS",
      SUBTITLE: "BATTLE PASS",
      PREMIUM_ACTIVE: "PREMIUM ACTIVE",
      FREE_ACTIVE: "FREE PASS ACTIVE",
      GET_PREMIUM: "GET PREMIUM",
      PREMIUM_DESC: "Unlock exclusive skins, faster hints, and golden name color.",
      UNLOCK_BTN: "UNLOCK $4.99",
      LEVEL: "LVL",
      COINS: "Coins",
      RARE_ITEM: "Rare Item",
      DAYS_LEFT: "DAYS LEFT"
    },
    LEVELS: {
      BACK: "BACK",
      TIERS: ["BEGINNER", "LEARNER", "SKILLED", "EXPERT", "MASTER"]
    },
    GAME: {
      HINT_TITLE: "HINT",
      UNLOCK_HINT: "UNLOCK HINT",
      SUDOKU_TITLE: "SUDOKU",
      CLASSIC_TITLE: "CLASSIC",
      SUDOKU_DESC: "Fill the grid",
      SPEEDRUN_DESC: "Time Remaining",
      WIN_TITLE: "VICTORY",
      WIN_DESC: "Level Cleared!",
      XP_GAINED: "XP GAINED",
      COINS_GAINED: "COINS",
      NEXT_BTN: "NEXT LEVEL",
      PASS_BTN: "VIEW PASS",
      HINT_MODAL_TITLE: "UNLOCK HINT",
      AD_SIM: "AD SPACE\n(Simulation)",
      WATCHING: "WATCHING...",
      CLAIM: "CLAIM HINT",
      REWARD: "REWARD READY",
      HINT_COST_PREFIX: "+",
      HINT_COST_SUFFIX: "s Wait Time"
    },
    TUTORIAL: {
      HEADER: "HOW TO PLAY",
      BACK: "BACK",
      START: "START GAME"
    },
    PROFILE: {
      TITLE: "AGENT PROFILE",
      SAVE: "SAVE CHANGES",
      NAME: "Name",
      AGE: "Age",
      AVATAR: "Avatar"
    },
    SHOP: {
      TITLE: "BLACK MARKET",
      CURRENCY_SECTION: "COIN PACKS",
      AVATAR_SECTION: "AVATAR TERMINAL",
      BUY: "BUY",
      OWNED: "OWNED",
      EQUIP: "EQUIP",
      EQUIPPED: "EQUIPPED",
      INSUFFICIENT: "NOT ENOUGH COINS",
      SUCCESS: "PURCHASED"
    }
  },
  [Language.DE]: {
    ONBOARDING: {
      WELCOME: "WILLKOMMEN",
      SELECT_LANG: "SPRACHE WÄHLEN",
      NAME_TITLE: "IDENTIFIZIERUNG",
      NAME_PLACEHOLDER: "Agentenname eingeben",
      AGE_TITLE: "ALTER VERIFIZIEREN",
      AGE_PLACEHOLDER: "Alter eingeben",
      CONTINUE: "WEITER",
      START: "SYSTEM INITIALISIEREN",
      ERR_NAME: "Max 20 Zeichen",
      ERR_AGE: "Ungültiges Alter (1-120)"
    },
    HOME: {
      PLAYER: "Agent",
      SEASON_LEVEL: "Saison Stufe",
      TAGLINE: "DAS TÄGLICHE WORTTRAINING",
      LANG_BTN: "ENGLISH",
      PLAY: "SPIELEN"
    },
    MODES: {
      CLASSIC: { title: "KLASSISCH", desc: "Der Standard" },
      SPEEDRUN: { title: "ZEITRENNEN", desc: "Gegen die Zeit" },
      CHAIN: { title: "WORTKETTE", desc: "Verbinde Worte" },
      CATEGORY: { title: "THEMEN", desc: "Kontext-Rätsel" },
      SUDOKU: { title: "SUDOKU", desc: "Logik (A-I)" },
      CHALLENGE: { title: "CHALLENGE", desc: "Premium Hirn" },
      LOCKED: { title: "BALD", desc: "Demnächst" }
    },
    SEASON: {
      TITLE: "SAISON I: GENESIS",
      SUBTITLE: "BATTLE PASS",
      PREMIUM_ACTIVE: "PREMIUM AKTIV",
      FREE_ACTIVE: "GRATIS PASS AKTIV",
      GET_PREMIUM: "PREMIUM HOLEN",
      PREMIUM_DESC: "Exklusive Skins, schnellere Hinweise und goldener Name.",
      UNLOCK_BTN: "FREISCHALTEN 4,99€",
      LEVEL: "STUFE",
      COINS: "Münzen",
      RARE_ITEM: "Seltenes Item",
      DAYS_LEFT: "TAGE ÜBRIG"
    },
    LEVELS: {
      BACK: "ZURÜCK",
      TIERS: ["ANFÄNGER", "FORTGESCHRITTEN", "ERFAHREN", "EXPERTE", "MEISTER"]
    },
    GAME: {
      HINT_TITLE: "HINWEIS",
      UNLOCK_HINT: "HINWEIS FREISCHALTEN",
      SUDOKU_TITLE: "SUDOKU",
      CLASSIC_TITLE: "KLASSISCH",
      SUDOKU_DESC: "Fülle das Gitter",
      SPEEDRUN_DESC: "Verbleibende Zeit",
      WIN_TITLE: "SIEG",
      WIN_DESC: "Level Geschafft!",
      XP_GAINED: "XP GEWONNEN",
      COINS_GAINED: "MÜNZEN",
      NEXT_BTN: "NÄCHSTES LEVEL",
      PASS_BTN: "PASS ANSEHEN",
      HINT_MODAL_TITLE: "HINWEIS FREISCHALTEN",
      AD_SIM: "WERBEFLÄCHE\n(Simulation)",
      WATCHING: "WERBUNG LÄUFT...",
      CLAIM: "HINWEIS HOLEN",
      REWARD: "BELOHNUNG BEREIT",
      HINT_COST_PREFIX: "+",
      HINT_COST_SUFFIX: "s Wartezeit"
    },
    TUTORIAL: {
      HEADER: "SPIELANLEITUNG",
      BACK: "ZURÜCK",
      START: "SPIEL STARTEN"
    },
    PROFILE: {
      TITLE: "AGENTEN PROFIL",
      SAVE: "SPEICHERN",
      NAME: "Name",
      AGE: "Alter",
      AVATAR: "Avatar"
    },
    SHOP: {
      TITLE: "SCHWARZMARKT",
      CURRENCY_SECTION: "MÜNZPAKETE",
      AVATAR_SECTION: "AVATAR TERMINAL",
      BUY: "KAUFEN",
      OWNED: "BESITZ",
      EQUIP: "AUSRÜSTEN",
      EQUIPPED: "AUSGERÜSTET",
      INSUFFICIENT: "NICHT GENUG MÜNZEN",
      SUCCESS: "GEKAUFT"
    }
  }
};

// Word Lists
export const WORDS_EN = [
  "REACT", "BUILD", "CODE", "VITE", "GAMES", "SPACE", "LASER", "CYBER", "NEON", "NIGHT",
  "PLANET", "ROCKET", "GALAXY", "NEBULA", "ORBIT", "COMET", "STARS", "ALIEN", "MARS", "MOON",
  "QUANTUM", "ISOTOPE", "PHYSICS", "THEORY", "ATOM", "POWER", "FORCE", "FIELD", "LIGHT", "WAVE",
  "FUNCTION", "VARIABLE", "CONSTANT", "SYNTAX", "ARRAY", "LOGIC", "LOOP", "CLASS", "OBJECT", "DATA",
  "ZEPHYR", "CRYPTIC", "JINX", "QUARTZ", "VORTEX", "HYPER", "SONIC", "ULTRA", "MEGA", "GIGA"
];

export const WORDS_DE = [
  "APFEL", "BIRNE", "AUTO", "HAUS", "KATZE", "HUND", "MAUS", "BERG", "FLUSS", "MEER",
  "HIMMEL", "WOLKE", "SONNE", "MOND", "STERNE", "NACHT", "LICHT", "FEUER", "WASSER", "LUFT",
  "FREUND", "SCHULE", "ARBEIT", "LEBEN", "TRAUM", "LIEBE", "GLUECK", "ANGST", "MUT", "KRAFT",
  "FENSTER", "GARTEN", "BLUME", "BAUM", "WALD", "WIESE", "SAND", "STEIN", "GOLD", "SILBER",
  "PHYSIK", "CHEMIE", "FORMEL", "LOGIK", "MATHE", "SPORT", "SPIEL", "BUCH", "FILM", "MUSIK"
];

// Challenge Mode Math Questions
export const MATH_CHALLENGES = [
  { q: "12 + 5", a: "17" }, { q: "10 * 2", a: "20" }, { q: "50 / 2", a: "25" },
  { q: "8 * 8", a: "64" }, { q: "100 - 33", a: "67" }, { q: "12 * 12", a: "144" },
  { q: "3 * 3 * 3", a: "27" }, { q: "15 + 15 + 15", a: "45" }, { q: "99 / 3", a: "33" }
];

// Chain Pairs: [Hint, Target]
export const CHAIN_PAIRS_EN = [
    ["RAIN", "BOW"], ["SUN", "LIGHT"], ["FIRE", "WORK"], ["SNOW", "BALL"], ["KEY", "BOARD"],
    ["TIME", "OUT"], ["DOOR", "BELL"], ["PAN", "CAKE"], ["CUP", "CAKE"], ["EAR", "RING"]
];
export const CHAIN_PAIRS_DE = [
    ["HAUS", "TIER"], ["AUTO", "BAHN"], ["FLUG", "ZEUG"], ["HAND", "SCHUH"], ["TISCH", "BEIN"],
    ["BAUM", "HAUS"], ["WASSER", "FALL"], ["REGEN", "BOGEN"], ["SONNEN", "LICHT"], ["FEUER", "WEHR"]
];

// Categories
export const CATEGORY_DATA_EN: Record<string, string[]> = {
    "SPACE": ["MARS", "MOON", "STAR", "SUN", "ORBIT"],
    "FOOD": ["APPLE", "BREAD", "CAKE", "PIZZA", "SOUP"],
    "TECH": ["CODE", "DATA", "WIFI", "BYTE", "LINK"]
};
export const CATEGORY_DATA_DE: Record<string, string[]> = {
    "WELTRAUM": ["MOND", "MARS", "STERN", "SONNE", "KOMET"],
    "ESSEN": ["APFEL", "BROT", "KUCHEN", "PIZZA", "SUPPE"],
    "TECHNIK": ["CODE", "DATEN", "WLAN", "LINK", "CHIP"]
};

export const TUTORIALS: Record<GameMode, Record<Language, TutorialContent>> = {
  [GameMode.CLASSIC]: {
    [Language.EN]: { title: "Classic Mode", text: "Guess the word in 6 tries. Green means correct spot, Yellow means wrong spot, Gray means not in word." },
    [Language.DE]: { title: "Klassisch", text: "Errate das Wort in 6 Versuchen. Grün ist richtig, Gelb ist falsche Stelle, Grau ist nicht im Wort." }
  },
  [GameMode.SPEEDRUN]: {
    [Language.EN]: { title: "Speedrun", text: "Race against the clock! You have limited time to guess based on word length." },
    [Language.DE]: { title: "Zeitrennen", text: "Wettlauf gegen die Zeit! Du hast nur begrenzte Zeit, abhängig von der Wortlänge." }
  },
  [GameMode.CHAIN]: {
    [Language.EN]: { title: "Chain Reaction", text: "The previous answer is your hint for the next word. E.g. RAIN -> BOW." },
    [Language.DE]: { title: "Wortkette", text: "Die vorherige Antwort ist dein Hinweis für das nächste Wort. Z.B. HAUS -> TIER." }
  },
  [GameMode.CATEGORY]: {
    [Language.EN]: { title: "Topic Puzzle", text: "All words belong to a specific category shown at the top." },
    [Language.DE]: { title: "Themen-Rätsel", text: "Alle Wörter gehören zu einer bestimmten Kategorie, die oben angezeigt wird." }
  },
  [GameMode.SUDOKU]: {
    [Language.EN]: { title: "Letter Sudoku", text: "Fill the 9x9 grid with letters A-I. No repeats in rows, columns, or 3x3 boxes." },
    [Language.DE]: { title: "Buchstaben-Sudoku", text: "Fülle das 9x9 Gitter mit A-I. Keine Wiederholungen in Zeilen, Spalten oder 3x3 Boxen." }
  },
  [GameMode.CHALLENGE]: {
    [Language.EN]: { title: "Challenge", text: "Solve math problems and words. Premium only. Costs coins." },
    [Language.DE]: { title: "Herausforderung", text: "Löse Matheaufgaben und Wörter. Nur Premium. Kostet Münzen." }
  }
};

// Rewards Mock Data
export const SEASON_REWARDS = Array.from({length: 100}, (_, i) => ({
    level: i + 1,
    free: { type: 'coins', amount: 100 },
    premium: (i + 1) % 2 === 0 ? { type: 'item', name: 'Rare Skin' } : null
}));

// Avatars List (DiceBear IDs)
export const AVATARS = [
  "Felix", "Aneka", "Zack", "Midnight", "Shadow", "Cyber", "Neon", "Glitch",
  "Viper", "Echo", "Raven", "Blade", "Matrix", "Nova", "Rogue", "Titan"
];

// Shop Items
export const SHOP_ITEMS: ShopItem[] = [
  // Currency Packs
  { id: 'coins_small', type: 'currency', name: 'Pocket Change', cost: '0.99€', value: 500, currencyAmount: 500, isRealMoney: true },
  { id: 'coins_med', type: 'currency', name: 'Mercenary Stash', cost: '2.99€', value: 1500, currencyAmount: 1500, isRealMoney: true },
  { id: 'coins_large', type: 'currency', name: 'Corporate Fund', cost: '9.99€', value: 6000, currencyAmount: 6000, isRealMoney: true },
  
  // Avatars (Costs Coins)
  { id: 'shop_avatar_1', type: 'avatar', name: 'Cyber Demon', cost: 500, value: 'CyberDemon' },
  { id: 'shop_avatar_2', type: 'avatar', name: 'Holo Girl', cost: 800, value: 'HoloGirl' },
  { id: 'shop_avatar_3', type: 'avatar', name: 'Mecha King', cost: 1200, value: 'MechaKing' },
  { id: 'shop_avatar_4', type: 'avatar', name: 'Void Stalker', cost: 2000, value: 'VoidStalker' },
  { id: 'shop_avatar_5', type: 'avatar', name: 'Neon Samurai', cost: 3000, value: 'NeonSamurai' },
];