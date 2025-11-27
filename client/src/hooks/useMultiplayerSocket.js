import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import {
  setCurrentRoom,
  leaveRoom,
  setPlayerSide,
  setOpponentInfo,
  updateGameStatus,
  initializeBoard,
  updatePlayerBoard,
  updateOpponentBoard,
  addPlayerMove,
  addOpponentMove,
  setPlayerTime,
  setOpponentTime,
  addChatMessage,
  updateSpectatorCount,
  addSpectator,
  removeSpectator,
  setConnectionStatus,
  setReconnecting,
  setOpponentConnected,
  setGameResult,
  setRematchRequested,
  setError
} from '../store/slices/multiplayerSliceNew'
import {
  setMatchFound,
  clearMatchData,
  updateQueueStatus,
  leaveQueue as leaveMatchmakingQueue
} from '../store/slices/matchmakingSlice'
import {
  updateElo,
  updateRank,
  addMatchToHistory,
  updateStats
} from '../store/slices/eloSlice'
import { toast } from 'react-hot-toast'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

/**
 * Custom hook for multiplayer Socket.io integration
 * Handles all WebSocket events, reconnection, and state management
 */
export const useMultiplayerSocket = () => {
  const dispatch = useDispatch()
  const socketRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 5

  const { user } = useSelector((state) => state.auth)
  const { currentRoom, roomId, playerSide } = useSelector((state) => state.multiplayerGame)
  const { isInQueue } = useSelector((state) => state.matchmaking)

  // Initialize socket connection
  const connect = useCallback(() => {
    if (!user) {
      console.warn('Cannot connect socket: User not authenticated')
      return
    }

    if (socketRef.current?.connected) {
      console.log('Socket already connected')
      return
    }

    const token = localStorage.getItem('token')
    
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    })

    const socket = socketRef.current

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id)
      dispatch(setConnectionStatus(true))
      dispatch(setReconnecting(false))
      reconnectAttemptsRef.current = 0

      // Authenticate
      socket.emit('authenticate', { userId: user._id || user.id })

      // Rejoin room if disconnected mid-game
      if (roomId && playerSide) {
        console.log('Rejoining room after reconnect:', roomId)
        socket.emit('reconnect_room', { roomId, userId: user._id || user.id })
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
      dispatch(setConnectionStatus(false))
      
      if (reason === 'io server disconnect') {
        // Server forced disconnect, try to reconnect
        socket.connect()
      }
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      reconnectAttemptsRef.current++
      
      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        toast.error('Failed to connect to game server')
        dispatch(setError('Connection failed. Please refresh the page.'))
      }
    })

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnecting... Attempt ${attemptNumber}`)
      dispatch(setReconnecting(true))
    })

    socket.on('reconnect', () => {
      console.log('✅ Reconnected successfully')
      toast.success('Reconnected to server')
      dispatch(setConnectionStatus(true))
      dispatch(setReconnecting(false))
    })

    socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed')
      toast.error('Could not reconnect to server')
      dispatch(setError('Reconnection failed. Please refresh.'))
    })

    // Matchmaking events
    socket.on('queue_joined', (data) => {
      console.log('Joined matchmaking queue:', data)
      toast.success(`Searching for ${data.matchType} match...`)
    })

    socket.on('queue_status', (data) => {
      dispatch(updateQueueStatus(data))
    })

    socket.on('match_found', (data) => {
      console.log('Match found!', data)
      dispatch(setMatchFound(data))
      dispatch(leaveMatchmakingQueue())
      toast.success(`Match found! vs ${data.opponent.name}`)
      
      // Auto-join room
      socket.emit('join_room', { roomId: data.roomId })
    })

    // Room events
    socket.on('room_joined', (data) => {
      console.log('Joined room:', data)
      dispatch(setCurrentRoom(data))
      dispatch(setOpponentInfo(data.opponent))
      dispatch(setPlayerSide(data.side))
      dispatch(initializeBoard({ boardSize: data.boardSize }))
      dispatch(setPlayerTime(data.timeLimit))
      dispatch(setOpponentTime(data.timeLimit))
      toast.success('Room joined! Get ready...')
    })

    socket.on('player_ready', (data) => {
      console.log('Player ready:', data)
      if (data.userId !== (user._id || user.id)) {
        toast.info(`${data.username} is ready!`)
      }
    })

    socket.on('game_started', (data) => {
      console.log('Game started!', data)
      dispatch(updateGameStatus('in-progress'))
      toast.success('Game started! Good luck!')
    })

    // Gameplay events
    socket.on('move_made', (data) => {
      console.log('Move made:', data)
      
      if (data.playerId === (user._id || user.id)) {
        // Own move
        dispatch(updatePlayerBoard({
          board: data.board,
          queensPlaced: data.queensPlaced
        }))
        dispatch(addPlayerMove(data.move))
      } else {
        // Opponent move
        dispatch(updateOpponentBoard({
          row: data.move.row,
          col: data.move.col,
          queensPlaced: data.queensPlaced
        }))
        dispatch(addOpponentMove(data.move))
      }
    })

    socket.on('invalid_move', (data) => {
      console.warn('Invalid move:', data)
      toast.error(data.message || 'Invalid move!')
    })

    socket.on('game_finished', (data) => {
      console.log('Game finished:', data)
      dispatch(updateGameStatus('finished'))
      
      const isWinner = data.winner.userId === (user._id || user.id)
      const message = isWinner 
        ? `🎉 Victory! +${data.eloChange?.winner || 0} ELO`
        : `😔 Defeat. ${data.eloChange?.loser || 0} ELO`
      
      toast(message, { duration: 5000 })
    })

    socket.on('match_results', (data) => {
      console.log('Match results:', data)
      dispatch(setGameResult(data))
      
      // Update ELO and stats
      const isWinner = data.winner.userId === (user._id || user.id)
      const eloChange = isWinner ? data.eloChange.winner : data.eloChange.loser
      
      dispatch(updateElo({
        elo: data.playerNewElo,
        change: eloChange,
        result: isWinner ? 'win' : 'loss'
      }))
      
      if (data.newRank) {
        dispatch(updateRank(data.newRank))
      }
      
      dispatch(addMatchToHistory({
        ...data,
        timestamp: Date.now()
      }))
      
      // Update stats
      dispatch(updateStats({
        elo: data.playerNewElo,
        wins: data.playerStats?.wins,
        losses: data.playerStats?.losses,
        totalMatches: data.playerStats?.totalMatches
      }))
    })

    // Chat events
    socket.on('chat_message', (data) => {
      dispatch(addChatMessage({
        username: data.username,
        message: data.message,
        timestamp: data.timestamp,
        isSpectator: data.isSpectator,
        isOwnMessage: data.userId === (user._id || user.id)
      }))
    })

    // Spectator events
    socket.on('spectate_joined', (data) => {
      console.log('Joined as spectator:', data)
      dispatch(setCurrentRoom(data))
      dispatch(initializeBoard({ boardSize: data.boardSize }))
      toast.info('Watching match...')
    })

    socket.on('spectator_joined', (data) => {
      dispatch(addSpectator(data))
      toast.info(`${data.username} is watching`)
    })

    socket.on('spectator_left', (data) => {
      dispatch(removeSpectator(data.userId))
    })

    socket.on('spectator_count_update', (data) => {
      dispatch(updateSpectatorCount(data.count))
    })

    // Connection state events
    socket.on('opponent_disconnected', (data) => {
      console.log('Opponent disconnected:', data)
      dispatch(setOpponentConnected(false))
      toast.warning('Opponent disconnected. Waiting...')
    })

    socket.on('opponent_reconnected', (data) => {
      console.log('Opponent reconnected:', data)
      dispatch(setOpponentConnected(true))
      toast.success('Opponent reconnected!')
    })

    // Rematch events
    socket.on('rematch_requested', (data) => {
      console.log('Rematch requested:', data)
      dispatch(setRematchRequested({ requestedBy: data.requestedBy }))
      toast.info('Opponent wants a rematch!')
    })

    socket.on('rematch_accepted', (data) => {
      console.log('Rematch accepted, new room:', data.newRoomId)
      toast.success('Rematch accepted! Starting new game...')
      // Room will be re-initialized via room_joined event
    })

    socket.on('rematch_rejected', (data) => {
      console.log('Rematch rejected')
      toast.info('Rematch declined')
      dispatch(setRematchRequested({ requestedBy: null }))
    })

    // Error events
    socket.on('error', (data) => {
      console.error('Socket error:', data)
      toast.error(data.message || 'An error occurred')
      dispatch(setError(data.message))
    })

    socket.on('connection_error', (data) => {
      console.error('Connection error:', data)
      toast.error(data.message || 'Connection error')
      dispatch(setError(data.message))
    })

    return socket
  }, [user, roomId, playerSide, dispatch])

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting socket...')
      socketRef.current.disconnect()
      socketRef.current = null
      dispatch(setConnectionStatus(false))
    }
  }, [dispatch])

  // Socket event emitters
  const joinMatchmakingQueue = useCallback((matchType, preferences = {}) => {
    if (!socketRef.current?.connected) {
      toast.error('Not connected to server')
      return
    }
    
    socketRef.current.emit('join_queue', {
      userId: user._id || user.id,
      matchType,
      preferences
    })
  }, [user])

  const leaveMatchmakingQueueSocket = useCallback(() => {
    if (!socketRef.current?.connected) return
    
    socketRef.current.emit('leave_queue', { userId: user._id || user.id })
  }, [user])

  const joinRoomSocket = useCallback((roomId) => {
    if (!socketRef.current?.connected) {
      toast.error('Not connected to server')
      return
    }
    
    socketRef.current.emit('join_room', { roomId })
  }, [])

  const leaveRoomSocket = useCallback((roomId) => {
    if (!socketRef.current?.connected) return
    
    socketRef.current.emit('leave_room', { roomId })
    dispatch(leaveRoom())
  }, [dispatch])

  const markReady = useCallback(() => {
    if (!socketRef.current?.connected || !roomId) return
    
    socketRef.current.emit('ready', { roomId })
  }, [roomId])

  const makeMove = useCallback((row, col) => {
    if (!socketRef.current?.connected || !roomId) {
      toast.error('Not connected')
      return
    }
    
    socketRef.current.emit('make_move', {
      roomId,
      row,
      col
    })
  }, [roomId])

  const sendChatMessage = useCallback((message) => {
    if (!socketRef.current?.connected || !roomId) return
    
    socketRef.current.emit('send_message', {
      roomId,
      message
    })
  }, [roomId])

  const resignGame = useCallback(() => {
    if (!socketRef.current?.connected || !roomId) return
    
    socketRef.current.emit('resign', { roomId })
  }, [roomId])

  const requestRematch = useCallback(() => {
    if (!socketRef.current?.connected || !roomId) return
    
    socketRef.current.emit('request_rematch', { roomId })
  }, [roomId])

  const acceptRematch = useCallback(() => {
    if (!socketRef.current?.connected || !roomId) return
    
    socketRef.current.emit('accept_rematch', { roomId })
  }, [roomId])

  const rejectRematch = useCallback(() => {
    if (!socketRef.current?.connected || !roomId) return
    
    socketRef.current.emit('reject_rematch', { roomId })
  }, [roomId])

  const joinSpectate = useCallback((roomId) => {
    if (!socketRef.current?.connected) {
      toast.error('Not connected to server')
      return
    }
    
    socketRef.current.emit('join_spectate', {
      roomId,
      userId: user._id || user.id
    })
  }, [user])

  const leaveSpectate = useCallback((roomId) => {
    if (!socketRef.current?.connected) return
    
    socketRef.current.emit('leave_spectate', { roomId })
  }, [])

  // Auto-connect on mount, disconnect on unmount
  useEffect(() => {
    if (user) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [user, connect, disconnect])

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    
    // Connection
    connect,
    disconnect,
    
    // Matchmaking
    joinMatchmakingQueue,
    leaveMatchmakingQueue: leaveMatchmakingQueueSocket,
    
    // Room
    joinRoom: joinRoomSocket,
    leaveRoom: leaveRoomSocket,
    markReady,
    
    // Gameplay
    makeMove,
    resignGame,
    
    // Chat
    sendChatMessage,
    
    // Rematch
    requestRematch,
    acceptRematch,
    rejectRematch,
    
    // Spectator
    joinSpectate,
    leaveSpectate
  }
}
