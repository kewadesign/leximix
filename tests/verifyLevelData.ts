
import { getLevelContent, generateChallenge } from '../utils/gameLogic';
import { GameMode, Tier, Language } from '../types';
import { LEVEL_DATA } from '../utils/levelData';

console.log("Starting Verification...");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        failed++;
    }
}

// Test 1: Classic Mode - Beginner - Level 1 (German)
const classicDeL1 = getLevelContent(GameMode.CLASSIC, Tier.BEGINNER, 1, Language.DE);
const expectedClassicDeL1 = LEVEL_DATA[GameMode.CLASSIC][Language.DE][Tier.BEGINNER][1];
assert(classicDeL1.target === expectedClassicDeL1.target, "Classic DE L1 Target matches");
assert(classicDeL1.hintTitle === expectedClassicDeL1.hintTitle, "Classic DE L1 HintTitle matches");

// Test 2: Challenge Mode - Beginner - Level 1 (English)
const challengeEnL1 = generateChallenge(Language.EN, Tier.BEGINNER, 1);
const expectedChallengeEnL1 = LEVEL_DATA[GameMode.CHALLENGE][Language.EN][Tier.BEGINNER][1];
assert(challengeEnL1.target === expectedChallengeEnL1.target, "Challenge EN L1 Target matches");
assert(challengeEnL1.question === expectedChallengeEnL1.hintDesc, "Challenge EN L1 Question matches hintDesc");

// Test 3: Fallback (Level not in static data)
// Assuming Level 999 is not in static data
const fallbackLevel = getLevelContent(GameMode.CLASSIC, Tier.BEGINNER, 999, Language.DE);
assert(fallbackLevel.target !== undefined, "Fallback level has a target");
// We can't easily check if it's random, but we can check it's NOT null

console.log(`\nVerification Complete: ${passed} Passed, ${failed} Failed.`);

if (failed > 0) process.exit(1);
