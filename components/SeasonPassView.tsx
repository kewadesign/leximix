import React, { useRef, useEffect } from 'react';
import { ArrowLeft, Crown, Lock, Check, Sparkles, Zap, Box, Star, Image as ImageIcon, Coins, Gem } from 'lucide-react';
import { UserState, SeasonReward } from '../types';
import { SEASON_REWARDS, getCurrentSeason, TRANSLATIONS } from '../constants';
import { audio } from '../utils/audio';

interface Props {
    user: UserState;
    rewards: SeasonReward[];
    onClose: () => void;
    onClaim: (level: number, isPremium: boolean) => void;
    onShowPremium: () => void;
}

export const SeasonPassView: React.FC<Props> = ({ user, rewards, onClose, onClaim, onShowPremium }) => {
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
        <div className="h-full flex flex-col relative overflow-hidden geo-pattern geo-shapes geo-confetti" style={{ background: 'var(--color-bg)' }}>
            {/* Rainbow Top Bar */}
            <div className="flex h-4 w-full">
                <div className="flex-1" style={{ background: '#FF006E' }}></div>
                <div className="flex-1" style={{ background: '#FF7F00' }}></div>
                <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
                <div className="flex-1" style={{ background: '#06FFA5' }}></div>
                <div className="flex-1" style={{ background: '#8338EC' }}></div>
            </div>

            {/* Header - Neo Brutal */}
            <div
                className="mx-4 mt-4 p-4 flex items-center justify-between z-20"
                style={{ background: 'var(--color-surface)', border: '4px solid #000', boxShadow: '6px 6px 0px #000' }}
            >
                <button
                    onClick={onClose}
                    className="w-12 h-12 flex items-center justify-center transition-all active:translate-y-1"
                    style={{ background: '#FF006E', border: '3px solid #000', boxShadow: '4px 4px 0px #000' }}
                >
                    <ArrowLeft size={24} style={{ color: '#000' }} />
                </button>
                <div className="flex flex-col items-center flex-1 mx-4">
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide mb-2" style={{ color: 'var(--color-text)' }}>
                        {t.SEASON.TITLE}
                    </h2>

                    {/* Level & XP */}
                    <div className="flex items-center gap-3">
                        <div
                            className="px-4 py-2 font-black text-sm uppercase flex items-center gap-2"
                            style={{ background: user.isPremium ? '#FFBE0B' : '#8338EC', color: user.isPremium ? '#000' : '#FFF', border: '3px solid #000' }}
                        >
                            {user.isPremium && <Crown size={16} fill="currentColor" />}
                            LVL {user.level}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-32 h-4" style={{ background: '#000', border: '2px solid #000' }}>
                                <div
                                    className="h-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(5, user.xp % 100))}%`, background: '#06FFA5' }}
                                ></div>
                            </div>
                            <span className="text-xs font-black" style={{ color: 'var(--color-text)' }}>{user.xp % 100}/100</span>
                        </div>
                    </div>

                    <div className="mt-2 text-xs font-black uppercase" style={{ color: '#FF7F00' }}>
                        {Math.max(0, Math.ceil((currentSeason.endDate - Date.now()) / (1000 * 60 * 60 * 24)))} Tage übrig
                    </div>
                </div>
                <div className="w-12"></div>
            </div>

            {/* Premium CTA */}
            {!user.isPremium && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
                    <button
                        onClick={onShowPremium}
                        className="px-8 py-4 font-black uppercase text-lg flex items-center gap-3 transition-all"
                        style={{
                            background: '#FFBE0B',
                            color: '#000',
                            border: '4px solid #000',
                            boxShadow: '8px 8px 0px #000'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '12px 12px 0px #000';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '8px 8px 0px #000';
                        }}
                    >
                        <Crown size={24} fill="currentColor" />
                        Premium Aktivieren
                    </button>
                </div>
            )}

            {/* Reward Legend - Neo Brutal */}
            <div
                className="mx-4 mt-4 p-3 flex flex-wrap items-center justify-center gap-4 text-xs font-black uppercase z-20"
                style={{ background: 'var(--color-surface)', border: '3px solid #000' }}
            >
                <div className="flex items-center gap-2">
                    <div className="p-1" style={{ background: '#8338EC', border: '2px solid #000' }}><Sparkles size={14} style={{ color: '#FFF' }} /></div>
                    <span style={{ color: 'var(--color-text)' }}>Frame</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="p-1" style={{ background: '#0096FF', border: '2px solid #000' }}><ImageIcon size={14} style={{ color: '#FFF' }} /></div>
                    <span style={{ color: 'var(--color-text)' }}>Avatar</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="p-1" style={{ background: '#FFBE0B', border: '2px solid #000' }}><Zap size={14} style={{ color: '#000' }} /></div>
                    <span style={{ color: 'var(--color-text)' }}>Booster</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="p-1" style={{ background: '#FF7F00', border: '2px solid #000' }}><Coins size={14} style={{ color: '#000' }} /></div>
                    <span style={{ color: 'var(--color-text)' }}>Münzen</span>
                </div>
            </div>

            {/* Scroll Track - Neo Brutal Colorful */}
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
                <div className="flex items-center h-full px-[50vw] min-w-max gap-6 py-8">
                    {/* Rainbow Stepped Track Line */}
                    <div
                        className="absolute top-1/2 left-0 right-0 h-6 -translate-y-1/2 z-0 flex"
                        style={{ border: '3px solid #000' }}
                    >
                        {/* Rainbow segments */}
                        <div className="flex-1" style={{ background: '#FF006E' }}></div>
                        <div className="flex-1" style={{ background: '#FF7F00' }}></div>
                        <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
                        <div className="flex-1" style={{ background: '#06FFA5' }}></div>
                        <div className="flex-1" style={{ background: '#0096FF' }}></div>
                        <div className="flex-1" style={{ background: '#8338EC' }}></div>
                    </div>
                    {/* Progress overlay (gray over unfinished) */}
                    <div
                        className="absolute top-1/2 h-6 -translate-y-1/2 z-1 transition-all duration-1000"
                        style={{
                            left: `${(user.level / 100) * 100}%`,
                            right: 0,
                            background: '#E5E5E5',
                            borderRight: '3px solid #000',
                            borderTop: '3px solid #000',
                            borderBottom: '3px solid #000'
                        }}
                    ></div>

                    {rewards.map((item, index) => {
                        const lvl = item.level;
                        const isUnlocked = user.level >= lvl;

                        const isFreeClaimed = user.claimedSeasonRewards?.includes(lvl);
                        const isPremiumClaimed = user.claimedPremiumRewards?.includes(lvl);

                        const canClaimFree = isUnlocked && !isFreeClaimed;
                        const canClaimPremium = isUnlocked && !isPremiumClaimed;

                        const isNext = user.level + 1 === lvl;

                        const premiumReward = item.premium;
                        const freeReward = item.free;

                        // Rotating colors for cards
                        const colors = ['#FF006E', '#FF7F00', '#FFBE0B', '#06FFA5', '#8338EC', '#0096FF'];
                        const cardColor = colors[index % colors.length];

                        return (
                            <div
                                key={lvl}
                                className="flex flex-col items-center justify-center relative w-52 h-full shrink-0 snap-center group"
                            >
                                {/* Level Node (Center) - Bigger & Colorful */}
                                <div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 z-10 flex items-center justify-center text-base font-black transition-all"
                                    style={{
                                        background: isUnlocked ? cardColor : '#E5E5E5',
                                        color: isUnlocked ? '#FFF' : '#999',
                                        border: '4px solid #000',
                                        boxShadow: isUnlocked ? '5px 5px 0px #000' : '2px 2px 0px #999',
                                        transform: isNext ? 'translate(-50%, -50%) scale(1.3)' : 'translate(-50%, -50%)'
                                    }}
                                >
                                    {lvl}
                                </div>

                                {/* PREMIUM REWARD (TOP) - Bigger */}
                                <div className={`absolute bottom-[55%] flex flex-col items-center justify-end h-44 w-full transition-all ${isUnlocked ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                    <div
                                        className="px-3 py-1 text-[10px] font-black uppercase mb-2"
                                        style={{ background: '#FFBE0B', color: '#000', border: '2px solid #000' }}
                                    >
                                        Premium
                                    </div>

                                    {premiumReward ? (
                                        <div
                                            className="relative w-36 p-4 flex flex-col items-center transition-all group-hover:-translate-y-3"
                                            style={{
                                                background: 'var(--color-surface)',
                                                border: '4px solid #000',
                                                boxShadow: `8px 8px 0px ${cardColor}`
                                            }}
                                        >
                                            {!user.isPremium && (
                                                <Lock size={12} style={{ color: '#999' }} className="absolute top-2 right-2" />
                                            )}

                                            {premiumReward.type === 'avatar' ? (
                                                <img
                                                    src={premiumReward.preview}
                                                    alt="Avatar"
                                                    className="w-12 h-12 object-cover"
                                                    style={{ border: '3px solid #000' }}
                                                />
                                            ) : premiumReward.type === 'effect' ? (
                                                premiumReward.icon && premiumReward.icon.startsWith('/') ? (
                                                    <img
                                                        src={premiumReward.icon}
                                                        alt="Frame"
                                                        className="w-12 h-12 object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-4xl">{premiumReward.icon || '✨'}</span>
                                                )
                                            ) : premiumReward.type === 'mystery' ? (
                                                <Box size={36} style={{ color: '#8338EC' }} />
                                            ) : premiumReward.type === 'booster' ? (
                                                <Zap size={36} style={{ color: '#FFBE0B' }} />
                                            ) : premiumReward.type === 'card_pack' ? (
                                                <div className="text-4xl">📦</div>
                                            ) : (
                                                <Gem size={28} style={{ color: '#0096FF' }} />
                                            )}

                                            <div className="mt-2 text-center">
                                                <div className="text-[10px] font-black uppercase" style={{ color: 'var(--color-text)' }}>{premiumReward.type}</div>
                                                <div className="text-[9px] font-bold" style={{ color: '#666' }}>{premiumReward.amount ? `x${premiumReward.amount}` : 'Rare'}</div>
                                            </div>

                                            {canClaimPremium && user.isPremium && (
                                                <button
                                                    onClick={() => { audio.playWin(); onClaim(lvl, true); }}
                                                    className="absolute -bottom-3 px-3 py-1 text-[9px] font-black uppercase flex items-center gap-1"
                                                    style={{ background: '#06FFA5', color: '#000', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}
                                                >
                                                    <Check size={10} /> Claim
                                                </button>
                                            )}
                                            {isPremiumClaimed && (
                                                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                                                    <div className="p-2" style={{ background: '#06FFA5', border: '3px solid #000' }}>
                                                        <Check size={20} style={{ color: '#000' }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-1 h-8" style={{ background: '#CCC' }}></div>
                                    )}
                                </div>

                                {/* FREE REWARD (BOTTOM) - Bigger */}
                                <div className={`absolute top-[55%] flex flex-col items-center justify-start h-44 w-full transition-all ${isUnlocked ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                                    <div
                                        className="px-3 py-1 text-[10px] font-black uppercase mt-10 mb-2"
                                        style={{ background: '#06FFA5', color: '#000', border: '2px solid #000' }}
                                    >
                                        Free
                                    </div>

                                    {freeReward ? (
                                        <div
                                            className="relative w-32 p-4 flex flex-col items-center transition-all group-hover:translate-y-3"
                                            style={{
                                                background: 'var(--color-surface)',
                                                border: '4px solid #000',
                                                boxShadow: '6px 6px 0px #000'
                                            }}
                                        >
                                            {freeReward.type === 'coins' ? (
                                                <Coins size={36} style={{ color: '#FFBE0B' }} />
                                            ) : freeReward.type === 'sticker' ? (
                                                <Star size={36} style={{ color: '#FF006E' }} />
                                            ) : freeReward.type === 'card_pack' ? (
                                                <div className="text-4xl">📦</div>
                                            ) : (
                                                <Coins size={32} style={{ color: '#FFBE0B' }} />
                                            )}

                                            <div className="mt-2 text-center">
                                                <div className="text-[11px] font-black uppercase" style={{ color: 'var(--color-text)' }}>{freeReward.type}</div>
                                                {freeReward.amount && <div className="text-[10px] font-bold" style={{ color: '#666' }}>x{freeReward.amount}</div>}
                                            </div>

                                            {canClaimFree && (
                                                <button
                                                    onClick={() => { audio.playWin(); onClaim(lvl, false); }}
                                                    className="absolute -bottom-4 px-4 py-1.5 text-[10px] font-black uppercase"
                                                    style={{ background: '#06FFA5', color: '#000', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}
                                                >
                                                    CLAIM
                                                </button>
                                            )}
                                            {isFreeClaimed && (
                                                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                                                    <div className="p-2" style={{ background: '#06FFA5', border: '3px solid #000' }}>
                                                        <Check size={20} style={{ color: '#000' }} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-1 h-8" style={{ background: '#CCC' }}></div>
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
