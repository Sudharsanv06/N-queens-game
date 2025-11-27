# Day 4 Usage Examples & Quick Reference

## 📡 API Endpoints Quick Reference

### Base URL
```
Local: http://localhost:5000
Production: https://your-domain.com
```

---

## 1️⃣ Save Game

### Guest Save (No Authentication)
```powershell
curl -X POST http://localhost:5000/api/game/save `
  -H "Content-Type: application/json" `
  -d '{
    \"sessionId\": \"guest-123\",
    \"n\": 8,
    \"boardState\": [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
    \"moves\": [
      {\"row\": 0, \"col\": 0, \"action\": \"place\", \"timestamp\": \"2025-11-26T10:00:00Z\"}
    ],
    \"placedQueens\": 1,
    \"timer\": 5000,
    \"hintsUsed\": 0,
    \"metadata\": {
      \"device\": \"web\",
      \"appVersion\": \"1.0.0\",
      \"platform\": \"Win32\"
    }
  }'
```

### Authenticated Save
```powershell
curl -X POST http://localhost:5000/api/game/save `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN" `
  -d '{
    \"sessionId\": \"user-session-456\",
    \"n\": 10,
    \"boardState\": [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]],
    \"moves\": [],
    \"placedQueens\": 0,
    \"timer\": 0,
    \"hintsUsed\": 0
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Game saved successfully",
  "data": {
    "id": "674645abc123def456789",
    "sessionId": "guest-123",
    "n": 8,
    "boardState": [...],
    "moves": [...],
    "placedQueens": 1,
    "timer": 5000,
    "hintsUsed": 0,
    "lastUpdated": "2025-11-26T10:00:00.000Z",
    "createdAt": "2025-11-26T10:00:00.000Z",
    "metadata": {...}
  }
}
```

---

## 2️⃣ Load Game by ID

```powershell
curl http://localhost:5000/api/game/load/674645abc123def456789
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "674645abc123def456789",
    "sessionId": "guest-123",
    "n": 8,
    "boardState": [...],
    "placedQueens": 1,
    "timer": 5000,
    "hintsUsed": 0
  }
}
```

---

## 3️⃣ Load Latest Save

### By Session ID
```powershell
curl "http://localhost:5000/api/game/latest?sessionId=guest-123"
```

### With Authentication (automatically uses user ID)
```powershell
curl http://localhost:5000/api/game/latest `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "674645abc123def456789",
    "sessionId": "guest-123",
    "n": 8,
    "lastUpdated": "2025-11-26T10:00:00.000Z"
  }
}
```

---

## 4️⃣ List User Saves (Requires Auth)

```powershell
curl "http://localhost:5000/api/game/list?page=1&limit=10" `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "sessionId": "...",
      "n": 8,
      "placedQueens": 5,
      "timer": 45000,
      "lastUpdated": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

## 5️⃣ Delete Save (Requires Auth)

```powershell
curl -X DELETE http://localhost:5000/api/game/674645abc123def456789 `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Save deleted successfully"
}
```

---

## 6️⃣ Request Hint

```powershell
curl -X POST http://localhost:5000/api/game/hint `
  -H "Content-Type: application/json" `
  -d '{
    \"sessionId\": \"guest-123\",
    \"boardState\": [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
    \"n\": 8
  }'
```

**Response:**
```json
{
  "success": true,
  "hint": {
    "row": 0,
    "col": 1,
    "reasoning": "Safe position with score 15. Row 0 is empty."
  },
  "hintsRemaining": 2,
  "hintsUsed": 1
}
```

**Error (Limit Reached):**
```json
{
  "success": false,
  "message": "Hint limit reached. Maximum 3 hints per game.",
  "hintsRemaining": 0
}
```

---

## 7️⃣ Merge Save (Conflict Resolution)

```powershell
curl -X POST http://localhost:5000/api/game/merge `
  -H "Content-Type: application/json" `
  -d '{
    \"sessionId\": \"guest-123\",
    \"n\": 8,
    \"boardState\": [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
    \"moves\": [],
    \"placedQueens\": 0,
    \"timer\": 10000,
    \"hintsUsed\": 1
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Merged game saved successfully",
  "data": {...}
}
```

---

## 8️⃣ Complete Session

```powershell
curl -X POST http://localhost:5000/api/game/session/complete `
  -H "Content-Type: application/json" `
  -d '{
    \"sessionId\": \"guest-123\",
    \"analytics\": {
      \"totalTime\": 300000,
      \"averageMoveTime\": 37500,
      \"wrongMoves\": 2,
      \"correctMoves\": 8,
      \"pauseCount\": 1
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Session completed successfully",
  "data": {
    "sessionId": "guest-123",
    "completed": true,
    "duration": 300000,
    "analytics": {...}
  }
}
```

---

## 🎨 Frontend Usage Examples

### 1. Using SaveManager Component

```jsx
import SaveManager from '../components/SaveManager';

function MyGame() {
  const [gameState, setGameState] = useState({
    n: 8,
    boardState: [...],
    moves: [],
    placedQueens: 0,
    timer: 0,
    hintsUsed: 0
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
    <SaveManager 
      gameState={gameState}
      sessionId={sessionId}
      onLoadGame={handleLoadGame}
    />
  );
}
```

### 2. Using Auto-Save Hook

```jsx
import { useAutoSave } from '../hooks/useAutoSave';

function MyGame() {
  const { forceSave, isSaving, loadFromLocalStorage } = useAutoSave(
    gameState, 
    sessionId,
    {
      interval: 10000, // 10 seconds
      enabled: true,
      onSaveSuccess: () => console.log('Saved!'),
      onSaveError: (err) => console.error(err)
    }
  );

  const handleManualSave = async () => {
    await forceSave();
  };

  return (
    <button onClick={handleManualSave} disabled={isSaving}>
      {isSaving ? 'Saving...' : 'Save Now'}
    </button>
  );
}
```

### 3. Using Resume Hook

```jsx
import { useResumeOnLogin } from '../hooks/useResumeOnLogin';

function MyGame() {
  const { attemptResume, isResuming, mergeGameStates } = useResumeOnLogin(
    sessionId,
    {
      autoResumeEnabled: true,
      onResumeSuccess: (save) => {
        setGameState(save);
      },
      onConflictDetected: (conflict) => {
        console.log('Conflict:', conflict);
      }
    }
  );

  if (isResuming) {
    return <div>Loading your game...</div>;
  }

  return <div>Game content</div>;
}
```

### 4. Using Conflict Modal

```jsx
import ConflictModal from '../components/ConflictModal';

function MyGame() {
  const handleResolve = (resolvedSave) => {
    setGameState(resolvedSave);
    console.log('Conflict resolved:', resolvedSave);
  };

  return (
    <>
      {/* Your game UI */}
      <ConflictModal onResolve={handleResolve} />
    </>
  );
}
```

### 5. Requesting Hints

```jsx
import { useDispatch } from 'react-redux';
import { requestHintAsync } from '../store/slices/saveSlice';

function MyGame() {
  const dispatch = useDispatch();
  const { lastHint, hintsRemaining } = useSelector(state => state.save);

  const handleRequestHint = async () => {
    try {
      const result = await dispatch(requestHintAsync({
        sessionId,
        boardState,
        n: 8
      })).unwrap();

      console.log('Hint:', result.hint);
      // Highlight the suggested cell
      highlightCell(result.hint.row, result.hint.col);
    } catch (error) {
      alert(error);
    }
  };

  return (
    <button 
      onClick={handleRequestHint}
      disabled={hintsRemaining <= 0}
    >
      Get Hint ({hintsRemaining} left)
    </button>
  );
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Guest User Flow
```powershell
# 1. Create session and save
curl -X POST http://localhost:5000/api/game/save -H "Content-Type: application/json" -d '{...}'

# 2. Request hint
curl -X POST http://localhost:5000/api/game/hint -H "Content-Type: application/json" -d '{...}'

# 3. Load latest
curl "http://localhost:5000/api/game/latest?sessionId=guest-123"

# 4. Update and save again
curl -X POST http://localhost:5000/api/game/save -H "Content-Type: application/json" -d '{...}'
```

### Scenario 2: Authenticated User Flow
```powershell
# 1. Login and get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password"}' | jq -r '.token')

# 2. Save with auth
curl -X POST http://localhost:5000/api/game/save -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{...}'

# 3. List all saves
curl -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/game/list"

# 4. Load specific save
curl -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/game/load/SAVE_ID"

# 5. Delete save
curl -X DELETE -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/game/SAVE_ID"
```

### Scenario 3: Hint Exhaustion Test
```powershell
# Request hints until limit
for i in {1..4}; do
  curl -X POST http://localhost:5000/api/game/hint -H "Content-Type: application/json" -d '{
    "sessionId": "hint-test",
    "boardState": [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]],
    "n": 8
  }'
  echo "\nHint request $i"
  sleep 1
done
```

---

## 🔑 Environment Variables

```bash
# .env file
MONGO_URI=mongodb://localhost:27017/nqueens
JWT_SECRET=your-secret-key-min-32-chars
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
SAVE_RETENTION_DAYS=90
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

---

## 🚀 Running Seed Script

```powershell
cd server
node seed-saves.js
```

**Output:**
```
Connected successfully!
Clearing existing test data...
Creating sample game saves...
✓ Created 3 game saves
Creating sample sessions...
✓ Created 3 sessions

=== Sample Save IDs (for testing) ===
1. SessionID: seed-session-001, SaveID: 674645...
2. SessionID: seed-session-002, SaveID: 674646...
3. SessionID: seed-session-003, SaveID: 674647...
```

---

## 📊 Error Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Save/load successful |
| 400 | Bad Request | Invalid board size, missing fields |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Trying to access another user's save |
| 404 | Not Found | Save or session doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Database or server issue |

---

## 🎯 Quick Tips

1. **Session ID**: Generate with `uuid` library on client
2. **Auto-save**: Triggers every 10s by default
3. **Hints**: Limited to 3 per session
4. **localStorage**: Synced immediately, server synced async
5. **Conflicts**: Auto-detected on resume/login
6. **Retries**: Failed saves retry 3 times with exponential backoff
7. **Token**: JWT expires in 24h by default

---

## 📞 Troubleshooting Quick Fixes

**Problem**: "Session not found" on hint request  
**Fix**: Ensure you've saved the game at least once to create a session

**Problem**: Conflict modal not showing  
**Fix**: Check Redux state `save.conflictData` is not null

**Problem**: Auto-save not working  
**Fix**: Verify `useAutoSave` hook is called and gameState is not null

**Problem**: "Database connection unavailable"  
**Fix**: Start MongoDB: `net start MongoDB`

**Problem**: CORS error  
**Fix**: Add `CLIENT_ORIGIN=http://localhost:5173` to .env

---

This quick reference should help you integrate and test all Day 4 features! 🚀
