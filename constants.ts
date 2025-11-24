import { Tier, GameMode, Language, TutorialContent, ShopItem, WordData, SeasonReward } from './types';

// ============================================================================
// APP CONSTANTS
// ============================================================================

export const APP_VERSION = '2.5.2';

// ============================================================================
// SEASON SYSTEM
// ============================================================================

export interface SeasonColors {
  primary: string;
  secondary: string;
  accent: string;
  bgDark: string;
  bgCard: string;
}

export interface SeasonAvatar {
  level: number;
  name: string;
  id: string;
  dicebear: string;
  desc: string;
}

export interface Season {
  id: number;
  name: string;
  theme: 'cyberpunk' | 'fantasy' | 'space' | 'nature';
  startDate: number;
  endDate: number;
  colors: SeasonColors;
  avatars: SeasonAvatar[];
}

// Season 1: Agent Training (Purple/Space Theme)
export const SEASON_1_AVATARS: SeasonAvatar[] = [
  { level: 10, name: 'Space Explorer', id: 'space_explorer', dicebear: 'SpaceExplorer', desc: 'Cosmic wanderer' },
  { level: 20, name: 'Cyberpunk Warrior', id: 'cyberpunk_warrior', dicebear: 'CyberpunkWarrior', desc: 'Neon fighter' },
  { level: 30, name: 'Fantasy Wizard', id: 'fantasy_wizard', dicebear: 'FantasyWizard', desc: 'Arcane master' },
  { level: 40, name: 'Ocean Guardian', id: 'ocean_guardian', dicebear: 'Ocean', desc: 'Deep sea protector' },
  { level: 50, name: 'Mountain Sage', id: 'mountain_sage', dicebear: 'Sage', desc: 'Ancient wisdom' },
  { level: 60, name: 'Forest Spirit', id: 'forest_spirit', dicebear: 'Spirit', desc: 'Nature voice' },
  { level: 70, name: 'Desert Nomad', id: 'desert_nomad', dicebear: 'Nomad', desc: 'Sand walker' },
  { level: 80, name: 'Arctic Hunter', id: 'arctic_hunter', dicebear: 'Hunter', desc: 'Ice stalker' },
  { level: 90, name: 'Lava Titan', id: 'lava_titan', dicebear: 'Titan', desc: 'Molten fury' },
  { level: 100, name: 'Storm Caller', id: 'storm_caller', dicebear: 'Storm', desc: 'Lightning master' }
];

// Season 2: Neon Uprising (Cyberpunk Theme) - UPDATED with Nano Banana Pro Style
export const SEASON_2_AVATARS: SeasonAvatar[] = [
  { level: 10, name: 'Nano Scout', id: 'nano_banana_pro_1', dicebear: 'nano_banana_pro_1', desc: 'Recon Unit' },
  { level: 20, name: 'Cyber Banana', id: 'nano_banana_pro_2', dicebear: 'nano_banana_pro_2', desc: 'Enhanced organic' },
  { level: 30, name: 'Neon Ape', id: 'nano_banana_pro_3', dicebear: 'nano_banana_pro_3', desc: 'City dweller' },
  { level: 40, name: 'Glitch Monkey', id: 'nano_banana_pro_4', dicebear: 'nano_banana_pro_4', desc: 'System error' },
  { level: 50, name: 'Mecha Kong', id: 'nano_banana_pro_5', dicebear: 'nano_banana_pro_5', desc: 'Heavy hitter' },
  { level: 60, name: 'Circuit Simian', id: 'nano_banana_pro_6', dicebear: 'nano_banana_pro_6', desc: 'Network flow' },
  { level: 70, name: 'Data Chimp', id: 'nano_banana_pro_7', dicebear: 'nano_banana_pro_7', desc: 'Info broker' },
  { level: 80, name: 'Void Primate', id: 'nano_banana_pro_8', dicebear: 'nano_banana_pro_8', desc: 'Dark sector' },
  { level: 90, name: 'Quantum Gorilla', id: 'nano_banana_pro_9', dicebear: 'nano_banana_pro_9', desc: 'Reality bender' },
  { level: 100, name: 'Nano Banana God', id: 'nano_banana_pro_10', dicebear: 'nano_banana_pro_10', desc: 'Ascended' }
];

export const SEASONS: Season[] = [
  {
    id: 1,
    name: 'Genesis',
    theme: 'space',
    startDate: Date.parse('2025-11-24T00:00:00Z'),
    endDate: Date.parse('2025-12-31T00:00:00Z'),
    colors: {
      primary: '#d946ef',
      secondary: '#a855f7',
      accent: '#3b82f6',
      bgDark: '#0f172a',
      bgCard: '#1e293b'
    },
    avatars: SEASON_1_AVATARS
  },
  {
    id: 2,
    name: 'Neon Uprising',
    theme: 'cyberpunk',
    startDate: Date.parse('2026-01-01T00:00:00Z'),
    endDate: Date.parse('2026-03-31T23:59:59Z'),
    colors: {
      primary: '#00ff9f',
      secondary: '#ff00ff',
      accent: '#00d4ff',
      bgDark: '#0a0e1a',
      bgCard: '#1a1f3a'
    },
    avatars: SEASON_2_AVATARS
  }
];

/**
 * Get the current active season based on current date
 * Falls back to the latest season if no active season found
 */
export const getCurrentSeason = (): Season => {
  const now = Date.now();
  const activeSeason = SEASONS.find(s => now >= s.startDate && now <= s.endDate);
  return activeSeason || SEASONS[SEASONS.length - 1]; // Default to latest season
};

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
      NAME_PLACEHOLDER: "Enter Name",
      AGE_TITLE: "VERIFY AGE",
      AGE_PLACEHOLDER: "Enter Age",
      CONTINUE: "CONTINUE",
      START: "INITIALIZE SYSTEM",
      ERR_NAME: "Max 20 characters",
      ERR_AGE: "Invalid age (1-120)"
    },
    HOME: {
      PLAYER: "Puzzle Pal",
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
      RIDDLE: { title: "RIDDLES", desc: "Word Puzzles" },
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
      INVALID_CODE: "Invalid Code",
      PREMIUM_REQUIRED: "Season Pass Required!",
      PREMIUM_OPTIONS: "PREMIUM PASS OPTIONS",
      VIEW_BENEFITS: "VIEW PREMIUM BENEFITS"
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
      HINT_COST_SUFFIX: "s Wait Time",
      INFO_BAR: "letters. Green = Correct.",
      ENTER_GUESS: "ENTER GUESS",
      LOST_TITLE: "MISSION FAILED",
      LOST_DESC: "GAME OVER",
      TARGET_ID: "TARGET IDENTIFIED",
      MENU: "MENU",
      RETRY: "RETRY",
      LEVEL_UP: "LEVEL UP"
    },
    TUTORIAL: {
      HEADER: "HOW TO PLAY",
      BACK: "BACK",
      START: "START GAME"
    },
    PROFILE: {
      TITLE: "PLAYER PROFILE",
      SAVE: "SAVE CHANGES",
      NAME: "NAME",
      AGE: "AGE",
      AVATAR: "SELECT AVATAR",
      DELETE_PROFILE: "DELETE PROFILE",
      AVATAR_HINT: "Click avatar to cycle through your owned collection"
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
    },
    UPDATES: {
      REQUIRED_TITLE: "UPDATE REQUIRED",
      REQUIRED_DESC: "Your version of LexiMix is outdated. You must update to continue playing.",
      INSTALLED: "INSTALLED",
      REQUIRED: "REQUIRED",
      UPDATE_NOW: "UPDATE NOW",
      WHATS_NEW: "What's new?",
      SECURITY: "SECURITY UPDATE",
      AVAILABLE_TITLE: "UPDATE AVAILABLE",
      NEW_VERSION: "New Version v",
      AVAILABLE_DESC_APP: "A new APK version is available. Download it for the latest features!",
      AVAILABLE_DESC_WEB: "LexiMix has been updated. Reload the app.",
      DOWNLOAD: "DOWNLOAD",
      RELOAD: "RELOAD",
      COOL: "AWESOME!",
      NOTES: "UPDATE NOTES"
    }
  },
  [Language.DE]: {
    ONBOARDING: {
      WELCOME: "WILLKOMMEN",
      SELECT_LANG: "SPRACHE WÄHLEN",
      NAME_TITLE: "IDENTIFIZIERUNG",
      NAME_PLACEHOLDER: "Name eingeben",
      AGE_TITLE: "ALTER VERIFIZIEREN",
      AGE_PLACEHOLDER: "Alter eingeben",
      CONTINUE: "WEITER",
      START: "SYSTEM INITIALISIEREN",
      ERR_NAME: "Max 20 Zeichen",
      ERR_AGE: "Ungültiges Alter (1-120)"
    },
    HOME: {
      PLAYER: "Rätselfreund",
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
      RIDDLE: { title: "RÄTSEL", desc: "Worträtsel" },
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
      INVALID_CODE: "Ungültiger Code",
      PREMIUM_REQUIRED: "Season Pass erforderlich!",
      PREMIUM_OPTIONS: "PREMIUM PASS OPTIONEN",
      VIEW_BENEFITS: "PREMIUM VORTEILE ANSEHEN"
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
      WIN_DESC: "Level abgeschlossen!",
      XP_GAINED: "XP GEWONNEN",
      COINS_GAINED: "MÜNZEN",
      NEXT_BTN: "NÄCHSTER LEVEL",
      PASS_BTN: "PASS ANSEHEN",
      HINT_MODAL_TITLE: "HINWEIS FREISCHALTEN",
      AD_SIM: "WERBEBEREICH\n(Simulation)",
      WATCHING: "SCHAUEN...",
      CLAIM: "HINWEIS HOLEN",
      REWARD: "BELOHNUNG BEREIT",
      HINT_COST_PREFIX: "+",
      HINT_COST_SUFFIX: "s Wartezeit",
      INFO_BAR: "Buchstaben. Grün = Richtig.",
      ENTER_GUESS: "LÖSUNG EINGEBEN",
      LOST_TITLE: "MISSION FEHLGESCHLAGEN",
      LOST_DESC: "SPIEL VORBEI",
      TARGET_ID: "ZIELWORT IDENTIFIZIERT",
      MENU: "MENÜ",
      RETRY: "NOCHMAL",
      LEVEL_UP: "LEVEL AUFSTIEG"
    },
    TUTORIAL: {
      HEADER: "SPIELANLEITUNG",
      BACK: "ZURÜCK",
      START: "SPIEL STARTEN"
    },
    PROFILE: {
      TITLE: "SPIELER PROFIL",
      SAVE: "SPEICHERN",
      NAME: "NAME",
      AGE: "ALTER",
      AVATAR: "AVATAR WÄHLEN",
      DELETE_PROFILE: "PROFIL LÖSCHEN",
      AVATAR_HINT: "Klicke auf den Avatar um durch deine Sammlung zu wechseln"
    },
    SHOP: {
      TITLE: "Marktplatz",
      CURRENCY_SECTION: "MÜNZPAKETE",
      AVATAR_SECTION: "AVATAR TERMINAL",
      BUY: "KAUFEN",
      OWNED: "BESITZ",
      EQUIP: "AUSRÜSTEN",
      EQUIPPED: "AUSGERÜSTET",
      INSUFFICIENT: "NICHT GENUG MÜNZEN",
      SUCCESS: "GEKAUFT"
    },
    UPDATES: {
      REQUIRED_TITLE: "Update Erforderlich",
      REQUIRED_DESC: "Deine Version von LexiMix ist veraltet. Du musst aktualisieren, um weiterzuspielen.",
      INSTALLED: "INSTALLIERT",
      REQUIRED: "BENÖTIGT",
      UPDATE_NOW: "JETZT AKTUALISIEREN",
      WHATS_NEW: "Was ist neu?",
      SECURITY: "SICHERHEITS-UPDATE",
      AVAILABLE_TITLE: "Update Verfügbar",
      NEW_VERSION: "Neue Version v",
      AVAILABLE_DESC_APP: "Eine neue APK-Version ist verfügbar. Lade sie herunter für die neuesten Features!",
      AVAILABLE_DESC_WEB: "LexiMix wurde aktualisiert. Lade die App neu.",
      DOWNLOAD: "HERUNTERLADEN",
      RELOAD: "NEU LADEN",
      COOL: "COOLE SACHE!",
      NOTES: "UPDATE NOTES"
    }
  },
  [Language.ES]: {
    ONBOARDING: {
      WELCOME: "BIENVENIDO",
      SELECT_LANG: "SELECCIONAR IDIOMA",
      NAME_TITLE: "IDENTIFÍCATE",
      NAME_PLACEHOLDER: "Ingresar nombre",
      AGE_TITLE: "VERIFICAR EDAD",
      AGE_PLACEHOLDER: "Ingresar edad",
      CONTINUE: "CONTINUAR",
      START: "INICIAR SISTEMA",
      ERR_NAME: "Máx 20 caracteres",
      ERR_AGE: "Edad inválida (1-120)"
    },
    HOME: {
      PLAYER: "Jugador",
      SEASON_LEVEL: "Nivel de Temporada",
      TAGLINE: "EL ENTRENAMIENTO DIARIO",
      LANG_BTN: "ESPAÑOL",
      PLAY: "JUGAR"
    },
    MODES: {
      CLASSIC: { title: "CLÁSICO", desc: "El Estándar" },
      SPEEDRUN: { title: "CONTRARRELOJ", desc: "Carrera contra el tiempo" },
      CHAIN: { title: "CADENA", desc: "Enlaza palabras" },
      CATEGORY: { title: "TEMAS", desc: "Basado en contexto" },
      SUDOKU: { title: "SUDOKU DE LETRAS", desc: "Lógica (A-I)" },
      CHALLENGE: { title: "DESAFÍO", desc: "Retos Premium" },
      RIDDLE: { title: "ACERTIJOS", desc: "Rompecabezas" },
      LOCKED: { title: "BLOQUEADO", desc: "Próximamente" }
    },
    SEASON: {
      TITLE: "TEMPORADA I: GÉNESIS",
      SUBTITLE: "PASE DE BATALLA",
      PREMIUM_ACTIVE: "PREMIUM ACTIVO",
      FREE_ACTIVE: "PASE GRATIS ACTIVO",
      GET_PREMIUM: "OBTENER PREMIUM",
      PREMIUM_DESC: "Desbloquea skins exclusivos, pistas más rápidas y nombre dorado.",
      UNLOCK_BTN: "DESBLOQUEAR 4,99€",
      LEVEL: "NIVEL",
      COINS: "Monedas",
      RARE_ITEM: "Objeto Raro",
      DAYS_LEFT: "DÍAS RESTANTES",
      REDEEM_CODE: "CANJEAR CÓDIGO",
      CODE_PLACEHOLDER: "Ingresar Código",
      INVALID_CODE: "Código Inválido",
      PREMIUM_REQUIRED: "¡Pase de Temporada Requerido!",
      PREMIUM_OPTIONS: "OPCIONES PASE PREMIUM",
      VIEW_BENEFITS: "VER BENEFICIOS PREMIUM"
    },
    LEVELS: {
      BACK: "VOLVER",
      TIERS: ["PRINCIPIANTE", "APRENDIZ", "HABILIDOSO", "EXPERTO", "MAESTRO"]
    },
    GAME: {
      HINT_TITLE: "PISTA",
      UNLOCK_HINT: "DESBLOQUEAR PISTA",
      SUDOKU_TITLE: "SUDOKU",
      CLASSIC_TITLE: "CLÁSICO",
      SUDOKU_DESC: "Rellena la cuadrícula",
      SPEEDRUN_DESC: "Tiempo Restante",
      WIN_TITLE: "VICTORIA",
      WIN_DESC: "¡Nivel Completado!",
      XP_GAINED: "XP GANADA",
      COINS_GAINED: "MONEDAS",
      NEXT_BTN: "SIGUIENTE NIVEL",
      PASS_BTN: "VER PASE",
      HINT_MODAL_TITLE: "DESBLOQUEAR PISTA",
      AD_SIM: "ESPACIO PUBLICITARIO\n(Simulación)",
      WATCHING: "VIENDO...",
      CLAIM: "RECLAMAR PISTA",
      REWARD: "RECOMPENSA LISTA",
      HINT_COST_PREFIX: "+",
      HINT_COST_SUFFIX: "s Tiempo de Espera",
      INFO_BAR: "letras. Verde = Correcto.",
      ENTER_GUESS: "INGRESAR",
      LOST_TITLE: "MISIÓN FALLIDA",
      LOST_DESC: "JUEGO TERMINADO",
      TARGET_ID: "OBJETIVO IDENTIFICADO",
      MENU: "MENÚ",
      RETRY: "REINTENTAR",
      LEVEL_UP: "SUBIDA DE NIVEL"
    },
    TUTORIAL: {
      HEADER: "CÓMO JUGAR",
      BACK: "VOLVER",
      START: "INICIAR JUEGO"
    },
    PROFILE: {
      TITLE: "PERFIL DE JUGADOR",
      SAVE: "GUARDAR CAMBIOS",
      NAME: "NOMBRE",
      AGE: "EDAD",
      AVATAR: "SELECCIONAR AVATAR",
      DELETE_PROFILE: "BORRAR PERFIL",
      AVATAR_HINT: "Haz clic en el avatar para ver tu colección"
    },
    SHOP: {
      TITLE: "MERCADO NEGRO",
      CURRENCY_SECTION: "PACKS DE MONEDAS",
      AVATAR_SECTION: "TERMINAL DE AVATARES",
      BUY: "COMPRAR",
      OWNED: "EN PROPIEDAD",
      EQUIP: "EQUIPAR",
      EQUIPPED: "EQUIPADO",
      INSUFFICIENT: "MONEDAS INSUFICIENTES",
      SUCCESS: "COMPRADO"
    },
    UPDATES: {
      REQUIRED_TITLE: "ACTUALIZACIÓN REQUERIDA",
      REQUIRED_DESC: "Tu versión de LexiMix está obsoleta. Debes actualizar para seguir jugando.",
      INSTALLED: "INSTALADO",
      REQUIRED: "REQUERIDO",
      UPDATE_NOW: "ACTUALIZAR AHORA",
      WHATS_NEW: "¿Qué hay de nuevo?",
      SECURITY: "ACTUALIZACIÓN DE SEGURIDAD",
      AVAILABLE_TITLE: "ACTUALIZACIÓN DISPONIBLE",
      NEW_VERSION: "Nueva Versión v",
      AVAILABLE_DESC_APP: "¡Nueva versión APK disponible. Descárgala para las últimas novedades!",
      AVAILABLE_DESC_WEB: "LexiMix se ha actualizado. Recarga la app.",
      DOWNLOAD: "DESCARGAR",
      RELOAD: "RECARGAR",
      COOL: "¡GENIAL!",
      NOTES: "NOTAS DE ACTUALIZACIÓN"
    }
  }
};

// Word Lists with Hints and Tiers
export const WORDS_EN: WordData[] = [
  // Beginner (Tier 1) - Common, simple words (50)
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
  { word: "CHAIR", hint: "Seat with a back.", tier: Tier.BEGINNER },
  { word: "TABLE", hint: "Furniture with a flat top.", tier: Tier.BEGINNER },
  { word: "LIGHT", hint: "Makes things visible.", tier: Tier.BEGINNER },
  { word: "RIVER", hint: "Large natural stream of water.", tier: Tier.BEGINNER },
  { word: "MONEY", hint: "Medium of exchange.", tier: Tier.BEGINNER },
  { word: "PAPER", hint: "Material for writing on.", tier: Tier.BEGINNER },
  { word: "CLOCK", hint: "Instrument to measure time.", tier: Tier.BEGINNER },
  { word: "HEART", hint: "Organ that pumps blood.", tier: Tier.BEGINNER },
  { word: "DREAM", hint: "Thoughts during sleep.", tier: Tier.BEGINNER },
  { word: "BEACH", hint: "Sandy shore by the sea.", tier: Tier.BEGINNER },
  { word: "CLOUD", hint: "White mass in the sky.", tier: Tier.BEGINNER },
  { word: "GRASS", hint: "Green ground cover.", tier: Tier.BEGINNER },
  { word: "SPOON", hint: "Utensil for eating soup.", tier: Tier.BEGINNER },
  { word: "TRAIN", hint: "Railway vehicle.", tier: Tier.BEGINNER },
  { word: "WORLD", hint: "The earth and all life.", tier: Tier.BEGINNER },
  { word: "PARTY", hint: "Social gathering.", tier: Tier.BEGINNER },
  { word: "PIZZA", hint: "Italian dish with cheese.", tier: Tier.BEGINNER },
  { word: "SHOES", hint: "Footwear.", tier: Tier.BEGINNER },
  { word: "TRUCK", hint: "Large vehicle for cargo.", tier: Tier.BEGINNER },
  { word: "WATCH", hint: "Small clock worn on wrist.", tier: Tier.BEGINNER },
  { word: "SPACE", hint: "Area beyond earth.", tier: Tier.BEGINNER },
  { word: "NURSE", hint: "Person who cares for sick.", tier: Tier.BEGINNER },
  { word: "STORE", hint: "Place to buy things.", tier: Tier.BEGINNER },
  { word: "TIGER", hint: "Large striped cat.", tier: Tier.BEGINNER },
  { word: "ZEBRA", hint: "Striped African horse.", tier: Tier.BEGINNER },
  { word: "LEMON", hint: "Sour yellow fruit.", tier: Tier.BEGINNER },
  { word: "MANGO", hint: "Tropical sweet fruit.", tier: Tier.BEGINNER },
  { word: "BERRY", hint: "Small juicy fruit.", tier: Tier.BEGINNER },
  { word: "SHEEP", hint: "Woolly farm animal.", tier: Tier.BEGINNER },
  { word: "HORSE", hint: "Large riding animal.", tier: Tier.BEGINNER },
  { word: "MOUSE", hint: "Small rodent or device.", tier: Tier.BEGINNER },
  { word: "SNAKE", hint: "Legless reptile.", tier: Tier.BEGINNER },
  { word: "WHALE", hint: "Large marine mammal.", tier: Tier.BEGINNER },
  { word: "SHARK", hint: "Predatory fish.", tier: Tier.BEGINNER },
  { word: "EAGLE", hint: "Large bird of prey.", tier: Tier.BEGINNER },
  { word: "ROBOT", hint: "Automated machine.", tier: Tier.BEGINNER },
  { word: "GHOST", hint: "Spirit of the dead.", tier: Tier.BEGINNER },
  { word: "MAGIC", hint: "Supernatural power.", tier: Tier.BEGINNER },
  { word: "QUEEN", hint: "Female ruler.", tier: Tier.BEGINNER },
  { word: "KINGS", hint: "Male rulers.", tier: Tier.BEGINNER },

  // Learner (Tier 2) - Slightly longer or less concrete (50)
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
  { word: "FOREST", hint: "Large area covered with trees.", tier: Tier.LEARNER },
  { word: "ISLAND", hint: "Land surrounded by water.", tier: Tier.LEARNER },
  { word: "DESERT", hint: "Dry, sandy region.", tier: Tier.LEARNER },
  { word: "OCEAN", hint: "Vast body of salt water.", tier: Tier.LEARNER },
  { word: "VALLEY", hint: "Low land between hills.", tier: Tier.LEARNER },
  { word: "BRIDGE", hint: "Structure over water.", tier: Tier.LEARNER },
  { word: "CASTLE", hint: "Large fortified building.", tier: Tier.LEARNER },
  { word: "OFFICE", hint: "Place for business work.", tier: Tier.LEARNER },
  { word: "STREET", hint: "Public road in a city.", tier: Tier.LEARNER },
  { word: "WINTER", hint: "Coldest season.", tier: Tier.LEARNER },
  { word: "SPRING", hint: "Season of rebirth.", tier: Tier.LEARNER },
  { word: "AUTUMN", hint: "Season of falling leaves.", tier: Tier.LEARNER },
  { word: "DINNER", hint: "Main meal of the day.", tier: Tier.LEARNER },
  { word: "FAMILY", hint: "Parents and children.", tier: Tier.LEARNER },
  { word: "PERSON", hint: "A human being.", tier: Tier.LEARNER },
  { word: "FARMER", hint: "Person who grows crops.", tier: Tier.LEARNER },
  { word: "DRIVER", hint: "Person who operates a car.", tier: Tier.LEARNER },
  { word: "ARTIST", hint: "Person who creates art.", tier: Tier.LEARNER },
  { word: "WRITER", hint: "Person who writes books.", tier: Tier.LEARNER },
  { word: "PLAYER", hint: "Participant in a game.", tier: Tier.LEARNER },
  { word: "LEADER", hint: "Person who commands.", tier: Tier.LEARNER },
  { word: "WINNER", hint: "Person who wins.", tier: Tier.LEARNER },
  { word: "SECOND", hint: "Unit of time.", tier: Tier.LEARNER },
  { word: "MINUTE", hint: "Sixty seconds.", tier: Tier.LEARNER },
  { word: "NUMBER", hint: "Arithmetical value.", tier: Tier.LEARNER },
  { word: "LETTER", hint: "Character of alphabet.", tier: Tier.LEARNER },
  { word: "SYMBOL", hint: "Mark or character.", tier: Tier.LEARNER },
  { word: "REASON", hint: "Cause or explanation.", tier: Tier.LEARNER },
  { word: "RESULT", hint: "Outcome of an action.", tier: Tier.LEARNER },
  { word: "ANSWER", hint: "Response to a question.", tier: Tier.LEARNER },
  { word: "DANGER", hint: "Possibility of harm.", tier: Tier.LEARNER },
  { word: "SAFETY", hint: "Condition of being safe.", tier: Tier.LEARNER },
  { word: "HEALTH", hint: "State of being well.", tier: Tier.LEARNER },
  { word: "WEALTH", hint: "Abundance of money.", tier: Tier.LEARNER },
  { word: "GROWTH", hint: "Process of growing.", tier: Tier.LEARNER },
  { word: "CHANGE", hint: "Make different.", tier: Tier.LEARNER },
  { word: "CHANCE", hint: "Possibility of something happening.", tier: Tier.LEARNER },
  { word: "CHOICE", hint: "Act of selecting.", tier: Tier.LEARNER },
  { word: "VOICE", hint: "Sound from the mouth.", tier: Tier.LEARNER },
  { word: "NOISE", hint: "Unpleasant sound.", tier: Tier.LEARNER },

  // Skilled (Tier 3) - Abstract concepts or technical terms (50)
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
  { word: "ACTION", hint: "Process of doing something.", tier: Tier.SKILLED },
  { word: "METHOD", hint: "Procedure for accomplishing.", tier: Tier.SKILLED },
  { word: "POLICY", hint: "Course of action adopted.", tier: Tier.SKILLED },
  { word: "SERIES", hint: "Number of things in order.", tier: Tier.SKILLED },
  { word: "STATUS", hint: "Social or professional standing.", tier: Tier.SKILLED },
  { word: "VISION", hint: "Faculty or state of being able to see.", tier: Tier.SKILLED },
  { word: "VOLUME", hint: "Amount of space occupied.", tier: Tier.SKILLED },
  { word: "ACCESS", hint: "Means of approaching.", tier: Tier.SKILLED },
  { word: "ADVICE", hint: "Guidance or recommendations.", tier: Tier.SKILLED },
  { word: "AMOUNT", hint: "Quantity of something.", tier: Tier.SKILLED },
  { word: "ATTACK", hint: "Aggressive action.", tier: Tier.SKILLED },
  { word: "AUTHOR", hint: "Writer of a book.", tier: Tier.SKILLED },
  { word: "BASKET", hint: "Container used to hold or carry.", tier: Tier.SKILLED },
  { word: "BUDGET", hint: "Estimate of income and expenditure.", tier: Tier.SKILLED },
  { word: "BUTTON", hint: "Small disc to fasten clothes.", tier: Tier.SKILLED },
  { word: "CAMERA", hint: "Device for taking photos.", tier: Tier.SKILLED },
  { word: "CANYON", hint: "Deep gorge.", tier: Tier.SKILLED },
  { word: "CAREER", hint: "Occupation undertaken for life.", tier: Tier.SKILLED },
  { word: "CENTER", hint: "Middle point.", tier: Tier.SKILLED },
  { word: "CLIENT", hint: "Person using services.", tier: Tier.SKILLED },
  { word: "CLIMATE", hint: "Weather conditions.", tier: Tier.SKILLED },
  { word: "COFFEE", hint: "Hot drink from beans.", tier: Tier.SKILLED },
  { word: "COLUMN", hint: "Upright pillar.", tier: Tier.SKILLED },
  { word: "COMMON", hint: "Occurring often.", tier: Tier.SKILLED },
  { word: "COUNTY", hint: "Territorial division.", tier: Tier.SKILLED },
  { word: "COUPLE", hint: "Two people or things.", tier: Tier.SKILLED },
  { word: "COURSE", hint: "Direction or route.", tier: Tier.SKILLED },
  { word: "CREDIT", hint: "Ability to obtain goods.", tier: Tier.SKILLED },
  { word: "CUSTOM", hint: "Traditional way of behaving.", tier: Tier.SKILLED },
  { word: "DAMAGE", hint: "Physical harm.", tier: Tier.SKILLED },
  { word: "DEBATE", hint: "Formal discussion.", tier: Tier.SKILLED },
  { word: "DEGREE", hint: "Unit of measurement.", tier: Tier.SKILLED },
  { word: "DEVICE", hint: "Thing made for a purpose.", tier: Tier.SKILLED },
  { word: "DIET", hint: "Kinds of food eaten.", tier: Tier.SKILLED },
  { word: "DIRECT", hint: "Extending in a straight line.", tier: Tier.SKILLED },
  { word: "DOUBLE", hint: "Consisting of two parts.", tier: Tier.SKILLED },
  { word: "EDITOR", hint: "Person who edits.", tier: Tier.SKILLED },
  { word: "EFFECT", hint: "Change that is a result.", tier: Tier.SKILLED },
  { word: "EFFORT", hint: "Vigorous or determined attempt.", tier: Tier.SKILLED },
  { word: "ENGINE", hint: "Machine with moving parts.", tier: Tier.SKILLED },

  // Expert (Tier 4) - Specific, scientific, or complex (50)
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
  { word: "ACIDITY", hint: "Level of acid.", tier: Tier.EXPERT },
  { word: "ADDRESS", hint: "Particulars of place.", tier: Tier.EXPERT },
  { word: "AIRPORT", hint: "Complex for aircraft.", tier: Tier.EXPERT },
  { word: "ANALYST", hint: "Person who analyzes.", tier: Tier.EXPERT },
  { word: "ANXIETY", hint: "Feeling of worry.", tier: Tier.EXPERT },
  { word: "ARCHIVE", hint: "Collection of historical records.", tier: Tier.EXPERT },
  { word: "ARTICLE", hint: "Piece of writing.", tier: Tier.EXPERT },
  { word: "ASSAULT", hint: "Physical attack.", tier: Tier.EXPERT },
  { word: "AUCTION", hint: "Public sale.", tier: Tier.EXPERT },
  { word: "BALANCE", hint: "Even distribution of weight.", tier: Tier.EXPERT },
  { word: "BATTERY", hint: "Container for power.", tier: Tier.EXPERT },
  { word: "BLANKET", hint: "Large piece of woolen material.", tier: Tier.EXPERT },
  { word: "CABINET", hint: "Cupboard with shelves.", tier: Tier.EXPERT },
  { word: "CAPTAIN", hint: "Person in command.", tier: Tier.EXPERT },
  { word: "CENTURY", hint: "Period of one hundred years.", tier: Tier.EXPERT },
  { word: "CHAMBER", hint: "Large room.", tier: Tier.EXPERT },
  { word: "CHARITY", hint: "Voluntary giving of help.", tier: Tier.EXPERT },
  { word: "CHICKEN", hint: "Domestic fowl.", tier: Tier.EXPERT },
  { word: "CIRCUIT", hint: "Roughly circular line.", tier: Tier.EXPERT },
  { word: "CLASSES", hint: "Groups of students.", tier: Tier.EXPERT },
  { word: "CLUSTER", hint: "Group of similar things.", tier: Tier.EXPERT },
  { word: "COLLEGE", hint: "Educational institution.", tier: Tier.EXPERT },
  { word: "COMFORT", hint: "State of physical ease.", tier: Tier.EXPERT },
  { word: "COMMAND", hint: "Give an authoritative order.", tier: Tier.EXPERT },
  { word: "COMPANY", hint: "Commercial business.", tier: Tier.EXPERT },
  { word: "CONCEPT", hint: "Abstract idea.", tier: Tier.EXPERT },
  { word: "CONCERN", hint: "Anxiety; worry.", tier: Tier.EXPERT },
  { word: "CONCERT", hint: "Musical performance.", tier: Tier.EXPERT },
  { word: "CONDUCT", hint: "Manner in which person behaves.", tier: Tier.EXPERT },
  { word: "CONFIRM", hint: "Establish the truth.", tier: Tier.EXPERT },
  { word: "CONNECT", hint: "Bring together.", tier: Tier.EXPERT },
  { word: "CONSENT", hint: "Permission for something.", tier: Tier.EXPERT },
  { word: "CONSIST", hint: "Be composed or made up of.", tier: Tier.EXPERT },
  { word: "CONTACT", hint: "State of physical touching.", tier: Tier.EXPERT },
  { word: "CONTAIN", hint: "Have or hold within.", tier: Tier.EXPERT },
  { word: "CONTENT", hint: "State of satisfaction.", tier: Tier.EXPERT },
  { word: "CONTEST", hint: "Event where people compete.", tier: Tier.EXPERT },
  { word: "CONTEXT", hint: "Circumstances of an event.", tier: Tier.EXPERT },
  { word: "CONTROL", hint: "Power to influence.", tier: Tier.EXPERT },
  { word: "CONVERT", hint: "Change into different form.", tier: Tier.EXPERT },

  // Master (Tier 5) - Obscure, long, or very specific (50)
  { word: "ZEPHYR", hint: "A soft gentle breeze.", tier: Tier.MASTER },
  { word: "QUARTZ", hint: "Hard mineral of silica.", tier: Tier.MASTER },
  { word: "VORTEX", hint: "Mass of whirling fluid.", tier: Tier.MASTER },
  { word: "CRYPTIC", hint: "Having a meaning that is mysterious.", tier: Tier.MASTER },
  { word: "JINXED", hint: "Bring bad luck to.", tier: Tier.MASTER },
  { word: "SPHINX", hint: "Mythical creature with riddles.", tier: Tier.MASTER },
  { word: "RHYTHM", hint: "Strong, regular repeated pattern.", tier: Tier.MASTER },
  { word: "OXYGEN", hint: "Life-supporting gas.", tier: Tier.MASTER },
  { word: "UNIQUE", hint: "Being the only one of its kind.", tier: Tier.MASTER },
  { word: "ZENITH", hint: "The time at which something is most powerful.", tier: Tier.MASTER },
  { word: "ABSOLUTE", hint: "Not qualified or diminished.", tier: Tier.MASTER },
  { word: "ABSTRACT", hint: "Existing in thought.", tier: Tier.MASTER },
  { word: "ACADEMIC", hint: "Relating to education.", tier: Tier.MASTER },
  { word: "ACCIDENT", hint: "Unfortunate incident.", tier: Tier.MASTER },
  { word: "ACCURACY", hint: "Quality of being correct.", tier: Tier.MASTER },
  { word: "ACTIVITY", hint: "Condition in which things are happening.", tier: Tier.MASTER },
  { word: "ADJACENT", hint: "Next to or adjoining.", tier: Tier.MASTER },
  { word: "ADVOCATE", hint: "Person who publicly supports.", tier: Tier.MASTER },
  { word: "AIRCRAFT", hint: "Machine capable of flight.", tier: Tier.MASTER },
  { word: "ALLIANCE", hint: "Union formed for mutual benefit.", tier: Tier.MASTER },
  { word: "ALUMINUM", hint: "Light silvery-gray metal.", tier: Tier.MASTER },
  { word: "AMBITION", hint: "Strong desire to do.", tier: Tier.MASTER },
  { word: "ANALYSIS", hint: "Detailed examination.", tier: Tier.MASTER },
  { word: "ANCESTOR", hint: "Person from whom one is descended.", tier: Tier.MASTER },
  { word: "ANYWHERE", hint: "In or to any place.", tier: Tier.MASTER },
  { word: "APPARENT", hint: "Clearly visible or understood.", tier: Tier.MASTER },
  { word: "APPENDIX", hint: "Supplementary material.", tier: Tier.MASTER },
  { word: "APPROACH", hint: "Come near or nearer to.", tier: Tier.MASTER },
  { word: "APPROVAL", hint: "Action of approving.", tier: Tier.MASTER },
  { word: "ARGUMENT", hint: "Exchange of diverging views.", tier: Tier.MASTER },
  { word: "ARTISTIC", hint: "Having natural creative skill.", tier: Tier.MASTER },
  { word: "ASSEMBLY", hint: "Group of people gathered.", tier: Tier.MASTER },
  { word: "ATHLETIC", hint: "Physically strong, fit.", tier: Tier.MASTER },
  { word: "ATTITUDE", hint: "Settled way of thinking.", tier: Tier.MASTER },
  { word: "ATTORNEY", hint: "Person appointed to act for another.", tier: Tier.MASTER },
  { word: "AUDIENCE", hint: "Assembled spectators.", tier: Tier.MASTER },
  { word: "BACKWARD", hint: "Directed behind.", tier: Tier.MASTER },
  { word: "BACTERIA", hint: "Microscopic organisms.", tier: Tier.MASTER },
  { word: "BASEBALL", hint: "Ball game played with bat.", tier: Tier.MASTER },
  { word: "BASEMENT", hint: "Floor of a building below ground.", tier: Tier.MASTER },
  { word: "BATHROOM", hint: "Room with toilet and bath.", tier: Tier.MASTER },
  { word: "BECOMING", hint: "Process of coming to be.", tier: Tier.MASTER },
  { word: "BEHAVIOR", hint: "Way in which one acts.", tier: Tier.MASTER },
  { word: "BIRTHDAY", hint: "Anniversary of birth.", tier: Tier.MASTER },
  { word: "BOUNDARY", hint: "Line that marks limits.", tier: Tier.MASTER },
  { word: "BUILDING", hint: "Structure with roof and walls.", tier: Tier.MASTER },
  { word: "BUSINESS", hint: "Person's regular occupation.", tier: Tier.MASTER },
  { word: "CALENDAR", hint: "Chart showing days.", tier: Tier.MASTER },
  { word: "CAMPAIGN", hint: "Series of military operations.", tier: Tier.MASTER },
  { word: "CAPACITY", hint: "Maximum amount that can be contained.", tier: Tier.MASTER }
];

export const WORDS_DE: WordData[] = [
  // Beginner (Tier 1) - Common, simple words (50)
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
  { word: "BAUM", hint: "Große Pflanze mit Stamm.", tier: Tier.BEGINNER },
  { word: "BUCH", hint: "Seiten zum Lesen.", tier: Tier.BEGINNER },
  { word: "BROT", hint: "Gebackenes Nahrungsmittel.", tier: Tier.BEGINNER },
  { word: "FISCH", hint: "Tier im Wasser.", tier: Tier.BEGINNER },
  { word: "GELD", hint: "Zahlungsmittel.", tier: Tier.BEGINNER },
  { word: "GLAS", hint: "Durchsichtiges Material.", tier: Tier.BEGINNER },
  { word: "GRAS", hint: "Grüne Pflanze am Boden.", tier: Tier.BEGINNER },
  { word: "HAND", hint: "Körperteil zum Greifen.", tier: Tier.BEGINNER },
  { word: "HERZ", hint: "Organ für Blutkreislauf.", tier: Tier.BEGINNER },
  { word: "HUND", hint: "Bester Freund des Menschen.", tier: Tier.BEGINNER },
  { word: "INSEL", hint: "Land im Wasser.", tier: Tier.BEGINNER },
  { word: "KIND", hint: "Junger Mensch.", tier: Tier.BEGINNER },
  { word: "KOPF", hint: "Oberster Körperteil.", tier: Tier.BEGINNER },
  { word: "LAMPE", hint: "Spendet Licht.", tier: Tier.BEGINNER },
  { word: "LICHT", hint: "Gegenteil von Dunkelheit.", tier: Tier.BEGINNER },
  { word: "LIED", hint: "Gesungenes Musikstück.", tier: Tier.BEGINNER },
  { word: "MAUS", hint: "Kleines Nagetier.", tier: Tier.BEGINNER },
  { word: "MOND", hint: "Trabant der Erde.", tier: Tier.BEGINNER },
  { word: "NACHT", hint: "Zeit der Dunkelheit.", tier: Tier.BEGINNER },
  { word: "NASE", hint: "Riechorgan.", tier: Tier.BEGINNER },
  { word: "OBST", hint: "Früchte zum Essen.", tier: Tier.BEGINNER },
  { word: "OFEN", hint: "Gerät zum Backen.", tier: Tier.BEGINNER },
  { word: "PARK", hint: "Grünanlage in der Stadt.", tier: Tier.BEGINNER },
  { word: "PFERD", hint: "Reittier.", tier: Tier.BEGINNER },
  { word: "PILZ", hint: "Wächst im Wald.", tier: Tier.BEGINNER },
  { word: "RING", hint: "Schmuck für den Finger.", tier: Tier.BEGINNER },
  { word: "ROSE", hint: "Blume mit Dornen.", tier: Tier.BEGINNER },
  { word: "SALZ", hint: "Gewürz, weiß.", tier: Tier.BEGINNER },
  { word: "SCHUH", hint: "Kleidung für den Fuß.", tier: Tier.BEGINNER },
  { word: "SEIFE", hint: "Zum Waschen.", tier: Tier.BEGINNER },
  { word: "SOFA", hint: "Bequemes Sitzmöbel.", tier: Tier.BEGINNER },
  { word: "STADT", hint: "Große Siedlung.", tier: Tier.BEGINNER },
  { word: "STERN", hint: "Leuchtet am Nachthimmel.", tier: Tier.BEGINNER },
  { word: "TAG", hint: "Zeit des Lichts.", tier: Tier.BEGINNER },
  { word: "TANTE", hint: "Schwester der Mutter.", tier: Tier.BEGINNER },
  { word: "UHR", hint: "Zeigt die Zeit an.", tier: Tier.BEGINNER },
  { word: "VATER", hint: "Männliches Elternteil.", tier: Tier.BEGINNER },
  { word: "WALD", hint: "Viele Bäume.", tier: Tier.BEGINNER },
  { word: "WAND", hint: "Teil eines Raumes.", tier: Tier.BEGINNER },
  { word: "WEG", hint: "Pfad zum Gehen.", tier: Tier.BEGINNER },

  // Learner (Tier 2) - Slightly longer or less concrete (50)
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
  { word: "ABEND", hint: "Ende des Tages.", tier: Tier.LEARNER },
  { word: "AMPEL", hint: "Verkehrszeichen mit Licht.", tier: Tier.LEARNER },
  { word: "ANGST", hint: "Gefühl der Bedrohung.", tier: Tier.LEARNER },
  { word: "ARBEIT", hint: "Tätigkeit gegen Lohn.", tier: Tier.LEARNER },
  { word: "AUGEN", hint: "Sehorgane.", tier: Tier.LEARNER },
  { word: "AUTO", hint: "Kraftfahrzeug.", tier: Tier.LEARNER },
  { word: "BADEN", hint: "Im Wasser waschen.", tier: Tier.LEARNER },
  { word: "BANANE", hint: "Gelbe, krumme Frucht.", tier: Tier.LEARNER },
  { word: "BERUF", hint: "Erlernte Tätigkeit.", tier: Tier.LEARNER },
  { word: "BILD", hint: "Gemälde oder Foto.", tier: Tier.LEARNER },
  { word: "BLATT", hint: "Teil einer Pflanze.", tier: Tier.LEARNER },
  { word: "BLAU", hint: "Farbe des Himmels.", tier: Tier.LEARNER },
  { word: "BRIEF", hint: "Schriftliche Nachricht.", tier: Tier.LEARNER },
  { word: "BRILLE", hint: "Sehhilfe.", tier: Tier.LEARNER },
  { word: "DACH", hint: "Oberster Teil des Hauses.", tier: Tier.LEARNER },
  { word: "DANKE", hint: "Wort des Dankes.", tier: Tier.LEARNER },
  { word: "DATUM", hint: "Kalenderangabe.", tier: Tier.LEARNER },
  { word: "DAUER", hint: "Zeitspanne.", tier: Tier.LEARNER },
  { word: "DECKE", hint: "Wärmt im Bett.", tier: Tier.LEARNER },
  { word: "DORF", hint: "Kleine Siedlung.", tier: Tier.LEARNER },
  { word: "DURST", hint: "Verlangen zu trinken.", tier: Tier.LEARNER },
  { word: "ELTERN", hint: "Vater und Mutter.", tier: Tier.LEARNER },
  { word: "ENDE", hint: "Schluss von etwas.", tier: Tier.LEARNER },
  { word: "ERDE", hint: "Unser Planet.", tier: Tier.LEARNER },
  { word: "ESSEN", hint: "Nahrung aufnehmen.", tier: Tier.LEARNER },
  { word: "EULE", hint: "Nachtaktiver Vogel.", tier: Tier.LEARNER },
  { word: "FAHRT", hint: "Reise mit Fahrzeug.", tier: Tier.LEARNER },
  { word: "FALL", hint: "Sturz nach unten.", tier: Tier.LEARNER },
  { word: "FEUER", hint: "Heiß und leuchtend.", tier: Tier.LEARNER },
  { word: "FILM", hint: "Bewegte Bilder.", tier: Tier.LEARNER },
  { word: "FLUSS", hint: "Fließendes Gewässer.", tier: Tier.LEARNER },
  { word: "FRAGE", hint: "Verlangt eine Antwort.", tier: Tier.LEARNER },
  { word: "FRAU", hint: "Weiblicher Mensch.", tier: Tier.LEARNER },
  { word: "GABEL", hint: "Besteck zum Aufspießen.", tier: Tier.LEARNER },
  { word: "GAST", hint: "Besucher.", tier: Tier.LEARNER },
  { word: "GEBEN", hint: "Jemandem etwas reichen.", tier: Tier.LEARNER },
  { word: "GEHEN", hint: "Sich zu Fuß bewegen.", tier: Tier.LEARNER },
  { word: "GRUEN", hint: "Farbe der Hoffnung.", tier: Tier.LEARNER },
  { word: "HAARE", hint: "Wachsen auf dem Kopf.", tier: Tier.LEARNER },
  { word: "HALLO", hint: "Grußwort.", tier: Tier.LEARNER },

  // Skilled (Tier 3) - Abstract concepts or technical terms (50)
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
  { word: "ABLAUF", hint: "Reihenfolge von Ereignissen.", tier: Tier.SKILLED },
  { word: "ABSATZ", hint: "Teil eines Textes.", tier: Tier.SKILLED },
  { word: "ABSICHT", hint: "Gewolltes Ziel.", tier: Tier.SKILLED },
  { word: "ACHTUNG", hint: "Respekt oder Vorsicht.", tier: Tier.SKILLED },
  { word: "AKTION", hint: "Handlung oder Tat.", tier: Tier.SKILLED },
  { word: "ALLTAG", hint: "Gewohnter Tagesablauf.", tier: Tier.SKILLED },
  { word: "ANFANG", hint: "Beginn von etwas.", tier: Tier.SKILLED },
  { word: "ANGEBOT", hint: "Vorschlag zum Kauf.", tier: Tier.SKILLED },
  { word: "ANLAGE", hint: "Investition oder Park.", tier: Tier.SKILLED },
  { word: "ANRUF", hint: "Telefonat.", tier: Tier.SKILLED },
  { word: "ANSATZ", hint: "Herangehensweise.", tier: Tier.SKILLED },
  { word: "ANWALT", hint: "Rechtsbeistand.", tier: Tier.SKILLED },
  { word: "ANZAHL", hint: "Menge.", tier: Tier.SKILLED },
  { word: "ARBEIT", hint: "Berufliche Tätigkeit.", tier: Tier.SKILLED },
  { word: "ARMUT", hint: "Mangel an Geld.", tier: Tier.SKILLED },
  { word: "ARTIKEL", hint: "Wortart oder Zeitungsbericht.", tier: Tier.SKILLED },
  { word: "AUFBAU", hint: "Struktur oder Konstruktion.", tier: Tier.SKILLED },
  { word: "AUFGABE", hint: "Zu erledigende Arbeit.", tier: Tier.SKILLED },
  { word: "AUFTRAG", hint: "Bestellung einer Leistung.", tier: Tier.SKILLED },
  { word: "AUSGABE", hint: "Kosten oder Edition.", tier: Tier.SKILLED },
  { word: "AUSSAGE", hint: "Behauptung oder Statement.", tier: Tier.SKILLED },
  { word: "AUSWAHL", hint: "Selektion.", tier: Tier.SKILLED },
  { word: "BAHNHOF", hint: "Station für Züge.", tier: Tier.SKILLED },
  { word: "BANKER", hint: "Arbeitet mit Geld.", tier: Tier.SKILLED },
  { word: "BAUER", hint: "Landwirt.", tier: Tier.SKILLED },
  { word: "BEAMTE", hint: "Staatsdiener.", tier: Tier.SKILLED },
  { word: "BEDARF", hint: "Notwendigkeit.", tier: Tier.SKILLED },
  { word: "BEGINN", hint: "Start.", tier: Tier.SKILLED },
  { word: "BEGRIFF", hint: "Wort oder Konzept.", tier: Tier.SKILLED },
  { word: "BEITRAG", hint: "Spende oder Artikel.", tier: Tier.SKILLED },
  { word: "BERICHT", hint: "Schilderung von Ereignissen.", tier: Tier.SKILLED },
  { word: "BETRAG", hint: "Geldsumme.", tier: Tier.SKILLED },
  { word: "BETRIEB", hint: "Firma oder Unternehmen.", tier: Tier.SKILLED },
  { word: "BEWEIS", hint: "Beleg für Wahrheit.", tier: Tier.SKILLED },
  { word: "BILANZ", hint: "Gegenüberstellung von Werten.", tier: Tier.SKILLED },
  { word: "BILDUNG", hint: "Schulung und Wissen.", tier: Tier.SKILLED },
  { word: "BINDUNG", hint: "Zusammenhalt.", tier: Tier.SKILLED },
  { word: "BITTE", hint: "Höfliches Ersuchen.", tier: Tier.SKILLED },
  { word: "BLICK", hint: "Augenaufschlag.", tier: Tier.SKILLED },
  { word: "BODEN", hint: "Untergrund.", tier: Tier.SKILLED },

  // Expert (Tier 4) - Specific, scientific, or complex (50)
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
  { word: "ABKOMMEN", hint: "Vertrag oder Vereinbarung.", tier: Tier.EXPERT },
  { word: "ABSCHIED", hint: "Trennung von Personen.", tier: Tier.EXPERT },
  { word: "ABSCHLUSS", hint: "Ende oder Examen.", tier: Tier.EXPERT },
  { word: "ABSTAND", hint: "Distanz.", tier: Tier.EXPERT },
  { word: "ABTEILUNG", hint: "Sektor einer Firma.", tier: Tier.EXPERT },
  { word: "ADRESSE", hint: "Wohnortangabe.", tier: Tier.EXPERT },
  { word: "AGENTUR", hint: "Dienstleistungsfirma.", tier: Tier.EXPERT },
  { word: "AKTIVITAET", hint: "Tätigkeit.", tier: Tier.EXPERT },
  { word: "ALKOHOL", hint: "Berauschende Flüssigkeit.", tier: Tier.EXPERT },
  { word: "ALLIANZ", hint: "Bündnis.", tier: Tier.EXPERT },
  { word: "ANALYSE", hint: "Untersuchung.", tier: Tier.EXPERT },
  { word: "ANBIETER", hint: "Verkäufer einer Leistung.", tier: Tier.EXPERT },
  { word: "ANGEBOT", hint: "Offerte.", tier: Tier.EXPERT },
  { word: "ANGRIFF", hint: "Attacke.", tier: Tier.EXPERT },
  { word: "ANHANG", hint: "Beigefügtes Dokument.", tier: Tier.EXPERT },
  { word: "ANLASS", hint: "Grund oder Gelegenheit.", tier: Tier.EXPERT },
  { word: "ANMELDUNG", hint: "Registrierung.", tier: Tier.EXPERT },
  { word: "ANSPRUCH", hint: "Forderung oder Recht.", tier: Tier.EXPERT },
  { word: "ANSTALT", hint: "Institution.", tier: Tier.EXPERT },
  { word: "ANTEIL", hint: "Part oder Stück.", tier: Tier.EXPERT },
  { word: "ANTRAG", hint: "Gesuch.", tier: Tier.EXPERT },
  { word: "ANTWORT", hint: "Reaktion auf Frage.", tier: Tier.EXPERT },
  { word: "ANZEIGE", hint: "Inserat oder Meldung.", tier: Tier.EXPERT },
  { word: "APOTHEKE", hint: "Verkauft Medikamente.", tier: Tier.EXPERT },
  { word: "APPARAT", hint: "Gerät oder Maschine.", tier: Tier.EXPERT },
  { word: "ARGUMENT", hint: "Beweisgrund.", tier: Tier.EXPERT },
  { word: "ASPEKT", hint: "Gesichtspunkt.", tier: Tier.EXPERT },
  { word: "ATEMZUG", hint: "Luftholen.", tier: Tier.EXPERT },
  { word: "AUFGABE", hint: "Mission.", tier: Tier.EXPERT },
  { word: "AUFLAGE", hint: "Anzahl gedruckter Exemplare.", tier: Tier.EXPERT },
  { word: "AUFNAHME", hint: "Foto oder Empfang.", tier: Tier.EXPERT },
  { word: "AUFRUF", hint: "Appell.", tier: Tier.EXPERT },
  { word: "AUFSTIEG", hint: "Weg nach oben.", tier: Tier.EXPERT },
  { word: "AUFTRITT", hint: "Darbietung auf Bühne.", tier: Tier.EXPERT },
  { word: "AUFWAND", hint: "Einsatz von Mitteln.", tier: Tier.EXPERT },
  { word: "AUGENBLICK", hint: "Kurzer Moment.", tier: Tier.EXPERT },
  { word: "AUSDRUCK", hint: "Formulierung oder Print.", tier: Tier.EXPERT },
  { word: "AUSFLUG", hint: "Kurze Reise.", tier: Tier.EXPERT },
  { word: "AUSGANG", hint: "Weg nach draußen.", tier: Tier.EXPERT },
  { word: "AUSKUNFT", hint: "Information.", tier: Tier.EXPERT },

  // Master (Tier 5) - Obscure, long, or very specific (50)
  { word: "PHYSIK", hint: "Lehre von Materie.", tier: Tier.MASTER },
  { word: "ZYKLUS", hint: "Kreislauf.", tier: Tier.MASTER },
  { word: "SPHAERE", hint: "Kugel oder Bereich.", tier: Tier.MASTER },
  { word: "MYSTIK", hint: "Geheimnisvolle Lehre.", tier: Tier.MASTER },
  { word: "RHYTHMUS", hint: "Gleichmäßige Wiederkehr.", tier: Tier.MASTER },
  { word: "QUARZ", hint: "Häufiges Mineral.", tier: Tier.MASTER },
  { word: "VORTEX", hint: "Wirbelströmung.", tier: Tier.MASTER },
  { word: "ZENIT", hint: "Höchster Punkt.", tier: Tier.MASTER },
  { word: "UNIKAT", hint: "Einzigartiges Stück.", tier: Tier.MASTER },
  { word: "KOSMOS", hint: "Das Weltall.", tier: Tier.MASTER },
  { word: "ABENTEUER", hint: "Spannendes Erlebnis.", tier: Tier.MASTER },
  { word: "ABNEIGUNG", hint: "Widerwille.", tier: Tier.MASTER },
  { word: "ABSCHNITT", hint: "Teil eines Ganzen.", tier: Tier.MASTER },
  { word: "ABSOLVENT", hint: "Jemand der fertig studiert hat.", tier: Tier.MASTER },
  { word: "ABSTIEG", hint: "Weg nach unten.", tier: Tier.MASTER },
  { word: "ABTEILUNG", hint: "Sektion.", tier: Tier.MASTER },
  { word: "ABWECHSLUNG", hint: "Veränderung.", tier: Tier.MASTER },
  { word: "ABWESENHEIT", hint: "Nicht da sein.", tier: Tier.MASTER },
  { word: "ACHTUNG", hint: "Vorsicht.", tier: Tier.MASTER },
  { word: "AEHNLICHKEIT", hint: "Gleichheit in Merkmalen.", tier: Tier.MASTER },
  { word: "AENDERUNG", hint: "Modifikation.", tier: Tier.MASTER },
  { word: "AERGERNIS", hint: "Grund zur Verärgerung.", tier: Tier.MASTER },
  { word: "AGGRESSION", hint: "Angriffslust.", tier: Tier.MASTER },
  { word: "AKTIVITAET", hint: "Tatendrang.", tier: Tier.MASTER },
  { word: "AKTUALITAET", hint: "Neuheit.", tier: Tier.MASTER },
  { word: "AKZEPTANZ", hint: "Annahme.", tier: Tier.MASTER },
  { word: "ALBTRAUM", hint: "Schlechter Traum.", tier: Tier.MASTER },
  { word: "ALLERGIE", hint: "Überempfindlichkeit.", tier: Tier.MASTER },
  { word: "ALLGEMEIN", hint: "Generell.", tier: Tier.MASTER },
  { word: "ALPHABET", hint: "Buchstabenfolge.", tier: Tier.MASTER },
  { word: "ALTERNATIVE", hint: "Andere Möglichkeit.", tier: Tier.MASTER },
  { word: "ALTERTUM", hint: "Antike Zeit.", tier: Tier.MASTER },
  { word: "AMBIENTE", hint: "Umgebung/Atmosphäre.", tier: Tier.MASTER },
  { word: "AMBITION", hint: "Ehrgeiz.", tier: Tier.MASTER },
  { word: "AMBULANZ", hint: "Notfallaufnahme.", tier: Tier.MASTER },
  { word: "ANALYSE", hint: "Zerlegung.", tier: Tier.MASTER },
  { word: "ANATOMIE", hint: "Körperbaulehre.", tier: Tier.MASTER },
  { word: "ANBLICK", hint: "Ansicht.", tier: Tier.MASTER },
  { word: "ANDENKEN", hint: "Souvenir.", tier: Tier.MASTER },
  { word: "ANEKDOTE", hint: "Kurze Geschichte.", tier: Tier.MASTER },
  { word: "ANERKENNUNG", hint: "Lob oder Bestätigung.", tier: Tier.MASTER },
  { word: "ANFORDERUNG", hint: "Voraussetzung.", tier: Tier.MASTER },
  { word: "ANGEHOERIGE", hint: "Verwandte.", tier: Tier.MASTER },
  { word: "ANGELEGENHEIT", hint: "Sache oder Ding.", tier: Tier.MASTER },
  { word: "ANGESTELLTE", hint: "Arbeitnehmer.", tier: Tier.MASTER },
  { word: "ANGEWOHNHEIT", hint: "Routine.", tier: Tier.MASTER },
  { word: "ANHAENGER", hint: "Fan oder Wagen.", tier: Tier.MASTER },
  { word: "ANLEITUNG", hint: "Instruktion.", tier: Tier.MASTER },
  { word: "ANLIEGEN", hint: "Wunsch oder Bitte.", tier: Tier.MASTER },
  { word: "ANMUTUNG", hint: "Eindruck.", tier: Tier.MASTER }
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

export const WORDS_ES: WordData[] = [
  // Beginner (Tier 1)
  { word: "CASA", hint: "Lugar donde vives.", tier: Tier.BEGINNER },
  { word: "PERRO", hint: "Mejor amigo del hombre.", tier: Tier.BEGINNER },
  { word: "GATO", hint: "Felino doméstico.", tier: Tier.BEGINNER },
  { word: "AGUA", hint: "Líquido vital.", tier: Tier.BEGINNER },
  { word: "PAN", hint: "Alimento básico.", tier: Tier.BEGINNER },
  { word: "SOL", hint: "Estrella del sistema solar.", tier: Tier.BEGINNER },
  { word: "LUNA", hint: "Satélite de la Tierra.", tier: Tier.BEGINNER },
  { word: "FLOR", hint: "Parte colorida de una planta.", tier: Tier.BEGINNER },
  { word: "ROJO", hint: "Color de la sangre.", tier: Tier.BEGINNER },
  { word: "MANO", hint: "Parte del cuerpo con dedos.", tier: Tier.BEGINNER },
  { word: "PIE", hint: "Parte del cuerpo para caminar.", tier: Tier.BEGINNER },
  { word: "OJO", hint: "Órgano de la vista.", tier: Tier.BEGINNER },
  { word: "MAR", hint: "Masa de agua salada.", tier: Tier.BEGINNER },
  { word: "SAL", hint: "Condimento blanco.", tier: Tier.BEGINNER },
  { word: "LUZ", hint: "Ilumina la oscuridad.", tier: Tier.BEGINNER },
  { word: "DIA", hint: "Tiempo de luz.", tier: Tier.BEGINNER },
  { word: "MES", hint: "Parte de un año.", tier: Tier.BEGINNER },
  { word: "DOS", hint: "Número después del uno.", tier: Tier.BEGINNER },
  { word: "TRES", hint: "Número después del dos.", tier: Tier.BEGINNER },
  { word: "UNO", hint: "Primer número.", tier: Tier.BEGINNER },
  { word: "OLA", hint: "Movimiento del mar.", tier: Tier.BEGINNER },
  { word: "REY", hint: "Gobernante monárquico.", tier: Tier.BEGINNER },
  { word: "SUR", hint: "Punto cardinal.", tier: Tier.BEGINNER },
  { word: "LECHE", hint: "Bebida blanca.", tier: Tier.BEGINNER },
  { word: "MESA", hint: "Mueble con patas.", tier: Tier.BEGINNER },

  // Learner (Tier 2)
  { word: "LIBRO", hint: "Conjunto de hojas escritas.", tier: Tier.LEARNER },
  { word: "SILLA", hint: "Asiento con respaldo.", tier: Tier.LEARNER },
  { word: "COCHE", hint: "Vehículo de cuatro ruedas.", tier: Tier.LEARNER },
  { word: "ARBOL", hint: "Planta grande con tronco.", tier: Tier.LEARNER },
  { word: "VERDE", hint: "Color de la hierba.", tier: Tier.LEARNER },
  { word: "PADRE", hint: "Progenitor masculino.", tier: Tier.LEARNER },
  { word: "MADRE", hint: "Progenitora femenina.", tier: Tier.LEARNER },
  { word: "PLAYA", hint: "Costa con arena.", tier: Tier.LEARNER },
  { word: "NOCHE", hint: "Tiempo de oscuridad.", tier: Tier.LEARNER },
  { word: "TARDE", hint: "Después del mediodía.", tier: Tier.LEARNER },
  { word: "MUNDO", hint: "Planeta Tierra.", tier: Tier.LEARNER },
  { word: "CIELO", hint: "Espacio sobre la tierra.", tier: Tier.LEARNER },
  { word: "VIAJE", hint: "Desplazamiento a otro lugar.", tier: Tier.LEARNER },
  { word: "CAMPO", hint: "Terreno fuera de la ciudad.", tier: Tier.LEARNER },
  { word: "CIUDAD", hint: "Población grande.", tier: Tier.LEARNER },
  { word: "PAPEL", hint: "Material para escribir.", tier: Tier.LEARNER },
  { word: "LAPIZ", hint: "Utensilio para escribir.", tier: Tier.LEARNER },
  { word: "CLASE", hint: "Grupo de alumnos.", tier: Tier.LEARNER },
  { word: "AMIGO", hint: "Persona cercana.", tier: Tier.LEARNER },
  { word: "FELIZ", hint: "Estado de alegría.", tier: Tier.LEARNER },
  { word: "TRISTE", hint: "Estado de pena.", tier: Tier.LEARNER },
  { word: "JUEGO", hint: "Actividad divertida.", tier: Tier.LEARNER },
  { word: "CARTA", hint: "Mensaje escrito.", tier: Tier.LEARNER },
  { word: "QUESO", hint: "Alimento lácteo.", tier: Tier.LEARNER },
  { word: "RELOJ", hint: "Marca el tiempo.", tier: Tier.LEARNER },

  // Skilled (Tier 3)
  { word: "TIEMPO", hint: "Duración de las cosas.", tier: Tier.SKILLED },
  { word: "DINERO", hint: "Moneda de cambio.", tier: Tier.SKILLED },
  { word: "CAMINO", hint: "Vía para transitar.", tier: Tier.SKILLED },
  { word: "FUERZA", hint: "Capacidad física.", tier: Tier.SKILLED },
  { word: "MENTE", hint: "Facultad intelectual.", tier: Tier.SKILLED },
  { word: "SALUD", hint: "Estado de bienestar.", tier: Tier.SKILLED },
  { word: "COMIDA", hint: "Alimento.", tier: Tier.SKILLED },
  { word: "MUSICA", hint: "Arte de los sonidos.", tier: Tier.SKILLED },
  { word: "JARDIN", hint: "Terreno con plantas.", tier: Tier.SKILLED },
  { word: "DOCTOR", hint: "Médico.", tier: Tier.SKILLED },
  { word: "ESCUELA", hint: "Lugar de enseñanza.", tier: Tier.SKILLED },
  { word: "SEMANA", hint: "Siete días.", tier: Tier.SKILLED },
  { word: "FAMILIA", hint: "Grupo de parientes.", tier: Tier.SKILLED },
  { word: "CUERPO", hint: "Organismo vivo.", tier: Tier.SKILLED },
  { word: "SANGRE", hint: "Líquido rojo vital.", tier: Tier.SKILLED },
  { word: "TIERRA", hint: "Planeta o suelo.", tier: Tier.SKILLED },
  { word: "VIENTO", hint: "Aire en movimiento.", tier: Tier.SKILLED },
  { word: "LLUVIA", hint: "Agua que cae del cielo.", tier: Tier.SKILLED },
  { word: "NIEVE", hint: "Agua helada blanca.", tier: Tier.SKILLED },
  { word: "FUEGO", hint: "Combustión con llama.", tier: Tier.SKILLED },
  { word: "PIEDRA", hint: "Materia mineral dura.", tier: Tier.SKILLED },
  { word: "HIERRO", hint: "Metal fuerte.", tier: Tier.SKILLED },
  { word: "ORO", hint: "Metal precioso amarillo.", tier: Tier.SKILLED },
  { word: "PLATA", hint: "Metal precioso gris.", tier: Tier.SKILLED },
  { word: "METAL", hint: "Material conductor.", tier: Tier.SKILLED },

  // Expert (Tier 4)
  { word: "ESPACIO", hint: "Lugar fuera de la atmósfera.", tier: Tier.EXPERT },
  { word: "PLANETA", hint: "Cuerpo celeste.", tier: Tier.EXPERT },
  { word: "ESTRELLA", hint: "Astro con luz propia.", tier: Tier.EXPERT },
  { word: "GALAXIA", hint: "Conjunto de estrellas.", tier: Tier.EXPERT },
  { word: "CIENCIA", hint: "Conocimiento sistemático.", tier: Tier.EXPERT },
  { word: "HISTORIA", hint: "Estudio del pasado.", tier: Tier.EXPERT },
  { word: "CULTURA", hint: "Conjunto de saberes.", tier: Tier.EXPERT },
  { word: "SISTEMA", hint: "Conjunto de reglas.", tier: Tier.EXPERT },
  { word: "TEORIA", hint: "Hipótesis probada.", tier: Tier.EXPERT },
  { word: "ENERGIA", hint: "Capacidad de obrar.", tier: Tier.EXPERT },
  { word: "JUSTICIA", hint: "Dar a cada uno lo suyo.", tier: Tier.EXPERT },
  { word: "LIBERTAD", hint: "Facultad de obrar.", tier: Tier.EXPERT },
  { word: "DERECHO", hint: "Conjunto de leyes.", tier: Tier.EXPERT },
  { word: "MEMORIA", hint: "Facultad de recordar.", tier: Tier.EXPERT },
  { word: "FUTURO", hint: "Lo que vendrá.", tier: Tier.EXPERT },
  { word: "PASADO", hint: "Lo que ya ocurrió.", tier: Tier.EXPERT },
  { word: "ORIGEN", hint: "Principio o causa.", tier: Tier.EXPERT },
  { word: "DESTINO", hint: "Lo que está por suceder.", tier: Tier.EXPERT },
  { word: "ACCION", hint: "Acto o hecho.", tier: Tier.EXPERT },
  { word: "EFECTO", hint: "Resultado de una causa.", tier: Tier.EXPERT },
  { word: "CAUSA", hint: "Motivo o razón.", tier: Tier.EXPERT },
  { word: "MOTIVO", hint: "Causa o razón.", tier: Tier.EXPERT },
  { word: "RAZON", hint: "Facultad de pensar.", tier: Tier.EXPERT },
  { word: "VERDAD", hint: "Conformidad con la realidad.", tier: Tier.EXPERT },
  { word: "FALSO", hint: "Contrario a la verdad.", tier: Tier.EXPERT },

  // Master (Tier 5)
  { word: "ABSOLUTO", hint: "Sin límites.", tier: Tier.MASTER },
  { word: "ABSTRACTO", hint: "No concreto.", tier: Tier.MASTER },
  { word: "ANALISIS", hint: "Examen detallado.", tier: Tier.MASTER },
  { word: "BIOLOGIA", hint: "Ciencia de la vida.", tier: Tier.MASTER },
  { word: "QUIMICA", hint: "Ciencia de la materia.", tier: Tier.MASTER },
  { word: "FISICA", hint: "Ciencia de la naturaleza.", tier: Tier.MASTER },
  { word: "POLITICA", hint: "Arte de gobernar.", tier: Tier.MASTER },
  { word: "ECONOMIA", hint: "Administración de recursos.", tier: Tier.MASTER },
  { word: "SOCIEDAD", hint: "Conjunto de personas.", tier: Tier.MASTER },
  { word: "RELIGION", hint: "Creencia espiritual.", tier: Tier.MASTER },
  { word: "FILOSOFIA", hint: "Amor a la sabiduría.", tier: Tier.MASTER },
  { word: "PSICOLOGIA", hint: "Estudio de la mente.", tier: Tier.MASTER },
  { word: "LITERATURA", hint: "Arte de la palabra.", tier: Tier.MASTER },
  { word: "MATEMATICA", hint: "Ciencia de los números.", tier: Tier.MASTER },
  { word: "GEOGRAFIA", hint: "Descripción de la Tierra.", tier: Tier.MASTER },
  { word: "TECNOLOGIA", hint: "Conjunto de técnicas.", tier: Tier.MASTER },
  { word: "INFORMATICA", hint: "Procesamiento de datos.", tier: Tier.MASTER },
  { word: "INTELIGENCIA", hint: "Facultad de entender.", tier: Tier.MASTER },
  { word: "CONCIENCIA", hint: "Conocimiento de sí mismo.", tier: Tier.MASTER },
  { word: "EXISTENCIA", hint: "Hecho de existir.", tier: Tier.MASTER }
];

export const CHAIN_PAIRS_ES = [
  ["ARCO", "IRIS"], ["LUNA", "LLENA"], ["MEDIO", "DIA"], ["SALVA", "VIDAS"], ["GIRA", "SOL"],
  ["PINTA", "LABIOS"], ["CORTA", "UÑAS"], ["LAVA", "PLATOS"], ["BOCA", "CALLE"], ["VIDEO", "JUEGO"]
];

export const CATEGORY_DATA_ES: Record<string, string[]> = {
  "ESPACIO": ["LUNA", "MARTE", "SOL", "ORBITA", "ASTRO"],
  "COMIDA": ["PAN", "SOPA", "PIZZA", "FRUTA", "CARNE"],
  "TECNOLOGIA": ["WIFI", "DATOS", "RED", "CHIP", "LINK"]
};

export const TUTORIALS: Record<GameMode, Record<Language, TutorialContent>> = {
  [GameMode.CLASSIC]: {
    [Language.EN]: { title: "Classic Mode", text: "Guess the word in 6 tries. Green means correct spot, Yellow means wrong spot, Gray means not in word." },
    [Language.DE]: { title: "Klassisch", text: "Errate das Wort in 6 Versuchen. Grün ist richtig, Gelb ist falsche Stelle, Grau ist nicht im Wort." },
    [Language.ES]: { title: "Modo Clásico", text: "Adivina la palabra en 6 intentos. Verde significa lugar correcto, Amarillo lugar incorrecto, Gris no está en la palabra." }
  },
  [GameMode.SPEEDRUN]: {
    [Language.EN]: { title: "Speedrun", text: "Race against the clock! You have limited time to guess based on word length." },
    [Language.DE]: { title: "Zeitrennen", text: "Wettlauf gegen die Zeit! Du hast nur begrenzte Zeit, abhängig von der Wortlänge." },
    [Language.ES]: { title: "Contrarreloj", text: "¡Carrera contra el reloj! Tienes tiempo limitado para adivinar según la longitud de la palabra." }
  },
  [GameMode.CHAIN]: {
    [Language.EN]: { title: "Chain Reaction", text: "The previous answer is your hint for the next word. E.g. RAIN -> BOW." },
    [Language.DE]: { title: "Wortkette", text: "Die vorherige Antwort ist dein Hinweis für das nächste Wort. Z.B. HAUS -> TIER." },
    [Language.ES]: { title: "Reacción en Cadena", text: "La respuesta anterior es tu pista para la siguiente palabra. Ej. ARCO -> IRIS." }
  },
  [GameMode.CATEGORY]: {
    [Language.EN]: { title: "Topic Puzzle", text: "All words belong to a specific category shown at the top." },
    [Language.DE]: { title: "Themen-Rätsel", text: "Alle Wörter gehören zu einer bestimmten Kategorie, die oben angezeigt wird." },
    [Language.ES]: { title: "Puzzle de Temas", text: "Todas las palabras pertenecen a una categoría específica mostrada arriba." }
  },
  [GameMode.SUDOKU]: {
    [Language.EN]: { title: "Letter Sudoku", text: "Fill the 9x9 grid with letters A-I. No repeats in rows, columns, or 3x3 boxes." },
    [Language.DE]: { title: "Buchstaben-Sudoku", text: "Fülle das 9x9 Gitter mit A-I. Keine Wiederholungen in Zeilen, Spalten oder 3x3 Boxen." },
    [Language.ES]: { title: "Sudoku de Letras", text: "Rellena la cuadrícula 9x9 con letras A-I. Sin repeticiones en filas, columnas o cajas de 3x3." }
  },
  [GameMode.CHALLENGE]: {
    [Language.EN]: { title: "Challenge", text: "Solve math problems and words. Premium only. Costs coins." },
    [Language.DE]: { title: "Herausforderung", text: "Löse Matheaufgaben und Wörter. Nur Premium. Kostet Münzen." },
    [Language.ES]: { title: "Desafío", text: "Resuelve problemas matemáticos y palabras. Solo Premium. Cuesta monedas." }
  },
  [GameMode.RIDDLE]: {
    [Language.EN]: { title: "Riddles", text: "Solve the riddle to find the answer. Think outside the box!" },
    [Language.DE]: { title: "Rätsel", text: "Löse das Rätsel um die Antwort zu finden. Denk um die Ecke!" },
    [Language.ES]: { title: "Acertijos", text: "Resuelve el acertijo para encontrar la respuesta. ¡Piensa diferente!" }
  }
};

// Avatars List (DiceBear IDs) - Expanded
export const AVATARS = [
  "Felix", "Aneka", "Zack", "Midnight", "Shadow", "Cyber", "Neon", "Glitch",
  "Viper", "Echo", "Raven", "Blade", "Matrix", "Nova", "Rogue", "Titan",
  "Luna", "Sol", "Astra", "Orion", "Vega", "Sirius", "Altair", "Draco",
  "Phoenix", "Griffin", "Dragon", "Hydra", "Chimera", "Sphinx", "Golem", "Wraith"
];

// Season Pass Avatar Rewards - Now using Season System!
// Use getCurrentSeason().avatars to get current season's avatars
export const SEASON_AVATARS = SEASON_1_AVATARS; // Legacy compatibility

/**
 * Generate Season Rewards dynamically based on season avatars
 * Season 2 has enhanced rewards compared to Season 1
 */
export const generateSeasonRewards = (season: Season) => {
  const isSeason2 = season.id === 2;

  return Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    let freeReward = null;
    let premiumReward = null;

    // --- FREE TRACK (Target: ~42 rewards) ---
    // Pattern: Levels ending in 1, 3, 6, 9 (4 per 10 = 40) + Level 100 + Level 50 = 42 total
    const lastDigit = level % 10;
    if ([1, 3, 6, 9].includes(lastDigit) || level === 50 || level === 100) {
      if (level % 10 === 0) {
        // Big Milestones (10, 20...) - actually covered by logic below but let's be specific
        freeReward = { type: 'coins', amount: 500, name: 'Big Coin Stash', icon: 'coins_large' };
      } else if (level % 3 === 0) {
        freeReward = { type: 'coins', amount: 100, name: 'Coin Pouch', icon: 'coins_small' };
      } else {
        freeReward = { type: 'coins', amount: 50, name: 'Loose Change', icon: 'coins_small' };
      }
    }

    // --- PREMIUM TRACK (Target: 100 rewards - EVERY LEVEL) ---

    // 1. Avatars - Every 10 levels AND every 5 levels (20 total avatars)
    if (level % 10 === 0) {
      const avatarReward = season.avatars.find(a => a.level === level);
      premiumReward = {
        type: 'avatar',
        name: avatarReward?.name || 'Mystery Avatar',
        desc: avatarReward?.desc || 'Exclusive Season Avatar',
        value: avatarReward?.id,
        preview: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${avatarReward?.dicebear || 'mystery'}`,
        icon: 'avatar_legendary',
        rarity: 'legendary'
      };
    }
    // Extra avatars at mid-points (5, 15, 25, 35, 45, 55, 65, 75, 85, 95)
    else if (level % 10 === 5) {
      const avatarIndex = Math.floor(level / 10) + 10; // Start from index 10
      premiumReward = {
        type: 'avatar',
        name: `Agent #${level}`,
        desc: 'Exclusive Agent Avatar',
        value: `avatar_${level}`,
        preview: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=agent${level}`,
        icon: 'avatar_epic',
        rarity: 'epic'
      };
    }
    // 2. Cosmetics / Effects (Premium only) - EVERY 3 LEVELS (levels 3,6,9,12,15...)
    else if (level % 3 === 0) {
      const allEffects = [
        // Original 5
        { id: 'glow', name: 'Glow', desc: 'Pulsing magical border' },
        { id: 'fire', name: 'Fire', desc: 'Rotating fire gradient' },
        { id: 'ice', name: 'Ice', desc: 'Shimmering icy border' },
        { id: 'neon', name: 'Neon', desc: 'Flickering neon effect' },
        { id: 'sparkle', name: 'Sparkle', desc: 'Gold sparkle border' },
        // Elemental
        { id: 'flame_burst', name: 'Flame Burst', desc: 'Animated flames' },
        { id: 'frost_aura', name: 'Frost Aura', desc: 'Icy particles' },
        { id: 'lightning_arc', name: 'Lightning', desc: 'Electric sparks' },
        { id: 'water_ripple', name: 'Water Ripple', desc: 'Flowing water' },
        // Cosmic
        { id: 'galaxy_swirl', name: 'Galaxy Swirl', desc: 'Rotating galaxy' },
        { id: 'star_field', name: 'Star Field', desc: 'Twinkling stars' },
        { id: 'nebula_glow', name: 'Nebula', desc: 'Colorful nebula' },
        { id: 'void_edge', name: 'Void Edge', desc: 'Dark matter' },
        // Special
        { id: 'rainbow_pulse', name: 'Rainbow', desc: 'Shifting rainbow' },
        { id: 'gold_luxury', name: 'Gold Luxury', desc: 'Ornate gold' },
        { id: 'diamond_shine', name: 'Diamond', desc: 'Crystal shine' },
        { id: 'shadow_flame', name: 'Shadow Flame', desc: 'Dark fire' },
        { id: 'aurora_wave', name: 'Aurora', desc: 'Northern lights' },
        { id: 'pixel_glitch', name: 'Pixel Glitch', desc: 'Retro pixels' },
        { id: 'holo_shimmer', name: 'Holographic', desc: 'Holo shine' },
        // Advanced
        { id: 'wave_motion', name: 'Wave Motion', desc: 'Flowing waves' },
        { id: 'color_morph', name: 'Color Morph', desc: 'Rainbow cycle' },
        { id: 'matrix_rain', name: 'Matrix Rain', desc: 'Code cascade' },
        { id: 'prism_split', name: 'Prism Split', desc: 'RGB split' },
        { id: 'glitch_wild', name: 'Glitch Wild', desc: 'Chaotic glitch' },
        { id: 'lava_flow', name: 'Lava Flow', desc: 'Molten lava' },
        { id: 'electric_pulse', name: 'Electric', desc: 'Lightning zaps' },
        { id: 'oil_slick', name: 'Oil Slick', desc: 'Iridescent oil' },
        { id: 'chromatic_abberation', name: 'Chromatic', desc: 'Color split' },
        { id: 'quantum_flux', name: 'Quantum', desc: 'Phase shift' },
      ];

      // Distribute effects predictably: cycle through all effects
      const effectIndex = Math.floor((level / 3) - 1) % allEffects.length;
      const effect = allEffects[effectIndex];

      premiumReward = {
        type: 'effect',
        name: `${effect.name} Frame`,
        desc: effect.desc,
        value: `effect_${effect.id}`,
        icon: 'magic_wand',
        rarity: effectIndex < 5 ? 'rare' : effectIndex < 20 ? 'epic' : 'legendary'
      };
    }
    // 3. XP Boosters - Every 4 levels (not divisible by 3 or 5)
    else if (level % 4 === 0) {
      premiumReward = {
        type: 'booster',
        name: 'XP Booster (1h)',
        desc: 'Double XP for 1 hour',
        value: 'xp_boost_1h',
        icon: 'booster_pack', // Placeholder name for asset
        rarity: 'rare'
      };
    }
    // 4. Filler (Coins) - All remaining levels
    else {
      premiumReward = {
        type: 'coins',
        amount: 250 * (Math.floor(level / 20) + 1), // Scales with level
        name: 'Premium Coins',
        icon: 'coin_pile_huge'
      };
    }

    return { level, free: freeReward, premium: premiumReward };
  });
};

// Legacy compatibility - defaults to current season
const generatedRewards = generateSeasonRewards(getCurrentSeason());

// Apply Manual Overrides for first 15 levels (Nano Banana Special)
const overrides: Record<number, Partial<SeasonReward>> = {
  1: { premium: { type: 'avatar', name: 'Nano Scout', value: 'nano_banana_pro_1', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nano_banana_pro_1' } },
  2: { premium: { type: 'effect', name: 'Rainbow Pulse', value: 'effect_rainbow', icon: '🌈' } },
  4: { premium: { type: 'avatar', name: 'Space Explorer', value: 'space_explorer', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=SpaceExplorer' } },
  5: { premium: { type: 'effect', name: 'Gold Luxury', value: 'effect_gold', icon: '👑' } },
  6: { premium: { type: 'avatar', name: 'Cyber Banana', value: 'nano_banana_pro_2', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nano_banana_pro_2' } },
  7: { premium: { type: 'effect', name: 'Diamond Shine', value: 'effect_diamond', icon: '💎' } },
  8: { premium: { type: 'effect', name: 'Matrix Rain', value: 'effect_matrix', icon: '💻' } },
  9: { premium: { type: 'avatar', name: 'Neon Ape', value: 'nano_banana_pro_3', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nano_banana_pro_3' } },
  10: { premium: { type: 'effect', name: 'Glitch Wild', value: 'effect_glitch_wild', icon: '👾' } },
  11: { premium: { type: 'avatar', name: 'Glitch Monkey', value: 'nano_banana_pro_4', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nano_banana_pro_4' } },
  12: { premium: { type: 'effect', name: 'Holo Shimmer', value: 'effect_holo', icon: '💿' } },
  14: { premium: { type: 'avatar', name: 'Mecha Kong', value: 'nano_banana_pro_5', preview: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=nano_banana_pro_5' } },
  15: { premium: { type: 'effect', name: 'Quantum Flux', value: 'effect_quantum', icon: '⚛️' } }
};

export const SEASON_REWARDS: SeasonReward[] = generatedRewards.map(reward => {
  const override = overrides[reward.level];
  if (override) {
    return { ...reward, ...override };
  }
  return reward;
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

export const COIN_CODES = [
  "JBXVS6", "YAFYKQ", "HT1JEL", "JTPBL6", "04JLYB", "6G7FA7",
  "W4J006", "KUB406", "1UDR15", "1M91RS", "NBUY18", "7NTMKP",
  "YPRASU", "MZFN0M", "1RJGJW", "LKCWY7", "JD0LDD", "NYKNU1",
  "RAFKS9", "TSKZ74", "NTBTN5", "R24U3T", "VHXXPY", "T3DDDY",
  "ZDP0EW", "4GBYVM", "KA2NZV", "MHSQMA", "0AC55Q", "CRZ86A"
];
