import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Trophy, Calendar, Users, Clock, Award, ArrowLeft, ChevronRight, RefreshCw, Crown } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function TournamentBracket() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token, user } = useSelector(state => state.auth)
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [myMatches, setMyMatches] = useState([])

  useEffect(() => {
    fetchTournament()
  }, [id])

  const fetchTournament = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tournaments/${id}`)
      setTournament(response.data.tournament)
      
      // Find user's matches if logged in
      if (user && response.data.tournament) {
        const userMatches = []
        for (const round of response.data.tournament.bracket?.rounds || []) {
          for (const match of round.matches || []) {
            if (match.player1?._id === user.id || match.player2?._id === user.id) {
              userMatches.push({ ...match, round: round.roundNumber })
            }
          }
        }
        setMyMatches(userMatches)
      }
    } catch (error) {
      console.error('Failed to fetch tournament:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!token) {
      navigate('/login')
      return
    }
    
    try {
      await axios.post(`${API_URL}/api/tournaments/${id}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTournament()
    } catch (error) {
      console.error('Failed to register:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4ADE80'
      case 'in-progress': return '#F5B800'
      case 'scheduled': return '#60A5FA'
      default: return '#B8967A'
    }
  }

  const formatDate = (date) => {
    if (!date) return 'TBD'
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0C0505] to-[#1A0F0A] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-[#F5B800] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0C0505] to-[#1A0F0A] flex items-center justify-center p-4">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-[#B8967A]/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-['Cinzel'] text-[#FAF7F0] mb-2">Tournament Not Found</h2>
          <button
            onClick={() => navigate('/tournaments')}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-[#F5B800] to-[#C41E1E] rounded-lg text-[#0C0505] font-bold"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    )
  }

  const isRegistered = tournament.participants?.some(p => p._id === user?.id)
  const canRegister = tournament.status === 'registration' && !isRegistered && token
  const isOrganizer = tournament.organizer?._id === user?.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C0505] to-[#1A0F0A] py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/tournaments')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1E1010] border border-[#F5B800]/20 rounded-lg text-[#B8967A] hover:text-[#FAF7F0] transition-all"
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold font-['Cinzel'] text-[#FAF7F0]">{tournament.name}</h1>
            <p className="text-[#B8967A]/60 text-sm mt-1">{tournament.description}</p>
          </div>
          
          <button
            onClick={fetchTournament}
            className="p-2 bg-[#1E1010] border border-[#F5B800]/20 rounded-lg text-[#B8967A] hover:text-[#FAF7F0] transition-all"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Tournament Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { icon: <Calendar size={16} />, label: 'Starts', value: formatDate(tournament.schedule?.tournamentStart) },
            { icon: <Users size={16} />, label: 'Players', value: `${tournament.participants?.length || 0}/${tournament.maxParticipants}` },
            { icon: <Award size={16} />, label: 'Prize', value: `${tournament.prizePool?.xp || 500} XP` },
            { icon: <Clock size={16} />, label: 'Format', value: tournament.type === 'single-elimination' ? 'Single Elim' : tournament.type },
            { icon: <Trophy size={16} />, label: 'Status', value: tournament.status === 'in-progress' ? 'LIVE' : tournament.status.toUpperCase() },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-3 text-center"
            >
              <div className="text-[#F5B800] mb-1 flex justify-center">{stat.icon}</div>
              <div className="text-xs text-[#B8967A]/60">{stat.label}</div>
              <div className="text-sm font-bold text-[#FAF7F0] mt-1">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Register Button */}
        {canRegister && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleRegister}
            className="w-full mb-8 py-4 bg-gradient-to-r from-[#F5B800] to-[#C41E1E] rounded-xl text-[#0C0505] font-bold text-lg flex items-center justify-center gap-2"
          >
            <Crown size={20} /> Register for Tournament
          </motion.button>
        )}

        {/* My Matches Section (if user is participating) */}
        {myMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold font-['Cinzel'] text-[#F5B800] mb-3">🎯 Your Matches</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myMatches.map((match, i) => (
                <motion.div
                  key={match.matchId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#1E1010] border border-[#F5B800]/20 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[#B8967A]/60">Round {match.round}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                      background: getStatusColor(match.status),
                      color: match.status === 'completed' ? '#0C0505' : '#FAF7F0'
                    }}>{match.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex-1 text-center">
                      <div className="text-sm font-semibold text-[#FAF7F0]">{match.player1?.name || 'TBD'}</div>
                      {match.winner?._id === match.player1?._id && <Crown size={12} className="text-[#F5B800] mx-auto mt-1" />}
                    </div>
                    <div className="text-xl font-bold text-[#F5B800]">VS</div>
                    <div className="flex-1 text-center">
                      <div className="text-sm font-semibold text-[#FAF7F0]">{match.player2?.name || 'TBD'}</div>
                      {match.winner?._id === match.player2?._id && <Crown size={12} className="text-[#F5B800] mx-auto mt-1" />}
                    </div>
                  </div>
                  {match.score && <div className="text-center text-xs text-[#B8967A]/60 mt-2">Score: {match.score}</div>}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Tournament Bracket */}
        <div>
          <h2 className="text-lg font-bold font-['Cinzel'] text-[#F5B800] mb-4">🏆 Tournament Bracket</h2>
          
          {!tournament.bracket?.rounds?.length ? (
            <div className="text-center py-12 bg-[#1E1010] rounded-xl border border-[#F5B800]/15">
              <Trophy className="w-12 h-12 text-[#B8967A]/30 mx-auto mb-2" />
              <p className="text-[#B8967A]/60">Bracket will be generated when tournament starts</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 min-w-max" style={{ minWidth: tournament.bracket.rounds.length * 280 }}>
                {tournament.bracket.rounds.map((round, roundIdx) => (
                  <div key={roundIdx} className="flex-1 min-w-[260px]">
                    {/* Round Header */}
                    <div className="text-center mb-4">
                      <div className="text-sm font-bold font-['Cinzel'] text-[#F5B800]">
                        {round.name || (round.roundNumber === tournament.bracket.totalRounds ? 'Finals' : `Round ${round.roundNumber}`)}
                      </div>
                      <div className="text-xs text-[#B8967A]/60">{round.matches.length} Matches</div>
                    </div>
                    
                    {/* Matches */}
                    <div className="space-y-4">
                      {round.matches.map((match, matchIdx) => (
                        <motion.div
                          key={match.matchId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (roundIdx * 0.1) + (matchIdx * 0.05) }}
                          onClick={() => setSelectedMatch(match)}
                          className={`bg-[#1E1010] border rounded-xl p-3 cursor-pointer transition-all hover:border-[#F5B800]/40 ${
                            match.status === 'completed' ? 'border-green-500/30' : 'border-[#F5B800]/15'
                          }`}
                        >
                          {/* Player 1 */}
                          <div className={`flex justify-between items-center p-2 rounded-lg ${
                            match.winner?._id === match.player1?._id ? 'bg-green-500/10' : ''
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{match.player1?.avatar || '👤'}</span>
                              <span className={`text-sm font-medium ${
                                match.winner?._id === match.player1?._id ? 'text-green-400' : 'text-[#FAF7F0]'
                              }`}>{match.player1?.name || 'TBD'}</span>
                            </div>
                            {match.score && <span className="text-sm text-[#F5B800] font-mono">{match.score.split('-')[0]}</span>}
                          </div>
                          
                          {/* VS Line */}
                          <div className="text-center text-xs text-[#B8967A]/60 my-1">VS</div>
                          
                          {/* Player 2 */}
                          <div className={`flex justify-between items-center p-2 rounded-lg ${
                            match.winner?._id === match.player2?._id ? 'bg-green-500/10' : ''
                          }`}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{match.player2?.avatar || '👤'}</span>
                              <span className={`text-sm font-medium ${
                                match.winner?._id === match.player2?._id ? 'text-green-400' : 'text-[#FAF7F0]'
                              }`}>{match.player2?.name || 'TBD'}</span>
                            </div>
                            {match.score && <span className="text-sm text-[#F5B800] font-mono">{match.score.split('-')[1]}</span>}
                          </div>
                          
                          {/* Status Badge */}
                          {match.status === 'completed' && (
                            <div className="text-center mt-2">
                              <span className="text-xs text-green-400">✓ Completed</span>
                            </div>
                          )}
                          {match.status === 'in-progress' && (
                            <div className="text-center mt-2">
                              <span className="text-xs text-[#F5B800] animate-pulse">⚡ LIVE</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {tournament.leaderboard?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold font-['Cinzel'] text-[#F5B800] mb-3">📊 Leaderboard</h2>
            <div className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-3 bg-[#2A1A0A] text-xs text-[#B8967A]/60 font-semibold">
                <div>Rank</div>
                <div>Player</div>
                <div className="text-right">Wins</div>
              </div>
              {tournament.leaderboard.map((entry, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4 p-3 border-t border-[#F5B800]/10 text-sm">
                  <div className="font-bold text-[#F5B800]">#{idx + 1}</div>
                  <div className="text-[#FAF7F0]">{entry.userId?.name || 'Unknown'}</div>
                  <div className="text-right text-[#FAF7F0]">{entry.wins}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participants List */}
        <div className="mt-8">
          <h2 className="text-lg font-bold font-['Cinzel'] text-[#F5B800] mb-3">👥 Participants ({tournament.participants?.length || 0})</h2>
          <div className="flex flex-wrap gap-2">
            {(tournament.participants || []).map((participant, i) => (
              <motion.div
                key={participant._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1E1010] border border-[#F5B800]/15 rounded-full"
              >
                <span className="text-sm">{participant.avatar || '👤'}</span>
                <span className="text-sm text-[#FAF7F0]">{participant.name}</span>
                {participant._id === tournament.organizer?._id && (
                  <Crown size={12} className="text-[#F5B800]" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Match Detail Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMatch(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1E1010] border border-[#F5B800]/30 rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-4">
                <Trophy className="w-12 h-12 text-[#F5B800] mx-auto mb-2" />
                <h3 className="text-xl font-bold font-['Cinzel'] text-[#FAF7F0]">Match Details</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-[#2A1A0A] rounded-lg">
                  <span className="text-[#FAF7F0]">{selectedMatch.player1?.name || 'TBD'}</span>
                  <span className="text-[#F5B800] font-bold">VS</span>
                  <span className="text-[#FAF7F0]">{selectedMatch.player2?.name || 'TBD'}</span>
                </div>
                
                {selectedMatch.score && (
                  <div className="text-center">
                    <span className="text-sm text-[#B8967A]/60">Final Score</span>
                    <div className="text-2xl font-bold text-[#F5B800]">{selectedMatch.score}</div>
                  </div>
                )}
                
                {selectedMatch.winner && (
                  <div className="text-center p-3 bg-green-500/10 rounded-lg">
                    <span className="text-sm text-green-400">Winner</span>
                    <div className="font-bold text-[#FAF7F0]">{selectedMatch.winner.name}</div>
                  </div>
                )}
                
                <div className="text-center text-sm text-[#B8967A]/60">
                  Status: <span style={{ color: getStatusColor(selectedMatch.status) }}>{selectedMatch.status}</span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedMatch(null)}
                className="w-full mt-6 py-2 bg-gradient-to-r from-[#F5B800] to-[#C41E1E] rounded-lg text-[#0C0505] font-bold"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TournamentBracket