import React from 'react'
import { useSelector } from 'react-redux'
import { Crown, Trophy, Award, Wifi, WifiOff } from 'lucide-react'

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

export const PlayerPanel = ({ 
  player, 
  isActive = false, 
  isConnected = true,
  timeRemaining = null,
  side = 'player1'
}) => {
  const { user } = useSelector((state) => state.auth)
  const { opponentConnected } = useSelector((state) => state.multiplayerGame)
  
  const isCurrentUser = player?.userId === user?._id || player?.userId === user?.id
  const displayConnected = side === 'player1' ? isConnected : opponentConnected

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = (seconds) => {
    if (seconds === null) return 'text-gray-500'
    if (seconds <= 5) return 'text-red-500 animate-pulse'
    if (seconds <= 10) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div 
      className={`
        relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md
        transition-all duration-300
        ${isActive ? 'ring-4 ring-blue-500 shadow-lg' : ''}
        ${!displayConnected ? 'opacity-50' : ''}
      `}
    >
      {/* Connection Status Badge */}
      {!displayConnected && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          <WifiOff className="w-3 h-3" />
          <span>Disconnected</span>
        </div>
      )}

      {displayConnected && !isCurrentUser && side === 'player2' && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className={`
          relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
          ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
        `}>
          {player?.username?.[0]?.toUpperCase() || '?'}
          
          {/* Active Turn Indicator */}
          {isActive && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 animate-pulse" />
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {player?.username || 'Unknown Player'}
            </h3>
            {isCurrentUser && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded">
                You
              </span>
            )}
          </div>

          {/* ELO and Rank */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {player?.elo || 1200} ELO
              </span>
            </div>
            
            <div className={`flex items-center gap-1 ${getRankColor(player?.rank)}`}>
              <span className="text-lg">{getRankIcon(player?.rank)}</span>
              <span className="text-sm font-medium capitalize">
                {player?.rank || 'Unranked'}
              </span>
            </div>
          </div>

          {/* Win/Loss Record */}
          {player?.wins !== undefined && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {player.wins}W - {player.losses || 0}L
              {player.winRate !== undefined && ` (${player.winRate}%)`}
            </div>
          )}
        </div>

        {/* Timer */}
        {timeRemaining !== null && (
          <div className={`
            text-3xl font-mono font-bold ${getTimeColor(timeRemaining)}
            min-w-[80px] text-right
          `}>
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Queens Placed Indicator */}
      {player?.queensPlaced !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${(player.queensPlaced / 8) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {player.queensPlaced || 0}/8 ♛
          </span>
        </div>
      )}

      {/* Active Turn Text */}
      {isActive && (
        <div className="mt-2 text-center text-sm font-semibold text-blue-600 dark:text-blue-400 animate-pulse">
          {isCurrentUser ? "Your Turn!" : "Opponent's Turn"}
        </div>
      )}
    </div>
  )
}
