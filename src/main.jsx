import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { GameProvider } from './store/GameContext.jsx'
import { ThemeProvider } from './store/ThemeContext.jsx'
import { AudioProvider } from './audio/AudioContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider>
        <GameProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </GameProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)
