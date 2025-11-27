import { motion } from 'framer-motion'

function TimerBar({ totalTime, remaining }) {
  const percentage = (remaining / totalTime) * 100

  const getColor = () => {
    if (percentage > 50) return 'from-green-500 to-emerald-500'
    if (percentage > 25) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mt-2">
      <motion.div
        className={`h-full bg-gradient-to-r ${getColor()}`}
        initial={{ width: '100%' }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

export default TimerBar
