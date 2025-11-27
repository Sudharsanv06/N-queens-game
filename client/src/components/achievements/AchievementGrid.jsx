import React, { useState } from 'react'
import { motion } from 'framer-motion'
import AchievementCard from './AchievementCard'

const AchievementGrid = ({ achievements, onAchievementClick }) => {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All', icon: '🎯' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'puzzle', label: 'Puzzle', icon: '🧩' }
  ]

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory)

  const completed = filteredAchievements.filter(a => a.isCompleted).length
  const total = filteredAchievements.length

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat.id)}
            className={`
              px-4 py-2 rounded-lg font-semibold text-sm transition-all
              ${selectedCategory === cat.id
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.label}
          </motion.button>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCategory === 'all' ? 'Total' : categories.find(c => c.id === selectedCategory)?.label} Progress
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {completed} / {total}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Completion</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round((completed / total) * 100)}%
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completed / total) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.achievementId}
              achievement={achievement}
              isCompleted={achievement.isCompleted}
              progress={achievement.progress}
              progressPercentage={achievement.progressPercentage}
              onClick={() => onAchievementClick && onAchievementClick(achievement)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No achievements found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AchievementGrid
