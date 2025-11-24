import React, { useRef, useEffect } from 'react';
import { ArrowLeft, Crown, Lock, Check, Sparkles, Zap, Box, Star, Image as ImageIcon, Coins, Gem } from 'lucide-react';
import { UserState, SeasonReward } from '../types';
import { SEASON_REWARDS, getCurrentSeason, TRANSLATIONS } from '../constants';
import { audio } from '../utils/audio';

interface Props {
    user: UserState;
    onClose: () => void;
    onClaim: (level: number, isPremium: boolean) => void;
    onShowPremium: () => void;
}

export const SeasonPassView: React.FC<Props> = ({ user, onClose, onClaim, onShowPremium }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to current level on mount
    useEffect(() => {
        if (scrollRef.current) {
            const levelWidth = 192; // w-48 = 12rem = 192px
            const centerOffset = window.innerWidth / 2 - levelWidth / 2;
            const scrollPos = (user.level - 1) * levelWidth - centerOffset;
            scrollRef.current.scrollLeft = Math.max(0, scrollPos);
        }
    }, []);

    const getEffectStyle = (effectId: string) => {
        if (!effectId) return "";
        if (effectId.includes('glow')) return "shadow-[0_0_30px_rgba(255,255,255,0.6)] ring-4 ring-white/50 animate-pulse";
        if (effectId.includes('fire')) return "shadow-[0_0_30px_rgba(239,68,68,0.8)] ring-4 ring-red-500/50 animate-pulse";
        if (effectId.includes('ice')) return "shadow-[0_0_30px_rgba(6,182,212,0.8)] ring-4 ring-cyan-400/50 animate-pulse";
        if (effectId.includes('sparkle')) return "shadow-[0_0_30px_rgba(234,179,8,0.8)] ring-4 ring-yellow-300/50 animate-bounce-slow";
        if (effectId.includes('neon')) return "shadow-[0_0_30px_rgba(217,70,239,0.8)] ring-4 ring-fuchsia-500/50 animate-pulse";
        return "ring-2 ring-gray-500";
    };

    const currentSeason = getCurrentSeason();
    const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('de-DE');
    const t = TRANSLATIONS[user.language];

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0b1120] relative overflow-hidden animate-fade-in transition-colors duration-500">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
            
            {/* Dark Mode Specific Ambient Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
            
            {/* Light Mode Specific Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent pointer-events-none opacity-100 dark:opacity-0 transition-opacity duration-500"></div>

            {/* Header */}
            <div className="p-4 flex items-center justify-between z-20 backdrop-blur-xl bg-white/70 dark:bg-black/40 border-b border-gray-200 dark:border-white/10 shadow-sm transition-all">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 transition-all shadow-sm border border-gray-200 dark:border-white/10 group">
                    <ArrowLeft size={20} className="text-gray-700 dark:text-white group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex flex-col items-center w-full max-w-md mx-4">
                    <h2 className="text-xl md:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 uppercase tracking-tighter drop-shadow-sm mb-2">
                        {t.SEASON.TITLE}
                    </h2>
                    
                    {/* Level Indicator */}
                    <div className="flex items-center gap-2 text-sm font-black text-white uppercase tracking-widest mb-1">
                        {user.isPremium && <Crown size={16} className="text-yellow-400" fill="currentColor" />}
                        <span>Level {user.level}</span>
                    </div>

                    {/* XP Bar - Bigger & Better */}
                    <div className="w-full h-4 bg-gray-900/50 border border-white/10 rounded-full overflow-hidden relative mb-1 shadow-inner">
                        <div 
                            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500 relative" 
                            style={{ width: `${Math.min(100, Math.max(5, user.xp % 100))}%` }}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:10px_10px] animate-[shimmer_1s_linear_infinite]"></div>
                        </div>
                        {/* Text overlay on bar (optional, or keep below) */}
                    </div>
                    
                    <div className="flex justify-between w-full text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                        <span>{user.xp % 100} / 100 XP</span>
                        <span className="text-orange-400">{Math.max(0, Math.ceil((currentSeason.endDate - Date.now()) / (1000 * 60 * 60 * 24)))} Tage übrig</span>
                    </div>
                </div>
                <div className="w-10"></div>
            </div>

            {/* Premium CTA */}
            {!user.isPremium && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce-slow pointer-events-auto">
                    <button
                        onClick={onShowPremium}
                        className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full font-black uppercase hover:brightness-110 transition-all shadow-[0_0_40px_rgba(8,145,178,0.6)] flex items-center gap-3 border-4 border-white/20 text-lg hover:scale-105 active:scale-95"
                    >
                        <Crown size={24} fill="currentColor" className="text-yellow-300" />
                        Premium Aktivieren
                    </button>
                </div>
            )}

            {/* Reward Legend */}
            <div className="px-4 py-3 bg-white/80 dark:bg-black/40 border-y border-gray-200 dark:border-white/5 flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-widest z-20 backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/30"><Sparkles size={12} className="text-purple-600 dark:text-purple-400" /></div>
                    <span className="text-gray-600 dark:text-gray-400">Frame</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30"><ImageIcon size={12} className="text-blue-600 dark:text-blue-400" /></div>
                    <span className="text-gray-600 dark:text-gray-400">Avatar</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-yellow-100 dark:bg-yellow-900/30"><Zap size={12} className="text-yellow-600 dark:text-yellow-400" /></div>
                    <span className="text-gray-600 dark:text-gray-400">Booster</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-orange-100 dark:bg-orange-900/30"><Coins size={12} className="text-orange-600 dark:text-yellow-400" /></div>
                    <span className="text-gray-600 dark:text-gray-400">Münzen</span>
                </div>
            </div>

            {/* Scroll Track */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto overflow-y-hidden p-0 scrollbar-hide relative perspective-1000"
                onWheel={(e) => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollLeft += e.deltaY;
                        e.preventDefault();
                    }
                }}
            >
                <div className="flex items-center h-full px-[50vw] min-w-max gap-0 py-8">
                    {/* Background Track Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-3 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 z-0 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 inner-shadow"></div>
                    </div>
                    <div
                        className="absolute top-1/2 left-0 h-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 -translate-y-1/2 z-0 transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.5)] rounded-full relative overflow-hidden"
                        style={{ width: `${(user.level / 100) * 100}%` }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:20px_20px] animate-[shimmer_1s_linear_infinite]"></div>
                    </div>

                    {SEASON_REWARDS.map((item) => {
                        const lvl = item.level;
                        const isUnlocked = user.level >= lvl;
                        
                        const isFreeClaimed = user.claimedSeasonRewards?.includes(lvl);
                        const isPremiumClaimed = user.claimedPremiumRewards?.includes(lvl);
                        
                        const canClaimFree = isUnlocked && !isFreeClaimed;
                        const canClaimPremium = isUnlocked && !isPremiumClaimed;

                        const isNext = user.level + 1 === lvl;

                        const premiumReward = item.premium;
                        const freeReward = item.free;

                        return (
                            <div
                                key={lvl}
                                className={`flex flex-col items-center justify-center relative w-48 h-full shrink-0 snap-center group`}
                            >
                                {/* Level Node (Center) */}
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-4 z-10 flex items-center justify-center text-xs font-black transition-all duration-500
                                    ${isUnlocked 
                                        ? 'bg-white border-blue-500 text-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.4)] scale-110' 
                                        : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500'}
                                    ${isNext ? 'animate-pulse ring-4 ring-blue-400/30 dark:ring-blue-400/20 scale-125' : ''}
                                `}>
                                    {lvl}
                                </div>

                                {/* PREMIUM REWARD (TOP) */}
                                <div className={`absolute bottom-[55%] flex flex-col items-center justify-end h-40 w-full transition-all duration-500 ${isUnlocked ? 'opacity-100 translate-y-0' : 'opacity-60 grayscale-[0.8] translate-y-2'}`}>
                                    <div className="absolute -top-6 text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent drop-shadow-sm">Premium</div>

                                    {premiumReward ? (
                                        <div className={`relative w-32 h-36 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-white/10 p-1 flex flex-col items-center justify-between shadow-xl dark:shadow-black/50 transition-all duration-300 group-hover:-translate-y-4 group-hover:shadow-2xl
                                            ${isPremiumClaimed ? 'opacity-80' : 'hover:scale-105'}
                                            ${canClaimPremium && user.isPremium ? 'animate-bounce-slow ring-4 ring-yellow-400/30 border-yellow-400' : ''}
                                        `}>
                                            <div className="w-full h-full rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100 dark:from-indigo-950/50 dark:to-slate-900/80 overflow-hidden relative flex flex-col items-center justify-center border border-white/50 dark:border-white/5">
                                                <Lock size={14} className={`absolute top-3 right-3 text-indigo-300 dark:text-indigo-500/50 ${user.isPremium ? 'hidden' : ''}`} />

                                                {/* Inner Glow */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10"></div>

                                                {premiumReward.type === 'avatar' ? (
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
                                                        <img
                                                            src={premiumReward.preview}
                                                            alt="Avatar"
                                                            className="w-16 h-16 rounded-full border-4 border-white dark:border-white/10 shadow-lg z-10 bg-gray-100 dark:bg-gray-800 relative"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                                            }}
                                                        />
                                                    </div>
                                                ) : premiumReward.type === 'effect' ? (
                                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center ${getEffectStyle(premiumReward.value as string)} z-10 bg-black/5 dark:bg-white/5`}>
                                                        <Sparkles size={24} className="text-purple-500 dark:text-white drop-shadow-lg" />
                                                    </div>
                                                ) : premiumReward.type === 'mystery' ? (
                                                    <Box size={56} className="text-purple-500 dark:text-purple-400 drop-shadow-lg animate-bounce-slow z-10" />
                                                ) : premiumReward.type === 'booster' ? (
                                                    <Zap size={56} className="text-yellow-500 dark:text-yellow-400 drop-shadow-lg animate-pulse z-10" />
                                                ) : (
                                                    <Gem size={32} className="text-blue-400 dark:text-blue-300 drop-shadow-lg z-10" />
                                                )}

                                                <div className="mt-3 text-center relative z-10 px-2">
                                                    <div className="text-[10px] font-black text-gray-700 dark:text-white uppercase tracking-tight leading-tight truncate w-28">{premiumReward.type}</div>
                                                    <div className="text-[9px] text-gray-400 dark:text-gray-400 font-bold">{premiumReward.amount ? `x${premiumReward.amount}` : 'Rare'}</div>
                                                </div>
                                            </div>

                                            {canClaimPremium && user.isPremium && (
                                                <button
                                                    onClick={() => { audio.playWin(); onClaim(lvl, true); }}
                                                    className="absolute -bottom-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform z-30 flex items-center gap-1"
                                                >
                                                    <Check size={10} strokeWidth={4} /> Claim
                                                </button>
                                            )}
                                            {isPremiumClaimed && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-[1px] rounded-3xl z-20 transition-opacity duration-500">
                                                    <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
                                                        <Check size={24} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-1 h-12 bg-gray-200 dark:bg-white/5 rounded-full"></div>
                                    )}
                                </div>

                                {/* FREE REWARD (BOTTOM) */}
                                <div className={`absolute top-[55%] flex flex-col items-center justify-start h-40 w-full transition-all duration-500 ${isUnlocked ? 'opacity-100 translate-y-0' : 'opacity-60 grayscale-[0.8] -translate-y-2'}`}>
                                    <div className="absolute -top-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">Free</div>

                                    {freeReward ? (
                                        <div className={`relative w-24 h-28 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-1.5 flex flex-col items-center justify-between shadow-lg transition-all duration-300 group-hover:translate-y-2 group-hover:shadow-xl
                                            ${isFreeClaimed ? 'opacity-70' : 'hover:scale-105'}
                                            ${canClaimFree ? 'ring-2 ring-green-400/50 border-green-400' : ''}
                                        `}>

                                            <div className="w-full h-full rounded-xl bg-gray-50 dark:bg-black/20 flex flex-col items-center justify-center relative overflow-hidden">
                                                {freeReward.type === 'coins' ? (
                                                    <Coins size={32} className="text-yellow-500 dark:text-yellow-400 drop-shadow-md z-10" />
                                                ) : freeReward.type === 'sticker' ? (
                                                    <Star size={32} className="text-pink-500 dark:text-pink-400 drop-shadow-md z-10" />
                                                ) : (
                                                    <Coins size={20} className="text-yellow-500 dark:text-yellow-400 drop-shadow-md z-10" />
                                                )}
                                                
                                                <div className="mt-2 text-center w-full relative z-10">
                                                    <div className="text-[9px] font-bold text-gray-700 dark:text-gray-300 truncate w-full">{freeReward.type.toUpperCase()}</div>
                                                    {freeReward.amount && <div className="text-[8px] text-gray-400 font-mono">x{freeReward.amount}</div>}
                                                </div>
                                            </div>

                                            {canClaimFree && (
                                                <button
                                                    onClick={() => { audio.playWin(); onClaim(lvl, false); }}
                                                    className="absolute -bottom-3 bg-green-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-md hover:scale-105 active:scale-95 transition-transform z-20"
                                                >
                                                    CLAIM
                                                </button>
                                            )}
                                            {isFreeClaimed && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-2xl z-20">
                                                    <Check size={20} className="text-green-600 dark:text-green-400 drop-shadow-lg" strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-1 h-8 bg-gray-200 dark:bg-white/5 rounded-full"></div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div >
    );
};
