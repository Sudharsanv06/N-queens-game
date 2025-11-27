import React from 'react'
import { motion } from 'framer-motion'
import { Check, Lock } from 'lucide-react'

const BadgeCard = ({ badge, isEarned, earnedAt, isEquipped, onEquip, onClick }) => {
  const tierColors = {
    bronze: 'from-orange-400 to-orange-600',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-blue-400 to-blue-600',
    diamond: 'from-purple-400 to-purple-600'
  }

  const tierBgColors = {
    bronze: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300',
    silver: 'bg-gray-50 dark:bg-gray-900/20 border-gray-300',
    gold: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300',
    platinum: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300',
    diamond: 'bg-purple-50 dark:bg-purple-900/20 border-purple-300'
  }

  return (
    <motion.div
      whileHover={{ scale: isEarned ? 1.05 : 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative p-6 rounded-xl border-2 cursor-pointer transition-all
        ${isEarned 
          ? `${tierBgColors[badge.tier]} border-2` 
          : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-60'
        }
        ${isEquipped ? 'ring-4 ring-green-400 ring-offset-2' : ''}
      `}
    >
      {/* Equipped Badge */}
      {isEquipped && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5"
        >
          <Check className="w-4 h-4" />
        </motion.div>
      )}

      {/* Locked Overlay */}
      {!isEarned && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm">
          <Lock className="w-12 h-12 text-white" />
        </div>
      )}

      {/* Badge Icon */}
      <div className={`
        w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl
        bg-gradient-to-br ${tierColors[badge.tier]}
        ${!isEarned && 'grayscale'}
      `}>
        {badge.icon}
      </div>

      {/* Badge Name */}
      <h3 className="text-center font-bold text-lg mt-4 text-gray-900 dark:text-white">
        {badge.name}
      </h3>

      {/* Description */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
        {badge.description}
      </p>

      {/* Tier */}
      <div className="flex justify-center mt-3">
        <span className={`
          px-3 py-1 rounded-full text-xs font-bold uppercase
          ${badge.tier === 'bronze' && 'bg-orange-200 text-orange-800'}
          ${badge.tier === 'silver' && 'bg-gray-300 text-gray-800'}
          ${badge.tier === 'gold' && 'bg-yellow-300 text-yellow-900'}
          ${badge.tier === 'platinum' && 'bg-blue-200 text-blue-800'}
          ${badge.tier === 'diamond' && 'bg-purple-200 text-purple-800'}
        `}>
          {badge.tier}
        </span>
      </div>

      {/* Earned Date */}
      {isEarned && earnedAt && (
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          Earned: {new Date(earnedAt).toLocaleDateString()}
        </p>
      )}

      {/* Equip Button */}
      {isEarned && onEquip && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation()
            onEquip(badge.badgeId, !isEquipped)
          }}
          className={`
            w-full mt-4 px-4 py-2 rounded-lg font-semibold text-sm transition-colors
            ${isEquipped 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-green-500 hover:bg-green-600 text-white'
            }
          `}
        >
          {isEquipped ? 'Unequip' : 'Equip'}
        </motion.button>
      )}
    </motion.div>
  )
}

export default BadgeCard
