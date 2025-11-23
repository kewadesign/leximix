import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX, Radio } from 'lucide-react';

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Lofi Stream URL (Public Domain / Free Stream)
  const STREAM_URL = "https://stream.zeno.fm/0r0xa792kwzuv";

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
    <div 
      className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
       <audio 
         ref={audioRef} 
         src={STREAM_URL} 
         preload="none"
         crossOrigin="anonymous"
       />
       
       <div className="flex items-center gap-2">
         <button 
           onClick={togglePlay}
           className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 group
             ${isPlaying 
               ? 'bg-gradient-to-tr from-lexi-fuchsia to-purple-600 border-white/20 text-white shadow-[0_0_20px_rgba(217,70,239,0.5)]' 
               : 'bg-gray-900/80 border-white/10 text-gray-400 hover:bg-gray-800 hover:text-white'}`}
         >
           <Music size={20} className={`transition-transform duration-700 ${isPlaying ? 'animate-[spin_3s_linear_infinite]' : 'group-hover:scale-110'}`} />
         </button>

         <div className={`flex items-center gap-2 transition-all duration-300 overflow-hidden ${isPlaying || showControls ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-lexi-fuchsia uppercase tracking-wider whitespace-nowrap">Lofi Radio</span>
                <span className="text-[9px] text-gray-400 whitespace-nowrap flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {isPlaying ? 'LIVE' : 'OFFLINE'}
                </span>
            </div>
            
            {isPlaying && (
                <button 
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-black/40 text-white/80 flex items-center justify-center backdrop-blur-md border border-white/10 hover:bg-black/60 hover:scale-110 transition-all ml-auto shrink-0"
                >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
            )}
         </div>
       </div>
    </div>
  );
};
