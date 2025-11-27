import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Search, Loader, X, Users, Clock, TrendingUp } from 'lucide-react'
import { useMatchmaking } from '../hooks/useMatchmaking'

export const Matchmaking = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'standard'

  const [dots, setDots] = useState('')

  const {
    isInQueue,
    waitTime,
    isSearching,
    selectedMatchType,
    preferences,
    joinQueue,
    leaveQueue
  } = useMatchmaking()

  const { elo } = useSelector((state) => state.elo)
  const { user } = useSelector((state) => state.auth)

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Auto-join queue on mount
  useEffect(() => {
    if (!isInQueue && user) {
      joinQueue(mode)
    }
  }, []) // Empty deps - only run once

  const handleCancel = () => {
    leaveQueue()
    navigate('/multiplayer')
  }

  const formatWaitTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getMatchTypeInfo = () => {
    const types = {
      standard: { name: 'Quick Match', color: 'blue', boardSize: '8×8', time: 'Unlimited' },
      speed: { name: 'Speed Mode', color: 'orange', boardSize: '6×6', time: '2 minutes' },
      'puzzle-duel': { name: 'Puzzle Duel', color: 'purple', boardSize: '8×8', time: 'Varies' }
    }
    return types[mode] || types.standard
  }

  const matchInfo = getMatchTypeInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r from-${matchInfo.color}-500 to-${matchInfo.color}-600 p-8 text-white text-center relative`}>
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 animate-pulse" />
                </div>
                {/* Scanning animation */}
                <div className="absolute inset-0 border-4 border-white/30 rounded-full animate-ping" />
                <div className="absolute inset-0 border-4 border-white/20 rounded-full animate-pulse" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">
              Finding Opponent{dots}
            </h1>
            <p className="text-lg opacity-90">
              {matchInfo.name}
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Wait Time */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Searching for
                </span>
              </div>
              <div className="text-5xl font-bold text-gray-900 dark:text-white font-mono">
                {formatWaitTime(waitTime)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Average wait: ~30 seconds
              </div>
            </div>

            {/* Match Info Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Board Size</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {matchInfo.boardSize}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Limit</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {matchInfo.time}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your ELO</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {elo || 1200}
                </div>
              </div>
            </div>

            {/* ELO Range */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border-2 border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Matching ELO Range
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {elo - (preferences.eloRange || 200)} - {elo + (preferences.eloRange || 200)}
                    <span className="ml-2 opacity-75">(expands over time)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Indicator */}
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Searching for players...
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full animate-progress-bar" />
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel Search
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white text-sm">
          <div className="font-semibold mb-2">💡 While you wait:</div>
          <ul className="space-y-1 opacity-90">
            <li>• The system matches you with players of similar skill</li>
            <li>• Your ELO range expands every 10 seconds</li>
            <li>• Average match time is under 30 seconds</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-progress-bar {
          animation: progress-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
