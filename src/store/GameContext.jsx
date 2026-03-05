import { createContext, useContext, useState } from 'react'
import { loadState, saveState } from './gameStore.js'

const Ctx = createContext(null)

export function GameProvider({ children }) {
  const [state, setState] = useState(loadState)

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

  return <Ctx.Provider value={{ state, completeLevel }}>{children}</Ctx.Provider>
}

export const useGame = () => useContext(Ctx)
