import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Eye, Users } from 'lucide-react'

export const SpectatorCounter = () => {
  const [pulse, setPulse] = useState(false)
  const [prevCount, setPrevCount] = useState(0)

  const { spectatorCount, spectators, isSpectating } = useSelector(
    (state) => state.multiplayerGame
  )

  useEffect(() => {
    if (spectatorCount > prevCount) {
      // New spectator joined - trigger pulse animation
      setPulse(true)
      setTimeout(() => setPulse(false), 1000)
    }
    setPrevCount(spectatorCount)
  }, [spectatorCount, prevCount])

  if (spectatorCount === 0 && !isSpectating) {
    return null
  }

  return (
    <div className="relative group">
      <div 
        className={`
          flex items-center gap-2 px-3 py-2 rounded-full
          bg-purple-100 dark:bg-purple-900/30 
          border-2 border-purple-300 dark:border-purple-700
          transition-all duration-300
          ${pulse ? 'animate-pulse scale-110' : 'scale-100'}
          hover:shadow-lg cursor-pointer
        `}
      >
        <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
          {spectatorCount}
        </span>
        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      </div>

      {/* Tooltip on Hover */}
      {spectatorCount > 0 && (
        <div className="
          absolute top-full mt-2 left-1/2 transform -translate-x-1/2
          bg-gray-900 text-white text-xs rounded-lg px-3 py-2 
          whitespace-nowrap opacity-0 group-hover:opacity-100
          transition-opacity duration-200 pointer-events-none
          z-50
        ">
          <div className="font-semibold mb-1">
            {spectatorCount} {spectatorCount === 1 ? 'person is' : 'people are'} watching
          </div>
          {spectators.length > 0 && spectators.length <= 5 && (
            <div className="text-xs text-gray-300 space-y-1">
              {spectators.slice(0, 5).map((spec, index) => (
                <div key={index}>• {spec.username}</div>
              ))}
              {spectators.length > 5 && (
                <div className="text-gray-400">+ {spectators.length - 5} more</div>
              )}
            </div>
          )}
          
          {/* Tooltip Arrow */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
        </div>
      )}

      {/* Pulse Ring Animation */}
      {pulse && (
        <div className="absolute inset-0 rounded-full border-2 border-purple-500 animate-ping" />
      )}
    </div>
  )
}
