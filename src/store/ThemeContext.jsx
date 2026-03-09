import { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = {
  undertale: {
    id: 'undertale',
    name: 'UNDERTALE DARK',
    desc: 'Retro dark — coral & amber',
    swatches: ['#0a0a0f', '#e8645a', '#d97706', '#f0e6d3'],
  },
  mono: {
    id: 'mono',
    name: 'MONO',
    desc: 'Black, white, orange & grey',
    swatches: ['#111111', '#f5f5f5', '#f97316', '#888888'],
  },
}

const ThemeCtx = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem('aq_theme') || 'undertale'
  )

  function setTheme(id) {
    setThemeState(id)
    document.documentElement.dataset.theme = id
    localStorage.setItem('aq_theme', id)
  }

  // Apply on first render
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [])

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeCtx.Provider>
  )
}

export const useTheme = () => useContext(ThemeCtx)
