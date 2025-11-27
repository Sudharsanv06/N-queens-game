import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Trophy, Crown, TrendingUp, Medal, Filter, Search } from 'lucide-react'
import { fetchLeaderboard, fetchProfile } from '../store/slices/eloSlice'

export const MultiplayerLeaderboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [filterType, setFilterType] = useState('all') // all, same-tier
  const [searchQuery, setSearchQuery] = useState('')

  const { 
    leaderboard, 
    isLoadingLeaderboard,
    userLeaderboardPosition,
    elo: myElo,
    rank: myRank
  } = useSelector((state) => state.elo)

  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchLeaderboard())
    if (user) {
      dispatch(fetchProfile())
    }
  }, [dispatch, user])

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

  const getRankColor = (rank) => {
    const colors = {
      bronze: 'text-orange-600',
      silver: 'text-gray-400',
      gold: 'text-yellow-500',
      platinum: 'text-cyan-500',
      diamond: 'text-blue-500',
      master: 'text-purple-500',
      grandmaster: 'text-red-500',
      challenger: 'text-pink-500'
    }
    return colors[rank?.toLowerCase()] || 'text-gray-500'
  }

  const getPositionBadge = (position) => {
    if (position === 1) return { icon: '🥇', color: 'bg-yellow-500', text: 'text-white' }
    if (position === 2) return { icon: '🥈', color: 'bg-gray-400', text: 'text-white' }
    if (position === 3) return { icon: '🥉', color: 'bg-orange-600', text: 'text-white' }
    return { icon: position, color: 'bg-gray-200 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' }
  }

  const filteredLeaderboard = leaderboard.filter((player) => {
    // Filter by tier
    if (filterType === 'same-tier' && player.rank !== myRank) {
      return false
    }

    // Filter by search
    if (searchQuery && !player.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-12 h-12 text-yellow-500" />
            Global Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Top players ranked by ELO rating
          </p>
        </div>

        {/* Your Position Card */}
        {userLeaderboardPosition && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm opacity-90 mb-1">Your Global Rank</div>
                <div className="text-4xl font-bold">#{userLeaderboardPosition}</div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-sm opacity-90">ELO Rating</div>
                  <div className="text-3xl font-bold">{myElo || 1200}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm opacity-90">Rank Tier</div>
                  <div className="text-3xl">{getRankIcon(myRank)}</div>
                  <div className="text-sm capitalize">{myRank}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All Players
              </button>
              <button
                onClick={() => setFilterType('same-tier')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterType === 'same-tier'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                My Tier Only
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        {isLoadingLeaderboard ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                      Player
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">
                      Tier
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300">
                      ELO
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300">
                      Record
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300">
                      Win Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLeaderboard.map((player, index) => {
                    const position = index + 1
                    const badge = getPositionBadge(position)
                    const isCurrentUser = player.userId === user?._id || player.userId === user?.id

                    return (
                      <tr
                        key={player.userId}
                        className={`
                          transition-colors
                          ${isCurrentUser 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          }
                        `}
                      >
                        {/* Rank */}
                        <td className="px-6 py-4">
                          <div className={`
                            w-10 h-10 rounded-full ${badge.color} ${badge.text}
                            flex items-center justify-center font-bold
                          `}>
                            {badge.icon}
                          </div>
                        </td>

                        {/* Player */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {player.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {player.username}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {player.totalMatches || 0} matches
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Tier */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getRankIcon(player.rank)}</span>
                            <span className={`font-semibold capitalize ${getRankColor(player.rank)}`}>
                              {player.rank}
                            </span>
                          </div>
                        </td>

                        {/* ELO */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {player.elo}
                            </span>
                          </div>
                        </td>

                        {/* Record */}
                        <td className="px-6 py-4 text-center">
                          <div className="text-sm">
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              {player.wins || 0}W
                            </span>
                            <span className="text-gray-400 mx-1">-</span>
                            <span className="text-red-600 dark:text-red-400 font-semibold">
                              {player.losses || 0}L
                            </span>
                          </div>
                        </td>

                        {/* Win Rate */}
                        <td className="px-6 py-4 text-center">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {player.winRate || 0}%
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredLeaderboard.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No players found
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/multiplayer')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
          >
            Back to Multiplayer
          </button>
        </div>
      </div>
    </div>
  )
}
