import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RefreshCw, Check, X, Clock } from 'lucide-react'
import { useMultiplayerSocket } from '../../hooks/useMultiplayerSocket'
import { rejectRematch, closeRematchPrompt } from '../../store/slices/multiplayerSliceNew'

export const RematchButton = () => {
  const dispatch = useDispatch()
  const { requestRematch, acceptRematch, rejectRematch: rejectRematchSocket } = useMultiplayerSocket()

  const { 
    gameStatus, 
    rematchRequested, 
    rematchBy, 
    showRematchPrompt,
    playerSide
  } = useSelector((state) => state.multiplayerGame)

  const { user } = useSelector((state) => state.auth)

  // Only show after game is finished
  if (gameStatus !== 'finished' && !showRematchPrompt) {
    return null
  }

  const isOwnRequest = rematchBy === playerSide
  const isOpponentRequest = rematchRequested && !isOwnRequest

  const handleRequestRematch = () => {
    requestRematch()
  }

  const handleAccept = () => {
    acceptRematch()
    dispatch(closeRematchPrompt())
  }

  const handleReject = () => {
    rejectRematchSocket()
    dispatch(rejectRematch())
  }

  // Show prompt if opponent requested
  if (showRematchPrompt && isOpponentRequest) {
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-blue-500 p-4 max-w-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Rematch Request
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your opponent wants a rematch!
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Accept
            </button>
            <button
              onClick={handleReject}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Decline
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show status if waiting for opponent response
  if (rematchRequested && isOwnRequest) {
    return (
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 rounded-lg px-6 py-3 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            Waiting for opponent to accept rematch...
          </span>
        </div>
      </div>
    )
  }

  // Show request button
  return (
    <button
      onClick={handleRequestRematch}
      disabled={rematchRequested}
      className="
        fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40
        px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 
        hover:from-blue-700 hover:to-purple-700
        disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
        text-white font-bold rounded-full shadow-lg
        flex items-center gap-2
        transition-all duration-300 hover:scale-105
        animate-bounce-slow
      "
    >
      <RefreshCw className={`w-5 h-5 ${rematchRequested ? 'animate-spin' : ''}`} />
      {rematchRequested ? 'Rematch Requested' : 'Request Rematch'}
    </button>
  )
}
