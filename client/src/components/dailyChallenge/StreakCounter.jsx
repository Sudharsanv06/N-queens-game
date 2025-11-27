import { motion } from 'framer-motion'
import { Flame, Trophy, Calendar } from 'lucide-react'
import { useSelector } from 'react-redux'

function StreakCounter() {
  const { currentStreak, longestStreak, completedToday } = useSelector(state => state.streak)

  return (
    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 rounded-xl p-6 backdrop-blur-md">
      <div className="flex items-center justify-between">
        {/* Current Streak */}
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ 
              scale: completedToday ? [1, 1.2, 1] : 1,
              rotate: completedToday ? [0, 10, -10, 0] : 0
            }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <Flame className="w-12 h-12 text-orange-500" />
            {completedToday && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
              />
            )}
          </motion.div>
          
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{currentStreak}</span>
              <span className="text-gray-300">day{currentStreak !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-sm text-gray-400">Current Streak</p>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">{longestStreak}</span>
          </div>
          <p className="text-sm text-gray-400">Best Streak</p>
        </div>
      </div>

      {/* Streak Status */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">
            {completedToday ? (
              <span className="text-green-400 font-medium">✓ Completed today!</span>
            ) : (
              <span>Complete today's challenge to continue your streak</span>
            )}
          </span>
        </div>
      </div>

      {/* Bonus Info */}
      {currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-purple-500/20 rounded-lg border border-purple-500/30"
        >
          <p className="text-sm text-center text-purple-200">
            🎁 Streak Bonus: <span className="font-bold">+{currentStreak * 5} XP</span> on next completion
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default StreakCounter
