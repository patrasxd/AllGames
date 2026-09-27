/**
 * Web Audio Synthesizer for Artillery Duel.
 * Zero external asset dependencies — procedural retro synth audio.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null
  private muted = false

  constructor() {
    // Lazily initialized on first user interaction
  }

  public setMuted(muted: boolean) {
    this.muted = muted
  }

  public isMuted(): boolean {
    return this.muted
  }

  public toggleMute(): boolean {
    this.muted = !this.muted
    return this.muted
  }

  public init() {
    this.initCtx()
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        void this.ctx.resume()
      } catch {
        // Audio resume error handling
      }
    }
  }

  private initCtx() {
    if (this.ctx) return
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioCtx) {
      try {
        this.ctx = new AudioCtx()
      } catch {
        // Audio unavailable
      }
    }
  }

  /** Deep cannon launch boom */
  public playFire() {
    if (this.muted) return
    this.init()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(260, now)
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35)

      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.36)
    } catch {
      // Audio node error handling
    }
  }

  /** Heavy explosive blast with noise */
  public playExplosion(radius = 35) {
    if (this.muted) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const duration = Math.min(0.8, 0.3 + (radius / 50) * 0.4)
      const bufferSize = Math.floor(this.ctx.sampleRate * duration)
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(600, this.ctx.currentTime)
      filter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + duration)

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.6, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      noise.start(this.ctx.currentTime)
    } catch {
      // Audio node error handling
    }
  }

  /** Direct hit metallic clank */
  public playHit() {
    if (this.muted) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.15)

      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.16)
    } catch {
      // Audio node error handling
    }
  }

  /** Tank track rumble / move click */
  public playMove() {
    if (this.muted) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(70, now)
      osc.frequency.linearRampToValueAtTime(50, now + 0.05)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.06)
    } catch {
      // Audio node error handling
    }
  }

  /** Victory fanfare arpeggio */
  public playVictory() {
    if (this.muted) return
    this.initCtx()
    if (!this.ctx) return

    try {
      const notes = [261.63, 329.63, 392.0, 523.25] // C - E - G - C
      notes.forEach((freq, idx) => {
        if (!this.ctx) return
        const now = this.ctx.currentTime + idx * 0.12
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now)

        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(now)
        osc.stop(now + 0.31)
      })
    } catch {
      // Audio node error handling
    }
  }
}

export const sound = new SoundSynthesizer()

// Warm up AudioContext on the very first user interaction anywhere in the window
if (typeof window !== 'undefined') {
  const warmUp = () => {
    sound.init()
    window.removeEventListener('pointerdown', warmUp)
    window.removeEventListener('keydown', warmUp)
    window.removeEventListener('touchstart', warmUp)
  }
  window.addEventListener('pointerdown', warmUp, { passive: true })
  window.addEventListener('keydown', warmUp, { passive: true })
  window.addEventListener('touchstart', warmUp, { passive: true })
}
