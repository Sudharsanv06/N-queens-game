import { CustomPuzzle, PuzzleCollection, UserPuzzleProgress } from '../models/Puzzle.js'
import User from '../models/User.js'

class PuzzleService {
  // Puzzle Creation & Management
  async createPuzzle(userId, puzzleData) {
    try {
      // Validate solution
      if (!this.validateSolution(puzzleData.solution, puzzleData.boardSize)) {
        return { success: false, error: 'Invalid puzzle solution' }
      }

      const puzzle = new CustomPuzzle({
        creator: userId,
        ...puzzleData,
        status: 'draft'
      })

      await puzzle.save()
      await puzzle.populate('creator', 'name email')

      return { success: true, puzzle, message: 'Puzzle created successfully' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  validateSolution(solution, boardSize) {
    if (!solution || solution.length !== boardSize) return false
    
    const positions = new Set()
    for (const pos of solution) {
      if (pos.row < 0 || pos.row >= boardSize || pos.col < 0 || pos.col >= boardSize) {
        return false
      }
      
      const key = `${pos.row}-${pos.col}`
      if (positions.has(key)) return false
      positions.add(key)
    }

    // Check for conflicts (same row, col, diagonal)
    for (let i = 0; i < solution.length; i++) {
      for (let j = i + 1; j < solution.length; j++) {
        const pos1 = solution[i]
        const pos2 = solution[j]
        
        if (pos1.row === pos2.row || 
            pos1.col === pos2.col ||
            Math.abs(pos1.row - pos2.row) === Math.abs(pos1.col - pos2.col)) {
          return false
        }
      }
    }
    
    return true
  }

  async getPublicPuzzles(filters = {}) {
    try {
      const query = { isPublic: true, status: 'published' }
      
      if (filters.difficulty) query.difficulty = filters.difficulty
      if (filters.boardSize) query.boardSize = filters.boardSize
      if (filters.category) query.category = filters.category
      if (filters.tags) query.tags = { $in: filters.tags }

      const sortBy = filters.sortBy || 'createdAt'
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1

      const puzzles = await CustomPuzzle.find(query)
        .populate('creator', 'name email')
        .sort({ [sortBy]: sortOrder })
        .limit(filters.limit || 20)
        .skip(filters.skip || 0)

      return { success: true, puzzles }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getUserPuzzles(userId) {
    try {
      const puzzles = await CustomPuzzle.find({ creator: userId })
        .sort({ createdAt: -1 })

      return { success: true, puzzles }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getPuzzleById(puzzleId) {
    try {
      const puzzle = await CustomPuzzle.findById(puzzleId)
        .populate('creator', 'name email')
        .populate('comments.user', 'name email')

      if (!puzzle) {
        return { success: false, error: 'Puzzle not found' }
      }

      return { success: true, puzzle }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async updatePuzzle(puzzleId, updates, userId) {
    try {
      const puzzle = await CustomPuzzle.findById(puzzleId)
      if (!puzzle) {
        return { success: false, error: 'Puzzle not found' }
      }

      if (puzzle.creator.toString() !== userId) {
        return { success: false, error: 'Not authorized to update this puzzle' }
      }

      // Validate solution if updated
      if (updates.solution && !this.validateSolution(updates.solution, updates.boardSize || puzzle.boardSize)) {
        return { success: false, error: 'Invalid puzzle solution' }
      }

      Object.assign(puzzle, updates)
      await puzzle.save()

      return { success: true, puzzle, message: 'Puzzle updated successfully' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async publishPuzzle(puzzleId, userId) {
    try {
      const puzzle = await CustomPuzzle.findById(puzzleId)
      if (!puzzle) {
        return { success: false, error: 'Puzzle not found' }
      }

      if (puzzle.creator.toString() !== userId) {
        return { success: false, error: 'Not authorized' }
      }

      puzzle.status = 'published'
      await puzzle.save()

      return { success: true, puzzle, message: 'Puzzle published successfully' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async likePuzzle(puzzleId, userId) {
    try {
      const puzzle = await CustomPuzzle.findById(puzzleId)
      if (!puzzle) {
        return { success: false, error: 'Puzzle not found' }
      }

      const isLiked = puzzle.likes.includes(userId)
      if (isLiked) {
        puzzle.likes.pull(userId)
        puzzle.stats.likes -= 1
      } else {
        puzzle.likes.push(userId)
        puzzle.stats.likes += 1
      }

      await puzzle.save()
      return { success: true, liked: !isLiked, likeCount: puzzle.stats.likes }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async ratePuzzle(puzzleId, userId, rating) {
    try {
      const puzzle = await CustomPuzzle.findById(puzzleId)
      if (!puzzle) {
        return { success: false, error: 'Puzzle not found' }
      }

      if (rating < 1 || rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5' }
      }

      await puzzle.addRating(userId, rating)
      return { success: true, rating: puzzle.rating.average, message: 'Rating submitted' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Puzzle Collections
  async createCollection(userId, collectionData) {
    try {
      const collection = new PuzzleCollection({
        creator: userId,
        ...collectionData
      })

      await collection.save()
      return { success: true, collection, message: 'Collection created successfully' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async addPuzzleToCollection(collectionId, puzzleId, userId) {
    try {
      const collection = await PuzzleCollection.findById(collectionId)
      if (!collection) {
        return { success: false, error: 'Collection not found' }
      }

      if (collection.creator.toString() !== userId) {
        return { success: false, error: 'Not authorized' }
      }

      if (!collection.puzzles.includes(puzzleId)) {
        collection.puzzles.push(puzzleId)
        collection.stats.totalPuzzles += 1
        await collection.save()
      }

      return { success: true, collection, message: 'Puzzle added to collection' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getCollections(filters = {}) {
    try {
      const query = { isPublic: true }
      
      if (filters.difficulty && filters.difficulty !== 'mixed') {
        query.difficulty = filters.difficulty
      }

      const collections = await PuzzleCollection.find(query)
        .populate('creator', 'name email')
        .populate('puzzles', 'title difficulty boardSize rating stats')
        .sort({ createdAt: -1 })
        .limit(filters.limit || 10)

      return { success: true, collections }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // User Progress Tracking
  async startPuzzle(userId, puzzleId) {
    try {
      const puzzle = await CustomPuzzle.findById(puzzleId)
      if (!puzzle) {
        return { success: false, error: 'Puzzle not found' }
      }

      puzzle.stats.attempts += 1
      await puzzle.save()

      let progress = await UserPuzzleProgress.findOne({ user: userId, puzzle: puzzleId })
      
      if (!progress) {
        progress = new UserPuzzleProgress({
          user: userId,
          puzzle: puzzleId,
          status: 'in_progress'
        })
      } else {
        progress.status = 'in_progress'
        progress.lastAttempt = new Date()
      }
      
      progress.attempts += 1
      await progress.save()

      return { success: true, progress, puzzle }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async completePuzzle(userId, puzzleId, gameData) {
    try {
      const puzzle = await CustomPuzzle.findById(puzzleId)
      if (!puzzle) {
        return { success: false, error: 'Puzzle not found' }
      }

      await puzzle.recordCompletion(gameData.timeElapsed)

      const progress = await UserPuzzleProgress.findOne({ user: userId, puzzle: puzzleId })
      if (progress) {
        progress.status = 'completed'
        if (!progress.bestTime || gameData.timeElapsed < progress.bestTime) {
          progress.bestTime = gameData.timeElapsed
        }
        await progress.save()
      }

      return { success: true, progress, puzzle, message: 'Puzzle completed!' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getUserProgress(userId) {
    try {
      const progress = await UserPuzzleProgress.find({ user: userId })
        .populate('puzzle', 'title difficulty boardSize creator')
        .sort({ updatedAt: -1 })

      return { success: true, progress }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async getPuzzleStats(puzzleId) {
    try {
      const puzzle = await CustomPuzzle.findById(puzzleId)
      if (!puzzle) {
        return { success: false, error: 'Puzzle not found' }
      }

      const completionRate = puzzle.stats.attempts > 0 
        ? (puzzle.stats.completions / puzzle.stats.attempts * 100).toFixed(1)
        : 0

      const stats = {
        ...puzzle.stats.toObject(),
        completionRate: parseFloat(completionRate),
        rating: puzzle.rating.average,
        ratingCount: puzzle.rating.count
      }

      return { success: true, stats }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export default PuzzleService