import React, { useState, useEffect } from 'react';
import { Music, VolumeX } from 'lucide-react';
import { music } from '../utils/audio';

interface MusicPlayerProps {
  currentView?: string;
  gameMode?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentView = 'HOME', gameMode }) => {
  const [isPlaying, setIsPlaying] = useState(music.isEnabled());

  // Sync with music manager state
  useEffect(() => {
    setIsPlaying(music.isEnabled());
  }, []);

  // Update music when view/mode changes
  useEffect(() => {
    if (isPlaying) {
      music.playForMode(currentView);
    }
  }, [currentView, gameMode, isPlaying]);

  const toggleMusic = () => {
    if (isPlaying) {
      music.setEnabled(false);
      setIsPlaying(false);
    } else {
      music.setEnabled(true);
      music.playForMode(currentView);
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={toggleMusic}
        className="w-12 h-12 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: isPlaying ? '#8338EC' : 'var(--color-surface)',
          border: '3px solid #000',
          boxShadow: isPlaying ? '0 0 15px #8338EC80, 4px 4px 0px #000' : '4px 4px 0px #000'
        }}
        title={isPlaying ? 'Musik aus' : 'Musik an'}
      >
        {isPlaying ? (
          <Music size={20} className="text-white" />
        ) : (
          <VolumeX size={20} style={{ color: 'var(--color-text)' }} />
        )}
      </button>
    </div>
  );
};
