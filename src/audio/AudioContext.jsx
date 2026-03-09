// ── AudioContext React provider ────────────────────────────────────────────────
// Wraps the Web Audio singleton. Initialises on first user interaction.
// Provides: { sfx, setRoomBGM, bgmEnabled, sfxEnabled, toggleBGM, toggleSFX,
//             bgmVolume, sfxVolume, setBGMVolume, setSFXVolume }

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import * as Engine from './audioEngine.js'

const AudioCtx = createContext(null)

export function AudioProvider({ children }) {
  const [bgmEnabled, setBgmEnabled] = useState(true)
  const [sfxEnabled, setSfxEnabled] = useState(true)
  const [bgmVolume,  setBGMVol]     = useState(0.6)
  const [sfxVolume,  setSFXVol]     = useState(0.8)
  const initialized = useRef(false)

  // Init on first gesture
  useEffect(() => {
    function handleGesture() {
      if (initialized.current) return
      initialized.current = true
      Engine.initAudio()
      Engine.resumeAudio()
    }
    window.addEventListener('keydown',   handleGesture, { once: false, passive: true })
    window.addEventListener('pointerdown', handleGesture, { once: false, passive: true })
    return () => {
      window.removeEventListener('keydown',    handleGesture)
      window.removeEventListener('pointerdown', handleGesture)
    }
  }, [])

  // Sync BGM volume
  useEffect(() => {
    Engine.setBGMVolume(bgmEnabled ? bgmVolume : 0)
  }, [bgmEnabled, bgmVolume])

  const setRoomBGM = useCallback((roomId) => {
    if (!bgmEnabled) return
    Engine.setRoomBGM(roomId)
  }, [bgmEnabled])

  function playSFX(name) {
    if (!sfxEnabled) return
    if (!initialized.current) {
      Engine.initAudio()
      Engine.resumeAudio()
      initialized.current = true
    }
    Engine.SFX[name]?.()
  }

  function toggleBGM() {
    setBgmEnabled(v => {
      if (v) { Engine.setBGMVolume(0) }
      else    { Engine.resumeAudio(); Engine.setBGMVolume(bgmVolume) }
      return !v
    })
  }

  function toggleSFX() { setSfxEnabled(v => !v) }

  function handleSetBGMVolume(v) {
    setBGMVol(v)
    if (bgmEnabled) Engine.setBGMVolume(v)
  }

  function handleSetSFXVolume(v) { setSFXVol(v) }

  return (
    <AudioCtx.Provider value={{
      sfx: playSFX,
      setRoomBGM,
      bgmEnabled,
      sfxEnabled,
      toggleBGM,
      toggleSFX,
      bgmVolume,
      sfxVolume,
      setBGMVolume: handleSetBGMVolume,
      setSFXVolume: handleSetSFXVolume,
    }}>
      {children}
    </AudioCtx.Provider>
  )
}

export const useAudio = () => useContext(AudioCtx)
