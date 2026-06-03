import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Trophy, Calendar, Users, Clock, Award, Plus, ChevronRight, Filter, X } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function TournamentList() {
  const navigate = useNavigate()
  const { token, user } = useSelector(state => state.auth)
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, registration
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchTournaments()
  }, [filter])

  const fetchTournaments = async () => {
    try {
      let url = `${API_URL}/api/tournaments?`
      if (filter === 'upcoming') url += 'upcoming=true'
      else if (filter === 'registration') url += 'registrationOpen=true'
      
      const response = await axios.get(url)
      setTournaments(response.data.tournaments || [])
    } catch (error) {
      console.error('Failed to fetch tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (tournamentId) => {
    if (!token) {
      navigate('/login')
      return
    }
    
    try {
      await axios.post(`${API_URL}/api/tournaments/${tournamentId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchTournaments()
    } catch (error) {
      console.error('Failed to register:', error)
    }
  }

  const getStatusBadge = (tournament) => {
    const now = new Date()
    const regStart = new Date(tournament.schedule?.registrationStart)
    const regEnd = new Date(tournament.schedule?.registrationEnd)
    const tournStart = new Date(tournament.schedule?.tournamentStart)
    
    if (tournament.status === 'in-progress') {
      return { label: 'LIVE', color: '#FF8A8A', bg: 'rgba(196,30,30,0.2)' }
    }
    if (tournament.status === 'completed') {
      return { label: 'COMPLETED', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)' }
    }
    if (now < regStart) {
      return { label: 'UPCOMING', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' }
    }
    if (now >= regStart && now <= regEnd) {
      return { label: 'REGISTER NOW', color: '#F5B800', bg: 'rgba(245,184,0,0.15)' }
    }
    if (now > regEnd && now < tournStart) {
      return { label: 'REGISTRATION CLOSED', color: '#B8967A', bg: 'rgba(184,150,122,0.1)' }
    }
    return { label: tournament.status.toUpperCase(), color: '#B8967A', bg: 'rgba(184,150,122,0.1)' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0C0505] to-[#1A0F0A] flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-[#F5B800] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C0505] to-[#1A0F0A] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-['Cinzel'] text-[#FAF7F0] mb-2">
              🏆 Tournaments
            </h1>
            <p className="text-[#B8967A]/60">Compete against players worldwide</p>
          </div>
          
          {token && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#F5B800] to-[#C41E1E] rounded-xl text-[#0C0505] font-bold"
            >
              <Plus size={18} /> Create Tournament
            </motion.button>
          )}
        </motion.div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {[
            { id: 'all', label: 'All Tournaments' },
            { id: 'registration', label: 'Open Registration' },
            { id: 'upcoming', label: 'Upcoming' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.id 
                  ? 'bg-[#F5B800] text-[#0C0505]' 
                  : 'bg-[#1E1010] text-[#B8967A] border border-[#F5B800]/20 hover:border-[#F5B800]/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tournament Grid */}
        {tournaments.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-[#B8967A]/30 mx-auto mb-4" />
            <p className="text-[#B8967A]/60">No tournaments found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((tournament, i) => {
              const status = getStatusBadge(tournament)
              const isRegistered = tournament.participants?.some(p => p._id === user?.id)
              
              return (
                <motion.div
                  key={tournament._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/tournaments/${tournament._id}`)}
                  className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-5 cursor-pointer transition-all hover:border-[#F5B800]/40"
                >
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                    {isRegistered && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">✓ Registered</span>
                    )}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-bold font-['Cinzel'] text-[#FAF7F0] mb-2">{tournament.name}</h3>
                  
                  {/* Description */}
                  <p className="text-sm text-[#B8967A]/70 mb-4 line-clamp-2">{tournament.description || 'Compete for glory and prizes!'}</p>
                  
                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#B8967A]/60">
                      <Calendar size={14} />
                      <span>{new Date(tournament.schedule?.tournamentStart).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#B8967A]/60">
                      <Users size={14} />
                      <span>{tournament.participants?.length || 0} / {tournament.maxParticipants} Players</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#B8967A]/60">
                      <Award size={14} />
                      <span>{tournament.prizePool?.xp || 500} XP Prize Pool</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#B8967A]/60">
                      <Clock size={14} />
                      <span>{tournament.boardSize}×{tournament.boardSize} • {tournament.gameMode}</span>
                    </div>
                  </div>
                  
                  {/* View Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#F5B800]/10">
                    <span className="text-sm text-[#F5B800]">View Tournament</span>
                    <ChevronRight size={16} className="text-[#F5B800]" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Tournament Modal - Simplified for now */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1E1010] border border-[#F5B800]/30 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold font-['Cinzel'] text-[#FAF7F0]">Create Tournament</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-[#B8967A] hover:text-[#FAF7F0]">
                <X size={20} />
              </button>
            </div>
            <p className="text-[#B8967A]/60 mb-4">Tournament creation coming soon!</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full py-2 bg-gradient-to-r from-[#F5B800] to-[#C41E1E] rounded-lg text-[#0C0505] font-bold"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default TournamentList