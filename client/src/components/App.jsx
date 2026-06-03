import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { Capacitor } from '@capacitor/core'
import { store } from '../store/store'
import { SimpleMobileUtils as MobileUtils } from '../utils/simpleMobile'
import ErrorBoundary from './ui/ErrorBoundary'
import OfflineBanner from './ui/OfflineBanner'

// Add these imports at the top with your other imports
import DailyChallengeHistory from '../pages/DailyChallengeHistory'
import DailyChallengeStats from '../pages/DailyChallengeStats'

// ─── Layout & Shell ────────────────────────────────────────────────────────────
import Layout from './layout/Layout'
import ProtectedRoute from './ProtectedRoute'
import NotificationManager from './NotificationManager'
import AnalyticsRoute from './AnalyticsRoute'
import Settings from './pages/Settings'

// ─── Static / Public Pages ────────────────────────────────────────────────────
import Home from './Home'
import About from './About'
import Contact from './Contact'
import Tutorial from './Tutorial'
import Analytics from './pages/Analytics'

// ─── Auth Pages ───────────────────────────────────────────────────────────────
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'

// ─── Core Game Pages ──────────────────────────────────────────────────────────
import Play from '../pages/Play'
import BoardSizeSelector from '../pages/BoardSizeSelector'
import ClassicGame from '../pages/ClassicGame'
import TimeTrialSelector from '../pages/TimeTrialSelector'
import TimeTrialGame from '../pages/TimeTrialGame'

// ─── Dashboard / Profile / Settings ──────────────────────────────────────────
import Dashboard from '../pages/Dashboard'
import Profile from '../pages/Profile'
import Stats from '../pages/Stats'
import SettingsPage from '../pages/SettingsPage'

// ─── Leaderboard / Analytics ──────────────────────────────────────────────────
import Leaderboard from './Leaderboard'
import AnalyticsDashboard from './AnalyticsDashboard'

// ─── Achievements / Badges / Rewards ─────────────────────────────────────────
import AchievementsPage from '../pages/AchievementsPage'
import BadgesPage from '../pages/BadgesPage'
import RewardHistoryPage from '../pages/RewardHistoryPage'

// ─── Daily Challenge ──────────────────────────────────────────────────────────
import DailyChallengePage from '../pages/DailyChallengePage'
import DailyChallenge from './DailyChallenge'

// ─── Multiplayer ──────────────────────────────────────────────────────────────
import MultiplayerGame from './MultiplayerGame'
import { MultiplayerHome }        from '../pages/MultiplayerHome'
import { Matchmaking }            from '../pages/Matchmaking'
import { MultiplayerRoom }        from '../pages/MultiplayerRoom'
import { MultiplayerSpectate }    from '../pages/MultiplayerSpectate'
import { MultiplayerLeaderboard } from '../pages/MultiplayerLeaderboard'

// ─── Tournaments ──────────────────────────────────────────────────────────────
import TournamentList from './TournamentList'

// ─── Social ───────────────────────────────────────────────────────────────────
import FriendsList from './Social/FriendsList'
import GameReplays from './Social/GameReplays'

// ─── Puzzles ─────────────────────────────────────────────────────────────────
import PuzzleList      from '../pages/PuzzleList'
import PuzzlePlay      from '../pages/PuzzlePlay'
import PuzzleCompleted from '../pages/PuzzleCompleted'
import PuzzleCreator   from './Puzzles/PuzzleCreator'
import PuzzleLibrary   from './Puzzles/PuzzleLibrary'

// ─── Email / Notification Settings ───────────────────────────────────────────
import EmailNotificationSettings from './EmailNotificationSettings'

// ─── UI Components for Phase 5 ───────────────────────────────────────────────
import { PageSkeleton, GameBoardSkeleton, LeaderboardSkeleton } from './ui/LoadingSkeleton'

import '../index.css'

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  const [isOfflineMode, setIsOfflineMode]   = useState(false)
  const [appInitialized, setAppInitialized] = useState(false)
  const [error, setError]                   = useState(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isMobilePlatform = Capacitor.isNativePlatform()

        if (isMobilePlatform) {
          setIsOfflineMode(true)
          setTimeout(() => {
            MobileUtils.initializeMobileApp().catch(console.error)
            MobileUtils.scheduleDailyChallengeNotification().catch(console.error)
          }, 100)
        }

        setAppInitialized(true)
      } catch (err) {
        console.error('App initialization error:', err)
        setError(err.message)
        setAppInitialized(true)
      }
    }

    initializeApp()
  }, [])

  if (error) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', height: '100vh', background: '#0F0F1A',
        padding: '20px', textAlign: 'center',
      }}>
        <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>N-Queens Game</h1>
        <p style={{ color: '#9ca3af', marginBottom: '20px' }}>
          Initialization error: {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#7C3AED', color: 'white', border: 'none',
            padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Reload App
        </button>
      </div>
    )
  }

  if (!appInitialized) {
    return <PageSkeleton />
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          {/* Offline Banner - shows when connection drops */}
          <OfflineBanner />
          
          <div className="App">
            <AnalyticsRoute>
              <Routes>

                {/* ── Pages WITH Navbar + Footer (Layout wrapper) ───────── */}
                <Route element={<Layout />}>
                  <Route path="/"            element={<Home />} />
                  <Route path="/about"       element={<About />} />
                  <Route path="/contact"     element={<Contact />} />
                  <Route path="/tutorial"    element={<Tutorial />} />
                  <Route path="/play"        element={<Play />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/daily-challenge/history" element={<DailyChallengeHistory />} />
                  <Route path="/daily-challenge/stats" element={<DailyChallengeStats />} />
                  
                  {/* Protected inside Layout */}
                  <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/stats"       element={<ProtectedRoute><Stats /></ProtectedRoute>} />
                  <Route path="/settings"    element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
                  <Route path="/badges"      element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
                  <Route path="/rewards/history" element={<ProtectedRoute><RewardHistoryPage /></ProtectedRoute>} />
                  <Route path="/analytics"   element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
                  <Route path="/analytics" element={<Analytics />} />
                  
                  {/* Social */}
                  <Route path="/friends"     element={<ProtectedRoute><FriendsList /></ProtectedRoute>} />
                  <Route path="/replays"     element={<ProtectedRoute><GameReplays /></ProtectedRoute>} />

                  {/* Tournaments */}
                  <Route path="/tournaments" element={<TournamentList />} />

                  {/* Email / notification preferences */}
                  <Route path="/email-settings" element={<ProtectedRoute><EmailNotificationSettings /></ProtectedRoute>} />
                </Route>

                {/* ── Auth (no Layout) ──────────────────────────────────── */}
                <Route path="/login"          element={<Login />} />
                <Route path="/signup"         element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password"  element={<ResetPassword />} />

                {/* ── Classic Game Flow (no Layout) ─────────────────────── */}
                <Route path="/board-size-selector" element={<BoardSizeSelector />} />
                <Route path="/classic-game"        element={<ClassicGame />} />

                {/* ── Time Trial Flow (no Layout) ───────────────────────── */}
                <Route path="/time-trial-selector" element={<TimeTrialSelector />} />
                <Route path="/time-trial-game"     element={<TimeTrialGame />} />

                {/* ── Daily Challenge (no Layout) ───────────────────────── */}
                <Route path="/daily-challenge"         element={<ProtectedRoute><DailyChallengePage /></ProtectedRoute>} />
                <Route path="/daily-challenge/play"    element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
                <Route path="/daily-challenge/history" element={<ProtectedRoute><DailyChallengePage /></ProtectedRoute>} />
                <Route path="/daily-challenge/stats"   element={<ProtectedRoute><DailyChallengePage /></ProtectedRoute>} />

                {/* ── Puzzles ───────────────────────────────────────────── */}
                <Route path="/puzzles"                   element={<PuzzleList />} />
                <Route path="/puzzles/:puzzleId"         element={<ProtectedRoute><PuzzlePlay /></ProtectedRoute>} />
                <Route path="/puzzles/:puzzleId/completed" element={<ProtectedRoute><PuzzleCompleted /></ProtectedRoute>} />
                <Route path="/puzzle-creator"            element={<ProtectedRoute><PuzzleCreator /></ProtectedRoute>} />
                <Route path="/puzzle-library"            element={<PuzzleLibrary />} />

                {/* ── Multiplayer ───────────────────────────────────────── */}
                <Route path="/multiplayer"             element={<Navigate to="/multiplayer/home" replace />} />
                <Route path="/multiplayer/home"        element={<ProtectedRoute><MultiplayerHome /></ProtectedRoute>} />
                <Route path="/multiplayer/matchmaking" element={<ProtectedRoute><Matchmaking /></ProtectedRoute>} />
                <Route path="/multiplayer/room/:roomId"     element={<ProtectedRoute><MultiplayerRoom /></ProtectedRoute>} />
                <Route path="/multiplayer/spectate/:roomId" element={<ProtectedRoute><MultiplayerSpectate /></ProtectedRoute>} />
                <Route path="/multiplayer/leaderboard" element={<MultiplayerLeaderboard />} />

                {/* ── Legacy redirects ─────────────────────────────────── */}
                <Route path="/game-board"          element={<Navigate to="/play" replace />} />
                <Route path="/game"                element={<Navigate to="/play" replace />} />
                <Route path="/game/:mode"          element={<Navigate to="/play" replace />} />
                <Route path="/nqueens"             element={<Navigate to="/play" replace />} />
                <Route path="/play-game"           element={<Navigate to="/play" replace />} />
                <Route path="/classic-mode"        element={<Navigate to="/board-size-selector" replace />} />
                <Route path="/time-trial-mode"     element={<Navigate to="/time-trial-selector" replace />} />
                <Route path="/achievements-page"   element={<Navigate to="/achievements" replace />} />
                <Route path="/offline"             element={<Navigate to="/play" replace />} />

                {/* ── 404 fallback ──────────────────────────────────────── */}
                <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </AnalyticsRoute>

            {/* Global Achievement & Badge Notifications */}
            <NotificationManager />

            {/* Global toast notifications */}
            <Toaster
              position={isOfflineMode ? 'bottom-center' : 'top-right'}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a2e',
                  color: '#fff',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </div>
        </Router>
      </Provider>
    </ErrorBoundary>
  )
}

export default App