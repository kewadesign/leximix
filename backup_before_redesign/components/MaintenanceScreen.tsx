import React from 'react';
import { Wrench, Clock } from 'lucide-react';

interface Props {
  message?: string;
}

export const MaintenanceScreen: React.FC<Props> = ({ message }) => {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="glass-panel p-8 rounded-3xl max-w-md mx-4 text-center space-y-6 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
        <div className="w-24 h-24 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500 animate-pulse-slow">
          <Wrench size={48} className="text-yellow-500" />
        </div>
        
        <div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-wider">Wartungsarbeiten</h2>
          <p className="text-gray-300 leading-relaxed">
            {message || "Wir führen gerade wichtige Updates durch, um dein Spielerlebnis zu verbessern. LexiMix ist bald wieder da!"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-yellow-500/80 bg-yellow-500/10 p-3 rounded-xl">
            <Clock size={16} />
            <span>Bitte versuche es später noch einmal.</span>
        </div>
      </div>
    </div>
  );
};
