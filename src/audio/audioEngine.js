// ── AlgoQuest Web Audio Engine ────────────────────────────────────────────────
// Pure Web Audio API — no files, no CDN. All sound is procedurally synthesized.
// Singleton pattern: one AudioContext shared across the entire app.

let ctx = null
let masterGain = null
let bgmOsc = null
let bgmGain = null
let bgmInterval = null
let currentZone = null

const BGM_VOL  = 0.12  // master BGM volume (quiet, atmospheric)
const SFX_VOL  = 0.35  // master SFX volume

// ── Initialize (call once, after user gesture) ────────────────────────────────
export function initAudio() {
  if (ctx) return ctx
  ctx = new (window.AudioContext || window.webkitAudioContext)()
  masterGain = ctx.createGain()
  masterGain.gain.value = 1.0
  masterGain.connect(ctx.destination)
  return ctx
}

export function resumeAudio() {
  if (ctx?.state === 'suspended') ctx.resume()
}

// ── Volume control ────────────────────────────────────────────────────────────
export function setMasterVolume(v) {
  if (masterGain) masterGain.gain.setTargetAtTime(v, ctx.currentTime, 0.05)
}

export function setBGMVolume(v) {
  if (bgmGain) bgmGain.gain.setTargetAtTime(v * BGM_VOL, ctx.currentTime, 0.1)
}

// ── Utility ───────────────────────────────────────────────────────────────────
function now() { return ctx?.currentTime ?? 0 }

function makeGain(value, dest) {
  const g = ctx.createGain()
  g.gain.value = value
  g.connect(dest || masterGain)
  return g
}

function beep(freq, duration, type = 'square', vol = SFX_VOL, startTime = 0) {
  if (!ctx) return
  const t = now() + startTime
  const osc = ctx.createOscillator()
  const gain = makeGain(0)
  osc.type = type
  osc.frequency.value = freq
  osc.connect(gain)
  gain.gain.setTargetAtTime(vol, t, 0.005)
  gain.gain.setTargetAtTime(0,   t + duration * 0.8, 0.025)
  osc.start(t)
  osc.stop(t + duration + 0.05)
}

// ── Zone BGM definitions ──────────────────────────────────────────────────────
// Each zone is a melody pattern: array of [semitone, duration_s]
// Played in a loop at a base frequency.

const ZONE_BGM = {
  meadow: {
    baseHz: 220,   // A3
    pattern: [
      [0,0.3],[4,0.3],[7,0.3],[0,0.3],[4,0.6],
      [2,0.3],[5,0.3],[9,0.3],[2,0.3],[5,0.6],
      [0,0.3],[7,0.3],[4,0.3],[7,0.6],
      [-5,0.3],[0,0.6],
    ],
    waveType: 'sine',
  },
  camp: {
    baseHz: 246.94, // B3
    pattern: [
      [0,0.4],[3,0.4],[7,0.4],[10,0.4],
      [12,0.4],[10,0.4],[7,0.4],[3,0.8],
      [0,0.4],[5,0.4],[8,0.4],[5,0.4],
      [3,0.8],[0,0.8],
    ],
    waveType: 'triangle',
  },
  citadel: {
    baseHz: 130.81, // C3
    pattern: [
      [0,0.5],[0,0.5],[7,0.5],[5,0.5],
      [3,0.5],[3,0.5],[0,1.0],
      [5,0.5],[5,0.5],[8,0.5],[7,0.5],
      [5,0.5],[3,0.5],[0,1.0],
    ],
    waveType: 'square',
  },
  shrine: {
    baseHz: 174.61, // F3
    pattern: [
      [0,0.6],[5,0.6],[10,0.6],[15,0.6],
      [12,0.6],[8,0.6],[5,0.6],[0,1.2],
      [3,0.6],[8,0.6],[12,0.6],[8,0.6],
      [5,0.6],[3,0.6],[0,1.2],
    ],
    waveType: 'sine',
  },
  lake: {
    baseHz: 196,   // G3
    pattern: [
      [0,0.8],[4,0.8],[7,0.8],[11,0.8],
      [9,0.8],[7,0.8],[4,0.8],[0,1.6],
      [2,0.8],[5,0.8],[9,0.8],[5,0.8],
      [2,0.8],[0,1.6],
    ],
    waveType: 'triangle',
  },
  chapel: {
    baseHz: 261.63, // C4
    pattern: [
      [0,0.5],[4,0.5],[7,0.5],[4,0.5],
      [0,0.5],[4,0.5],[9,0.5],[7,1.0],
      [5,0.5],[7,0.5],[9,0.5],[7,0.5],
      [5,0.5],[4,0.5],[0,1.0],
    ],
    waveType: 'sine',
  },
}

// Semitone → frequency multiplier
function semitoneToHz(base, semi) {
  return base * Math.pow(2, semi / 12)
}

// ── BGM playback ──────────────────────────────────────────────────────────────
function stopBGM() {
  clearInterval(bgmInterval)
  bgmInterval = null
  if (bgmOsc) { try { bgmOsc.stop() } catch { /* ignore stop errors */ } bgmOsc = null }
  if (bgmGain) { bgmGain.disconnect(); bgmGain = null }
  currentZone = null
}

function playBGMZone(zoneName) {
  if (!ctx) return
  if (currentZone === zoneName) return

  stopBGM()
  currentZone = zoneName
  const def = ZONE_BGM[zoneName]
  if (!def) return

  bgmGain = ctx.createGain()
  bgmGain.gain.value = BGM_VOL
  bgmGain.connect(masterGain)

  // Add a subtle reverb-like delay for atmosphere
  const delay = ctx.createDelay(0.5)
  delay.delayTime.value = 0.25
  const delayGain = ctx.createGain()
  delayGain.gain.value = 0.18
  bgmGain.connect(delay)
  delay.connect(delayGain)
  delayGain.connect(bgmGain)

  let noteIdx = 0
  let nextTime = now() + 0.1

  function scheduleNotes() {
    const lookAhead = 0.3 // seconds to schedule ahead

    while (nextTime < now() + lookAhead) {
      const [semi, dur] = def.pattern[noteIdx % def.pattern.length]
      const freq = semitoneToHz(def.baseHz, semi)
      const osc = ctx.createOscillator()
      const noteGain = ctx.createGain()

      osc.type = def.waveType
      osc.frequency.value = freq
      osc.connect(noteGain)
      noteGain.connect(bgmGain)

      noteGain.gain.setValueAtTime(0, nextTime)
      noteGain.gain.linearRampToValueAtTime(1, nextTime + 0.02)
      noteGain.gain.setValueAtTime(1, nextTime + dur * 0.7)
      noteGain.gain.linearRampToValueAtTime(0, nextTime + dur)

      osc.start(nextTime)
      osc.stop(nextTime + dur + 0.05)

      nextTime += dur
      noteIdx++
    }
  }

  scheduleNotes()
  bgmInterval = setInterval(scheduleNotes, 100)
}

// ── Room → zone mapping ───────────────────────────────────────────────────────
const ROOM_ZONE = {
  r1:  'meadow',
  r2:  'camp',
  r3:  'citadel',
  r4:  'camp',
  r5:  'citadel',
  r6:  'shrine',
  r7:  'lake',
  r8:  'chapel',
  r9:  'meadow',
  r10: 'chapel',
}

export function setRoomBGM(roomId) {
  const zone = ROOM_ZONE[roomId] || 'meadow'
  playBGMZone(zone)
}

// ── SFX ───────────────────────────────────────────────────────────────────────
export const SFX = {
  step() {
    if (!ctx) return
    beep(180, 0.04, 'square', 0.06)
    beep(160, 0.04, 'square', 0.04, 0.04)
  },

  blip() {
    if (!ctx) return
    beep(880, 0.06, 'square', 0.15)
  },

  correct() {
    if (!ctx) return
    beep(523, 0.08, 'square', 0.2)
    beep(659, 0.08, 'square', 0.2, 0.08)
    beep(784, 0.15, 'square', 0.2, 0.16)
  },

  wrong() {
    if (!ctx) return
    beep(220, 0.12, 'sawtooth', 0.2)
    beep(196, 0.18, 'sawtooth', 0.15, 0.1)
  },

  door() {
    if (!ctx) return
    beep(330, 0.06, 'triangle', 0.18)
    beep(440, 0.12, 'triangle', 0.22, 0.06)
  },

  statUp() {
    if (!ctx) return
    beep(523, 0.07, 'square', 0.18)
    beep(659, 0.07, 'square', 0.18, 0.07)
    beep(784, 0.07, 'square', 0.18, 0.14)
    beep(1047,0.12, 'square', 0.18, 0.21)
  },

  battleStart() {
    if (!ctx) return
    // Dramatic descending fanfare
    beep(392, 0.12, 'square', 0.22)
    beep(330, 0.12, 'square', 0.20, 0.12)
    beep(294, 0.12, 'square', 0.18, 0.24)
    beep(262, 0.25, 'square', 0.25, 0.36)
  },

  dialogOpen() {
    if (!ctx) return
    beep(440, 0.05, 'square', 0.12)
  },

  dialogChar() {
    if (!ctx) return
    const freqs = [440, 494, 523, 587]
    beep(freqs[Math.floor(Math.random() * freqs.length)], 0.025, 'square', 0.04)
  },
}

export function stopAll() {
  stopBGM()
}
