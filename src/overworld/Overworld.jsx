import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../store/GameContext.jsx'
import { useAudio } from '../audio/AudioContext.jsx'
import { ROOMS, NPCS, T } from '../data/rooms/index.js'
import { getDialogNode } from '../data/dialog/index.js'
import { getQuestProgress } from '../data/act1Progression.js'
import TouchControls from './TouchControls.jsx'
import PlayerSprite from './sprites/PlayerSprite.jsx'
import NPCSprite from './sprites/NPCSprite.jsx'
import MinimapPanel from './MinimapPanel.jsx'

// ── Solid (impassable) tile set ────────────────────────────────────────────────
const SOLID = new Set([T.WALL, T.TREE, T.WATER, T.PILLAR, T.CLIFF])

// ── Tile visual config ─────────────────────────────────────────────────────────
const TILE_STYLE = {
  [T.FLOOR]: { background: '#14141e' },
  [T.WALL]:  { background: '#080812', boxShadow: 'inset 2px 2px 0 #18182a, inset -1px -1px 0 #040408' },
  [T.DOOR]:  { background: 'linear-gradient(180deg, #3a2a10 0%, #221808 100%)', boxShadow: 'inset 0 0 6px #f59e0b22, inset 0 1px 0 #5a3e18' },
  [T.GRASS]: {
    background: '#1a2e18',
    backgroundImage: [
      'radial-gradient(circle at 20% 25%, #223a18 0%, transparent 55%)',
      'radial-gradient(circle at 80% 75%, #162812 0%, transparent 55%)',
      'radial-gradient(circle at 55% 10%, #1e3416 0%, transparent 40%)',
    ].join(','),
  },
  [T.TREE]:   { background: '#0a160a', boxShadow: 'inset 2px 2px 0 #182414, inset -1px -1px 0 #060c04' },
  [T.WATER]:  { background: '#081830', backgroundImage: 'repeating-linear-gradient(100deg, transparent 0px, transparent 5px, #0c1e4228 5px, #0c1e4228 6px)', boxShadow: 'inset 0 2px 0 #1a3a5844, inset 0 -1px 0 #050e1e', animation: 'tileWater 4s ease-in-out infinite' },
  [T.STONE]:  { background: '#1c1c2a', backgroundImage: ['linear-gradient(90deg,  #14141e 0px, #14141e 1px, transparent 1px)', 'linear-gradient(180deg, #14141e 0px, #14141e 1px, transparent 1px)'].join(','), backgroundSize: '6px 6px', boxShadow: 'inset 1px 1px 0 #28283c, inset -1px -1px 0 #0e0e18' },
  [T.WOOD]:   { background: '#2a1808', backgroundImage: 'repeating-linear-gradient(180deg, #2e1c0a 0px, #2e1c0a 5px, #221206 5px, #221206 10px)', boxShadow: 'inset 1px 0 0 #ffffff08' },
  [T.PILLAR]: { background: '#0e0e1c', boxShadow: 'inset 3px 0 0 #1e1e30, inset -2px 0 0 #06060e, inset 0 3px 0 #1a1a28' },
  [T.CARPET]: { background: '#38100e', backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #4a1a18 0%, #2c0c0a 100%)', boxShadow: 'inset 0 0 0 1px #5a1e1c22' },
  [T.SHRINE]: { background: '#160828', backgroundImage: 'radial-gradient(circle at 50% 50%, #200c3c 35%, #0e041c 100%)', boxShadow: 'inset 0 0 0 1px #6030a033', animation: 'tileShrine 5s ease-in-out infinite' },
  [T.CLIFF]:  { background: '#08080e', backgroundImage: 'linear-gradient(150deg, #10101a 0%, #060608 50%, #0c0c14 100%)', boxShadow: 'inset 0 0 0 1px #14141e' },
}

// ── Stat pip display helper ───────────────────────────────────────────────────
const STAT_DEFS = [
  { key: 'correctness', color: '#e8645a', label: 'C', max: 3 },
  { key: 'efficiency',  color: '#f59e0b', label: 'E', max: 3 },
  { key: 'harmony',     color: '#22c55e', label: 'H', max: 3 },
]

function StatPips({ flags }) {
  return (
    <div className="flex items-center gap-2">
      {STAT_DEFS.map(({ key, color, label, max }) => {
        const val = Math.min(flags[key] || 0, max)
        return (
          <div key={key} className="flex items-center gap-0.5">
            <span className="pixel-font" style={{ fontSize: '0.3rem', color, marginRight: 2 }}>{label}</span>
            {Array.from({ length: max }, (_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 1,
                  background: i < val ? color : 'transparent',
                  border: `1px solid ${color}`,
                  opacity: i < val ? 1 : 0.35,
                }}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

// ── Quest Journal panel ───────────────────────────────────────────────────────
function QuestJournal({ flags, onClose }) {
  const quests = getQuestProgress(flags)
  const done   = quests.filter(q => q.completed).length

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="absolute inset-x-0 bottom-0 z-40"
      style={{ maxHeight: '70%' }}
    >
      <div
        className="pixel-dialog mx-0 overflow-y-auto"
        style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none', maxHeight: '100%' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="pixel-font text-[0.5rem] text-[#d97706]">📜 QUEST LOG</span>
          <span className="pixel-font text-[0.38rem] text-[#6b6b7a]">{done}/{quests.length} done</span>
        </div>
        <div className="flex flex-col gap-2">
          {quests.map(q => (
            <div
              key={q.id}
              className="flex items-start gap-2 py-1"
              style={{ borderBottom: '1px solid #1a1a2a' }}
            >
              <span style={{ fontSize: '0.7rem', marginTop: 1 }}>
                {q.completed ? '✓' : '○'}
              </span>
              <div className="flex flex-col gap-0.5">
                <span
                  className="pixel-font text-[0.42rem]"
                  style={{ color: q.completed ? '#22c55e' : '#f0e6d3' }}
                >
                  {q.name}
                </span>
                <span className="text-xs text-[#6b6b7a]">{q.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={onClose}
            className="pixel-btn pixel-btn-secondary"
            style={{ fontSize: '0.42rem', minHeight: 36 }}
          >
            [ J ] CLOSE
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Stat toast ────────────────────────────────────────────────────────────────
function StatToast({ effects, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800)
    return () => clearTimeout(t)
  }, [onDone])

  const entries = Object.entries(effects || {})
    .filter(([k]) => ['correctness', 'efficiency', 'harmony'].includes(k))
    .filter(([, v]) => v > 0)

  if (!entries.length) { onDone(); return null }

  const colors = { correctness: '#e8645a', efficiency: '#f59e0b', harmony: '#22c55e' }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -10, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="absolute top-14 inset-x-0 flex justify-center z-50 pointer-events-none"
    >
      <div
        className="pixel-font flex flex-col items-center gap-1 px-4 py-2"
        style={{
          background: 'rgba(10,10,20,0.92)',
          border: '1px solid #2a2a4a',
          fontSize: '0.42rem',
        }}
      >
        <span style={{ color: '#f59e0b' }}>★ STAT GAIN ★</span>
        {entries.map(([k, v]) => (
          <span key={k} style={{ color: colors[k] || '#f0e6d3' }}>
            {k.toUpperCase()} +{v}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// ── Overworld ──────────────────────────────────────────────────────────────────
export default function Overworld() {
  const navigate = useNavigate()
  const { state, saveRPGPosition, applyRPGEffects, setReturnToRPG, completeEncounter, clearLastEffects } = useGame()
  const audio = useAudio()

  // ── Initial state from persisted store ───────────────────────────────────
  const [room, setRoom]     = useState(() => ROOMS[state.rpgRoom] || ROOMS.r1)
  const [pos, setPosRaw]    = useState(() => ({ x: state.rpgX, y: state.rpgY }))
  const [facing, setFacing] = useState('down')
  const [roomTitle, setRoomTitle] = useState(null)

  // ── Walk animation state ──────────────────────────────────────────────
  const [walkFrame, setWalkFrame] = useState(0)
  const [isMoving, setIsMoving]   = useState(false)
  const walkTimerRef = useRef(null)

  // ── Room fade ─────────────────────────────────────────────────────────
  const [fading, setFading]             = useState(false)
  const pendingDoorRef = useRef(null)

  // ── Panel state ───────────────────────────────────────────────────────
  const [journalOpen, setJournalOpen] = useState(false)
  const [mapOpen, setMapOpen]         = useState(false)

  // ── Stat toast ────────────────────────────────────────────────────────
  const [toastEffects, setToastEffects] = useState(null)

  // ── Dialogue state ─────────────────────────────────────────────────────────
  const [dialogState, setDialogState] = useState(null)
  const [typedText, setTypedText]     = useState('')
  const [typingDone, setTypingDone]   = useState(false)
  const typingTimer = useRef(null)

  // ── Handle encounter return (show stat toast + clear) ────────────────
  useEffect(() => {
    if (state.returnToRPG) {
      const { room: roomId, x, y, encounterId } = state.returnToRPG
      const nextRoom = ROOMS[roomId] || ROOMS.r1
      setRoom(nextRoom)
      setPosRaw({ x, y })
      completeEncounter(encounterId)
    }
    // Show toast for lastEffects after returning from battle
    if (state.lastEffects) {
      setToastEffects(state.lastEffects)
      clearLastEffects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Lock body scroll while in RPG mode ────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    return () => {
      document.body.style.overflow = prev
      document.body.style.overscrollBehavior = ''
    }
  }, [])

  // ── Walk timer cleanup ────────────────────────────────────────────────────
  useEffect(() => () => clearTimeout(walkTimerRef.current), [])

  // ── Start BGM when room changes ───────────────────────────────────────────
  useEffect(() => {
    audio?.setRoomBGM(room.id)
  }, [room.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Show stat toast SFX ───────────────────────────────────────────────────
  useEffect(() => {
    if (toastEffects) audio?.sfx('statUp')
  }, [toastEffects]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stable refs ────────────────────────────────────────────────────────────
  const posRef        = useRef(pos);        posRef.current        = pos
  const roomRef       = useRef(room);       roomRef.current       = room
  const dialogRef     = useRef(dialogState);dialogRef.current     = dialogState
  const typingDoneRef = useRef(typingDone); typingDoneRef.current = typingDone
  const flagsRef      = useRef(state.rpgFlags); flagsRef.current  = state.rpgFlags
  const journalRef    = useRef(journalOpen); journalRef.current   = journalOpen
  const mapRef        = useRef(mapOpen);     mapRef.current       = mapOpen

  // ── Typewriter ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!dialogState) return
    setTypedText('')
    setTypingDone(false)
    clearInterval(typingTimer.current)
    const text = dialogState.text
    let i = 0
    typingTimer.current = setInterval(() => {
      i++
      setTypedText(text.slice(0, i))
      if (i >= text.length) { clearInterval(typingTimer.current); setTypingDone(true) }
    }, 22)
    return () => clearInterval(typingTimer.current)
  }, [dialogState?.nodeId, dialogState?.text]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Position setter ───────────────────────────────────────────────────────
  function setPos(newPos) {
    setPosRaw(newPos)
    saveRPGPosition(roomRef.current.id, newPos.x, newPos.y)
  }

  // ── Load dialogue node ────────────────────────────────────────────────────
  function loadNode(nodeId, npcId) {
    const resolved = getDialogNode(nodeId, flagsRef.current)
    if (!resolved) { closeDialog(); return }

    if (resolved.effects?.startBattle) {
      handleStartBattle(resolved.effects.startBattle)
      return
    }

    setDialogState({
      npcId: npcId ?? dialogRef.current?.npcId,
      nodeId,
      speaker:  resolved.speaker,
      text:     resolved.text,
      choices:  resolved.choices  || null,
      next:     resolved.next     ?? null,
      effects:  resolved.effects  || null,
    })
  }

  function startDialog(npc) {
    audio?.sfx('dialogOpen')
    const dialogId = npc.dialogId || NPCS[npc.id]?.dialogId
    loadNode(dialogId, npc.id)
  }

  function startInteractable(it) {
    loadNode(it.dialogId, '__interactable__')
  }

  function closeDialog() {
    clearInterval(typingTimer.current)
    setDialogState(null)
    setTypedText('')
    setTypingDone(false)
  }

  // ── Advance dialog ────────────────────────────────────────────────────────
  function advanceDialog() {
    if (!dialogRef.current) return
    const done = typingDoneRef.current

    if (!done) {
      clearInterval(typingTimer.current)
      setTypedText(dialogRef.current.text)
      setTypingDone(true)
      return
    }

    const { choices, next, effects } = dialogRef.current
    if (choices) return

    if (effects && !effects.startBattle) applyRPGEffects(effects)

    if (next) {
      loadNode(next, dialogRef.current.npcId)
    } else {
      closeDialog()
    }
  }

  // ── Choice selection ──────────────────────────────────────────────────────
  function selectChoice(choice) {
    if (choice.effects?.startBattle) {
      const { startBattle, ...rest } = choice.effects
      if (Object.keys(rest).length > 0) applyRPGEffects(rest)
      handleStartBattle(startBattle)
      return
    }
    if (choice.effects) applyRPGEffects(choice.effects)
    if (choice.next) {
      loadNode(choice.next, dialogRef.current?.npcId)
    } else {
      closeDialog()
    }
  }

  // ── Start battle ──────────────────────────────────────────────────────────
  function handleStartBattle({ levelId, battleId, encounterId }) {
    closeDialog()
    audio?.sfx('battleStart')
    const { x, y } = posRef.current
    setReturnToRPG({ room: roomRef.current.id, x, y, encounterId })
    navigate(battleId ? `/battle/${battleId}` : `/level/${levelId}`)
  }

  // ── Flash room name ───────────────────────────────────────────────────────
  function flashRoomTitle(name) {
    setRoomTitle(name)
    setTimeout(() => setRoomTitle(null), 2000)
  }

  // ── Movement ──────────────────────────────────────────────────────────────
  const tryMove = useCallback((dx, dy) => {
    if (dialogRef.current) return

    const { x, y } = posRef.current
    const r = roomRef.current
    const nx = x + dx
    const ny = y + dy

    if (nx < 0 || nx >= r.cols || ny < 0 || ny >= r.rows) return

    const tile = r.tiles[ny * r.cols + nx]

    if (SOLID.has(tile)) {
      setFacing(dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up')
      return
    }

    if (tile === T.DOOR) {
      const door = r.doors.find(d => d.x === nx && d.y === ny)
      if (door) handleDoor(door)
      return
    }

    setFacing(dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up')
    setPos({ x: nx, y: ny })
    audio?.sfx('step')

    setWalkFrame(f => 1 - f)
    setIsMoving(true)
    clearTimeout(walkTimerRef.current)
    walkTimerRef.current = setTimeout(() => {
      setIsMoving(false)
      setWalkFrame(0)
    }, 120)

    const trigger = r.triggers.find(t => t.x === nx && t.y === ny)
    if (trigger?.type === 'ending')      navigate('/ending')
    if (trigger?.type === 'act1cutscene') navigate('/act1cutscene')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Door transition (with fade) ───────────────────────────────────────────
  function handleDoor(door) {
    if (door.condition && !door.condition(flagsRef.current)) {
      setDialogState({
        npcId: '__door__',
        nodeId: '__door__locked__',
        speaker: 'SEALED DOOR',
        text: door.lockedText || '* This passage is sealed.',
        choices: null,
        next: null,
        effects: null,
      })
      return
    }

    const nextRoom = ROOMS[door.toRoom]
    if (!nextRoom) return

    // Kick off fade → swap room → unfade
    audio?.sfx('door')
    pendingDoorRef.current = { door, nextRoom }
    setFading(true)
    setTimeout(() => {
      const { door: d, nextRoom: nr } = pendingDoorRef.current
      setRoom(nr)
      const newPos = { x: d.toX, y: d.toY }
      setPosRaw(newPos)
      saveRPGPosition(nr.id, newPos.x, newPos.y)
      roomRef.current = nr
      flashRoomTitle(nr.name)
      setFading(false)
    }, 220)
  }

  // ── Interaction ───────────────────────────────────────────────────────────
  const tryInteract = useCallback(() => {
    if (dialogRef.current) { advanceDialog(); return }

    const { x, y } = posRef.current
    const r = roomRef.current
    const adjacent = [
      { x, y: y - 1 }, { x, y: y + 1 },
      { x: x - 1, y }, { x: x + 1, y },
      { x, y },
    ]

    const npc = r.npcs.find(n => adjacent.some(a => a.x === n.x && a.y === n.y))
    if (npc) { startDialog(npc); return }

    const it = (r.interactables || []).find(it => adjacent.some(a => a.x === it.x && a.y === it.y))
    if (it) { startInteractable(it) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const DIRS = {
      ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0],
      w: [0,-1], s: [0,1], a: [-1,0], d: [1,0],
      W: [0,-1], S: [0,1], A: [-1,0], D: [1,0],
    }
    function handleKey(e) {
      const dir = DIRS[e.key]
      if (dir) { e.preventDefault(); tryMove(dir[0], dir[1]) }
      else if (['e','E','Enter',' '].includes(e.key)) { e.preventDefault(); tryInteract() }
      else if (['j','J'].includes(e.key)) { e.preventDefault(); setJournalOpen(v => !v); setMapOpen(false) }
      else if (['m','M'].includes(e.key)) { e.preventDefault(); setMapOpen(v => !v); setJournalOpen(false) }
      else if (e.key === 'Escape') { setJournalOpen(false); setMapOpen(false) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [tryMove, tryInteract])

  // ── Dialog phase ──────────────────────────────────────────────────────────
  const dialogPhase = !dialogState ? null
    : !typingDone ? 'typing'
    : dialogState.choices ? 'choices'
    : dialogState.next !== null ? 'waiting'
    : 'done'

  // ── Adjacency helpers ─────────────────────────────────────────────────────
  function isAdjacent(tx, ty) {
    const { x, y } = pos
    return (
      (tx === x && Math.abs(ty - y) === 1) ||
      (ty === y && Math.abs(tx - x) === 1) ||
      (tx === x && ty === y)
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col bg-[#0a0a0f]"
      style={{ height: '100dvh', overflow: 'hidden', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-3 border-b border-[#1a1a2a] shrink-0 gap-2"
        style={{ height: 44, paddingTop: 'env(safe-area-inset-top)' }}
      >
        <button
          onClick={() => { closeDialog(); navigate('/') }}
          className="pixel-font text-[0.4rem] text-[#6b6b7a] hover:text-[#f0e6d3] transition-colors shrink-0"
        >
          ← HOME
        </button>

        {/* Live stat pips — center */}
        <StatPips flags={state.rpgFlags} />

        {/* Right side: room name + panel toggles */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="pixel-font text-[0.38rem] text-[#d97706] hidden sm:block">{room.name}</span>
          <button
            onClick={() => { setJournalOpen(v => !v); setMapOpen(false) }}
            className="pixel-font text-[0.35rem] text-[#6b6b7a] hover:text-[#f0e6d3] transition-colors"
            title="Quest Journal (J)"
          >
            📜
          </button>
          <button
            onClick={() => { setMapOpen(v => !v); setJournalOpen(false) }}
            className="pixel-font text-[0.35rem] text-[#6b6b7a] hover:text-[#f0e6d3] transition-colors"
            title="Map (M)"
          >
            🗺
          </button>
        </div>
      </div>

      {/* ── Room title flash ── */}
      <AnimatePresence>
        {roomTitle && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-12 inset-x-0 flex justify-center z-30 pointer-events-none"
          >
            <span
              className="pixel-font px-3 py-1"
              style={{ fontSize: 'clamp(0.4rem, 2vw, 0.55rem)', color: '#d97706', background: 'rgba(10,10,20,0.85)', border: '1px solid #5a3e1a' }}
            >
              — {roomTitle} —
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stat toast ── */}
      <AnimatePresence>
        {toastEffects && (
          <StatToast
            key="stat-toast"
            effects={toastEffects}
            onDone={() => setToastEffects(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Game area ── */}
      <div className="flex-1 relative overflow-hidden flex items-start justify-center pt-2">

        {/* Tile grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${room.cols}, 1fr)`,
            width: '100%',
            maxWidth: `min(100vw, calc(100dvh - 200px) * ${room.cols / room.rows})`,
            position: 'relative',
          }}
        >
          {room.tiles.map((tile, i) => {
            const tx = i % room.cols
            const ty = Math.floor(i / room.cols)
            const npc           = room.npcs.find(n => n.x === tx && n.y === ty)
            const interactable  = (room.interactables || []).find(it => it.x === tx && it.y === ty)
            const isTrigger     = room.triggers.some(t => t.x === tx && t.y === ty)
            const adjacentNPC   = !dialogState && !!npc && isAdjacent(tx, ty)
            const adjacentItem  = !dialogState && !!interactable && isAdjacent(tx, ty)
            const showHint      = adjacentNPC || adjacentItem

            return (
              <div
                key={i}
                style={{
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  fontSize: 'min(4vw, 18px)',
                  border: 'none',
                  ...TILE_STYLE[tile],
                }}
              >
                {npc && <NPCSprite npcId={npc.id} isAdjacent={adjacentNPC} />}

                {!npc && interactable && (
                  <span style={{ fontSize: 'min(3.5vw, 14px)', lineHeight: 1, filter: adjacentItem ? 'brightness(1.4)' : 'none', transition: 'filter 0.2s' }}>
                    {interactable.emoji}
                  </span>
                )}

                {!npc && !interactable && isTrigger && (
                  <span className="animate-pulse-glow" style={{ color: '#f59e0b', fontSize: 'min(3.5vw, 14px)', lineHeight: 1 }}>✦</span>
                )}

                {tile === T.DOOR && !npc && (
                  <span style={{ color: '#f59e0b', fontSize: 'min(3vw, 12px)', opacity: 0.7, lineHeight: 1 }}>
                    {ty === 0 ? '▲' : ty === room.rows - 1 ? '▼' : tx === 0 ? '◀' : '▶'}
                  </span>
                )}

                {showHint && (
                  <span
                    className="animate-blink"
                    style={{
                      position: 'absolute', top: '-40%', left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: 'min(2.5vw, 9px)', color: '#d97706',
                      fontFamily: "'Press Start 2P', cursive",
                      pointerEvents: 'none', zIndex: 10, whiteSpace: 'nowrap',
                    }}
                  >
                    A
                  </span>
                )}
              </div>
            )
          })}

          {/* Player sprite overlay */}
          <PlayerSprite pos={pos} facing={facing} walkFrame={walkFrame} isMoving={isMoving} room={room} />
        </div>

        {/* ── Room fade overlay ── */}
        <AnimatePresence>
          {fading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0 bg-black z-50 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* ── Dialogue overlay ── */}
        <AnimatePresence>
          {dialogState && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute inset-x-0 bottom-0 z-20"
            >
              <div
                className="pixel-dialog mx-0"
                style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}
                onClick={dialogPhase !== 'choices' ? advanceDialog : undefined}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="pixel-font text-[#d97706]" style={{ fontSize: '0.5rem' }}>★ {dialogState.speaker}</span>
                  {NPCS[dialogState.npcId] && (
                    <span style={{ fontSize: 12 }}>{NPCS[dialogState.npcId].emoji}</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ minHeight: '2.5em' }}>
                  {typedText}
                  {!typingDone && <span className="animate-blink text-[#d97706] ml-0.5">█</span>}
                </p>
                {typingDone && dialogPhase !== 'choices' && (
                  <div className="flex justify-end mt-1">
                    <span className="animate-blink text-[#d97706]" style={{ fontSize: '0.75rem' }}>
                      {dialogPhase === 'done' ? '[ A ] CLOSE' : '▼'}
                    </span>
                  </div>
                )}
              </div>

              {typingDone && dialogPhase === 'choices' && (
                <div className="flex flex-col gap-2 p-3 bg-[#0d0d18] border-t border-[#2a2a3a]">
                  {dialogState.choices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => selectChoice(choice)}
                      className="pixel-btn pixel-btn-secondary text-left w-full"
                      style={{ fontSize: '0.5rem', minHeight: 44, justifyContent: 'flex-start' }}
                    >
                      ▶ {choice.label}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Quest Journal panel ── */}
        <AnimatePresence>
          {journalOpen && (
            <QuestJournal flags={state.rpgFlags} onClose={() => setJournalOpen(false)} />
          )}
        </AnimatePresence>

        {/* ── Minimap panel ── */}
        <AnimatePresence>
          {mapOpen && (
            <MinimapPanel
              currentRoom={room.id}
              visitedRooms={[state.rpgRoom]}
              onClose={() => setMapOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Touch controls ── */}
      <TouchControls onMove={tryMove} onAction={tryInteract} />
    </div>
  )
}
