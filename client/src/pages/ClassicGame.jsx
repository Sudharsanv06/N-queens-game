import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast, Toaster } from 'react-hot-toast'

// ─── Offline helpers (unchanged logic) ───────────────────────────────────────
const OFFLINE_GAMES_KEY = 'nqueens_offline_games'

const getCurrentUser = () => {
  try {
    const token   = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) return JSON.parse(userStr)
  } catch { }
  return null
}

const saveOfflineGame = (gameData) => {
  try {
    const games  = JSON.parse(localStorage.getItem(OFFLINE_GAMES_KEY) || '{}')
    const gameId = gameData.id || Date.now().toString()
    games[gameId] = { ...gameData, id: gameId, savedAt: new Date().toISOString() }
    localStorage.setItem(OFFLINE_GAMES_KEY, JSON.stringify(games))
    return gameId
  } catch { return null }
}

// ─── Win celebration particles ────────────────────────────────────────────────
const PARTICLE_COLORS = ['#F5B800', '#C41E1E', '#FAF7F0', '#FFD700', '#FF8A8A', '#4ADE80', '#C084FC']

function WinParticles() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id:     i,
    color:  PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    x:      (Math.random() - 0.5) * 700,
    y:      (Math.random() - 0.5) * 580,
    rotate: Math.random() * 720 - 360,
    scale:  0.4 + Math.random() * 1,
    delay:  Math.random() * 0.35,
    round:  Math.random() > 0.45,
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: p.scale, rotate: p.rotate }}
          transition={{ duration: 1.3 + Math.random() * 0.7, delay: p.delay, ease: [0.2, 0, 0.8, 1] }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '8px', height: '8px',
            borderRadius: p.round ? '50%' : '2px',
            background: p.color,
            boxShadow: `0 0 8px ${p.color}`,
          }}
        />
      ))}
    </div>
  )
}

// ─── HUD stat pill ─────────────────────────────────────────────────────────────
function HudPill({ icon, value, label, accent = '#F5B800', warning = false, large = false }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: large ? '10px 22px' : '8px 14px',
      background: warning ? 'rgba(196,30,30,0.12)' : 'rgba(30,18,18,0.9)',
      border: `1px solid ${warning ? 'rgba(196,30,30,0.4)' : 'rgba(245,184,0,0.12)'}`,
      borderRadius: '12px', backdropFilter: 'blur(12px)',
      minWidth: large ? '84px' : '66px',
      transition: 'border-color 0.3s, background 0.3s',
    }}>
      <span style={{ fontSize: '13px', marginBottom: '3px' }}>{icon}</span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: large ? '19px' : '15px', fontWeight: 700,
        color: warning ? '#FF8A8A' : accent, lineHeight: 1,
      }}>{value}</span>
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: '9px',
        color: 'rgba(184,150,122,0.55)', textTransform: 'uppercase',
        letterSpacing: '0.08em', marginTop: '2px',
      }}>{label}</span>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ClassicGame() {
  const navigate         = useNavigate()
  const [searchParams]   = useSearchParams()
  const boardSize        = parseInt(searchParams.get('size')) || 8

  // ── Game state ──────────────────────────────────────────────────────────────
  const [queens,       setQueens]       = useState([])
  const [conflicts,    setConflicts]    = useState(new Set())
  const [flashCells,   setFlashCells]   = useState(new Set())
  const [selectedCell, setSelectedCell] = useState(null)

  // ── Stats ───────────────────────────────────────────────────────────────────
  const [moves,         setMoves]         = useState(0)
  const [startTime,     setStartTime]     = useState(null)
  const [elapsedTime,   setElapsedTime]   = useState(0)
  const [score,         setScore]         = useState(0)
  const [gameStatus,    setGameStatus]    = useState('ready')   // ready | playing | won
  const [hints,         setHints]         = useState(3)
  const [hintCell,      setHintCell]      = useState(null)
  const [showResults,   setShowResults]   = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [user,          setUser]          = useState(null)

  // ── Init user ───────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const token   = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      if (token && userStr) setUser(JSON.parse(userStr))
    } catch { }
  }, [])

  // ── Reset on board size change ───────────────────────────────────────────────
  useEffect(() => {
    setQueens([]);   setConflicts(new Set()); setFlashCells(new Set())
    setMoves(0);     setScore(0);             setHints(3)
    setGameStatus('ready');                   setElapsedTime(0)
    setStartTime(null); setShowResults(false); setShowParticles(false)
    setHintCell(null)
  }, [boardSize])

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameStatus !== 'playing' || !startTime) return
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [gameStatus, startTime])

  // ── Conflict detection ───────────────────────────────────────────────────────
  const checkConflicts = useCallback((qs) => {
    const c = new Set()
    for (let i = 0; i < qs.length; i++) {
      const [r1, c1] = qs[i]
      for (let j = i + 1; j < qs.length; j++) {
        const [r2, c2] = qs[j]
        if (r1 === r2 || c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
          c.add(`${r1}-${c1}`)
          c.add(`${r2}-${c2}`)
        }
      }
    }
    return c
  }, [])

  // ── Win detection ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (queens.length === boardSize && conflicts.size === 0 && gameStatus === 'playing') {
      handleGameWon()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queens, conflicts, boardSize, gameStatus])

  // ── Cell click ───────────────────────────────────────────────────────────────
  const handleCellClick = (row, col) => {
    if (gameStatus === 'won') return
    if (gameStatus === 'ready') {
      setGameStatus('playing')
      setStartTime(Date.now())
    }

    const queenIndex = queens.findIndex(([r, c]) => r === row && c === col)
    let newQueens

    if (queenIndex !== -1) {
      newQueens = queens.filter((_, i) => i !== queenIndex)
    } else {
      newQueens = [...queens, [row, col]]
      setMoves(m => m + 1)
    }

    const newConflicts = checkConflicts(newQueens)
    setQueens(newQueens)
    setConflicts(newConflicts)

    // Red flash on newly conflicting cells
    if (newConflicts.size > 0) {
      setFlashCells(newConflicts)
      setTimeout(() => setFlashCells(new Set()), 480)
    }

    setSelectedCell(`${row}-${col}`)
    setTimeout(() => setSelectedCell(null), 180)
  }

  // ── Score ────────────────────────────────────────────────────────────────────
  const calculateScore = () => {
    const base      = boardSize * 100
    const timeBonus = Math.max(0, 1000 - elapsedTime * 2)
    const moveBonus = Math.max(0, 500  - moves * 10)
    const sizeBonus = (boardSize - 4) * 50
    return Math.floor(base + timeBonus + moveBonus + sizeBonus)
  }

  // ── Win handler ───────────────────────────────────────────────────────────────
  const handleGameWon = async () => {
    if (gameStatus === 'won') return
    setGameStatus('won')
    const finalScore = calculateScore()
    setScore(finalScore)
    setShowParticles(true)

    const currentUser = getCurrentUser()
    if (currentUser) {
      const gameData = {
        userId: currentUser.id,
        username: currentUser.username || currentUser.name || 'Guest',
        boardSize, timeElapsed: elapsedTime, moves,
        score: finalScore, hintsUsed: 3 - hints,
        solved: true, mode: 'classic',
        completedAt: new Date().toISOString(),
      }
      saveOfflineGame(gameData)
      window.dispatchEvent(new CustomEvent('gameCompleted', { detail: gameData }))
    }

    if (user) {
      try {
        const token      = localStorage.getItem('token')
        const boardState = Array(boardSize).fill(null).map(() => Array(boardSize).fill(0))
        queens.forEach(([r, c]) => { boardState[r][c] = 1 })
        const sessionId  = `classic_${boardSize}x${boardSize}_${Date.now()}`

        await fetch(`${import.meta.env.VITE_API_URL}/api/games/save`, {  // FIX: was /api/saves/save
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            sessionId, n: boardSize, boardState,
            timer: elapsedTime,
            moves: queens.map(([r, c]) => ({ row: r, col: c })),
            hintsUsed: 3 - hints,
            metadata: {
              mode: 'classic', boardSize,
              score: finalScore, timeElapsed: elapsedTime,
              movesCount: moves, completed: true,
            },
          }),
        })
      } catch (err) {
        console.error('Save score error:', err)
      }
    }

    setTimeout(() => setShowResults(true), 1800)
  }

  // ── Hint ─────────────────────────────────────────────────────────────────────
  const useHint = () => {
    if (hints <= 0) { toast.error('No hints remaining!'); return }
    if (gameStatus === 'ready') {
      setGameStatus('playing')
      setStartTime(Date.now())
    }
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (queens.some(([r, c]) => r === row && c === col)) continue
        if (checkConflicts([...queens, [row, col]]).size === 0) {
          setHintCell(`${row}-${col}`)
          setHints(h => h - 1)
          toast.success('💡 Safe position highlighted!')
          setTimeout(() => setHintCell(null), 4000)
          return
        }
      }
    }
    toast.error('No valid hints for current position')
  }

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const resetGame = () => {
    setQueens([]);   setConflicts(new Set()); setFlashCells(new Set())
    setMoves(0);     setScore(0);             setHints(3); setHintCell(null)
    setGameStatus('ready');                   setElapsedTime(0)
    setStartTime(null); setShowResults(false); setShowParticles(false)
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const formatTime  = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const rowHasQueen = (r) => queens.some(([qr]) => qr === r)
  const colHasQueen = (c) => queens.some(([, qc]) => qc === c)

  // ── Responsive cell size ──────────────────────────────────────────────────────
  const maxBoardPx  = Math.min(window.innerWidth * 0.92, 540)
  const cellSize    = Math.floor(Math.min(56, maxBoardPx / boardSize))
  const queenFont   = Math.max(13, Math.floor(cellSize * 0.58))

  const FILES = ['a','b','c','d','e','f','g','h','i','j','k','l'].slice(0, boardSize)
  const RANKS = Array.from({ length: boardSize }, (_, i) => boardSize - i)

  // ── Status banner content ─────────────────────────────────────────────────────
  const bannerText = gameStatus === 'won'     ? '✓ Puzzle Solved!'
    : gameStatus === 'ready'                  ? '♛ Click any cell to begin'
    : conflicts.size > 0                      ? `⚠ ${Math.floor(conflicts.size / 2)} conflict${conflicts.size > 2 ? 's' : ''} — queens are attacking`
    : queens.length === boardSize             ? '✓ All queens placed — no conflicts!'
    : `${queens.length} of ${boardSize} queens placed`

  const bannerColor = gameStatus === 'won'    ? '#4ADE80'
    : conflicts.size > 0                      ? '#FF8A8A'
    : queens.length === boardSize             ? '#4ADE80'
    : 'rgba(245,184,0,0.65)'

  const bannerBorder = gameStatus === 'won'   ? 'rgba(74,222,128,0.3)'
    : conflicts.size > 0                      ? 'rgba(196,30,30,0.35)'
    : 'rgba(245,184,0,0.15)'

  const bannerBg = gameStatus === 'won'       ? 'rgba(74,222,128,0.08)'
    : conflicts.size > 0                      ? 'rgba(196,30,30,0.1)'
    : 'rgba(245,184,0,0.06)'

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0C0505',
      backgroundImage: `
        radial-gradient(ellipse at 15% 0%,   rgba(196,30,30,0.1)  0%, transparent 50%),
        radial-gradient(ellipse at 85% 100%, rgba(100,8,8,0.12)   0%, transparent 50%)
      `,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
      overflowX: 'hidden',
    }}>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#1E1010', color: '#FAF7F0',
          border: '1px solid rgba(245,184,0,0.2)', borderRadius: '10px',
        },
        success: { iconTheme: { primary: '#4ADE80', secondary: '#0C0505' } },
        error:   { iconTheme: { primary: '#FF8A8A', secondary: '#0C0505' } },
      }} />

      {/* ── TOP NAV ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px clamp(14px,4vw,28px)',
        background: 'rgba(12,5,5,0.9)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(245,184,0,0.1)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <motion.button
          whileHover={{ x: -2 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/board-size-selector')}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '7px 13px', borderRadius: '8px',
            background: 'rgba(30,18,18,0.8)',
            border: '1px solid rgba(245,184,0,0.14)',
            color: 'rgba(232,213,176,0.8)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}
        >← Change Size</motion.button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(13px,2.5vw,17px)',
            fontWeight: 700, color: '#FAF7F0', letterSpacing: '0.04em',
          }}>♛ Classic Mode</div>
          <div style={{
            fontSize: '11px', color: 'rgba(245,184,0,0.55)',
            letterSpacing: '0.1em',
          }}>{boardSize} × {boardSize} Board</div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          style={{
            padding: '7px 13px', borderRadius: '8px',
            background: 'rgba(30,18,18,0.8)',
            border: '1px solid rgba(245,184,0,0.14)',
            color: 'rgba(232,213,176,0.8)',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}
        >🏠 Home</motion.button>
      </div>

      {/* ── HUD BAR ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        gap: 'clamp(6px,1.5vw,14px)',
        padding: '14px clamp(14px,4vw,28px)',
        flexWrap: 'wrap',
      }}>
        <HudPill icon="⏱"  value={formatTime(elapsedTime)}        label="Time"   accent="#60A5FA" />
        <HudPill icon="↕️"  value={moves}                          label="Moves"  accent="#F5B800" />
        <HudPill icon="♛"  value={`${queens.length}/${boardSize}`} label="Queens" accent="#4ADE80"
          warning={conflicts.size > 0} large
        />
        <HudPill icon="💡" value={hints}                            label="Hints"  accent="#F5B800" warning={hints === 0} />
        <HudPill icon="🏆" value={score || '—'}                    label="Score"  accent="#FFD700" large />
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flex: 1,
        gap: 'clamp(14px,3vw,28px)',
        padding: '0 clamp(14px,4vw,28px) clamp(24px,4vw,40px)',
        justifyContent: 'center', alignItems: 'flex-start',
        flexWrap: 'wrap',
      }}>

        {/* ── BOARD COLUMN ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Status banner */}
          <motion.div
            key={bannerText}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              marginBottom: '12px', padding: '7px 20px', borderRadius: '999px',
              background: bannerBg,
              border: `1px solid ${bannerBorder}`,
              fontSize: '13px', fontWeight: 500, color: bannerColor,
            }}
          >{bannerText}</motion.div>

          {/* Board outer frame */}
          <div style={{
            background: 'linear-gradient(135deg, #5A3A3A, #3A1E1E)',
            padding: 'clamp(7px,1.2vw,11px)',
            borderRadius: '10px',
            boxShadow: '0 20px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,184,0,0.14)',
          }}>
            {/* File labels top */}
            <div style={{ display: 'flex', paddingLeft: '20px', marginBottom: '3px' }}>
              {FILES.map(f => (
                <div key={f} style={{
                  width: cellSize, textAlign: 'center',
                  fontSize: '10px', color: 'rgba(245,184,0,0.4)',
                  letterSpacing: '0.05em', fontFamily: "'DM Sans', sans-serif",
                }}>{f}</div>
              ))}
            </div>

            {/* Board rows */}
            {Array(boardSize).fill(null).map((_, row) => (
              <div key={row} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Rank label */}
                <div style={{
                  width: '20px', flexShrink: 0, textAlign: 'center',
                  fontSize: '10px', color: 'rgba(245,184,0,0.4)',
                  fontFamily: "'DM Sans', sans-serif",
                }}>{RANKS[row]}</div>

                {/* Cells */}
                {Array(boardSize).fill(null).map((_, col) => {
                  const key        = `${row}-${col}`
                  const isLight    = (row + col) % 2 === 0
                  const hasQueen   = queens.some(([r, c]) => r === row && c === col)
                  const isConflict = conflicts.has(key)
                  const isFlash    = flashCells.has(key)
                  const isHint     = hintCell === key
                  const isSelected = selectedCell === key
                  const dimmed     = !hasQueen && gameStatus === 'playing'
                                     && (rowHasQueen(row) || colHasQueen(col))

                  return (
                    <motion.div
                      key={key}
                      onClick={() => handleCellClick(row, col)}
                      whileHover={gameStatus !== 'won' ? { filter: 'brightness(1.18)' } : {}}
                      whileTap={gameStatus  !== 'won' ? { scale: 0.91 }                : {}}
                      style={{
                        width:           cellSize,
                        height:          cellSize,
                        backgroundColor: isConflict
                          ? 'rgba(196,30,30,0.38)'
                          : isHint
                          ? 'rgba(245,184,0,0.18)'
                          : isLight ? '#3D2B2B' : '#1E1212',
                        display:         'flex',
                        alignItems:      'center',
                        justifyContent:  'center',
                        cursor:          gameStatus === 'won' ? 'default' : 'pointer',
                        position:        'relative',
                        outline:         isHint    ? '2px solid rgba(245,184,0,0.55)' : 'none',
                        outlineOffset:   '-2px',
                        boxShadow:       isSelected ? 'inset 0 0 0 2px rgba(245,184,0,0.35)' : 'none',
                        transition:      'background-color 0.15s',
                      }}
                    >
                      {/* Dimming overlay for occupied rows/cols */}
                      {dimmed && (
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'rgba(0,0,0,0.2)',
                          pointerEvents: 'none',
                        }} />
                      )}

                      {/* Hint pulse ring */}
                      {isHint && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.9, 0.25, 0.9] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          style={{
                            position: 'absolute', inset: 0,
                            border: '2px solid #F5B800',
                            borderRadius: '3px',
                            pointerEvents: 'none',
                          }}
                        />
                      )}

                      {/* Queen with spring drop */}
                      {hasQueen && (
                        <AnimatePresence>
                          <motion.div
                            key={key + '-q'}
                            initial={{ y: -(cellSize * 0.85), scale: 1.35, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                            transition={{ type: 'spring', stiffness: 390, damping: 22 }}
                            style={{
                              fontSize:    queenFont,
                              lineHeight:  1,
                              userSelect:  'none',
                              filter:      isConflict
                                ? 'drop-shadow(0 0 8px rgba(196,30,30,0.95)) saturate(0.3)'
                                : 'drop-shadow(0 2px 7px rgba(0,0,0,0.75))',
                              color:       isConflict ? '#FF5555'
                                : isLight  ? '#FAF7F0'  : '#E8D5B0',
                              transition:  'filter 0.2s, color 0.2s',
                            }}
                          >♛</motion.div>
                        </AnimatePresence>
                      )}

                      {/* Conflict flash overlay */}
                      <AnimatePresence>
                        {isFlash && (
                          <motion.div
                            initial={{ opacity: 0.72 }}
                            animate={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.46 }}
                            style={{
                              position: 'absolute', inset: 0,
                              background: 'rgba(196,30,30,0.6)',
                              pointerEvents: 'none',
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Board caption */}
          <div style={{
            marginTop: '9px',
            fontSize: '11px', color: 'rgba(245,184,0,0.38)',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            fontFamily: "'DM Sans', sans-serif",
          }}>{boardSize} × {boardSize} — Classic Mode</div>

          {/* Action buttons */}
          <div style={{
            display: 'flex', gap: '10px', marginTop: '16px',
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {[
              { label: `💡 Hint (${hints})`,  fn: useHint,                                          disabled: hints <= 0, accent: '#F5B800' },
              { label: '↺ Reset',              fn: resetGame,                                        disabled: false,      accent: '#60A5FA' },
              { label: '🏆 Leaderboard',       fn: () => navigate('/leaderboard?mode=classic'),      disabled: false,      accent: '#4ADE80' },
            ].map(btn => (
              <motion.button
                key={btn.label}
                whileHover={!btn.disabled ? { y: -2, borderColor: `${btn.accent}44` } : {}}
                whileTap={!btn.disabled   ? { scale: 0.95 } : {}}
                onClick={btn.fn}
                disabled={btn.disabled}
                style={{
                  padding: '9px 17px', borderRadius: '8px',
                  background: btn.disabled ? 'rgba(30,18,18,0.35)' : 'rgba(30,18,18,0.9)',
                  border: `1px solid ${btn.disabled ? 'rgba(245,184,0,0.06)' : 'rgba(245,184,0,0.14)'}`,
                  color: btn.disabled ? 'rgba(184,150,122,0.3)' : 'rgba(232,213,176,0.85)',
                  fontSize: '13px', fontWeight: 500,
                  cursor: btn.disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >{btn.label}</motion.button>
            ))}
          </div>
        </div>

        {/* ── INFO PANEL ───────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '12px',
          width: 'clamp(200px,24vw,256px)', paddingTop: '44px',
        }}>

          {/* Progress bar */}
          <div style={{
            background: 'linear-gradient(135deg, #1E1010, #160A0A)',
            border: '1px solid rgba(245,184,0,0.1)',
            borderRadius: '12px', padding: '16px 18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(184,150,122,0.7)' }}>Progress</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '12px', color: '#F5B800',
              }}>{queens.length}/{boardSize}</span>
            </div>
            <div style={{
              height: '6px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
            }}>
              <motion.div
                animate={{ width: `${(queens.length / boardSize) * 100}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                style={{
                  height: '100%', borderRadius: '999px',
                  background: conflicts.size > 0
                    ? 'linear-gradient(90deg, #C41E1E, #FF5555)'
                    : 'linear-gradient(90deg, #F5B800, #FFD700)',
                }}
              />
            </div>
            {conflicts.size > 0 && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ margin: '8px 0 0', fontSize: '11px', color: '#FF8A8A' }}
              >⚠ Resolve conflicts to complete</motion.p>
            )}
          </div>

          {/* Rules card */}
          <div style={{
            background: 'linear-gradient(135deg, #1E1010, #160A0A)',
            border: '1px solid rgba(245,184,0,0.1)',
            borderRadius: '12px', padding: '18px',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: '13px',
              fontWeight: 600, color: '#FAF7F0', marginBottom: '12px',
              letterSpacing: '0.04em',
            }}>How to Play</div>
            {[
              ['✓', `Place exactly ${boardSize} queens`,                        '#4ADE80'],
              ['✗', 'No row, column, or diagonal may share queens',             '#FF8A8A'],
              ['⏱', 'Faster = bigger time bonus',                               '#60A5FA'],
              ['♟', 'Fewer moves = bigger move bonus',                          '#F5B800'],
              ['💡', '3 hints — highlights the next safe cell',                 '#FFD700'],
            ].map(([icon, text, color]) => (
              <div key={text} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ color, fontSize: '11px', flexShrink: 0, marginTop: '2px' }}>{icon}</span>
                <span style={{ fontSize: '12px', color: 'rgba(184,150,122,0.8)', lineHeight: 1.55 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Scoring card */}
          <div style={{
            background: 'linear-gradient(135deg, #1E1010, #160A0A)',
            border: '1px solid rgba(245,184,0,0.1)',
            borderRadius: '12px', padding: '18px',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: '13px',
              fontWeight: 600, color: '#FAF7F0', marginBottom: '12px',
              letterSpacing: '0.04em',
            }}>Scoring</div>
            {[
              ['Base Score',  `${boardSize * 100}`],
              ['Time Bonus',  'Max 1,000'],
              ['Move Bonus',  'Max 500'],
              ['Size Bonus',  `+${(boardSize - 4) * 50}`],
            ].map(([label, val]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '8px',
              }}>
                <span style={{ fontSize: '12px', color: 'rgba(184,150,122,0.7)' }}>{label}</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px', color: '#F5B800', fontWeight: 600,
                }}>{val}</span>
              </div>
            ))}
            <div style={{
              marginTop: '10px', paddingTop: '10px',
              borderTop: '1px solid rgba(245,184,0,0.1)',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '12px', color: 'rgba(232,213,176,0.85)', fontWeight: 600 }}>Current</span>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px', color: '#FFD700', fontWeight: 700,
              }}>{score || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── WIN MODAL ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showResults && gameStatus === 'won' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResults(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.84)', backdropFilter: 'blur(7px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.72, y: 40, opacity: 0 }}
              animate={{ scale: 1,    y: 0,  opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'relative', width: '100%', maxWidth: '420px',
                background: 'linear-gradient(160deg, #2A1010, #1A0A0A)',
                border: '1px solid rgba(245,184,0,0.3)',
                borderRadius: '20px', overflow: 'hidden',
                boxShadow: '0 32px 100px rgba(0,0,0,0.85), 0 0 60px rgba(245,184,0,0.12)',
              }}
            >
              {showParticles && <WinParticles />}

              {/* Gold shimmer top bar */}
              <div style={{
                height: '4px',
                background: 'linear-gradient(90deg, #C41E1E, #F5B800, #FFD700, #F5B800, #C41E1E)',
              }} />

              <div style={{ padding: '30px 28px 28px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                {/* Floating trophy */}
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: '60px', marginBottom: '12px', lineHeight: 1 }}
                >🏆</motion.div>

                <h2 style={{
                  fontFamily: "'Cinzel', serif", fontSize: '26px',
                  fontWeight: 700, letterSpacing: '0.04em', marginBottom: '5px',
                  background: 'linear-gradient(135deg, #FFD700, #F5B800)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Puzzle Solved!</h2>
                <p style={{
                  fontSize: '14px', color: 'rgba(232,213,176,0.55)',
                  marginBottom: '24px',
                }}>{boardSize}×{boardSize} Classic — well played!</p>

                {/* Stats grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: '10px', marginBottom: '22px',
                }}>
                  {[
                    { icon: '⏱', label: 'Time',       value: formatTime(elapsedTime), gold: false },
                    { icon: '↕️', label: 'Moves',      value: moves,                  gold: false },
                    { icon: '💡', label: 'Hints Used', value: 3 - hints,              gold: false },
                    { icon: '🏆', label: 'Final Score', value: score.toLocaleString(), gold: true  },
                  ].map(s => (
                    <div key={s.label} style={{
                      padding: '14px 10px', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.035)',
                      border: `1px solid ${s.gold ? 'rgba(245,184,0,0.25)' : 'rgba(245,184,0,0.07)'}`,
                    }}>
                      <div style={{ fontSize: '18px', marginBottom: '5px' }}>{s.icon}</div>
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: s.gold ? '20px' : '17px',
                        fontWeight: 700,
                        color: s.gold ? '#FFD700' : '#FAF7F0',
                      }}>{s.value}</div>
                      <div style={{
                        fontSize: '10px', color: 'rgba(184,150,122,0.55)',
                        marginTop: '2px', textTransform: 'uppercase',
                        letterSpacing: '0.08em', fontFamily: "'DM Sans', sans-serif",
                      }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <motion.button
                    whileHover={{ y: -2, boxShadow: '0 0 28px rgba(196,30,30,0.55)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={resetGame}
                    style={{
                      padding: '12px', borderRadius: '10px', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #E63939, #7D0D0D)',
                      border: '1px solid rgba(196,30,30,0.5)',
                      color: '#FAF7F0', fontSize: '14px', fontWeight: 600,
                      boxShadow: '0 2px 16px rgba(196,30,30,0.3)',
                      transition: 'box-shadow 0.2s',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >▶ Play Again</motion.button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { label: '⬜ New Size',     fn: () => navigate('/board-size-selector') },
                      { label: '🏆 Leaderboard', fn: () => navigate('/leaderboard?mode=classic') },
                    ].map(b => (
                      <motion.button
                        key={b.label}
                        whileHover={{ borderColor: 'rgba(245,184,0,0.35)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={b.fn}
                        style={{
                          flex: 1, padding: '11px', borderRadius: '10px', cursor: 'pointer',
                          background: 'transparent',
                          border: '1px solid rgba(245,184,0,0.18)',
                          color: 'rgba(232,213,176,0.8)',
                          fontSize: '13px', fontWeight: 500,
                          transition: 'border-color 0.2s',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >{b.label}</motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
      `}</style>
    </div>
  )
}