import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getProfile, updateProfile, deleteAccount } from '../store/slices/userSlice'
import { logoutUser } from '../store/slices/authSlice'
import toast, { Toaster } from 'react-hot-toast'

// ─── Constants ────────────────────────────────────────────────────────────────
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

const OFFLINE_GAMES_KEY = 'nqueens_offline_games'

const TIER_COLORS = {
  gold:   { bg: 'rgba(245,184,0,0.12)',   text: '#F5B800', border: 'rgba(245,184,0,0.3)'   },
  silver: { bg: 'rgba(192,192,192,0.1)',  text: '#C0C0C0', border: 'rgba(192,192,192,0.25)' },
  bronze: { bg: 'rgba(205,127,50,0.12)',  text: '#CD7F32', border: 'rgba(205,127,50,0.25)'  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const formatTime = (seconds) => {
  if (!seconds) return 'N/A'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

const formatTimeShort = (s) => {
  if (!s || s === 0) return '0:00'
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}

const getDifficulty = (size) => {
  if (size <= 6)  return { label: 'Easy',   color: '#4ADE80' }
  if (size <= 10) return { label: 'Medium', color: '#F5B800' }
  if (size <= 14) return { label: 'Hard',   color: '#FF8A8A' }
  return                  { label: 'Expert', color: '#C084FC' }
}

const getStoredGames = () => {
  try {
    const s = localStorage.getItem(OFFLINE_GAMES_KEY)
    return s ? Object.values(JSON.parse(s)) : []
  } catch { return [] }
}

const getCurrentLocalUser = () => {
  try {
    const s = localStorage.getItem('user')
    return s ? JSON.parse(s) : null
  } catch { return null }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
        background: `${accent}15`, border: `1px solid ${accent}30`,
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
          boxSizing: 'border-box', transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = 'rgba(245,184,0,0.45)' }}
        onBlur={e  => { e.target.style.borderColor = 'rgba(245,184,0,0.18)' }}
      />
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '10px 12px', borderRadius: '10px',
      background: 'rgba(255,255,255,0.02)',
      borderBottom: '1px solid rgba(245,184,0,0.05)',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
        background: 'rgba(245,184,0,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', color: '#F5B800',
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '11px', color: 'rgba(184,150,122,0.6)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: '#FAF7F0' }}>{value}</div>
      </div>
    </div>
  )
}

// ─── NEW: XP Level Bar ────────────────────────────────────────────────────────
function XPBar({ level, xp, maxXP = 1000 }) {
  const pct = Math.min(100, (xp / maxXP) * 100)
  return (
    <div style={{ maxWidth: '380px', width: '100%' }}>
      {/* Level badge + label row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '7px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #C41E1E, #8B0000)',
            border: '1px solid rgba(196,30,30,0.5)',
            borderRadius: '8px', padding: '3px 10px',
            fontFamily: "'Cinzel', serif", fontSize: '12px',
            fontWeight: 700, color: '#FFD700',
            boxShadow: '0 2px 8px rgba(196,30,30,0.35)',
          }}>Lv {level}</div>
          <span style={{
            fontSize: '11px', color: 'rgba(245,184,0,0.6)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>Progress</span>
        </div>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px', color: '#F5B800',
        }}>{xp} / {maxXP} XP</span>
      </div>

      {/* Bar */}
      <div style={{
        height: '9px', borderRadius: '999px',
        background: 'rgba(255,255,255,0.07)', overflow: 'hidden',
        border: '1px solid rgba(245,184,0,0.08)',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          style={{
            height: '100%', borderRadius: '999px',
            background: 'linear-gradient(90deg, #C41E1E, #F5B800, #FFD700)',
            position: 'relative',
          }}
        >
          {/* Shine streak */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '30%', height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2))',
            borderRadius: '999px',
          }} />
        </motion.div>
      </div>

      <div style={{
        fontSize: '10px', color: 'rgba(184,150,122,0.45)',
        marginTop: '4px', textAlign: 'right',
      }}>{maxXP - xp} XP to Level {level + 1}</div>
    </div>
  )
}

// ─── NEW: Recent Activity Feed ────────────────────────────────────────────────
function RecentActivityFeed({ userId, username }) {
  const [games, setGames] = useState([])

  useEffect(() => {
    try {
      const all  = getStoredGames()
      const mine = all
        .filter(g => g.userId === userId || g.username === username)
        .filter(g => g.completedAt)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 6)
      setGames(mine)
    } catch { setGames([]) }
  }, [userId, username])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.45 }}
      style={{
        background: 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: '1px solid rgba(245,184,0,0.1)',
        borderRadius: '14px', padding: '22px',
        marginBottom: '20px',
      }}
    >
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: '14px',
        fontWeight: 600, color: '#FAF7F0', marginBottom: '16px',
        letterSpacing: '0.04em', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>🕐 Recent Activity</span>
        {/* Pulsing live dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80',
            }}
          />
          <span style={{ fontSize: '11px', color: '#4ADE80', fontFamily: "'DM Sans', sans-serif" }}>
            Updated live
          </span>
        </div>
      </div>

      {games.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 0' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.3 }}>♟</div>
          <p style={{ fontSize: '13px', color: 'rgba(184,150,122,0.55)' }}>
            No games yet — activity will appear here as you play.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {games.map((g, i) => {
            const diff   = getDifficulty(g.boardSize || g.n || 8)
            const won    = g.solved || g.completed
            const timeAgo = g.completedAt
              ? (() => {
                  const mins  = Math.floor((Date.now() - new Date(g.completedAt)) / 60000)
                  if (mins < 60)   return `${mins}m ago`
                  const hrs = Math.floor(mins / 60)
                  if (hrs  < 24)   return `${hrs}h ago`
                  return `${Math.floor(hrs / 24)}d ago`
                })()
              : ''

            return (
              <motion.div
                key={g.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(245,184,0,0.06)',
                }}
              >
                {/* Result icon */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '9px', flexShrink: 0,
                  background: won ? 'rgba(74,222,128,0.1)' : 'rgba(196,30,30,0.1)',
                  border: `1px solid ${won ? 'rgba(74,222,128,0.2)' : 'rgba(196,30,30,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px',
                }}>{won ? '✓' : '✗'}</div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    marginBottom: '3px', flexWrap: 'wrap',
                  }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '13px', fontWeight: 600, color: '#FAF7F0',
                    }}>{g.boardSize || g.n || 8}×{g.boardSize || g.n || 8}</span>

                    <span style={{
                      padding: '1px 7px', borderRadius: '4px', fontSize: '10px',
                      fontWeight: 600, color: diff.color,
                      background: `${diff.color}15`,
                      border: `1px solid ${diff.color}30`,
                    }}>{diff.label}</span>

                    <span style={{
                      padding: '1px 7px', borderRadius: '4px', fontSize: '10px',
                      color: 'rgba(96,165,250,0.8)',
                      background: 'rgba(96,165,250,0.08)',
                      border: '1px solid rgba(96,165,250,0.18)',
                      textTransform: 'capitalize',
                    }}>{g.mode || 'classic'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(184,150,122,0.6)' }}>
                      ⏱ {formatTimeShort(g.timeElapsed || 0)}
                    </span>
                    {g.score > 0 && (
                      <span style={{ fontSize: '11px', color: 'rgba(245,184,0,0.7)' }}>
                        🏆 {g.score.toLocaleString()} pts
                      </span>
                    )}
                  </div>
                </div>

                {/* Time ago */}
                <div style={{
                  fontSize: '11px', color: 'rgba(184,150,122,0.45)',
                  flexShrink: 0, textAlign: 'right',
                }}>{timeAgo}</div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

// ─── NEW: Achievement Showcase ────────────────────────────────────────────────
function AchievementShowcase({ profileStats }) {
  const earned = []

  const totalGames = profileStats?.totalGames || 0
  const fastestTime = profileStats?.fastestSolveTime || 0
  const highestBoard = profileStats?.highestBoardSizeSolved || 0

  if (totalGames >= 1)
    earned.push({ icon: '🎯', name: 'First Step',       tier: 'bronze', desc: 'Played your first game'          })
  if (totalGames >= 10)
    earned.push({ icon: '♟', name: 'Dedicated',         tier: 'bronze', desc: '10 games played'                 })
  if (totalGames >= 50)
    earned.push({ icon: '⚔', name: 'Veteran',           tier: 'silver', desc: '50 games played'                 })
  if (fastestTime > 0 && fastestTime < 180)
    earned.push({ icon: '⚡', name: 'Speed Demon',       tier: 'gold',   desc: `Solved in ${formatTime(fastestTime)}` })
  if (fastestTime > 0 && fastestTime < 60)
    earned.push({ icon: '💨', name: 'Lightning Fast',    tier: 'gold',   desc: 'Solved in under 1 minute'        })
  if (highestBoard >= 8)
    earned.push({ icon: '♛', name: 'Classic Master',    tier: 'silver', desc: 'Solved an 8×8 board'             })
  if (highestBoard >= 10)
    earned.push({ icon: '🧠', name: 'Strategist',        tier: 'silver', desc: 'Solved a 10×10 board'            })
  if (highestBoard >= 12)
    earned.push({ icon: '👑', name: 'Grandmaster',       tier: 'gold',   desc: 'Solved a 12×12 board'            })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.45 }}
      style={{
        background: 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: '1px solid rgba(245,184,0,0.1)',
        borderRadius: '14px', padding: '22px',
        marginBottom: '20px',
      }}
    >
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: '14px',
        fontWeight: 600, color: '#FAF7F0', marginBottom: '16px',
        letterSpacing: '0.04em', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>🏆 Achievement Showcase</span>
        <span style={{
          padding: '3px 10px', borderRadius: '999px',
          background: 'rgba(245,184,0,0.1)',
          border: '1px solid rgba(245,184,0,0.2)',
          fontSize: '11px', color: '#F5B800',
          fontFamily: "'DM Sans', sans-serif",
        }}>{earned.length} earned</span>
      </div>

      {earned.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: '32px', opacity: 0.3, marginBottom: '8px' }}>🏆</div>
          <p style={{ fontSize: '13px', color: 'rgba(184,150,122,0.55)' }}>
            Play games to unlock achievements!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '10px',
        }}>
          {earned.map((a, i) => {
            const tc = TIER_COLORS[a.tier] || TIER_COLORS.bronze
            return (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 20 }}
                whileHover={{ y: -3, borderColor: tc.border }}
                style={{
                  padding: '14px', borderRadius: '12px',
                  background: tc.bg,
                  border: `1px solid ${tc.border}`,
                  textAlign: 'center', cursor: 'default',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{a.icon}</div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
                  fontWeight: 600, color: tc.text, marginBottom: '3px',
                }}>{a.name}</div>
                <div style={{
                  fontSize: '10px', color: 'rgba(184,150,122,0.65)', lineHeight: 1.4,
                }}>{a.desc}</div>
                <div style={{
                  marginTop: '8px', display: 'inline-block',
                  padding: '2px 8px', borderRadius: '999px',
                  background: 'rgba(0,0,0,0.25)',
                  fontSize: '9px', fontWeight: 700,
                  color: tc.text, textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>{a.tier}</div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

// ─── Main Profile Component ───────────────────────────────────────────────────
export default function Profile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user: authUser }             = useSelector(s => s.auth)
  const { profile, loading, updateSuccess } = useSelector(s => s.user)

  const [isEditing,        setIsEditing]        = useState(false)
  const [showDeleteModal,  setShowDeleteModal]   = useState(false)
  const [showAvatarModal,  setShowAvatarModal]   = useState(false)
  const [deletePassword,   setDeletePassword]    = useState('')
  const [avatarUpdateKey,  setAvatarUpdateKey]   = useState(0)

  const [formData, setFormData] = useState({
    username: '', name: '', bio: '', avatar: '',
  })

  useEffect(() => { dispatch(getProfile()) }, [dispatch])

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        name:     profile.name     || '',
        bio:      profile.bio      || '',
        avatar:   profile.avatar   || '',
      })
    }
  }, [profile])

  useEffect(() => {
    if (updateSuccess) {
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    }
  }, [updateSuccess])

  const handleChange = (e) =>
    setFormData(d => ({ ...d, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    await dispatch(updateProfile(formData))
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) { toast.error('Please enter your password'); return }
    const result = await dispatch(deleteAccount(deletePassword))
    if (result.type === 'user/deleteAccount/fulfilled') {
      toast.success('Account deleted successfully')
      await dispatch(logoutUser())
      navigate('/')
    }
  }

  const getCurrentAvatar = () => {
    if (!profile?.avatar) return null
    if (typeof profile.avatar === 'object') return profile.avatar
    try { return JSON.parse(profile.avatar) } catch { return null }
  }

  const handleAvatarSelect = async (avatar) => {
    try {
      await dispatch(updateProfile({ ...formData, avatar: JSON.stringify(avatar) })).unwrap()
      setAvatarUpdateKey(k => k + 1)
      toast.success('Avatar updated!')
      setShowAvatarModal(false)
    } catch (err) { toast.error(err || 'Failed to update avatar') }
  }

  const currentAvatar = getCurrentAvatar()

  // Derive XP / level from totalGames × 50 (fallback when backend stats load)
  const totalGames   = profile?.stats?.totalGames || 0
  const totalScore   = profile?.stats?.totalScore || (totalGames * 50)
  const level        = Math.floor(totalScore / 1000) + 1
  const xpInLevel    = totalScore % 1000

  // Local user for activity feed
  const localUser    = getCurrentLocalUser()
  const activityId   = localUser?.id   || authUser?.id
  const activityName = localUser?.username || localUser?.name || profile?.username || ''

  if (loading && !profile) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0C0505',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid rgba(245,184,0,0.2)',
          borderTopColor: '#F5B800', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

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

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* ── PROFILE HEADER ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: 'linear-gradient(135deg, #1E1010, #160A0A)',
            border: '1px solid rgba(245,184,0,0.12)',
            borderRadius: '18px', padding: '24px 28px',
            marginBottom: '20px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <motion.div
                key={`avatar-${avatarUpdateKey}`}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAvatarModal(true)}
                style={{
                  width: '88px', height: '88px', borderRadius: '22px',
                  background: currentAvatar?.color || 'linear-gradient(135deg, #5A3A1A, #3A1E0A)',
                  border: '2px solid rgba(245,184,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '40px', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {currentAvatar?.emoji || '♛'}
                <motion.div
                  initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: '20px',
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                  }}
                >📷</motion.div>
              </motion.div>
            </div>

            {/* Name + XP bar */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(20px,4vw,28px)',
                fontWeight: 700, color: '#FAF7F0', marginBottom: '2px',
              }}>
                {profile?.name || profile?.username || 'Player'}
              </div>

              <div style={{
                fontSize: '13px', color: 'rgba(184,150,122,0.65)',
                marginBottom: profile?.bio ? '8px' : '14px',
              }}>
                @{profile?.username || '—'} · {profile?.email || '—'}
              </div>

              {profile?.bio && !isEditing && (
                <p style={{
                  fontSize: '13px', color: 'rgba(232,213,176,0.75)',
                  marginBottom: '14px', lineHeight: 1.6,
                  paddingBottom: '10px',
                  borderBottom: '1px solid rgba(245,184,0,0.08)',
                }}>{profile.bio}</p>
              )}

              {/* ── XP BAR (NEW) ── */}
              <XPBar level={level} xp={xpInLevel} />
            </div>

            {/* Edit button */}
            <motion.button
              whileHover={{ borderColor: 'rgba(245,184,0,0.4)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsEditing(v => !v)}
              style={{
                padding: '9px 20px', borderRadius: '8px', cursor: 'pointer',
                background: isEditing ? 'rgba(245,184,0,0.12)' : 'rgba(30,18,18,0.9)',
                border: `1px solid ${isEditing ? 'rgba(245,184,0,0.35)' : 'rgba(245,184,0,0.15)'}`,
                color: 'rgba(232,213,176,0.85)', fontSize: '13px',
                fontWeight: 500, transition: 'all 0.2s', flexShrink: 0,
              }}
            >{isEditing ? '✕ Cancel' : '✎ Edit Profile'}</motion.button>
          </div>
        </motion.div>

        {/* ── EDIT FORM ─────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isEditing && (
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
                }}>✎ Edit Profile</div>

                <form onSubmit={handleSubmit}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
                    gap: '14px', marginBottom: '14px',
                  }}>
                    <ThemedInput label="Username" icon="@" type="text" name="username"
                      value={formData.username} onChange={handleChange} required />
                    <ThemedInput label="Full Name" icon="👤" type="text" name="name"
                      value={formData.name} onChange={handleChange} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <ThemedInput label="Bio" icon="📝" type="text" name="bio"
                      value={formData.bio} onChange={handleChange}
                      placeholder="Tell us about yourself..." />
                    <div style={{
                      fontSize: '10px', color: 'rgba(184,150,122,0.5)',
                      marginTop: '4px', textAlign: 'right',
                    }}>{formData.bio.length}/200</div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      type="submit" disabled={loading}
                      style={{
                        padding: '9px 20px', borderRadius: '8px', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #C41E1E, #7D0D0D)',
                        border: '1px solid rgba(196,30,30,0.5)',
                        color: '#FAF7F0', fontSize: '13px', fontWeight: 600,
                      }}
                    >{loading ? 'Saving...' : '✓ Save Changes'}</motion.button>

                    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                      type="button" onClick={() => setIsEditing(false)}
                      style={{
                        padding: '9px 18px', borderRadius: '8px', cursor: 'pointer',
                        background: 'transparent', border: '1px solid rgba(245,184,0,0.18)',
                        color: 'rgba(232,213,176,0.75)', fontSize: '13px',
                      }}
                    >Cancel</motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STATS GRID ───────────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
          gap: '12px', marginBottom: '20px',
        }}>
          <StatCard icon="📅" label="Account Age"    value={`${profile?.accountAge || 0}d`}                                                   accent="#60A5FA" delay={0}    />
          <StatCard icon="♟" label="Total Games"    value={profile?.stats?.totalGames || 0}                                                    accent="#4ADE80" delay={0.05} />
          <StatCard icon="⏱" label="Fastest Time"   value={formatTime(profile?.stats?.fastestSolveTime)}                                       accent="#F5B800" delay={0.1}  />
          <StatCard icon="🎯" label="Highest Board"  value={`${profile?.stats?.highestBoardSizeSolved || 0}×${profile?.stats?.highestBoardSizeSolved || 0}`} accent="#C084FC" delay={0.15} />
          <StatCard icon="📊" label="Average Time"   value={formatTime(profile?.stats?.averageSolveTime)}                                       accent="#FF8A8A" delay={0.2}  />
          <StatCard icon="💡" label="Hints Used"     value={profile?.stats?.totalHintsUsed || 0}                                               accent="#38BDF8" delay={0.25} />
        </div>

        {/* ── ACHIEVEMENT SHOWCASE (NEW) ────────────────────────────────────── */}
        <AchievementShowcase profileStats={profile?.stats} />

        {/* ── RECENT ACTIVITY FEED (NEW) ───────────────────────────────────── */}
        <RecentActivityFeed userId={activityId} username={activityName} />

        {/* ── ACCOUNT INFO ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
          style={{
            background: 'linear-gradient(135deg, #1E1010, #160A0A)',
            border: '1px solid rgba(245,184,0,0.1)',
            borderRadius: '14px', padding: '22px',
            marginBottom: '20px',
          }}
        >
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: '14px',
            fontWeight: 600, color: '#FAF7F0', marginBottom: '16px',
            letterSpacing: '0.04em',
          }}>📋 Account Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <InfoRow icon="✉" label="Email"        value={profile?.email                        || '—'} />
            <InfoRow icon="📅" label="Member Since" value={formatDate(profile?.createdAt)}               />
            <InfoRow icon="⏱" label="Last Login"   value={formatDate(profile?.lastLogin)}                />
          </div>
        </motion.div>

        {/* ── QUICK ACTIONS ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          style={{
            background: 'linear-gradient(135deg, #1E1010, #160A0A)',
            border: '1px solid rgba(245,184,0,0.1)',
            borderRadius: '14px', padding: '22px',
          }}
        >
          <div style={{
            fontFamily: "'Cinzel', serif", fontSize: '14px',
            fontWeight: 600, color: '#FAF7F0', marginBottom: '16px',
            letterSpacing: '0.04em',
          }}>⚡ Quick Actions</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: '📊', label: 'View Detailed Statistics', fn: () => navigate('/stats'),       border: '#F5B80044' },
              { icon: '🏆', label: 'View Leaderboard',         fn: () => navigate('/leaderboard'), border: '#F5B80044' },
              { icon: '🎖', label: 'All Achievements',          fn: () => navigate('/achievements'), border: '#F5B80044' },
              { icon: '📊', label: 'Analytics Dashboard',      fn: () => navigate('/analytics'),   border: '#60A5FA44' },
            ].map(a => (
              <motion.button
                key={a.label}
                whileHover={{ x: 4, borderColor: a.border }}
                whileTap={{ scale: 0.98 }}
                onClick={a.fn}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(245,184,0,0.08)',
                  color: 'rgba(232,213,176,0.85)', fontSize: '13px',
                  fontWeight: 500, textAlign: 'left', width: '100%',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '18px' }}>{a.icon}</span>
                <span style={{ flex: 1 }}>{a.label}</span>
                <span style={{ color: 'rgba(184,150,122,0.4)' }}>→</span>
              </motion.button>
            ))}

            {/* Danger zone */}
            <motion.button
              whileHover={{ x: 4, borderColor: '#C41E1E66' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteModal(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '10px', cursor: 'pointer',
                background: 'rgba(196,30,30,0.05)',
                border: '1px solid rgba(196,30,30,0.15)',
                color: '#FF8A8A', fontSize: '13px',
                fontWeight: 500, textAlign: 'left', width: '100%',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '18px' }}>🗑</span>
              <span style={{ flex: 1 }}>Delete Account</span>
              <span style={{ color: 'rgba(196,30,30,0.4)' }}>→</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ── AVATAR MODAL ─────────────────────────────────────────────────────── */}
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
                  fontWeight: 700, color: '#FAF7F0', marginBottom: '20px', letterSpacing: '0.04em',
                }}>🎭 Choose Your Avatar</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
                  {AVATARS.map(av => {
                    const isSelected = currentAvatar?.id === av.id
                    return (
                      <motion.div
                        key={av.id}
                        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleAvatarSelect(av)}
                        style={{
                          aspectRatio: '1', borderRadius: '12px', background: av.color,
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
                          fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: '0.05em',
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

      {/* ── DELETE ACCOUNT MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
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
                border: '1px solid rgba(196,30,30,0.3)',
                borderRadius: '18px', overflow: 'hidden',
                boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ height: '3px', background: 'linear-gradient(90deg, #C41E1E, #FF4444, #C41E1E)' }} />
              <div style={{ padding: '26px 28px' }}>
                <div style={{
                  fontFamily: "'Cinzel', serif", fontSize: '17px',
                  fontWeight: 700, color: '#FF8A8A', marginBottom: '12px',
                  letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '8px',
                }}>⚠️ Delete Account</div>

                <p style={{
                  fontSize: '13px', color: 'rgba(232,213,176,0.7)',
                  marginBottom: '20px', lineHeight: 1.5,
                }}>
                  This action cannot be undone. All your data will be permanently deleted.
                </p>

                <ThemedInput
                  label="Confirm Password" icon="🔐" type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="Enter your password to confirm"
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <motion.button
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setShowDeleteModal(false)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '9px', cursor: 'pointer',
                      background: 'rgba(30,18,18,0.9)',
                      border: '1px solid rgba(245,184,0,0.18)',
                      color: 'rgba(232,213,176,0.75)', fontSize: '13px',
                    }}
                  >Cancel</motion.button>

                  <motion.button
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    onClick={handleDeleteAccount}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '9px', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #C41E1E, #7D0D0D)',
                      border: '1px solid rgba(196,30,30,0.5)',
                      color: '#FAF7F0', fontSize: '13px', fontWeight: 600,
                    }}
                  >🗑 Delete Account</motion.button>
                </div>
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