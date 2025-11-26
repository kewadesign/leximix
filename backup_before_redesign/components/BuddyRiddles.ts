import { BuddyState } from '../types';

export interface Riddle {
    id: string;
    question: string;
    answer: string; // Normalized answer for checking
    displayAnswer?: string; // Nice formatting
    hint?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    reward: { xp: number; coins: number };
}

export const BUDDY_RIDDLES: Riddle[] = [
    // Easy
    {
        id: 'r1',
        question: "Was hat ein Bett, aber schläft nie?",
        answer: "fluss",
        displayAnswer: "Fluss",
        difficulty: 'easy',
        reward: { xp: 20, coins: 10 }
    },
    {
        id: 'r2',
        question: "Was läuft ohne Beine?",
        answer: "wasser",
        displayAnswer: "Wasser",
        difficulty: 'easy',
        reward: { xp: 20, coins: 10 }
    },
    {
        id: 'r3',
        question: "Was hat Zähne, beißt aber nicht?",
        answer: "kamm",
        displayAnswer: "Kamm",
        difficulty: 'easy',
        reward: { xp: 20, coins: 10 }
    },
    
    // Medium
    {
        id: 'r4',
        question: "Ich habe Städte, aber keine Häuser. Ich habe Berge, aber keine Bäume. Ich habe Wasser, aber keine Fische. Was bin ich?",
        answer: "landkarte",
        displayAnswer: "Landkarte",
        difficulty: 'medium',
        reward: { xp: 50, coins: 25 }
    },
    {
        id: 'r5',
        question: "Je mehr du wegnimmst, desto größer werde ich. Was bin ich?",
        answer: "loch",
        displayAnswer: "Loch",
        difficulty: 'medium',
        reward: { xp: 50, coins: 25 }
    },
    {
        id: 'r6',
        question: "Ich bin immer da, aber du siehst mich nicht. Ich habe kein Gewicht, aber du kannst mich halten (im Atem). Was bin ich?",
        answer: "luft",
        displayAnswer: "Luft",
        difficulty: 'medium',
        reward: { xp: 50, coins: 25 }
    },
    {
        id: 'r7',
        question: "Was gehört dir, aber andere benutzen es öfter als du?",
        answer: "name",
        displayAnswer: "Name",
        difficulty: 'medium',
        reward: { xp: 50, coins: 25 }
    },

    // Hard
    {
        id: 'r8',
        question: "Morgens laufe ich auf vier Beinen, mittags auf zwei und abends auf drei. Was bin ich?",
        answer: "mensch",
        displayAnswer: "Mensch",
        difficulty: 'hard',
        reward: { xp: 100, coins: 50 }
    },
    {
        id: 'r9',
        question: "Ich habe einen Hals, aber keinen Kopf. Zwei Arme, aber keine Hände. Was bin ich?",
        answer: "hemd",
        displayAnswer: "Hemd",
        difficulty: 'hard',
        reward: { xp: 80, coins: 40 }
    },
    {
        id: 'r10',
        question: "Wer es macht, will es nicht. Wer es kauft, braucht es nicht. Wer es braucht, sieht es nicht. Was ist es?",
        answer: "sarg",
        displayAnswer: "Sarg",
        difficulty: 'hard',
        reward: { xp: 100, coins: 60 }
    },
    {
        id: 'r11',
        question: "Was wird kürzer, je älter es wird?",
        answer: "kerze",
        displayAnswer: "Kerze",
        difficulty: 'hard',
        reward: { xp: 80, coins: 40 }
    },
    {
        id: 'r12',
        question: "Ich bin leicht wie eine Feder, doch selbst der stärkste Mann kann mich nicht lange halten. Was bin ich?",
        answer: "atem",
        displayAnswer: "Atem",
        difficulty: 'hard',
        reward: { xp: 100, coins: 50 }
    }
];

export const getRandomRiddle = () => {
    return BUDDY_RIDDLES[Math.floor(Math.random() * BUDDY_RIDDLES.length)];
};
