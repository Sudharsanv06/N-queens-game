import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Trophy, TrendingUp, TrendingDown, Crown, Target, ArrowRight, X } from 'lucide-react'
import { closeResultModal } from '../../store/slices/multiplayerSlice'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

export const GameResultModal = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(false)

  const { 
    showResultModal, 
    winner, 
    winReason, 
    matchDuration, 
    eloChange 
  } = useSelector((state) => state.multiplayerGame)

  const { user } = useSelector((state) => state.auth)
  const { elo, rank } = useSelector((state) => state.elo)

  const isWinner = winner?.userId === user?._id || winner?.userId === user?.id
  const isDraw = winReason === 'draw'

  useEffect(() => {
    if (showResultModal && isWinner && !isDraw) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [showResultModal, isWinner, isDraw])

  const handleClose = () => {
    dispatch(closeResultModal())
  }

  const handleRematch = () => {
    handleClose()
    // Rematch logic handled by RematchButton
  }

  const handleLeaderboard = () => {
    handleClose()
    navigate('/multiplayer/leaderboard')
  }

  const handleExit = () => {
    handleClose()
    navigate('/multiplayer')
  }

  if (!showResultModal) return null

  const formatDuration = (ms) => {
    if (!ms) return '--:--'
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getResultConfig = () => {
    if (isDraw) {
      return {
        title: '⚖️ Draw!',
        subtitle: 'Well played by both sides',
        bgColor: 'bg-gradient-to-br from-gray-500 to-gray-700',
        textColor: 'text-white',
        icon: <Target className="w-16 h-16" />
      }
    }
    if (isWinner) {
      return {
        title: '🎉 Victory!',
        subtitle: 'Excellent performance!',
        bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
        textColor: 'text-white',
        icon: <Trophy className="w-16 h-16 text-yellow-300" />
      }
    }
    return {
      title: '😔 Defeat',
      subtitle: 'Better luck next time',
      bgColor: 'bg-gradient-to-br from-red-500 to-rose-600',
      textColor: 'text-white',
      icon: <Target className="w-16 h-16 text-red-300" />
    }
  }

  const config = getResultConfig()
  const eloChangeValue = eloChange || 0
  const eloPositive = eloChangeValue > 0

  return (
    <>
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          {/* Header */}
          <div className={`${config.bgColor} ${config.textColor} p-8 text-center relative`}>
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-4">
              {config.icon}
            </div>

            <h2 className="text-3xl font-bold mb-2">{config.title}</h2>
            <p className="text-lg opacity-90">{config.subtitle}</p>

            {/* Reason */}
            {winReason && (
              <p className="text-sm opacity-75 mt-2 capitalize">
                {winReason.replace(/_/g, ' ')}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="p-6 space-y-4">
            {/* ELO Change */}
            <div className={`
              flex items-center justify-between p-4 rounded-lg
              ${eloPositive 
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
              }
            `}>
              <div className="flex items-center gap-2">
                {eloPositive ? (
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  ELO Rating
                </span>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${eloPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {eloPositive ? '+' : ''}{eloChangeValue}
                </div>
                <div className="text-sm text-gray-500">
                  Now: {elo + eloChangeValue}
                </div>
              </div>
            </div>

            {/* Current Rank */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Current Rank
                </span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400 capitalize">
                  {rank}
                </div>
              </div>
            </div>

            {/* Match Duration */}
            {matchDuration && (
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Match Duration</span>
                <span className="font-mono font-semibold">{formatDuration(matchDuration)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 pt-0 space-y-3">
            <button
              onClick={handleLeaderboard}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              View Leaderboard
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleExit}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
