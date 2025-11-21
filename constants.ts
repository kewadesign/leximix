import { Tier, GameMode, Language, TutorialContent, ShopItem, WordData } from './types';

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
      SUDOKU: { title: "LETTER SUDOKU", desc: "Logic (A-I)" },
      CHALLENGE: { title: "CHALLENGE", desc: "Premium Challenges" },
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
      DAYS_LEFT: "DAYS LEFT",
      REDEEM_CODE: "REDEEM CODE",
      CODE_PLACEHOLDER: "Enter Activation Code",
      INVALID_CODE: "Invalid Code"
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
      SUDOKU: { title: "Buchstaben Sudoku", desc: "Logik (A-I)" },
      CHALLENGE: { title: "CHALLENGE", desc: "Premium Herausforderungen" },
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
      DAYS_LEFT: "TAGE ÜBRIG",
      REDEEM_CODE: "CODE EINLÖSEN",
      CODE_PLACEHOLDER: "Gutscheincode eingeben",
      INVALID_CODE: "Ungültiger Code"
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

// Word Lists with Hints and Tiers
export const WORDS_EN: WordData[] = [
  // Beginner (Tier 1) - Common, simple words
  { word: "APPLE", hint: "A popular red or green fruit.", tier: Tier.BEGINNER },
  { word: "HOUSE", hint: "A building for human habitation.", tier: Tier.BEGINNER },
  { word: "WATER", hint: "Essential liquid for life.", tier: Tier.BEGINNER },
  { word: "BREAD", hint: "Baked dough food staple.", tier: Tier.BEGINNER },
  { word: "NIGHT", hint: "The time when it is dark.", tier: Tier.BEGINNER },
  { word: "HAPPY", hint: "Feeling or showing pleasure.", tier: Tier.BEGINNER },
  { word: "GREEN", hint: "Color of grass and leaves.", tier: Tier.BEGINNER },
  { word: "MUSIC", hint: "Vocal or instrumental sounds.", tier: Tier.BEGINNER },
  { word: "PHONE", hint: "Device used for calling.", tier: Tier.BEGINNER },
  { word: "SMILE", hint: "Facial expression of joy.", tier: Tier.BEGINNER },

  // Learner (Tier 2) - Slightly longer or less concrete
  { word: "PLANET", hint: "Celestial body orbiting a star.", tier: Tier.LEARNER },
  { word: "GARDEN", hint: "Plot of ground for plants.", tier: Tier.LEARNER },
  { word: "DOCTOR", hint: "Person who treats the sick.", tier: Tier.LEARNER },
  { word: "MARKET", hint: "Place where goods are sold.", tier: Tier.LEARNER },
  { word: "WINDOW", hint: "Opening in a wall for light.", tier: Tier.LEARNER },
  { word: "TRAVEL", hint: "Go from one place to another.", tier: Tier.LEARNER },
  { word: "SUMMER", hint: "The warmest season.", tier: Tier.LEARNER },
  { word: "FRIEND", hint: "Person you know and like.", tier: Tier.LEARNER },
  { word: "SCHOOL", hint: "Institution for educating.", tier: Tier.LEARNER },
  { word: "ANIMAL", hint: "Living organism that moves.", tier: Tier.LEARNER },

  // Skilled (Tier 3) - Abstract concepts or technical terms
  { word: "GALAXY", hint: "System of millions of stars.", tier: Tier.SKILLED },
  { word: "ENERGY", hint: "Power derived from resources.", tier: Tier.SKILLED },
  { word: "SYSTEM", hint: "Set of connected things.", tier: Tier.SKILLED },
  { word: "THEORY", hint: "System of ideas to explain.", tier: Tier.SKILLED },
  { word: "MEMORY", hint: "Faculty of encoding info.", tier: Tier.SKILLED },
  { word: "FUTURE", hint: "Time that is yet to come.", tier: Tier.SKILLED },
  { word: "NATURE", hint: "Physical world and life.", tier: Tier.SKILLED },
  { word: "DESIGN", hint: "Plan or drawing of object.", tier: Tier.SKILLED },
  { word: "SOURCE", hint: "Place where something starts.", tier: Tier.SKILLED },
  { word: "PUBLIC", hint: "Concerning the people.", tier: Tier.SKILLED },

  // Expert (Tier 4) - Specific, scientific, or complex
  { word: "QUANTUM", hint: "Physics of discrete energy.", tier: Tier.EXPERT },
  { word: "PHYSICS", hint: "Study of matter and energy.", tier: Tier.EXPERT },
  { word: "BIOLOGY", hint: "Study of living organisms.", tier: Tier.EXPERT },
  { word: "CULTURE", hint: "Arts and social institutions.", tier: Tier.EXPERT },
  { word: "JUSTICE", hint: "Just behavior or treatment.", tier: Tier.EXPERT },
  { word: "LIBERTY", hint: "State of being free.", tier: Tier.EXPERT },
  { word: "ECONOMY", hint: "Wealth and resources of a region.", tier: Tier.EXPERT },
  { word: "SOCIETY", hint: "Aggregate of people living together.", tier: Tier.EXPERT },
  { word: "HISTORY", hint: "Study of past events.", tier: Tier.EXPERT },
  { word: "COMPLEX", hint: "Consisting of many parts.", tier: Tier.EXPERT },

  // Master (Tier 5) - Obscure, long, or very specific
  { word: "ZEPHYR", hint: "A soft gentle breeze.", tier: Tier.MASTER },
  { word: "QUARTZ", hint: "Hard mineral of silica.", tier: Tier.MASTER },
  { word: "VORTEX", hint: "Mass of whirling fluid.", tier: Tier.MASTER },
  { word: "CRYPTIC", hint: "Having a meaning that is mysterious.", tier: Tier.MASTER },
  { word: "JINXED", hint: "Bring bad luck to.", tier: Tier.MASTER },
  { word: "SPHINX", hint: "Mythical creature with riddles.", tier: Tier.MASTER },
  { word: "RHYTHM", hint: "Strong, regular repeated pattern.", tier: Tier.MASTER },
  { word: "OXYGEN", hint: "Life-supporting gas.", tier: Tier.MASTER },
  { word: "UNIQUE", hint: "Being the only one of its kind.", tier: Tier.MASTER },
  { word: "ZENITH", hint: "The time at which something is most powerful.", tier: Tier.MASTER }
];

export const WORDS_DE: WordData[] = [
  // Beginner (Tier 1)
  { word: "APFEL", hint: "Ein beliebtes Kernobst.", tier: Tier.BEGINNER },
  { word: "HAUS", hint: "Gebäude zum Wohnen.", tier: Tier.BEGINNER },
  { word: "KATZE", hint: "Beliebtes Haustier.", tier: Tier.BEGINNER },
  { word: "BLUME", hint: "Pflanze mit Blüten.", tier: Tier.BEGINNER },
  { word: "SONNE", hint: "Stern unseres Systems.", tier: Tier.BEGINNER },
  { word: "MILCH", hint: "Weiße Flüssigkeit.", tier: Tier.BEGINNER },
  { word: "STUHL", hint: "Möbel zum Sitzen.", tier: Tier.BEGINNER },
  { word: "TISCH", hint: "Möbel mit Platte.", tier: Tier.BEGINNER },
  { word: "VOGEL", hint: "Tier mit Federn.", tier: Tier.BEGINNER },
  { word: "FARBE", hint: "Eigenschaft des Lichts.", tier: Tier.BEGINNER },

  // Learner (Tier 2)
  { word: "SCHULE", hint: "Ort zum Lernen.", tier: Tier.LEARNER },
  { word: "STRASSE", hint: "Weg für Fahrzeuge.", tier: Tier.LEARNER },
  { word: "FREUND", hint: "Nahestehende Person.", tier: Tier.LEARNER },
  { word: "URLAUB", hint: "Freie Zeit zur Erholung.", tier: Tier.LEARNER },
  { word: "WINTER", hint: "Die kälteste Jahreszeit.", tier: Tier.LEARNER },
  { word: "GARTEN", hint: "Kultiviertes Stück Land.", tier: Tier.LEARNER },
  { word: "ZIMMER", hint: "Raum in einem Haus.", tier: Tier.LEARNER },
  { word: "WASSER", hint: "Klare Flüssigkeit H2O.", tier: Tier.LEARNER },
  { word: "HIMMEL", hint: "Gewölbe über der Erde.", tier: Tier.LEARNER },
  { word: "BRUDER", hint: "Männliches Geschwister.", tier: Tier.LEARNER },

  // Skilled (Tier 3)
  { word: "ENERGIE", hint: "Fähigkeit, Arbeit zu verrichten.", tier: Tier.SKILLED },
  { word: "SYSTEM", hint: "Geordnetes Ganzes.", tier: Tier.SKILLED },
  { word: "PLANET", hint: "Himmelskörper im Orbit.", tier: Tier.SKILLED },
  { word: "KULTUR", hint: "Gesamtheit der geistigen Güter.", tier: Tier.SKILLED },
  { word: "GESETZ", hint: "Rechtliche Vorschrift.", tier: Tier.SKILLED },
  { word: "WISSEN", hint: "Kenntnis von Fakten.", tier: Tier.SKILLED },
  { word: "GLUECK", hint: "Zustand der Zufriedenheit.", tier: Tier.SKILLED },
  { word: "TRAUM", hint: "Erlebnis im Schlaf.", tier: Tier.SKILLED },
  { word: "MUSIK", hint: "Kunst der Töne.", tier: Tier.SKILLED },
  { word: "NATUR", hint: "Alles nicht vom Menschen Geschaffene.", tier: Tier.SKILLED },

  // Expert (Tier 4)
  { word: "FREIHEIT", hint: "Zustand der Unabhängigkeit.", tier: Tier.EXPERT },
  { word: "GERECHT", hint: "Fair und unparteiisch.", tier: Tier.EXPERT },
  { word: "BIOLOGIE", hint: "Lehre vom Leben.", tier: Tier.EXPERT },
  { word: "THEORIE", hint: "Wissenschaftliches Modell.", tier: Tier.EXPERT },
  { word: "ZUKUNFT", hint: "Die kommende Zeit.", tier: Tier.EXPERT },
  { word: "PROZESS", hint: "Ablauf oder Vorgang.", tier: Tier.EXPERT },
  { word: "STRUKTUR", hint: "Innerer Aufbau.", tier: Tier.EXPERT },
  { word: "KONZEPT", hint: "Plan oder Entwurf.", tier: Tier.EXPERT },
  { word: "POLITIK", hint: "Staatskunst.", tier: Tier.EXPERT },
  { word: "WIRTSCHAFT", hint: "Ökonomisches System.", tier: Tier.EXPERT },

  // Master (Tier 5)
  { word: "PHYSIK", hint: "Lehre von Materie.", tier: Tier.MASTER },
  { word: "ZYKLUS", hint: "Kreislauf.", tier: Tier.MASTER },
  { word: "SPHAERE", hint: "Kugel oder Bereich.", tier: Tier.MASTER },
  { word: "MYSTIK", hint: "Geheimnisvolle Lehre.", tier: Tier.MASTER },
  { word: "RHYTHMUS", hint: "Gleichmäßige Wiederkehr.", tier: Tier.MASTER },
  { word: "QUARZ", hint: "Häufiges Mineral.", tier: Tier.MASTER },
  { word: "VORTEX", hint: "Wirbelströmung.", tier: Tier.MASTER },
  { word: "ZENIT", hint: "Höchster Punkt.", tier: Tier.MASTER },
  { word: "UNIKAT", hint: "Einzigartiges Stück.", tier: Tier.MASTER },
  { word: "KOSMOS", hint: "Das Weltall.", tier: Tier.MASTER }
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

// Avatars List (DiceBear IDs) - Expanded
export const AVATARS = [
  "Felix", "Aneka", "Zack", "Midnight", "Shadow", "Cyber", "Neon", "Glitch",
  "Viper", "Echo", "Raven", "Blade", "Matrix", "Nova", "Rogue", "Titan",
  "Luna", "Sol", "Astra", "Orion", "Vega", "Sirius", "Altair", "Draco",
  "Phoenix", "Griffin", "Dragon", "Hydra", "Chimera", "Sphinx", "Golem", "Wraith"
];

// Rewards Mock Data
export const SEASON_REWARDS = Array.from({ length: 100 }, (_, i) => {
  const level = i + 1;
  const isPremium = level % 2 === 0;

  let freeReward = null;
  let premiumReward = null;

  // Free Track
  if (level % 5 === 0) {
    freeReward = { type: 'coins', amount: 500 };
  } else {
    freeReward = { type: 'coins', amount: 100 };
  }

  // Premium Track
  if (isPremium) {
    if (level % 10 === 0) {
      // Every 10 levels a new Avatar
      const avatarIndex = Math.floor(level / 10) % AVATARS.length;
      premiumReward = { type: 'item', name: `Avatar: ${AVATARS[avatarIndex]}`, value: AVATARS[avatarIndex] };
    } else {
      premiumReward = { type: 'coins', amount: 1000 };
    }
  }

  return {
    level,
    free: freeReward,
    premium: premiumReward
  };
});

// Shop Items
export const SHOP_ITEMS: ShopItem[] = [
  // Currency Packs (Real Money)
  {
    id: 'coins_small',
    type: 'currency',
    name: 'Pocket Change',
    cost: '4,99€',
    value: 500,
    currencyAmount: 500,
    isRealMoney: true,
    paypalLink: 'https://www.paypal.com/ncp/payment/5FZ6BJ9G8LGML'
  },
  {
    id: 'coins_med',
    type: 'currency',
    name: 'Mercenary Stash',
    cost: '9,99€',
    value: 1500,
    currencyAmount: 1500,
    isRealMoney: true,
    paypalLink: 'https://www.paypal.com/ncp/payment/JRPDA9NBVAV48'
  },
  {
    id: 'coins_large',
    type: 'currency',
    name: 'Corporate Fund',
    cost: '24,99€',
    value: 6000,
    currencyAmount: 6000,
    isRealMoney: true,
    paypalLink: 'https://www.paypal.com/ncp/payment/V9GJ535LYLFKU'
  },

  // Avatars (Costs Coins)
  { id: 'shop_avatar_1', type: 'avatar', name: 'Cyber Demon', cost: 500, value: 'CyberDemon' },
  { id: 'shop_avatar_2', type: 'avatar', name: 'Holo Girl', cost: 800, value: 'HoloGirl' },
  { id: 'shop_avatar_3', type: 'avatar', name: 'Mecha King', cost: 1200, value: 'MechaKing' },
  { id: 'shop_avatar_4', type: 'avatar', name: 'Void Stalker', cost: 2000, value: 'VoidStalker' },
  { id: 'shop_avatar_5', type: 'avatar', name: 'Neon Samurai', cost: 3000, value: 'NeonSamurai' },
  { id: 'shop_avatar_6', type: 'avatar', name: 'Quantum Ghost', cost: 5000, value: 'QuantumGhost' },
  { id: 'shop_avatar_7', type: 'avatar', name: 'Plasma Knight', cost: 7500, value: 'PlasmaKnight' },
  { id: 'shop_avatar_8', type: 'avatar', name: 'Nano Swarm', cost: 10000, value: 'NanoSwarm' },
];

// Premium Pass Plans (PayPal Subscriptions)
export const PREMIUM_PLANS = [
  {
    id: 'premium_monthly',
    name: 'Premium Pass (Monthly)',
    cost: '7,99€',
    planId: 'P-8TF71941064241357NEQDSMQ',
    duration: 'Monatlich wiederkehrend',
    levelBoost: 10,
    features: ['🎁 10 Stufen Sofort-Freischaltung', 'Exklusive Skins', 'Schnellere Hinweise', 'Goldener Name', 'Challenge Mode']
  },
  {
    id: 'premium_30days',
    name: 'Premium Pass (30 Tage)',
    cost: '4,99€',
    planId: 'P-92K66833DR200153NNEQEFLI',
    duration: '30 Tage',
    levelBoost: 0,
    features: ['Exklusive Skins', 'Schnellere Hinweise', 'Goldener Name', 'Challenge Mode', '⚡ Selbst hocharbeiten']
  }
];

export const VALID_CODES = [
  "LEXIMIX-JBXV-S6YA-FYKQ",
  "LEXIMIX-HT1J-ELJT-PBL6",
  "LEXIMIX-04JL-YB5F-WONX",
  "LEXIMIX-6G7F-A7W4-J006",
  "LEXIMIX-KUB4-061U-DR15",
  "LEXIMIX-NUYB-XI1M-91RS",
  "LEXIMIX-NBUY-18GN-EOBQ",
  "LEXIMIX-HPAI-SR9O-71HO",
  "LEXIMIX-7NTM-KPYP-RASU",
  "LEXIMIX-MZFN-0M1R-JGJW",
  "LEXIMIX-LKCW-Y709-2NZO",
  "LEXIMIX-JD0L-DDOQ-HP5I",
  "LEXIMIX-BTN5-OMZF-E68I",
  "LEXIMIX-I1C9-QSNY-KNU1",
  "LEXIMIX-RAFK-S9TS-KZ74",
  "LEXIMIX-NTBT-N5R2-4U3T",
  "LEXIMIX-VHXX-PYDI-0TP7",
  "LEXIMIX-T3DD-DYDC-IKSP",
  "LEXIMIX-SC9B-FOZD-P0EW",
  "LEXIMIX-4GBY-VMKA-2NZV",
  "LEXIMIX-MHSQ-MAIN-NAC3",
  "LEXIMIX-0AC5-5QCR-Z86A",
  "LEXIMIX-O115-X5CH-93QC",
  "LEXIMIX-JLKH-MDYH-5RBK",
  "LEXIMIX-JDWL-AGRL-6606",
  "LEXIMIX-RH2R-CN15-9WQ9",
  "LEXIMIX-X27F-FDJF-C8EC",
  "LEXIMIX-RY7J-V0LE-VQOY",
  "LEXIMIX-WCY0-QOCR-P3PL",
  "LEXIMIX-WC72-03TQ-0JB3"
];