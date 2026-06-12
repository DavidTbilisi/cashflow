let ctx: AudioContext | null = null

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function gain(c: AudioContext, value: number): GainNode {
  const g = c.createGain()
  g.gain.value = value
  g.connect(c.destination)
  return g
}

function osc(c: AudioContext, type: OscillatorType, freq: number, dest: AudioNode): OscillatorNode {
  const o = c.createOscillator()
  o.type = type
  o.frequency.value = freq
  o.connect(dest)
  return o
}

function play(fn: (c: AudioContext, now: number) => void) {
  try { fn(ac(), ac().currentTime) } catch {}
}

// ─── sounds ────────────────────────────────────────────────────────────────

export function soundRoll() {
  play((c, t) => {
    // two soft wooden taps
    ;[0, 0.07].forEach((dt, i) => {
      const len = Math.floor(c.sampleRate * 0.018)
      const buf = c.createBuffer(1, len, c.sampleRate)
      const data = buf.getChannelData(0)
      for (let s = 0; s < len; s++) data[s] = (Math.random() * 2 - 1) * Math.exp(-s / (len * 0.18))
      const src = c.createBufferSource()
      src.buffer = buf
      const bp = c.createBiquadFilter()
      bp.type = 'bandpass'
      bp.frequency.value = 500
      bp.Q.value = 1.2
      const g = c.createGain()
      g.gain.value = i === 0 ? 0.12 : 0.09
      src.connect(bp); bp.connect(g); g.connect(c.destination)
      src.start(t + dt)
    })
    // delicate "tink" at the end
    const g = c.createGain()
    g.connect(c.destination)
    const o = osc(c, 'sine', 1320, g)
    g.gain.setValueAtTime(0, t + 0.14)
    g.gain.linearRampToValueAtTime(0.13, t + 0.15)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.38)
    o.start(t + 0.14)
    o.stop(t + 0.38)
  })
}

export function soundCoin() {
  play((c, t) => {
    ;[523, 659, 784].forEach((freq, i) => {
      const g = gain(c, 0)
      const o = osc(c, 'sine', freq, g)
      const at = t + i * 0.07
      g.gain.setValueAtTime(0, at)
      g.gain.linearRampToValueAtTime(0.18, at + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.18)
      o.start(at)
      o.stop(at + 0.18)
    })
  })
}

export function soundCard() {
  play((c, t) => {
    const g = gain(c, 0.12)
    const o = osc(c, 'sine', 700, g)
    o.frequency.exponentialRampToValueAtTime(250, t + 0.1)
    g.gain.setValueAtTime(0.12, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
    o.start(t)
    o.stop(t + 0.11)
  })
}

export function soundBuy() {
  play((c, t) => {
    ;[523, 659].forEach((freq, i) => {
      const g = gain(c, 0)
      const o = osc(c, 'triangle', freq, g)
      const at = t + i * 0.06
      g.gain.setValueAtTime(0, at)
      g.gain.linearRampToValueAtTime(0.2, at + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.2)
      o.start(at)
      o.stop(at + 0.2)
    })
  })
}

export function soundExpense() {
  play((c, t) => {
    const g = gain(c, 0.15)
    const o = osc(c, 'triangle', 330, g)
    o.frequency.exponentialRampToValueAtTime(196, t + 0.15)
    g.gain.setValueAtTime(0.15, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
    o.start(t)
    o.stop(t + 0.22)
  })
}

export function soundBad() {
  play((c, t) => {
    const g = gain(c, 0.18)
    const o = osc(c, 'sawtooth', 220, g)
    o.frequency.exponentialRampToValueAtTime(110, t + 0.25)
    g.gain.setValueAtTime(0.18, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    o.start(t)
    o.stop(t + 0.3)
  })
}

export function soundBaby() {
  play((c, t) => {
    const g = gain(c, 0)
    const o = osc(c, 'triangle', 1047, g)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.22, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    o.start(t)
    o.stop(t + 0.12)
  })
}

export function soundWin() {
  play((c, t) => {
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const g = gain(c, 0)
      const o = osc(c, 'sine', freq, g)
      const at = t + i * 0.1
      g.gain.setValueAtTime(0, at)
      g.gain.linearRampToValueAtTime(0.2, at + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.35)
      o.start(at)
      o.stop(at + 0.35)
    })
  })
}

export function soundFail() {
  play((c, t) => {
    ;[294, 220].forEach((freq, i) => {
      const g = gain(c, 0)
      const o = osc(c, 'sawtooth', freq, g)
      const at = t + i * 0.12
      g.gain.setValueAtTime(0, at)
      g.gain.linearRampToValueAtTime(0.15, at + 0.01)
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.3)
      o.start(at)
      o.stop(at + 0.3)
    })
  })
}
