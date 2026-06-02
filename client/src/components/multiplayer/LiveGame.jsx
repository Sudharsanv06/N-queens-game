import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Constants ────────────────────────────────────────────────────────────────
const GAME_STATES = {
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished',
}

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
        cols[col] = true
        diag1[d1] = true
        diag2[d2] = true
        if (solve(row + 1)) return true
        board[row] = -1
        cols[col] = false
        diag1[d1] = false
        diag2[d2] = false
      }
    }
    return false
  }
  solve(0)
  return board
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GameBoard({ size = 8, solution = null, playerMoves = [], isActive = false, onCellClick = null }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        aspectRatio: '1', maxWidth: '100%',
        background: 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: isActive ? '2px solid #F5B800' : '1px solid rgba(245,184,0,0.15)',
        borderRadius: '10px', padding: '8px',
        boxShadow: isActive ? '0 0 20px rgba(245,184,0,0.2)' : 'none',
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: '1px',
        height: '100%',
        background: '#0A0605',
        padding: '2px',
        borderRadius: '6px',
      }}>
        {Array(size).fill(0).map((_, row) =>
          Array(size).fill(0).map((_, col) => {
            const isLight = (row + col) % 2 === 0
            const hasQueen = solution && solution[row] === col
            const playerHasQueen = playerMoves.includes(row * size + col)
            const isClickable = isActive && onCellClick && !hasQueen

            return (
              <motion.div
                key={`${row}-${col}`}
                whileHover={isClickable ? { scale: 1.1 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (row * size + col) * 0.01 }}
                onClick={() => isClickable && onCellClick(row, col)}
                style={{
                  aspectRatio: '1',
                  background: isLight ? '#3A2A1A' : '#2A1A0A',
                  border: playerHasQueen ? '2px solid #4ADE80' : 'none',
                  borderRadius: hasQueen || playerHasQueen ? '4px' : '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: size > 10 ? '14px' : '18px',
                  cursor: isClickable ? 'pointer' : 'default',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* ── Queen piece ────────────────────────────────────────────────── */}
                {hasQueen && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    ♛
                  </motion.div>
                )}

                {/* ── Player's queen attempt ────────────────────────────────────── */}
                {playerHasQueen && !hasQueen && (
                  <motion.div
                    animate={{ scale: [0.8, 1, 0.8] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    style={{ color: '#FF8A8A', opacity: 0.7 }}
                  >
                    ✕
                  </motion.div>
                )}

                {/* ── Grid lines ────────────────────────────────────────────────── */}
                <div style={{
                  position: 'absolute', inset: 0,
                  border: '1px solid rgba(245,184,0,0.05)',
                  pointerEvents: 'none',
                }} />
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}

function PlayerHeader({ player, time, isActive = false, isSelf = false }) {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: isActive
          ? 'linear-gradient(135deg, rgba(245,184,0,0.15), rgba(245,184,0,0.05))'
          : 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: isActive ? '1px solid rgba(245,184,0,0.3)' : '1px solid rgba(245,184,0,0.1)',
        borderRadius: '10px', padding: '12px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '8px',
          background: player.avatarColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {player.avatar}
        </div>
        <div>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: '13px',
            fontWeight: 700, color: '#FAF7F0',
          }}>
            {player.name} {isSelf && '(You)'}
          </div>
          <div style={{
            fontSize: '11px', color: 'rgba(184,150,122,0.65)',
          }}>
            ⭐ Lvl {player.level} • 🏅 {player.rating}
          </div>
        </div>
      </div>

      <motion.div
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.6, repeat: Infinity }}
        style={{
          textAlign: 'center',
        }}
      >
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '18px', fontWeight: 700, color: '#F5B800',
          lineHeight: 1,
        }}>
          {String(minutes).padStart(1, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div style={{
          fontSize: '10px', color: 'rgba(184,150,122,0.6)',
          marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          Time Left
        </div>
      </motion.div>
    </motion.div>
  )
}

function MoveHistory({ moves = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: '1px solid rgba(245,184,0,0.15)',
        borderRadius: '10px', padding: '14px',
        height: '280px', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: '12px',
        fontWeight: 700, color: '#FAF7F0', marginBottom: '10px',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        📋 Move History
      </div>

      <div style={{
        flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column-reverse',
        gap: '6px',
      }}>
        {moves.length === 0 ? (
          <div style={{
            textAlign: 'center', color: 'rgba(184,150,122,0.5)',
            fontSize: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', height: '100%',
          }}>
            No moves yet
          </div>
        ) : (
          moves.map((move, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '8px 10px', borderRadius: '6px',
                background: 'rgba(245,184,0,0.08)',
                border: '1px solid rgba(245,184,0,0.15)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px', color: '#F5B800',
              }}
            >
              <span style={{ color: 'rgba(184,150,122,0.6)' }}>#{i + 1}</span> {move}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

function GameChat({ messages = [], onSendMessage = null }) {
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        background: 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: '1px solid rgba(245,184,0,0.15)',
        borderRadius: '10px', padding: '14px',
        height: '280px', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: '12px',
        fontWeight: 700, color: '#FAF7F0', marginBottom: '10px',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        💬 Game Chat
      </div>

      <div style={{
        flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column',
        gap: '8px', marginBottom: '10px',
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center', color: 'rgba(184,150,122,0.5)',
            fontSize: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', height: '100%',
          }}>
            Game in progress...
          </div>
        ) : (
          messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '8px 10px', borderRadius: '6px',
                background: 'rgba(245,184,0,0.08)',
                border: '1px solid rgba(245,184,0,0.15)',
                fontSize: '12px',
              }}
            >
              <div style={{ color: '#F5B800', fontWeight: 600, marginBottom: '2px' }}>
                {msg.player}
              </div>
              <div style={{ color: 'rgba(232,213,176,0.8)' }}>
                {msg.text}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Say something..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            flex: 1, padding: '8px 10px', borderRadius: '6px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(245,184,0,0.15)',
            color: '#FAF7F0', fontSize: '12px',
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          style={{
            padding: '8px 12px', borderRadius: '6px',
            background: 'linear-gradient(135deg, #F5B800, #FFD700)',
            border: 'none', color: '#000', fontWeight: 600,
            fontSize: '12px', cursor: 'pointer',
          }}
        >
          Send
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── Main LiveGame Component ───────────────────────────────────────────────────
export default function LiveGame({ players = [], boardSize = 8, onGameEnd = null }) {
  const [gameState, setGameState] = useState(GAME_STATES.PLAYING)
  const [timeLeft, setTimeLeft] = useState({ p1: 180, p2: 180 })
  const [activePlayer, setActivePlayer] = useState(0)
  const [solutions] = useState(() => [
    generateNQueensSolution(boardSize),
    generateNQueensSolution(boardSize),
  ])
  const [playerMoves, setPlayerMoves] = useState([[], []])
  const [moveHistory, setMoveHistory] = useState([[], []])
  const [chatMessages, setChatMessages] = useState([
    { player: 'ShadowKnight', text: 'Nice opening!' },
    { player: 'You', text: 'Thanks! Your move' }
  ])

  const p1 = players[0] || {
    name: 'You',
    avatar: '👑',
    avatarColor: '#8B6914',
    level: 24,
    rating: 2450,
  }

  const p2 = players[1] || {
    name: 'Opponent',
    avatar: '⚔',
    avatarColor: '#3A1E1E',
    level: 23,
    rating: 2380,
  }

  const currentPlayer = activePlayer === 0 ? p1 : p2

  // Handle cell click
  const handleCellClick = (playerIdx, row, col) => {
    if (gameState !== GAME_STATES.PLAYING) return
    if (activePlayer !== playerIdx) return

    const solution = solutions[playerIdx]
    const correctCol = solution[row]

    if (correctCol === col) {
      // Correct move
      const position = row * boardSize + col
      if (!playerMoves[playerIdx].includes(position)) {
        setPlayerMoves(prev => {
          const updated = [...prev]
          updated[playerIdx] = [...updated[playerIdx], position]
          return updated
        })
        setMoveHistory(prev => {
          const updated = [...prev]
          updated[playerIdx] = [...updated[playerIdx], `Q at (${row}, ${col})`]
          return updated
        })

        // Check win condition
        if (playerMoves[playerIdx].length + 1 === boardSize) {
          setGameState(GAME_STATES.FINISHED)
          onGameEnd?.({ winner: playerIdx, reason: 'completed' })
        }

        // Switch turns
        setActivePlayer(prev => prev === 0 ? 1 : 0)
      }
    } else {
      // Wrong move - penalty or just feedback
      setChatMessages(prev => [...prev, {
        player: 'System',
        text: `${currentPlayer.name} tried (${row}, ${col}) - wrong position!`
      }])
    }
  }

  // Timer logic
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const updated = { ...prev }
        const currentKey = `p${activePlayer + 1}`
        updated[currentKey]--
        if (updated[currentKey] <= 0) {
          setGameState(GAME_STATES.FINISHED)
          onGameEnd?.({ winner: activePlayer === 0 ? 1 : 0, reason: 'timeout' })
        }
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [gameState, activePlayer, onGameEnd])

  // Handle pause toggle
  const handlePause = () => {
    setGameState(prev => prev === GAME_STATES.PLAYING ? GAME_STATES.PAUSED : GAME_STATES.PLAYING)
  }

  const handleForfeit = () => {
    setGameState(GAME_STATES.FINISHED)
    onGameEnd?.({ winner: activePlayer === 0 ? 1 : 0, reason: 'forfeit' })
  }

  const handleSendMessage = (text) => {
    setChatMessages(prev => [...prev, {
      player: p1.name,
      text: text
    }])
  }

  if (gameState === GAME_STATES.FINISHED) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          minHeight: '100vh', padding: '40px 20px',
          background: 'linear-gradient(135deg, #0A0605, #1A0F0A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif", color: '#FAF7F0',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: 3 }}
            style={{ fontSize: '64px', marginBottom: '24px' }}
          >
            🎉
          </motion.div>
          <h1 style={{
            fontFamily: "'Cinzel', serif", fontSize: '28px',
            fontWeight: 700, marginBottom: '16px',
          }}>
            Game Over
          </h1>
          <p style={{
            color: 'rgba(184,150,122,0.7)', marginBottom: '32px',
            fontSize: '14px',
          }}>
            {p1.name} vs {p2.name}
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #F5B800, #FFD700)',
              border: 'none', color: '#000', fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Cinzel', serif",
            }}
          >
            Back to Lobby
          </motion.button>
        </div>
      </motion.div>
    )
  }

  if (gameState === GAME_STATES.PAUSED) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          minHeight: '100vh', padding: '40px 20px',
          background: 'linear-gradient(135deg, #0A0605, #1A0F0A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif", color: '#FAF7F0',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '64px', marginBottom: '24px' }}
          >
            ⏸
          </motion.div>
          <h1 style={{
            fontFamily: "'Cinzel', serif", fontSize: '28px',
            fontWeight: 700, marginBottom: '16px',
          }}>
            Game Paused
          </h1>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handlePause}
            style={{
              padding: '12px 32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #F5B800, #FFD700)',
              border: 'none', color: '#000', fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Cinzel', serif",
            }}
          >
            Resume Game
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '20px',
      background: 'linear-gradient(135deg, #0A0605, #1A0F0A)',
      fontFamily: "'DM Sans', sans-serif", color: '#FAF7F0',
    }}>
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: '24px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <h1 style={{
          fontFamily: "'Cinzel', serif", fontSize: '24px',
          fontWeight: 700, margin: 0, letterSpacing: '0.04em',
        }}>
          ⚔ Live Game
        </h1>
        <div style={{
          display: 'flex', gap: '10px',
        }}>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePause}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              background: 'transparent',
              border: '1px solid rgba(245,184,0,0.2)',
              color: 'rgba(232,213,176,0.8)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            ⏸ Pause
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleForfeit}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              background: 'rgba(196,30,30,0.15)',
              border: '1px solid rgba(196,30,30,0.3)',
              color: '#FF8A8A',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            ✕ Forfeit
          </motion.button>
        </div>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) auto',
        gap: '16px', maxWidth: '1400px', margin: '0 auto',
      }}>
        {/* ────── PLAYER 1 SECTION ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <PlayerHeader
            player={p1}
            time={timeLeft.p1}
            isActive={activePlayer === 0}
            isSelf={true}
          />
          <GameBoard
            size={boardSize}
            solution={solutions[0]}
            playerMoves={playerMoves[0]}
            isActive={activePlayer === 0}
            onCellClick={(row, col) => handleCellClick(0, row, col)}
          />
        </motion.div>

        {/* ────── CENTER: VS & STATS ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center', gap: '12px', minWidth: '80px',
          }}
        >
          <div style={{
            textAlign: 'center', padding: '12px',
            background: 'linear-gradient(135deg, #1E1010, #160A0A)',
            border: '1px solid rgba(245,184,0,0.15)',
            borderRadius: '10px',
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{ fontSize: '20px', marginBottom: '4px' }}
            >
              ⚔
            </motion.div>
            <div style={{
              fontSize: '11px', color: 'rgba(184,150,122,0.6)',
              fontWeight: 500,
            }}>
              VS
            </div>
          </div>

          {/* Score display */}
          <div style={{
            textAlign: 'center', padding: '10px',
            background: 'linear-gradient(135deg, #2A1010, #1A0A0A)',
            borderRadius: '8px', minWidth: '100%',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: '16px',
              fontWeight: 700, color: '#F5B800', marginBottom: '4px',
            }}>
              {playerMoves[0].length}:{playerMoves[1].length}
            </div>
            <div style={{
              fontSize: '10px', color: 'rgba(184,150,122,0.6)',
              letterSpacing: '0.05em',
            }}>
              Queens Placed
            </div>
          </div>
        </motion.div>

        {/* ────── PLAYER 2 SECTION ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <PlayerHeader
            player={p2}
            time={timeLeft.p2}
            isActive={activePlayer === 1}
          />
          <GameBoard
            size={boardSize}
            solution={solutions[1]}
            playerMoves={playerMoves[1]}
            isActive={activePlayer === 1}
            onCellClick={(row, col) => handleCellClick(1, row, col)}
          />
        </motion.div>

        {/* ────── RIGHT SIDEBAR: HISTORY & CHAT ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex', flexDirection: 'column', gap: '12px',
            minWidth: '240px',
          }}
        >
          <MoveHistory moves={moveHistory[0]} />
          <GameChat messages={chatMessages} onSendMessage={handleSendMessage} />
        </motion.div>
      </div>

      {/* Turn indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          marginTop: '24px', textAlign: 'center',
          padding: '12px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #1E1010, #160A0A)',
          border: '1px solid rgba(245,184,0,0.15)',
        }}
      >
        <div style={{
          fontSize: '14px', color: '#F5B800',
          fontWeight: 600, fontFamily: "'Cinzel', serif",
        }}>
          {activePlayer === 0 ? `${p1.name}'s Turn` : `${p2.name}'s Turn`}
        </div>
        <div style={{
          fontSize: '11px', color: 'rgba(184,150,122,0.6)',
          marginTop: '4px',
        }}>
          Click on a cell to place your queen at the correct row position
        </div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
      `}</style>
    </div>
  )
}