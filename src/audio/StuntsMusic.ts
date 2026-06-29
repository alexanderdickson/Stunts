/**
 * Procedural music inspired by Stunts / 4D Sports Driving DOS soundtrack.
 * Uses Web Audio API with FM-style synthesis (square + triangle + noise).
 */

const BPM = 128;
const BEAT = 60 / BPM;

// Main melody pattern (inspired by Stunts menu/race energy — upbeat minor pentatonic)
const MELODY_NOTES = [
  392.0, 392.0, 466.16, 523.25, 466.16, 392.0, 349.23, 392.0,
  392.0, 466.16, 523.25, 587.33, 523.25, 466.16, 392.0, 349.23,
  349.23, 392.0, 466.16, 392.0, 349.23, 293.66, 349.23, 392.0,
  523.25, 466.16, 392.0, 349.23, 392.0, 466.16, 523.25, 587.33,
];

const BASS_NOTES = [
  98.0, 98.0, 116.54, 130.81, 116.54, 98.0, 87.31, 98.0,
  98.0, 116.54, 130.81, 146.83, 130.81, 116.54, 98.0, 87.31,
];

export class StuntsMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private playing = false;
  private timers: number[] = [];
  private loopTimer = 0;
  private barIndex = 0;

  async start(volume = 0.22): Promise<void> {
    if (this.playing) return;

    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = volume;
    this.master.connect(this.ctx.destination);

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.playing = true;
    this.scheduleLoop();
  }

  stop(): void {
    this.playing = false;
    for (const id of this.timers) {
      clearTimeout(id);
    }
    this.timers = [];
    clearTimeout(this.loopTimer);

    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.master = null;
    }
  }

  setVolume(volume: number): void {
    if (this.master) {
      this.master.gain.value = volume;
    }
  }

  toggle(): boolean {
    if (this.playing) {
      this.stop();
      return false;
    }
    void this.start();
    return true;
  }

  private scheduleLoop(): void {
    if (!this.playing || !this.ctx || !this.master) return;

    const barDuration = BEAT * 16;
    this.playBar(this.barIndex);
    this.barIndex++;

    this.loopTimer = window.setTimeout(() => this.scheduleLoop(), barDuration * 1000);
  }

  private playBar(bar: number): void {
    if (!this.ctx || !this.master) return;

    const t0 = this.ctx.currentTime + 0.05;
    const offset = (bar % 2) * 8;

    for (let i = 0; i < 8; i++) {
      const idx = (offset + i) % MELODY_NOTES.length;
      const start = t0 + i * BEAT * 2;
      this.playNote(MELODY_NOTES[idx], start, BEAT * 1.8, 0.12, 'square');
      this.playNote(MELODY_NOTES[idx] / 2, start, BEAT * 1.8, 0.06, 'triangle');
    }

    for (let i = 0; i < 8; i++) {
      const idx = (offset + i) % BASS_NOTES.length;
      const start = t0 + i * BEAT * 2;
      this.playNote(BASS_NOTES[idx], start, BEAT * 1.9, 0.18, 'square');
    }

    for (let i = 0; i < 16; i++) {
      const start = t0 + i * BEAT;
      this.playDrum(start, i % 4 === 0, i % 8 === 4);
    }

    this.playArpeggio(t0, [392.0, 466.16, 523.25, 587.33], 0.04);
  }

  private playNote(
    freq: number,
    start: number,
    dur: number,
    vol: number,
    type: OscillatorType,
  ): void {
    if (!this.ctx || !this.master) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  private playArpeggio(start: number, freqs: number[], vol: number): void {
    const step = BEAT * 0.5;
    for (let i = 0; i < 16; i++) {
      this.playNote(freqs[i % freqs.length] * 2, start + i * step, step * 0.8, vol, 'triangle');
    }
  }

  private playDrum(start: number, kick: boolean, snare: boolean): void {
    if (!this.ctx || !this.master) return;

    if (kick) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, start);
      osc.frequency.exponentialRampToValueAtTime(40, start + 0.12);
      gain.gain.setValueAtTime(0.3, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(start);
      osc.stop(start + 0.2);
    }

    if (snare) {
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const src = this.ctx.createBufferSource();
      const gain = this.ctx.createGain();
      src.buffer = buffer;
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
      src.connect(gain);
      gain.connect(this.master);
      src.start(start);
    }
  }
}

export const stuntsMusic = new StuntsMusic();
