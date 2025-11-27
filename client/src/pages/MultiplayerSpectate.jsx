import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMultiplayerSocket } from '../hooks/useMultiplayerSocket'
import { Eye, ArrowLeft, Users } from 'lucide-react'
import { LiveChat } from '../components/multiplayer/LiveChat'
import { MoveList } from '../components/multiplayer/MoveList'
import { SpectatorCounter } from '../components/multiplayer/SpectatorCounter'
import { PlayerPanel } from '../components/multiplayer/PlayerPanel'
import { toast } from 'react-hot-toast'

export const MultiplayerSpectate = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { joinSpectate, leaveSpectate } = useMultiplayerSocket()
  
  const [hasJoined, setHasJoined] = useState(false)

  const {
    playerBoard,
    opponentInfo,
    gameStatus,
    boardSize,
    isSpectating,
    spectatorCount
  } = useSelector((state) => state.multiplayerGame)

  const { isConnected } = useSelector((state) => state.multiplayerGame)

  useEffect(() => {
    if (!hasJoined && isConnected) {
      joinSpectate(roomId)
      setHasJoined(true)
      toast.success('Joined as spectator')
    }

    return () => {
      if (hasJoined) {
        leaveSpectate(roomId)
      }
    }
  }, [roomId, joinSpectate, leaveSpectate, hasJoined, isConnected])

  const handleLeave = () => {
    leaveSpectate(roomId)
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

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    aspect-square flex items-center justify-center text-2xl
                    transition-all duration-200 rounded-md
                    ${isLight ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-amber-700 dark:bg-amber-900'}
                    ${hasQueen ? 'scale-110' : ''}
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
          <p className="text-gray-400">Joining as spectator</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Spectator Badge */}
        <div className="bg-purple-600 text-white px-6 py-3 rounded-full shadow-lg inline-flex items-center gap-2 mb-6">
          <Eye className="w-5 h-5" />
          <span className="font-bold">You are watching this match</span>
          <SpectatorCounter />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Live Match Spectate
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Room ID: {roomId?.substring(0, 8)}...
            </p>
          </div>

          <button
            onClick={handleLeave}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Leave
          </button>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Side - Game Board */}
          <div className="space-y-6">
            {/* Players */}
            <div className="grid md:grid-cols-2 gap-4">
              <PlayerPanel
                player={opponentInfo}
                isActive={gameStatus === 'in-progress'}
                side="player1"
              />
              <PlayerPanel
                player={opponentInfo}
                isActive={false}
                side="player2"
              />
            </div>

            {/* Board */}
            {renderBoard()}

            {/* Match Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Match Status</div>
              <div className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {gameStatus.replace(/-/g, ' ')}
              </div>
            </div>
          </div>

          {/* Right Side - Move List */}
          <div className="h-[calc(100vh-200px)]">
            <MoveList />
          </div>
        </div>

        {/* Spectator Chat */}
        <LiveChat isSpectator={true} />
      </div>
    </div>
  )
}
