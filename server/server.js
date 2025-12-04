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

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import gamesRoutes from './routes/gameSaves.js';
import achievementsRoutes from './routes/achievements.js';
import leaderboardRoutes from './routes/leaderboard.js';
import statsRoutes from './routes/stats.js';
import analyticsRoutes from './routes/analytics.js';
import socialRoutes from './routes/social.js';
import tournamentsRoutes from './routes/tournaments.js';
import puzzlesRoutes from './routes/puzzles.js';
import predefinedPuzzlesRoutes from './routes/predefinedPuzzles.js';
import dailyChallengesRoutes from './routes/dailyChallenges.js';
import notificationsRoutes from './routes/notifications.js';
import badgeRoutes from './routes/badgeRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import contactRoutes from './routes/contact.js';
import multiplayerRoutes from './routes/multiplayer.js';
import matchmakingRoutes from './routes/matchmaking.js';

// Import WebSocket handler
import MultiplayerSocketHandler from './websocket/multiplayerSocket.js';

// Import cron jobs
import { initializeCronJobs } from './cron/dailyChallengeCron.js';

// Import middleware
import { globalErrorHandler, notFoundHandler } from './utils/errorHandler.js';

// Initialize Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = CLIENT_ORIGIN.split(',').map(o => o.trim());
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploaded avatars
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Compression middleware
app.use(compression());

// Logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { 
    success: false, 
    message: 'Too many requests from this IP, please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV
  };

  try {
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      healthCheck.database = 'connected';
    } else {
      healthCheck.database = 'disconnected';
      healthCheck.status = 'degraded';
    }
    
    res.status(healthCheck.status === 'ok' ? 200 : 503).json(healthCheck);
  } catch (error) {
    healthCheck.status = 'error';
    healthCheck.database = 'error';
    res.status(503).json(healthCheck);
  }
});

// Version endpoint
app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'N-Queens Game API',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'N-Queens Game API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      version: '/api/version',
      auth: '/api/auth',
      users: '/api/users',
      games: '/api/games',
      achievements: '/api/achievements',
      leaderboard: '/api/leaderboard',
      stats: '/api/stats',
      puzzles: '/api/puzzles',
      dailyChallenges: '/api/daily-challenges',
      notifications: '/api/notifications',
      multiplayer: '/api/multiplayer',
      matchmaking: '/api/matchmaking'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/puzzles', puzzlesRoutes);
app.use('/api/puzzles', predefinedPuzzlesRoutes);
app.use('/api/daily-challenges', dailyChallengesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/multiplayer', multiplayerRoutes);
app.use('/api/matchmaking', matchmakingRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// Database connection with retry logic
if (!MONGO_URI) {
  console.error('❌ FATAL: MONGO_URI environment variable is not set!');
  console.error('   Please add MONGO_URI to your Render environment variables.');
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
      // Initialize cron jobs after database connection
      initializeCronJobs();
      return;
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, error.message);
      
      if (i === retries - 1) {
        console.error('   Connection string format:', MONGO_URI ? MONGO_URI.slice(0, 30) + '...' : 'MISSING');
        console.error('   Troubleshooting:');
        console.error('   1. Verify MONGO_URI is set in Render Environment variables');
        console.error('   2. Check MongoDB Atlas Network Access allows 0.0.0.0/0');
        console.error('   3. Wait 2-3 minutes after adding IP whitelist in Atlas');
        console.error('   4. Verify connection string has no quotes around it');
        console.error('   5. Ensure database name in connection string is correct');
        process.exit(1);
      }
      
      const waitTime = delay * Math.pow(2, i); // Exponential backoff
      console.log(`   Retrying in ${waitTime / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

connectWithRetry();

// Create HTTP server and Socket.IO instance
const server = createServer(app);

const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Initialize multiplayer WebSocket handler
const multiplayerHandler = new MultiplayerSocketHandler(io);
multiplayerHandler.initialize();

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🔗 CORS enabled for: ${CLIENT_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

export default app;
