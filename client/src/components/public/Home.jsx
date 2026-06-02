import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import axios from 'axios'

// ─── 8-Queens valid solution positions ────────────────────────────────────────
const QUEEN_POSITIONS = [
  [0,0],[1,4],[2,7],[3,5],[4,2],[5,6],[6,1],[7,3]
]
const QUEEN_SET = new Set(QUEEN_POSITIONS.map(([r,c]) => `${r}-${c}`))

// ─── Reusable animation variants ─────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }
  })
}
const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }
  })
}
const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: (delay = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay }
  })
}

// ─── Animated number counter ─────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

// ─── Live activity ticker data + component ────────────────────────────────────
const ACTIVITY_MESSAGES = [
  { icon: '♛', text: 'QueenMaster solved 8×8 in 34s', color: '#F5B800' },
  { icon: '🏆', text: 'ChessWizard won a multiplayer match', color: '#60A5FA' },
  { icon: '🔥', text: 'PuzzleKing reached a 30-day streak', color: '#FF8A8A' },
  { icon: '⚡', text: 'RoyalSolver completed the daily challenge', color: '#4ADE80' },
  { icon: '🎖', text: 'BoardHero unlocked the "Grandmaster" badge', color: '#F5B800' },
  { icon: '♛', text: 'NightOwl solved 12×12 — new personal best', color: '#C084FC' },
  { icon: '🏆', text: 'StrategyKing won a tournament bracket', color: '#60A5FA' },
  { icon: '⚡', text: 'LogicPro solved 10×10 with no hints', color: '#4ADE80' },
]

function ActivityTicker() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentIndex(i => (i + 1) % ACTIVITY_MESSAGES.length)
        setVisible(true)
      }, 400)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  const entry = ACTIVITY_MESSAGES[currentIndex]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 20px', borderRadius: '999px',
      background: 'rgba(30,18,18,0.8)',
      border: '1px solid rgba(245,184,0,0.12)',
      backdropFilter: 'blur(12px)',
      minWidth: 0,
    }}>
      {/* Pulsing live dot */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', inset: '-3px',
            borderRadius: '50%', background: '#4ADE80', opacity: 0.4,
          }}
        />
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#4ADE80', position: 'relative',
        }} />
      </div>

      {/* Live label */}
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: '11px',
        fontWeight: 600, color: '#4ADE80', flexShrink: 0,
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>Live</span>

      <div style={{
        width: '1px', height: '14px', flexShrink: 0,
        background: 'rgba(245,184,0,0.15)',
      }} />

      {/* Activity message — cross-fades */}
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
              color: 'rgba(232,213,176,0.85)', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}
          >
            <span style={{ fontSize: '14px', flexShrink: 0 }}>{entry.icon}</span>
            <span>{entry.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Section wrapper — triggers animations when scrolled into view ─────────────
function ScrollReveal({ children, className = '', delay = 0, variant = fadeUp }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={delay}
      variants={variant}
    >
      {children}
    </motion.div>
  )
}

// ─── Animated chess board ─────────────────────────────────────────────────────
function HeroBoard() {
  const [placedQueens, setPlacedQueens] = useState([])
  const [hoveredCell, setHoveredCell] = useState(null)

  // Stagger queen placements on mount
  useEffect(() => {
    QUEEN_POSITIONS.forEach(([r, c], i) => {
      setTimeout(() => {
        setPlacedQueens(prev => [...prev, `${r}-${c}`])
      }, 300 + i * 220)
    })
  }, [])

  // Compute attack diagonals for placed queens (for glow lines)
  const isAttacked = (r, c) => {
    for (const [qr, qc] of QUEEN_POSITIONS) {
      if (!placedQueens.includes(`${qr}-${qc}`)) continue
      if (qr === r || qc === c) return true
      if (Math.abs(qr - r) === Math.abs(qc - c)) return true
    }
    return false
  }

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.85, rotateY: -8 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
    >
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-lg pointer-events-none"
        style={{
          boxShadow: '0 0 60px rgba(196,30,30,0.25), 0 0 120px rgba(196,30,30,0.1)',
          borderRadius: '8px'
        }}
      />
      {/* Board border frame */}
      <div style={{
        background: 'linear-gradient(135deg, #5A3A3A, #3A1E1E)',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 16px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(245,184,0,0.15)'
      }}>
        {/* Rank labels */}
        <div className="flex">
          <div style={{ width: '18px' }} />
          {['a','b','c','d','e','f','g','h'].map(f => (
            <div key={f} style={{
              flex: 1, textAlign: 'center', fontSize: '9px', fontFamily: "'DM Sans', sans-serif",
              color: 'rgba(245,184,0,0.5)', marginBottom: '4px', letterSpacing: '0.05em'
            }}>{f}</div>
          ))}
        </div>
        {/* Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {Array(8).fill(null).map((_, row) => (
            <div key={row} style={{ display: 'flex', alignItems: 'center' }}>
              {/* File label */}
              <div style={{
                width: '18px', fontSize: '9px', fontFamily: "'DM Sans', sans-serif",
                color: 'rgba(245,184,0,0.5)', textAlign: 'center', flexShrink: 0
              }}>{8 - row}</div>
              {Array(8).fill(null).map((_, col) => {
                const key = `${row}-${col}`
                const isLight = (row + col) % 2 === 0
                const hasQueen = QUEEN_SET.has(key)
                const isPlaced = placedQueens.includes(key)
                const isHovered = hoveredCell === key
                const attacked = hoveredCell && isAttacked(row, col)

                return (
                  <motion.div
                    key={col}
                    onMouseEnter={() => setHoveredCell(key)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={{
                      width: 52, height: 52,
                      backgroundColor: attacked
                        ? 'rgba(196,30,30,0.35)'
                        : isHovered
                        ? 'rgba(245,184,0,0.25)'
                        : isLight ? '#3D2B2B' : '#1E1212',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'default', position: 'relative',
                      transition: 'background-color 0.15s',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (row * 8 + col) * 0.008, duration: 0.3 }}
                  >
                    {/* Valid solution highlight dot */}
                    {!hasQueen && (
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        backgroundColor: isLight
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(255,255,255,0.03)'
                      }} />
                    )}

                    {/* Queen */}
                    {hasQueen && (
                      <AnimatePresence>
                        {isPlaced && (
                          <motion.div
                            key={key}
                            initial={{ y: -48, scale: 1.4, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            transition={{
                              type: 'spring', stiffness: 340, damping: 22
                            }}
                            style={{
                              fontSize: '26px', lineHeight: 1,
                              filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.7))',
                              userSelect: 'none',
                              color: isLight ? '#FAF7F0' : '#E8D5B0',
                            }}
                          >
                            ♛
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Board label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4, duration: 0.5 }}
        style={{
          textAlign: 'center', marginTop: '10px',
          fontSize: '11px', fontFamily: "'DM Sans', sans-serif",
          color: 'rgba(245,184,0,0.55)', letterSpacing: '0.12em',
          textTransform: 'uppercase'
        }}
      >
        8 × 8 — Valid Solution
      </motion.div>
    </motion.div>
  )
}

// ─── Floating stat pill ───────────────────────────────────────────────────────
function StatPill({ icon, number, label, delay }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 18px', borderRadius: '999px',
        background: 'rgba(42,32,32,0.8)',
        border: '1px solid rgba(245,184,0,0.15)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      <div>
        <div style={{
          fontFamily: "'Cinzel', serif", fontSize: '18px',
          fontWeight: 700, color: '#F5B800', lineHeight: 1
        }}>{number}</div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: '10px',
          color: 'rgba(250,247,240,0.45)', textTransform: 'uppercase',
          letterSpacing: '0.1em', marginTop: '1px'
        }}>{label}</div>
      </div>
    </motion.div>
  )
}

// ─── Feature card data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '♔',
    title: 'Classic Mode',
    description: 'Place N queens on an N×N board so none attack each other. Choose board sizes from 4×4 up to 12×12.',
    badge: 'Free',
    badgeColor: 'rgba(34,197,94,0.15)',
    badgeText: '#4ADE80',
    link: '/board-size-selector',
    linkLabel: 'Play Classic',
    accentColor: '#C41E1E',
  },
  {
    icon: '📅',
    title: 'Daily Challenge',
    description: 'A new hand-crafted puzzle every day. Compete with players worldwide and climb the daily leaderboard.',
    badge: 'Daily',
    badgeColor: 'rgba(245,184,0,0.15)',
    badgeText: '#F5B800',
    link: '/daily-challenge',
    linkLabel: 'Today\'s Puzzle',
    accentColor: '#F5B800',
  },
  {
    icon: '⚔',
    title: 'Multiplayer',
    description: 'Race against real opponents in real-time. First to place all queens correctly wins the match.',
    badge: 'Live',
    badgeColor: 'rgba(59,130,246,0.15)',
    badgeText: '#60A5FA',
    link: '/multiplayer/home',
    linkLabel: 'Find Match',
    accentColor: '#3B82F6',
  },
  {
    icon: '🏆',
    title: 'Tournaments',
    description: 'Join scheduled tournaments, climb brackets, and earn exclusive badges and XP rewards.',
    badge: 'Weekly',
    badgeColor: 'rgba(196,30,30,0.15)',
    badgeText: '#FF8A8A',
    link: '/tournaments',
    linkLabel: 'View Brackets',
    accentColor: '#E63939',
  },
]

// ─── How-it-works steps ───────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    n: '01',
    title: 'Choose Your Board',
    desc: 'Pick a board size from 4×4 (beginner) to 12×12 (grandmaster). Each size is a new strategic challenge.',
    icon: '⬛',
  },
  {
    n: '02',
    title: 'Place the Queens',
    desc: 'Click any cell to place a queen. The board highlights attacks in red so you can see conflicts instantly.',
    icon: '♛',
  },
  {
    n: '03',
    title: 'No Attacks Allowed',
    desc: 'Each row, column, and diagonal can hold only one queen. Find the arrangement where no queen threatens another.',
    icon: '🛡',
  },
  {
    n: '04',
    title: 'Earn & Compete',
    desc: 'Complete puzzles faster to earn more XP, unlock achievements, and rise through the global leaderboard.',
    icon: '🏆',
  },
]

// ─── Main Home component ──────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector(s => s.auth)
  const [leaderboard, setLeaderboard] = useState([])
  const [lbLoading, setLbLoading] = useState(true)

  // Fetch top leaderboard entries
  useEffect(() => {
    const fetchLb = async () => {
      try {
        const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const { data } = await axios.get(`${API}/api/leaderboard?limit=5&type=classic`)
        setLeaderboard(data.entries || data.data || [])
      } catch {
        // Fallback placeholder data for development
        setLeaderboard([
          { rank: 1, username: 'QueenMaster', score: 9840, solved: 342 },
          { rank: 2, username: 'ChessWizard', score: 8720, solved: 298 },
          { rank: 3, username: 'PuzzleKing', score: 7650, solved: 261 },
          { rank: 4, username: 'RoyalSolver', score: 6430, solved: 219 },
          { rank: 5, username: 'BoardHero',   score: 5890, solved: 195 },
        ])
      } finally {
        setLbLoading(false)
      }
    }
    fetchLb()
  }, [])

  const RANK_COLORS = ['#F5B800', '#C0C0C0', '#CD7F32', 'rgba(250,247,240,0.5)', 'rgba(250,247,240,0.4)']
  const RANK_ICONS  = ['♛', '♜', '♝', '♟', '♟']

  return (
    <div style={{
      background: '#0C0505',
      backgroundImage: `
        radial-gradient(ellipse at 20% 10%, rgba(196,30,30,0.09) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 90%, rgba(100,8,8,0.12) 0%, transparent 50%)
      `,
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 48px)',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(32px, 6vw, 80px)', alignItems: 'center',
      }}
        className="hero-grid"
      >
        {/* Left — text */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {/* Crown badge */}
          <motion.div variants={fadeUp} custom={0} style={{ marginBottom: '20px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: '999px',
              background: 'rgba(196,30,30,0.12)',
              border: '1px solid rgba(196,30,30,0.35)',
              fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
              fontWeight: 500, color: '#FF8A8A',
              letterSpacing: '0.04em',
            }}>
              ♛ Classic Strategy Puzzle
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1 variants={fadeUp} custom={0.1} style={{
            fontFamily: "'Cinzel', serif", fontWeight: 700,
            fontSize: 'clamp(36px, 5vw, 64px)',
            lineHeight: 1.1, letterSpacing: '0.02em',
            color: '#FAF7F0', marginBottom: '8px',
          }}>
            N-Queens
          </motion.h1>
          <motion.h1 variants={fadeUp} custom={0.2} style={{
            fontFamily: "'Cinzel', serif", fontWeight: 700,
            fontSize: 'clamp(36px, 5vw, 64px)',
            lineHeight: 1.1, letterSpacing: '0.02em',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #FFD700, #F5B800, #D4A017)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Challenge
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} custom={0.3} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(15px, 2vw, 17px)',
            color: 'rgba(232,213,176,0.8)', lineHeight: 1.75,
            maxWidth: '460px', marginBottom: '36px',
          }}>
            The timeless chess puzzle that has fascinated mathematicians for centuries.
            Place queens so none can attack another — elegant logic, infinite depth.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={fadeUp} custom={0.4}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}
          >
            <motion.button
              onClick={() => navigate('/board-size-selector')}
              whileHover={{ y: -2, boxShadow: '0 0 28px rgba(196,30,30,0.55)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #E63939, #7D0D0D)',
                border: '1px solid rgba(196,30,30,0.5)',
                color: '#FAF7F0', fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 16px rgba(196,30,30,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                transition: 'box-shadow 0.2s',
              }}
            >
              ▶ &nbsp;Start Playing
            </motion.button>

            <motion.button
              onClick={() => navigate('/tutorial')}
              whileHover={{ y: -2, borderColor: 'rgba(245,184,0,0.45)', color: '#FAF7F0' }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', borderRadius: '8px',
                background: 'transparent',
                border: '1px solid rgba(245,184,0,0.2)',
                color: 'rgba(232,213,176,0.8)',
                fontFamily: "'DM Sans', sans-serif", fontSize: '15px',
                fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              📖 &nbsp;How to Play
            </motion.button>

            {isAuthenticated && (
              <motion.button
                onClick={() => navigate('/daily-challenge')}
                whileHover={{ y: -2, boxShadow: '0 0 20px rgba(245,184,0,0.35)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 28px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                  border: '1px solid rgba(245,184,0,0.4)',
                  color: '#1A0800', fontFamily: "'Cinzel', serif",
                  fontSize: '13px', fontWeight: 600,
                  letterSpacing: '0.04em', cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(245,184,0,0.25)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                ♛ &nbsp;Daily Puzzle
              </motion.button>
            )}
          </motion.div>

          {/* Stats pills */}
          <motion.div
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
          >
            <StatPill icon="♟" number="∞"    label="Puzzles"     delay={0.5} />
            <StatPill icon="⚔" number="4–12" label="Board Sizes" delay={0.6} />
            <StatPill icon="🏆" number="Live"  label="Multiplayer" delay={0.7} />
          </motion.div>
        </motion.div>

        {/* Right — animated board */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <HeroBoard />
        </div>
      </section>

      {/* ── GOLD RULE ──────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 clamp(20px,5vw,48px)',
      }}>
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(245,184,0,0.3), transparent)',
        }} />
      </div>

      {/* ── PLATFORM STATS STRIP ──────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: 'clamp(40px,6vw,64px) clamp(20px,5vw,48px)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1px',
            background: 'rgba(245,184,0,0.08)',
            border: '1px solid rgba(245,184,0,0.1)',
            borderRadius: '16px', overflow: 'hidden',
          }}
        >
          {[
            { value: 48200, suffix: '+', label: 'Players Worldwide',  icon: '👑', delay: 0 },
            { value: 1250000, suffix: '+', label: 'Puzzles Solved',   icon: '♛', delay: 0.1 },
            { value: 340,   suffix: 'K+', label: 'Games Played',      icon: '⚔', delay: 0.2 },
            { value: 99,    suffix: '%',  label: 'Uptime',             icon: '⚡', delay: 0.3 },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: stat.delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              style={{
                padding: 'clamp(24px,4vw,36px) clamp(16px,3vw,28px)',
                background: 'linear-gradient(135deg, #1E1010, #160A0A)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center', gap: '8px',
              }}
            >
              {/* Icon */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: 'rgba(196,30,30,0.12)',
                border: '1px solid rgba(196,30,30,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', marginBottom: '4px',
              }}>{stat.icon}</div>

              {/* Animated number */}
              <div style={{
                fontFamily: "'Cinzel', serif", fontSize: 'clamp(26px,4vw,38px)',
                fontWeight: 700, lineHeight: 1,
                background: 'linear-gradient(135deg, #FFD700, #F5B800)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} duration={1800} />
              </div>

              {/* Label */}
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
                fontWeight: 500, color: 'rgba(184,150,122,0.7)',
                textTransform: 'uppercase', letterSpacing: '0.1em',
              }}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── DIVIDER ────────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 clamp(20px,5vw,48px)' }}>
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(245,184,0,0.2), transparent)',
        }} />
      </div>

      {/* ── LIVE ACTIVITY STRIP ───────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 clamp(20px,5vw,48px) clamp(32px,5vw,48px)',
      }}>
        <ScrollReveal>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            padding: '18px 24px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #1A0E0E, #120808)',
            border: '1px solid rgba(196,30,30,0.2)',
          }}>
            {/* "Happening Now" label */}
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: '12px',
              fontWeight: 600, color: 'rgba(245,184,0,0.7)',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              flexShrink: 0,
            }}>Happening Now</div>

            <div style={{
              width: '1px', height: '20px', flexShrink: 0,
              background: 'rgba(245,184,0,0.15)',
            }} />

            {/* Ticker */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <ActivityTicker />
            </div>

            {/* Player count pill */}
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '7px 14px', borderRadius: '999px',
                background: 'rgba(74,222,128,0.08)',
                border: '1px solid rgba(74,222,128,0.2)',
                flexShrink: 0,
              }}
            >
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%', background: '#4ADE80',
              }} />
              <span style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
                fontWeight: 600, color: '#4ADE80',
              }}>
                <AnimatedCounter target={312} duration={1200} /> online
              </span>
            </motion.div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── GAME MODES ─────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: 'clamp(48px,8vw,80px) clamp(20px,5vw,48px)',
      }}>
        <ScrollReveal style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.14em',
            color: 'rgba(245,184,0,0.55)', marginBottom: '12px',
          }}>Choose Your Mode</div>
          <h2 style={{
            fontFamily: "'Cinzel', serif", fontSize: 'clamp(24px,4vw,38px)',
            fontWeight: 700, color: '#FAF7F0', letterSpacing: '0.02em',
            lineHeight: 1.2, marginBottom: '12px',
          }}>Four Ways to Play</h2>
          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '15px',
            color: 'rgba(232,213,176,0.6)', maxWidth: '480px', margin: '0 auto',
          }}>
            From solo puzzles to live tournaments — every mode sharpens a different skill.
          </p>
        </ScrollReveal>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {FEATURES.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.1} variant={scaleIn}>
              <motion.div
                whileHover={{ y: -6, borderColor: `${f.accentColor}55` }}
                onClick={() => navigate(f.link)}
                style={{
                  background: 'linear-gradient(135deg, #221818, #1A1010)',
                  border: '1px solid rgba(245,184,0,0.1)',
                  borderRadius: '14px', padding: '28px 24px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.45)',
                  transition: 'border-color 0.25s',
                  height: '100%', display: 'flex', flexDirection: 'column',
                }}
              >
                {/* Icon + badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '12px',
                    background: `${f.accentColor}18`,
                    border: `1px solid ${f.accentColor}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px',
                  }}>{f.icon}</div>
                  <span style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                    fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                    background: f.badgeColor, color: f.badgeText,
                    border: `1px solid ${f.badgeText}30`,
                  }}>{f.badge}</span>
                </div>

                <h3 style={{
                  fontFamily: "'Cinzel', serif", fontSize: '16px',
                  fontWeight: 600, color: '#FAF7F0', marginBottom: '10px',
                  letterSpacing: '0.02em',
                }}>{f.title}</h3>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                  color: 'rgba(184,150,122,0.85)', lineHeight: 1.65,
                  flex: 1, marginBottom: '20px',
                }}>{f.description}</p>

                {/* CTA link */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                  fontWeight: 600, color: f.badgeText,
                  letterSpacing: '0.02em',
                }}>
                  {f.linkLabel}
                  <motion.span
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                    style={{ display: 'inline-block' }}
                  >→</motion.span>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS + LEADERBOARD ─────────────────────────────────────── */}
      <section style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: 'clamp(32px,6vw,64px) clamp(20px,5vw,48px)',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 'clamp(24px,5vw,60px)',
      }}
        className="two-col-section"
      >
        {/* How it works */}
        <div>
          <ScrollReveal>
            <div style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.14em',
              color: 'rgba(245,184,0,0.55)', marginBottom: '10px',
            }}>How It Works</div>
            <h2 style={{
              fontFamily: "'Cinzel', serif", fontSize: 'clamp(20px,3vw,28px)',
              fontWeight: 700, color: '#FAF7F0', letterSpacing: '0.02em',
              lineHeight: 1.2, marginBottom: '32px',
            }}>From Zero to Queen in Four Steps</h2>
          </ScrollReveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {HOW_STEPS.map((s, i) => (
              <ScrollReveal key={s.n} delay={i * 0.1}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Number bubble */}
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(196,30,30,0.25), rgba(196,30,30,0.08))',
                    border: '1px solid rgba(196,30,30,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Cinzel', serif", fontSize: '13px',
                    fontWeight: 700, color: '#FF8A8A',
                  }}>{s.n}</div>
                  <div>
                    <div style={{
                      fontFamily: "'Cinzel', serif", fontSize: '14px',
                      fontWeight: 600, color: '#FAF7F0', marginBottom: '4px',
                    }}>{s.title}</div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                      color: 'rgba(184,150,122,0.8)', lineHeight: 1.6,
                    }}>{s.desc}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Live Leaderboard widget */}
        <div>
          <ScrollReveal delay={0.1}>
            <div style={{
              background: 'linear-gradient(135deg, #1E1414, #160E0E)',
              border: '1px solid rgba(245,184,0,0.15)',
              borderRadius: '14px', overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}>
              {/* Widget header */}
              <div style={{
                padding: '18px 20px',
                borderBottom: '1px solid rgba(245,184,0,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(196,30,30,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🏆</span>
                  <span style={{
                    fontFamily: "'Cinzel', serif", fontSize: '14px',
                    fontWeight: 600, color: '#FAF7F0', letterSpacing: '0.03em',
                  }}>Top Players</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#4ADE80',
                    }}
                  />
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: '11px',
                    color: '#4ADE80', fontWeight: 500,
                  }}>Live</span>
                </div>
              </div>

              {/* Leaderboard rows */}
              <div style={{ padding: '8px 0' }}>
                {lbLoading ? (
                  Array(5).fill(null).map((_, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 20px',
                    }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(90deg, #2A2020 25%, #362828 50%, #2A2020 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s linear infinite',
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          height: '12px', borderRadius: '6px', marginBottom: '6px',
                          background: 'linear-gradient(90deg, #2A2020 25%, #362828 50%, #2A2020 75%)',
                          backgroundSize: '200% 100%', animation: 'shimmer 1.5s linear infinite',
                          width: `${60 + i * 5}%`,
                        }} />
                      </div>
                    </div>
                  ))
                ) : (
                  leaderboard.map((entry, i) => (
                    <motion.div
                      key={entry.username || i}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '11px 20px',
                        borderLeft: i === 0 ? '3px solid #F5B800'
                          : i === 1 ? '3px solid #C0C0C0'
                          : i === 2 ? '3px solid #CD7F32'
                          : '3px solid transparent',
                        background: i === 0 ? 'rgba(245,184,0,0.04)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Rank icon */}
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        background: `${RANK_COLORS[i]}18`,
                        border: `1px solid ${RANK_COLORS[i]}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontFamily: "'Cinzel', serif",
                        color: RANK_COLORS[i], fontWeight: 700,
                      }}>
                        {i < 3 ? RANK_ICONS[i] : i + 1}
                      </div>

                      {/* Name */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                          fontWeight: 600, color: i === 0 ? '#F5B800' : '#FAF7F0',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{entry.username || `Player ${i+1}`}</div>
                        <div style={{
                          fontFamily: "'DM Sans', sans-serif", fontSize: '11px',
                          color: 'rgba(184,150,122,0.7)',
                        }}>{entry.solved || 0} solved</div>
                      </div>

                      {/* Score */}
                      <div style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
                        fontWeight: 500, color: RANK_COLORS[i],
                        flexShrink: 0,
                      }}>{(entry.score || 0).toLocaleString()}</div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* View full leaderboard */}
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid rgba(245,184,0,0.08)',
              }}>
                <motion.button
                  onClick={() => navigate('/leaderboard')}
                  whileHover={{ color: '#FAF7F0' }}
                  style={{
                    width: '100%', padding: '10px',
                    background: 'transparent',
                    border: '1px solid rgba(245,184,0,0.15)',
                    borderRadius: '8px', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                    fontWeight: 500, color: 'rgba(245,184,0,0.7)',
                    transition: 'color 0.15s, border-color 0.15s',
                    letterSpacing: '0.02em',
                  }}
                >
                  View Full Leaderboard →
                </motion.button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FINAL CTA BANNER ───────────────────────────────────────────────── */}
      <ScrollReveal>
        <section style={{
          maxWidth: '1200px', margin: '0 auto 80px',
          padding: '0 clamp(20px,5vw,48px)',
        }}>
          <motion.div
            whileHover={{ boxShadow: '0 0 60px rgba(196,30,30,0.2)' }}
            style={{
              background: 'linear-gradient(135deg, #2A1010 0%, #1A0A0A 50%, #200E0E 100%)',
              border: '1px solid rgba(196,30,30,0.35)',
              borderRadius: '18px', padding: 'clamp(32px,5vw,56px)',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              transition: 'box-shadow 0.3s',
            }}
          >
            {/* Decorative crown */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontSize: '48px', marginBottom: '16px',
                filter: 'drop-shadow(0 4px 16px rgba(245,184,0,0.4))',
              }}
            >♛</motion.div>

            <h2 style={{
              fontFamily: "'Cinzel', serif", fontWeight: 700,
              fontSize: 'clamp(22px,4vw,36px)',
              lineHeight: 1.2, marginBottom: '14px',
              background: 'linear-gradient(135deg, #FFD700, #F5B800, #D4A017)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '0.03em',
            }}>
              Ready to Claim Your Throne?
            </h2>
            <p style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(14px,2vw,16px)',
              color: 'rgba(232,213,176,0.65)', lineHeight: 1.7,
              maxWidth: '480px', margin: '0 auto 32px',
            }}>
              {isAuthenticated
                ? `Welcome back, ${user?.username || 'Champion'}. Your next challenge awaits.`
                : 'Join thousands of players. Create a free account and start earning XP today.'}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {isAuthenticated ? (
                <motion.button
                  onClick={() => navigate('/board-size-selector')}
                  whileHover={{ y: -2, boxShadow: '0 0 32px rgba(196,30,30,0.6)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '14px 32px', borderRadius: '8px', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #E63939, #7D0D0D)',
                    border: '1px solid rgba(196,30,30,0.5)',
                    color: '#FAF7F0', fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px', fontWeight: 600,
                    boxShadow: '0 4px 20px rgba(196,30,30,0.35)',
                    transition: 'box-shadow 0.2s',
                  }}
                >▶ &nbsp;Play Now</motion.button>
              ) : (
                <>
                  <motion.button
                    onClick={() => navigate('/signup')}
                    whileHover={{ y: -2, boxShadow: '0 0 28px rgba(245,184,0,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '14px 32px', borderRadius: '8px', cursor: 'pointer',
                      background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                      border: '1px solid rgba(245,184,0,0.4)',
                      color: '#1A0800', fontFamily: "'Cinzel', serif",
                      fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em',
                      boxShadow: '0 4px 20px rgba(245,184,0,0.25)',
                      transition: 'box-shadow 0.2s',
                    }}
                  >♛ &nbsp;Create Free Account</motion.button>

                  <motion.button
                    onClick={() => navigate('/board-size-selector')}
                    whileHover={{ y: -2, borderColor: 'rgba(196,30,30,0.5)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '14px 28px', borderRadius: '8px', cursor: 'pointer',
                      background: 'transparent',
                      border: '1px solid rgba(245,184,0,0.2)',
                      color: 'rgba(232,213,176,0.8)',
                      fontFamily: "'DM Sans', sans-serif", fontSize: '15px',
                      fontWeight: 500, transition: 'all 0.2s',
                    }}
                  >Play Without Account</motion.button>
                </>
              )}
            </div>
          </motion.div>
        </section>
      </ScrollReveal>

      {/* ── Shimmer keyframe for skeleton loaders ─────────────────────────── */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @media (max-width: 768px) {
          .hero-grid       { grid-template-columns: 1fr !important; }
          .two-col-section { grid-template-columns: 1fr !important; }
          .hero-grid > div:last-child { display: none; }
        }
      `}</style>
    </div>
  )
}