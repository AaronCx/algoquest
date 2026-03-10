import { createContext, useContext, useState } from 'react'
import { loadState, saveState, resetState } from './gameStore.js'
import { ENCOUNTER_UNLOCKS } from '../data/act1Progression.js'

const SPEED_KEY = 'aq_animation_speed'
const STEP_MODE_KEY = 'aq_step_mode'

const Ctx = createContext(null)

export function GameProvider({ children }) {
  const [state, setState] = useState(loadState)
  const [animationSpeed, setAnimationSpeedState] = useState(
    () => parseFloat(localStorage.getItem(SPEED_KEY)) || 1
  )
  const [stepMode, setStepModeState] = useState(
    () => localStorage.getItem(STEP_MODE_KEY) === 'true'
  )

  function setAnimationSpeed(speed) {
    setAnimationSpeedState(speed)
    localStorage.setItem(SPEED_KEY, String(speed))
  }

  function setStepMode(enabled) {
    setStepModeState(enabled)
    localStorage.setItem(STEP_MODE_KEY, String(enabled))
  }

  // ── Level Mode ─────────────────────────────────────────────────────────────
  function completeLevel(levelId, stars, xpEarned) {
    setState(prev => {
      const next = { ...prev }
      if (!next.completedLevels.includes(levelId)) {
        next.completedLevels = [...next.completedLevels, levelId]
      }
      const prevStars = next.levelStars[levelId] || 0
      next.levelStars = { ...next.levelStars, [levelId]: Math.max(prevStars, stars) }
      next.xp = prev.xp + xpEarned
      saveState(next)
      return next
    })
  }

  // ── RPG: position persistence ──────────────────────────────────────────────
  function saveRPGPosition(room, x, y) {
    setState(prev => {
      const next = { ...prev, rpgRoom: room, rpgX: x, rpgY: y }
      saveState(next)
      return next
    })
  }

  // ── RPG: apply dialogue effects (non-battle) ───────────────────────────────
  function applyRPGEffects(effects) {
    if (!effects) return
    setState(prev => {
      const flags = { ...prev.rpgFlags }
      if (effects.correctness) flags.correctness = (flags.correctness || 0) + effects.correctness
      if (effects.efficiency)  flags.efficiency  = (flags.efficiency  || 0) + effects.efficiency
      if (effects.harmony)     flags.harmony     = (flags.harmony     || 0) + effects.harmony
      if (effects.completeEncounter && !flags.completedEncounters.includes(effects.completeEncounter)) {
        flags.completedEncounters = [...flags.completedEncounters, effects.completeEncounter]
      }
      const next = { ...prev, rpgFlags: flags }
      saveState(next)
      return next
    })
  }

  // ── RPG: save return context before entering a battle ─────────────────────
  function setReturnToRPG(ctx) { // ctx = { room, x, y, encounterId }
    setState(prev => {
      const next = { ...prev, returnToRPG: ctx }
      saveState(next)
      return next
    })
  }

  // ── RPG: called when returning from an existing LEVEL battle ──────────────
  // (PlaceholderBattle uses completeEncounterWithEffects instead)
  function completeEncounter(encounterId) {
    setState(prev => {
      const flags = { ...prev.rpgFlags }
      if (!flags.completedEncounters.includes(encounterId)) {
        flags.completedEncounters = [...flags.completedEncounters, encounterId]
      }
      const toUnlock = ENCOUNTER_UNLOCKS[encounterId] || []
      const storyUnlocked = [...new Set([...prev.storyUnlockedLevels, ...toUnlock])]
      const next = { ...prev, rpgFlags: flags, storyUnlockedLevels: storyUnlocked, returnToRPG: null }
      saveState(next)
      return next
    })
  }

  // ── RPG: called by PlaceholderBattle on completion ────────────────────────
  // Applies approach effects + key decisions + unlocks, then clears returnToRPG
  function completeEncounterWithEffects(encounterId, effects = {}) {
    setState(prev => {
      const flags = { ...prev.rpgFlags, keyDecisions: { ...(prev.rpgFlags.keyDecisions || {}) } }

      // Stat effects
      if (effects.correctness) flags.correctness = (flags.correctness || 0) + effects.correctness
      if (effects.efficiency)  flags.efficiency  = (flags.efficiency  || 0) + effects.efficiency
      if (effects.harmony)     flags.harmony     = (flags.harmony     || 0) + effects.harmony

      // Key decision
      if (effects.keyDecision) {
        flags.keyDecisions = {
          ...flags.keyDecisions,
          [effects.keyDecision.key]: effects.keyDecision.value,
        }
      }

      // Mark encounter complete
      if (!flags.completedEncounters.includes(encounterId)) {
        flags.completedEncounters = [...flags.completedEncounters, encounterId]
      }

      // Story level unlocks
      const toUnlock = ENCOUNTER_UNLOCKS[encounterId] || []
      const storyUnlockedLevels = [...new Set([...prev.storyUnlockedLevels, ...toUnlock])]

      // Capture stat gains for toast display on return to overworld
      const statEffects = {}
      if (effects.correctness) statEffects.correctness = effects.correctness
      if (effects.efficiency)  statEffects.efficiency  = effects.efficiency
      if (effects.harmony)     statEffects.harmony     = effects.harmony

      const next = {
        ...prev,
        rpgFlags: flags,
        storyUnlockedLevels,
        returnToRPG: null,
        lastEffects: Object.keys(statEffects).length > 0 ? statEffects : null,
      }
      saveState(next)
      return next
    })
  }

  // ── Mark intro as seen ─────────────────────────────────────────────────────
  function markIntroSeen() {
    setState(prev => {
      const next = { ...prev, hasSeenIntro: true }
      saveState(next)
      return next
    })
  }

  // ── Clear last effects toast ───────────────────────────────────────────────
  function clearLastEffects() {
    setState(prev => {
      const next = { ...prev, lastEffects: null }
      saveState(next)
      return next
    })
  }

  // ── Story unlock (manual) ──────────────────────────────────────────────────
  function unlockLevel(levelId) {
    setState(prev => {
      const storyUnlockedLevels = [...new Set([...prev.storyUnlockedLevels, levelId])]
      const next = { ...prev, storyUnlockedLevels }
      saveState(next)
      return next
    })
  }

  // ── Full game reset ────────────────────────────────────────────────────────
  function resetGame() {
    const fresh = resetState()
    saveState(fresh)
    setState(fresh)
  }

  return (
    <Ctx.Provider value={{
      state,
      completeLevel,
      saveRPGPosition,
      applyRPGEffects,
      setReturnToRPG,
      completeEncounter,
      completeEncounterWithEffects,
      markIntroSeen,
      clearLastEffects,
      unlockLevel,
      resetGame,
      animationSpeed,
      setAnimationSpeed,
      stepMode,
      setStepMode,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useGame = () => useContext(Ctx)
