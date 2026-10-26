/**
 * Procedural Web Audio API Sound Engine & Music Synthesizer for Gloop's Glitch Lab.
 * Runs 100% offline with zero external audio assets required.
 * Fully routable to MediaStreamDestination for video recording with synchronized audio.
 */
class SoundManagerClass {
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private streamDestination: MediaStreamAudioDestinationNode | null = null;

  private isBgmPlaying = false;
  private bgmTimer: number | null = null;
  private currentStep = 0;

  private bgmVolume = 0.45;
  private sfxVolume = 0.8;
  private isMuted = false;

  private initContext() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    // Stream destination for recorder
    this.streamDestination = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.connect(this.streamDestination);
  }

  public getAudioStream(): MediaStream | null {
    this.initContext();
    return this.streamDestination ? this.streamDestination.stream : null;
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(bgm: number, sfx: number, muted: boolean) {
    this.bgmVolume = bgm;
    this.sfxVolume = sfx;
    this.isMuted = muted;

    if (this.ctx && this.masterGain && this.bgmGain && this.sfxGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, now, 0.05);
      this.bgmGain.gain.setTargetAtTime(bgm, now, 0.05);
      this.sfxGain.gain.setTargetAtTime(sfx, now, 0.05);
    }
  }

  // --- Sound Effects ---

  /** High bright chime when an orb is collected */
  public playOrbPickup(combo = 0) {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pentatonic scale frequency offset based on combo
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5, D5, E5, G5, A5, C6
    const freq = notes[combo % notes.length];

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /** Springy boing sound on jump */
  public playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /** Soft landing squish */
  public playLand() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /** High-powered launch boing for bounce pads */
  public playBouncePad() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /** Lane switch whoosh */
  public playLaneSwitch() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Positive gate reward fanfare */
  public playGateBonus() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C major
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.25, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.25);
    });
  }

  /** Negative gate penalty buzz */
  public playGatePenalty() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Obstacle collision hit / bonk */
  public playHit() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    // Low thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Glorious victory fanfare */
  public playVictory() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const notes = [
      { f: 523.25, t: 0.0 }, // C5
      { f: 659.25, t: 0.12 }, // E5
      { f: 783.99, t: 0.24 }, // G5
      { f: 1046.5, t: 0.36 }, // C6
      { f: 880.0,  t: 0.55 }, // A5
      { f: 1046.5, t: 0.72 }  // C6 sustained
    ];

    const baseTime = this.ctx.currentTime;
    notes.forEach(({ f, t }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, baseTime + t);

      const duration = t === 0.72 ? 0.6 : 0.16;
      gain.gain.setValueAtTime(0.35, baseTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, baseTime + t + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(baseTime + t);
      osc.stop(baseTime + t + duration);
    });
  }

  /** Sad defeat trombone drop */
  public playDefeat() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const notes = [440, 415.3, 392, 349.2];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.2);

      gain.gain.setValueAtTime(0.25, now + idx * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.2 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.2);
      osc.stop(now + idx * 0.2 + 0.25);
    });
  }

  /** UI click sound */
  public playClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // --- Procedural Upbeat Background Music ---

  public startBGM() {
    this.initContext();
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.resume();

    // 128 BPM = 0.117s per 16th note step
    const stepDuration = 0.117;
    const bassNotes = [130.81, 130.81, 164.81, 196.0, 146.83, 146.83, 174.61, 220.0]; // C3, E3, G3, D3, F3, A3
    const leadNotes = [523.25, 0, 659.25, 783.99, 0, 880.0, 783.99, 659.25, 587.33, 0, 523.25, 659.25, 783.99, 1046.5, 0, 880.0];

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      const now = this.ctx.currentTime;

      // Bass note on eighth beats
      if (this.currentStep % 2 === 0) {
        const bassFreq = bassNotes[(this.currentStep / 2) % bassNotes.length];
        const bassOsc = this.ctx.createOscillator();
        const bassG = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassG.gain.setValueAtTime(0.2, now);
        bassG.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        bassOsc.connect(bassG);
        bassG.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + 0.18);
      }

      // Lead melody
      const leadFreq = leadNotes[this.currentStep % leadNotes.length];
      if (leadFreq > 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadG = this.ctx.createGain();

        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(leadFreq, now);

        leadG.gain.setValueAtTime(0.12, now);
        leadG.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        leadOsc.connect(leadG);
        leadG.connect(this.bgmGain);

        leadOsc.start(now);
        leadOsc.stop(now + 0.12);
      }

      // Crisp percussion hat on off-beats
      if (this.currentStep % 2 === 1) {
        const hatOsc = this.ctx.createOscillator();
        const hatG = this.ctx.createGain();
        hatOsc.type = 'square';
        hatOsc.frequency.setValueAtTime(1400, now);

        hatG.gain.setValueAtTime(0.03, now);
        hatG.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        hatOsc.connect(hatG);
        hatG.connect(this.bgmGain);

        hatOsc.start(now);
        hatOsc.stop(now + 0.04);
      }

      this.currentStep = (this.currentStep + 1) % 64;
    };

    this.bgmTimer = window.setInterval(playStep, stepDuration * 1000);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const SoundManager = new SoundManagerClass();
