import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Trophy, Sparkles, ArrowRight } from 'lucide-react'

function LevelUpModal({ oldLevel, newLevel, onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onClose) setTimeout(onClose, 500)
    }, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  if (!visible) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: 0 }}
          animate={{ scale: 1, opacity: 1, rotateY: 360 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 300 }}
          className="relative"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5B800]/20 to-[#C41E1E]/20 rounded-3xl blur-2xl" />
          
          {/* Main Card */}
          <div className="relative bg-gradient-to-br from-[#1E1010] to-[#0C0505] border-2 border-[#F5B800] rounded-2xl p-8 text-center min-w-[320px] shadow-2xl">
            {/* Confetti Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  rotate: 0
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 200,
                  y: -100 - Math.random() * 100,
                  scale: 1,
                  rotate: Math.random() * 360
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  width: '8px',
                  height: '8px',
                  background: ['#F5B800', '#C41E1E', '#4ADE80', '#C084FC'][i % 4],
                  borderRadius: '2px'
                }}
              />
            ))}
            
            {/* Crown Icon */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="mb-4"
            >
              <Crown className="w-16 h-16 text-[#F5B800] mx-auto" />
            </motion.div>
            
            {/* Level Up Text */}
            <motion.h2
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-3xl font-bold font-['Cinzel'] text-[#F5B800] mb-2"
            >
              LEVEL UP!
            </motion.h2>
            
            {/* Level Display */}
            <div className="flex items-center justify-center gap-4 my-4">
              <div className="text-center">
                <div className="text-sm text-[#B8967A]/60">Previous</div>
                <div className="text-3xl font-bold text-[#FAF7F0]">Lv.{oldLevel}</div>
              </div>
              <motion.div
                animate={{ x: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <ArrowRight className="w-8 h-8 text-[#F5B800]" />
              </motion.div>
              <div className="text-center">
                <div className="text-sm text-[#B8967A]/60">Current</div>
                <div className="text-4xl font-bold text-[#F5B800]">Lv.{newLevel}</div>
              </div>
            </div>
            
            {/* Reward Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#F5B800]/10 border border-[#F5B800]/30 rounded-lg p-3 mb-4"
            >
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-4 h-4 text-[#F5B800]" />
                <span className="text-sm text-[#FAF7F0]">New achievements unlocked!</span>
                <Sparkles className="w-4 h-4 text-[#F5B800]" />
              </div>
            </motion.div>
            
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => {
                setVisible(false)
                if (onClose) onClose()
              }}
              className="mt-2 px-6 py-2 bg-gradient-to-r from-[#F5B800] to-[#C41E1E] hover:opacity-90 text-white font-semibold rounded-lg transition-all"
            >
              Continue Journey
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default LevelUpModal