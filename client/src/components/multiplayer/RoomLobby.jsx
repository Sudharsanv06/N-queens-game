import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'

// ─── Constants ────────────────────────────────────────────────────────────────
const ROOM_SIZES = [
  { label: '4x4', value: 4,  difficulty: 'Easy' },
  { label: '6x6', value: 6,  difficulty: 'Medium' },
  { label: '8x8', value: 8,  difficulty: 'Hard' },
  { label: '12x12', value: 12, difficulty: 'Expert' }
]

const ROOM_TYPES = [
  { id: 'quick', label: '⚡ Quick Match', desc: '3 mins - Auto matchmake', color: '#F5B800' },
  { id: 'ranked', label: '👑 Ranked', desc: 'Points & rating - Competitive', color: '#FFD700' },
  { id: 'casual', label: '🎮 Casual', desc: 'No pressure - Just for fun', color: '#C084FC' },
  { id: 'tournament', label: '🏆 Tournament', desc: 'Bracket play - Multi-round', color: '#FF8A8A' },
]

const DIFFICULTY_COLORS = {
  Easy:   '#4ADE80',
  Medium: '#F5B800',
  Hard:   '#FF8A8A',
  Expert: '#C084FC',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlayerCard({ player, isHost = false, isReady = false, isSelf = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(245,184,0,0.2)' }}
      style={{
        flex: 1, minWidth: '160px',
        background: isSelf 
          ? 'linear-gradient(160deg, #3A2010, #2A1010)'
          : 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: isSelf
          ? '2px solid rgba(245,184,0,0.4)'
          : '1px solid rgba(245,184,0,0.1)',
        borderRadius: '14px', padding: '18px 16px',
        position: 'relative', overflow: 'hidden',
        cursor: 'pointer', transition: 'all 0.3s',
      }}
    >
      {/* ── Glow background ────────────────────────────────────────────────────── */}
      <motion.div
        animate={isSelf ? { opacity: [0.4, 0.6, 0.4] } : { opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 30%, rgba(245,184,0,0.2), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Status badges ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '10px',
            background: player.avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', border: '2px solid rgba(255,255,255,0.1)',
          }}>
            {player.avatar}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
            {isHost && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{
                  padding: '4px 8px', borderRadius: '6px',
                  background: 'rgba(196,30,30,0.2)', border: '1px solid rgba(196,30,30,0.4)',
                  fontSize: '11px', fontWeight: 600, color: '#FF8A8A',
                  textAlign: 'center', whiteSpace: 'nowrap',
                }}
              >
                👑 Host
              </motion.div>
            )}
            {isReady && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  padding: '4px 8px', borderRadius: '6px',
                  background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.4)',
                  fontSize: '11px', fontWeight: 600, color: '#4ADE80',
                  textAlign: 'center',
                }}
              >
                ✓ Ready
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Player info ────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: '14px',
            fontWeight: 700, color: '#FAF7F0', marginBottom: '3px',
          }}>
            {player.name}
          </div>
          <div style={{
            fontSize: '12px', color: 'rgba(184,150,122,0.65)',
            display: 'flex', gap: '12px',
          }}>
            <span>⭐ Lvl {player.level}</span>
            <span>📊 {player.wins}W</span>
          </div>
        </div>

        {/* ── Rating ─────────────────────────────────────────────────────────── */}
        <div style={{
          padding: '8px 10px', borderRadius: '8px',
          background: 'rgba(245,184,0,0.08)', border: '1px solid rgba(245,184,0,0.15)',
          textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#F5B800',
        }}>
          {player.rating} 🏅
        </div>
      </div>
    </motion.div>
  )
}

function RoomTypeCard({ roomType, isSelected = false, onClick, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{
        flex: 1, minWidth: '140px',
        background: isSelected
          ? `linear-gradient(135deg, ${roomType.color}20, ${roomType.color}08)`
          : 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: isSelected
          ? `2px solid ${roomType.color}`
          : '1px solid rgba(245,184,0,0.1)',
        borderRadius: '12px', padding: '16px 14px',
        cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '20px', marginBottom: '6px' }}>
        {roomType.label.split(' ')[0]}
      </div>
      <div style={{
        fontWeight: 600, fontSize: '13px', color: isSelected ? roomType.color : '#FAF7F0',
        marginBottom: '4px',
      }}>
        {roomType.label.split(' ').slice(1).join(' ')}
      </div>
      <div style={{
        fontSize: '11px', color: 'rgba(184,150,122,0.6)',
      }}>
        {roomType.desc}
      </div>
    </motion.div>
  )
}

function DifficultyButton({ size, isSelected = false, onClick, delay = 0 }) {
  const diff = ROOM_SIZES.find(s => s.value === size)
  const color = DIFFICULTY_COLORS[diff?.difficulty] || '#F5B800'

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      style={{
        padding: '8px 14px', borderRadius: '8px',
        background: isSelected ? `${color}25` : 'rgba(255,255,255,0.04)',
        border: isSelected ? `2px solid ${color}` : '1px solid rgba(245,184,0,0.15)',
        color: isSelected ? color : 'rgba(232,213,176,0.7)',
        fontWeight: 600, fontSize: '13px', cursor: 'pointer',
        transition: 'all 0.2s', fontFamily: "'Cinzel', serif",
      }}
    >
      {diff?.label}
    </motion.button>
  )
}

// ─── Main RoomLobby Component ──────────────────────────────────────────────────
export default function RoomLobby({ onStartGame, onJoinRoom }) {
  const { user } = useSelector(s => s.auth)

  const [selectedRoomType, setSelectedRoomType] = useState('quick')
  const [selectedBoardSize, setSelectedBoardSize] = useState(8)
  const [waitingPlayers, setWaitingPlayers] = useState([])
  const [roomPlayers, setRoomPlayers] = useState([])
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [matchFound, setMatchFound] = useState(false)

  // Mock player data
  const mockSelfPlayer = {
    id: 'self',
    name: user?.name || 'You',
    avatar: user?.avatar || '👑',
    avatarColor: user?.avatarColor || '#8B6914',
    level: 24,
    wins: 187,
    rating: 2450,
  }

  const mockWaitingPlayers = [
    { id: 1, name: 'ShadowKnight', avatar: '⚔', avatarColor: '#3A1E1E', level: 22, wins: 164, rating: 2380 },
    { id: 2, name: 'GoldenPawn', avatar: '🏆', avatarColor: '#5A3A00', level: 25, wins: 201, rating: 2520 },
    { id: 3, name: 'IceQueen', avatar: '💎', avatarColor: '#005A5A', level: 23, wins: 178, rating: 2410 },
    { id: 4, name: 'PhantomRook', avatar: '🎭', avatarColor: '#5A1E5A', level: 21, wins: 142, rating: 2310 },
  ]

  useEffect(() => {
    setWaitingPlayers(mockWaitingPlayers)
  }, [])

  // Simulate match search
  const handleFindMatch = () => {
    setIsSearching(true)
    setTimeout(() => {
      setMatchFound(true)
      setRoomPlayers([
        mockSelfPlayer,
        mockWaitingPlayers[Math.floor(Math.random() * mockWaitingPlayers.length)]
      ])
    }, 3000)
  }

  const handleCreateRoom = () => {
    setShowCreateRoom(true)
    setRoomPlayers([mockSelfPlayer])
  }

  const handleStartMatch = () => {
    if (onStartGame) {
      onStartGame({
        roomType: selectedRoomType,
        boardSize: selectedBoardSize,
        players: roomPlayers,
      })
    }
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '30px 20px',
      background: 'linear-gradient(135deg, #0A0605, #1A0F0A)',
      fontFamily: "'DM Sans', sans-serif", color: '#FAF7F0',
    }}>
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          maxWidth: '1200px', margin: '0 auto', marginBottom: '40px',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '32px',
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Cinzel', serif", fontSize: '36px',
              fontWeight: 700, color: '#FAF7F0', margin: 0, marginBottom: '4px',
              letterSpacing: '0.04em',
            }}>
              ♔ Room Lobby
            </h1>
            <p style={{
              color: 'rgba(184,150,122,0.6)', fontSize: '13px',
              margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Find opponents • Play online • Climb the ranks
            </p>
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ fontSize: '48px' }}
          >
            ♞
          </motion.div>
        </div>
      </motion.div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {!matchFound && !showCreateRoom ? (
          /* ────── FIND MATCH SCREEN ──────────────────────────────────────────── */
          <motion.div
            key="findmatch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Game mode selection */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: '14px',
                fontWeight: 700, color: '#FAF7F0', marginBottom: '14px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Select Game Mode
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}>
                {ROOM_TYPES.map((rt, i) => (
                  <RoomTypeCard
                    key={rt.id}
                    roomType={rt}
                    isSelected={selectedRoomType === rt.id}
                    onClick={() => setSelectedRoomType(rt.id)}
                    delay={i * 0.1}
                  />
                ))}
              </div>
            </div>

            {/* Board size selection */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: '14px',
                fontWeight: 700, color: '#FAF7F0', marginBottom: '14px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Board Size
              </div>
              <div style={{
                display: 'flex', gap: '10px', flexWrap: 'wrap',
              }}>
                {ROOM_SIZES.map((size, i) => (
                  <DifficultyButton
                    key={size.value}
                    size={size.value}
                    isSelected={selectedBoardSize === size.value}
                    onClick={() => setSelectedBoardSize(size.value)}
                    delay={i * 0.05}
                  />
                ))}
              </div>
            </div>

            {/* Available players */}
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: '14px',
                fontWeight: 700, color: '#FAF7F0', marginBottom: '14px',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span>🎮 Players Waiting ({waitingPlayers.length})</span>
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ●
                </motion.span>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
              }}>
                {waitingPlayers.map((player, i) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => onJoinRoom?.(player)}
                    style={{ cursor: 'pointer' }}
                  >
                    <PlayerCard player={player} delay={i * 0.08} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick match buttons */}
            <div style={{
              display: 'flex', gap: '12px', justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFindMatch}
                disabled={isSearching}
                style={{
                  padding: '13px 28px', borderRadius: '10px',
                  background: isSearching
                    ? 'linear-gradient(135deg, rgba(245,184,0,0.3), rgba(245,184,0,0.2))'
                    : 'linear-gradient(135deg, #F5B800, #FFD700)',
                  border: 'none',
                  color: isSearching ? 'rgba(255,255,255,0.5)' : '#000',
                  fontWeight: 700, fontSize: '14px',
                  cursor: isSearching ? 'not-allowed' : 'pointer',
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.04em',
                }}
              >
                {isSearching ? (
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                    ⚡ Searching...
                  </motion.span>
                ) : (
                  '⚡ Find Quick Match'
                )}
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCreateRoom}
                style={{
                  padding: '13px 28px', borderRadius: '10px',
                  background: 'transparent',
                  border: '2px solid rgba(245,184,0,0.3)',
                  color: 'rgba(232,213,176,0.8)',
                  fontWeight: 700, fontSize: '14px',
                  cursor: 'pointer',
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.04em',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.target.style.borderColor = 'rgba(245,184,0,0.6)'
                  e.target.style.color = '#FAF7F0'
                }}
                onMouseLeave={e => {
                  e.target.style.borderColor = 'rgba(245,184,0,0.3)'
                  e.target.style.color = 'rgba(232,213,176,0.8)'
                }}
              >
                👑 Create Room
              </motion.button>
            </div>
          </motion.div>
        ) : matchFound ? (
          /* ────── ROOM READY SCREEN ──────────────────────────────────────────── */
          <motion.div
            key="matched"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{
              textAlign: 'center', marginBottom: '40px',
            }}>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ fontSize: '48px', marginBottom: '16px' }}
              >
                ✨
              </motion.div>
              <h2 style={{
                fontFamily: "'Cinzel', serif", fontSize: '26px',
                fontWeight: 700, color: '#F5B800', margin: 0,
              }}>
                Match Found!
              </h2>
              <p style={{
                color: 'rgba(184,150,122,0.6)', marginTop: '8px',
                fontSize: '13px',
              }}>
                Two worthy opponents prepare for battle
              </p>
            </div>

            {/* Players ready check */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto 1fr',
              gap: '20px', alignItems: 'center', marginBottom: '40px',
            }}>
              <PlayerCard player={roomPlayers[0]} isSelf={true} isReady={true} />
              <div style={{
                textAlign: 'center', padding: '20px',
                background: 'linear-gradient(135deg, #1E1010, #160A0A)',
                border: '1px solid rgba(245,184,0,0.15)',
                borderRadius: '10px',
                minWidth: '80px',
              }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  style={{ fontSize: '20px', marginBottom: '6px' }}
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
              <PlayerCard player={roomPlayers[1]} isReady={true} />
            </div>

            {/* Match info */}
            <div style={{
              background: 'linear-gradient(135deg, #1E1010, #160A0A)',
              border: '1px solid rgba(245,184,0,0.15)',
              borderRadius: '12px', padding: '20px',
              textAlign: 'center', marginBottom: '30px',
            }}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',gap: '20px',}}>
                {[
                  { icon: '🎮', label: 'Mode', value: selectedRoomType.toUpperCase() },
                  { icon: '📏', label: 'Size', value: `${selectedBoardSize}×${selectedBoardSize}` },
                  { icon: '⏱', label: 'Time Limit', value: '3 mins' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
                    <div style={{
                      fontSize: '11px', color: 'rgba(184,150,122,0.6)',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      marginBottom: '4px',
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: '14px',
                      fontWeight: 700, color: '#F5B800',
                    }}>
                      {item.value}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Start button */}
            <div style={{ textAlign: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleStartMatch}
                style={{
                  padding: '14px 40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #C41E1E, #7D0D0D)',
                  border: '1px solid rgba(196,30,30,0.4)',
                  color: '#FAF7F0', fontWeight: 700, fontSize: '15px',
                  cursor: 'pointer',
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '0.04em',
                }}
              >
                🎯 Start Match Now
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* ────── CREATE ROOM SCREEN ──────────────────────────────────────────── */
          <motion.div
            key="createroom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div style={{
              background: 'linear-gradient(160deg, #2A1010, #1A0A0A)',
              border: '1px solid rgba(245,184,0,0.15)',
              borderRadius: '16px', padding: '30px',
              marginBottom: '20px',
            }}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: '14px',
                  fontWeight: 700, color: '#FAF7F0', marginBottom: '14px',
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  Room Owner
                </div>
                <PlayerCard player={mockSelfPlayer} isSelf={true} isHost={true} />
              </div>

              <div style={{
                background: 'rgba(245,184,0,0.05)', border: '1px solid rgba(245,184,0,0.1)',
                borderRadius: '10px', padding: '16px', marginBottom: '24px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '13px', color: 'rgba(184,150,122,0.7)',
                  marginBottom: '8px',
                }}>
                  👥 Waiting for opponent...
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    fontSize: '24px',
                  }}
                >
                  ⏳
                </motion.div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCreateRoom(false)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '9px',
                    background: 'transparent',
                    border: '1px solid rgba(245,184,0,0.18)',
                    color: 'rgba(232,213,176,0.75)', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '9px',
                    background: 'linear-gradient(135deg, #C41E1E, #7D0D0D)',
                    border: '1px solid rgba(196,30,30,0.4)',
                    color: '#FAF7F0', fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Share Room
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
    </div>
  )
}