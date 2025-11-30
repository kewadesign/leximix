import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX, SkipForward, Pause, Play } from 'lucide-react';

// Royalty-free music tracks from Pixabay (free for commercial use)
export const MUSIC_TRACKS = {
  // Home/Menu - Chill Vibes
  home: {
    name: 'Chill Vibes',
    url: 'https://cdn.pixabay.com/audio/2024/11/04/audio_a990c44ee2.mp3', // Lofi chill
    color: '#8338EC'
  },
  // Word Games - Focus/Ambient
  wordle: {
    name: 'Focus Mode',
    url: 'https://cdn.pixabay.com/audio/2024/09/19/audio_353aafb016.mp3', // Ambient focus
    color: '#00D9FF'
  },
  chain: {
    name: 'Brain Flow',
    url: 'https://cdn.pixabay.com/audio/2024/10/09/audio_c3c00c27bc.mp3', // Thinking music
    color: '#FF006E'
  },
  // Card Games - Jazz/Lounge
  maumau: {
    name: 'Card Shuffle',
    url: 'https://cdn.pixabay.com/audio/2024/07/24/audio_af399e52db.mp3', // Jazzy lounge
    color: '#FFBE0B'
  },
  rummy: {
    name: 'Casino Night',
    url: 'https://cdn.pixabay.com/audio/2024/09/12/audio_3d15f3e8ab.mp3', // Smooth jazz
    color: '#FF6B35'
  },
  // Board Games - Strategic/Classical
  chess: {
    name: 'Grand Master',
    url: 'https://cdn.pixabay.com/audio/2024/08/13/audio_0c5dbda281.mp3', // Epic strategy
    color: '#3B82F6'
  },
  checkers: {
    name: 'Tactical Mind',
    url: 'https://cdn.pixabay.com/audio/2024/06/05/audio_eb77869c06.mp3', // Light classical
    color: '#EF4444'
  },
  morris: {
    name: 'Ancient Game',
    url: 'https://cdn.pixabay.com/audio/2024/10/22/audio_c7cb2f79e7.mp3', // Medieval vibes
    color: '#84CC16'
  },
  // Puzzle - Zen/Meditation
  sudoku: {
    name: 'Zen Garden',
    url: 'https://cdn.pixabay.com/audio/2024/09/27/audio_e17e2b86f0.mp3', // Peaceful zen
    color: '#06B6D4'
  },
  // Season Pass/Shop - Upbeat
  season: {
    name: 'Level Up',
    url: 'https://cdn.pixabay.com/audio/2024/10/16/audio_af0d6b39f6.mp3', // Upbeat electronic
    color: '#D946EF'
  },
  shop: {
    name: 'Shopping Spree',
    url: 'https://cdn.pixabay.com/audio/2024/08/29/audio_1e082fcef2.mp3', // Happy vibes
    color: '#F59E0B'
  },
  // Multiplayer - Competitive
  multiplayer: {
    name: 'Battle Ready',
    url: 'https://cdn.pixabay.com/audio/2024/07/08/audio_c3c85f7e67.mp3', // Energetic
    color: '#EF4444'
  }
};

export type MusicTrackKey = keyof typeof MUSIC_TRACKS;

interface MusicPlayerProps {
  currentView?: string;
  gameMode?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentView = 'home', gameMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrackKey>('home');
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Map views to tracks
  const getTrackForView = (view: string, mode?: string): MusicTrackKey => {
    // Game modes take priority
    if (mode) {
      const modeMap: Record<string, MusicTrackKey> = {
        'wordle': 'wordle',
        'math': 'wordle',
        'riddle': 'chain',
        'chain': 'chain',
        'maumau': 'maumau',
        'rummy': 'rummy',
        'chess': 'chess',
        'checkers': 'checkers',
        'morris': 'morris',
        'sudoku': 'sudoku',
      };
      if (modeMap[mode]) return modeMap[mode];
    }

    // View-based tracks
    const viewMap: Record<string, MusicTrackKey> = {
      'HOME': 'home',
      'LEVELS': 'home',
      'GAME': 'wordle',
      'SEASON': 'season',
      'SHOP': 'shop',
      'PROFILE': 'home',
      'STICKER_ALBUM': 'shop',
      'MULTIPLAYER': 'multiplayer',
      'FRIENDS': 'multiplayer',
    };
    return viewMap[view] || 'home';
  };

  // Update track when view changes
  useEffect(() => {
    const newTrack = getTrackForView(currentView, gameMode);
    if (newTrack !== currentTrack) {
      setCurrentTrack(newTrack);
      // If playing, switch to new track
      if (isPlaying && audioRef.current) {
        audioRef.current.src = MUSIC_TRACKS[newTrack].url;
        audioRef.current.play().catch(console.error);
      }
    }
  }, [currentView, gameMode]);

  // Set volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.src = MUSIC_TRACKS[currentTrack].url;
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
        });
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

  const skipTrack = () => {
    const tracks = Object.keys(MUSIC_TRACKS) as MusicTrackKey[];
    const currentIndex = tracks.indexOf(currentTrack);
    const nextIndex = (currentIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];
    setCurrentTrack(nextTrack);
    
    if (isPlaying && audioRef.current) {
      audioRef.current.src = MUSIC_TRACKS[nextTrack].url;
      audioRef.current.play().catch(console.error);
    }
  };

  const track = MUSIC_TRACKS[currentTrack];

  return (
    <div
      className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <audio
        ref={audioRef}
        preload="none"
        loop
        onEnded={() => skipTrack()}
      />

      <div className="flex items-center gap-2">
        {/* Main Play Button */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group"
          style={{
            background: isPlaying ? track.color : '#1a1a1a',
            border: '3px solid #000',
            boxShadow: isPlaying ? `0 0 20px ${track.color}80, 4px 4px 0px #000` : '4px 4px 0px #000'
          }}
        >
          {isPlaying ? (
            <Pause size={20} className="text-white" />
          ) : (
            <Music size={20} className="text-gray-400 group-hover:text-white transition-colors" />
          )}
        </button>

        {/* Expanded Controls */}
        <div className={`flex items-center gap-2 transition-all duration-300 overflow-hidden ${isPlaying || showControls ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'}`}>
          {/* Track Info */}
          <div 
            className="px-3 py-2 min-w-[100px]"
            style={{
              background: 'var(--color-surface)',
              border: '3px solid #000',
              boxShadow: '3px 3px 0px #000'
            }}
          >
            <div className="flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: isPlaying ? '#22C55E' : '#EF4444' }}
              />
              <div>
                <div className="text-[10px] font-black uppercase" style={{ color: track.color }}>
                  {track.name}
                </div>
                <div className="text-[8px] font-bold" style={{ color: 'var(--color-text-muted)' }}>
                  {isPlaying ? '♪ Playing' : 'Paused'}
                </div>
              </div>
            </div>
          </div>

          {/* Skip Button */}
          <button
            onClick={skipTrack}
            className="w-8 h-8 flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: 'var(--color-surface)',
              border: '2px solid #000',
              boxShadow: '2px 2px 0px #000'
            }}
          >
            <SkipForward size={14} style={{ color: 'var(--color-text)' }} />
          </button>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="w-8 h-8 flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: isMuted ? '#EF4444' : 'var(--color-surface)',
              border: '2px solid #000',
              boxShadow: '2px 2px 0px #000'
            }}
          >
            {isMuted ? (
              <VolumeX size={14} className="text-white" />
            ) : (
              <Volume2 size={14} style={{ color: 'var(--color-text)' }} />
            )}
          </button>

          {/* Volume Slider */}
          {isPlaying && !isMuted && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-2 appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${track.color} 0%, ${track.color} ${volume * 100}%, #333 ${volume * 100}%, #333 100%)`,
                borderRadius: '4px'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
