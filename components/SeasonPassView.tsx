import React, { useRef, useEffect } from 'react';
import { ArrowLeft, Crown, Lock, Check, Sparkles, Zap, Box, Star, Image as ImageIcon, Coins, Gem } from 'lucide-react';
import { UserState, SeasonReward } from '../types';
import { SEASON_REWARDS, getCurrentSeason } from '../constants';
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

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:bg-[#0b1120] relative overflow-hidden animate-fade-in transition-colors duration-500">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-slate-900 to-cyan-900/30 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>

            {/* Header */}
            <div className="p-4 flex items-center justify-between z-20 backdrop-blur-md bg-white/30 dark:bg-black/20 border-b border-gray-200/20 dark:border-white/5 shadow-sm dark:shadow-none transition-colors">
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/10">
                    <ArrowLeft size={20} className="text-gray-800 dark:text-white" />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 uppercase tracking-tighter drop-shadow-sm">
                        Season 2: Neon Uprising
                    </h2>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                            {user.isPremium && <Crown size={14} className="text-yellow-400" fill="currentColor" />}
                            Level {user.level}
                        </span>
                        <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${user.xp % 100}%` }}></div>
                        </div>
                        <span>{user.xp % 100}/100 XP</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                        <span>Gesamt XP: {user.xp}</span>
                        <span>•</span>
                        <span>{formatDate(currentSeason.startDate)} - {formatDate(currentSeason.endDate)}</span>
                    </div>
                </div>
                <div className="w-10"></div>
            </div>

            {/* Premium CTA */}
            {!user.isPremium && (
                <div className="absolute top-32 left-1/2 -translate-x-1/2 z-30 animate-bounce-slow">
                    <button
                        onClick={onShowPremium}
                        className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full font-black uppercase hover:brightness-110 transition-all shadow-[0_0_30px_rgba(8,145,178,0.5)] flex items-center gap-2 border-2 border-white/20"
                    >
                        <Crown size={20} fill="currentColor" className="text-yellow-300" />
                        Premium Aktivieren
                    </button>
                </div>
            )}

            {/* Reward Legend */}
            <div className="px-4 py-2 bg-white/30 dark:bg-black/20 border-y border-gray-200/20 dark:border-white/5 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-wider z-20">
                <div className="flex items-center gap-1">
                    <Sparkles size={12} className="text-purple-500 dark:text-purple-400" />
                    <span className="text-gray-600 dark:text-gray-400">Frame</span>
                </div>
                <div className="flex items-center gap-1">
                    <ImageIcon size={12} className="text-blue-500 dark:text-blue-400" />
                    <span className="text-gray-600 dark:text-gray-400">Avatar</span>
                </div>
                <div className="flex items-center gap-1">
                    <Zap size={12} className="text-yellow-500 dark:text-yellow-400" />
                    <span className="text-gray-600 dark:text-gray-400">Booster</span>
                </div>
                <div className="flex items-center gap-1">
                    <Coins size={12} className="text-yellow-600 dark:text-yellow-300" />
                    <span className="text-gray-600 dark:text-gray-400">Münzen</span>
                </div>
            </div>

            {/* Scroll Track */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto overflow-y-hidden p-0 scrollbar-hide relative"
                onWheel={(e) => {
                    if (scrollRef.current) {
                        scrollRef.current.scrollLeft += e.deltaY;
                        e.preventDefault();
                    }
                }}
            >
                <div className="flex items-center h-full px-[50vw] min-w-max gap-0 py-8">
                    {/* Background Track Line */}
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-300 dark:bg-gray-800/50 -translate-y-1/2 z-0 backdrop-blur-sm"></div>
                    <div
                        className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 -translate-y-1/2 z-0 transition-all duration-1000 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                        style={{ width: `${(user.level / 100) * 100}%` }}
                    ></div>

                    {SEASON_REWARDS.map((item) => {
                        const lvl = item.level;
                        const isUnlocked = user.level >= lvl;
                        const isClaimed = user.claimedSeasonRewards?.includes(lvl);
                        const canClaim = isUnlocked && !isClaimed;
                        const isNext = user.level + 1 === lvl;

                        const premiumReward = item.premium;
                        const freeReward = item.free;

                        return (
                            <div
                                key={lvl}
                                className={`flex flex-col items-center justify-center relative w-48 h-full shrink-0 snap-center group perspective-1000`}
                            >
                                {/* Level Node (Center) */}
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 z-10 flex items-center justify-center text-xs font-bold transition-all duration-500
                                    ${isUnlocked ? 'bg-white border-cyan-500 text-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.6)] scale-110' : 'bg-gray-300 border-gray-400 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'}
                                    ${isNext ? 'animate-pulse ring-4 ring-cyan-400/20 dark:ring-white/20' : ''}
                                `}>
                                    {lvl}
                                </div>

                                {/* PREMIUM REWARD (TOP) */}
                                <div className={`absolute bottom-[55%] flex flex-col items-center justify-end h-32 w-full transition-all duration-300 ${isUnlocked ? 'opacity-100' : 'opacity-80 grayscale-[0.5]'}`}>
                                    <div className="absolute -top-8 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-yellow-500 to-orange-600 dark:from-yellow-400 dark:to-orange-500 bg-clip-text text-transparent drop-shadow-lg">Premium</div>

                                    {premiumReward ? (
                                        <div className={`relative w-28 h-32 bg-gradient-to-b from-indigo-100 to-slate-100 dark:from-indigo-900 dark:to-slate-900 rounded-2xl border-2 border-indigo-200 dark:border-indigo-500/30 p-3 flex flex-col items-center justify-between shadow-xl hover:scale-110 transition-transform hover:z-20 group-hover:shadow-indigo-500/40 ${isClaimed ? 'ring-2 ring-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 grayscale' : 'hover:shadow-indigo-500/20'}`}>
                                            <Lock size={12} className={`absolute top-2 right-2 text-indigo-400 ${user.isPremium ? 'hidden' : ''}`} />

                                            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                                                {/* Shine Effect */}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>

                                                {premiumReward.type === 'avatar' ? (
                                                    <img
                                                        src={premiumReward.preview}
                                                        alt="Avatar"
                                                        className="w-12 h-12 rounded-full border-2 border-white/20 shadow-md z-10 bg-gray-200 dark:bg-gray-800"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                                            e.currentTarget.parentElement!.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500 dark:text-white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                                                        }}
                                                    />
                                                ) : premiumReward.type === 'effect' ? (
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getEffectStyle(premiumReward.value as string)} z-10`}>
                                                        <Sparkles size={20} className="text-white drop-shadow-lg" />
                                                    </div>
                                                ) : premiumReward.type === 'mystery' ? (
                                                    <Box size={48} className="text-purple-500 dark:text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-bounce-slow z-10" />
                                                ) : premiumReward.type === 'booster' ? (
                                                    <Zap size={48} className="text-yellow-500 dark:text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse z-10" />
                                                ) : (
                                                    <Gem size={24} className="text-blue-400 dark:text-blue-300 drop-shadow-lg z-10" />
                                                )}
                                            </div>

                                            <div className="text-center w-full relative z-10">
                                                <div className="text-[10px] font-bold text-indigo-800 dark:text-indigo-200 truncate w-full">{premiumReward.type.toUpperCase()}</div>
                                                {premiumReward.amount && <div className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono">x{premiumReward.amount}</div>}
                                            </div>

                                            {canClaim && user.isPremium && (
                                                <button
                                                    onClick={() => { audio.playWin(); onClaim(lvl, true); }}
                                                    className="absolute -bottom-4 bg-yellow-400 text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform animate-bounce z-20"
                                                >
                                                    CLAIM
                                                </button>
                                            )}
                                            {isClaimed && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl z-20"><Check size={32} className="text-green-400 drop-shadow-lg" /></div>}
                                        </div>
                                    ) : (
                                        <div className="w-1 h-8 bg-white/5 rounded-full"></div>
                                    )}
                                </div>

                                {/* FREE REWARD (BOTTOM) */}
                                <div className={`absolute top-[55%] flex flex-col items-center justify-start h-32 w-full transition-all duration-300 ${isUnlocked ? 'opacity-100' : 'opacity-80 grayscale-[0.5]'}`}>
                                    <div className="absolute -top-2 text-xs font-black uppercase tracking-widest text-gray-500">Free</div>

                                    {freeReward ? (
                                        <div className={`relative w-24 h-28 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-white/20 dark:border-white/10 p-2 flex flex-col items-center justify-between shadow-lg hover:scale-105 transition-transform hover:z-20 group-hover:shadow-black/10 dark:group-hover:shadow-white/20 ${isClaimed ? 'opacity-50 grayscale' : 'hover:shadow-lg'}`}>

                                            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                                                {freeReward.type === 'coins' ? (
                                                    <Coins size={32} className="text-yellow-500 dark:text-yellow-400 drop-shadow-md z-10" />
                                                ) : freeReward.type === 'sticker' ? (
                                                    <Star size={32} className="text-pink-500 dark:text-pink-400 drop-shadow-md z-10" />
                                                ) : (
                                                    <Coins size={20} className="text-yellow-500 dark:text-yellow-400 drop-shadow-md z-10" />
                                                )}
                                            </div>

                                            <div className="text-center w-full relative z-10">
                                                <div className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">{freeReward.type.toUpperCase()}</div>
                                                {freeReward.amount && <div className="text-[8px] text-slate-500 dark:text-slate-500 font-mono">x{freeReward.amount}</div>}
                                            </div>

                                            {canClaim && (
                                                <button
                                                    onClick={() => { audio.playWin(); onClaim(lvl, false); }}
                                                    className="absolute -bottom-3 bg-green-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform animate-bounce z-20"
                                                >
                                                    CLAIM
                                                </button>
                                            )}
                                            {isClaimed && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl z-20"><Check size={24} className="text-green-400 drop-shadow-lg" /></div>}
                                        </div>
                                    ) : (
                                        <div className="w-1 h-8 bg-white/5 rounded-full"></div>
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
