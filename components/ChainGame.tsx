import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Clock, Trophy, Zap, HelpCircle, X, Check } from 'lucide-react';
import { Language, UserState } from '../types';
import { CHAIN_PAIRS_DE, CHAIN_PAIRS_EN, CHAIN_PAIRS_ES, TRANSLATIONS } from '../constants';

interface ChainGameProps {
    language: Language;
    user: UserState;
    onUpdateUser: (updater: (prev: UserState) => UserState) => void;
    onBack: () => void;
    onGameEnd: (score: number, xp: number) => void;
}

export const ChainGame: React.FC<ChainGameProps> = ({ language, user, onUpdateUser, onBack, onGameEnd }) => {
    // Game State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [combo, setCombo] = useState(0);

    // Word State
    const [currentPair, setCurrentPair] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [shake, setShake] = useState(false);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    // Hint State
    const [showHintModal, setShowHintModal] = useState(false);

    // Refs
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get translations
    const t = TRANSLATIONS[language];

    // Get word list based on language
    const getWordList = useCallback(() => {
        switch (language) {
            case Language.DE: return CHAIN_PAIRS_DE;
            case Language.ES: return CHAIN_PAIRS_ES;
            default: return CHAIN_PAIRS_EN;
        }
    }, [language]);

    // Select a random pair
    const nextWord = useCallback(() => {
        const list = getWordList();
        const randomPair = list[Math.floor(Math.random() * list.length)];
        setCurrentPair(randomPair);
        setInput('');
        setFeedback(null);
    }, [getWordList]);

    // Start Game
    const startGame = () => {
        setIsPlaying(true);
        setIsGameOver(false);
        setScore(0);
        setTimeLeft(60);
        setCombo(0);
        nextWord();

        // Focus hidden input
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // Timer Logic
    useEffect(() => {
        if (isPlaying && !isGameOver && !showHintModal) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        endGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, isGameOver, showHintModal]);

    // End Game
    const endGame = () => {
        setIsPlaying(false);
        setIsGameOver(true);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    // Handle Input
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isPlaying || isGameOver || showHintModal) return;

        const val = e.target.value.toUpperCase().replace(/[^A-ZÄÖÜßÑ]/g, '');
        const targetWord = currentPair[1];

        // Limit length to target word length
        if (val.length <= targetWord.length) {
            setInput(val);

            // Check if full word matches
            if (val.length === targetWord.length) {
                if (val === targetWord) {
                    // Correct!
                    handleCorrect();
                } else {
                    // Wrong (full length but mismatch)
                    handleWrong();
                }
            }
        }
    };

    const handleCorrect = () => {
        setFeedback('correct');
        const timeBonus = 2;
        const points = 10 + (combo * 2);

        setScore(s => s + points);
        setTimeLeft(t => Math.min(t + timeBonus, 60)); // Cap at 60s
        setCombo(c => c + 1);

        // Small delay before next word
        setTimeout(() => {
            nextWord();
        }, 300);
    };

    const handleWrong = () => {
        setShake(true);
        setFeedback('wrong');
        setCombo(0);
        setTimeout(() => setShake(false), 500);
    };

    // Hint Logic
    const useHint = (type: 'letter' | 'word') => {
        const cost = type === 'letter' ? 20 : 50;

        if (user.coins < cost) {
            alert("Not enough coins!");
            return;
        }

        onUpdateUser(prev => ({ ...prev, coins: prev.coins - cost }));

        if (type === 'word') {
            setInput(currentPair[1]);
            setTimeout(handleCorrect, 500);
        } else {
            // Reveal next missing letter
            const target = currentPair[1];
            const currentLen = input.length;
            if (currentLen < target.length) {
                setInput(target.substring(0, currentLen + 1));
                // Check if that completed it
                if (currentLen + 1 === target.length) {
                    setTimeout(handleCorrect, 500);
                }
            }
        }
        setShowHintModal(false);
        inputRef.current?.focus();
    };

    // Render Game Over
    if (isGameOver) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4 animate-in fade-in zoom-in duration-300">
                <div
                    className="bg-white border-4 border-black p-8 max-w-md w-full text-center relative"
                    style={{ boxShadow: '8px 8px 0px #000' }}
                >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#FF006E] text-white border-4 border-black px-6 py-2 font-black text-xl rotate-2 shadow-[4px_4px_0px_#000]">
                        {t.CHAIN_GAME.GAME_OVER}
                    </div>

                    <div className="mt-8 mb-6">
                        <p className="text-sm font-bold uppercase text-gray-500 mb-1">{t.CHAIN_GAME.FINAL_SCORE}</p>
                        <p className="text-6xl font-black">{score}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-blue-100 p-3 border-2 border-black">
                            <p className="text-xs font-bold uppercase">{t.GAME.XP_GAINED}</p>
                            <p className="text-xl font-black">+{Math.floor(score / 10)}</p>
                        </div>
                        <div className="bg-yellow-100 p-3 border-2 border-black">
                            <p className="text-xs font-bold uppercase">{t.GAME.COINS_GAINED}</p>
                            <p className="text-xl font-black">+{Math.floor(score / 20)}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-[#06FFA5] border-4 border-black font-black text-xl hover:translate-y-1 active:translate-y-2 transition-all shadow-[4px_4px_0px_#000]"
                        >
                            {t.CHAIN_GAME.PLAY_AGAIN}
                        </button>
                        <button
                            onClick={() => onGameEnd(Math.floor(score / 20), Math.floor(score / 10))}
                            className="w-full py-4 bg-white border-4 border-black font-black text-xl hover:bg-gray-50 transition-all shadow-[4px_4px_0px_#000]"
                        >
                            {t.CHAIN_GAME.EXIT}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Start Screen
    if (!isPlaying) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <div
                    className="bg-white border-4 border-black p-8 max-w-md w-full text-center relative"
                    style={{ boxShadow: '8px 8px 0px #000' }}
                >
                    <h1 className="text-4xl font-black mb-2 uppercase italic">{t.CHAIN_GAME.TITLE}</h1>
                    <p className="text-lg font-bold mb-8">{t.CHAIN_GAME.INSTRUCTIONS}</p>

                    <div className="space-y-4 mb-8 text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#FFBE0B] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="font-black">{t.CHAIN_GAME.TIME_LABEL}</p>
                                <p className="text-sm">{t.CHAIN_GAME.TIME_DESC}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#FF006E] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000] text-white">
                                <Zap size={24} />
                            </div>
                            <div>
                                <p className="font-black">{t.CHAIN_GAME.COMBO_LABEL}</p>
                                <p className="text-sm">{t.CHAIN_GAME.COMBO_DESC}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        className="w-full py-4 bg-[#06FFA5] border-4 border-black font-black text-2xl hover:translate-y-1 active:translate-y-2 transition-all shadow-[6px_6px_0px_#000] uppercase"
                    >
                        {t.CHAIN_GAME.START_BTN}
                    </button>

                    <button
                        onClick={onBack}
                        className="mt-4 font-bold underline hover:text-[#FF006E]"
                    >
                        {t.CHAIN_GAME.BACK_BTN}
                    </button>
                </div>
            </div>
        );
    }

    // Render Gameplay
    return (
        <div className="flex flex-col h-full relative overflow-hidden">
            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-white border-b-4 border-black">
                <button onClick={endGame} className="p-2 border-2 border-black hover:bg-gray-100 shadow-[2px_2px_0px_#000]">
                    <ArrowLeft size={24} />
                </button>

                <div className="flex items-center gap-2 px-4 py-2 bg-[#FFBE0B] border-2 border-black shadow-[2px_2px_0px_#000]">
                    <Clock size={20} />
                    <span className={`font-mono font-black text-xl ${timeLeft < 10 ? 'text-red-600 animate-pulse' : ''}`}>
                        {timeLeft}s
                    </span>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                    <Trophy size={20} className="text-[#FF006E]" />
                    <span className="font-mono font-black text-xl">{score}</span>
                </div>
            </div>

            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative" onClick={() => inputRef.current?.focus()}>

                {/* Combo Indicator */}
                {combo > 1 && (
                    <div className="absolute top-8 animate-bounce">
                        <div className="bg-[#FF006E] text-white px-4 py-1 border-2 border-black shadow-[4px_4px_0px_#000] -rotate-3 font-black text-lg">
                            {combo}x {t.CHAIN_GAME.COMBO_TEXT}
                        </div>
                    </div>
                )}

                <div className={`flex flex-col items-center gap-4 transition-all duration-200 ${shake ? 'translate-x-[-10px]' : ''}`}>
                    {/* First Word (Hint) */}
                    <div className="bg-white border-4 border-black px-8 py-4 shadow-[8px_8px_0px_#000] rotate-1">
                        <span className="text-4xl md:text-6xl font-black uppercase tracking-wider">
                            {currentPair[0]}
                        </span>
                    </div>

                    {/* Link Icon */}
                    <div className="text-4xl font-black text-gray-400">
                        +
                    </div>

                    {/* Target Word (Input) */}
                    <div className="relative">
                        <div className={`bg-white border-4 border-black px-8 py-4 shadow-[8px_8px_0px_#000] -rotate-1 min-w-[200px] text-center
              ${feedback === 'correct' ? 'bg-[#06FFA5]' : ''}
              ${feedback === 'wrong' ? 'bg-red-100' : ''}
            `}>
                            <span className="text-4xl md:text-6xl font-black uppercase tracking-wider text-[#FF006E]">
                                {input || "_".repeat(currentPair[1].length)}
                            </span>
                        </div>

                        {/* Hidden Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={handleInput}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            autoFocus
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                        />
                    </div>
                </div>

                {/* Instructions / Hint */}
                <div className="mt-12 text-center opacity-50 font-bold">
                    {t.CHAIN_GAME.HINT_DESC}
                </div>

                {/* Hint Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); setShowHintModal(true); }}
                    className="absolute bottom-8 right-8 w-14 h-14 bg-[#8338EC] text-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000] hover:translate-y-[-2px] active:translate-y-[2px] transition-all"
                >
                    <HelpCircle size={28} strokeWidth={3} />
                </button>

            </div>

            {/* Keyboard Hint (Mobile) */}
            <div className="p-4 text-center text-sm font-bold bg-gray-100 border-t-2 border-black">
                {t.CHAIN_GAME.KEYBOARD_HINT}
            </div>

            {/* Hint Modal */}
            {showHintModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white border-4 border-black p-6 w-full max-w-sm relative shadow-[8px_8px_0px_#000] animate-in zoom-in duration-200">
                        <button
                            onClick={() => setShowHintModal(false)}
                            className="absolute top-4 right-4 p-1 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
                            <HelpCircle className="text-[#8338EC]" /> {t.CHAIN_GAME.NEED_HELP}
                        </h3>

                        <div className="space-y-4">
                            <button
                                onClick={() => useHint('letter')}
                                className="w-full p-4 bg-white border-4 border-black flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-all shadow-[4px_4px_0px_#000]"
                            >
                                <span className="font-bold">{t.CHAIN_GAME.REVEAL_LETTER}</span>
                                <span className="font-black bg-[#FFBE0B] px-2 py-1 border-2 border-black text-sm">20 {t.GAME.COINS_GAINED}</span>
                            </button>

                            <button
                                onClick={() => useHint('word')}
                                className="w-full p-4 bg-white border-4 border-black flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-all shadow-[4px_4px_0px_#000]"
                            >
                                <span className="font-bold">{t.CHAIN_GAME.REVEAL_WORD}</span>
                                <span className="font-black bg-[#FFBE0B] px-2 py-1 border-2 border-black text-sm">50 {t.GAME.COINS_GAINED}</span>
                            </button>
                        </div>

                        <div className="mt-6 text-center font-bold text-gray-500 text-sm">
                            {t.HOME.COINS}: {user.coins}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
