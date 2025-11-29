import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Sparkles, Gem, Zap, User, Coins, CreditCard, ChevronLeft, ChevronRight, Crown, Palette } from 'lucide-react';
import { PayPalButton } from './PayPalButton';
import { SHOP_ITEMS, PROFILE_TITLES, CARD_BACKS } from '../constants';
import { audio } from '../utils/audio';
import { getRarityColor } from '../utils/rewards';

interface ShopViewProps {
    user: any;
    setUser: (user: any) => void;
    setView: (view: any) => void;
    t: any;
    setShowRedeemModal: (show: boolean) => void;
    setRedeemStep: (step: any) => void;
    handleBuyItem: (item: any) => void;
}

type ShopTab = 'avatars' | 'titles' | 'cardbacks' | 'currency';

export const ShopView: React.FC<ShopViewProps> = ({
    user,
    setUser,
    setView,
    t,
    setShowRedeemModal,
    setRedeemStep,
    handleBuyItem
}) => {
    const [currentBanner, setCurrentBanner] = useState(0);
    const [activeTab, setActiveTab] = useState<ShopTab>('avatars');
    
    const BANNERS = [
        { title: "SEASON 2 IS LIVE", subtitle: "Unlock Cyberpunk Skins", color: "from-lexi-primary to-blue-600", icon: <Zap size={64} className="text-white animate-pulse" /> },
        { title: "NEUE TITEL", subtitle: "Zeige deinen Rang", color: "from-pink-500 to-purple-600", icon: <Crown size={64} className="text-white animate-bounce-slow" /> },
        { title: "KARTENRÜCKSEITEN", subtitle: "Style deine Karten", color: "from-green-500 to-teal-600", icon: <Palette size={64} className="text-white animate-pulse" /> }
    ];

    const handleNext = () => {
        setCurrentBanner(prev => (prev + 1) % BANNERS.length);
    };

    const handlePrev = () => {
        setCurrentBanner(prev => (prev - 1 + BANNERS.length) % BANNERS.length);
    };

    // Safe access to banner with fallback
    const activeBanner = BANNERS[currentBanner] || BANNERS[0];

    return (
        <div className="h-full flex flex-col max-w-4xl mx-auto w-full overflow-hidden" style={{ background: 'var(--color-bg)' }}>
            {/* Rainbow Top Bar */}
            <div className="flex h-3 w-full sticky top-0 z-30">
                <div className="flex-1" style={{ background: '#FF006E' }}></div>
                <div className="flex-1" style={{ background: '#FF7F00' }}></div>
                <div className="flex-1" style={{ background: '#FFBE0B' }}></div>
                <div className="flex-1" style={{ background: '#06FFA5' }}></div>
                <div className="flex-1" style={{ background: '#8338EC' }}></div>
            </div>

            {/* Shop Header - Neo Brutal */}
            <div
                className="p-4 flex items-center justify-between z-20 sticky top-3 mx-4 mt-4"
                style={{
                    background: 'var(--color-surface)',
                    border: '4px solid #000',
                    boxShadow: '6px 6px 0px #000'
                }}
            >
                <button
                    onClick={() => setView('HOME')}
                    className="w-12 h-12 flex items-center justify-center transition-all active:translate-y-1"
                    style={{
                        background: '#FF006E',
                        border: '3px solid #000',
                        boxShadow: '4px 4px 0px #000'
                    }}
                >
                    <ArrowLeft size={24} style={{ color: '#000' }} />
                </button>
                <div className="flex items-center gap-3">
                    <ShoppingBag size={24} style={{ color: 'var(--color-text)' }} />
                    <h2
                        className="text-xl font-black uppercase tracking-wide"
                        style={{ color: 'var(--color-text)', transform: 'skew(-3deg)' }}
                    >
                        {t.SHOP.TITLE}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setShowRedeemModal(true); setRedeemStep('code'); }}
                        className="hidden md:flex items-center gap-2 px-4 py-2 font-black text-xs uppercase transition-all duration-100"
                        style={{
                            background: '#8338EC',
                            color: 'var(--color-text)',
                            border: '3px solid #000',
                            boxShadow: '4px 4px 0px #000'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '6px 6px 0px #000';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '4px 4px 0px #000';
                        }}
                    >
                        <Sparkles size={14} /> Code
                    </button>
                    <div
                        className="flex items-center gap-2 px-4 py-2 font-black"
                        style={{
                            background: '#FFBE0B',
                            border: '3px solid #000',
                            boxShadow: '4px 4px 0px #000'
                        }}
                    >
                        <Gem size={16} style={{ color: '#000' }} />
                        <span style={{ color: '#000' }}>{Math.max(0, user.coins)}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
                {/* Featured Banner - Neo Brutal */}
                <div
                    className="w-full p-6 relative overflow-hidden transition-all duration-100"
                    style={{
                        background: currentBanner === 0 ? '#FF006E' : currentBanner === 1 ? '#06FFA5' : '#FFBE0B',
                        border: '4px solid #000',
                        boxShadow: '8px 8px 0px #000',
                        transform: 'skew(-2deg)'
                    }}
                >
                    <div className="flex items-center justify-between" style={{ transform: 'skew(2deg)' }}>
                        <div className="z-10">
                            <h3 className="text-2xl md:text-3xl font-black uppercase mb-1" style={{ color: '#000' }}>{activeBanner.title}</h3>
                            <p className="font-bold tracking-widest uppercase text-xs" style={{ color: 'rgba(0,0,0,0.7)' }}>{activeBanner.subtitle}</p>
                        </div>
                        <div
                            className="w-16 h-16 flex items-center justify-center"
                            style={{ background: '#000', border: '3px solid #000' }}
                        >
                            {currentBanner === 0 && <Zap size={32} style={{ color: '#FF006E' }} />}
                            {currentBanner === 1 && <User size={32} style={{ color: '#06FFA5' }} />}
                            {currentBanner === 2 && <Coins size={32} style={{ color: '#FFBE0B' }} />}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center gap-3 mt-4" style={{ transform: 'skew(2deg)' }}>
                        <button
                            onClick={handlePrev}
                            className="w-10 h-10 flex items-center justify-center transition-all"
                            style={{ background: 'var(--color-surface)', border: '3px solid #000' }}
                        >
                            <ChevronLeft size={20} style={{ color: 'var(--color-text)' }} />
                        </button>
                        {BANNERS.map((_, i) => (
                            <div
                                key={i}
                                className="w-4 h-4 transition-all"
                                style={{
                                    background: i === currentBanner ? '#000' : 'var(--color-surface)',
                                    border: '2px solid #000'
                                }}
                            ></div>
                        ))}
                        <button
                            onClick={handleNext}
                            className="w-10 h-10 flex items-center justify-center transition-all"
                            style={{ background: 'var(--color-surface)', border: '3px solid #000' }}
                        >
                            <ChevronRight size={20} style={{ color: 'var(--color-text)' }} />
                        </button>
                    </div>
                </div>

                {/* Mobile Redeem Button */}
                <div className="md:hidden w-full">
                    <button
                        onClick={() => { setShowRedeemModal(true); setRedeemStep('code'); }}
                        className="w-full py-4 flex items-center justify-center gap-2 font-black text-sm uppercase transition-all duration-100"
                        style={{
                            background: '#8338EC',
                            color: 'var(--color-text)',
                            border: '4px solid #000',
                            boxShadow: '6px 6px 0px #000'
                        }}
                    >
                        <Sparkles size={16} /> Gutschein einlösen
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[
                        { id: 'avatars' as ShopTab, label: 'Avatare', icon: <User size={14} />, color: '#06FFA5' },
                        { id: 'titles' as ShopTab, label: 'Titel', icon: <Crown size={14} />, color: '#FF006E' },
                        { id: 'cardbacks' as ShopTab, label: 'Karten', icon: <Palette size={14} />, color: '#8338EC' },
                        { id: 'currency' as ShopTab, label: 'Münzen', icon: <Coins size={14} />, color: '#FFBE0B' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex-1 min-w-[80px] py-3 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all"
                            style={{
                                background: activeTab === tab.id ? tab.color : 'var(--color-surface)',
                                color: activeTab === tab.id ? '#000' : 'var(--color-text)',
                                border: '3px solid #000',
                                boxShadow: activeTab === tab.id ? '4px 4px 0px #000' : 'none',
                                transform: activeTab === tab.id ? 'translateY(-2px)' : 'translateY(0)'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Avatar Section */}
                {activeTab === 'avatars' && <div className="animate-fade-in-up">
                    <div
                        className="inline-block px-4 py-2 mb-4 font-black text-sm uppercase tracking-wider"
                        style={{ background: '#000', color: '#06FFA5' }}
                    >
                        <User size={14} className="inline mr-2" /> {t.SHOP.AVATAR_SECTION}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {SHOP_ITEMS.filter(i => i.type === 'avatar').map((item, idx) => {
                            const isOwned = (user.ownedAvatars || []).includes(item.value as string);
                            const isEquipped = user.avatarId === item.value;

                            return (
                                <div
                                    key={item.id}
                                    className="p-4 flex flex-col items-center relative overflow-hidden group transition-all duration-100"
                                    style={{
                                        background: isEquipped ? '#06FFA5' : 'var(--color-surface)',
                                        border: '4px solid #000',
                                        boxShadow: '6px 6px 0px #000',
                                        transform: 'skewX(-3deg)'
                                    }}
                                >
                                    <div
                                        className="w-20 h-20 mb-3 overflow-hidden group-hover:scale-105 transition-transform"
                                        style={{ border: '3px solid #000', transform: 'skewX(3deg)' }}
                                    >
                                        <img src={`https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${item.value}`} alt={item.name} className="w-full h-full" />
                                    </div>
                                    <span
                                        className="text-sm font-black uppercase mb-2 text-center leading-tight"
                                        style={{ color: isEquipped ? '#000' : 'var(--color-text)', transform: 'skewX(3deg)' }}
                                    >
                                        {item.name}
                                    </span>

                                    <div className="mt-auto w-full" style={{ transform: 'skewX(3deg)' }}>
                                        {isOwned ? (
                                            <button
                                                disabled={isEquipped}
                                                onClick={() => setUser({ ...user, avatarId: item.value as string })}
                                                className="w-full py-2 font-black text-xs uppercase transition-all"
                                                style={{
                                                    background: isEquipped ? '#000' : 'var(--color-surface)',
                                                    color: isEquipped ? '#06FFA5' : 'var(--color-text)',
                                                    border: '3px solid #000',
                                                    boxShadow: '3px 3px 0px #000'
                                                }}
                                            >
                                                {isEquipped ? t.SHOP.EQUIPPED : t.SHOP.EQUIP}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBuyItem(item)}
                                                className="w-full py-2 font-black text-xs uppercase flex items-center justify-center gap-1 transition-all"
                                                style={{
                                                    background: '#FFBE0B',
                                                    color: '#000',
                                                    border: '3px solid #000',
                                                    boxShadow: '3px 3px 0px #000'
                                                }}
                                            >
                                                <Gem size={12} /> {item.cost}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>}

                {/* Titles Section */}
                {activeTab === 'titles' && <div className="animate-fade-in-up">
                    <div
                        className="inline-block px-4 py-2 mb-4 font-black text-sm uppercase tracking-wider"
                        style={{ background: '#000', color: '#FF006E' }}
                    >
                        <Crown size={14} className="inline mr-2" /> Titel
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {PROFILE_TITLES.filter(t => t.id !== 'title_none').map((title, idx) => {
                            const isOwned = (user.ownedTitles || []).includes(title.id);
                            const isEquipped = user.activeTitle === title.id;
                            const rarityColor = getRarityColor(title.rarity);

                            return (
                                <div
                                    key={title.id}
                                    className={`p-4 flex items-center justify-between transition-all duration-200 reward-card-hover animate-slide-in-up`}
                                    style={{
                                        background: isEquipped ? rarityColor : 'var(--color-surface)',
                                        border: '4px solid #000',
                                        boxShadow: `6px 6px 0px ${rarityColor}`,
                                        animationDelay: `${idx * 0.05}s`
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{title.icon}</span>
                                        <div>
                                            <span 
                                                className={`font-black ${title.cssClass}`}
                                                style={{ color: isEquipped ? '#000' : 'var(--color-text)' }}
                                            >
                                                {title.name}
                                            </span>
                                            <div 
                                                className="text-[10px] font-bold uppercase"
                                                style={{ color: isEquipped ? '#000' : rarityColor }}
                                            >
                                                {title.rarity}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {isOwned ? (
                                        <button
                                            disabled={isEquipped}
                                            onClick={() => setUser({ ...user, activeTitle: title.id })}
                                            className="px-4 py-2 font-black text-xs uppercase transition-all"
                                            style={{
                                                background: isEquipped ? '#000' : 'var(--color-surface)',
                                                color: isEquipped ? rarityColor : 'var(--color-text)',
                                                border: '3px solid #000',
                                                boxShadow: '3px 3px 0px #000'
                                            }}
                                        >
                                            {isEquipped ? 'Aktiv' : 'Anlegen'}
                                        </button>
                                    ) : (
                                        <div 
                                            className="px-3 py-2 font-black text-xs uppercase"
                                            style={{ background: '#E5E5E5', color: '#999', border: '3px solid #000' }}
                                        >
                                            Season Pass
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs font-bold mt-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                        Titel werden über den Season Pass freigeschaltet!
                    </p>
                </div>}

                {/* Card Backs Section */}
                {activeTab === 'cardbacks' && <div className="animate-fade-in-up">
                    <div
                        className="inline-block px-4 py-2 mb-4 font-black text-sm uppercase tracking-wider"
                        style={{ background: '#000', color: '#8338EC' }}
                    >
                        <Palette size={14} className="inline mr-2" /> Kartenrückseiten
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {CARD_BACKS.map((cardBack, idx) => {
                            const isOwned = cardBack.id === 'cardback_default' || (user.ownedCardBacks || []).includes(cardBack.id);
                            const isEquipped = user.activeCardBack === cardBack.id || (!user.activeCardBack && cardBack.id === 'cardback_default');
                            const rarityColor = getRarityColor(cardBack.rarity);

                            return (
                                <div
                                    key={cardBack.id}
                                    className={`p-4 flex flex-col items-center transition-all duration-200 animate-card-back-hover animate-slide-in-up ${isOwned ? '' : 'opacity-60'}`}
                                    style={{
                                        background: isEquipped ? '#FFBE0B' : 'var(--color-surface)',
                                        border: '4px solid #000',
                                        boxShadow: `6px 6px 0px ${rarityColor}`,
                                        animationDelay: `${idx * 0.05}s`
                                    }}
                                >
                                    {/* Card Preview */}
                                    <div 
                                        className={`cardback-preview mb-3 ${cardBack.cssClass || ''}`}
                                        style={{ 
                                            background: cardBack.cssClass ? undefined : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                                        }}
                                    >
                                        <span className="text-xl">🃏</span>
                                    </div>

                                    <span 
                                        className="text-sm font-black uppercase text-center mb-2"
                                        style={{ color: isEquipped ? '#000' : 'var(--color-text)' }}
                                    >
                                        {cardBack.name}
                                    </span>

                                    {/* Rarity badge */}
                                    {cardBack.rarity !== 'common' && (
                                        <div 
                                            className="text-[8px] font-black uppercase px-2 py-0.5 mb-2"
                                            style={{ background: rarityColor, color: '#000', border: '2px solid #000' }}
                                        >
                                            {cardBack.rarity}
                                        </div>
                                    )}

                                    {isOwned ? (
                                        <button
                                            disabled={isEquipped}
                                            onClick={() => setUser({ ...user, activeCardBack: cardBack.id })}
                                            className="w-full py-2 font-black text-xs uppercase transition-all"
                                            style={{
                                                background: isEquipped ? '#000' : 'var(--color-surface)',
                                                color: isEquipped ? '#FFBE0B' : 'var(--color-text)',
                                                border: '3px solid #000'
                                            }}
                                        >
                                            {isEquipped ? 'Aktiv' : 'Anlegen'}
                                        </button>
                                    ) : (
                                        <div 
                                            className="w-full py-2 font-black text-xs uppercase text-center"
                                            style={{ background: '#E5E5E5', color: '#999', border: '3px solid #000' }}
                                        >
                                            Season Pass
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs font-bold mt-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
                        Kartenrückseiten werden über den Season Pass freigeschaltet!
                    </p>
                </div>}

                {/* Currency Section */}
                {activeTab === 'currency' && <div className="animate-fade-in-up">
                    <div
                        className="inline-block px-4 py-2 mb-4 font-black text-sm uppercase tracking-wider"
                        style={{ background: '#000', color: '#FFBE0B' }}
                    >
                        <CreditCard size={14} className="inline mr-2" /> {t.SHOP.CURRENCY_SECTION}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {SHOP_ITEMS.filter(i => i.type === 'currency').map((item, idx) => {
                            return (
                                <div
                                    key={item.id}
                                    className="p-4 flex flex-col items-center relative overflow-hidden group transition-all duration-100"
                                    style={{
                                        background: 'var(--color-surface)',
                                        border: '4px solid #000',
                                        boxShadow: '6px 6px 0px #FFBE0B',
                                        transform: 'skewX(-3deg)'
                                    }}
                                >
                                    <div
                                        className="w-14 h-14 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform"
                                        style={{ background: '#FFBE0B', border: '3px solid #000', transform: 'skewX(3deg)' }}
                                    >
                                        <Coins size={28} style={{ color: '#000' }} />
                                    </div>
                                    <span
                                        className="text-2xl font-black mb-0 leading-none"
                                        style={{ color: 'var(--color-text)', transform: 'skewX(3deg)' }}
                                    >
                                        {item.currencyAmount}
                                    </span>
                                    <span
                                        className="text-[10px] font-black uppercase mb-3"
                                        style={{ color: 'var(--color-text-muted)', transform: 'skewX(3deg)' }}
                                    >
                                        {t.GAME.COINS_GAINED}
                                    </span>

                                    <div className="w-full mt-auto" style={{ transform: 'skewX(3deg)' }}>
                                        {item.isRealMoney ? (
                                            <div className="w-full">
                                                <PayPalButton
                                                    amount={String(item.cost).replace('€', '').replace(',', '.').trim()}
                                                    onSuccess={(details: any) => {
                                                        audio.playWin();
                                                        setUser((u: any) => ({ ...u, coins: u.coins + (item.currencyAmount || 0) }));
                                                        alert(`${t.SHOP.SUCCESS}: ${item.name}`);
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleBuyItem(item)}
                                                className="w-full py-2 font-black text-sm uppercase transition-all"
                                                style={{
                                                    background: '#FF7F00',
                                                    color: '#000',
                                                    border: '3px solid #000',
                                                    boxShadow: '3px 3px 0px #000'
                                                }}
                                            >
                                                {item.cost}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>}
            </div>
        </div >
    );
};
