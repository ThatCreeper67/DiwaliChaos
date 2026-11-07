// SoundSystem.js - Procedural Web Audio API sound synthesizer
// Plays lively Indian festive chiptune music & cartoon sound effects with zero external audio assets!

export class SoundSystem {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.isMuted = false;
    this.musicVolume = 0.4;
    this.sfxVolume = 0.7;

    this.currentTrack = null;
    this.musicInterval = null;
    this.stepCounter = 0;
    this.currentTrackName = null;

    // Load saved volume preferences
    try {
      const savedMute = localStorage.getItem('diwali_chaos_mute');
      if (savedMute !== null) this.isMuted = savedMute === 'true';
      const savedMusic = localStorage.getItem('diwali_chaos_music_vol');
      if (savedMusic !== null) this.musicVolume = parseFloat(savedMusic);
      const savedSfx = localStorage.getItem('diwali_chaos_sfx_vol');
      if (savedSfx !== null) this.sfxVolume = parseFloat(savedSfx);
    } catch (e) {
      // Ignore
    }
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    } catch (err) {
      console.warn('Web Audio not supported or blocked:', err);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute) {
    this.isMuted = mute;
    try {
      localStorage.setItem('diwali_chaos_mute', String(mute));
    } catch (e) {}
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 1, this.ctx.currentTime);
    }
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('diwali_chaos_music_vol', String(this.musicVolume));
    } catch (e) {}
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('diwali_chaos_sfx_vol', String(this.sfxVolume));
    } catch (e) {}
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  // --- SOUND EFFECTS ---
  playTone(freq, duration, type = 'sine', decay = true, dest = this.sfxGain) {
    if (!this.ctx) return;
    this.resume();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.3, now);
      if (decay) {
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      } else {
        gain.gain.setValueAtTime(0.3, now + duration - 0.02);
        gain.gain.linearRampToValueAtTime(0.001, now + duration);
      }

      osc.connect(gain);
      gain.connect(dest || this.sfxGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  playNoise(duration, decay = true) {
    if (!this.ctx) return;
    this.resume();
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.4, now);
      if (decay) {
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      }

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      whiteNoise.start(now);
      whiteNoise.stop(now + duration);
    } catch (e) {}
  }

  // Game SFX
  playMenuHover() {
    this.playTone(520, 0.04, 'triangle');
  }

  playMenuSelect() {
    this.playTone(660, 0.08, 'square');
    setTimeout(() => this.playTone(880, 0.12, 'square'), 50);
  }

  playLaddooPickup() {
    // Sparkly festive chime
    this.playTone(587.33, 0.1, 'sine'); // D5
    setTimeout(() => this.playTone(739.99, 0.1, 'sine'), 60); // F#5
    setTimeout(() => this.playTone(880.00, 0.18, 'sine'), 120); // A5
  }

  playEatLaddoo() {
    // Chewing sound + happy heal ding!
    this.playTone(300, 0.06, 'triangle');
    setTimeout(() => this.playTone(360, 0.06, 'triangle'), 70);
    setTimeout(() => this.playTone(450, 0.06, 'triangle'), 140);
    setTimeout(() => {
      this.playTone(523.25, 0.15, 'sine');
      this.playTone(659.25, 0.25, 'sine');
    }, 220);
  }

  playBombThrow() {
    // Whoosh
    if (!this.ctx) return;
    this.resume();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.18);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  playBombExplosion() {
    // Cartoon Sutli Bomb pop!
    this.playNoise(0.35, true);
    this.playTone(120, 0.3, 'sawtooth');
    setTimeout(() => {
      this.playTone(80, 0.25, 'triangle');
    }, 40);
  }

  playAlert() {
    // Dramatic exclamation alert tone
    this.playTone(700, 0.1, 'sawtooth');
    setTimeout(() => this.playTone(950, 0.2, 'sawtooth'), 80);
  }

  playCaught() {
    // Comical fail trombone / slide whistle
    if (!this.ctx) return;
    this.resume();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(160, now + 0.5);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  playObjectiveComplete() {
    // Triumphant Diwali brass fanfare
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'square');
      }, idx * 100);
    });
  }

  playUnlockDoor() {
    this.playTone(350, 0.08, 'square');
    setTimeout(() => this.playTone(550, 0.15, 'triangle'), 90);
  }

  playDialogueBlip() {
    const pitch = 380 + Math.random() * 80;
    this.playTone(pitch, 0.03, 'sine');
  }

  playSharmaShout() {
    // Grunt / megaphone buzz
    this.playTone(180, 0.2, 'sawtooth');
    setTimeout(() => this.playTone(220, 0.25, 'sawtooth'), 50);
  }

  // --- MUSIC TRACK GENERATOR ---
  // Rhythmic procedural looping soundtrack for Indian Festive atmosphere
  playMusic(trackName) {
    if (this.currentTrackName === trackName) return;
    this.stopMusic();
    this.currentTrackName = trackName;
    this.init();
    this.resume();

    // Notes frequencies (Indian Bhairav / Bilawal / Festive scales)
    const SA = 220;    // A3
    const RE = 247.5;  // B3
    const GA = 277.18; // C#4
    const MA = 293.66; // D4
    const PA = 329.63; // E4
    const DHA = 369.99;// F#4
    const NI = 415.30; // G#4
    const SA2 = 440;   // A4
    const RE2 = 495;   // B4
    const GA2 = 554.37;// C#5

    // Track patterns (Tempo in BPM, step notes array, percussion style)
    let tempo = 120;
    let melody = [];
    let bass = [];

    switch (trackName) {
      case 'menu':
        tempo = 110;
        // Warm celebratory raga melody
        melody = [SA2, GA2, PA, GA2, RE2, SA2, NI, PA, SA2, RE2, GA2, PA, DHA, PA, GA2, RE2];
        bass = [SA, PA / 2, SA, PA / 2];
        break;

      case 'bazaar':
        tempo = 135;
        // Bustling energetic market rhythm
        melody = [PA, GA2, PA, SA2, DHA, PA, GA2, RE2, SA2, RE2, GA2, RE2, SA2, NI, SA, SA];
        bass = [SA, SA, PA, SA];
        break;

      case 'society':
        tempo = 125;
        // Cheerful neighborhood exploration
        melody = [GA2, RE2, SA2, GA2, PA, DHA, PA, GA2, RE2, SA2, RE2, NI, SA2, SA2, 0, 0];
        bass = [SA, GA, PA, GA];
        break;

      case 'home':
        tempo = 100;
        // Sneaky, stealthy, tiptoe rhythm
        melody = [SA, 0, RE, 0, SA, 0, NI / 2, 0, SA, 0, GA, 0, RE, 0, SA, 0];
        bass = [SA / 2, 0, SA / 2, 0];
        break;

      case 'maze':
        tempo = 115;
        // Mysterious nocturnal night garden
        melody = [PA, 0, DHA, PA, GA2, 0, RE2, 0, SA2, 0, NI, 0, PA, 0, SA2, 0];
        bass = [SA / 2, PA / 2, SA / 2, PA / 2];
        break;

      case 'boss':
        tempo = 150;
        // Intense frantic showdown with Sharma Ji!
        melody = [SA2, SA2, GA2, SA2, RE2, RE2, PA, RE2, GA2, GA2, DHA, GA2, PA, DHA, SA2 * 1.5, PA];
        bass = [SA, SA * 1.5, SA, SA * 1.5];
        break;

      case 'credits':
        tempo = 105;
        // Joyous, warm finale celebration
        melody = [SA2, RE2, GA2, PA, DHA, SA2 * 1.5, DHA, PA, GA2, RE2, SA2, GA2, RE2, SA2, SA2, SA2];
        bass = [SA, PA / 2, SA, PA / 2];
        break;

      default:
        melody = [SA2, PA, GA2, SA2];
        bass = [SA, PA / 2];
        break;
    }

    const stepTime = (60 / tempo) / 2 * 1000; // 8th notes in ms
    let step = 0;

    this.musicInterval = setInterval(() => {
      if (!this.ctx || this.isMuted) return;

      // Play melody note
      const note = melody[step % melody.length];
      if (note && note > 0) {
        this.playTone(note, (stepTime / 1000) * 0.8, 'triangle', true, this.musicGain);
      }

      // Play bass drone / tabla dagga thump
      if (step % 2 === 0) {
        const bassNote = bass[(step / 2) % bass.length];
        if (bassNote && bassNote > 0) {
          this.playTone(bassNote, (stepTime / 1000) * 1.5, 'sine', true, this.musicGain);
        }
      }

      // Percussion tap (chaanti / shaker)
      if (trackName === 'boss' || trackName === 'bazaar') {
        if (step % 2 === 1) {
          this.playTone(1200 + Math.random() * 200, 0.02, 'square', true, this.musicGain);
        }
      }

      step++;
    }, stepTime);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentTrackName = null;
  }
}

// Global Sound instance
export const soundManager = new SoundSystem();
