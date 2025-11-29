import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Sparkles, Gem, Zap, User, Coins, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { PayPalButton } from './PayPalButton';
import { SHOP_ITEMS } from '../constants';
import { audio } from '../utils/audio';

interface ShopViewProps {
    user: any;
    setUser: (user: any) => void;
    setView: (view: any) => void;
    t: any;
    setShowRedeemModal: (show: boolean) => void;
    setRedeemStep: (step: any) => void;
    handleBuyItem: (item: any) => void;
}

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
    const BANNERS = [
        { title: "SEASON 2 IS LIVE", subtitle: "Unlock Cyberpunk Skins", color: "from-lexi-primary to-blue-600", icon: <Zap size={64} className="text-white animate-pulse" /> },
        { title: "NEW AVATARS", subtitle: "Check out the terminal", color: "from-green-500 to-teal-600", icon: <User size={64} className="text-white animate-bounce-slow" /> },
        { title: "COIN SALE", subtitle: "Get rich quick", color: "from-yellow-400 to-orange-500", icon: <Coins size={64} className="text-white animate-spin-reverse" /> }
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

                {/* Avatar Section - Neo Brutal */}
                <div>
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
                </div>

                {/* Currency Section - Neo Brutal */}
                <div>
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
                </div>
            </div>
        </div >
    );
};
