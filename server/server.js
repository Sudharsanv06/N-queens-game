import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ─── Route Imports ───────────────────────────────────────────────────────────
import authRoutes          from './routes/auth.js';
import userRoutes          from './routes/user.js';
import gamesRoutes         from './routes/gameSaves.js';
import achievementsRoutes  from './routes/achievements.js';
import leaderboardRoutes   from './routes/leaderboard.js';
import statsRoutes         from './routes/stats.js';
import analyticsRoutes     from './routes/analytics.js';
import socialRoutes        from './routes/social.js';
import tournamentsRoutes   from './routes/tournaments.js';
import puzzlesRoutes       from './routes/puzzles.js';
import predefinedPuzzlesRoutes from './routes/predefinedPuzzles.js'; // FIX: was colliding with puzzlesRoutes
import dailyChallengesRoutes   from './routes/dailyChallenges.js';
import notificationsRoutes from './routes/notifications.js';
import badgeRoutes         from './routes/badgeRoutes.js';
import rewardRoutes        from './routes/rewardRoutes.js';
import contactRoutes       from './routes/contact.js';
import emailRoutes         from './routes/emails.js';             // FIX: was never imported
import multiplayerRoutes   from './routes/multiplayer.js';
import matchmakingRoutes   from './routes/matchmaking.js';

// ─── Other Imports ────────────────────────────────────────────────────────────
import MultiplayerSocketHandler from './websocket/multiplayerSocket.js';
import { initializeCronJobs }   from './cron/dailyChallengeCron.js';
import { globalErrorHandler, notFoundHandler } from './utils/errorHandler.js';

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();

const PORT         = process.env.PORT         || 5000;
const MONGO_URI    = process.env.MONGO_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const NODE_ENV     = process.env.NODE_ENV      || 'development';

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
    },
  },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow Postman / mobile apps
    const allowed = CLIENT_ORIGIN.split(',').map(o => o.trim());
    if (allowed.includes(origin) || allowed.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ─── Body / Static / Compression / Logging ───────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(compression());
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ─── Health / Version / Root ──────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const check = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  };
  if (check.database !== 'connected') check.status = 'degraded';
  res.status(check.status === 'ok' ? 200 : 503).json(check);
});

app.get('/api/version', (req, res) => {
  res.json({ version: '1.0.0', name: 'N-Queens Game API', environment: NODE_ENV });
});

app.get('/', (req, res) => {
  res.json({
    message: 'N-Queens Game API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health:          '/health',
      auth:            '/api/auth',
      users:           '/api/users',
      games:           '/api/games',
      achievements:    '/api/achievements',
      leaderboard:     '/api/leaderboard',
      stats:           '/api/stats',
      analytics:       '/api/analytics',
      social:          '/api/social',
      tournaments:     '/api/tournaments',
      puzzles:         '/api/puzzles',
      predefinedPuzzles: '/api/predefined-puzzles',
      dailyChallenges: '/api/daily-challenges',
      notifications:   '/api/notifications',
      badges:          '/api/badges',
      rewards:         '/api/rewards',
      emails:          '/api/emails',
      contact:         '/api/contact',
      multiplayer:     '/api/multiplayer',
      matchmaking:     '/api/matchmaking',
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',               authRoutes);
app.use('/api/users',              userRoutes);
app.use('/api/games',              gamesRoutes);
app.use('/api/achievements',       achievementsRoutes);
app.use('/api/leaderboard',        leaderboardRoutes);
app.use('/api/stats',              statsRoutes);
app.use('/api/analytics',          analyticsRoutes);
app.use('/api/social',             socialRoutes);
app.use('/api/tournaments',        tournamentsRoutes);
app.use('/api/puzzles',            puzzlesRoutes);
app.use('/api/predefined-puzzles', predefinedPuzzlesRoutes); // FIX: was /api/puzzles (collision)
app.use('/api/daily-challenges',   dailyChallengesRoutes);
app.use('/api/notifications',      notificationsRoutes);
app.use('/api/badges',             badgeRoutes);
app.use('/api/rewards',            rewardRoutes);
app.use('/api/emails',             emailRoutes);             // FIX: was never mounted
app.use('/api/contact',            contactRoutes);
app.use('/api/multiplayer',        multiplayerRoutes);
app.use('/api/matchmaking',        matchmakingRoutes);

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─── Database Connection ─────────────────────────────────────────────────────
if (!MONGO_URI) {
  console.error('❌ FATAL: MONGO_URI environment variable is not set!');
  process.exit(1);
}

const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB connected successfully');
      console.log(`   Database: ${mongoose.connection.name}`);
      initializeCronJobs();
      return;
    } catch (error) {
      console.error(`❌ MongoDB attempt ${i + 1}/${retries} failed: ${error.message}`);
      if (i === retries - 1) {
        console.error('Troubleshooting checklist:');
        console.error('  1. MONGO_URI is set in environment variables');
        console.error('  2. MongoDB Atlas → Network Access → 0.0.0.0/0 is whitelisted');
        console.error('  3. No quotes around the connection string value');
        process.exit(1);
      }
      const wait = delay * Math.pow(2, i);
      console.log(`   Retrying in ${wait / 1000}s...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
};

connectWithRetry();

// ─── HTTP Server + Socket.IO ──────────────────────────────────────────────────
const server = createServer(app);

const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
});

const multiplayerHandler = new MultiplayerSocketHandler(io);
multiplayerHandler.initialize();

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🔗 CORS enabled for: ${CLIENT_ORIGIN}`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`${signal} received: closing server`);
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Server and DB connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

export default app;