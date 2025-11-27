import React, { useState } from 'react'
import { motion } from 'framer-motion'
import BadgeCard from './BadgeCard'

const BadgeCollection = ({ badges, onBadgeClick, onEquipBadge }) => {
  const [selectedTier, setSelectedTier] = useState('all')

  const tiers = [
    { id: 'all', label: 'All', color: 'gray' },
    { id: 'bronze', label: 'Bronze', color: 'orange' },
    { id: 'silver', label: 'Silver', color: 'gray' },
    { id: 'gold', label: 'Gold', color: 'yellow' },
    { id: 'platinum', label: 'Platinum', color: 'blue' },
    { id: 'diamond', label: 'Diamond', color: 'purple' }
  ]

  const filteredBadges = selectedTier === 'all'
    ? badges
    : badges.filter(b => b.tier === selectedTier)

  const earned = filteredBadges.filter(b => b.isEarned).length
  const total = filteredBadges.length

  return (
    <div className="space-y-6">
      {/* Tier Filter */}
      <div className="flex flex-wrap gap-2">
        {tiers.map(tier => (
          <motion.button
            key={tier.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTier(tier.id)}
            className={`
              px-4 py-2 rounded-lg font-semibold text-sm transition-all capitalize
              ${selectedTier === tier.id
                ? `bg-${tier.color}-500 text-white shadow-lg`
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {tier.label}
          </motion.button>
        ))}
      </div>

      {/* Collection Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedTier === 'all' ? 'Total Collection' : `${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Badges`}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {earned} / {total}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Collected</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {Math.round((earned / total) * 100)}%
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(earned / total) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.length > 0 ? (
          filteredBadges.map((badge) => (
            <BadgeCard
              key={badge.badgeId}
              badge={badge}
              isEarned={badge.isEarned}
              earnedAt={badge.earnedAt}
              isEquipped={badge.isEquipped}
              onEquip={onEquipBadge}
              onClick={() => onBadgeClick && onBadgeClick(badge)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No badges found in this tier.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BadgeCollection
