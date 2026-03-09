import { motion } from 'framer-motion'

// ── Room graph layout (pixel coords in a 220×160 SVG canvas) ─────────────────
// Nodes: id, x, y, label
// Edges: from → to (bidirectional)

const NODES = [
  { id: 'r1',  x: 110, y: 10,  label: 'Heap\nMeadow'     },
  { id: 'r2',  x: 110, y: 50,  label: 'Proof\nCamp'       },
  { id: 'r3',  x: 110, y: 90,  label: 'Stack\nGate'       },
  { id: 'r4',  x: 175, y: 90,  label: 'Bazaar'            },
  { id: 'r5',  x: 110, y: 130, label: 'Sorting\nYard'     },
  { id: 'r6',  x: 175, y: 130, label: 'GCD\nShrine'       },
  { id: 'r7',  x: 175, y: 155, label: 'Loop\nLake'        },
  { id: 'r8',  x: 175, y: 110, label: 'Queue\nChapel'     },
  { id: 'r9',  x: 45,  y: 130, label: 'Shortcut\nOverlook'},
  { id: 'r10', x: 175, y: 10,  label: 'Aid\nStation'      },
]

const EDGES = [
  ['r1',  'r2'],
  ['r2',  'r3'],
  ['r3',  'r4'],
  ['r3',  'r5'],
  ['r4',  'r6'],
  ['r5',  'r9'],
  ['r6',  'r7'],
  ['r7',  'r8'],
  ['r7',  'r10'],
]

const NODE_COLORS = {
  current:  '#d97706',
  visited:  '#4a3a1e',
  unvisited:'#1a1a2a',
}

export default function MinimapPanel({ currentRoom, visitedRooms = [], onClose }) {
  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]))

  function nodeColor(id) {
    if (id === currentRoom) return NODE_COLORS.current
    if (visitedRooms.includes(id)) return NODE_COLORS.visited
    return NODE_COLORS.unvisited
  }

  function nodeStroke(id) {
    if (id === currentRoom) return '#f59e0b'
    if (visitedRooms.includes(id)) return '#5a3e1e'
    return '#2a2a3a'
  }

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="absolute inset-y-0 right-0 z-40 flex flex-col"
      style={{ width: 'min(260px, 80vw)' }}
    >
      <div
        className="h-full overflow-y-auto"
        style={{ background: 'rgba(10,10,20,0.96)', borderLeft: '2px solid #2a2a3a' }}
      >
        <div className="p-3 border-b border-[#1a1a2a] flex items-center justify-between">
          <span className="pixel-font text-[0.45rem] text-[#d97706]">🗺 MAP</span>
          <button
            onClick={onClose}
            className="pixel-font text-[0.38rem] text-[#6b6b7a] hover:text-[#f0e6d3]"
          >
            [ M ] CLOSE
          </button>
        </div>

        <div className="p-3">
          {/* SVG schematic */}
          <svg
            viewBox="0 0 220 170"
            style={{ width: '100%', imageRendering: 'pixelated', fontFamily: "'Press Start 2P', cursive" }}
          >
            {/* Edges */}
            {EDGES.map(([a, b], i) => {
              const na = nodeMap[a], nb = nodeMap[b]
              if (!na || !nb) return null
              return (
                <line
                  key={i}
                  x1={na.x} y1={na.y}
                  x2={nb.x} y2={nb.y}
                  stroke="#2a2a3a"
                  strokeWidth={1.5}
                  strokeDasharray={visitedRooms.includes(a) && visitedRooms.includes(b) ? 'none' : '3 2'}
                />
              )
            })}

            {/* Nodes */}
            {NODES.map(({ id, x, y, label }) => {
              const isCurrent = id === currentRoom
              const lines = label.split('\n')
              return (
                <g key={id}>
                  <rect
                    x={x - 16} y={y - 8}
                    width={32} height={16}
                    rx={2}
                    fill={nodeColor(id)}
                    stroke={nodeStroke(id)}
                    strokeWidth={isCurrent ? 2 : 1}
                  />
                  {lines.map((ln, li) => (
                    <text
                      key={li}
                      x={x} y={y + (lines.length === 1 ? 3 : li === 0 ? -1 : 5)}
                      textAnchor="middle"
                      fontSize={3.5}
                      fill={isCurrent ? '#f59e0b' : '#6b6b7a'}
                    >
                      {ln}
                    </text>
                  ))}
                  {isCurrent && (
                    <circle cx={x} cy={y - 11} r={2} fill="#f59e0b" />
                  )}
                </g>
              )
            })}
          </svg>

          {/* Legend */}
          <div className="flex flex-col gap-1 mt-3">
            {[
              { color: '#d97706', label: 'Current room' },
              { color: '#4a3a1e', label: 'Visited' },
              { color: '#1a1a2a', label: 'Undiscovered' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div style={{ width: 10, height: 10, background: color, border: '1px solid #3a3a4a' }} />
                <span className="pixel-font text-[0.32rem] text-[#6b6b7a]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
