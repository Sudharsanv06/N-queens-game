import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function FloatingXP({ xpAmount, onComplete, x, y }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      if (onComplete) setTimeout(onComplete, 300)
    }, 1500)
    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 0 }}
      animate={{ opacity: 1, scale: 1.2, y: -60 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: x || '50%',
        top: y || '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -10, 10, 0]
          }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-[#F5B800] to-[#FFD700] rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        >
          <span className="text-xl font-bold text-black">+{xpAmount}</span>
        </motion.div>
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5 }}
          className="text-xs text-[#F5B800] font-semibold mt-1"
        >
          XP
        </motion.span>
      </div>
    </motion.div>
  )
}

export default FloatingXP