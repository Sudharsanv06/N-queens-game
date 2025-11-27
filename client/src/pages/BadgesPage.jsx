import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Shield, Award, Loader, CheckCircle } from 'lucide-react'
import BadgeCollection from '../components/achievements/BadgeCollection'
import { fetchUserBadges, equipBadge } from '../store/slices/badgeSlice'

const BadgesPage = () => {
  const dispatch = useDispatch()
  const { userBadges, total, earned, loading, error } = useSelector(state => state.badges)
  const [selectedBadge, setSelectedBadge] = useState(null)

  useEffect(() => {
    dispatch(fetchUserBadges())
  }, [dispatch])

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge)
  }

  const handleEquipBadge = (badgeId, equip) => {
    dispatch(equipBadge({ badgeId, equip }))
      .then(() => {
        dispatch(fetchUserBadges())
      })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">Error loading badges</p>
          <p className="text-gray-500 mt-2">{error.message || 'Please try again later'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-purple-500" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Badge Collection
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Earn and equip badges to show off your achievements
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Badges</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {total}
                </p>
              </div>
              <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Earned</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {earned}
                </p>
              </div>
              <Award className="w-12 h-12 text-purple-300 dark:text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Collection Rate</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {Math.round((earned / total) * 100)}%
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-300 dark:text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Badge Collection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <BadgeCollection
            badges={userBadges}
            onBadgeClick={handleBadgeClick}
            onEquipBadge={handleEquipBadge}
          />
        </motion.div>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          onClick={() => setSelectedBadge(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="text-center">
              <div className={`
                w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl mb-4
                ${selectedBadge.tier === 'bronze' && 'bg-gradient-to-br from-orange-400 to-orange-600'}
                ${selectedBadge.tier === 'silver' && 'bg-gradient-to-br from-gray-300 to-gray-500'}
                ${selectedBadge.tier === 'gold' && 'bg-gradient-to-br from-yellow-400 to-yellow-600'}
                ${selectedBadge.tier === 'platinum' && 'bg-gradient-to-br from-blue-400 to-blue-600'}
                ${selectedBadge.tier === 'diamond' && 'bg-gradient-to-br from-purple-400 to-purple-600'}
              `}>
                {selectedBadge.icon}
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedBadge.name}
              </h2>
              
              <div className="mb-4">
                <span className={`
                  px-4 py-1 rounded-full text-sm font-bold uppercase
                  ${selectedBadge.tier === 'bronze' && 'bg-orange-200 text-orange-800'}
                  ${selectedBadge.tier === 'silver' && 'bg-gray-300 text-gray-800'}
                  ${selectedBadge.tier === 'gold' && 'bg-yellow-300 text-yellow-900'}
                  ${selectedBadge.tier === 'platinum' && 'bg-blue-200 text-blue-800'}
                  ${selectedBadge.tier === 'diamond' && 'bg-purple-200 text-purple-800'}
                `}>
                  {selectedBadge.tier}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedBadge.description}
              </p>
              
              {selectedBadge.unlockCondition && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unlock Condition</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedBadge.unlockCondition.description}
                  </p>
                </div>
              )}

              {selectedBadge.isEarned && selectedBadge.earnedAt && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default BadgesPage
