import React from 'react';
import { Crown, Cat } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface Props {
  xp: number;
  level: number;
  isPremium: boolean;
  onBuyPremium: () => void;
  lang: Language;
}

export const SeasonPass: React.FC<Props> = ({ onBuyPremium, lang }) => {
  const t = TRANSLATIONS[lang].SEASON;

  return (
    <div 
      onClick={onBuyPremium}
      className="w-full h-32 md:h-40 rounded-[2rem] p-6 cursor-pointer relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-2xl animate-slide-up mt-8 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
        animationDelay: '0.3s'
      }}
    >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-900/50 to-transparent pointer-events-none"></div>

        <div className="relative z-10 flex items-center justify-center gap-6 scale-110 group-hover:scale-125 transition-transform duration-500">
             {/* Icon */}
             <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center border-4 border-white/20 shadow-[0_0_30px_rgba(251,191,36,0.4)] rotate-[-10deg] group-hover:rotate-0 transition-all">
                 <Cat size={40} className="text-white drop-shadow-md" />
             </div>

             {/* Text */}
             <div className="flex flex-col items-start">
                 <div className="flex items-center gap-2">
                    <Crown className="text-yellow-300 drop-shadow-md animate-pulse-fast" size={28} fill="currentColor" />
                    <h3 className="text-white font-black italic text-4xl tracking-tighter drop-shadow-xl uppercase">
                        {t.TITLE.split(':')[0]} {/* Just "SEASON I" */}
                    </h3>
                 </div>
             </div>
        </div>
    </div>
  );
};