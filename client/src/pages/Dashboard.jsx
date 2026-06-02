import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { logoutUser, updateProfile, changePassword } from '../store/slices/authSlice'
import toast, { Toaster } from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────
const OFFLINE_GAMES_KEY = 'nqueens_offline_games'

const AVATARS = [
  { id: 1,  emoji: '👑', color: '#8B6914', name: 'Crown'     },
  { id: 2,  emoji: '🎮', color: '#1E3A6E', name: 'Gamer'     },
  { id: 3,  emoji: '🎯', color: '#6E1E1E', name: 'Target'    },
  { id: 4,  emoji: '⚡', color: '#5A4A00', name: 'Lightning' },
  { id: 5,  emoji: '🔥', color: '#6E2800', name: 'Fire'      },
  { id: 6,  emoji: '🌟', color: '#5A4A00', name: 'Star'      },
  { id: 7,  emoji: '🎨', color: '#6E1A50', name: 'Artist'    },
  { id: 8,  emoji: '🚀', color: '#0E3A6E', name: 'Rocket'    },
  { id: 9,  emoji: '🏆', color: '#5A3A00', name: 'Trophy'    },
  { id: 10, emoji: '💎', color: '#005A5A', name: 'Diamond'   },
  { id: 11, emoji: '⚔',  color: '#3A1E1E', name: 'Warrior'  },
  { id: 12, emoji: '🧠', color: '#1E1E5A', name: 'Thinker'  },
]

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: '◈' },
  { id: 'history',       label: 'Game History',  icon: '🕐' },
  { id: 'achievements',  label: 'Achievements',  icon: '🏆' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCurrentUser = () => {
  try {
    const s = localStorage.getItem('user')
    return s ? JSON.parse(s) : null
  } catch { return null }
}

const getStoredGames = () => {
  try {
    const s = localStorage.getItem(OFFLINE_GAMES_KEY)
    return s ? Object.values(JSON.parse(s)) : []
  } catch { return [] }
}

const formatTime = (s) => {
  if (!s || s === 0) return '0:00'
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

const getDifficulty = (size) => {
  if (size <= 6) return 'Easy'
  if (size <= 10) return 'Medium'
  if (size <= 14) return 'Hard'
  return 'Expert'
}

const DIFF_COLORS = {
  Easy:   { bg: 'rgba(74,222,128,0.12)',  text: '#4ADE80',  border: 'rgba(74,222,128,0.25)'  },
  Medium: { bg: 'rgba(245,184,0,0.12)',   text: '#F5B800',  border: 'rgba(245,184,0,0.25)'   },
  Hard:   { bg: 'rgba(196,30,30,0.12)',   text: '#FF8A8A',  border: 'rgba(196,30,30,0.25)'   },
  Expert: { bg: 'rgba(192,84,252,0.12)', text: '#C054FC',  border: 'rgba(192,84,252,0.25)'  },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Stat card
function StatCard({ icon, label, value, accent = '#F5B800', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: '1px solid rgba(245,184,0,0.1)',
        borderRadius: '14px', padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: '14px',
      }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
        background: `${accent}15`,
        border: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px',
      }}>{icon}</div>
      <div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '11px',
          color: 'rgba(184,150,122,0.65)', textTransform: 'uppercase',
          letterSpacing: '0.1em', marginBottom: '4px',
        }}>{label}</div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '20px',
          fontWeight: 700, color: accent, lineHeight: 1,
        }}>{value}</div>
      </div>
    </motion.div>
  )
}

// Styled text input
function ThemedInput({ label, icon, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
        color: 'rgba(184,150,122,0.7)',
        display: 'flex', alignItems: 'center', gap: '6px',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {icon && <span>{icon}</span>} {label}
      </label>
      <input
        {...props}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(245,184,0,0.18)',
          borderRadius: '8px', padding: '10px 14px',
          color: '#FAF7F0', fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px', outline: 'none', width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(245,184,0,0.45)' }}
        onBlur={e =>  { e.target.style.borderColor = 'rgba(245,184,0,0.18)' }}
      />
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading } = useSelector(s => s.auth)

  // ── UI state ────────────────────────────────────────────────────────────────
  const [activeTab,         setActiveTab]         = useState('overview')
  const [isEditMode,        setIsEditMode]         = useState(false)
  const [showPasswordModal, setShowPasswordModal]  = useState(false)
  const [showAvatarModal,   setShowAvatarModal]    = useState(false)
  const [avatarUpdateKey,   setAvatarUpdateKey]    = useState(0)

  // ── Form state ──────────────────────────────────────────────────────────────
  const [editData,     setEditData]     = useState({ name: '', email: '' })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })

  // ── Game data state ─────────────────────────────────────────────────────────
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0, gamesWon: 0, totalScore: 0,
    winRate: 0, currentStreak: 0, bestTime: '0:00',
    level: 1, xp: 0,
  })
  const [recentGames,    setRecentGames]    = useState([])
  const [achievements,   setAchievements]   = useState([])

  // ── Redirect if not authed ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (user) {
      setEditData({ name: user.name || '', email: user.email || '' })
    }
  }, [isAuthenticated, navigate, user])

  // ── Fetch game data ─────────────────────────────────────────────────────────
  const fetchGameData = useCallback(() => {
    if (!user) return
    try {
      const currentUser    = getCurrentUser()
      const currentUsername = user?.name || user?.username
      const allGames       = getStoredGames()

      const userGames = allGames.filter(g =>
        g.userId === currentUser?.id ||
        g.username === currentUsername ||
        g.userId === user?.id
      )

      const wonGames  = userGames.filter(g => g.solved || g.completed)
      const winRate   = userGames.length > 0
        ? Math.round((wonGames.length / userGames.length) * 100) : 0

      const completed   = userGames.filter(g => (g.solved || g.completed) && g.timeElapsed)
      const bestTimeSec = completed.length > 0
        ? Math.min(...completed.map(g => g.timeElapsed)) : 0

      const sorted = [...userGames]
        .filter(g => g.completedAt)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))

      let streak = 0
      for (const g of sorted) {
        if (g.solved || g.completed) streak++; else break
      }

      const totalScore = userGames.reduce((s, g) => s + (g.score || 0), 0)
      const level      = Math.floor(totalScore / 1000) + 1
      const xpInLevel  = totalScore % 1000

      setGameStats({
        gamesPlayed: userGames.length, gamesWon: wonGames.length,
        totalScore, winRate, currentStreak: streak,
        bestTime: formatTime(bestTimeSec), level, xp: xpInLevel,
      })

      setRecentGames(sorted.slice(0, 10).map(g => ({
        id:         g.id,
        size:       g.boardSize || g.n || 8,
        difficulty: getDifficulty(g.boardSize || g.n || 8),
        score:      g.score || 0,
        time:       formatTime(g.timeElapsed || 0),
        result:     (g.solved || g.completed) ? 'won' : 'lost',
        mode:       g.mode || 'classic',
        date:       g.completedAt
          ? new Date(g.completedAt).toLocaleDateString() : 'N/A',
      })))

      // Generate achievements
      const list = []
      if (bestTimeSec > 0 && bestTimeSec < 180)
        list.push({ id: 1, icon: '⚡', name: 'Speed Demon',      tier: 'gold',   desc: `Solved in ${formatTime(bestTimeSec)}` })
      if (streak >= 3)
        list.push({ id: 2, icon: '🔥', name: 'Hot Streak',        tier: 'gold',   desc: `${streak} wins in a row` })
      if (wonGames.length >= 10)
        list.push({ id: 3, icon: '🏆', name: 'Master Player',     tier: 'gold',   desc: `${wonGames.length} games won` })
      if (wonGames.filter(g => (g.boardSize||g.n) >= 12).length > 0)
        list.push({ id: 4, icon: '🧠', name: 'Expert Strategist', tier: 'silver', desc: 'Solved a 12×12 board' })
      if (wonGames.filter(g => g.mode === 'time-trial').length >= 5)
        list.push({ id: 5, icon: '⏱', name: 'Time Trial Master', tier: 'silver', desc: 'Beat the clock 5 times' })
      if (wonGames.length >= 1)
        list.push({ id: 6, icon: '🎯', name: 'First Victory',     tier: 'bronze', desc: 'Won your first game' })
      if (userGames.length >= 1)
        list.push({ id: 7, icon: '♟', name: 'Getting Started',   tier: 'bronze', desc: 'Played your first game' })

      setAchievements(list)
    } catch (err) {
      console.error('Dashboard data error:', err)
    }
  }, [user])

  useEffect(() => {
    fetchGameData()
    window.addEventListener('gameCompleted', fetchGameData)
    return () => window.removeEventListener('gameCompleted', fetchGameData)
  }, [fetchGameData])

  // ── Avatar helpers ──────────────────────────────────────────────────────────
  const getCurrentAvatar = () => {
    if (!user?.avatar) return null
    if (typeof user.avatar === 'object') return user.avatar
    try { return JSON.parse(user.avatar) } catch { return null }
  }
  const currentAvatar = getCurrentAvatar()

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    dispatch(logoutUser())
    toast.success('Logged out successfully')
    navigate('/')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(updateProfile(editData)).unwrap()
      toast.success('Profile updated!')
      setIsEditMode(false)
    } catch (err) { toast.error(err || 'Failed to update profile') }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match'); return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword:     passwordData.newPassword,
      })).unwrap()
      toast.success('Password changed!')
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err || 'Failed to change password') }
  }

  const handleAvatarSelect = async (avatar) => {
    try {
      await dispatch(updateProfile({
        name: user.name, email: user.email, avatar: JSON.stringify(avatar),
      })).unwrap()
      setAvatarUpdateKey(k => k + 1)
      toast.success('Avatar updated!')
      setShowAvatarModal(false)
    } catch (err) { toast.error(err || 'Failed to update avatar') }
  }

  const TIER_COLORS = {
    gold:   { bg: 'rgba(245,184,0,0.12)',  text: '#F5B800', border: 'rgba(245,184,0,0.3)'  },
    silver: { bg: 'rgba(192,192,192,0.1)', text: '#C0C0C0', border: 'rgba(192,192,192,0.25)' },
    bronze: { bg: 'rgba(205,127,50,0.12)', text: '#CD7F32', border: 'rgba(205,127,50,0.25)' },
  }

  if (!user) return null

  const xpPercent = Math.min(100, (gameStats.xp / 1000) * 100)

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh', background: '#0C0505',
      backgroundImage: `
        radial-gradient(ellipse at 20% 0%,   rgba(196,30,30,0.09) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(100,8,8,0.11)   0%, transparent 50%)
      `,
      fontFamily: "'DM Sans', sans-serif",
      padding: 'clamp(24px,5vw,48px) clamp(16px,5vw,48px)',
    }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1E1010', color: '#FAF7F0', border: '1px solid rgba(245,184,0,0.2)', borderRadius: '10px' },
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── PROFILE HEADER ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'linear-gradient(135deg, #1E1010, #160A0A)',
            border: '1px solid rgba(245,184,0,0.12)',
            borderRadius: '18px', padding: '24px 28px',
            display: 'flex', alignItems: 'center',
            gap: '20px', flexWrap: 'wrap',
            marginBottom: '20px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <motion.div
              key={`avatar-${avatarUpdateKey}`}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAvatarModal(true)}
              style={{
                width: '80px', height: '80px', borderRadius: '20px',
                background: currentAvatar?.color || 'linear-gradient(135deg, #5A3A1A, #3A1E0A)',
                border: '2px solid rgba(245,184,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '36px', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {currentAvatar?.emoji || '♛'}
              {/* Camera overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: '18px',
                  background: 'rgba(0,0,0,0.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}
              >📷</motion.div>
            </motion.div>

            {/* Level badge */}
            <div style={{
              position: 'absolute', bottom: '-6px', right: '-6px',
              background: 'linear-gradient(135deg, #C41E1E, #8B0000)',
              border: '2px solid #0C0505', borderRadius: '8px',
              padding: '2px 7px',
              fontFamily: "'Cinzel', serif", fontSize: '11px',
              fontWeight: 700, color: '#FFD700',
            }}>Lv {gameStats.level}</div>
          </div>

          {/* User info + XP bar */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: 'clamp(18px,3vw,24px)',
              fontWeight: 700, color: '#FAF7F0', marginBottom: '2px',
            }}>
              Welcome back, {user.name || user.username}!
            </div>
            <div style={{
              fontSize: '13px', color: 'rgba(184,150,122,0.7)',
              marginBottom: '12px',
            }}>{user.email}</div>

            {/* XP progress */}
            <div style={{ maxWidth: '340px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginBottom: '5px',
              }}>
                <span style={{ fontSize: '11px', color: 'rgba(245,184,0,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Level {gameStats.level} Progress
                </span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px', color: '#F5B800',
                }}>{gameStats.xp} / 1000 XP</span>
              </div>
              <div style={{
                height: '8px', borderRadius: '999px',
                background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  style={{
                    height: '100%', borderRadius: '999px',
                    background: 'linear-gradient(90deg, #C41E1E, #F5B800, #FFD700)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <motion.button
              whileHover={{ borderColor: 'rgba(245,184,0,0.4)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsEditMode(v => !v)}
              style={{
                padding: '9px 16px', borderRadius: '8px', cursor: 'pointer',
                background: isEditMode ? 'rgba(245,184,0,0.12)' : 'rgba(30,18,18,0.9)',
                border: `1px solid ${isEditMode ? 'rgba(245,184,0,0.35)' : 'rgba(245,184,0,0.15)'}`,
                color: 'rgba(232,213,176,0.85)', fontSize: '13px',
                fontWeight: 500, transition: 'all 0.2s',
              }}
            >✏ Edit</motion.button>

            <motion.button
              whileHover={{ borderColor: 'rgba(196,30,30,0.5)' }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLogout}
              style={{
                padding: '9px 16px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(30,18,18,0.9)',
                border: '1px solid rgba(245,184,0,0.15)',
                color: '#FF8A8A', fontSize: '13px',
                fontWeight: 500, transition: 'all 0.2s',
              }}
            >⇥ Logout</motion.button>
          </div>
        </motion.div>

        {/* ── EDIT PROFILE PANEL ───────────────────────────────────────────── */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden', marginBottom: '20px' }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #1E1010, #160A0A)',
                border: '1px solid rgba(245,184,0,0.15)',
                borderRadius: '14px', padding: '22px 24px',
              }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: '14px',
                  fontWeight: 600, color: '#FAF7F0', marginBottom: '18px',
                  letterSpacing: '0.04em',
                }}>Edit Profile</div>

                <form onSubmit={handleEditSubmit}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
                    gap: '14px', marginBottom: '16px',
                  }}>
                    <ThemedInput
                      label="Full Name" icon="👤" type="text" name="name"
                      value={editData.name} required
                      onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                    />
                    <ThemedInput
                      label="Email" icon="✉" type="email" name="email"
                      value={editData.email} required
                      onChange={e => setEditData(d => ({ ...d, email: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <motion.button
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      type="submit" disabled={loading}
                      style={{
                        padding: '9px 20px', borderRadius: '8px', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #C41E1E, #7D0D0D)',
                        border: '1px solid rgba(196,30,30,0.5)',
                        color: '#FAF7F0', fontSize: '13px', fontWeight: 600,
                      }}
                    >{loading ? 'Saving...' : '✓ Save Changes'}</motion.button>

                    <motion.button
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      type="button" onClick={() => setIsEditMode(false)}
                      style={{
                        padding: '9px 18px', borderRadius: '8px', cursor: 'pointer',
                        background: 'transparent',
                        border: '1px solid rgba(245,184,0,0.18)',
                        color: 'rgba(232,213,176,0.75)', fontSize: '13px',
                      }}
                    >Cancel</motion.button>

                    <motion.button
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      type="button" onClick={() => setShowPasswordModal(true)}
                      style={{
                        padding: '9px 18px', borderRadius: '8px', cursor: 'pointer',
                        background: 'rgba(245,184,0,0.08)',
                        border: '1px solid rgba(245,184,0,0.2)',
                        color: '#F5B800', fontSize: '13px',
                      }}
                    >🔑 Change Password</motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STATS GRID ───────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))',
          gap: '12px', marginBottom: '24px',
        }}>
          <StatCard icon="♟" label="Games Played" value={gameStats.gamesPlayed}                        accent="#60A5FA" delay={0}   />
          <StatCard icon="🏆" label="Games Won"    value={gameStats.gamesWon}                           accent="#4ADE80" delay={0.05} />
          <StatCard icon="⭐" label="Total Score"  value={gameStats.totalScore.toLocaleString()}        accent="#F5B800" delay={0.1}  />
          <StatCard icon="📈" label="Win Rate"     value={`${gameStats.winRate}%`}                      accent="#C084FC" delay={0.15} />
          <StatCard icon="🔥" label="Win Streak"   value={gameStats.currentStreak}                      accent="#FF8A8A" delay={0.2}  />
          <StatCard icon="⏱" label="Best Time"    value={gameStats.bestTime}                           accent="#38BDF8" delay={0.25} />
        </div>

        {/* ── TABS ─────────────────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '20px',
          background: 'rgba(30,18,18,0.6)', borderRadius: '12px', padding: '5px',
          border: '1px solid rgba(245,184,0,0.1)',
          width: 'fit-content',
        }}>
          {TABS.map(tab => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={activeTab !== tab.id ? { color: '#FAF7F0' } : {}}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, #2A1010, #1A0A0A)' : 'transparent',
                border: activeTab === tab.id
                  ? '1px solid rgba(245,184,0,0.2)' : '1px solid transparent',
                color: activeTab === tab.id ? '#FAF7F0' : 'rgba(184,150,122,0.6)',
                fontSize: '13px', fontWeight: activeTab === tab.id ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.2s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span>{tab.icon}</span>{tab.label}
            </motion.button>
          ))}
        </div>

        {/* ── TAB CONTENT ──────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
          >

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: '16px' }}>

                {/* Recent Achievements */}
                <div style={{
                  background: 'linear-gradient(135deg, #1E1010, #160A0A)',
                  border: '1px solid rgba(245,184,0,0.1)',
                  borderRadius: '14px', padding: '22px',
                }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: '14px',
                    fontWeight: 600, color: '#FAF7F0', marginBottom: '16px',
                    letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '8px',
                  }}>👑 Recent Achievements</div>

                  {(achievements.length > 0 ? achievements.slice(0, 4) : [
                    { id: 0, icon: '🎮', name: 'Getting Started', tier: 'bronze', desc: 'Play your first game to earn achievements!' }
                  ]).map((a, i) => {
                    const tc = TIER_COLORS[a.tier] || TIER_COLORS.bronze
                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '11px 14px', borderRadius: '10px',
                          background: tc.bg, border: `1px solid ${tc.border}`,
                          marginBottom: i < 3 ? '8px' : 0,
                        }}
                      >
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                          background: 'rgba(0,0,0,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '20px',
                        }}>{a.icon}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontSize: '13px', fontWeight: 600, color: tc.text,
                            marginBottom: '2px',
                          }}>{a.name}</div>
                          <div style={{
                            fontSize: '11px', color: 'rgba(184,150,122,0.7)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{a.desc}</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Quick Actions */}
                <div style={{
                  background: 'linear-gradient(135deg, #1E1010, #160A0A)',
                  border: '1px solid rgba(245,184,0,0.1)',
                  borderRadius: '14px', padding: '22px',
                }}>
                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: '14px',
                    fontWeight: 600, color: '#FAF7F0', marginBottom: '16px',
                    letterSpacing: '0.04em',
                  }}>⚡ Quick Actions</div>

                  {[
                    { icon: '♛', label: 'Start New Game',    link: '/board-size-selector', accent: '#C41E1E', gold: true  },
                    { icon: '📅', label: 'Daily Challenge',   link: '/daily-challenge',      accent: '#F5B800', gold: false },
                    { icon: '⚔', label: 'Multiplayer',       link: '/multiplayer/home',     accent: '#60A5FA', gold: false },
                    { icon: '🏆', label: 'Leaderboard',       link: '/leaderboard',          accent: '#4ADE80', gold: false },
                    { icon: '🎖', label: 'All Achievements',  link: '/achievements',          accent: '#C084FC', gold: false },
                  ].map((a, i) => (
                    <Link key={a.link} to={a.link} style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileHover={{ x: 4, borderColor: `${a.accent}44` }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 14px', borderRadius: '10px',
                          background: a.gold
                            ? 'linear-gradient(135deg, rgba(196,30,30,0.12), rgba(100,8,8,0.08))'
                            : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${a.gold ? 'rgba(196,30,30,0.25)' : 'rgba(245,184,0,0.08)'}`,
                          marginBottom: i < 4 ? '8px' : 0,
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                          background: `${a.accent}18`,
                          border: `1px solid ${a.accent}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '16px',
                        }}>{a.icon}</div>
                        <span style={{
                          fontSize: '13px', fontWeight: 500,
                          color: a.gold ? '#FAF7F0' : 'rgba(232,213,176,0.85)',
                        }}>{a.label}</span>
                        <span style={{ marginLeft: 'auto', color: 'rgba(184,150,122,0.4)', fontSize: '13px' }}>→</span>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* GAME HISTORY */}
            {activeTab === 'history' && (
              <div style={{
                background: 'linear-gradient(135deg, #1E1010, #160A0A)',
                border: '1px solid rgba(245,184,0,0.1)',
                borderRadius: '14px', padding: '22px',
                overflowX: 'auto',
              }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: '14px',
                  fontWeight: 600, color: '#FAF7F0', marginBottom: '18px',
                  letterSpacing: '0.04em',
                }}>🕐 Recent Games</div>

                {recentGames.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.35 }}>♟</div>
                    <p style={{ color: 'rgba(184,150,122,0.6)', marginBottom: '16px' }}>
                      No games yet — start playing to see your history!
                    </p>
                    <Link to="/board-size-selector" style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '7px',
                          padding: '10px 20px', borderRadius: '8px',
                          background: 'linear-gradient(135deg, #C41E1E, #7D0D0D)',
                          color: '#FAF7F0', fontSize: '13px', fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >♛ Start Playing</motion.div>
                    </Link>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                    <thead>
                      <tr>
                        {['Board', 'Mode', 'Difficulty', 'Score', 'Time', 'Result', 'Date'].map(h => (
                          <th key={h} style={{
                            textAlign: 'left', padding: '8px 12px',
                            fontFamily: "'DM Sans', sans-serif", fontSize: '10px',
                            color: 'rgba(184,150,122,0.55)', textTransform: 'uppercase',
                            letterSpacing: '0.1em', borderBottom: '1px solid rgba(245,184,0,0.08)',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentGames.map((g, i) => {
                        const dc = DIFF_COLORS[g.difficulty] || DIFF_COLORS.Easy
                        return (
                          <motion.tr
                            key={g.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            style={{
                              borderBottom: '1px solid rgba(245,184,0,0.05)',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '11px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#FAF7F0' }}>
                              {g.size}×{g.size}
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <span style={{
                                padding: '3px 8px', borderRadius: '5px', fontSize: '11px',
                                background: 'rgba(96,165,250,0.12)', color: '#60A5FA',
                                border: '1px solid rgba(96,165,250,0.2)', textTransform: 'capitalize',
                              }}>{g.mode}</span>
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <span style={{
                                padding: '3px 8px', borderRadius: '5px', fontSize: '11px',
                                background: dc.bg, color: dc.text, border: `1px solid ${dc.border}`,
                              }}>{g.difficulty}</span>
                            </td>
                            <td style={{ padding: '11px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: '#F5B800' }}>
                              {g.score.toLocaleString()}
                            </td>
                            <td style={{ padding: '11px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', color: 'rgba(232,213,176,0.75)' }}>
                              {g.time}
                            </td>
                            <td style={{ padding: '11px 12px' }}>
                              <span style={{
                                padding: '3px 9px', borderRadius: '5px', fontSize: '11px',
                                fontWeight: 600,
                                background: g.result === 'won' ? 'rgba(74,222,128,0.12)' : 'rgba(196,30,30,0.12)',
                                color:      g.result === 'won' ? '#4ADE80'              : '#FF8A8A',
                                border: `1px solid ${g.result === 'won' ? 'rgba(74,222,128,0.25)' : 'rgba(196,30,30,0.25)'}`,
                              }}>{g.result === 'won' ? '✓ Won' : '✗ Lost'}</span>
                            </td>
                            <td style={{ padding: '11px 12px', fontSize: '12px', color: 'rgba(184,150,122,0.6)' }}>
                              {g.date}
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ACHIEVEMENTS */}
            {activeTab === 'achievements' && (
              <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))',
                  gap: '14px',
                }}>
                  {(achievements.length > 0 ? achievements : [
                    { id: 0, icon: '🎮', name: 'No Achievements Yet', tier: 'bronze',
                      desc: 'Play games to earn achievements and badges!' }
                  ]).map((a, i) => {
                    const tc = TIER_COLORS[a.tier] || TIER_COLORS.bronze
                    return (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
                        whileHover={{ y: -4, borderColor: tc.border }}
                        style={{
                          background: 'linear-gradient(135deg, #1E1010, #160A0A)',
                          border: `1px solid rgba(245,184,0,0.1)`,
                          borderRadius: '14px', padding: '20px',
                          textAlign: 'center', cursor: 'default',
                          transition: 'border-color 0.25s',
                        }}
                      >
                        {/* Tier badge */}
                        <div style={{
                          display: 'inline-block', padding: '2px 8px',
                          borderRadius: '999px', marginBottom: '14px',
                          background: tc.bg, border: `1px solid ${tc.border}`,
                          fontSize: '10px', fontWeight: 600, color: tc.text,
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                        }}>{a.tier}</div>

                        {/* Icon */}
                        <div style={{
                          width: '56px', height: '56px', borderRadius: '14px',
                          background: tc.bg, border: `1px solid ${tc.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '26px', margin: '0 auto 12px',
                        }}>{a.icon}</div>

                        <div style={{
                          fontFamily: "'Cinzel', serif", fontSize: '13px',
                          fontWeight: 600, color: tc.text, marginBottom: '6px',
                          letterSpacing: '0.02em',
                        }}>{a.name}</div>
                        <div style={{
                          fontSize: '12px', color: 'rgba(184,150,122,0.7)',
                          lineHeight: 1.5,
                        }}>{a.desc}</div>
                      </motion.div>
                    )
                  })}
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <Link to="/achievements" style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '10px 22px', borderRadius: '8px',
                        border: '1px solid rgba(245,184,0,0.2)',
                        color: 'rgba(245,184,0,0.75)', fontSize: '13px', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >View All Achievements →</motion.div>
                  </Link>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── CHANGE PASSWORD MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowPasswordModal(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '400px',
                background: 'linear-gradient(160deg, #2A1010, #1A0A0A)',
                border: '1px solid rgba(245,184,0,0.2)',
                borderRadius: '18px', overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ height: '3px', background: 'linear-gradient(90deg, #C41E1E, #F5B800, #FFD700)' }} />
              <div style={{ padding: '26px 28px' }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: '17px',
                  fontWeight: 700, color: '#FAF7F0', marginBottom: '20px',
                  letterSpacing: '0.04em',
                }}>🔑 Change Password</div>

                <form onSubmit={handlePasswordSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
                    <ThemedInput label="Current Password" icon="🔐" type="password"
                      name="currentPassword" value={passwordData.currentPassword} required
                      onChange={e => setPasswordData(d => ({ ...d, currentPassword: e.target.value }))}
                    />
                    <ThemedInput label="New Password" icon="🔒" type="password"
                      name="newPassword" value={passwordData.newPassword} required minLength={6}
                      onChange={e => setPasswordData(d => ({ ...d, newPassword: e.target.value }))}
                    />
                    <ThemedInput label="Confirm New Password" icon="🔒" type="password"
                      name="confirmPassword" value={passwordData.confirmPassword} required minLength={6}
                      onChange={e => setPasswordData(d => ({ ...d, confirmPassword: e.target.value }))}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <motion.button
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      type="submit" disabled={loading}
                      style={{
                        flex: 1, padding: '11px', borderRadius: '9px', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #C41E1E, #7D0D0D)',
                        border: '1px solid rgba(196,30,30,0.4)',
                        color: '#FAF7F0', fontSize: '14px', fontWeight: 600,
                      }}
                    >{loading ? 'Changing...' : '✓ Change Password'}</motion.button>
                    <motion.button
                      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      type="button" onClick={() => setShowPasswordModal(false)}
                      style={{
                        padding: '11px 18px', borderRadius: '9px', cursor: 'pointer',
                        background: 'transparent', border: '1px solid rgba(245,184,0,0.18)',
                        color: 'rgba(232,213,176,0.75)', fontSize: '13px',
                      }}
                    >Cancel</motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AVATAR MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAvatarModal(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '440px',
                background: 'linear-gradient(160deg, #2A1010, #1A0A0A)',
                border: '1px solid rgba(245,184,0,0.2)',
                borderRadius: '18px', overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ height: '3px', background: 'linear-gradient(90deg, #C41E1E, #F5B800, #FFD700)' }} />
              <div style={{ padding: '26px 28px' }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: '17px',
                  fontWeight: 700, color: '#FAF7F0', marginBottom: '20px',
                  letterSpacing: '0.04em',
                }}>🎭 Choose Your Avatar</div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                  gap: '10px', marginBottom: '20px',
                }}>
                  {AVATARS.map(av => {
                    const isSelected = currentAvatar?.id === av.id
                    return (
                      <motion.div
                        key={av.id}
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleAvatarSelect(av)}
                        style={{
                          aspectRatio: '1', borderRadius: '12px',
                          background: av.color,
                          border: isSelected ? '2px solid #F5B800' : '2px solid transparent',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          gap: '4px', cursor: 'pointer',
                          boxShadow: isSelected ? '0 0 16px rgba(245,184,0,0.4)' : 'none',
                          transition: 'box-shadow 0.2s',
                        }}
                      >
                        <span style={{ fontSize: '26px' }}>{av.emoji}</span>
                        <span style={{
                          fontSize: '9px', color: 'rgba(255,255,255,0.7)',
                          fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                          letterSpacing: '0.05em',
                        }}>{av.name}</span>
                      </motion.div>
                    )
                  })}
                </div>

                <motion.button
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAvatarModal(false)}
                  style={{
                    width: '100%', padding: '11px', borderRadius: '9px', cursor: 'pointer',
                    background: 'transparent', border: '1px solid rgba(245,184,0,0.18)',
                    color: 'rgba(232,213,176,0.75)', fontSize: '13px',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >Close</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
      `}</style>
    </div>
  )
}