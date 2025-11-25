import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface FriendCodeDisplayProps {
  code: string;
}

export const FriendCodeDisplay: React.FC<FriendCodeDisplayProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-center relative group cursor-pointer" onClick={handleCopy}>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Dein Freundescode</p>
      <div className="text-3xl font-mono font-black text-cyan-400 tracking-[0.2em] flex items-center justify-center gap-3 hover:text-white transition-colors">
        {code || '-----'}
        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="opacity-50" />}
      </div>
      <p className="text-[10px] text-gray-600 mt-2">{copied ? 'Kopiert!' : 'Tippen zum Kopieren'}</p>
    </div>
  );
};
