import React, { useState, useEffect } from 'react';
import { Heart, Zap, Utensils, Sparkles, Smile, Frown, Meh, Play } from 'lucide-react';
import { BuddyState } from '../types';
import { audio } from '../utils/audio';

interface Props {
    buddy: BuddyState;
    onUpdate: (newBuddy: BuddyState) => void;
    onPlay: () => void; // Go to game
}

export const SphereBuddy: React.FC<Props> = ({ buddy, onUpdate, onPlay }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationType, setAnimationType] = useState<'idle' | 'happy' | 'eating' | 'sleeping'>('idle');
    const [message, setMessage] = useState<string>("");

    // Decay stats over time (simulated on mount for now, could be interval)
    useEffect(() => {
        const now = Date.now();
        const timeDiff = now - buddy.lastInteraction;
        const hoursPassed = timeDiff / (1000 * 60 * 60);

        if (hoursPassed > 1) {
            // Decay logic
            const decay = Math.floor(hoursPassed * 5); // 5 points per hour
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

    const handleInteract = (type: 'pet' | 'feed' | 'sleep') => {
        if (isAnimating) return;
        setIsAnimating(true);
        audio.playClick();

        let newBuddy = { ...buddy, lastInteraction: Date.now() };
        let msg = "";

        if (type === 'pet') {
            setAnimationType('happy');
            newBuddy.mood = Math.min(100, newBuddy.mood + 15);
            newBuddy.xp += 10;
            msg = "Purr! 💕";
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

        // Level Up Check
        if (newBuddy.xp >= newBuddy.level * 100) {
            newBuddy.level += 1;
            newBuddy.xp = 0;
            msg = `Level Up! ${newBuddy.level} 🎉`;
            audio.playWin();
        }

        setMessage(msg);
        onUpdate(newBuddy);

        setTimeout(() => {
            setIsAnimating(false);
            setAnimationType('idle');
            setMessage("");
        }, 2000);
    };

    // Visuals based on state
    const getSphereColor = () => {
        if (buddy.skin === 'default') return 'from-cyan-400 to-blue-600';
        if (buddy.skin === 'gold') return 'from-yellow-300 to-orange-500';
        if (buddy.skin === 'neon') return 'from-purple-500 to-pink-500';
        return 'from-cyan-400 to-blue-600';
    };

    const getExpression = () => {
        if (animationType === 'sleeping') return '(-_-) zZZ';
        if (animationType === 'eating') return '(O_O) nom';
        if (animationType === 'happy') return '(^‿^)';
        if (buddy.mood < 30) return '(T_T)';
        if (buddy.hunger < 30) return '(>_<)';
        return '(•_•)';
    };

    return (
        <div className="w-full max-w-md mx-auto bg-black/20 backdrop-blur-lg rounded-3xl p-6 border border-white/10 shadow-2xl animate-fade-in">

            {/* Header Stats */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-col">
                    <h3 className="text-white font-black text-xl tracking-wider">{buddy.name}</h3>
                    <span className="text-xs text-cyan-400 font-bold">Lvl {buddy.level}</span>
                </div>
                <div className="flex gap-2">
                    {/* Stat Bars */}
                    <div className="flex flex-col gap-1 w-24">
                        <div className="flex justify-between text-[10px] text-gray-400"><span>HUNGER</span><span>{buddy.hunger}%</span></div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full ${buddy.hunger < 30 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${buddy.hunger}%` }}></div></div>

                        <div className="flex justify-between text-[10px] text-gray-400"><span>ENERGY</span><span>{buddy.energy}%</span></div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full ${buddy.energy < 30 ? 'bg-red-500' : 'bg-yellow-400'}`} style={{ width: `${buddy.energy}%` }}></div></div>

                        <div className="flex justify-between text-[10px] text-gray-400"><span>MOOD</span><span>{buddy.mood}%</span></div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full ${buddy.mood < 30 ? 'bg-red-500' : 'bg-pink-500'}`} style={{ width: `${buddy.mood}%` }}></div></div>
                    </div>
                </div>
            </div>

            {/* Sphere Display */}
            <div className="relative h-64 flex items-center justify-center mb-8">
                {/* Message Bubble */}
                {message && (
                    <div className="absolute top-0 animate-bounce bg-white text-black px-4 py-2 rounded-xl rounded-bl-none font-bold shadow-lg z-20">
                        {message}
                    </div>
                )}

                {/* The Sphere */}
                <div
                    onClick={() => handleInteract('pet')}
                    className={`
                w-48 h-48 rounded-full bg-gradient-to-br ${getSphereColor()}
                shadow-[0_0_50px_rgba(34,211,238,0.3)]
                flex items-center justify-center
                cursor-pointer transition-all duration-500
                ${isAnimating && animationType === 'happy' ? 'scale-110 rotate-12' : ''}
                ${isAnimating && animationType === 'eating' ? 'scale-95' : ''}
                ${!isAnimating ? 'animate-float' : ''}
                hover:shadow-[0_0_80px_rgba(34,211,238,0.5)]
            `}
                >
                    {/* Face */}
                    <div className="text-white/90 font-black text-4xl tracking-widest drop-shadow-md">
                        {getExpression()}
                    </div>

                    {/* Shine */}
                    <div className="absolute top-8 left-8 w-12 h-6 bg-white/20 rounded-full rotate-[-45deg] blur-sm"></div>
                </div>

                {/* Shadow */}
                <div className="absolute bottom-4 w-32 h-4 bg-black/50 rounded-full blur-xl animate-pulse"></div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-4 gap-3">
                <button
                    onClick={() => handleInteract('feed')}
                    disabled={isAnimating}
                    className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50"
                >
                    <Utensils size={20} className="text-orange-400" />
                    <span className="text-[10px] font-bold text-gray-300">Füttern</span>
                </button>

                <button
                    onClick={() => handleInteract('pet')}
                    disabled={isAnimating}
                    className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50"
                >
                    <Heart size={20} className="text-pink-400" />
                    <span className="text-[10px] font-bold text-gray-300">Liebe</span>
                </button>

                <button
                    onClick={() => handleInteract('sleep')}
                    disabled={isAnimating}
                    className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50"
                >
                    <Zap size={20} className="text-yellow-400" />
                    <span className="text-[10px] font-bold text-gray-300">Schlafen</span>
                </button>

                <button
                    onClick={onPlay}
                    className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-lg"
                >
                    <Play size={20} className="text-white" fill="currentColor" />
                    <span className="text-[10px] font-bold text-white">SPIELEN</span>
                </button>
            </div>

        </div>
    );
};
