import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Calendar, Users, Clock, Star, Plus, Filter } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import Layout from './Layout'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TournamentList = () => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    
    fetchTournaments()
  }, [filter])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filter === 'registration') {
        params.append('registrationOpen', 'true')
      } else if (filter === 'active') {
        params.append('status', 'active')
      } else if (filter === 'upcoming') {
        params.append('upcoming', 'true')
      } else if (filter === 'completed') {
        params.append('status', 'completed')
      }

      const response = await axios.get(`${API_URL}/api/tournaments?${params.toString()}`)
      
      if (response.data.success) {
        setTournaments(response.data.tournaments)
      } else {
        toast.error('Failed to load tournaments')
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast.error('Error loading tournaments')
    } finally {
      setLoading(false)
    }
  }

  const registerForTournament = async (tournamentId) => {
    if (!user) {
      toast.error('Please login to register for tournaments')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/api/tournaments/${tournamentId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        toast.success('Successfully registered for tournament!')
        fetchTournaments() // Refresh to show updated registration
      } else {
        toast.error(response.data.error || 'Registration failed')
      }
    } catch (error) {
      console.error('Error registering for tournament:', error)
      toast.error(error.response?.data?.error || 'Registration failed')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'registration': return 'text-green-400 bg-green-900/20'
      case 'active': return 'text-blue-400 bg-blue-900/20'
      case 'completed': return 'text-gray-400 bg-gray-900/20'
      case 'upcoming': return 'text-yellow-400 bg-yellow-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPrizeText = (prizePool) => {
    if (!prizePool || !prizePool.total || prizePool.total === 0) {
      return 'Free Entry'
    }
    return `$${prizePool.total} Prize Pool`
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-ultra-gradient animate-gradient-shift bg-size-400 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-electric-blue mx-auto mb-4"></div>
            <p className="text-white">Loading tournaments...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-ultra-gradient animate-gradient-shift bg-size-400 p-4">
        {/* Header */}
        <motion.div
          className="max-w-7xl mx-auto mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-5xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-golden-yellow mb-4">
              N-Queens Tournaments
            </h1>
            <p className="text-xl text-cool-gray max-w-3xl mx-auto">
              Compete against players worldwide in structured tournaments. Test your skills and climb the ranks!
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', icon: Trophy },
                { key: 'registration', label: 'Open Registration', icon: Users },
                { key: 'active', label: 'Active', icon: Clock },
                { key: 'upcoming', label: 'Upcoming', icon: Calendar },
                { key: 'completed', label: 'Completed', icon: Star }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300
                    ${filter === key 
                      ? 'bg-electric-blue text-black font-bold' 
                      : 'glass-card text-white hover:bg-white/20'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Create Tournament Button */}
            {user && (
              <Link
                to="/tournaments/create"
                className="btn-primary bg-gradient-to-r from-emerald-green to-cyan-glow flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Tournament
              </Link>
            )}
          </div>
        </motion.div>

        {/* Tournaments Grid */}
        <div className="max-w-7xl mx-auto">
          {tournaments.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Trophy className="w-24 h-24 text-cool-gray mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No tournaments found</h3>
              <p className="text-cool-gray mb-6">
                {filter === 'all' 
                  ? 'No tournaments available at the moment.'
                  : `No ${filter} tournaments found.`
                }
              </p>
              {user && (
                <Link
                  to="/tournaments/create"
                  className="btn-primary bg-gradient-to-r from-electric-blue to-purple-glow"
                >
                  Create the First Tournament
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament, index) => (
                <motion.div
                  key={tournament._id}
                  className="glass-card p-6 rounded-ultra hover:shadow-neon transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Tournament Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {tournament.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(tournament.status)}`}>
                      {tournament.status}
                    </span>
                  </div>

                  {/* Tournament Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-cool-gray">
                      <Trophy className="w-4 h-4 text-golden-yellow" />
                      <span>{tournament.type.replace('-', ' ').toUpperCase()}</span>
                      <span className="text-electric-blue">• {tournament.gameMode}</span>
                    </div>

                    <div className="flex items-center gap-2 text-cool-gray">
                      <Users className="w-4 h-4 text-emerald-green" />
                      <span>{tournament.participantCount || 0} / {tournament.maxParticipants} players</span>
                    </div>

                    <div className="flex items-center gap-2 text-cool-gray">
                      <Calendar className="w-4 h-4 text-purple-glow" />
                      <span>Starts: {formatDate(tournament.schedule.tournamentStart)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-cool-gray">
                      <Clock className="w-4 h-4 text-electric-blue" />
                      <span>{tournament.timeLimit}s • Board: {tournament.boardSize}x{tournament.boardSize}</span>
                    </div>

                    <div className="text-golden-yellow font-bold">
                      {getPrizeText(tournament.prizePool)}
                    </div>
                  </div>

                  {/* Description */}
                  {tournament.description && (
                    <p className="text-cool-gray text-sm mb-4 line-clamp-2">
                      {tournament.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/tournaments/${tournament._id}`}
                      className="flex-1 btn-primary bg-gradient-to-r from-electric-blue to-purple-glow text-center"
                    >
                      View Details
                    </Link>

                    {tournament.isRegistrationOpen && user && (
                      <button
                        onClick={() => registerForTournament(tournament._id)}
                        className="btn-primary bg-gradient-to-r from-emerald-green to-cyan-glow"
                        disabled={tournament.participants?.some(p => p.user._id === user.id)}
                      >
                        {tournament.participants?.some(p => p.user._id === user.id) 
                          ? 'Registered' 
                          : 'Register'
                        }
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default TournamentList