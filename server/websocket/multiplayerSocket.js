import GameRoom from '../models/GameRoom.js'
import User from '../models/User.js'
import matchmakingService from '../services/matchmakingService.js'
import eloService from '../services/eloService.js'
import { createMultiplayerNotification } from '../controllers/multiplayerController.js'

class MultiplayerSocketHandler {
  constructor(io) {
    this.io = io
    this.userSockets = new Map() // userId -> socketId
    this.socketUsers = new Map() // socketId -> userId
    this.roomSockets = new Map() // roomId -> Set of socketIds
    this.disconnectTimers = new Map() // socketId -> timeout
    
    this.DISCONNECT_GRACE_PERIOD = 5000 // 5 seconds
    this.AUTO_WIN_TIMEOUT = 30000 // 30 seconds
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`)

      // Authentication
      socket.on('authenticate', async (data) => {
        await this.handleAuthenticate(socket, data)
      })

      // Matchmaking events
      socket.on('join_queue', async (data) => {
        await this.handleJoinQueue(socket, data)
      })

      socket.on('leave_queue', async () => {
        await this.handleLeaveQueue(socket)
      })

      // Room events
      socket.on('join_room', async (data) => {
        await this.handleJoinRoom(socket, data)
      })

      socket.on('leave_room', async () => {
        await this.handleLeaveRoom(socket)
      })

      socket.on('ready', async (data) => {
        await this.handleReady(socket, data)
      })

      socket.on('start_game', async () => {
        await this.handleStartGame(socket)
      })

      // Game events
      socket.on('make_move', async (data) => {
        await this.handleMakeMove(socket, data)
      })

      socket.on('resign', async () => {
        await this.handleResign(socket)
      })

      socket.on('offer_draw', async () => {
        await this.handleOfferDraw(socket)
      })

      socket.on('accept_draw', async () => {
        await this.handleAcceptDraw(socket)
      })

      socket.on('reject_draw', async () => {
        await this.handleRejectDraw(socket)
      })

      // Chat events
      socket.on('send_message', async (data) => {
        await this.handleSendMessage(socket, data)
      })

      // Spectator events
      socket.on('join_spectate', async (data) => {
        await this.handleJoinSpectate(socket, data)
      })

      socket.on('leave_spectate', async () => {
        await this.handleLeaveSpectate(socket)
      })

      // Rematch events
      socket.on('request_rematch', async () => {
        await this.handleRequestRematch(socket)
      })

      socket.on('accept_rematch', async () => {
        await this.handleAcceptRematch(socket)
      })

      socket.on('reject_rematch', async () => {
        await this.handleRejectRematch(socket)
      })

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })

      // Reconnect
      socket.on('reconnect_room', async (data) => {
        await this.handleReconnect(socket, data)
      })
    })

    // Process matchmaking queue periodically
    setInterval(() => {
      this.processMatchmaking()
    }, 2000) // Every 2 seconds

    console.log('✅ Multiplayer socket handler initialized')
  }

  // Authentication
  async handleAuthenticate(socket, data) {
    try {
      const { userId, username } = data

      if (!userId) {
        socket.emit('error', { message: 'User ID required' })
        return
      }

      // Store mappings
      this.userSockets.set(userId.toString(), socket.id)
      this.socketUsers.set(socket.id, userId.toString())

      socket.userId = userId.toString()
      socket.username = username

      console.log(`✅ User authenticated: ${username} (${userId})`)

      socket.emit('authenticated', { success: true })
    } catch (error) {
      console.error('Authentication error:', error)
      socket.emit('error', { message: 'Authentication failed' })
    }
  }

  // Matchmaking
  async handleJoinQueue(socket, data) {
    try {
      if (!socket.userId) {
        socket.emit('error', { message: 'Not authenticated' })
        return
      }

      const { matchType, preferences } = data

      const result = await matchmakingService.addToQueue(
        socket.userId,
        socket.id,
        matchType,
        preferences
      )

      if (result.success) {
        socket.emit('queue_joined', {
          matchType,
          queuePosition: result.queuePosition,
          estimatedWait: result.estimatedWaitTime
        })

        // If match found immediately
        if (result.match) {
          await this.createGameRoom(result.match)
        }
      } else {
        socket.emit('error', { message: result.error })
      }
    } catch (error) {
      console.error('Join queue error:', error)
      socket.emit('error', { message: 'Failed to join queue' })
    }
  }

  async handleLeaveQueue(socket) {
    try {
      if (!socket.userId) return

      matchmakingService.removeFromQueue(socket.userId)
      socket.emit('queue_left', { success: true })
    } catch (error) {
      console.error('Leave queue error:', error)
    }
  }

  // Process matchmaking
  async processMatchmaking() {
    try {
      const matches = await matchmakingService.processQueues()

      for (const match of matches) {
        await this.createGameRoom(match)
      }
    } catch (error) {
      console.error('Matchmaking processing error:', error)
    }
  }

  // Create game room from match
  async createGameRoom(match) {
    try {
      const { player1, player2, matchType } = match

      // Get full user data
      const [user1, user2] = await Promise.all([
        User.findById(player1.userId).select('username email avatarUrl'),
        User.findById(player2.userId).select('username email avatarUrl')
      ])

      // Determine board size and time limit based on match type
      let boardSize = 8
      let timeLimit = null

      if (matchType === 'speed') {
        boardSize = 6
        timeLimit = 120 // 2 minutes
      } else if (matchType === 'puzzle-duel') {
        // Will be set from puzzle
        boardSize = 8
      }

      // Create room
      const room = await GameRoom.createRoom(
        {
          userId: player1.userId,
          username: user1.username,
          avatarUrl: user1.avatarUrl,
          elo: player1.elo
        },
        {
          userId: player2.userId,
          username: user2.username,
          avatarUrl: user2.avatarUrl,
          elo: player2.elo
        },
        matchType,
        { boardSize, timeLimit }
      )

      // Assign socket IDs
      room.player1.socketId = player1.socketId
      room.player2.socketId = player2.socketId
      await room.save()

      // Join socket rooms
      const socket1 = this.io.sockets.sockets.get(player1.socketId)
      const socket2 = this.io.sockets.sockets.get(player2.socketId)

      if (socket1) {
        socket1.join(room.roomId)
        socket1.currentRoomId = room.roomId
      }
      if (socket2) {
        socket2.join(room.roomId)
        socket2.currentRoomId = room.roomId
      }

      // Track room sockets
      this.roomSockets.set(room.roomId, new Set([player1.socketId, player2.socketId]))

      // Notify players
      this.io.to(room.roomId).emit('match_found', {
        roomId: room.roomId,
        matchType,
        opponent: {
          player1: {
            userId: user1._id,
            username: user1.username,
            avatarUrl: user1.avatarUrl,
            elo: player1.elo
          },
          player2: {
            userId: user2._id,
            username: user2.username,
            avatarUrl: user2.avatarUrl,
            elo: player2.elo
          }
        },
        boardSize,
        timeLimit
      })

      // Create notifications
      await Promise.all([
        createMultiplayerNotification(player1.userId, 'match-found', { matchType, roomId: room.roomId }),
        createMultiplayerNotification(player2.userId, 'match-found', { matchType, roomId: room.roomId })
      ])

      console.log(`🎮 Game room created: ${room.roomId}`)
    } catch (error) {
      console.error('Error creating game room:', error)
    }
  }

  // Room events
  async handleJoinRoom(socket, data) {
    try {
      const { roomId } = data

      const room = await GameRoom.findOne({ roomId })
      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      // Join socket room
      socket.join(roomId)
      socket.currentRoomId = roomId

      // Track socket
      if (!this.roomSockets.has(roomId)) {
        this.roomSockets.set(roomId, new Set())
      }
      this.roomSockets.get(roomId).add(socket.id)

      socket.emit('room_joined', { room })
    } catch (error) {
      console.error('Join room error:', error)
      socket.emit('error', { message: 'Failed to join room' })
    }
  }

  async handleLeaveRoom(socket) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      socket.leave(roomId)
      delete socket.currentRoomId

      // Remove from tracking
      if (this.roomSockets.has(roomId)) {
        this.roomSockets.get(roomId).delete(socket.id)
      }

      // Notify room
      this.io.to(roomId).emit('player_left', { socketId: socket.id })
    } catch (error) {
      console.error('Leave room error:', error)
    }
  }

  async handleReady(socket, data) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      const room = await GameRoom.findOne({ roomId })
      if (!room) return

      // Update ready status
      if (room.player1.socketId === socket.id) {
        room.player1.isReady = data.isReady
      } else if (room.player2.socketId === socket.id) {
        room.player2.isReady = data.isReady
      }

      await room.save()

      // Check if both ready
      if (room.player1.isReady && room.player2.isReady) {
        room.status = 'ready'
        await room.save()

        // Auto-start game
        setTimeout(async () => {
          await room.startGame()
          this.io.to(roomId).emit('game_started', {
            startedAt: room.startedAt,
            timeLimit: room.timeLimit
          })
        }, 1000)
      }

      this.io.to(roomId).emit('player_ready', {
        socketId: socket.id,
        isReady: data.isReady,
        bothReady: room.player1.isReady && room.player2.isReady
      })
    } catch (error) {
      console.error('Ready error:', error)
    }
  }

  async handleStartGame(socket) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      const room = await GameRoom.findOne({ roomId })
      if (!room || room.status !== 'ready') return

      await room.startGame()

      this.io.to(roomId).emit('game_started', {
        startedAt: room.startedAt,
        timeLimit: room.timeLimit
      })

      console.log(`🎮 Game started in room: ${roomId}`)
    } catch (error) {
      console.error('Start game error:', error)
    }
  }

  // Game events
  async handleMakeMove(socket, data) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      const room = await GameRoom.findOne({ roomId })
      if (!room || room.status !== 'in-progress') {
        socket.emit('invalid_move', { error: 'Game not in progress' })
        return
      }

      const { row, col } = data

      // Determine which player
      const playerSide = room.player1.socketId === socket.id ? 'player1' : 'player2'

      // Make move (server-side validation)
      const result = room.makeMove(playerSide, row, col)

      if (!result.success) {
        socket.emit('invalid_move', { error: result.error, row, col })
        return
      }

      await room.save()

      // Broadcast move to both players
      this.io.to(roomId).emit('move_made', {
        player: playerSide,
        row,
        col,
        queensPlaced: result.queensPlaced
      })

      // Check if game finished
      if (room.status === 'finished') {
        await this.handleGameFinished(room)
      }
    } catch (error) {
      console.error('Make move error:', error)
      socket.emit('error', { message: 'Move failed' })
    }
  }

  async handleResign(socket) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      const room = await GameRoom.findOne({ roomId })
      if (!room || room.status !== 'in-progress') return

      // Determine winner (opponent)
      const resignedPlayer = room.player1.socketId === socket.id ? 'player1' : 'player2'
      const winningSide = resignedPlayer === 'player1' ? 'player2' : 'player1'
      const winner = room[winningSide].userId

      await room.finishGame(winner, winningSide, 'resignation')

      this.io.to(roomId).emit('game_finished', {
        reason: 'resignation',
        winner: winningSide,
        resignedPlayer
      })

      await this.handleGameFinished(room)
    } catch (error) {
      console.error('Resign error:', error)
    }
  }

  async handleOfferDraw(socket) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      const room = await GameRoom.findOne({ roomId })
      if (!room) return

      // Get opponent socket
      const opponentSocketId = room.player1.socketId === socket.id ?
        room.player2.socketId : room.player1.socketId

      const opponentSocket = this.io.sockets.sockets.get(opponentSocketId)
      if (opponentSocket) {
        opponentSocket.emit('draw_offered', {})
      }
    } catch (error) {
      console.error('Offer draw error:', error)
    }
  }

  async handleAcceptDraw(socket) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      const room = await GameRoom.findOne({ roomId })
      if (!room || room.status !== 'in-progress') return

      room.status = 'finished'
      room.winnerSide = 'draw'
      room.winReason = 'draw-agreement'
      room.finishedAt = new Date()
      
      if (room.startedAt) {
        room.duration = Math.floor((room.finishedAt - room.startedAt) / 1000)
      }

      await room.save()

      this.io.to(roomId).emit('game_finished', {
        reason: 'draw',
        winner: null
      })

      await this.handleGameFinished(room)
    } catch (error) {
      console.error('Accept draw error:', error)
    }
  }

  async handleRejectDraw(socket) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      // Notify opponent
      const room = await GameRoom.findOne({ roomId })
      if (!room) return

      const opponentSocketId = room.player1.socketId === socket.id ?
        room.player2.socketId : room.player1.socketId

      const opponentSocket = this.io.sockets.sockets.get(opponentSocketId)
      if (opponentSocket) {
        opponentSocket.emit('draw_rejected', {})
      }
    } catch (error) {
      console.error('Reject draw error:', error)
    }
  }

  // Handle game finished
  async handleGameFinished(room) {
    try {
      // Calculate ELO changes
      const isDraw = room.winnerSide === 'draw'
      
      const eloResult = await eloService.processMatchResult({
        player1Id: room.player1.userId,
        player2Id: room.player2.userId,
        winnerId: isDraw ? null : room.winner,
        matchType: room.matchType,
        duration: room.duration || 0,
        player1Moves: room.player1.moves,
        player2Moves: room.player2.moves,
        isDraw
      })

      // Broadcast final results
      this.io.to(room.roomId).emit('match_results', {
        winner: room.winnerSide,
        reason: room.winReason,
        duration: room.duration,
        player1: {
          userId: room.player1.userId,
          moves: room.player1.moves,
          queensPlaced: room.player1.queensPlaced,
          eloChange: eloResult.player1.eloChange,
          newElo: eloResult.player1.newElo,
          newRank: eloResult.player1.newRank
        },
        player2: {
          userId: room.player2.userId,
          moves: room.player2.moves,
          queensPlaced: room.player2.queensPlaced,
          eloChange: eloResult.player2.eloChange,
          newElo: eloResult.player2.newElo,
          newRank: eloResult.player2.newRank
        }
      })

      // Create notifications
      await Promise.all([
        createMultiplayerNotification(
          room.player1.userId,
          eloResult.player1.result === 'win' ? 'match-won' : 'match-lost',
          { eloChange: eloResult.player1.eloChange, roomId: room.roomId }
        ),
        createMultiplayerNotification(
          room.player2.userId,
          eloResult.player2.result === 'win' ? 'match-won' : 'match-lost',
          { eloChange: eloResult.player2.eloChange, roomId: room.roomId }
        )
      ])

      console.log(`✅ Game finished in room: ${room.roomId}`)
    } catch (error) {
      console.error('Handle game finished error:', error)
    }
  }

  // Chat
  async handleSendMessage(socket, data) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      const room = await GameRoom.findOne({ roomId })
      if (!room) return

      const { message } = data

      const isSpectator = room.player1.socketId !== socket.id && 
                         room.player2.socketId !== socket.id

      const result = room.addChatMessage(
        socket.userId,
        socket.username,
        message,
        isSpectator
      )

      if (!result.success) {
        socket.emit('error', { message: result.error })
        return
      }

      await room.save()

      // Broadcast message
      this.io.to(roomId).emit('chat_message', {
        userId: socket.userId,
        username: socket.username,
        message: result.cleanMessage,
        isSpectator,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Send message error:', error)
    }
  }

  // Spectator
  async handleJoinSpectate(socket, data) {
    try {
      const { roomId } = data

      const room = await GameRoom.findOne({ roomId })
      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      const result = room.addSpectator(socket.userId, socket.id, socket.username)

      if (!result.success) {
        socket.emit('error', { message: result.error })
        return
      }

      await room.save()

      // Join socket room
      socket.join(roomId)
      socket.currentRoomId = roomId
      socket.isSpectator = true

      socket.emit('spectate_joined', { room })

      // Notify room
      this.io.to(roomId).emit('spectator_joined', {
        username: socket.username,
        spectatorCount: room.spectatorCount
      })

      console.log(`👀 Spectator joined room ${roomId}: ${socket.username}`)
    } catch (error) {
      console.error('Join spectate error:', error)
    }
  }

  async handleLeaveSpectate(socket) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId || !socket.isSpectator) return

      const room = await GameRoom.findOne({ roomId })
      if (room) {
        await room.removeSpectator(socket.id)

        this.io.to(roomId).emit('spectator_left', {
          username: socket.username,
          spectatorCount: room.spectatorCount
        })
      }

      socket.leave(roomId)
      delete socket.currentRoomId
      delete socket.isSpectator
    } catch (error) {
      console.error('Leave spectate error:', error)
    }
  }

  // Rematch
  async handleRequestRematch(socket) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      const room = await GameRoom.findOne({ roomId })
      if (!room || room.status !== 'finished') return

      // Mark rematch requested
      if (room.player1.socketId === socket.id) {
        room.rematchRequested.player1 = true
      } else if (room.player2.socketId === socket.id) {
        room.rematchRequested.player2 = true
      }

      await room.save()

      // Notify opponent
      const opponentSocketId = room.player1.socketId === socket.id ?
        room.player2.socketId : room.player1.socketId

      const opponentSocket = this.io.sockets.sockets.get(opponentSocketId)
      if (opponentSocket) {
        opponentSocket.emit('rematch_requested', {})
        
        // Create notification
        const opponentUserId = room.player1.socketId === socket.id ?
          room.player2.userId : room.player1.userId
        await createMultiplayerNotification(opponentUserId, 'rematch-requested', { roomId })
      }

      // If both requested, create new room
      if (room.rematchRequested.player1 && room.rematchRequested.player2) {
        await this.createRematchRoom(room)
      }
    } catch (error) {
      console.error('Request rematch error:', error)
    }
  }

  async handleAcceptRematch(socket) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      const room = await GameRoom.findOne({ roomId })
      if (!room) return

      // Mark accepted
      if (room.player1.socketId === socket.id) {
        room.rematchRequested.player1 = true
      } else if (room.player2.socketId === socket.id) {
        room.rematchRequested.player2 = true
      }

      await room.save()

      // If both accepted, create new room
      if (room.rematchRequested.player1 && room.rematchRequested.player2) {
        await this.createRematchRoom(room)
      }
    } catch (error) {
      console.error('Accept rematch error:', error)
    }
  }

  async handleRejectRematch(socket) {
    try {
      const roomId = socket.currentRoomId
      if (!roomId) return

      const room = await GameRoom.findOne({ roomId })
      if (!room) return

      // Notify opponent
      const opponentSocketId = room.player1.socketId === socket.id ?
        room.player2.socketId : room.player1.socketId

      const opponentSocket = this.io.sockets.sockets.get(opponentSocketId)
      if (opponentSocket) {
        opponentSocket.emit('rematch_rejected', {})
      }
    } catch (error) {
      console.error('Reject rematch error:', error)
    }
  }

  async createRematchRoom(oldRoom) {
    try {
      // Create new room with same players
      const newRoom = await GameRoom.createRoom(
        {
          userId: oldRoom.player1.userId,
          username: oldRoom.player1.username,
          avatarUrl: oldRoom.player1.avatarUrl,
          elo: oldRoom.player1.elo
        },
        {
          userId: oldRoom.player2.userId,
          username: oldRoom.player2.username,
          avatarUrl: oldRoom.player2.avatarUrl,
          elo: oldRoom.player2.elo
        },
        oldRoom.matchType,
        {
          boardSize: oldRoom.boardSize,
          timeLimit: oldRoom.timeLimit
        }
      )

      // Update socket assignments
      newRoom.player1.socketId = oldRoom.player1.socketId
      newRoom.player2.socketId = oldRoom.player2.socketId
      await newRoom.save()

      // Update old room
      oldRoom.rematchRoomId = newRoom.roomId
      await oldRoom.save()

      // Move sockets to new room
      const socket1 = this.io.sockets.sockets.get(oldRoom.player1.socketId)
      const socket2 = this.io.sockets.sockets.get(oldRoom.player2.socketId)

      if (socket1) {
        socket1.leave(oldRoom.roomId)
        socket1.join(newRoom.roomId)
        socket1.currentRoomId = newRoom.roomId
      }
      if (socket2) {
        socket2.leave(oldRoom.roomId)
        socket2.join(newRoom.roomId)
        socket2.currentRoomId = newRoom.roomId
      }

      // Update tracking
      this.roomSockets.delete(oldRoom.roomId)
      this.roomSockets.set(newRoom.roomId, new Set([oldRoom.player1.socketId, oldRoom.player2.socketId]))

      // Notify players
      this.io.to(newRoom.roomId).emit('rematch_accepted', {
        newRoomId: newRoom.roomId
      })

      console.log(`🔄 Rematch room created: ${newRoom.roomId}`)
    } catch (error) {
      console.error('Create rematch room error:', error)
    }
  }

  // Disconnect handling
  handleDisconnect(socket) {
    console.log(`🔌 Socket disconnected: ${socket.id}`)

    // Set grace period for reconnection
    const timer = setTimeout(async () => {
      await this.handlePermanentDisconnect(socket)
    }, this.DISCONNECT_GRACE_PERIOD)

    this.disconnectTimers.set(socket.id, timer)

    // Notify room of temporary disconnect
    if (socket.currentRoomId) {
      this.io.to(socket.currentRoomId).emit('player_disconnected', {
        socketId: socket.id,
        temporary: true
      })
    }
  }

  async handlePermanentDisconnect(socket) {
    try {
      const roomId = socket.currentRoomId
      
      if (roomId) {
        const room = await GameRoom.findOne({ roomId })
        
        if (room && room.status === 'in-progress') {
          // Determine which player disconnected
          const disconnectedSide = room.player1.socketId === socket.id ? 'player1' : 'player2'
          
          await room.handleDisconnect(disconnectedSide)

          // Notify opponent
          this.io.to(roomId).emit('opponent_disconnected', {
            disconnectedSide,
            waitingForReconnect: true
          })

          // Set auto-win timer
          setTimeout(async () => {
            const updatedRoom = await GameRoom.findOne({ roomId })
            
            if (updatedRoom && !updatedRoom[disconnectedSide].isConnected) {
              // Award win to opponent
              const winningSide = disconnectedSide === 'player1' ? 'player2' : 'player1'
              const winner = updatedRoom[winningSide].userId

              await updatedRoom.finishGame(winner, winningSide, 'disconnect')

              this.io.to(roomId).emit('game_finished', {
                reason: 'disconnect',
                winner: winningSide
              })

              await this.handleGameFinished(updatedRoom)
            }
          }, this.AUTO_WIN_TIMEOUT)
        }
      }

      // Remove from spectator if applicable
      if (socket.isSpectator) {
        await this.handleLeaveSpectate(socket)
      }

      // Remove from matchmaking queue
      if (socket.userId) {
        matchmakingService.removeFromQueue(socket.userId)
        this.userSockets.delete(socket.userId)
      }

      this.socketUsers.delete(socket.id)

      // Clean up room tracking
      if (roomId && this.roomSockets.has(roomId)) {
        this.roomSockets.get(roomId).delete(socket.id)
      }
    } catch (error) {
      console.error('Permanent disconnect error:', error)
    }
  }

  async handleReconnect(socket, data) {
    try {
      const { roomId, userId } = data

      // Clear disconnect timer
      const timer = this.disconnectTimers.get(socket.id)
      if (timer) {
        clearTimeout(timer)
        this.disconnectTimers.delete(socket.id)
      }

      const room = await GameRoom.findOne({ roomId })
      if (!room) {
        socket.emit('error', { message: 'Room not found' })
        return
      }

      // Determine player side
      const playerSide = room.player1.userId.toString() === userId.toString() ? 'player1' : 'player2'

      // Update socket ID and connection status
      await room.handleReconnect(playerSide, socket.id)

      // Join room
      socket.join(roomId)
      socket.currentRoomId = roomId
      socket.userId = userId.toString()

      // Update tracking
      this.userSockets.set(userId.toString(), socket.id)
      this.socketUsers.set(socket.id, userId.toString())

      if (!this.roomSockets.has(roomId)) {
        this.roomSockets.set(roomId, new Set())
      }
      this.roomSockets.get(roomId).add(socket.id)

      socket.emit('reconnected', { room })

      // Notify room
      this.io.to(roomId).emit('player_reconnected', {
        socketId: socket.id,
        playerSide
      })

      // Create notification
      const opponentId = playerSide === 'player1' ? room.player2.userId : room.player1.userId
      await createMultiplayerNotification(opponentId, 'opponent-reconnected', { roomId })

      console.log(`🔄 Player reconnected to room ${roomId}`)
    } catch (error) {
      console.error('Reconnect error:', error)
      socket.emit('error', { message: 'Reconnection failed' })
    }
  }
}

export default MultiplayerSocketHandler
