import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Constants ────────────────────────────────────────────────────────────────
const TOURNAMENT_STAGES = {
  ROUND_OF_16: 'Round of 16',
  QUARTERFINALS: 'Quarterfinals',
  SEMIFINALS: 'Semifinals',
  FINALS: 'Finals',
  COMPLETE: 'Complete',
}

// ─── Mock Tournament Data ──────────────────────────────────────────────────────
const MOCK_TOURNAMENT = {
  name: '🏆 Royal Chess Championship',
  players: 16,
  prize: '$10,000',
  stage: TOURNAMENT_STAGES.SEMIFINALS,
  startDate: '2026-06-01',
  endDate: '2026-06-15',
  
  rounds: [
    {
      name: 'Round of 16',
      matches: [
        {
          id: 1,
          p1: { name: 'ShadowKnight', level: 22, rating: 2380, avatar: '⚔' },
          p2: { name: 'GoldenPawn', level: 25, rating: 2520, avatar: '🏆' },
          winner: 'p1',
          status: 'completed',
          score: '3-0',
        },
        {
          id: 2,
          p1: { name: 'IceQueen', level: 23, rating: 2410, avatar: '💎' },
          p2: { name: 'PhantomRook', level: 21, rating: 2310, avatar: '🎭' },
          winner: 'p2',
          status: 'completed',
          score: '0-3',
        },
        {
          id: 3,
          p1: { name: 'VortexMage', level: 24, rating: 2450, avatar: '🔥' },
          p2: { name: 'IronWall', level: 22, rating: 2370, avatar: '⚒' },
          winner: 'p1',
          status: 'completed',
          score: '3-1',
        },
        {
          id: 4,
          p1: { name: 'SilverArrow', level: 25, rating: 2500, avatar: '🏹' },
          p2: { name: 'CrimsonBlade', level: 23, rating: 2390, avatar: '🗡' },
          winner: 'p1',
          status: 'completed',
          score: '3-1',
        },
        {
          id: 5,
          p1: { name: 'LunaWolf', level: 24, rating: 2440, avatar: '🐺' },
          p2: { name: 'SteelSerpent', level: 21, rating: 2320, avatar: '🐍' },
          winner: 'p1',
          status: 'completed',
          score: '3-0',
        },
        {
          id: 6,
          p1: { name: 'ThunderStorm', level: 23, rating: 2400, avatar: '⚡' },
          p2: { name: 'FrostByte', level: 22, rating: 2360, avatar: '❄' },
          winner: 'p2',
          status: 'completed',
          score: '1-3',
        },
        {
          id: 7,
          p1: { name: 'InfernoPhoenix', level: 26, rating: 2580, avatar: '🔥' },
          p2: { name: 'NovaStar', level: 24, rating: 2460, avatar: '⭐' },
          winner: 'p1',
          status: 'completed',
          score: '3-0',
        },
        {
          id: 8,
          p1: { name: 'VenomStrike', level: 23, rating: 2420, avatar: '☠' },
          p2: { name: 'OracleSage', level: 22, rating: 2380, avatar: '🔮' },
          winner: 'p2',
          status: 'completed',
          score: '2-3',
        },
      ],
    },
    {
      name: 'Quarterfinals',
      matches: [
        {
          id: 9,
          p1: { name: 'ShadowKnight', level: 22, rating: 2380, avatar: '⚔' },
          p2: { name: 'PhantomRook', level: 21, rating: 2310, avatar: '🎭' },
          winner: 'p1',
          status: 'completed',
          score: '3-2',
        },
        {
          id: 10,
          p1: { name: 'VortexMage', level: 24, rating: 2450, avatar: '🔥' },
          p2: { name: 'SilverArrow', level: 25, rating: 2500, avatar: '🏹' },
          winner: 'p2',
          status: 'completed',
          score: '2-3',
        },
        {
          id: 11,
          p1: { name: 'LunaWolf', level: 24, rating: 2440, avatar: '🐺' },
          p2: { name: 'FrostByte', level: 22, rating: 2360, avatar: '❄' },
          winner: 'p1',
          status: 'completed',
          score: '3-1',
        },
        {
          id: 12,
          p1: { name: 'InfernoPhoenix', level: 26, rating: 2580, avatar: '🔥' },
          p2: { name: 'OracleSage', level: 22, rating: 2380, avatar: '🔮' },
          winner: 'p1',
          status: 'completed',
          score: '3-0',
        },
      ],
    },
    {
      name: 'Semifinals',
      matches: [
        {
          id: 13,
          p1: { name: 'ShadowKnight', level: 22, rating: 2380, avatar: '⚔' },
          p2: { name: 'SilverArrow', level: 25, rating: 2500, avatar: '🏹' },
          winner: null,
          status: 'live',
          score: '1-1',
        },
        {
          id: 14,
          p1: { name: 'LunaWolf', level: 24, rating: 2440, avatar: '🐺' },
          p2: { name: 'InfernoPhoenix', level: 26, rating: 2580, avatar: '🔥' },
          winner: null,
          status: 'upcoming',
          score: '0-0',
        },
      ],
    },
  ],
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MatchCard({ match, round = 0, onClickMatch = null }) {
  const isCompleted = match.status === 'completed'
  const isLive = match.status === 'live'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 * round }}
      whileHover={onClickMatch ? { scale: 1.02 } : {}}
      onClick={onClickMatch}
      style={{
        background: isLive
          ? 'linear-gradient(135deg, rgba(245,184,0,0.15), rgba(196,30,30,0.1))'
          : 'linear-gradient(135deg, #1E1010, #160A0A)',
        border: isLive
          ? '2px solid #F5B800'
          : '1px solid rgba(245,184,0,0.15)',
        borderRadius: '10px', padding: '12px',
        cursor: onClickMatch ? 'pointer' : 'default',
        minWidth: '200px',
      }}
    >
      {/* ── Match Header ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '8px',
      }}>
        <div style={{
          fontSize: '11px', color: 'rgba(184,150,122,0.6)',
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          Match {match.id}
        </div>
        {isCompleted && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              fontSize: '12px',
              color: '#4ADE80',
            }}
          >
            ✓
          </motion.div>
        )}
        {isLive && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              width: '8px', height: '8px',
              borderRadius: '50%', background: '#F5B800',
            }}
          />
        )}
      </div>

      {/* ── Player 1 ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          padding: '8px 10px', borderRadius: '6px',
          background: match.winner === 'p1' ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.02)',
          border: match.winner === 'p1' ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(245,184,0,0.1)',
          marginBottom: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '14px' }}>{match.p1.avatar}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '12px', fontWeight: 600, color: match.winner === 'p1' ? '#4ADE80' : '#FAF7F0',
            }}>
              {match.p1.name}
            </div>
            <div style={{
              fontSize: '10px', color: 'rgba(184,150,122,0.6)',
            }}>
              Lvl {match.p1.level} • {match.p1.rating}
            </div>
          </div>
        </div>
        {isCompleted && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px', fontWeight: 700,
            color: match.winner === 'p1' ? '#4ADE80' : 'rgba(184,150,122,0.5)',
            minWidth: '30px', textAlign: 'right',
          }}>
            {match.score.split('-')[0]}
          </div>
        )}
      </motion.div>

      {/* ── Player 2 ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          padding: '8px 10px', borderRadius: '6px',
          background: match.winner === 'p2' ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.02)',
          border: match.winner === 'p2' ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(245,184,0,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <span style={{ fontSize: '14px' }}>{match.p2.avatar}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '12px', fontWeight: 600, color: match.winner === 'p2' ? '#4ADE80' : '#FAF7F0',
            }}>
              {match.p2.name}
            </div>
            <div style={{
              fontSize: '10px', color: 'rgba(184,150,122,0.6)',
            }}>
              Lvl {match.p2.level} • {match.p2.rating}
            </div>
          </div>
        </div>
        {isCompleted && (
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px', fontWeight: 700,
            color: match.winner === 'p2' ? '#4ADE80' : 'rgba(184,150,122,0.5)',
            minWidth: '30px', textAlign: 'right',
          }}>
            {match.score.split('-')[1]}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function RoundSection({ round, roundIndex, onWatchMatch = null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: roundIndex * 0.15 }}
      style={{
        background: 'linear-gradient(160deg, #2A1010, #1A0A0A)',
        border: '1px solid rgba(245,184,0,0.15)',
        borderRadius: '14px', padding: '20px',
      }}
    >
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: '14px',
        fontWeight: 700, color: '#FAF7F0', marginBottom: '16px',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {round.name}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
        gap: '14px',
      }}>
        {round.matches.map((match, i) => (
          <MatchCard
            key={match.id}
            match={match}
            round={i}
            onClickMatch={() => match.status === 'live' && onWatchMatch?.(match)}
          />
        ))}
      </div>
    </motion.div>
  )
}

function TournamentStats({ tournament }) {
  const totalMatches = tournament.rounds.reduce((sum, r) => sum + r.matches.length, 0)
  const completedMatches = tournament.rounds.reduce(
    (sum, r) => sum + r.matches.filter(m => m.status === 'completed').length,
    0
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: 'linear-gradient(160deg, #2A1010, #1A0A0A)',
        border: '1px solid rgba(245,184,0,0.15)',
        borderRadius: '14px', padding: '20px',
        minWidth: '240px',
        height: 'fit-content',
        position: 'sticky', top: '20px',
      }}
    >
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: '14px',
        fontWeight: 700, color: '#FAF7F0', marginBottom: '16px',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        📊 Tournament Stats
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        {[
          { icon: '👥', label: 'Players', value: tournament.players },
          { icon: '💰', label: 'Prize Pool', value: tournament.prize },
          { icon: '🔄', label: 'Matches', value: `${completedMatches}/${totalMatches}` },
          { icon: '🏁', label: 'Stage', value: tournament.stage },
          { icon: '📅', label: 'Duration', value: '2 weeks' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.05 }}
            style={{
              padding: '12px', borderRadius: '8px',
              background: 'rgba(245,184,0,0.08)',
              border: '1px solid rgba(245,184,0,0.15)',
            }}
          >
            <div style={{
              fontSize: '11px', color: 'rgba(184,150,122,0.65)',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              marginBottom: '4px',
            }}>
              {stat.icon} {stat.label}
            </div>
            <div style={{
              fontFamily: "'Cinzel', serif", fontSize: '14px',
              fontWeight: 700, color: '#F5B800',
            }}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Top Performers ────────────────────────────────────────────────── */}
      <div style={{
        marginTop: '20px', paddingTop: '20px',
        borderTop: '1px solid rgba(245,184,0,0.15)',
      }}>
        <div style={{
          fontSize: '12px', fontWeight: 700, color: '#FAF7F0',
          marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          🏆 Top Performers
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { name: 'InfernoPhoenix', wins: 4, avatar: '🔥' },
            { name: 'SilverArrow', wins: 3, avatar: '🏹' },
            { name: 'LunaWolf', wins: 3, avatar: '🐺' },
          ].map((player, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              style={{
                padding: '8px 10px', borderRadius: '6px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(245,184,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ fontSize: '12px' }}>{player.avatar}</span>
                <span style={{
                  fontSize: '12px', fontWeight: 600, color: '#FAF7F0',
                }}>
                  {player.name}
                </span>
              </div>
              <div style={{
                fontSize: '11px', fontWeight: 700, color: '#F5B800',
              }}>
                {player.wins}W
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main TournamentBracket Component ──────────────────────────────────────────
export default function TournamentBracket({ onWatchMatch = null, onJoinTournament = null }) {
  const [tournament] = useState(MOCK_TOURNAMENT)
  const [selectedMatch, setSelectedMatch] = useState(null)

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
          maxWidth: '1400px', margin: '0 auto', marginBottom: '40px',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: '24px', flexWrap: 'wrap', gap: '20px',
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Cinzel', serif", fontSize: '36px',
              fontWeight: 700, color: '#FAF7F0', margin: 0, marginBottom: '8px',
              letterSpacing: '0.04em',
            }}>
              {tournament.name}
            </h1>
            <p style={{
              color: 'rgba(184,150,122,0.6)', fontSize: '13px',
              margin: 0, letterSpacing: '0.05em',
            }}>
              Global competitive tournament • June 1-15, 2026
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onJoinTournament}
            style={{
              padding: '12px 24px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #F5B800, #FFD700)',
              border: 'none', color: '#000', fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Cinzel', serif",
              letterSpacing: '0.04em',
            }}
          >
            🎮 Join Tournament
          </motion.button>
        </div>

        {/* ── Progress bar ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            height: '8px', borderRadius: '4px',
            background: 'rgba(245,184,0,0.1)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '62.5%' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #F5B800, #FFD700)',
            }}
          />
        </motion.div>
        <div style={{
          marginTop: '8px', fontSize: '11px', color: 'rgba(184,150,122,0.6)',
          letterSpacing: '0.05em',
        }}>
          Semifinals in progress • 62.5% complete
        </div>
      </motion.div>

      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 260px', gap: '24px',
      }}>
        {/* ── Main bracket ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}
        >
          {tournament.rounds.map((round, i) => (
            <RoundSection
              key={round.name}
              round={round}
              roundIndex={i}
              onWatchMatch={(match) => {
                setSelectedMatch(match)
                onWatchMatch?.(match)
              }}
            />
          ))}
        </motion.div>

        {/* ── Sidebar stats ────────────────────────────────────────────────── */}
        <TournamentStats tournament={tournament} />
      </div>

      <style>{`
      
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
      `}</style>
    </div>
  )
}