import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Sparkles, Stars, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { BuddyState } from '../types';
import { Heart, Zap, Utensils, Play, Sparkles as SparklesIcon, Brain, Cat, Dog, Rabbit, Bird, Fish } from 'lucide-react';
import { audio } from '../utils/audio';
import { BUDDY_RIDDLES, getRandomRiddle, Riddle } from './BuddyRiddles';

interface BuddyProps {
    buddy: BuddyState;
    onUpdate: (newBuddy: BuddyState) => void;
    onPlay: () => void;
    onBack?: () => void;
}

// 2D Cute Buddy Component
const CuteBuddy2D = ({ buddy, animationType, position }: { buddy: BuddyState; animationType: string; position: { x: number, y: number } }) => {
    const getBuddyEmoji = () => {
        // Map skins to Emojis
        switch (buddy.skin) {
            case 'gold': return '🦁'; // Lion for Gold
            case 'neon': return '🦄'; // Unicorn for Neon
            case 'ruby': return '🦊'; // Fox for Ruby
            case 'emerald': return '🦖'; // Dino for Emerald
            case 'obsidian': return '🐺'; // Wolf for Obsidian
            default: return '🐱'; // Cat default
        }
    };

    return (
        <div 
            className="absolute transition-all duration-1000 ease-in-out flex flex-col items-center justify-center"
            style={{ 
                left: `${position.x}%`, 
                top: `${position.y}%`, 
                transform: 'translate(-50%, -50%)' 
            }}
        >
            {/* Status Bubbles */}
            <div className="flex gap-1 mb-2 absolute -top-12">
                {buddy.hunger < 30 && <div className="animate-bounce bg-white/80 p-1 rounded-full text-lg shadow-sm">🍗</div>}
                {buddy.mood < 30 && <div className="animate-bounce delay-100 bg-white/80 p-1 rounded-full text-lg shadow-sm">💔</div>}
                {buddy.energy < 30 && <div className="animate-bounce delay-200 bg-white/80 p-1 rounded-full text-lg shadow-sm">💤</div>}
            </div>

            {/* The Buddy Emoji */}
            <div className={`text-9xl filter drop-shadow-2xl cursor-pointer select-none transition-transform duration-300
                ${animationType === 'happy' ? 'animate-bounce' : ''}
                ${animationType === 'eating' ? 'animate-pulse scale-110' : ''}
                ${animationType === 'sleeping' ? 'opacity-80 grayscale-[0.3]' : 'animate-float-slow'}
                hover:scale-110 active:scale-95
            `}>
                {getBuddyEmoji()}
            </div>

            {/* Expressions (Overlay) */}
            {animationType === 'sleeping' && (
                <div className="absolute -top-4 right-0 text-4xl font-bold text-white animate-pulse">Zzz...</div>
            )}
            {animationType === 'eating' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl animate-ping opacity-50">🍖</div>
            )}
            {animationType === 'happy' && (
                <div className="absolute -top-8 right-0 text-5xl animate-bounce">❤️</div>
            )}
        </div>
    );
};

export const SphereBuddy3D: React.FC<BuddyProps> = ({ buddy, onUpdate, onPlay, onBack }) => {
    const [animationType, setAnimationType] = useState<'idle' | 'happy' | 'eating' | 'sleeping' | 'pooping'>('idle');
    const [message, setMessage] = useState<string>("");
    const [showCustomize, setShowCustomize] = useState(false);
    
    // Tamagotchi State
    const [position, setPosition] = useState({ x: 50, y: 50 }); // Center
    const [poopCount, setPoopCount] = useState(0); // Number of poops on screen

    // ... (Existing Quest State) ...
    const [activeQuest, setActiveQuest] = useState<Riddle | null>(null);
    const [questInput, setQuestInput] = useState("");
    const [showQuestModal, setShowQuestModal] = useState(false);

    // Movement Logic
    useEffect(() => {
        const moveInterval = setInterval(() => {
            if (animationType === 'idle') {
                // Move to random position within bounds (20-80%)
                const newX = 20 + Math.random() * 60;
                const newY = 30 + Math.random() * 40; // Keep it somewhat centered vertically
                setPosition({ x: newX, y: newY });
                
                // Random chance to poop (10% every move)
                if (Math.random() < 0.1 && poopCount < 3) {
                    setPoopCount(prev => prev + 1);
                    setMessage("Ups... 💩");
                    setTimeout(() => setMessage(""), 2000);
                }
            }
        }, 4000); // Move every 4 seconds

        return () => clearInterval(moveInterval);
    }, [animationType, poopCount]);

    // ... (Quest Trigger Effect) ...
    // Random Quest Trigger
    useEffect(() => {
        const interval = setInterval(() => {
            // 10% chance every 10 seconds if no quest active and idle
            if (!activeQuest && animationType === 'idle' && Math.random() < 0.1) {
                const randomRiddle = getRandomRiddle();
                setActiveQuest(randomRiddle);
                setMessage("Ich habe ein Rätsel für dich! 💡");
                audio.playClick(); // Sound cue
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [activeQuest, animationType]);

    // Decay logic
    useEffect(() => {
        const now = Date.now();
        const timeDiff = now - buddy.lastInteraction;
        const hoursPassed = timeDiff / (1000 * 60 * 60);
        if (hoursPassed > 1) {
            const decay = Math.floor(hoursPassed * 5);
            const newBuddy = {
                ...buddy,
                hunger: Math.max(0, buddy.hunger - decay),
                energy: Math.max(0, buddy.energy - decay),
                mood: Math.max(0, buddy.mood - decay),
                lastInteraction: now
            };
            onUpdate(newBuddy);
        }
    }, []);

    const handleClean = () => {
        if (poopCount > 0) {
            audio.playClick();
            setPoopCount(0);
            setMessage("Alles sauber! ✨");
            setAnimationType('happy');
            
            // Boost mood slightly for cleaning
            const newBuddy = { ...buddy, mood: Math.min(100, buddy.mood + 10) };
            onUpdate(newBuddy);

            setTimeout(() => {
                setMessage("");
                setAnimationType('idle');
            }, 2000);
        } else {
            setMessage("Schon sauber! ✨");
            setTimeout(() => setMessage(""), 1500);
        }
    };

    const handleInteract = (type: 'pet' | 'feed' | 'sleep') => {

        if (animationType !== 'idle') return;

        audio.playClick();
        let newBuddy = { ...buddy, lastInteraction: Date.now() };
        let msg = "";

        if (type === 'pet') {
            setAnimationType('happy');
            newBuddy.mood = Math.min(100, newBuddy.mood + 15);
            newBuddy.xp += 10;
            msg = "So happy! 💕";
        } else if (type === 'feed') {
            setAnimationType('eating');
            newBuddy.hunger = Math.min(100, newBuddy.hunger + 20);
            newBuddy.energy = Math.min(100, newBuddy.energy + 5);
            newBuddy.xp += 5;
            msg = "Yummy! 🍎";
        } else if (type === 'sleep') {
            setAnimationType('sleeping');
            newBuddy.energy = Math.min(100, newBuddy.energy + 30);
            msg = "Zzz...";
        }

        if (newBuddy.xp >= newBuddy.level * 100) {
            newBuddy.level += 1;
            newBuddy.xp = 0;
            msg = `Level Up! ${newBuddy.level} 🎉`;
            audio.playWin();
        }

        setMessage(msg);
        onUpdate(newBuddy);

        setTimeout(() => {
            setAnimationType('idle');
            setMessage("");
        }, 2000);
    };

    const submitQuest = () => {
        if (!activeQuest) return;

        if (questInput.toLowerCase().trim() === activeQuest.answer) {
            // Correct
            audio.playWin();
            setMessage(`Richtig! +${activeQuest.reward.xp} XP`);
            setAnimationType('happy');

            const newBuddy = {
                ...buddy,
                xp: buddy.xp + activeQuest.reward.xp,
                mood: Math.min(100, buddy.mood + 20)
            };
            // Level up check
            if (newBuddy.xp >= newBuddy.level * 100) {
                newBuddy.level += 1;
                newBuddy.xp = 0;
                setMessage(`Richtig! & LEVEL UP! 🎉`);
            }

            onUpdate(newBuddy);
            setActiveQuest(null);
            setShowQuestModal(false);
            setQuestInput("");
        } else {
            // Wrong
            audio.playWrong();
            setMessage("Das war leider falsch...");
            setAnimationType('eating'); // Just a reaction
            setTimeout(() => setMessage(""), 2000);
        }
    };

    const SKINS = [
        { id: 'default', name: 'Cyan Core', color: '#22d3ee' },
        { id: 'gold', name: 'Golden Sun', color: '#FDB931' },
        { id: 'neon', name: 'Neon Pulse', color: '#ff00ff' },
        { id: 'obsidian', name: 'Obsidian', color: '#1f2937' },
        { id: 'ruby', name: 'Ruby Red', color: '#ef4444' },
        { id: 'emerald', name: 'Emerald', color: '#10b981' }
    ];

    // Brighter, Tamagotchi-style backgrounds
    const BACKGROUNDS = [
        { id: 'default', name: 'Pixel Sky', class: 'bg-gradient-to-b from-cyan-200 to-blue-300' },
        { id: 'sunset', name: 'Candy Sunset', class: 'bg-gradient-to-b from-pink-200 to-purple-300' },
        { id: 'forest', name: 'Happy Forest', class: 'bg-gradient-to-b from-green-200 to-emerald-300' },
        { id: 'night', name: 'Dreamy Night', class: 'bg-gradient-to-b from-indigo-300 to-purple-400' }
    ];

    const currentBg = BACKGROUNDS.find(b => b.id === (buddy.selectedBackground || 'default'))?.class || BACKGROUNDS[0].class;

    return (
        <div className={`w-full h-full flex flex-col relative overflow-hidden ${currentBg} transition-colors duration-500 rounded-3xl shadow-xl border-4 border-white`}>
            
            {/* Tamagotchi Header */}
            <div className="p-4 flex justify-between items-center relative z-10 bg-white/30 backdrop-blur-sm border-b border-white/20">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {onBack && (
                            <button onClick={onBack} className="p-2 hover:bg-white/40 rounded-full transition-colors bg-white/20">
                                <Play className="rotate-180 w-5 h-5 text-gray-700" fill="currentColor" />
                            </button>
                        )}
                        <h3 className="text-gray-800 font-black text-2xl tracking-wider drop-shadow-sm">{buddy.name}</h3>
                    </div>
                    <span className="text-xs text-gray-600 font-bold ml-9 bg-white/40 px-2 py-0.5 rounded-full">Lvl {buddy.level}</span>
                </div>
                <div className="flex gap-2 items-center">
                    {/* Compact Stats */}
                    <div className="flex gap-1">
                        <div className="flex flex-col items-center bg-white/40 p-1.5 rounded-lg" title="Hunger">
                            <Utensils size={12} className="text-orange-500 mb-1" />
                            <div className="h-8 w-2 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                                <div className={`w-full bg-orange-400 transition-all duration-500`} style={{ height: `${buddy.hunger}%` }}></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center bg-white/40 p-1.5 rounded-lg" title="Energy">
                            <Zap size={12} className="text-yellow-500 mb-1" />
                            <div className="h-8 w-2 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                                <div className={`w-full bg-yellow-400 transition-all duration-500`} style={{ height: `${buddy.energy}%` }}></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center bg-white/40 p-1.5 rounded-lg" title="Mood">
                            <Heart size={12} className="text-pink-500 mb-1" />
                            <div className="h-8 w-2 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                                <div className={`w-full bg-pink-400 transition-all duration-500`} style={{ height: `${buddy.mood}%` }}></div>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={() => setShowCustomize(!showCustomize)} className="p-3 bg-white rounded-xl shadow-md hover:scale-105 transition-transform border-2 border-white/50">
                        <SparklesIcon size={20} className="text-purple-500" />
                    </button>
                </div>
            </div>

            {/* Customization Panel */}
            {showCustomize && (
                <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-md p-6 flex flex-col animate-fade-in text-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-xl">Anpassen</h3>
                        <button onClick={() => setShowCustomize(false)} className="bg-gray-200 px-4 py-2 rounded-lg font-bold hover:bg-gray-300">Schließen</button>
                    </div>

                    <div className="space-y-6 overflow-y-auto flex-1">
                        <div>
                            <h4 className="text-sm text-gray-500 uppercase font-bold mb-3">Farbe / Skin</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {SKINS.map(skin => (
                                    <button
                                        key={skin.id}
                                        onClick={() => onUpdate({ ...buddy, skin: skin.id })}
                                        className={`p-3 rounded-xl border-2 ${buddy.skin === skin.id ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'} flex flex-col items-center gap-2 transition-all`}
                                    >
                                        <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: skin.color }}></div>
                                        <span className="text-xs font-bold text-gray-600">{skin.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm text-gray-500 uppercase font-bold mb-3">Hintergrund</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {BACKGROUNDS.map(bg => (
                                    <button
                                        key={bg.id}
                                        onClick={() => onUpdate({ ...buddy, selectedBackground: bg.id })}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${buddy.selectedBackground === bg.id ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'} ${bg.class}`}
                                    >
                                        <span className="text-sm font-bold text-white drop-shadow-md">{bg.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quest Modal - Improved UI */}
            {showQuestModal && activeQuest && (
                <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-md p-6 flex flex-col items-center justify-center animate-fade-in">
                    <div className="bg-white border-4 border-purple-400 p-6 rounded-3xl w-full max-w-md shadow-2xl transform scale-100 transition-transform">
                        <div className="flex justify-center -mt-12 mb-4">
                            <div className="bg-purple-500 text-white p-4 rounded-full shadow-lg border-4 border-white">
                                <Brain size={32} />
                            </div>
                        </div>
                        
                        <h3 className="text-center text-xl font-black text-purple-600 mb-2">RÄTSELZEIT!</h3>
                        <div className="bg-purple-50 p-4 rounded-xl mb-6 border border-purple-100">
                            <p className="text-gray-700 text-center font-medium text-lg leading-relaxed">{activeQuest.question}</p>
                        </div>

                        <input
                            type="text"
                            value={questInput}
                            onChange={(e) => setQuestInput(e.target.value)}
                            placeholder="Deine Antwort..."
                            className="w-full bg-gray-100 border-2 border-gray-300 rounded-xl px-4 py-4 text-gray-800 mb-4 focus:border-purple-500 focus:bg-white outline-none font-bold text-center text-lg"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button onClick={() => setShowQuestModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 bg-gray-50">Später</button>
                            <button onClick={submitQuest} className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 shadow-lg transform active:scale-95 transition-all">Lösen</button>
                        </div>
                    </div>
                </div>
            )}

                {/* 2D Buddy Container */}
                <div className="relative flex-1 w-full mb-0 overflow-hidden flex items-center justify-center">
                    {message && (
                        <div className="absolute top-8 animate-bounce bg-white text-gray-800 px-6 py-3 rounded-2xl font-black shadow-xl z-20 whitespace-nowrap pointer-events-none border-2 border-gray-100 text-sm">
                            {message}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b-2 border-r-2 border-gray-100"></div>
                        </div>
                    )}

                    {/* Poops */}
                    {Array.from({ length: poopCount }).map((_, i) => (
                        <div 
                            key={i} 
                            className="absolute text-4xl animate-bounce cursor-pointer hover:scale-110 transition-transform"
                            style={{ left: `${20 + i * 20}%`, bottom: '20%' }}
                            onClick={handleClean}
                        >
                            💩
                        </div>
                    ))}

                    {/* Active Quest Indicator */}
                    {activeQuest && !showQuestModal && (
                        <button
                            onClick={() => setShowQuestModal(true)}
                            className="absolute top-24 left-1/2 -translate-x-1/2 z-20 animate-bounce bg-yellow-400 text-black px-4 py-2 rounded-full font-black shadow-[0_4px_0_rgb(202,138,4)] hover:translate-y-1 hover:shadow-none transition-all border-2 border-white"
                        >
                            ? RÄTSEL LÖSEN ?
                        </button>
                    )}

                    {/* 2D Character */}
                    <div onClick={() => handleInteract('pet')} className="cursor-pointer w-full h-full">
                        <CuteBuddy2D buddy={buddy} animationType={animationType} position={position} />
                    </div>

                    {/* Floating Particles for Atmosphere */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-50"></div>
                        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full animate-pulse opacity-30"></div>
                        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-bounce opacity-60"></div>
                    </div>
                </div>

                {/* Control Bar - Tamagotchi Buttons */}
                <div className="p-4 pb-6 bg-white/20 backdrop-blur-md border-t border-white/20">
                    <div className="grid grid-cols-5 gap-2 max-w-lg mx-auto">
                        <button
                            onClick={() => handleInteract('feed')}
                            disabled={animationType !== 'idle'}
                            className="group flex flex-col items-center gap-1"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all group-hover:bg-orange-50 border-2 border-gray-100">
                                <Utensils size={20} className="text-orange-500 group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wider bg-white/50 px-2 rounded-full">Essen</span>
                        </button>

                        <button
                            onClick={() => handleInteract('pet')}
                            disabled={animationType !== 'idle'}
                            className="group flex flex-col items-center gap-1"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all group-hover:bg-pink-50 border-2 border-gray-100">
                                <Heart size={20} className="text-pink-500 group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wider bg-white/50 px-2 rounded-full">Liebe</span>
                        </button>

                        <button
                            onClick={handleClean}
                            disabled={poopCount === 0 && animationType !== 'idle'}
                            className="group flex flex-col items-center gap-1"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all group-hover:bg-blue-50 border-2 border-gray-100">
                                <SparklesIcon size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wider bg-white/50 px-2 rounded-full">Putzen</span>
                        </button>

                        <button
                            onClick={() => handleInteract('sleep')}
                            disabled={animationType !== 'idle'}
                            className="group flex flex-col items-center gap-1"
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_0_#e5e7eb] active:shadow-none active:translate-y-1 transition-all group-hover:bg-yellow-50 border-2 border-gray-100">
                                <Zap size={20} className="text-yellow-500 group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-wider bg-white/50 px-2 rounded-full">Schlaf</span>
                        </button>

                        <button
                            onClick={onPlay}
                            className="group flex flex-col items-center gap-1"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_4px_0_#4c1d95] active:shadow-none active:translate-y-1 transition-all border-2 border-purple-400">
                                <Play size={20} className="text-white group-hover:scale-110 transition-transform" fill="currentColor" />
                            </div>
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-purple-500/80 px-2 rounded-full shadow-sm">Game</span>
                        </button>
                    </div>
                </div>

        </div>
    );
};
