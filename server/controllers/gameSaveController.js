import GameSave from '../models/GameSave.js';
import Session from '../models/Session.js';
import hintAdapter from '../utils/hintAdapter.js';

const MAX_HINTS_PER_SESSION = 3;
const MAX_SAVE_SIZE_KB = 500;

const validateSavePayload = (data) => {
  const errors = [];
  
  if (!data.sessionId || typeof data.sessionId !== 'string') {
    errors.push('sessionId is required and must be a string');
  }
  
  if (!data.n || data.n < 4 || data.n > 20) {
    errors.push('n must be between 4 and 20');
  }
  
  if (!data.boardState || !Array.isArray(data.boardState)) {
    errors.push('boardState must be a 2D array');
  }
  
  const payloadSize = JSON.stringify(data).length / 1024;
  if (payloadSize > MAX_SAVE_SIZE_KB) {
    errors.push(`Payload size exceeds ${MAX_SAVE_SIZE_KB}KB limit`);
  }
  
  return errors;
};

const saveGame = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const saveData = {
      ...req.body,
      userId,
      lastUpdated: new Date()
    };

    const validationErrors = validateSavePayload(saveData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    const savedGame = await GameSave.upsertSave(saveData);

    let session = await Session.findOne({ sessionId: saveData.sessionId });
    if (!session) {
      session = await Session.createSession({
        sessionId: saveData.sessionId,
        userId,
        n: saveData.n,
        movesCount: saveData.moves?.length || 0,
        hintsUsed: saveData.hintsUsed || 0,
        metadata: saveData.metadata || {}
      });
    } else {
      session.movesCount = saveData.moves?.length || 0;
      session.hintsUsed = saveData.hintsUsed || 0;
      await session.save();
    }

    res.status(200).json({
      success: true,
      message: 'Game saved successfully',
      data: savedGame.toSafeObject()
    });
  } catch (error) {
    console.error('Save game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save game',
      error: error.message
    });
  }
};

const loadGame = async (req, res) => {
  try {
    const { saveId } = req.params;
    const userId = req.user?.id || null;

    const savedGame = await GameSave.findById(saveId);

    if (!savedGame) {
      return res.status(404).json({
        success: false,
        message: 'Save not found'
      });
    }

    if (savedGame.userId && userId && savedGame.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to load this save'
      });
    }

    res.status(200).json({
      success: true,
      data: savedGame.toSafeObject()
    });
  } catch (error) {
    console.error('Load game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load game',
      error: error.message
    });
  }
};

const loadLatest = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const { sessionId } = req.query;

    let savedGame;
    if (userId) {
      savedGame = await GameSave.findLatestForUser(userId, sessionId);
    } else if (sessionId) {
      savedGame = await GameSave.findLatestForUser(null, sessionId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either userId (via auth) or sessionId is required'
      });
    }

    if (!savedGame) {
      return res.status(404).json({
        success: false,
        message: 'No saved game found'
      });
    }

    res.status(200).json({
      success: true,
      data: savedGame.toSafeObject()
    });
  } catch (error) {
    console.error('Load latest game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load latest game',
      error: error.message
    });
  }
};

const listGames = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to list saves'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const saves = await GameSave.find({ userId })
      .sort({ lastUpdated: -1 })
      .skip(skip)
      .limit(limit);

    const total = await GameSave.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: saves.map(save => save.toSafeObject()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('List games error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list games',
      error: error.message
    });
  }
};

const deleteGame = async (req, res) => {
  try {
    const { saveId } = req.params;
    const userId = req.user?.id;

    const savedGame = await GameSave.findById(saveId);

    if (!savedGame) {
      return res.status(404).json({
        success: false,
        message: 'Save not found'
      });
    }

    if (savedGame.userId && userId && savedGame.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this save'
      });
    }

    await GameSave.findByIdAndDelete(saveId);

    res.status(200).json({
      success: true,
      message: 'Save deleted successfully'
    });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete game',
      error: error.message
    });
  }
};

const requestHint = async (req, res) => {
  try {
    const { sessionId, boardState, n } = req.body;

    if (!sessionId || !boardState || !n) {
      return res.status(400).json({
        success: false,
        message: 'sessionId, boardState, and n are required'
      });
    }

    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found. Start a new game first.'
      });
    }

    if (session.hintsUsed >= MAX_HINTS_PER_SESSION) {
      return res.status(429).json({
        success: false,
        message: `Hint limit reached. Maximum ${MAX_HINTS_PER_SESSION} hints per game.`,
        hintsRemaining: 0
      });
    }

    const hint = await hintAdapter.generateHint(boardState, n);

    if (!hint || !hint.position) {
      return res.status(404).json({
        success: false,
        message: 'No valid hint available for current board state'
      });
    }

    await session.incrementHints();

    const savedGame = await GameSave.findOne({ sessionId });
    if (savedGame) {
      savedGame.hintsUsed = session.hintsUsed;
      await savedGame.save();
    }

    res.status(200).json({
      success: true,
      hint: {
        row: hint.position.row,
        col: hint.position.col,
        reasoning: hint.reasoning || 'This is a safe position for a queen'
      },
      hintsRemaining: MAX_HINTS_PER_SESSION - session.hintsUsed,
      hintsUsed: session.hintsUsed
    });
  } catch (error) {
    console.error('Request hint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hint',
      error: error.message
    });
  }
};

const mergeSave = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const mergedData = {
      ...req.body,
      userId,
      lastUpdated: new Date()
    };

    const validationErrors = validateSavePayload(mergedData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    const savedGame = await GameSave.upsertSave(mergedData);

    res.status(200).json({
      success: true,
      message: 'Merged game saved successfully',
      data: savedGame.toSafeObject()
    });
  } catch (error) {
    console.error('Merge save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to merge and save game',
      error: error.message
    });
  }
};

const completeSession = async (req, res) => {
  try {
    const { sessionId, analytics } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required'
      });
    }

    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.complete(analytics);

    res.status(200).json({
      success: true,
      message: 'Session completed successfully',
      data: {
        sessionId: session.sessionId,
        completed: session.completed,
        duration: session.endAt - session.startAt,
        analytics: session.analytics
      }
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete session',
      error: error.message
    });
  }
};

export default {
  saveGame,
  loadGame,
  loadLatest,
  listGames,
  deleteGame,
  requestHint,
  mergeSave,
  completeSession
};
