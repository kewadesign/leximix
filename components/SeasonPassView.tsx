import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Crown, Lock, Check, Zap, Box, Star, Image as ImageIcon, Coins, Gem, Gift, Type, Palette, CreditCard, X, Info, Frame } from 'lucide-react';
import { UserState, SeasonReward, SeasonRewardItem } from '../types';
import { SEASON_REWARDS, getCurrentSeason, TRANSLATIONS, PROFILE_FRAMES, PROFILE_EFFECTS, PROFILE_FONTS } from '../constants';
import { audio } from '../utils/audio';
import { getRarityColor } from '../utils/rewards';
import { RewardClaimModal } from './RewardClaimModal';
import { ClaimBurst } from './ParticleEffect';

// Reward Info Popup Component
interface RewardInfoProps {
    reward: SeasonRewardItem;
    isPremium: boolean;
    position: { x: number; y: number };
    onClose: () => void;
    language: string;
}

const RewardInfoPopup: React.FC<RewardInfoProps> = ({ reward, isPremium, position, onClose, language }) => {
    const getTypeLabel = () => {
        const labels: Record<string, Record<string, string>> = {
            avatar: { de: 'Avatar', en: 'Avatar', es: 'Avatar' },
            frame: { de: 'Rahmen', en: 'Frame', es: 'Marco' },
            effect: { de: 'Effekt', en: 'Effect', es: 'Efecto' },
            font: { de: 'Schriftart', en: 'Font', es: 'Fuente' },
            title: { de: 'Titel', en: 'Title', es: 'Título' },
            cardback: { de: 'Kartenrückseite', en: 'Card Back', es: 'Dorso de Carta' },
            coins: { de: 'Münzen', en: 'Coins', es: 'Monedas' },
            booster: { de: 'Booster', en: 'Booster', es: 'Potenciador' },
            sticker: { de: 'Sticker', en: 'Sticker', es: 'Pegatina' },
            sticker_pack: { de: 'Sticker-Paket', en: 'Sticker Pack', es: 'Paquete de Pegatinas' },
            mystery: { de: 'Geheimnis', en: 'Mystery', es: 'Misterio' },
        };
        return labels[reward.type]?.[language] || reward.type;
    };

    const getRarityLabel = () => {
        const labels: Record<string, Record<string, string>> = {
            common: { de: 'Gewöhnlich', en: 'Common', es: 'Común' },
            rare: { de: 'Selten', en: 'Rare', es: 'Raro' },
            epic: { de: 'Episch', en: 'Epic', es: 'Épico' },
            legendary: { de: 'Legendär', en: 'Legendary', es: 'Legendario' },
        };
        return labels[reward.rarity || 'common']?.[language] || reward.rarity || 'Common';
    };

    const getDescription = () => {
        const desc: Record<string, Record<string, string>> = {
            avatar: { 
                de: 'Ein einzigartiger Avatar für dein Profil', 
                en: 'A unique avatar for your profile', 
                es: 'Un avatar único para tu perfil' 
            },
            frame: { 
                de: 'Ein stylischer Rahmen um deinen Avatar', 
                en: 'A stylish frame around your avatar', 
                es: 'Un marco elegante alrededor de tu avatar' 
            },
            effect: { 
                de: 'Ein besonderer visueller Effekt', 
                en: 'A special visual effect', 
                es: 'Un efecto visual especial' 
            },
            font: { 
                de: 'Eine besondere Schriftart für deinen Namen', 
                en: 'A special font for your name', 
                es: 'Una fuente especial para tu nombre' 
            },
            title: { 
                de: 'Ein Titel der unter deinem Namen erscheint', 
                en: 'A title that appears under your name', 
                es: 'Un título que aparece bajo tu nombre' 
            },
            cardback: { 
                de: 'Ein Design für die Rückseite deiner Karten', 
                en: 'A design for the back of your cards', 
                es: 'Un diseño para el reverso de tus cartas' 
            },
            coins: { 
                de: 'Münzen zum Kaufen im Shop', 
                en: 'Coins to spend in the shop', 
                es: 'Monedas para gastar en la tienda' 
            },
            booster: { 
                de: 'Erhalte mehr XP für deine nächsten Spiele', 
                en: 'Get more XP for your next games', 
                es: 'Obtén más XP para tus próximos juegos' 
            },
        };
        return reward.desc || desc[reward.type]?.[language] || '';
    };

    // Get frame/effect preview
    const getFramePreview = () => {
        if (reward.type === 'frame') {
            const frame = PROFILE_FRAMES.find(f => f.id === reward.value);
            return frame?.cssClass || '';
        }
        return '';
    };

    const getEffectPreview = () => {
        if (reward.type === 'effect') {
            const effect = PROFILE_EFFECTS.find(e => e.id === reward.value);
            return effect?.cssClass || '';
        }
        return '';
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,0.7)' }}
        >
            <div 
                className="relative max-w-sm w-full animate-scale-in"
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--color-surface)',
                    border: '4px solid #000',
                    boxShadow: '8px 8px 0px #000'
                }}
            >
                {/* Header */}
                <div 
                    className="flex items-center justify-between p-3"
                    style={{ 
                        background: isPremium ? '#FFBE0B' : '#00D9FF',
                        borderBottom: '4px solid #000'
                    }}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{reward.icon || '🎁'}</span>
                        <span className="font-black text-black uppercase text-sm">{getTypeLabel()}</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:bg-black/10 transition-colors"
                    >
                        <X size={20} className="text-black" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Preview */}
                    <div className="flex justify-center">
                        {reward.type === 'avatar' && reward.preview ? (
                            <div className={`relative ${getEffectPreview()}`}>
                                <img 
                                    src={reward.preview} 
                                    alt={reward.name}
                                    className={`w-24 h-24 object-cover ${getFramePreview()}`}
                                    style={{ border: '4px solid #000' }}
                                />
                            </div>
                        ) : reward.type === 'frame' ? (
                            <div className="relative">
                                <div 
                                    className={`w-24 h-24 flex items-center justify-center ${getFramePreview()}`}
                                    style={{ background: '#8338EC', border: '4px solid #000' }}
                                >
                                    <span className="text-4xl">🖼️</span>
                                </div>
                            </div>
                        ) : reward.type === 'effect' ? (
                            <div className={`w-24 h-24 flex items-center justify-center relative ${getEffectPreview()}`} style={{ background: '#FF006E', border: '4px solid #000' }}>
                                <span className="text-4xl">{reward.icon || '✨'}</span>
                            </div>
                        ) : reward.type === 'font' ? (
                            <div 
                                className="px-6 py-4 flex flex-col items-center justify-center gap-2"
                                style={{ 
                                    background: 'linear-gradient(135deg, #8338EC, #FF006E)',
                                    border: '4px solid #000',
                                    boxShadow: '4px 4px 0px #000'
                                }}
                            >
                                <span className="text-3xl">🔤</span>
                                <span 
                                    className="text-xl text-white"
                                    style={{ fontFamily: reward.preview || 'inherit' }}
                                >
                                    Abc123
                                </span>
                            </div>
                        ) : reward.type === 'title' ? (
                            <div 
                                className="px-6 py-3 flex items-center justify-center"
                                style={{ 
                                    background: getRarityColor(reward.rarity || 'common'),
                                    border: '3px solid #000'
                                }}
                            >
                                <span className="text-xl font-black text-white">{reward.icon} {reward.name}</span>
                            </div>
                        ) : reward.type === 'cardback' ? (
                            <div 
                                className="w-20 h-28 flex items-center justify-center"
                                style={{ 
                                    background: 'linear-gradient(135deg, #8338EC, #FF006E)',
                                    border: '4px solid #000',
                                    boxShadow: '4px 4px 0px #000'
                                }}
                            >
                                <span className="text-3xl">🃏</span>
                            </div>
                        ) : reward.type === 'coins' ? (
                            <div className="flex items-center gap-2">
                                <Coins size={48} style={{ color: '#FFBE0B' }} />
                                <span className="text-4xl font-black" style={{ color: '#FFBE0B' }}>
                                    {reward.amount?.toLocaleString()}
                                </span>
                            </div>
                        ) : reward.type === 'booster' ? (
                            <div 
                                className="w-20 h-20 flex items-center justify-center"
                                style={{ background: '#FFBE0B', border: '4px solid #000' }}
                            >
                                <Zap size={40} className="text-black" />
                            </div>
                        ) : (
                            <div 
                                className="w-20 h-20 flex items-center justify-center"
                                style={{ background: '#8338EC', border: '4px solid #000' }}
                            >
                                <Gift size={40} className="text-white" />
                            </div>
                        )}
                    </div>

                    {/* Name & Rarity */}
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>
                            {reward.name}
                        </h3>
                        <div 
                            className="inline-block px-3 py-1 text-xs font-black uppercase"
                            style={{ 
                                background: getRarityColor(reward.rarity || 'common'),
                                color: reward.rarity === 'common' ? '#000' : '#FFF',
                                border: '2px solid #000'
                            }}
                        >
                            {getRarityLabel()}
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-center text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>
                        {getDescription()}
                    </p>

                    {/* Premium Badge */}
                    {isPremium && (
                        <div className="flex justify-center">
                            <div 
                                className="flex items-center gap-2 px-4 py-2"
                                style={{ background: '#FFBE0B', border: '2px solid #000' }}
                            >
                                <Crown size={16} className="text-black" />
                                <span className="text-xs font-black text-black uppercase">Premium Reward</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface Props {
    user: UserState;
    rewards: SeasonReward[];
    onClose: () => void;
    onClaim: (level: number, isPremium: boolean) => void;
    onShowPremium: () => void;
}

export const SeasonPassView: React.FC<Props> = ({ user, rewards, onClose, onClaim, onShowPremium }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [claimedReward, setClaimedReward] = useState<{ reward: SeasonRewardItem; isPremium: boolean } | null>(null);
    const [recentlyClaimed, setRecentlyClaimed] = useState<number | null>(null);
    const [activeInfoPopup, setActiveInfoPopup] = useState<{ reward: SeasonRewardItem; isPremium: boolean; position: { x: number; y: number } } | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    // Long press handlers for mobile
    const handleTouchStart = useCallback((reward: SeasonRewardItem, isPremium: boolean, e: React.TouchEvent) => {
        const touch = e.touches[0];
        longPressTimer.current = setTimeout(() => {
            setActiveInfoPopup({ 
                reward, 
                isPremium, 
                position: { x: touch.clientX, y: touch.clientY } 
            });
        }, 500); // 500ms long press
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    // Click handler for info button
    const handleInfoClick = useCallback((reward: SeasonRewardItem, isPremium: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveInfoPopup({ 
            reward, 
            isPremium, 
            position: { x: e.clientX, y: e.clientY } 
        });
    }, []);

    // Auto-scroll to current level on mount
    useEffect(() => {
        if (scrollRef.current) {
            const levelWidth = 208; // w-52 = 13rem = 208px
            const centerOffset = window.innerWidth / 2 - levelWidth / 2;
            const scrollPos = (user.level - 1) * levelWidth - centerOffset;
            scrollRef.current.scrollLeft = Math.max(0, scrollPos);
        }
    }, []);

    // Handle claim with modal
    const handleClaim = (level: number, isPremium: boolean, reward: SeasonRewardItem | null) => {
        if (reward) {
            setRecentlyClaimed(level);
            setClaimedReward({ reward, isPremium });
            onClaim(level, isPremium);
            // Clear recently claimed after animation
            setTimeout(() => setRecentlyClaimed(null), 500);
        }
    };

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
        <div className="h-full flex flex-col relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Floating geometric shapes */}
                <div className="absolute top-10 left-10 w-32 h-32 rotate-12 opacity-10" style={{ background: '#FF006E', border: '4px solid #000' }}></div>
                <div className="absolute top-40 right-20 w-24 h-24 -rotate-6 opacity-10" style={{ background: '#FFBE0B', border: '4px solid #000' }}></div>
                <div className="absolute bottom-20 left-1/4 w-40 h-40 rotate-45 opacity-10" style={{ background: '#8338EC', border: '4px solid #000' }}></div>
                <div className="absolute bottom-40 right-10 w-28 h-28 -rotate-12 opacity-10" style={{ background: '#00D9FF', border: '4px solid #000' }}></div>
                <div className="absolute top-1/2 left-1/2 w-48 h-48 rotate-6 opacity-5" style={{ background: '#FF7F00', border: '4px solid #000' }}></div>
                
                {/* Dotted grid pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle, #8338EC 2px, transparent 2px),
                            radial-gradient(circle, #FF006E 2px, transparent 2px)
                        `,
                        backgroundSize: '40px 40px, 60px 60px',
                        backgroundPosition: '0 0, 20px 20px'
                    }}
                ></div>
                
                {/* Diagonal stripes */}
                <div 
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(
                            45deg,
                            #FF006E 0px,
                            #FF006E 2px,
                            transparent 2px,
                            transparent 20px
                        )`
                    }}
                ></div>
            </div>

            {/* Rainbow Top Bar with Shimmer */}
            <div className="flex h-3 w-full relative z-10">
                <div className="flex-1 animate-pulse" style={{ background: '#FF006E', animationDelay: '0s' }}></div>
                <div className="flex-1 animate-pulse" style={{ background: '#FF7F00', animationDelay: '0.1s' }}></div>
                <div className="flex-1 animate-pulse" style={{ background: '#FFBE0B', animationDelay: '0.2s' }}></div>
                <div className="flex-1 animate-pulse" style={{ background: '#00D9FF', animationDelay: '0.3s' }}></div>
                <div className="flex-1 animate-pulse" style={{ background: '#8338EC', animationDelay: '0.4s' }}></div>
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
                                    style={{ width: `${Math.min(100, Math.max(5, user.xp % 100))}%`, background: '#00D9FF' }}
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
                className="mx-4 mt-4 p-3 flex flex-wrap items-center justify-center gap-2 text-xs font-black uppercase z-20"
                style={{ background: 'var(--color-surface)', border: '3px solid #000' }}
            >
                <div className="flex items-center gap-1">
                    <div className="p-1" style={{ background: '#0096FF', border: '2px solid #000' }}><ImageIcon size={12} style={{ color: '#FFF' }} /></div>
                    <span style={{ color: 'var(--color-text)' }}>Avatar</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="p-1" style={{ background: '#8338EC', border: '2px solid #000' }}><span style={{ fontSize: '10px' }}>🖼️</span></div>
                    <span style={{ color: 'var(--color-text)' }}>Effekt</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="p-1" style={{ background: '#FF006E', border: '2px solid #000' }}><Crown size={12} style={{ color: '#FFF' }} /></div>
                    <span style={{ color: 'var(--color-text)' }}>Titel</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="p-1" style={{ background: '#00D9FF', border: '2px solid #000' }}><CreditCard size={12} style={{ color: '#000' }} /></div>
                    <span style={{ color: 'var(--color-text)' }}>Karten</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="p-1" style={{ background: '#FF7F00', border: '2px solid #000' }}><Coins size={12} style={{ color: '#000' }} /></div>
                    <span style={{ color: 'var(--color-text)' }}>Münzen</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="p-1" style={{ background: '#FFBE0B', border: '2px solid #000' }}><Zap size={12} style={{ color: '#000' }} /></div>
                    <span style={{ color: 'var(--color-text)' }}>Booster</span>
                </div>
            </div>

            {/* Scroll Track - GPU Optimized */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto overflow-y-hidden p-0 scrollbar-hide relative z-10"
                style={{ 
                    willChange: 'scroll-position',
                    WebkitOverflowScrolling: 'touch',
                    scrollBehavior: 'smooth'
                }}
            >
                <div 
                    className="flex items-center h-full px-[50vw] min-w-max gap-4 py-6"
                    style={{ transform: 'translateZ(0)' }}
                >
                    {/* Animated Rainbow Track Line */}
                    <div
                        className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 z-0"
                        style={{ 
                            background: 'linear-gradient(90deg, #FF006E, #FF7F00, #FFBE0B, #00D9FF, #8338EC, #FF006E)',
                            backgroundSize: '200% 100%',
                            animation: 'rainbow-flow 8s linear infinite',
                            border: '3px solid #000',
                            boxShadow: '0 4px 0px #000'
                        }}
                    ></div>
                    {/* Progress overlay */}
                    <div
                        className="absolute top-1/2 h-4 -translate-y-1/2 z-1"
                        style={{
                            left: `calc(50vw + ${(user.level - 1) * 176}px)`,
                            right: 0,
                            background: 'rgba(200,200,200,0.8)',
                            borderRight: '3px solid #000',
                            borderTop: '3px solid #000',
                            borderBottom: '3px solid #000',
                            backdropFilter: 'blur(2px)'
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

                        // Rainbow rotating colors for cards
                        const colors = ['#FF006E', '#FF7F00', '#FFBE0B', '#00D9FF', '#8338EC', '#00FFB3'];
                        const cardColor = colors[index % colors.length];
                        const isLegendary = premiumReward?.rarity === 'legendary';
                        const isEpic = premiumReward?.rarity === 'epic';

                        return (
                            <div
                                key={lvl}
                                className="flex flex-col items-center justify-center relative w-52 h-full shrink-0 scroll-snap-center group"
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
                                            className={`relative w-36 p-4 flex flex-col items-center transition-all group-hover:-translate-y-3 cursor-pointer ${isLegendary ? 'rainbow-card holo-shimmer' : ''} ${isEpic ? 'rarity-epic' : ''}`}
                                            style={{
                                                background: 'var(--color-surface)',
                                                border: isLegendary ? '4px solid #FFBE0B' : '4px solid #000',
                                                boxShadow: isLegendary 
                                                    ? '0 0 20px rgba(255,190,11,0.5), 8px 8px 0px #FFBE0B' 
                                                    : `8px 8px 0px ${cardColor}`
                                            }}
                                            onTouchStart={(e) => handleTouchStart(premiumReward, true, e)}
                                            onTouchEnd={handleTouchEnd}
                                            onTouchCancel={handleTouchEnd}
                                        >
                                            {/* Info Button */}
                                            <button
                                                onClick={(e) => handleInfoClick(premiumReward, true, e)}
                                                className="absolute top-1 left-1 w-6 h-6 flex items-center justify-center transition-all hover:scale-110 z-20"
                                                style={{ background: '#00D9FF', border: '2px solid #000' }}
                                            >
                                                <Info size={12} className="text-black" />
                                            </button>
                                            
                                            {!user.isPremium && (
                                                <Lock size={12} style={{ color: '#999' }} className="absolute top-2 right-2" />
                                            )}

                                            {premiumReward.type === 'avatar' ? (
                                                <div className={`relative ${isLegendary ? 'animate-pulse' : ''}`}>
                                                    <img
                                                        src={premiumReward.preview}
                                                        alt="Avatar"
                                                        className="w-14 h-14 object-cover"
                                                        style={{ 
                                                            border: isLegendary ? '3px solid #FFBE0B' : '3px solid #000',
                                                            boxShadow: isLegendary ? '0 0 15px rgba(255,190,11,0.6)' : 'none'
                                                        }}
                                                    />
                                                    {isLegendary && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center" style={{ background: '#FFBE0B', border: '2px solid #000' }}>
                                                            <span className="text-xs">⭐</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : premiumReward.type === 'frame' ? (
                                                <div 
                                                    className="w-12 h-12 flex items-center justify-center"
                                                    style={{ background: '#8338EC', border: '3px solid #000' }}
                                                >
                                                    <span className="text-2xl">🖼️</span>
                                                </div>
                                            ) : premiumReward.type === 'effect' ? (
                                                <div 
                                                    className="w-12 h-12 flex items-center justify-center"
                                                    style={{ background: '#FF006E', border: '3px solid #000' }}
                                                >
                                                    <span className="text-2xl">{premiumReward.icon || '✨'}</span>
                                                </div>
                                            ) : premiumReward.type === 'font' ? (
                                                <div 
                                                    className="w-12 h-12 flex items-center justify-center"
                                                    style={{ background: 'linear-gradient(135deg, #8338EC, #FF006E)', border: '3px solid #000' }}
                                                >
                                                    <Type size={24} className="text-white" />
                                                </div>
                                            ) : premiumReward.type === 'title' ? (
                                                <div 
                                                    className="w-12 h-12 flex items-center justify-center"
                                                    style={{ background: '#FF006E', border: '3px solid #000' }}
                                                >
                                                    <Crown size={24} className="text-white" />
                                                </div>
                                            ) : premiumReward.type === 'cardback' ? (
                                                <div 
                                                    className="w-10 h-14 flex items-center justify-center"
                                                    style={{ background: '#00D9FF', border: '3px solid #000' }}
                                                >
                                                    <span className="text-xl">🃏</span>
                                                </div>
                                            ) : premiumReward.type === 'sticker_pack' ? (
                                                <div 
                                                    className="w-12 h-12 flex items-center justify-center"
                                                    style={{ 
                                                        background: getRarityColor(premiumReward.rarity || 'common'), 
                                                        border: '3px solid #000' 
                                                    }}
                                                >
                                                    <Gift size={24} className="text-white" />
                                                </div>
                                            ) : premiumReward.type === 'sticker' ? (
                                                <Star size={36} style={{ color: '#FF006E' }} />
                                            ) : premiumReward.type === 'mystery' ? (
                                                <Box size={36} style={{ color: '#8338EC' }} />
                                            ) : premiumReward.type === 'booster' ? (
                                                <Zap size={36} style={{ color: '#FFBE0B' }} />
                                            ) : premiumReward.type === 'coins' ? (
                                                <Coins size={28} style={{ color: '#FFBE0B' }} />
                                            ) : (
                                                <Gem size={28} style={{ color: '#0096FF' }} />
                                            )}

                                            <div className="mt-2 text-center">
                                                <div className="text-[10px] font-black uppercase leading-tight" style={{ color: 'var(--color-text)' }}>{premiumReward.name}</div>
                                                <div className="text-[9px] font-bold" style={{ color: getRarityColor(premiumReward.rarity || 'common') }}>
                                                    {premiumReward.amount ? `x${premiumReward.amount}` : premiumReward.rarity?.toUpperCase() || ''}
                                                </div>
                                                {premiumReward.desc && (
                                                    <div className="text-[8px] font-bold mt-1" style={{ color: '#FF006E' }}>{premiumReward.desc}</div>
                                                )}
                                            </div>

                                            {canClaimPremium && user.isPremium && (
                                                <button
                                                    onClick={() => handleClaim(lvl, true, premiumReward)}
                                                    className={`absolute -bottom-3 px-3 py-1 text-[9px] font-black uppercase flex items-center gap-1 transition-all hover:-translate-y-1 ${recentlyClaimed === lvl ? 'animate-claim-burst' : 'animate-glow-pulse'}`}
                                                    style={{ background: '#00D9FF', color: '#000', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}
                                                >
                                                    <Check size={10} /> Claim
                                                </button>
                                            )}
                                            {isPremiumClaimed && (
                                                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                                                    <div className="p-2" style={{ background: '#00D9FF', border: '3px solid #000' }}>
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
                                        style={{ background: '#00D9FF', color: '#000', border: '2px solid #000' }}
                                    >
                                        Free
                                    </div>

                                    {freeReward ? (
                                        <div
                                            className="relative w-32 p-4 flex flex-col items-center transition-all group-hover:translate-y-3 cursor-pointer"
                                            style={{
                                                background: 'var(--color-surface)',
                                                border: '4px solid #000',
                                                boxShadow: '6px 6px 0px #000'
                                            }}
                                            onTouchStart={(e) => handleTouchStart(freeReward, false, e)}
                                            onTouchEnd={handleTouchEnd}
                                            onTouchCancel={handleTouchEnd}
                                        >
                                            {/* Info Button */}
                                            <button
                                                onClick={(e) => handleInfoClick(freeReward, false, e)}
                                                className="absolute top-1 left-1 w-5 h-5 flex items-center justify-center transition-all hover:scale-110 z-20"
                                                style={{ background: '#FFBE0B', border: '2px solid #000' }}
                                            >
                                                <Info size={10} className="text-black" />
                                            </button>
                                            
                                            {freeReward.type === 'coins' ? (
                                                <Coins size={36} style={{ color: '#FFBE0B' }} />
                                            ) : freeReward.type === 'sticker' ? (
                                                <Star size={36} style={{ color: '#FF006E' }} />
                                            ) : freeReward.type === 'sticker_pack' ? (
                                                <div 
                                                    className="w-10 h-10 flex items-center justify-center"
                                                    style={{ 
                                                        background: getRarityColor(freeReward.rarity || 'common'), 
                                                        border: '2px solid #000' 
                                                    }}
                                                >
                                                    <span className="text-xl">🎁</span>
                                                </div>
                                            ) : (
                                                <Coins size={32} style={{ color: '#FFBE0B' }} />
                                            )}

                                            <div className="mt-2 text-center">
                                                <div className="text-[11px] font-black uppercase" style={{ color: 'var(--color-text)' }}>{freeReward.name || freeReward.type}</div>
                                                {freeReward.amount && <div className="text-[10px] font-bold" style={{ color: '#666' }}>x{freeReward.amount?.toLocaleString()}</div>}
                                            </div>

                                            {canClaimFree && (
                                                <button
                                                    onClick={() => handleClaim(lvl, false, freeReward)}
                                                    className={`absolute -bottom-4 px-4 py-1.5 text-[10px] font-black uppercase transition-all hover:-translate-y-1 ${recentlyClaimed === lvl ? 'animate-claim-burst' : 'animate-glow-pulse'}`}
                                                    style={{ background: '#00D9FF', color: '#000', border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}
                                                >
                                                    CLAIM
                                                </button>
                                            )}
                                            {isFreeClaimed && (
                                                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.9)' }}>
                                                    <div className="p-2" style={{ background: '#00D9FF', border: '3px solid #000' }}>
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

            {/* Reward Claim Modal */}
            {claimedReward && (
                <RewardClaimModal
                    reward={claimedReward.reward}
                    isPremium={claimedReward.isPremium}
                    onClose={() => setClaimedReward(null)}
                />
            )}

            {/* Reward Info Popup */}
            {activeInfoPopup && (
                <RewardInfoPopup
                    reward={activeInfoPopup.reward}
                    isPremium={activeInfoPopup.isPremium}
                    position={activeInfoPopup.position}
                    onClose={() => setActiveInfoPopup(null)}
                    language={user.language}
                />
            )}
        </div >
    );
};
