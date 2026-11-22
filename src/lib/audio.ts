// Procedural Web Audio API Engine
// Zero external audio files - pure synthesized acoustic & mechanical feedback

class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private lastTickTime: number = 0;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("su_audio_muted");
      this.muted = saved === "true";
    }
  }

  private initContext(): boolean {
    if (typeof window === "undefined") return false;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return true;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("su_audio_muted", String(muted));
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    if (!this.muted) {
      this.playTickSound(1.2);
    }
    return this.muted;
  }

  // Soft low-frequency sub-bass swell for entering the archive
  public playEnterSwell() {
    if (this.muted || !this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(55, now); // A1 note
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.6); // Octave rise to A2

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Micro-burst analog tape click on reel drag
  public playTapeClick() {
    if (this.muted || !this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Rate limit to prevent distortion during rapid dragging
      if (now - this.lastTickTime < 0.05) return;
      this.lastTickTime = now;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.035);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Silent catch
    }
  }

  // Crisp mechanical relay tick when scrubbing bottom film ruler
  public playTickSound(pitchMultiplier: number = 1.0) {
    if (this.muted || !this.initContext() || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (now - this.lastTickTime < 0.03) return;
      this.lastTickTime = now;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      const baseFreq = 1800 * pitchMultiplier;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // Silent catch
    }
  }
}

export const audio = new ProceduralAudioEngine();
