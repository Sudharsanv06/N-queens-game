import { motion } from 'framer-motion'
import { Play, CheckCircle, Trophy, Clock, Zap, AlertTriangle } from 'lucide-react'

function ChallengeCard({ challenge, userProgress, onStart, canPlay, completedToday }) {
  const getStatusBadge = () => {
    if (completedToday || userProgress?.status === 'completed') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500 rounded-full">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">Completed</span>
        </div>
      )
    }
    
    if (userProgress?.status === 'in-progress') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500 rounded-full">
          <Clock className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-medium">In Progress</span>
        </div>
      )
    }
    
    if (userProgress?.status === 'failed') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500 rounded-full">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-medium">Failed - Try Again</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500 rounded-full">
        <Zap className="w-5 h-5 text-blue-400" />
        <span className="text-blue-400 font-medium">Ready to Play</span>
      </div>
    )
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'hard': return 'text-orange-400'
      case 'expert': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <motion.div
      whileHover={canPlay ? { scale: 1.02 } : {}}
      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{challenge.title}</h2>
          <p className="text-gray-300">{challenge.description}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Challenge Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Board Size</p>
          <p className="text-white font-bold text-xl">{challenge.boardSize}×{challenge.boardSize}</p>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <p className="text-gray-400 text-sm mb-1">Difficulty</p>
          <p className={`font-bold text-xl capitalize ${getDifficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </p>
        </div>

        {challenge.timeLimit && (
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Time Limit</p>
            <p className="text-white font-bold text-xl">{Math.floor(challenge.timeLimit / 60)}m</p>
          </div>
        )}

        {challenge.moveLimit && (
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Move Limit</p>
            <p className="text-white font-bold text-xl">{challenge.moveLimit}</p>
          </div>
        )}

        {!challenge.hintsAllowed && (
          <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/50">
            <p className="text-red-400 text-sm mb-1">Special Rule</p>
            <p className="text-red-300 font-bold text-sm">No Hints</p>
          </div>
        )}
      </div>

      {/* Reward */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-300">Reward</p>
              <p className="text-2xl font-bold text-white">{challenge.rewardXP} XP</p>
            </div>
          </div>
          {challenge.bonusMultiplier > 1 && (
            <div className="text-right">
              <p className="text-sm text-gray-300">Streak Bonus</p>
              <p className="text-xl font-bold text-purple-400">+{Math.round((challenge.bonusMultiplier - 1) * 100)}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      {canPlay && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-purple-500/50"
        >
          <Play className="w-6 h-6" fill="white" />
          Start Challenge
        </motion.button>
      )}

      {completedToday && userProgress && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-500 rounded-xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-300 text-sm">Time</p>
              <p className="text-white font-bold">{Math.floor(userProgress.timeTaken / 60)}:{String(userProgress.timeTaken % 60).padStart(2, '0')}</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">Moves</p>
              <p className="text-white font-bold">{userProgress.movesUsed}</p>
            </div>
            <div>
              <p className="text-gray-300 text-sm">XP Earned</p>
              <p className="text-green-400 font-bold">+{userProgress.totalReward}</p>
            </div>
          </div>
        </div>
      )}

      {!canPlay && !completedToday && (
        <div className="text-center text-gray-400">
          <p>Sign in to start the challenge</p>
        </div>
      )}

      {/* Attempts Counter */}
      {userProgress && userProgress.attempts > 0 && (
        <div className="mt-4 text-center text-gray-300 text-sm">
          Attempts: {userProgress.attempts}
        </div>
      )}
    </motion.div>
  )
}

export default ChallengeCard
