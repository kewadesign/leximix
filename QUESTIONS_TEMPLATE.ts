/*
 * ============================================
 * LEXIMIX - FRAGEN & ANTWORTEN VORLAGE
 * ============================================
 * 
 * ANLEITUNG:
 * 1. Fülle die leeren Platzhalter mit deinen Fragen und Antworten
 * 2. Jedes Level braucht: target (Antwort), hintTitle (Kategorie), hintDesc (Frage/Hinweis)
 * 3. Für Challenge Mode: Gib auch 'type' an ('math' oder 'word')
 * 4. Optional: timeLimit (in Sekunden)
 * 5. Gib mir die ausgefüllte Datei zurück und ich bette sie ein
 * 
 * GAME MODES:
 * - CLASSIC: Klassisches Wort-Raten
 * - CHALLENGE: Mathe & Rätsel (Premium)
 * - SPEEDRUN: Gegen die Zeit
 * - CHAIN: Wortketten
 * - CATEGORY: Themen-basiert
 * 
 * TIERS (Schwierigkeitsgrade):
 * 1 = BEGINNER (Anfänger)
 * 2 = LEARNER (Fortgeschritten)
 * 3 = SKILLED (Erfahren)
 * 4 = EXPERT (Experte)
 * 5 = MASTER (Meister)
 */

import { Tier, GameMode, Language } from '../types';

export interface LevelContent {
    target: string;       // Die Antwort/das Wort
    hintTitle: string;    // Kategorie (z.B. "MATHE", "RÄTSEL", "OBST")
    hintDesc: string;     // Die Frage oder der Hinweis
    timeLimit?: number;   // Optional: Zeitlimit in Sekunden
    type?: 'math' | 'word'; // Nur für Challenge: 'math' oder 'word'
}

export const LEVEL_DATA: Record<string, Record<string, Record<number, Record<number, LevelContent>>>> = {

    // ========================================
    // CLASSIC MODE - DEUTSCH
    // ========================================
    [GameMode.CLASSIC]: {
        [Language.DE]: {
            // BEGINNER (Anfänger)
            [Tier.BEGINNER]: {
                1: { target: "", hintTitle: "", hintDesc: "" },
                2: { target: "", hintTitle: "", hintDesc: "" },
                3: { target: "", hintTitle: "", hintDesc: "" },
                4: { target: "", hintTitle: "", hintDesc: "" },
                5: { target: "", hintTitle: "", hintDesc: "" },
                6: { target: "", hintTitle: "", hintDesc: "" },
                7: { target: "", hintTitle: "", hintDesc: "" },
                8: { target: "", hintTitle: "", hintDesc: "" },
                9: { target: "", hintTitle: "", hintDesc: "" },
                10: { target: "", hintTitle: "", hintDesc: "" },
                11: { target: "", hintTitle: "", hintDesc: "" },
                12: { target: "", hintTitle: "", hintDesc: "" },
                13: { target: "", hintTitle: "", hintDesc: "" },
                14: { target: "", hintTitle: "", hintDesc: "" },
                15: { target: "", hintTitle: "", hintDesc: "" },
                16: { target: "", hintTitle: "", hintDesc: "" },
                17: { target: "", hintTitle: "", hintDesc: "" },
                18: { target: "", hintTitle: "", hintDesc: "" },
                19: { target: "", hintTitle: "", hintDesc: "" },
                20: { target: "", hintTitle: "", hintDesc: "" },
            },
            // LEARNER (Fortgeschritten)
            [Tier.LEARNER]: {
                1: { target: "", hintTitle: "", hintDesc: "" },
                2: { target: "", hintTitle: "", hintDesc: "" },
                3: { target: "", hintTitle: "", hintDesc: "" },
                4: { target: "", hintTitle: "", hintDesc: "" },
                5: { target: "", hintTitle: "", hintDesc: "" },
                6: { target: "", hintTitle: "", hintDesc: "" },
                7: { target: "", hintTitle: "", hintDesc: "" },
                8: { target: "", hintTitle: "", hintDesc: "" },
                9: { target: "", hintTitle: "", hintDesc: "" },
                10: { target: "", hintTitle: "", hintDesc: "" },
                11: { target: "", hintTitle: "", hintDesc: "" },
                12: { target: "", hintTitle: "", hintDesc: "" },
                13: { target: "", hintTitle: "", hintDesc: "" },
                14: { target: "", hintTitle: "", hintDesc: "" },
                15: { target: "", hintTitle: "", hintDesc: "" },
                16: { target: "", hintTitle: "", hintDesc: "" },
                17: { target: "", hintTitle: "", hintDesc: "" },
                18: { target: "", hintTitle: "", hintDesc: "" },
                19: { target: "", hintTitle: "", hintDesc: "" },
                20: { target: "", hintTitle: "", hintDesc: "" },
            },
            // SKILLED (Erfahren)
            [Tier.SKILLED]: {
                1: { target: "", hintTitle: "", hintDesc: "" },
                2: { target: "", hintTitle: "", hintDesc: "" },
                3: { target: "", hintTitle: "", hintDesc: "" },
                4: { target: "", hintTitle: "", hintDesc: "" },
                5: { target: "", hintTitle: "", hintDesc: "" },
                6: { target: "", hintTitle: "", hintDesc: "" },
                7: { target: "", hintTitle: "", hintDesc: "" },
                8: { target: "", hintTitle: "", hintDesc: "" },
                9: { target: "", hintTitle: "", hintDesc: "" },
                10: { target: "", hintTitle: "", hintDesc: "" },
                11: { target: "", hintTitle: "", hintDesc: "" },
                12: { target: "", hintTitle: "", hintDesc: "" },
                13: { target: "", hintTitle: "", hintDesc: "" },
                14: { target: "", hintTitle: "", hintDesc: "" },
                15: { target: "", hintTitle: "", hintDesc: "" },
                16: { target: "", hintTitle: "", hintDesc: "" },
                17: { target: "", hintTitle: "", hintDesc: "" },
                18: { target: "", hintTitle: "", hintDesc: "" },
                19: { target: "", hintTitle: "", hintDesc: "" },
                20: { target: "", hintTitle: "", hintDesc: "" },
            },
            // EXPERT (Experte)
            [Tier.EXPERT]: {
                1: { target: "", hintTitle: "", hintDesc: "" },
                2: { target: "", hintTitle: "", hintDesc: "" },
                3: { target: "", hintTitle: "", hintDesc: "" },
                4: { target: "", hintTitle: "", hintDesc: "" },
                5: { target: "", hintTitle: "", hintDesc: "" },
                6: { target: "", hintTitle: "", hintDesc: "" },
                7: { target: "", hintTitle: "", hintDesc: "" },
                8: { target: "", hintTitle: "", hintDesc: "" },
                9: { target: "", hintTitle: "", hintDesc: "" },
                10: { target: "", hintTitle: "", hintDesc: "" },
                11: { target: "", hintTitle: "", hintDesc: "" },
                12: { target: "", hintTitle: "", hintDesc: "" },
                13: { target: "", hintTitle: "", hintDesc: "" },
                14: { target: "", hintTitle: "", hintDesc: "" },
                15: { target: "", hintTitle: "", hintDesc: "" },
                16: { target: "", hintTitle: "", hintDesc: "" },
                17: { target: "", hintTitle: "", hintDesc: "" },
                18: { target: "", hintTitle: "", hintDesc: "" },
                19: { target: "", hintTitle: "", hintDesc: "" },
                20: { target: "", hintTitle: "", hintDesc: "" },
            },
            // MASTER (Meister)
            [Tier.MASTER]: {
                1: { target: "", hintTitle: "", hintDesc: "" },
                2: { target: "", hintTitle: "", hintDesc: "" },
                3: { target: "", hintTitle: "", hintDesc: "" },
                4: { target: "", hintTitle: "", hintDesc: "" },
                5: { target: "", hintTitle: "", hintDesc: "" },
                6: { target: "", hintTitle: "", hintDesc: "" },
                7: { target: "", hintTitle: "", hintDesc: "" },
                8: { target: "", hintTitle: "", hintDesc: "" },
                9: { target: "", hintTitle: "", hintDesc: "" },
                10: { target: "", hintTitle: "", hintDesc: "" },
                11: { target: "", hintTitle: "", hintDesc: "" },
                12: { target: "", hintTitle: "", hintDesc: "" },
                13: { target: "", hintTitle: "", hintDesc: "" },
                14: { target: "", hintTitle: "", hintDesc: "" },
                15: { target: "", hintTitle: "", hintDesc: "" },
                16: { target: "", hintTitle: "", hintDesc: "" },
                17: { target: "", hintTitle: "", hintDesc: "" },
                18: { target: "", hintTitle: "", hintDesc: "" },
                19: { target: "", hintTitle: "", hintDesc: "" },
                20: { target: "", hintTitle: "", hintDesc: "" },
            }
        },

        // ========================================
        // CLASSIC MODE - ENGLISH
        // ========================================
        [Language.EN]: {
            // BEGINNER
            [Tier.BEGINNER]: {
                1: { target: "", hintTitle: "", hintDesc: "" },
                2: { target: "", hintTitle: "", hintDesc: "" },
                3: { target: "", hintTitle: "", hintDesc: "" },
                4: { target: "", hintTitle: "", hintDesc: "" },
                5: { target: "", hintTitle: "", hintDesc: "" },
                6: { target: "", hintTitle: "", hintDesc: "" },
                7: { target: "", hintTitle: "", hintDesc: "" },
                8: { target: "", hintTitle: "", hintDesc: "" },
                9: { target: "", hintTitle: "", hintDesc: "" },
                10: { target: "", hintTitle: "", hintDesc: "" },
                11: { target: "", hintTitle: "", hintDesc: "" },
                12: { target: "", hintTitle: "", hintDesc: "" },
                13: { target: "", hintTitle: "", hintDesc: "" },
                14: { target: "", hintTitle: "", hintDesc: "" },
                15: { target: "", hintTitle: "", hintDesc: "" },
                16: { target: "", hintTitle: "", hintDesc: "" },
                17: { target: "", hintTitle: "", hintDesc: "" },
                18: { target: "", hintTitle: "", hintDesc: "" },
                19: { target: "", hintTitle: "", hintDesc: "" },
                20: { target: "", hintTitle: "", hintDesc: "" },
            },
            // LEARNER
            [Tier.LEARNER]: {
                1: { target: "", hintTitle: "", hintDesc: "" },
                2: { target: "", hintTitle: "", hintDesc: "" },
                3: { target: "", hintTitle: "", hintDesc: "" },
                4: { target: "", hintTitle: "", hintDesc: "" },
                5: { target: "", hintTitle: "", hintDesc: "" },
                6: { target: "", hintTitle: "", hintDesc: "" },
                7: { target: "", hintTitle: "", hintDesc: "" },
                8: { target: "", hintTitle: "", hintDesc: "" },
                9: { target: "", hintTitle: "", hintDesc: "" },
                10: { target: "", hintTitle: "", hintDesc: "" },
                11: { target: "", hintTitle: "", hintDesc: "" },
                12: { target: "", hintTitle: "", hintDesc: "" },
                13: { target: "", hintTitle: "", hintDesc: "" },
                14: { target: "", hintTitle: "", hintDesc: "" },
                15: { target: "", hintTitle: "", hintDesc: "" },
                16: { target: "", hintTitle: "", hintDesc: "" },
                17: { target: "", hintTitle: "", hintDesc: "" },
                18: { target: "", hintTitle: "", hintDesc: "" },
                19: { target: "", hintTitle: "", hintDesc: "" },
                20: { target: "", hintTitle: "", hintDesc: "" },
            },
            // SKILLED
            [Tier.SKILLED]: {
                1: { target: "", hintTitle: "", hintDesc: "" },
                2: { target: "", hintTitle: "", hintDesc: "" },
                3: { target: "", hintTitle: "", hintDesc: "" },
                4: { target: "", hintTitle: "", hintDesc: "" },
                5: { target: "", hintTitle: "", hintDesc: "" },
                6: { target: "", hintTitle: "", hintDesc: "" },
                7: { target: "", hintTitle: "", hintDesc: "" },
                8: { target: "", hintTitle: "", hintDesc: "" },
                9: { target: "", hintTitle: "", hintDesc: "" },
                10: { target: "", hintTitle: "", hintDesc: "" },
                11: { target: "", hintTitle: "", hintDesc: "" },
                12: { target: "", hintTitle: "", hintDesc: "" },
                13: { target: "", hintTitle: "", hintDesc: "" },
                14: { target: "", hintTitle: "", hintDesc: "" },
                15: { target: "", hintTitle: "", hintDesc: "" },
                16: { target: "", hintTitle: "", hintDesc: "" },
                17: { target: "", hintTitle: "", hintDesc: "" },
                18: { target: "", hintTitle: "", hintDesc: "" },
                19: { target: "", hintTitle: "", hintDesc: "" },
                20: { target: "", hintTitle: "", hintDesc: "" },
            },
            // EXPERT
            [Tier.EXPERT]: {
                1: { target: "", hintTitle: "", hintDesc: "" },
                2: { target: "", hintTitle: "", hintDesc: "" },
                3: { target: "", hintTitle: "", hintDesc: "" },
                4: { target: "", hintTitle: "", hintDesc: "" },
                5: { target: "", hintTitle: "", hintDesc: "" },
                6: { target: "", hintTitle: "", hintDesc: "" },
                7: { target: "", hintTitle: "", hintDesc: "" },
                8: { target: "", hintTitle: "", hintDesc: "" },
                9: { target: "", hintTitle: "", hintDesc: "" },
                10: { target: "", hintTitle: "", hintDesc: "" },
                11: { target: "", hintTitle: "", hintDesc: "" },
                12: { target: "", hintTitle: "", hintDesc: "" },
                13: { target: "", hintTitle: "", hintDesc: "" },
                14: { target: "", hintTitle: "", hintDesc: "" },
                15: { target: "", hintTitle: "", hintDesc: "" },
                16: { target: "", hintTitle: "", hintDesc: "" },
                17: { target: "", hintTitle: "", hintDesc: "" },
                18: { target: "", hintTitle: "", hintDesc: "" },
                19: { target: "", hintTitle: "", hintDesc: "" },
                20: { target: "", hintTitle: "", hintDesc: "" },
            },
            // MASTER
            [Tier.MASTER]: {
                1: { target: "", hintTitle: "", hintDesc: "" },
                2: { target: "", hintTitle: "", hintDesc: "" },
                3: { target: "", hintTitle: "", hintDesc: "" },
                4: { target: "", hintTitle: "", hintDesc: "" },
                5: { target: "", hintTitle: "", hintDesc: "" },
                6: { target: "", hintTitle: "", hintDesc: "" },
                7: { target: "", hintTitle: "", hintDesc: "" },
                8: { target: "", hintTitle: "", hintDesc: "" },
                9: { target: "", hintTitle: "", hintDesc: "" },
                10: { target: "", hintTitle: "", hintDesc: "" },
                11: { target: "", hintTitle: "", hintDesc: "" },
                12: { target: "", hintTitle: "", hintDesc: "" },
                13: { target: "", hintTitle: "", hintDesc: "" },
                14: { target: "", hintTitle: "", hintDesc: "" },
                15: { target: "", hintTitle: "", hintDesc: "" },
                16: { target: "", hintTitle: "", hintDesc: "" },
                17: { target: "", hintTitle: "", hintDesc: "" },
                18: { target: "", hintTitle: "", hintDesc: "" },
                19: { target: "", hintTitle: "", hintDesc: "" },
                20: { target: "", hintTitle: "", hintDesc: "" },
            }
        }
    },

    // ========================================
    // CHALLENGE MODE - DEUTSCH
    // ========================================
    [GameMode.CHALLENGE]: {
        [Language.DE]: {
            // BEGINNER (Anfänger)
            [Tier.BEGINNER]: {
                1: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                2: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                3: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                4: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                5: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                6: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                7: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                8: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                9: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                10: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                11: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                12: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                13: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                14: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                15: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                16: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                17: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                18: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                19: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                20: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
            },
            // LEARNER (Fortgeschritten)
            [Tier.LEARNER]: {
                1: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                2: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                3: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                4: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                5: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                6: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                7: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                8: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                9: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                10: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                11: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                12: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                13: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                14: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                15: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                16: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                17: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                18: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                19: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                20: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
            },
            // SKILLED (Erfahren)
            [Tier.SKILLED]: {
                1: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                2: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                3: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                4: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                5: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                6: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                7: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                8: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                9: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                10: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                11: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                12: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                13: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                14: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                15: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                16: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                17: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                18: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                19: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                20: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
            },
            // EXPERT (Experte)
            [Tier.EXPERT]: {
                1: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                2: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                3: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                4: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                5: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                6: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                7: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                8: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                9: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                10: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                11: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                12: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                13: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                14: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                15: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                16: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                17: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                18: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                19: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                20: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
            },
            // MASTER (Meister)
            [Tier.MASTER]: {
                1: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                2: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                3: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                4: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                5: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                6: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                7: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                8: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                9: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                10: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                11: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                12: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                13: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                14: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                15: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                16: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                17: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                18: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
                19: { target: "", hintTitle: "RÄTSEL", hintDesc: "", type: 'word' },
                20: { target: "", hintTitle: "MATHE", hintDesc: "", type: 'math' },
            }
        },

        // ========================================
        // CHALLENGE MODE - ENGLISH
        // ========================================
        [Language.EN]: {
            // BEGINNER
            [Tier.BEGINNER]: {
                1: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                2: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                3: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                4: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                5: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                6: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                7: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                8: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                9: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                10: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                11: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                12: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                13: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                14: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                15: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                16: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                17: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                18: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                19: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                20: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
            },
            // LEARNER
            [Tier.LEARNER]: {
                1: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                2: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                3: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                4: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                5: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                6: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                7: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                8: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                9: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                10: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                11: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                12: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                13: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                14: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                15: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                16: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                17: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                18: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                19: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                20: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
            },
            // SKILLED
            [Tier.SKILLED]: {
                1: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                2: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                3: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                4: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                5: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                6: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                7: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                8: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                9: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                10: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                11: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                12: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                13: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                14: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                15: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                16: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                17: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                18: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                19: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                20: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
            },
            // EXPERT
            [Tier.EXPERT]: {
                1: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                2: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                3: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                4: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                5: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                6: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                7: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                8: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                9: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                10: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                11: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                12: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                13: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                14: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                15: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                16: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                17: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                18: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                19: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                20: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
            },
            // MASTER
            [Tier.MASTER]: {
                1: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                2: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                3: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                4: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                5: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                6: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                7: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                8: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                9: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                10: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                11: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                12: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                13: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                14: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                15: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                16: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                17: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                18: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
                19: { target: "", hintTitle: "RIDDLE", hintDesc: "", type: 'word' },
                20: { target: "", hintTitle: "MATH", hintDesc: "", type: 'math' },
            }
        }
    }
};
