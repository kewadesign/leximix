import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX, SkipForward, Pause, Play } from 'lucide-react';

// Free Radio Streams (royalty-free, commercial use allowed)
export const MUSIC_TRACKS = {
  // Lofi/Chill - Home, Profile
  lofi: {
    name: 'Lofi Chill',
    url: 'https://stream.zeno.fm/0r0xa792kwzuv', // Lofi Girl style
    color: '#8338EC',
    emoji: '🎧'
  },
  // Jazz - Card Games
  jazz: {
    name: 'Smooth Jazz',
    url: 'https://stream.zeno.fm/f3wvbbqmdg8uv', // Jazz Radio
    color: '#FFBE0B',
    emoji: '🎷'
  },
  // Classical - Strategy Games
  classical: {
    name: 'Classical',
    url: 'https://stream.zeno.fm/4d5zh1cedn8uv', // Classical
    color: '#3B82F6',
    emoji: '🎻'
  },
  // Ambient - Puzzle/Focus
  ambient: {
    name: 'Ambient Focus',
    url: 'https://stream.zeno.fm/mf9k1ceeytzuv', // Ambient
    color: '#06B6D4',
    emoji: '🧘'
  },
  // Electronic - Season/Shop
  electronic: {
    name: 'Electronic',
    url: 'https://stream.zeno.fm/ht5krxcqdn8uv', // Electronic
    color: '#D946EF',
    emoji: '🎹'
  },
  // Rock/Energetic - Multiplayer
  rock: {
    name: 'Rock Energy',
    url: 'https://stream.zeno.fm/kx1gzdqmedruv', // Rock
    color: '#EF4444',
    emoji: '🎸'
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
  const [currentTrack, setCurrentTrack] = useState<MusicTrackKey>('lofi');
  const [volume, setVolume] = useState(0.3);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Map views/modes to tracks
  const getTrackForContext = (view: string, mode?: string): MusicTrackKey => {
    // Game modes
    if (mode) {
      const modeMap: Record<string, MusicTrackKey> = {
        'wordle': 'ambient',
        'math': 'ambient',
        'riddle': 'ambient',
        'chain': 'ambient',
        'maumau': 'jazz',
        'rummy': 'jazz',
        'chess': 'classical',
        'checkers': 'classical',
        'morris': 'classical',
        'sudoku': 'ambient',
      };
      if (modeMap[mode]) return modeMap[mode];
    }

    // Views
    const viewMap: Record<string, MusicTrackKey> = {
      'HOME': 'lofi',
      'LEVELS': 'lofi',
      'GAME': 'ambient',
      'SEASON': 'electronic',
      'SHOP': 'electronic',
      'PROFILE': 'lofi',
      'STICKER_ALBUM': 'electronic',
      'MULTIPLAYER': 'rock',
      'FRIENDS': 'rock',
    };
    return viewMap[view] || 'lofi';
  };

  // Update track when context changes
  useEffect(() => {
    const newTrack = getTrackForContext(currentView, gameMode);
    if (newTrack !== currentTrack && isPlaying) {
      setCurrentTrack(newTrack);
      if (audioRef.current) {
        audioRef.current.src = MUSIC_TRACKS[newTrack].url;
        audioRef.current.play().catch(console.error);
      }
    } else if (newTrack !== currentTrack) {
      setCurrentTrack(newTrack);
    }
  }, [currentView, gameMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.src = MUSIC_TRACKS[currentTrack].url;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Playback failed:", error);
      }
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const cycleTrack = () => {
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
        crossOrigin="anonymous"
      />

      <div className="flex items-center gap-2">
        {/* Main Play Button */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-12 h-12 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: isPlaying ? track.color : 'var(--color-surface)',
            border: '3px solid #000',
            boxShadow: isPlaying ? `0 0 15px ${track.color}80, 4px 4px 0px #000` : '4px 4px 0px #000'
          }}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause size={20} className="text-white" />
          ) : (
            <Music size={20} style={{ color: 'var(--color-text)' }} />
          )}
        </button>

        {/* Expanded Controls */}
        <div className={`flex items-center gap-2 transition-all duration-300 overflow-hidden ${isPlaying || showControls ? 'max-w-[250px] opacity-100' : 'max-w-0 opacity-0'}`}>
          {/* Track Info */}
          <div 
            className="px-3 py-2 min-w-[110px]"
            style={{
              background: 'var(--color-surface)',
              border: '3px solid #000',
              boxShadow: '3px 3px 0px #000'
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{track.emoji}</span>
              <div>
                <div className="text-[10px] font-black uppercase" style={{ color: track.color }}>
                  {track.name}
                </div>
                <div className="text-[8px] font-bold flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                  <span 
                    className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
                  />
                  {isPlaying ? 'LIVE' : 'OFF'}
                </div>
              </div>
            </div>
          </div>

          {/* Skip/Cycle Button */}
          <button
            onClick={cycleTrack}
            className="w-8 h-8 flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: 'var(--color-surface)',
              border: '2px solid #000',
              boxShadow: '2px 2px 0px #000'
            }}
            title="Nächster Sender"
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
          {isPlaying && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-14 h-2 appearance-none cursor-pointer rounded"
              style={{
                background: `linear-gradient(to right, ${track.color} 0%, ${track.color} ${volume * 100}%, #333 ${volume * 100}%, #333 100%)`
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
