// ── Storage key (bumped from v1 → act1 to wipe old save data) ────────────────
const KEY = 'algoquest_act1'

// ── Level Mode levels — driven by shared registry ────────────────────────────
import { LEVEL_REGISTRY } from '../data/levels/index.js'
export const LEVELS = LEVEL_REGISTRY

// ── Default RPG flags — Act 1 ─────────────────────────────────────────────────
const DEFAULT_RPG_FLAGS = {
  correctness:         0,
  efficiency:          0,
  harmony:             0,
  completedEncounters: [],
  keyDecisions:        {},   // { coreValue, profilerDeal, loopChoice, helpedByte }
}

// ── Full default state ────────────────────────────────────────────────────────
const DEFAULT = {
  // Level Mode
  xp:              0,
  completedLevels: [],
  levelStars:      {},
  // RPG Mode
  rpgFlags:            { ...DEFAULT_RPG_FLAGS },
  rpgRoom:             'r1',
  rpgX:                5,
  rpgY:                3,
  storyUnlockedLevels: [],   // ids unlocked via story encounters
  returnToRPG:         null, // { room, x, y, encounterId } — transient, survives refresh
  // Meta
  hasSeenIntro:        false, // gates IntroCutscene on first RPG launch
  lastEffects:         null,  // { correctness?, efficiency?, harmony? } from last battle — shown as toast
}

// ── Load / save ───────────────────────────────────────────────────────────────
export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT, rpgFlags: { ...DEFAULT_RPG_FLAGS } }
    const saved = JSON.parse(raw)
    return {
      ...DEFAULT,
      ...saved,
      rpgFlags: {
        ...DEFAULT_RPG_FLAGS,
        ...saved.rpgFlags,
        keyDecisions: { ...(saved.rpgFlags?.keyDecisions || {}) },
      },
    }
  } catch {
    return { ...DEFAULT, rpgFlags: { ...DEFAULT_RPG_FLAGS } }
  }
}

export function saveState(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* noop */ }
}

// ── Level unlock logic ────────────────────────────────────────────────────────
// unlockedByDefault → always open
// unlockAfter → requires that level to be completed
// storyOnly → requires story unlock via RPG encounter
export function isUnlocked(levelId, completedLevels, storyUnlockedLevels = []) {
  const level = LEVELS.find(l => l.id === levelId)
  if (!level) return false
  if (level.unlockedByDefault) return true
  if (level.storyOnly) return storyUnlockedLevels.includes(levelId)
  if (level.unlockAfter) return completedLevels.includes(level.unlockAfter)
  return false
}

// ── Reset ─────────────────────────────────────────────────────────────────────
export function resetState() {
  return { ...DEFAULT, rpgFlags: { ...DEFAULT_RPG_FLAGS } }
}
