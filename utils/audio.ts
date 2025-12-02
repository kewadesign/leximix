class SoundManager {
  private context: AudioContext | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    // Auto-initialize on first user interaction
    if (typeof window !== 'undefined') {
      const initAudio = () => {
        this.init();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
        document.removeEventListener('keydown', initAudio);
      };
      document.addEventListener('click', initAudio);
      document.addEventListener('touchstart', initAudio);
      document.addEventListener('keydown', initAudio);
    }
  }

  init() {
    if (this.initialized) return;
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (this.context.state === 'suspended') {
        this.context.resume();
      }
      this.initialized = true;
      console.log('[Audio] Initialized successfully');
    } catch (e) {
      console.warn('[Audio] Failed to initialize:', e);
    }
  }

  private getContext() {
    if (!this.context) {
      this.init();
    }
    // Always try to resume if suspended
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.15) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be blocked until user interaction
    }
  }

  // Frequency sweep for special effects
  playSweep(startFreq: number, endFreq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  // ============================================================================
  // 🖱️ BASIC INTERACTIONS
  // ============================================================================

  // Soft click for buttons
  playClick() {
    this.playTone(800, 'sine', 0.08, 0.2);
  }

  // Hover sound - audible but not annoying
  playHover() {
    this.playTone(1200, 'sine', 0.04, 0.1);
  }

  // Select sound - more pronounced than hover
  playSelect() {
    this.playTone(900, 'sine', 0.08, 0.15);
    setTimeout(() => this.playTone(1100, 'sine', 0.06, 0.12), 30);
  }

  // Navigation between views
  playNavigate() {
    this.playSweep(400, 800, 0.1, 'sine', 0.06);
  }

  // Toggle switch sound
  playToggle() {
    this.playTone(600, 'triangle', 0.08, 0.08);
    setTimeout(() => this.playTone(800, 'triangle', 0.06, 0.06), 50);
  }

  // ============================================================================
  // 🎮 GAME SOUNDS
  // ============================================================================

  // Win fanfare - triumphant ascending notes
  playWin() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.12), i * 100);
    });
  }

  // Loss sound - descending sad tones
  playLoss() {
    const notes = [400, 300, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.3, 0.08), i * 150);
    });
  }

  // Error/wrong answer
  playError() {
    this.playTone(150, 'sawtooth', 0.2, 0.1);
  }

  playWrong() {
    this.playError();
  }

  // Correct answer - quick happy chirp
  playCorrect() {
    this.playTone(880, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(1100, 'sine', 0.1, 0.08), 80);
  }

  // Combo/streak sound
  playCombo(streak: number = 1) {
    const baseFreq = 600 + (streak * 50);
    this.playTone(baseFreq, 'triangle', 0.1, 0.1);
    setTimeout(() => this.playTone(baseFreq * 1.25, 'triangle', 0.08, 0.08), 60);
  }

  // ============================================================================
  // 🏆 REWARDS & ACHIEVEMENTS
  // ============================================================================

  // Level up - epic ascending fanfare
  playLevelUp() {
    // Dramatic sweep up
    this.playSweep(200, 400, 0.15, 'triangle', 0.1);
    
    // Victory notes
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.3, 0.12);
        // Add harmonics for richness
        this.playTone(freq * 2, 'sine', 0.2, 0.04);
      }, 150 + i * 120);
    });

    // Final sparkle
    setTimeout(() => {
      this.playTone(2093, 'sine', 0.4, 0.06); // High C
      this.playTone(2637, 'sine', 0.3, 0.04); // High E
    }, 800);
  }

  // Claim reward - satisfying collection sound
  playClaim() {
    // Initial pop
    this.playTone(400, 'sine', 0.05, 0.1);
    
    // Rising sparkle
    setTimeout(() => this.playSweep(600, 1200, 0.15, 'sine', 0.08), 50);
    
    // Success chime
    setTimeout(() => {
      this.playTone(880, 'triangle', 0.15, 0.1);
      this.playTone(1100, 'triangle', 0.12, 0.08);
    }, 150);

    // Final sparkle
    setTimeout(() => this.playTone(1760, 'sine', 0.2, 0.05), 300);
  }

  // Coin collect sound
  playCoins() {
    this.playTone(1400, 'sine', 0.08, 0.08);
    setTimeout(() => this.playTone(1800, 'sine', 0.06, 0.06), 60);
    setTimeout(() => this.playTone(2200, 'sine', 0.04, 0.04), 100);
  }

  // XP gain sound
  playXP() {
    this.playSweep(800, 1200, 0.12, 'sine', 0.07);
  }

  // Unlock new item
  playUnlock() {
    // Dramatic pause then reveal
    this.playTone(300, 'triangle', 0.1, 0.08);
    setTimeout(() => {
      this.playSweep(400, 1000, 0.2, 'triangle', 0.1);
      this.playTone(1000, 'sine', 0.3, 0.08);
    }, 150);
    setTimeout(() => {
      this.playTone(1200, 'sine', 0.15, 0.06);
      this.playTone(1500, 'sine', 0.12, 0.04);
    }, 350);
  }

  // Achievement unlocked
  playAchievement() {
    // Build up
    this.playSweep(200, 600, 0.2, 'triangle', 0.08);
    
    // Fanfare
    setTimeout(() => {
      const notes = [659.25, 783.99, 987.77, 1174.66]; // E5, G5, B5, D6
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.1), i * 100);
      });
    }, 200);

    // Final flourish
    setTimeout(() => {
      this.playTone(1318.51, 'sine', 0.4, 0.08); // E6
      this.playTone(1567.98, 'sine', 0.3, 0.05); // G6
    }, 650);
  }

  // ============================================================================
  // 🛒 SHOP & UI SOUNDS
  // ============================================================================

  // Purchase complete
  playPurchase() {
    // Cash register "cha-ching"
    this.playTone(800, 'sine', 0.08, 0.1);
    setTimeout(() => this.playTone(1000, 'sine', 0.08, 0.1), 80);
    setTimeout(() => this.playTone(1200, 'triangle', 0.15, 0.08), 160);
    setTimeout(() => {
      this.playCoins();
    }, 250);
  }

  // Open modal/menu
  playOpen() {
    this.playSweep(300, 600, 0.1, 'sine', 0.06);
  }

  // Close modal/menu
  playClose() {
    this.playSweep(600, 300, 0.08, 'sine', 0.05);
  }

  // Tab switch
  playTab() {
    this.playTone(700, 'sine', 0.04, 0.05);
  }

  // Scroll/swipe
  playScroll() {
    this.playTone(500, 'sine', 0.02, 0.02);
  }

  // Notification/alert
  playNotification() {
    this.playTone(880, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(1100, 'sine', 0.15, 0.08), 150);
  }

  // Message received
  playMessage() {
    this.playTone(600, 'sine', 0.08, 0.06);
    setTimeout(() => this.playTone(800, 'sine', 0.1, 0.08), 100);
  }

  // ============================================================================
  // 🃏 CARD GAME SOUNDS
  // ============================================================================

  // Card flip
  playCardFlip() {
    this.playTone(200, 'triangle', 0.05, 0.08);
    setTimeout(() => this.playTone(400, 'sine', 0.04, 0.05), 30);
  }

  // Card deal
  playCardDeal() {
    this.playTone(300, 'sine', 0.03, 0.06);
  }

  // Card shuffle
  playCardShuffle() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(250 + Math.random() * 100, 'sine', 0.03, 0.04), i * 40);
    }
  }

  // ============================================================================
  // 🎲 SPECIAL EFFECTS
  // ============================================================================

  // Countdown tick
  playTick() {
    this.playTone(1000, 'sine', 0.03, 0.05);
  }

  // Countdown final beep
  playTickFinal() {
    this.playTone(1500, 'sine', 0.1, 0.1);
  }

  // Whoosh/transition
  playWhoosh() {
    this.playSweep(1000, 200, 0.15, 'sine', 0.06);
  }

  // Pop/bubble
  playPop() {
    this.playTone(1200, 'sine', 0.04, 0.08);
  }

  // Sparkle
  playSparkle() {
    const freqs = [1800, 2200, 2600, 3000];
    freqs.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.08, 0.04), i * 50);
    });
  }

  // Bonus/power-up
  playBonus() {
    this.playSweep(400, 1200, 0.2, 'triangle', 0.1);
    setTimeout(() => this.playSparkle(), 150);
  }

  // Timer warning
  playWarning() {
    this.playTone(440, 'sawtooth', 0.15, 0.1);
    setTimeout(() => this.playTone(440, 'sawtooth', 0.15, 0.1), 200);
  }

  // Game start
  playGameStart() {
    this.playTone(440, 'triangle', 0.15, 0.08);
    setTimeout(() => this.playTone(554.37, 'triangle', 0.15, 0.08), 200);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.2, 0.1), 400);
  }
}

export const audio = new SoundManager();
export const sfx = audio; // Alias for backwards compatibility

// ============================================================================
// 🎵 BACKGROUND MUSIC MANAGER
// ============================================================================

type MusicTrack = 'menu' | 'game' | 'puzzle' | 'victory' | 'none';

class MusicManager {
  private currentTrack: MusicTrack = 'none';
  private audioElement: HTMLAudioElement | null = null;
  private enabled: boolean = false; // Default: aus
  private volume: number = 0.08; // Deutlich leiser (8%)
  private fadeInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Load music preference from localStorage
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('leximix_music_enabled');
      const savedVolume = localStorage.getItem('leximix_music_volume');
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === 'true';
      }
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
      }
    }
  }

  private getTrackUrl(track: MusicTrack): string | null {
    const tracks: Record<MusicTrack, string | null> = {
      menu: '/music/menu.mp3',      // Meditating Beat - entspannt für Hauptmenü
      game: '/music/game.mp3',       // Happy Rock - for card games
      puzzle: '/music/puzzle.mp3',   // Cute - for puzzle/word games
      victory: '/music/victory.mp3', // Retro Soul - for wins
      none: null
    };
    return tracks[track];
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('leximix_music_enabled', String(enabled));
    }
    if (!enabled) {
      this.stop();
    } else if (this.currentTrack !== 'none') {
      this.play(this.currentTrack);
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (typeof window !== 'undefined') {
      localStorage.setItem('leximix_music_volume', String(this.volume));
    }
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  private fadeOut(duration: number = 500): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audioElement || this.audioElement.paused) {
        resolve();
        return;
      }

      const startVolume = this.audioElement.volume;
      const steps = 20;
      const stepTime = duration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
      }

      this.fadeInterval = setInterval(() => {
        currentStep++;
        if (this.audioElement) {
          this.audioElement.volume = Math.max(0, startVolume - (volumeStep * currentStep));
        }
        if (currentStep >= steps) {
          if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
          if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.volume = this.volume;
          }
          resolve();
        }
      }, stepTime);
    });
  }

  private fadeIn(duration: number = 500) {
    if (!this.audioElement) return;

    const targetVolume = this.volume;
    this.audioElement.volume = 0;
    this.audioElement.play().catch(() => {});

    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    this.fadeInterval = setInterval(() => {
      currentStep++;
      if (this.audioElement) {
        this.audioElement.volume = Math.min(targetVolume, volumeStep * currentStep);
      }
      if (currentStep >= steps) {
        if (this.fadeInterval) {
          clearInterval(this.fadeInterval);
          this.fadeInterval = null;
        }
      }
    }, stepTime);
  }

  async play(track: MusicTrack) {
    if (!this.enabled || track === 'none') {
      this.currentTrack = track;
      return;
    }

    // If same track is already playing, don't restart
    if (track === this.currentTrack && this.audioElement && !this.audioElement.paused) {
      return;
    }

    // Fade out current track if different
    if (this.currentTrack !== track && this.audioElement && !this.audioElement.paused) {
      await this.fadeOut(300);
    }

    this.currentTrack = track;
    const url = this.getTrackUrl(track);
    
    if (!url) return;

    // Create new audio element
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }

    this.audioElement = new Audio(url);
    this.audioElement.loop = true;
    this.audioElement.volume = 0;

    // Start playing with fade in
    try {
      await this.audioElement.play();
      this.fadeIn(500);
    } catch (e) {
      console.log('[Music] Autoplay blocked, waiting for user interaction');
      // Wait for user interaction
      const playOnInteraction = () => {
        if (this.audioElement && this.currentTrack === track) {
          this.audioElement.play().then(() => this.fadeIn(500)).catch(() => {});
        }
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
      };
      document.addEventListener('click', playOnInteraction);
      document.addEventListener('touchstart', playOnInteraction);
    }
  }

  async stop() {
    if (this.audioElement && !this.audioElement.paused) {
      await this.fadeOut(300);
    }
    this.currentTrack = 'none';
  }

  getCurrentTrack(): MusicTrack {
    return this.currentTrack;
  }

  // Helper to play appropriate music for game modes
  playForMode(mode: string) {
    switch (mode) {
      case 'HOME':
      case 'MENU':
        this.play('menu');
        break;
      case 'MAU_MAU':
      case 'SKAT_MAU_MAU':
      case 'CHECKERS':
      case 'CHESS':
      case 'RUMMY':
      case 'NINE_MENS_MORRIS':
        this.play('game');
        break;
      case 'GAME':
      case 'LEVELS':
      case 'CHALLENGE':
        this.play('puzzle');
        break;
      case 'WIN':
      case 'VICTORY':
        this.play('victory');
        break;
      default:
        this.play('menu');
    }
  }
}

export const music = new MusicManager();
