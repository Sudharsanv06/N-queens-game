# Day 4 Complete: Save/Resume, Persistence, Hint Polish & Session Tracking

## Overview
Implemented a complete save/resume system with local and server synchronization, conflict resolution, hint system with rate limiting, and comprehensive session tracking for the N-Queens game.

## Architecture Decision
**Redux Toolkit + Custom Hooks Pattern**: Using Redux for global state management combined with custom hooks (`useAutoSave`, `useResumeOnLogin`) provides:
- Centralized state management for save operations
- Reusable logic across components
- Optimistic UI updates with automatic retries
- Clean separation of concerns

## ✅ Features Implemented

### 1. Backend Infrastructure

#### Models
- **GameSave** (`server/models/GameSave.js`)
  - Stores complete game state with moves history
  - Supports both authenticated users and guest sessions
  - Automatic upsert based on userId + sessionId
  - Validation for board size (4-20) and data integrity
  - Indexes for fast queries on userId, sessionId, and lastUpdated

- **Session** (`server/models/Session.js`)
  - Tracks game sessions with analytics
  - Records moves, hints used, completion status
  - Supports session lifecycle management
  - Stores performance metrics (time, moves, etc.)

#### API Endpoints
All endpoints are in `server/routes/gameSaves.js`:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/game/save` | Optional | Create/update save |
| GET | `/api/game/load/:saveId` | Optional | Load specific save |
| GET | `/api/game/latest` | Optional | Get latest save for user/session |
| GET | `/api/game/list` | Required | List user's saves (paginated) |
| DELETE | `/api/game/:saveId` | Required | Delete a save |
| POST | `/api/game/hint` | None | Request hint (rate limited) |
| POST | `/api/game/merge` | Optional | Save merged game state |
| POST | `/api/game/session/complete` | Optional | Mark session complete |

#### Security & Validation
- JWT authentication with optional auth support for guests
- Rate limiting: 10 hints/minute per session, 60 saves/minute
- Payload size limit: 500KB
- Board size validation: 4-20 only
- Hint limit: 3 per game session (server enforced)
- Owner-only delete/load for private saves

### 2. Frontend Implementation

#### Redux Slice (`client/src/store/slices/saveSlice.js`)
- Async thunks for all API operations
- Exponential backoff retry (3 attempts, 1s → 2s → 4s)
- Optimistic UI updates
- Conflict detection and resolution state
- Hint tracking (used/remaining)

#### Custom Hooks
- **useAutoSave** (`client/src/hooks/useAutoSave.js`)
  - Auto-saves every 10 seconds (configurable)
  - Saves to both localStorage and server
  - Retry queue for failed saves
  - Force save capability
  - Saves on window beforeunload

- **useResumeOnLogin** (`client/src/hooks/useResumeOnLogin.js`)
  - Auto-resumes game on login
  - Detects conflicts between local and server
  - Smart merge algorithm (latest timestamp wins)
  - One-time check per session

#### UI Components
- **SaveManager** (`client/src/components/SaveManager.jsx`)
  - Save status indicator with live updates
  - Manual save/load buttons
  - Auto-save toggle
  - List saves modal with pagination
  - Delete save capability
  - Toast notifications

- **ConflictModal** (`client/src/components/ConflictModal.jsx`)
  - Visual comparison of local vs server saves
  - Three resolution options:
    1. Use Local (keeps device state)
    2. Use Server (uses cloud state)
    3. Smart Merge (combines both by timestamp)
  - Shows newer badge and detailed stats

### 3. Persistence Strategy

#### Dual Storage
1. **localStorage**: Immediate, offline-capable
   - Key format: `nqueens:autosave:{userId}:{sessionId}`
   - Fallback: `nqueens:guest:autosave`
   - Survives page reloads

2. **Server Storage**: Synchronized, cross-device
   - MongoDB with indexes for performance
   - Survives device changes
   - Supports user account linkage

#### Save Triggers
- Every 10 seconds (auto-save timer)
- On queen placement/removal
- On hint usage
- On pause/stop timer
- Before window unload

### 4. Conflict Resolution

#### Detection
Conflicts are detected when:
- Local and server saves differ in moves or board state
- Time difference > 5 seconds
- Happens on login or explicit load

#### Merge Algorithm
```javascript
// For each move, keep the one with latest timestamp
// Rebuild board state from merged move list
// Preserve maximum timer and hints used
```

### 5. Hint System

#### Server-Side Generation
- Smart algorithm in `server/utils/hintAdapter.js`
- Prioritizes empty rows
- Scores positions by safety
- Avoids diagonal threats
- Prefers edge positions

#### Rate Limiting
- 3 hints per game session (database enforced)
- 10 requests per minute (API rate limit)
- Client-side tracking for UX
- Clear error messages on limit

### 6. Session Tracking

#### Analytics Captured
- Session start/end time
- Total moves count
- Hints used
- Completion status
- Device/platform metadata
- Performance metrics (optional)

#### Use Cases
- User progress tracking
- Difficulty analysis
- Hint usage patterns
- Completion rate metrics

## 📁 File Structure

### Backend
```
server/
├── models/
│   ├── GameSave.js          # Game save schema
│   └── Session.js           # Session tracking schema
├── controllers/
│   └── gameSaveController.js # Business logic
├── routes/
│   └── gameSaves.js         # API routes
├── middleware/
│   ├── auth.js              # JWT auth (updated)
│   └── rateLimiter.js       # Rate limiting
├── utils/
│   └── hintAdapter.js       # Hint generation
└── __tests__/
    └── gameSaves.test.js    # API tests
```

### Frontend
```
client/src/
├── store/
│   ├── store.js             # Redux store (updated)
│   └── slices/
│       └── saveSlice.js     # Save state management
├── api/
│   └── gameApi.js           # API wrappers
├── hooks/
│   ├── useAutoSave.js       # Auto-save logic
│   └── useResumeOnLogin.js  # Resume logic
└── components/
    ├── SaveManager.jsx      # Save UI
    └── ConflictModal.jsx    # Conflict resolution UI
```

## 🔧 Environment Variables

Add to `.env`:
```bash
# Required
MONGO_URI=mongodb://localhost:27017/nqueens
JWT_SECRET=your-super-secret-key-change-in-production

# Optional
SAVE_RETENTION_DAYS=90
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
CLIENT_ORIGIN=http://localhost:5173
```

## 📦 Dependencies

### Server (add to `server/package.json`)
```json
{
  "dependencies": {
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

### Client (add to `client/package.json`)
```json
{
  "dependencies": {
    "uuid": "^9.0.1"
  }
}
```

## 🚀 Installation

```powershell
# Install server dependencies
cd server
npm install express-rate-limit
npm install --save-dev jest supertest

# Install client dependencies
cd ../client
npm install uuid
```

## 🧪 Testing

### Run Backend Tests
```powershell
cd server
npm test -- gameSaves.test.js
```

### Manual Testing
See `DAY4_QUICK_TEST.md` for step-by-step validation.

## 📝 Example Usage

### Save Game (from client)
```javascript
import { saveGameAsync } from './store/slices/saveSlice';

dispatch(saveGameAsync({
  sessionId: 'uuid-here',
  n: 8,
  boardState: [[0,0,...], [0,0,...]],
  moves: [{ row: 0, col: 0, action: 'place', timestamp: new Date() }],
  placedQueens: 1,
  timer: 5000,
  hintsUsed: 0,
  lastUpdated: new Date().toISOString(),
  metadata: { device: 'web', appVersion: '1.0.0' }
}));
```

### Load Game
```javascript
import { loadLatestGameAsync } from './store/slices/saveSlice';

const result = await dispatch(loadLatestGameAsync(sessionId)).unwrap();
// Apply result.boardState, result.timer, etc. to game state
```

### Request Hint
```javascript
import { requestHintAsync } from './store/slices/saveSlice';

const hint = await dispatch(requestHintAsync({
  sessionId,
  boardState: currentBoard,
  n: boardSize
})).unwrap();

// hint.row, hint.col contains the suggested position
```

## 🔍 Example cURL Commands

### Save Game (Guest)
```bash
curl -X POST http://localhost:5000/api/game/save \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "n": 8,
    "boardState": [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
    "moves": [],
    "placedQueens": 0,
    "timer": 0,
    "hintsUsed": 0
  }'
```

### Load Latest
```bash
curl -X GET "http://localhost:5000/api/game/latest?sessionId=test-123"
```

### Request Hint
```bash
curl -X POST http://localhost:5000/api/game/hint \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "boardState": [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
    "n": 8
  }'
```

### List User Saves (Authenticated)
```bash
curl -X GET http://localhost:5000/api/game/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete Save
```bash
curl -X DELETE http://localhost:5000/api/game/SAVE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Integration Example

### In PlayGame.jsx
```jsx
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SaveManager from '../components/SaveManager';
import ConflictModal from '../components/ConflictModal';
import { useAutoSave } from '../hooks/useAutoSave';
import { useResumeOnLogin } from '../hooks/useResumeOnLogin';

function PlayGame() {
  const [sessionId] = useState(() => uuidv4());
  const [gameState, setGameState] = useState({
    n: 8,
    boardState: Array(8).fill(null).map(() => Array(8).fill(0)),
    moves: [],
    placedQueens: 0,
    timer: 0,
    hintsUsed: 0
  });

  // Auto-save hook
  useAutoSave(gameState, sessionId);

  // Resume on login
  const { attemptResume } = useResumeOnLogin(sessionId, {
    onResumeSuccess: (save) => {
      setGameState({
        n: save.n,
        boardState: save.boardState,
        moves: save.moves,
        placedQueens: save.placedQueens,
        timer: save.timer,
        hintsUsed: save.hintsUsed
      });
    }
  });

  const handleLoadGame = (save) => {
    setGameState({
      n: save.n,
      boardState: save.boardState,
      moves: save.moves,
      placedQueens: save.placedQueens,
      timer: save.timer,
      hintsUsed: save.hintsUsed
    });
  };

  return (
    <div>
      <SaveManager 
        gameState={gameState} 
        sessionId={sessionId}
        onLoadGame={handleLoadGame}
      />
      <ConflictModal onResolve={handleLoadGame} />
      {/* Your game board here */}
    </div>
  );
}
```

## ⚠️ Known Limitations

1. **Hint Algorithm**: Basic implementation - can be enhanced with ML
2. **Storage Limits**: localStorage has ~5MB limit per domain
3. **Offline Sync**: No background sync when offline
4. **Concurrent Edits**: Last write wins (no operational transforms)

## 🔮 Future Enhancements

- [ ] Implement cloud storage cleanup (delete saves older than SAVE_RETENTION_DAYS)
- [ ] Add WebSocket for real-time sync across tabs
- [ ] Implement IndexedDB for larger storage capacity
- [ ] Add save compression for large games
- [ ] Implement diff-based saves to reduce bandwidth
- [ ] Add save export/import (JSON/CSV)
- [ ] Implement save encryption for sensitive data
- [ ] Add undo/redo using moves history

## 📊 Performance Considerations

- Indexes on userId, sessionId, lastUpdated for fast queries
- Pagination for save lists (default 10 per page)
- Rate limiting prevents API abuse
- Exponential backoff prevents server overload
- Optimistic UI updates for instant feedback

## 🎉 Success Criteria

✅ Games auto-save every 10 seconds  
✅ Games resume on login  
✅ Conflicts are detected and resolvable  
✅ Hints work with rate limiting  
✅ Session tracking captures analytics  
✅ Tests pass for all API endpoints  
✅ Error handling with retries  
✅ Cross-platform compatible  

## 📞 Support

For issues or questions:
1. Check `DAY4_QUICK_TEST.md` for troubleshooting
2. Review server logs for errors
3. Check browser console for client errors
4. Verify MongoDB connection
5. Confirm JWT_SECRET is set

---

**Day 4 Complete!** ✨ Your N-Queens game now has robust save/resume capabilities, conflict resolution, hint system, and session tracking. All features are production-ready and fully tested.
