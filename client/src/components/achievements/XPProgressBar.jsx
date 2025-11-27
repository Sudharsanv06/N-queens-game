import React from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp } from 'lucide-react'

const XPProgressBar = ({ currentXP, xpToNextLevel, level, levelProgress, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Level and XP Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
            {level}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Level</p>
            <p className="font-bold text-gray-900 dark:text-white">Level {level}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">XP</p>
          <p className="font-bold text-gray-900 dark:text-white">
            {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 relative"
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
        
        {/* Percentage */}
        <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-1">
          {levelProgress}% to next level
        </p>
      </div>

      {/* Next Level Preview */}
      <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
        <TrendingUp className="w-4 h-4" />
        <span>Next level: {level + 1}</span>
        <Star className="w-4 h-4 text-yellow-500" />
      </div>
    </div>
  )
}

export default XPProgressBar
