import React, { useEffect, useState } from 'react';
import { Sparkles, Gamepad2, Cpu, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  isVisible: boolean;
  onFinished?: () => void;
  text?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible, onFinished, text = "LOADING" }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500); // Match fade out duration
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[100] bg-[#0b1120] flex flex-col items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-lexi-fuchsia/20 blur-3xl rounded-full animate-pulse-slow"></div>
          <div className="relative w-full h-full">
             <div className="absolute top-0 left-0 w-full h-full border-4 border-t-lexi-fuchsia border-r-transparent border-b-lexi-cyan border-l-transparent rounded-full animate-spin"></div>
             <div className="absolute top-2 left-2 w-20 h-20 border-4 border-t-transparent border-r-lexi-cyan border-b-transparent border-l-lexi-fuchsia rounded-full animate-spin-reverse opacity-70"></div>
          </div>
          <Gamepad2 size={48} className="absolute text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        </div>

        <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-lexi-fuchsia via-purple-500 to-lexi-cyan animate-pulse mb-2">
          {text}
        </h2>
        
        <div className="flex gap-1 h-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};
