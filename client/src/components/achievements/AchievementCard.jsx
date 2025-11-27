import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Lock } from 'lucide-react'

const AchievementCard = ({ achievement, isCompleted, progress, progressPercentage, onClick }) => {
  const isLocked = !isCompleted && achievement.isSecret && progressPercentage === 0

  return (
    <motion.div
      whileHover={{ scale: isCompleted ? 1.02 : 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${isCompleted 
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20' 
          : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-400'
        }
        ${isLocked ? 'opacity-60' : ''}
      `}
    >
      {/* Completion Badge */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="absolute top-2 right-2"
        >
          <CheckCircle className="w-6 h-6 text-green-500" />
        </motion.div>
      )}

      {/* Locked Icon */}
      {isLocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl
          ${isCompleted 
            ? 'bg-gradient-to-br from-yellow-200 to-amber-300 dark:from-yellow-600 dark:to-amber-700' 
            : 'bg-gray-200 dark:bg-gray-700'
          }
        `}>
          {isLocked ? '❓' : achievement.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">
            {isLocked ? '????? Secret Achievement' : achievement.name}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {isLocked ? 'Complete challenges to unlock this secret achievement' : achievement.description}
          </p>

          {/* Tier Badge */}
          <div className="flex items-center gap-2 mt-2">
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-semibold uppercase
              ${achievement.tier === 'bronze' && 'bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200'}
              ${achievement.tier === 'silver' && 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}
              ${achievement.tier === 'gold' && 'bg-yellow-300 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100'}
              ${achievement.tier === 'platinum' && 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}
            `}>
              {achievement.tier}
            </span>
            
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {achievement.category}
            </span>
          </div>

          {/* Progress Bar */}
          {!isCompleted && !isLocked && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress: {progress} / {achievement.requirementValue}</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-yellow-500">⭐</span> {achievement.rewardXP} XP
            </span>
            <span className="flex items-center gap-1">
              <span className="text-blue-500">💎</span> {achievement.rewardPoints} pts
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AchievementCard
