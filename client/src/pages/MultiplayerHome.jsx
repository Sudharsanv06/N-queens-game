import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Zap, Clock, Puzzle, Trophy, TrendingUp, Crown, ArrowRight, Users } from 'lucide-react'
import { fetchProfile } from '../store/slices/eloSlice'
import { setMatchType } from '../store/slices/matchmakingSlice'

export const MultiplayerHome = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector((state) => state.auth)
  const { elo, rank, wins, losses, isLoadingProfile } = useSelector((state) => state.elo)

  useEffect(() => {
    if (user) {
      dispatch(fetchProfile())
    }
  }, [user, dispatch])

  const matchTypes = [
    {
      id: 'standard',
      name: 'Quick Match',
      description: 'Standard 8×8 board, unlimited time',
      icon: <Zap className="w-12 h-12" />,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'speed',
      name: 'Speed Mode',
      description: '6×6 board, 2 minutes per player',
      icon: <Clock className="w-12 h-12" />,
      color: 'from-orange-500 to-red-500',
      hoverColor: 'hover:from-orange-600 hover:to-red-600'
    },
    {
      id: 'puzzle-duel',
      name: 'Puzzle Duel',
      description: 'Solve puzzle challenges head-to-head',
      icon: <Puzzle className="w-12 h-12" />,
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600'
    }
  ]

  const handlePlayClick = (matchType) => {
    dispatch(setMatchType(matchType))
    navigate(`/multiplayer/matchmaking?mode=${matchType}`)
  }

  const getRankIcon = (rank) => {
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
      diamond: '💠',
      master: '👑',
      grandmaster: '🏆',
      challenger: '⭐'
    }
    return icons[rank?.toLowerCase()] || '🎮'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Users className="w-12 h-12 text-blue-600" />
            Multiplayer Mode
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Challenge players worldwide in real-time N-Queens battles
          </p>
        </div>

        {/* Player Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
                {user?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.username || 'Player'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Ready to compete
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* ELO */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {elo || 1200}
                  </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">ELO Rating</div>
              </div>

              {/* Rank */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-3xl">{getRankIcon(rank)}</span>
                  <Crown className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {rank || 'Unranked'}
                </div>
              </div>

              {/* Wins */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {wins || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Wins</div>
              </div>

              {/* Losses */}
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {losses || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Losses</div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Types Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {matchTypes.map((type) => (
            <div
              key={type.id}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className={`bg-gradient-to-br ${type.color} p-8 text-white text-center`}>
                <div className="flex justify-center mb-4 transform group-hover:scale-110 transition-transform">
                  {type.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{type.name}</h3>
                <p className="text-sm opacity-90">{type.description}</p>
              </div>

              <div className="p-6">
                <button
                  onClick={() => handlePlayClick(type.id)}
                  className={`
                    w-full px-6 py-3 bg-gradient-to-r ${type.color} ${type.hoverColor}
                    text-white font-bold rounded-xl
                    flex items-center justify-center gap-2
                    transform transition-all duration-300
                    group-hover:shadow-lg
                  `}
                >
                  Play Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/multiplayer/leaderboard')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white p-6 rounded-xl shadow-lg flex items-center justify-between transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div className="text-left">
                <div className="font-bold text-xl">Leaderboard</div>
                <div className="text-sm opacity-90">See top players</div>
              </div>
            </div>
            <ArrowRight className="w-6 h-6" />
          </button>

          <button
            onClick={() => navigate('/multiplayer/spectate')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 rounded-xl shadow-lg flex items-center justify-between transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div className="text-left">
                <div className="font-bold text-xl">Watch Live</div>
                <div className="text-sm opacity-90">Spectate matches</div>
              </div>
            </div>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
