import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMultiplayerSocket } from '../hooks/useMultiplayerSocket'
import { PlayerPanel } from '../components/multiplayer/PlayerPanel'
import { TimerSync } from '../components/multiplayer/TimerSync'
import { MoveList } from '../components/multiplayer/MoveList'
import { SpectatorCounter } from '../components/multiplayer/SpectatorCounter'
import { LiveChat } from '../components/multiplayer/LiveChat'
import { GameResultModal } from '../components/multiplayer/GameResultModal'
import { RematchButton } from '../components/multiplayer/RematchButton'
import { LogOut, Flag } from 'lucide-react'
import { toast } from 'react-hot-toast'

export const MultiplayerRoom = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { makeMove, resignGame, markReady, leaveRoom: leaveRoomSocket } = useMultiplayerSocket()

  const [selectedCell, setSelectedCell] = useState(null)
  const [isReady, setIsReady] = useState(false)

  const { 
    playerBoard,
    opponentInfo,
    gameStatus,
    playerSide,
    playerTimeRemaining,
    opponentTimeRemaining,
    matchType,
    boardSize,
    isConnected
  } = useSelector((state) => state.multiplayerGame)

  const { user } = useSelector((state) => state.auth)

  // Auto-mark ready after 2 seconds
  useEffect(() => {
    if (gameStatus === 'waiting' && !isReady) {
      const timer = setTimeout(() => {
        markReady()
        setIsReady(true)
        toast.success('Ready!')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [gameStatus, isReady, markReady])

  const handleCellClick = (row, col) => {
    if (gameStatus !== 'in-progress') return
    if (!playerBoard) return

    // Check if it's a valid move (simple client-side check)
    if (playerBoard[row][col] === 1) {
      toast.error('Queen already placed here!')
      return
    }

    makeMove(row, col)
    setSelectedCell({ row, col })
  }

  const handleResign = () => {
    if (window.confirm('Are you sure you want to resign?')) {
      resignGame()
      toast.info('You resigned from the match')
    }
  }

  const handleLeaveRoom = () => {
    if (gameStatus === 'in-progress') {
      if (!window.confirm('Match is in progress. Leaving will count as a loss. Continue?')) {
        return
      }
    }
    leaveRoomSocket(roomId)
    navigate('/multiplayer')
  }

  const renderBoard = () => {
    const size = boardSize || 8
    const board = playerBoard || Array(size).fill(null).map(() => Array(size).fill(0))

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4">
        <div 
          className="grid gap-1 mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            maxWidth: '600px'
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0
              const hasQueen = cell === 1
              const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`
                    aspect-square flex items-center justify-center text-2xl cursor-pointer
                    transition-all duration-200 rounded-md
                    ${isLight ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-amber-700 dark:bg-amber-900'}
                    ${isSelected ? 'ring-4 ring-blue-500 scale-110' : ''}
                    ${hasQueen ? 'scale-110' : 'hover:scale-105'}
                    ${gameStatus === 'in-progress' && !hasQueen ? 'hover:bg-blue-200 dark:hover:bg-blue-700' : ''}
                  `}
                >
                  {hasQueen && '♛'}
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="text-center text-white">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
          <p className="text-gray-400">Establishing connection to game server</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {matchType === 'standard' ? 'Quick Match' : 
               matchType === 'speed' ? 'Speed Mode' : 'Puzzle Duel'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Room ID: {roomId?.substring(0, 8)}...
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SpectatorCounter />
            
            {gameStatus === 'in-progress' && (
              <button
                onClick={handleResign}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
              >
                <Flag className="w-4 h-4" />
                Resign
              </button>
            )}

            <button
              onClick={handleLeaveRoom}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" />
              Leave
            </button>
          </div>
        </div>

        {/* Main Game Layout */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Side - Game Board */}
          <div className="space-y-6">
            {/* Opponent Panel */}
            <PlayerPanel
              player={opponentInfo}
              isActive={gameStatus === 'in-progress' && playerSide === 'player2'}
              timeRemaining={opponentTimeRemaining}
              side="player2"
            />

            {/* Game Board */}
            {renderBoard()}

            {/* Your Panel */}
            <PlayerPanel
              player={{
                userId: user?._id || user?.id,
                username: user?.username,
                elo: user?.elo,
                rank: user?.rank
              }}
              isActive={gameStatus === 'in-progress' && playerSide === 'player1'}
              timeRemaining={playerTimeRemaining}
              side="player1"
            />

            {/* Timers */}
            {(playerTimeRemaining !== null || opponentTimeRemaining !== null) && (
              <div className="grid grid-cols-2 gap-4">
                <TimerSync side={playerSide} />
                <TimerSync side={playerSide === 'player1' ? 'player2' : 'player1'} />
              </div>
            )}
          </div>

          {/* Right Side - Move List */}
          <div className="h-[calc(100vh-200px)]">
            <MoveList />
          </div>
        </div>

        {/* Game Status Banner */}
        {gameStatus === 'waiting' && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
            Waiting for opponent...
          </div>
        )}

        {gameStatus === 'ready' && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg animate-pulse">
            Both players ready! Starting soon...
          </div>
        )}

        {/* Chat */}
        <LiveChat />

        {/* Game Result Modal */}
        <GameResultModal />

        {/* Rematch Button */}
        {gameStatus === 'finished' && <RematchButton />}
      </div>
    </div>
  )
}
