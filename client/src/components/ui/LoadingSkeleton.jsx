import React from 'react'
import { motion } from 'framer-motion'

// Skeleton for any page/component
export const Skeleton = ({ className = '', variant = 'rect', width, height }) => {
  const baseClasses = 'bg-gradient-to-r from-[#2A1A0A] via-[#3A2A1A] to-[#2A1A0A] animate-pulse rounded-lg'
  
  const styles = {
    rect: { width: width || '100%', height: height || '100%' },
    circle: { width: width || '48px', height: height || '48px', borderRadius: '50%' },
    text: { width: width || '100%', height: height || '16px' },
    card: { width: width || '100%', height: height || '200px', borderRadius: '12px' },
    avatar: { width: width || '40px', height: height || '40px', borderRadius: '50%' }
  }
  
  return (
    <div className={`${baseClasses} ${className}`} style={styles[variant] || styles.rect}>
      <div className="opacity-0">Loading...</div>
    </div>
  )
}

// Page skeleton
export const PageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#0C0505] to-[#1A0F0A] py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <Skeleton variant="text" width="200px" height="32px" className="mb-2" />
      <Skeleton variant="text" width="300px" height="16px" className="mb-8" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant="card" height="100px" />
        ))}
      </div>
      
      <Skeleton variant="card" height="300px" className="mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Skeleton variant="card" height="350px" />
        <Skeleton variant="card" height="350px" />
      </div>
    </div>
  </div>
)

// Game board skeleton
export const GameBoardSkeleton = ({ boardSize = 8 }) => (
  <div className="flex flex-col items-center">
    <div className="flex gap-2 mb-4">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} variant="card" width="80px" height="60px" />
      ))}
    </div>
    <div className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-4">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)`, gap: '2px' }}>
        {Array(boardSize * boardSize).fill(0).map((_, i) => (
          <Skeleton key={i} variant="rect" width="40px" height="40px" />
        ))}
      </div>
    </div>
  </div>
)

// Leaderboard skeleton
export const LeaderboardSkeleton = () => (
  <div className="bg-[#1E1010] border border-[#F5B800]/15 rounded-xl p-5">
    <Skeleton variant="text" width="150px" height="24px" className="mb-4" />
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="flex items-center gap-3 mb-3 p-3 border-b border-[#F5B800]/10">
        <Skeleton variant="circle" width="32px" height="32px" />
        <Skeleton variant="text" width="120px" height="14px" />
        <Skeleton variant="text" width="50px" height="14px" className="ml-auto" />
      </div>
    ))}
  </div>
)

export default Skeleton