import React, { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export const MoveList = () => {
  const messagesEndRef = useRef(null)
  
  const { playerMoves, opponentMoves, playerSide } = useSelector(
    (state) => state.multiplayerGame
  )
  const { user } = useSelector((state) => state.auth)

  // Combine and sort moves by timestamp
  const allMoves = [
    ...playerMoves.map(m => ({ ...m, player: 'you', side: playerSide })),
    ...opponentMoves.map(m => ({ ...m, player: 'opponent', side: playerSide === 'player1' ? 'player2' : 'player1' }))
  ].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [allMoves])

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--'
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  if (allMoves.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">No moves yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Move History
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {allMoves.length} move{allMoves.length !== 1 ? 's' : ''} played
        </p>
      </div>

      {/* Move List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {allMoves.map((move, index) => {
          const isPlayerMove = move.player === 'you'
          const isValid = move.valid !== false

          return (
            <div
              key={index}
              className={`
                flex items-start gap-3 p-3 rounded-lg border
                ${isPlayerMove 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                }
                ${!isValid ? 'opacity-50 line-through' : ''}
                transition-all duration-300
                hover:shadow-md
              `}
            >
              {/* Move Number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300">
                {index + 1}
              </div>

              {/* Move Details */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold text-sm ${isPlayerMove ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {isPlayerMove ? 'You' : 'Opponent'}
                  </span>
                  {isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded">
                    Row {move.row + 1}, Col {move.col + 1}
                  </span>
                  {move.queensPlaced !== undefined && (
                    <span className="ml-2">
                      ({move.queensPlaced}/8 ♛)
                    </span>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-400 mt-1">
                  {formatTime(move.timestamp)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Your Moves: {playerMoves.length}</span>
          <span>Opponent Moves: {opponentMoves.length}</span>
        </div>
      </div>
    </div>
  )
}
