import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Constants ────────────────────────────────────────────────────────────────
const SPECTATOR_VIEWS = {
  SPLIT: 'split',
  PLAYER1: 'p1',
  PLAYER2: 'p2',
}

const MOCK_SPECTATORS = [
  { id: 1, name: 'WatcherX', avatar: '👁', avatarColor: '#1E1A3A' },
  { id: 2, name: 'ChessFan99', avatar: '♟', avatarColor: '#1A3A1A' },
  { id: 3, name: 'QueenObserver', avatar: '👑', avatarColor: '#3A1A1A' },
  { id: 4, name: 'NightOwl', avatar: '🦉', avatarColor: '#1A2A3A' },
  { id: 5, name: 'RookWatcher', avatar: '🏰', avatarColor: '#2A1A3A' },
]

const MOCK_COMMENTARY = [
  { id: 1, author: 'System', text: 'ShadowKnight places Q at row 3, col 1 — solid opening fork!', time: '0:12', type: 'system' },
  { id: 2, author: 'ChessFan99', text: 'Wow that diagonal is brutal 🔥', time: '0:15', type: 'user' },
  { id: 3, author: 'System', text: 'SilverArrow counters at row 2, col 5 — pressure on the right flank.', time: '0:28', type: 'system' },
  { id: 4, author: 'WatcherX', text: 'Silver is going aggressive early', time: '0:31', type: 'user' },
  { id: 5, author: 'System', text: 'ShadowKnight blocks diagonal threat — defensive masterstroke.', time: '0:55', type: 'system' },
  { id: 6, author: 'NightOwl', text: 'This is SO tense. Both boards look mirror-ish', time: '1:02', type: 'user' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateNQueensSolution(n) {
  const board = Array(n).fill(-1)
  const cols = Array(n).fill(false)
  const diag1 = Array(2 * n - 1).fill(false)
  const diag2 = Array(2 * n - 1).fill(false)
  const solve = (row) => {
    if (row === n) return true
    for (let col = 0; col < n; col++) {
      const d1 = row - col + n - 1
      const d2 = row + col
      if (!cols[col] && !diag1[d1] && !diag2[d2]) {
        board[row] = col
        cols[col] = true; diag1[d1] = true; diag2[d2] = true
        if (solve(row + 1)) return true
        board[row] = -1
        cols[col] = false; diag1[d1] = false; diag2[d2] = false
      }
    }
    return false
  }
  solve(0)
  return board
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SpectatorBoard({ size = 8, solution = [], revealedRows = 0, label = '', playerColor = '#F5B800' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Board label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 12px', borderRadius: '8px',
          background: `${playerColor}18`,
          border: `1px solid ${playerColor}40`,
          width: 'fit-content',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: playerColor,
          }}
        />
        <span style={{
          fontFamily: "'Cinzel', serif", fontSize: '12px',
          fontWeight: 700, color: playerColor, letterSpacing: '0.06em',
        }}>
          {label}
        </span>
      </motion.div>

      {/* Board grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #1E1010, #160A0A)',
          border: `1px solid ${playerColor}30`,
          borderRadius: '10px', padding: '6px',
          boxShadow: `0 0 24px ${playerColor}15`,
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gap: '1px',
          background: '#0A0605',
          borderRadius: '6px',
          padding: '2px',
        }}>
          {Array(size).fill(0).map((_, row) =>
            Array(size).fill(0).map((_, col) => {
              const isLight = (row + col) % 2 === 0
              const hasQueen = solution[row] === col
              const isRevealed = row < revealedRows

              return (
                <motion.div
                  key={`${row}-${col}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isRevealed ? 1 : 0.35 }}
                  transition={{ delay: row * 0.04, duration: 0.3 }}
                  style={{
                    aspectRatio: '1',
                    background: isLight ? '#3A2A1A' : '#2A1A0A',
                    borderRadius: hasQueen && isRevealed ? '3px' : '0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: size > 10 ? '12px' : '16px',
                    position: 'relative',
                    overflow: 'hidden',
                    filter: isRevealed ? 'none' : 'blur(0.5px)',
                  }}
                >
                  {hasQueen && isRevealed && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      style={{ color: playerColor, lineHeight: 1 }}
                    >
                      ♛
                    </motion.div>
                  )}
                  {hasQueen && !isRevealed && (
                    <div style={{
                      width: '60%', height: '60%', borderRadius: '50%',
                      background: `${playerColor}20`,
                    }} />
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    border: '1px solid rgba(245,184,0,0.04)',
                    pointerEvents: 'none',
                  }} />
                </motion.div>
              )
            })
          )}
        </div>
      </motion.div>
    </div>
  )
}

function SpectatorList({ spectators = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        background: 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: '1px solid rgba(245,184,0,0.15)',
        borderRadius: '10px', padding: '14px',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '10px',
      }}>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: '12px',
          fontWeight: 700, color: '#FAF7F0',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          👁 Spectators
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            padding: '3px 8px', borderRadius: '20px',
            background: 'rgba(74,222,128,0.15)',
            border: '1px solid rgba(74,222,128,0.3)',
            fontSize: '11px', color: '#4ADE80', fontWeight: 700,
          }}
        >
          {spectators.length} LIVE
        </motion.div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {spectators.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.05 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '7px 9px', borderRadius: '7px',
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(245,184,0,0.08)',
            }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: s.avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px',
            }}>
              {s.avatar}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'rgba(232,213,176,0.8)' }}>
              {s.name}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function LiveCommentary({ messages = [] }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      style={{
        background: 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: '1px solid rgba(245,184,0,0.15)',
        borderRadius: '10px', padding: '14px',
        display: 'flex', flexDirection: 'column',
        flex: 1, minHeight: 0,
      }}
    >
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: '12px',
        fontWeight: 700, color: '#FAF7F0', marginBottom: '10px',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        flexShrink: 0,
      }}>
        📡 Live Commentary
      </div>

      <div style={{
        flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column',
        gap: '7px', minHeight: '160px', maxHeight: '260px',
      }}>
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              padding: '8px 10px', borderRadius: '7px',
              background: msg.type === 'system'
                ? 'rgba(245,184,0,0.07)'
                : 'rgba(255,255,255,0.03)',
              border: msg.type === 'system'
                ? '1px solid rgba(245,184,0,0.18)'
                : '1px solid rgba(245,184,0,0.08)',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              marginBottom: '3px',
            }}>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                color: msg.type === 'system' ? '#F5B800' : '#C084FC',
              }}>
                {msg.type === 'system' ? '⚡ Commentary' : msg.author}
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(184,150,122,0.45)' }}>
                {msg.time}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(232,213,176,0.75)', lineHeight: 1.4 }}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Chat input */}
      <div style={{
        display: 'flex', gap: '7px', marginTop: '10px', flexShrink: 0,
      }}>
        <input
          type="text"
          placeholder="Spectate & comment..."
          style={{
            flex: 1, padding: '8px 10px', borderRadius: '7px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(245,184,0,0.15)',
            color: '#FAF7F0', fontSize: '12px',
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '8px 12px', borderRadius: '7px',
            background: 'linear-gradient(135deg, #F5B800, #FFD700)',
            border: 'none', color: '#000', fontWeight: 700,
            fontSize: '12px', cursor: 'pointer',
          }}
        >
          ➤
        </motion.button>
      </div>
    </motion.div>
  )
}

function ViewToggle({ current, onChange }) {
  const views = [
    { id: SPECTATOR_VIEWS.SPLIT,   label: '⊞ Both' },
    { id: SPECTATOR_VIEWS.PLAYER1, label: '⚔ P1' },
    { id: SPECTATOR_VIEWS.PLAYER2, label: '🏹 P2' },
  ]
  return (
    <div style={{
      display: 'flex', gap: '6px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(245,184,0,0.15)',
      padding: '4px', borderRadius: '9px',
    }}>
      {views.map(v => (
        <motion.button
          key={v.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(v.id)}
          style={{
            padding: '6px 14px', borderRadius: '7px',
            background: current === v.id
              ? 'linear-gradient(135deg, rgba(245,184,0,0.25), rgba(245,184,0,0.12))'
              : 'transparent',
            border: current === v.id ? '1px solid rgba(245,184,0,0.4)' : '1px solid transparent',
            color: current === v.id ? '#F5B800' : 'rgba(232,213,176,0.55)',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {v.label}
        </motion.button>
      ))}
    </div>
  )
}

// ─── Main SpectatorMode Component ─────────────────────────────────────────────
export default function SpectatorMode({
  players = [],
  boardSize = 8,
  matchLabel = 'Semifinals — Match 13',
  onLeave = null,
}) {
  const [view, setView] = useState(SPECTATOR_VIEWS.SPLIT)
  const [revealedRows, setRevealedRows] = useState(3)
  const [timeElapsed, setTimeElapsed] = useState(72)   // seconds
  const [spectators] = useState(MOCK_SPECTATORS)
  const [commentary, setCommentary] = useState(MOCK_COMMENTARY)
  const [solutions] = useState([
    generateNQueensSolution(boardSize),
    generateNQueensSolution(boardSize),
  ])

  const p1 = players[0] || { name: 'ShadowKnight', avatar: '⚔', avatarColor: '#3A1E1E', level: 22, rating: 2380 }
  const p2 = players[1] || { name: 'SilverArrow',  avatar: '🏹', avatarColor: '#1E2A3A', level: 25, rating: 2500 }

  // Tick the elapsed timer
  useEffect(() => {
    const t = setInterval(() => setTimeElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Drip-reveal rows as the "game progresses" for the spectator view
  useEffect(() => {
    if (revealedRows >= boardSize) return
    const t = setInterval(() => setRevealedRows(r => Math.min(r + 1, boardSize)), 8000)
    return () => clearInterval(t)
  }, [revealedRows, boardSize])

  // Occasionally append a new commentary line
  useEffect(() => {
    const liveLines = [
      { author: 'System', text: 'SilverArrow adds Q at row 4 — diagonal tension building!', type: 'system' },
      { author: 'ChessFan99', text: 'Silver is playing so fast omg', type: 'user' },
      { author: 'System', text: 'ShadowKnight responds instantly — experienced read.', type: 'system' },
      { author: 'RookWatcher', text: 'Both boards diverging now, wild!', type: 'user' },
    ]
    let idx = 0
    const t = setInterval(() => {
      if (idx >= liveLines.length) return
      const line = liveLines[idx++]
      setCommentary(prev => [
        ...prev,
        { ...line, id: Date.now(), time: `${Math.floor(timeElapsed / 60)}:${String(timeElapsed % 60).padStart(2, '0')}` }
      ])
    }, 12000)
    return () => clearInterval(t)
  }, [])

  const minutes = Math.floor(timeElapsed / 60)
  const seconds = timeElapsed % 60

  const showP1 = view === SPECTATOR_VIEWS.SPLIT || view === SPECTATOR_VIEWS.PLAYER1
  const showP2 = view === SPECTATOR_VIEWS.SPLIT || view === SPECTATOR_VIEWS.PLAYER2

  return (
    <div style={{
      minHeight: '100vh', padding: '20px',
      background: 'linear-gradient(135deg, #0A0605, #1A0F0A)',
      fontFamily: "'DM Sans', sans-serif", color: '#FAF7F0',
    }}>

      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '24px', maxWidth: '1400px', margin: '0 auto 24px',
          flexWrap: 'wrap', gap: '12px',
        }}
      >
        {/* Left: title + live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <h1 style={{
              fontFamily: "'Cinzel', serif", fontSize: '22px',
              fontWeight: 700, margin: 0, letterSpacing: '0.04em',
            }}>
              👁 Spectator Mode
            </h1>
            <p style={{
              color: 'rgba(184,150,122,0.55)', fontSize: '12px',
              margin: '3px 0 0', letterSpacing: '0.05em',
            }}>
              {matchLabel}
            </p>
          </div>

          {/* LIVE pill */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '20px',
              background: 'rgba(196,30,30,0.2)',
              border: '1px solid rgba(196,30,30,0.4)',
            }}
          >
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#FF5555',
            }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF8A8A', letterSpacing: '0.06em' }}>
              LIVE
            </span>
          </motion.div>
        </div>

        {/* Center: elapsed time */}
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1E1010, #160A0A)',
          border: '1px solid rgba(245,184,0,0.2)',
          borderRadius: '10px', padding: '8px 20px',
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '20px', fontWeight: 700, color: '#F5B800',
          }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div style={{
            fontSize: '10px', color: 'rgba(184,150,122,0.55)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Elapsed
          </div>
        </div>

        {/* Right: view toggle + leave */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ViewToggle current={view} onChange={setView} />
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLeave}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              background: 'transparent',
              border: '1px solid rgba(255,138,138,0.3)',
              color: '#FF8A8A', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ✕ Leave
          </motion.button>
        </div>
      </motion.div>

      {/* ── Main Layout ──────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 260px',
        gap: '20px',
        alignItems: 'start',
      }}>

        {/* ── Board Area ───────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Player matchup banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center', gap: '16px',
              background: 'linear-gradient(160deg, #2A1010, #1A0A0A)',
              border: '1px solid rgba(245,184,0,0.15)',
              borderRadius: '12px', padding: '14px 20px',
            }}
          >
            {/* P1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: p1.avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {p1.avatar}
              </div>
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: 700, color: '#FAF7F0' }}>
                  {p1.name}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(184,150,122,0.6)' }}>
                  🏅 {p1.rating} • Lvl {p1.level}
                </div>
              </div>
            </div>

            {/* VS */}
            <div style={{ textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ fontSize: '18px' }}
              >
                ⚔
              </motion.div>
              <div style={{ fontSize: '10px', color: 'rgba(184,150,122,0.55)', marginTop: '3px' }}>VS</div>
            </div>

            {/* P2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '14px', fontWeight: 700, color: '#FAF7F0' }}>
                  {p2.name}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(184,150,122,0.6)' }}>
                  🏅 {p2.rating} • Lvl {p2.level}
                </div>
              </div>
              <div style={{
                width: '40px', height: '40px', borderRadius: '8px',
                background: p2.avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', border: '1px solid rgba(255,255,255,0.1)',
              }}>
                {p2.avatar}
              </div>
            </div>
          </motion.div>

          {/* Boards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: showP1 && showP2 ? '1fr 1fr' : '1fr',
            gap: '20px',
          }}>
            <AnimatePresence>
              {showP1 && (
                <motion.div
                  key="board1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                >
                  <SpectatorBoard
                    size={boardSize}
                    solution={solutions[0]}
                    revealedRows={revealedRows}
                    label={p1.name}
                    playerColor="#F5B800"
                  />
                </motion.div>
              )}
              {showP2 && (
                <motion.div
                  key="board2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35 }}
                >
                  <SpectatorBoard
                    size={boardSize}
                    solution={solutions[1]}
                    revealedRows={revealedRows}
                    label={p2.name}
                    playerColor="#C084FC"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '8px',
              background: 'rgba(245,184,0,0.06)',
              border: '1px solid rgba(245,184,0,0.12)',
            }}
          >
            <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: 'rgba(245,184,0,0.12)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(revealedRows / boardSize) * 100}%` }}
                transition={{ duration: 0.6 }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #F5B800, #FFD700)' }}
              />
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(184,150,122,0.6)', whiteSpace: 'nowrap' }}>
              {revealedRows}/{boardSize} rows placed
            </span>
          </motion.div>

          {/* Commentary on larger screens */}
          <LiveCommentary messages={commentary} />
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '20px' }}
        >
          <SpectatorList spectators={spectators} />

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'linear-gradient(135deg, #1E1010, #160A0A)',
              border: '1px solid rgba(245,184,0,0.15)',
              borderRadius: '10px', padding: '14px',
            }}
          >
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: '12px',
              fontWeight: 700, color: '#FAF7F0', marginBottom: '10px',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              📊 Match Stats
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: `${p1.name} moves`, value: `${revealedRows}`, color: '#F5B800' },
                { label: `${p2.name} moves`, value: `${Math.max(0, revealedRows - 1)}`, color: '#C084FC' },
                { label: 'Board size', value: `${boardSize}×${boardSize}`, color: '#4ADE80' },
                { label: 'Queens placed', value: `${revealedRows + Math.max(0, revealedRows - 1)}`, color: '#FF8A8A' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px', borderRadius: '7px',
                    background: 'rgba(245,184,0,0.05)',
                    border: '1px solid rgba(245,184,0,0.1)',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'rgba(184,150,122,0.65)' }}>{stat.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {stat.value}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Watch another match */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: 'linear-gradient(135deg, #1E1010, #160A0A)',
              border: '1px solid rgba(245,184,0,0.12)',
              borderRadius: '10px', padding: '14px',
            }}
          >
            <div style={{
              fontSize: '12px', fontWeight: 600, color: 'rgba(184,150,122,0.6)',
              marginBottom: '8px',
            }}>
              🎮 Other Live Matches
            </div>
            {[
              { name: 'LunaWolf vs InfernoPhoenix', viewers: 42 },
            ].map((m, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 3 }}
                style={{
                  padding: '9px 10px', borderRadius: '7px',
                  background: 'rgba(192,132,252,0.08)',
                  border: '1px solid rgba(192,132,252,0.2)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#C084FC', marginBottom: '3px' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(184,150,122,0.55)' }}>
                  👁 {m.viewers} watching
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
      `}</style>
    </div>
  )
}