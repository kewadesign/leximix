import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Sparkles, Gem, Zap, User, Coins, CreditCard } from 'lucide-react';
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
        { title: "SEASON 2 IS LIVE", subtitle: "Unlock Cyberpunk Skins", color: "from-lexi-fuchsia to-blue-600", icon: <Zap size={64} className="text-white animate-pulse" /> },
        { title: "NEW AVATARS", subtitle: "Check out the terminal", color: "from-green-500 to-teal-600", icon: <User size={64} className="text-white animate-bounce-slow" /> },
        { title: "COIN SALE", subtitle: "Get rich quick", color: "from-yellow-400 to-orange-500", icon: <Coins size={64} className="text-white animate-spin-reverse" /> }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner(prev => (prev + 1) % BANNERS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Safe access to banner with fallback
    const activeBanner = BANNERS[currentBanner] || BANNERS[0];

    return (
        <div className="h-full flex flex-col animate-fade-in glass-panel max-w-4xl mx-auto w-full rounded-none md:rounded-3xl overflow-hidden">
            {/* Shop Header */}
            <div className="p-4 glass-panel border-b border-lexi-border flex items-center justify-between z-20 sticky top-0 rounded-none">
                <button onClick={() => setView('HOME')} className="w-10 h-10 flex items-center justify-center rounded-full glass-button">
                    <ArrowLeft size={20} className="text-lexi-text" />
                </button>
                <div className="flex items-center gap-2">
                    <ShoppingBag size={24} className="text-lexi-cyan" />
                    <h2 className="text-xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-lexi-cyan to-blue-500 uppercase tracking-widest">{t.SHOP.TITLE}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setShowRedeemModal(true); setRedeemStep('code'); }}
                        className="hidden md:flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-[10px] font-bold uppercase tracking-wider text-lexi-text hover:text-lexi-cyan"
                    >
                        <Sparkles size={12} /> Gutschein
                    </button>
                    <div className="flex items-center gap-1 bg-black/50 px-3 py-1 rounded-full border border-white/10">
                        <Gem size={14} className="text-blue-400" />
                        <span className="text-sm font-bold text-lexi-text">{Math.max(0, user.coins)}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                {/* Featured Rotating Banner */}
                <div className={`w-full h-40 rounded-3xl relative overflow-hidden shadow-2xl animate-scale-in transition-all duration-500 bg-gradient-to-r ${activeBanner.color}`}>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>
                    <div className="absolute inset-0 flex items-center justify-between px-8">
                        <div className="z-10">
                            <h3 className="text-3xl font-black italic text-white drop-shadow-lg mb-1 animate-slide-down">{activeBanner.title}</h3>
                            <p className="text-white/80 font-bold tracking-widest uppercase text-xs">{activeBanner.subtitle}</p>
                        </div>
                        <div className="opacity-80 transform scale-110 transition-transform duration-1000">
                            {activeBanner.icon}
                        </div>
                    </div>
                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {BANNERS.map((_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentBanner ? 'bg-white scale-125' : 'bg-white/40'}`}></div>
                        ))}
                    </div>
                </div>

                {/* Mobile Redeem Button */}
                <div className="md:hidden w-full mb-4">
                    <button
                        onClick={() => { setShowRedeemModal(true); setRedeemStep('code'); }}
                        className="w-full py-3 rounded-xl bg-gray-800/50 border border-white/10 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-lexi-text hover:text-lexi-cyan hover:bg-white/5 transition-all"
                    >
                        <Sparkles size={14} /> Gutschein einlösen
                    </button>
                </div>

                {/* Avatar Section */}
                <div>
                    <h3 className="text-sm font-bold text-lexi-text-muted uppercase tracking-widest mb-4 flex items-center gap-2"><User size={16} /> {t.SHOP.AVATAR_SECTION}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {SHOP_ITEMS.filter(i => i.type === 'avatar').map((item, idx) => {
                            const isOwned = (user.ownedAvatars || []).includes(item.value as string);
                            const isEquipped = user.avatarId === item.value;

                            return (
                                <div
                                    key={item.id}
                                    className={`glass-panel p-4 rounded-2xl flex flex-col items-center relative overflow-hidden group hover:border-lexi-fuchsia/50 transition-all animate-scale-in ${isEquipped ? 'border-lexi-fuchsia bg-lexi-fuchsia/10' : ''}`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="w-20 h-20 bg-gray-800 rounded-full mb-3 overflow-hidden border-2 border-white/5 group-hover:scale-105 transition-transform">
                                        <img src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${item.value}`} alt={item.name} />
                                    </div>
                                    <span className="text-sm font-bold text-lexi-text mb-1 text-center leading-tight">{item.name}</span>

                                    <div className="mt-auto w-full">
                                        {isOwned ? (
                                            <button
                                                disabled={isEquipped}
                                                onClick={() => setUser({ ...user, avatarId: item.value as string })}
                                                className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isEquipped ? 'bg-lexi-fuchsia text-white cursor-default' : 'glass-button'}`}
                                            >
                                                {isEquipped ? t.SHOP.EQUIPPED : t.SHOP.EQUIP}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleBuyItem(item)}
                                                className="w-full py-2 rounded-lg bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 flex items-center justify-center gap-1"
                                            >
                                                <Gem size={10} className="text-blue-500" /> {item.cost}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Currency Section */}
                <div>
                    <h3 className="text-sm font-bold text-lexi-text-muted uppercase tracking-widest mb-4 flex items-center gap-2"><CreditCard size={16} /> {t.SHOP.CURRENCY_SECTION}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {SHOP_ITEMS.filter(i => i.type === 'currency').map((item, idx) => (
                            <div
                                key={item.id}
                                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 p-4 rounded-2xl flex flex-col items-center relative overflow-hidden group hover:border-blue-500/50 transition-all animate-scale-in"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="bg-blue-900/30 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform duration-500">
                                    <Coins size={24} className="text-blue-300" />
                                </div>
                                <span className="text-lg font-black text-white mb-0 leading-none">{item.currencyAmount}</span>
                                <span className="text-[10px] text-blue-300 font-bold uppercase mb-3">{t.GAME.COINS_GAINED}</span>

                                <div className="w-full mt-auto">
                                    {item.isRealMoney ? (
                                        <div className="w-full px-2">
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
                                            className="px-4 py-2 bg-white text-black font-bold rounded-full text-sm hover:bg-blue-50 transition-colors shadow-lg w-full"
                                        >
                                            {item.cost}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
