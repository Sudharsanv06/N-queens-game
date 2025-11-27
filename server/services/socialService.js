import { Friendship, GameReplay, SocialAchievement } from '../models/Social.js'
import User from '../models/User.js'

class SocialService {
  // Friend System
  async sendFriendRequest(requesterId, recipientId) {
    try {
      if (requesterId === recipientId) {
        return { success: false, error: 'Cannot send friend request to yourself' }
      }

      const existing = await Friendship.findOne({
        $or: [
          { requester: requesterId, recipient: recipientId },
          { requester: recipientId, recipient: requesterId }
        ]
      })

      if (existing) {
        return { success: false, error: 'Friend request already exists' }
      }

      const friendship = new Friendship({
        requester: requesterId,
        recipient: recipientId
      })

      await friendship.save()
      await friendship.populate(['requester', 'recipient'], 'name email')

      return { success: true, friendship, message: 'Friend request sent' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async respondToFriendRequest(friendshipId, userId, action) {
    try {
      const friendship = await Friendship.findById(friendshipId)
      if (!friendship) {
        return { success: false, error: 'Friend request not found' }
      }

      if (friendship.recipient.toString() !== userId) {
        return { success: false, error: 'Not authorized' }
      }

      friendship.status = action // 'accepted', 'declined'
      friendship.updatedAt = new Date()
      await friendship.save()

      if (action === 'accepted') {
        // Check for social achievements
        await this.checkSocialAchievements(friendship.requester)
        await this.checkSocialAchievements(friendship.recipient)
      }

      return { success: true, friendship, message: `Friend request ${action}` }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getFriends(userId) {
    try {
      const friendships = await Friendship.find({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      }).populate(['requester', 'recipient'], 'name email stats')

      const friends = friendships.map(f => 
        f.requester._id.toString() === userId ? f.recipient : f.requester
      )

      return { success: true, friends }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getPendingRequests(userId) {
    try {
      const requests = await Friendship.find({
        recipient: userId,
        status: 'pending'
      }).populate('requester', 'name email')

      return { success: true, requests }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async searchUsers(currentUserId, searchTerm) {
    try {
      const User = (await import('../models/User.js')).default

      // Search users by username (case-insensitive)
      const users = await User.find({
        _id: { $ne: currentUserId }, // Exclude current user
        username: { $regex: searchTerm, $options: 'i' }
      })
      .select('username email level stats createdAt')
      .limit(20)
      .lean()

      // Get existing friendships to mark status
      const friendships = await Friendship.find({
        $or: [
          { requester: currentUserId },
          { recipient: currentUserId }
        ]
      }).lean()

      // Mark friend status for each user
      const usersWithStatus = users.map(user => {
        const friendship = friendships.find(f => 
          f.requester.toString() === user._id.toString() || 
          f.recipient.toString() === user._id.toString()
        )

        let isFriend = false
        let requestSent = false

        if (friendship) {
          isFriend = friendship.status === 'accepted'
          requestSent = friendship.status === 'pending' && friendship.requester.toString() === currentUserId
        }

        return {
          ...user,
          isFriend,
          requestSent
        }
      })

      return { success: true, users: usersWithStatus }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Game Replay System
  async saveGameReplay(userId, gameData, metadata) {
    try {
      const replay = new GameReplay({
        user: userId,
        gameData,
        title: metadata.title || `${gameData.boardSize}x${gameData.boardSize} in ${gameData.timeElapsed}s`,
        description: metadata.description || '',
        isPublic: metadata.isPublic !== false,
        tags: metadata.tags || []
      })

      await replay.save()
      await replay.populate('user', 'name email')

      return { success: true, replay, message: 'Game replay saved' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getPublicReplays(filters = {}) {
    try {
      const query = { isPublic: true }
      
      if (filters.boardSize) query['gameData.boardSize'] = filters.boardSize
      if (filters.mode) query['gameData.mode'] = filters.mode
      if (filters.tags) query.tags = { $in: filters.tags }

      const replays = await GameReplay.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(filters.limit || 20)

      return { success: true, replays }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getUserReplays(userId) {
    try {
      const replays = await GameReplay.find({ user: userId })
        .sort({ createdAt: -1 })

      return { success: true, replays }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async likeReplay(replayId, userId) {
    try {
      const replay = await GameReplay.findById(replayId)
      if (!replay) {
        return { success: false, error: 'Replay not found' }
      }

      const isLiked = replay.likes.includes(userId)
      if (isLiked) {
        replay.likes.pull(userId)
      } else {
        replay.likes.push(userId)
      }

      await replay.save()
      return { success: true, liked: !isLiked, likeCount: replay.likes.length }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async shareReplay(replayId, platform) {
    try {
      const replay = await GameReplay.findById(replayId)
      if (!replay) {
        return { success: false, error: 'Replay not found' }
      }

      replay.shares += 1
      await replay.save()

      // Check viral share achievement
      if (replay.shares >= 10) {
        await this.unlockSocialAchievement(replay.user, 'viral_share')
      }

      return { success: true, shares: replay.shares }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Social Achievements
  async checkSocialAchievements(userId) {
    try {
      const friendCount = await Friendship.countDocuments({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      })

      // First friend achievement
      if (friendCount === 1) {
        await this.unlockSocialAchievement(userId, 'first_friend')
      }

      // Social butterfly achievement (10 friends)
      if (friendCount >= 10) {
        await this.unlockSocialAchievement(userId, 'social_butterfly')
      }

      const replayCount = await GameReplay.countDocuments({ user: userId, isPublic: true })
      
      // Replay master achievement (5 public replays)
      if (replayCount >= 5) {
        await this.unlockSocialAchievement(userId, 'replay_master')
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async unlockSocialAchievement(userId, type) {
    try {
      const existing = await SocialAchievement.findOne({ user: userId, type })
      if (existing) return { success: true }

      const achievements = {
        first_friend: { name: 'First Friend', description: 'Made your first friend!' },
        social_butterfly: { name: 'Social Butterfly', description: 'Made 10 friends!' },
        replay_master: { name: 'Replay Master', description: 'Shared 5 public game replays!' },
        viral_share: { name: 'Viral Share', description: 'Your replay got 10+ shares!' },
        helpful_friend: { name: 'Helpful Friend', description: 'Helped friends improve their game!' }
      }

      const achievement = new SocialAchievement({
        user: userId,
        type,
        ...achievements[type]
      })

      await achievement.save()
      return { success: true, achievement }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getSocialStats(userId) {
    try {
      const friendCount = await Friendship.countDocuments({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      })

      const replayCount = await GameReplay.countDocuments({ user: userId })
      const publicReplayCount = await GameReplay.countDocuments({ user: userId, isPublic: true })
      
      const totalLikes = await GameReplay.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } } } }
      ])

      const totalShares = await GameReplay.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalShares: { $sum: '$shares' } } }
      ])

      const socialAchievements = await SocialAchievement.countDocuments({ user: userId })

      return {
        success: true,
        stats: {
          friendCount,
          replayCount,
          publicReplayCount,
          totalLikes: totalLikes[0]?.totalLikes || 0,
          totalShares: totalShares[0]?.totalShares || 0,
          socialAchievements
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export default SocialService