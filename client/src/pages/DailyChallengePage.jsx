import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  fetchCurrentChallenge, 
  startChallenge 
} from '../store/slices/dailyChallengeSlice'
import { fetchUserStreak } from '../store/slices/streakSlice'
import ChallengeCard from '../components/dailyChallenge/ChallengeCard'
import StreakCounter from '../components/dailyChallenge/StreakCounter'
import TimerBar from '../components/dailyChallenge/TimerBar'
import { Trophy, Clock, Target, Zap, Calendar } from 'lucide-react'

function DailyChallengePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentChallenge, userProgress, loading, error } = useSelector(state => state.dailyChallenge)
  const { currentStreak, completedToday } = useSelector(state => state.streak)
  const { isAuthenticated } = useSelector(state => state.auth)
  const [timeRemaining, setTimeRemaining] = useState(null)

  useEffect(() => {
    dispatch(fetchCurrentChallenge())
    if (isAuthenticated) {
      dispatch(fetchUserStreak())
    }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (currentChallenge?.timeRemaining) {
      setTimeRemaining(currentChallenge.timeRemaining)
      
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            clearInterval(interval)
            return 0
          }
          return prev - 1000
        })
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [currentChallenge])

  const handleStartChallenge = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (completedToday) {
      // Already completed today
      return
    }

    try {
      await dispatch(startChallenge(currentChallenge._id)).unwrap()
      navigate('/daily-challenge/play')
    } catch (error) {
      console.error('Failed to start challenge:', error)
    }
  }

  const formatTimeRemaining = (ms) => {
    if (!ms) return '00:00:00'
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const getChallengeIcon = (type) => {
    switch (type) {
      case 'speedrun': return <Zap className="w-6 h-6" />
      case 'hardcore': return <Trophy className="w-6 h-6" />
      case 'puzzle': return <Target className="w-6 h-6" />
      default: return <Clock className="w-6 h-6" />
    }
  }

  if (loading && !currentChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md text-center"
        >
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-white">{error}</p>
        </motion.div>
      </div>
    )
  }

  if (!currentChallenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 max-w-md text-center"
        >
          <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Challenge Available</h2>
          <p className="text-gray-300">Check back tomorrow for a new daily challenge!</p>
        </motion.div>
      </div>
    )
  }

  const canPlay = isAuthenticated && !completedToday && userProgress?.status !== 'completed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Daily Challenge
          </h1>
          <p className="text-gray-300 text-lg">
            Complete today's challenge to earn XP and continue your streak!
          </p>
        </motion.div>

        {/* Streak Counter */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <StreakCounter />
          </motion.div>
        )}

        {/* Time Remaining */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center justify-center gap-2 text-white">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Challenge expires in:</span>
            <span className="text-2xl font-bold text-purple-400 font-mono">
              {formatTimeRemaining(timeRemaining)}
            </span>
          </div>
          <TimerBar 
            totalTime={24 * 60 * 60 * 1000} 
            remaining={timeRemaining || 0}
          />
        </motion.div>

        {/* Challenge Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ChallengeCard
            challenge={currentChallenge}
            userProgress={userProgress}
            onStart={handleStartChallenge}
            canPlay={canPlay}
            completedToday={completedToday}
          />
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center"
          >
            <div className="text-purple-400 mb-2">
              {getChallengeIcon(currentChallenge.type)}
            </div>
            <h3 className="text-white font-semibold mb-1">Type</h3>
            <p className="text-gray-300 capitalize">{currentChallenge.type}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center"
          >
            <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">Reward</h3>
            <p className="text-gray-300">{currentChallenge.rewardXP} XP</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center"
          >
            <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">Difficulty</h3>
            <p className="text-gray-300 capitalize">{currentChallenge.difficulty}</p>
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center gap-4 mt-8"
        >
          <button
            onClick={() => navigate('/daily-challenge/history')}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
          >
            View History
          </button>
          <button
            onClick={() => navigate('/daily-challenge/stats')}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
          >
            My Stats
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default DailyChallengePage
