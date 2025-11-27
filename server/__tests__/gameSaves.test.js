import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import GameSave from '../models/GameSave.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const TEST_DB_URI = process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/nqueens_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await GameSave.deleteMany({});
  await Session.deleteMany({});
  await User.deleteMany({});
});

const createTestUser = async () => {
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword123'
  });
  
  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '24h' }
  );
  
  return { user, token };
};

describe('Game Save API', () => {
  describe('POST /api/game/save', () => {
    it('should save a game without authentication (guest)', async () => {
      const saveData = {
        sessionId: 'test-session-123',
        n: 8,
        boardState: Array(8).fill(null).map(() => Array(8).fill(0)),
        moves: [],
        placedQueens: 0,
        timer: 0,
        hintsUsed: 0,
        metadata: {
          device: 'test',
          appVersion: '1.0.0'
        }
      };

      const response = await request(app)
        .post('/api/game/save')
        .send(saveData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBe('test-session-123');
      expect(response.body.data.n).toBe(8);
    });

    it('should save a game with authentication', async () => {
      const { token } = await createTestUser();
      
      const saveData = {
        sessionId: 'auth-session-456',
        n: 8,
        boardState: Array(8).fill(null).map(() => Array(8).fill(0)),
        moves: [],
        placedQueens: 0,
        timer: 5000,
        hintsUsed: 1
      };

      const response = await request(app)
        .post('/api/game/save')
        .set('Authorization', `Bearer ${token}`)
        .send(saveData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.hintsUsed).toBe(1);
    });

    it('should reject invalid save data', async () => {
      const invalidData = {
        sessionId: 'test',
        n: 25,
        boardState: []
      };

      const response = await request(app)
        .post('/api/game/save')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should upsert existing save', async () => {
      const sessionId = 'upsert-test';
      const saveData = {
        sessionId,
        n: 8,
        boardState: Array(8).fill(null).map(() => Array(8).fill(0)),
        moves: [],
        placedQueens: 0,
        timer: 0,
        hintsUsed: 0
      };

      await request(app)
        .post('/api/game/save')
        .send(saveData)
        .expect(200);

      const updatedData = { ...saveData, placedQueens: 3, timer: 10000 };
      
      const response = await request(app)
        .post('/api/game/save')
        .send(updatedData)
        .expect(200);

      expect(response.body.data.placedQueens).toBe(3);
      expect(response.body.data.timer).toBe(10000);
      
      const saves = await GameSave.find({ sessionId });
      expect(saves.length).toBe(1);
    });
  });

  describe('GET /api/game/load/:saveId', () => {
    it('should load a game by ID', async () => {
      const save = await GameSave.create({
        sessionId: 'load-test',
        n: 8,
        boardState: Array(8).fill(null).map(() => Array(8).fill(0)),
        moves: [],
        placedQueens: 2,
        timer: 5000,
        hintsUsed: 0
      });

      const response = await request(app)
        .get(`/api/game/load/${save._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.placedQueens).toBe(2);
    });

    it('should return 404 for non-existent save', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/game/load/${fakeId}`)
        .expect(404);
    });
  });

  describe('GET /api/game/latest', () => {
    it('should load latest game for session', async () => {
      const sessionId = 'latest-test';
      
      await GameSave.create({
        sessionId,
        n: 8,
        boardState: Array(8).fill(null).map(() => Array(8).fill(0)),
        moves: [],
        placedQueens: 1,
        timer: 1000,
        hintsUsed: 0,
        lastUpdated: new Date(Date.now() - 10000)
      });

      await GameSave.create({
        sessionId,
        n: 8,
        boardState: Array(8).fill(null).map(() => Array(8).fill(0)),
        moves: [],
        placedQueens: 3,
        timer: 5000,
        hintsUsed: 1,
        lastUpdated: new Date()
      });

      const response = await request(app)
        .get('/api/game/latest')
        .query({ sessionId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.placedQueens).toBe(3);
    });
  });

  describe('GET /api/game/list', () => {
    it('should require authentication', async () => {
      await request(app)
        .get('/api/game/list')
        .expect(401);
    });

    it('should list user saves', async () => {
      const { user, token } = await createTestUser();
      
      await GameSave.create({
        userId: user._id,
        sessionId: 'list-1',
        n: 8,
        boardState: Array(8).fill(null).map(() => Array(8).fill(0)),
        moves: [],
        placedQueens: 0,
        timer: 0,
        hintsUsed: 0
      });

      await GameSave.create({
        userId: user._id,
        sessionId: 'list-2',
        n: 10,
        boardState: Array(10).fill(null).map(() => Array(10).fill(0)),
        moves: [],
        placedQueens: 0,
        timer: 0,
        hintsUsed: 0
      });

      const response = await request(app)
        .get('/api/game/list')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('DELETE /api/game/:saveId', () => {
    it('should require authentication', async () => {
      const save = await GameSave.create({
        sessionId: 'delete-test',
        n: 8,
        boardState: Array(8).fill(null).map(() => Array(8).fill(0)),
        moves: [],
        placedQueens: 0,
        timer: 0,
        hintsUsed: 0
      });

      await request(app)
        .delete(`/api/game/${save._id}`)
        .expect(401);
    });

    it('should delete user save', async () => {
      const { user, token } = await createTestUser();
      
      const save = await GameSave.create({
        userId: user._id,
        sessionId: 'delete-auth',
        n: 8,
        boardState: Array(8).fill(null).map(() => Array(8).fill(0)),
        moves: [],
        placedQueens: 0,
        timer: 0,
        hintsUsed: 0
      });

      const response = await request(app)
        .delete(`/api/game/${save._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const deletedSave = await GameSave.findById(save._id);
      expect(deletedSave).toBeNull();
    });
  });

  describe('POST /api/game/hint', () => {
    it('should generate a hint', async () => {
      const sessionId = 'hint-test-session';
      
      await Session.create({
        sessionId,
        n: 8,
        startAt: new Date(),
        hintsUsed: 0
      });

      const boardState = Array(8).fill(null).map(() => Array(8).fill(0));

      const response = await request(app)
        .post('/api/game/hint')
        .send({
          sessionId,
          boardState,
          n: 8
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.hint).toBeDefined();
      expect(response.body.hint.row).toBeGreaterThanOrEqual(0);
      expect(response.body.hint.col).toBeGreaterThanOrEqual(0);
      expect(response.body.hintsUsed).toBe(1);
      expect(response.body.hintsRemaining).toBe(2);
    });

    it('should enforce hint limit', async () => {
      const sessionId = 'hint-limit-test';
      
      await Session.create({
        sessionId,
        n: 8,
        startAt: new Date(),
        hintsUsed: 3
      });

      const boardState = Array(8).fill(null).map(() => Array(8).fill(0));

      const response = await request(app)
        .post('/api/game/hint')
        .send({
          sessionId,
          boardState,
          n: 8
        })
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Hint limit reached');
    });

    it('should require session', async () => {
      const boardState = Array(8).fill(null).map(() => Array(8).fill(0));

      await request(app)
        .post('/api/game/hint')
        .send({
          sessionId: 'non-existent-session',
          boardState,
          n: 8
        })
        .expect(404);
    });
  });

  describe('POST /api/game/merge', () => {
    it('should merge and save game state', async () => {
      const mergedData = {
        sessionId: 'merge-test',
        n: 8,
        boardState: Array(8).fill(null).map(() => Array(8).fill(0)),
        moves: [
          { row: 0, col: 0, action: 'place', timestamp: new Date() }
        ],
        placedQueens: 1,
        timer: 5000,
        hintsUsed: 0
      };

      const response = await request(app)
        .post('/api/game/merge')
        .send(mergedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.moves.length).toBe(1);
    });
  });

  describe('POST /api/game/session/complete', () => {
    it('should complete a session', async () => {
      const sessionId = 'complete-test';
      
      await Session.create({
        sessionId,
        n: 8,
        startAt: new Date(Date.now() - 60000),
        movesCount: 10,
        hintsUsed: 2,
        completed: false
      });

      const response = await request(app)
        .post('/api/game/session/complete')
        .send({
          sessionId,
          analytics: {
            totalTime: 60000,
            wrongMoves: 2,
            correctMoves: 8
          }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completed).toBe(true);
      
      const session = await Session.findOne({ sessionId });
      expect(session.completed).toBe(true);
      expect(session.endAt).toBeDefined();
    });
  });
});
