import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX, Play, Pause } from 'lucide-react';

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Local Music File
  const MUSIC_URL = "/music/happy-video-game-music-geometry-dash-type-beat-431059.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Audio playback failed:", error);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2">
      <audio
        ref={audioRef}
        src={MUSIC_URL}
        preload="metadata"
      />

      {/* Main Play Button - Brutalism Style */}
      <button
        onClick={togglePlay}
        className="relative group"
        style={{
          width: '56px',
          height: '56px',
          background: isPlaying ? '#06FFA5' : '#FF006E',
          border: '4px solid #000',
          boxShadow: '6px 6px 0px #000',
          transform: 'skew(-5deg)',
          transition: 'all 0.1s linear'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'skew(-5deg) translateY(-2px)';
          e.currentTarget.style.boxShadow = '8px 8px 0px #000';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'skew(-5deg)';
          e.currentTarget.style.boxShadow = '6px 6px 0px #000';
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'skew(5deg)' }}>
          {isPlaying ? (
            <Pause size={24} className="text-black" fill="black" />
          ) : (
            <Play size={24} className="text-white" fill="white" />
          )}
        </div>
      </button>

      {/* Volume Control - Shows when playing */}
      {isPlaying && (
        <div
          className="flex items-center gap-2"
          style={{
            background: '#FFBE0B',
            border: '4px solid #000',
            boxShadow: '4px 4px 0px #000',
            padding: '8px 12px',
            transform: 'skew(-5deg)'
          }}
        >
          <div style={{ transform: 'skew(5deg)' }} className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1 hover:scale-110 transition-transform"
            >
              {isMuted ? <VolumeX size={18} className="text-black" /> : <Volume2 size={18} className="text-black" />}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolume(newVolume);
                if (audioRef.current) {
                  audioRef.current.volume = newVolume;
                }
                if (isMuted && newVolume > 0) {
                  setIsMuted(false);
                  if (audioRef.current) audioRef.current.muted = false;
                }
              }}
              className="w-20 h-2 appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #000 0%, #000 ${(isMuted ? 0 : volume) * 100}%, #FFF ${(isMuted ? 0 : volume) * 100}%, #FFF 100%)`,
                border: '2px solid #000',
                outline: 'none'
              }}
            />

            <span className="text-xs font-black text-black uppercase tracking-wider">
              {isPlaying ? '♪' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
