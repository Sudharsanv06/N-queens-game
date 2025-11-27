import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Award, Star } from 'lucide-react'

const RewardToast = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000) // Auto-close after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [notification, onClose])

  if (!notification) return null

  const isAchievement = notification.type === 'achievement'
  const Icon = isAchievement ? Trophy : Award

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, -1, 1, -1, 0]
          }}
          transition={{
            duration: 0.5,
            repeat: 1
          }}
          className="pointer-events-auto bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-white rounded-xl shadow-2xl p-4 max-w-md relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_rgba(255,255,255,0.1)_100%)]" />
          </div>

          {/* Content */}
          <div className="relative flex items-center gap-4">
            {/* Icon */}
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: { duration: 0.6, ease: 'easeInOut' },
                scale: { duration: 0.4, repeat: 2, repeatType: 'reverse' }
              }}
              className="flex-shrink-0 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              {notification.icon ? (
                <span className="text-4xl">{notification.icon}</span>
              ) : (
                <Icon className="w-8 h-8 text-white" />
              )}
            </motion.div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
                {isAchievement ? '🎯 Achievement Unlocked!' : '🛡️ Badge Earned!'}
              </p>
              <h4 className="text-lg font-bold mt-0.5 truncate">
                {notification.name}
              </h4>
              <p className="text-sm opacity-90 line-clamp-1 mt-0.5">
                {notification.description}
              </p>

              {/* Rewards */}
              {isAchievement && notification.rewardXP && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-xs bg-white/20 rounded-full px-2 py-0.5">
                    <Star className="w-3 h-3" />
                    +{notification.rewardXP} XP
                  </span>
                  {notification.rewardPoints && (
                    <span className="flex items-center gap-1 text-xs bg-white/20 rounded-full px-2 py-0.5">
                      💎 +{notification.rewardPoints} pts
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sparkles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, Math.random() * 100 - 50],
                y: [0, Math.random() * 100 - 50]
              }}
              transition={{
                duration: 1,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default RewardToast
