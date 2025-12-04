import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { Capacitor } from '@capacitor/core'
import { store } from '../store/store'
import { SimpleMobileUtils as MobileUtils } from '../utils/simpleMobile'
import { OfflineGameStore } from '../utils/offlineStore'
import ErrorBoundary from './ErrorBoundary'

// Import components
import Layout from './Layout'
import Home from './Home'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Dashboard from '../pages/Dashboard'
import Play from '../pages/Play'
import BoardSizeSelector from '../pages/BoardSizeSelector'
import ClassicGame from '../pages/ClassicGame'
import TimeTrialSelector from '../pages/TimeTrialSelector'
import TimeTrialGame from '../pages/TimeTrialGame'
import MultiplayerGame from './MultiplayerGame'
import DailyChallenge from './DailyChallenge'
import Leaderboard from './Leaderboard'
import About from './About'
import Contact from './Contact'
import Tutorial from './Tutorial'
import AnalyticsRoute from './AnalyticsRoute'
import AnalyticsDashboard from './AnalyticsDashboard'
import AchievementsPage from '../pages/AchievementsPage'
import BadgesPage from '../pages/BadgesPage'
import RewardHistoryPage from '../pages/RewardHistoryPage'
import DailyChallengePage from '../pages/DailyChallengePage'
import NotificationManager from './NotificationManager'

// Day 9: Multiplayer Pages
import { MultiplayerHome } from '../pages/MultiplayerHome'
import { Matchmaking } from '../pages/Matchmaking'
import { MultiplayerRoom } from '../pages/MultiplayerRoom'
import { MultiplayerSpectate } from '../pages/MultiplayerSpectate'
import { MultiplayerLeaderboard } from '../pages/MultiplayerLeaderboard'

// Import CSS
import '../index.css'

const App = () => {
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [appInitialized, setAppInitialized] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing N-Queens Game...')
        
        // Check if running on mobile
        const isMobilePlatform = Capacitor.isNativePlatform()
        console.log('Mobile platform detected:', isMobilePlatform)
        
        if (isMobilePlatform) {
          // Set offline mode for mobile
          setIsOfflineMode(true)
          
          // Initialize offline store
          window.offlineStore = OfflineGameStore
          
          // Initialize mobile features asynchronously (don't block)
          setTimeout(() => {
            MobileUtils.initializeMobileApp().catch(console.error)
            MobileUtils.scheduleDailyChallengeNotification().catch(console.error)
          }, 100)
        }
        
        // Set up simple toast reference
        window.toast = {
          success: (message) => console.log('SUCCESS:', message),
          error: (message) => console.log('ERROR:', message),
          loading: (message) => console.log('LOADING:', message)
        }
        
        // Set initialized immediately
        setAppInitialized(true)
        console.log('App initialization complete')
      } catch (error) {
        console.error('App initialization error:', error)
        setError(error.message)
        // Always allow app to load
        setAppInitialized(true)
      }
    }

    initializeApp()
  }, [])

  // Show error if initialization failed
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f3f7ee',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#dc2626', marginBottom: '20px' }}>N-Queens Game</h1>
        <p style={{ color: '#374151', marginBottom: '20px' }}>Error during initialization: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            background: '#16a34a',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reload App
        </button>
      </div>
    )
  }

  // Show loading screen while initializing
  if (!appInitialized) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f3f7ee',
        fontSize: '18px',
        color: '#0d0d0d'
      }}>
        <div style={{ marginBottom: '20px' }}>Loading N-Queens Game...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>If this takes too long, please refresh the page.</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <Router>
          <div className="App">
            <AnalyticsRoute>
            <Routes>
              {/* Routes with Layout (Navbar + Footer) */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/play" element={<Play />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/tutorial" element={<Tutorial />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/badges" element={<BadgesPage />} />
                <Route path="/rewards/history" element={<RewardHistoryPage />} />
              </Route>

              {/* Auth routes without Layout */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Game routes without Layout */}
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              
              {/* Classic Mode - Two Page Flow */}
              <Route path="/board-size-selector" element={<BoardSizeSelector />} />
              <Route path="/classic-game" element={<ClassicGame />} />
              
              {/* Time Trial Mode - Two Page Flow */}
              <Route path="/time-trial-selector" element={<TimeTrialSelector />} />
              <Route path="/time-trial-game" element={<TimeTrialGame />} />
              
              <Route path="/multiplayer" element={<MultiplayerGame />} />
              <Route path="/daily-challenge" element={<DailyChallengePage />} />
              
              {/* Day 9: New Multiplayer Routes */}
              <Route path="/multiplayer/home" element={<MultiplayerHome />} />
              <Route path="/multiplayer/matchmaking" element={<Matchmaking />} />
              <Route path="/multiplayer/room/:roomId" element={<MultiplayerRoom />} />
              <Route path="/multiplayer/spectate/:roomId" element={<MultiplayerSpectate />} />
              <Route path="/multiplayer/leaderboard" element={<MultiplayerLeaderboard />} />
              
              {/* Achievement & Badge routes */}
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/badges" element={<BadgesPage />} />
              <Route path="/rewards/history" element={<RewardHistoryPage />} />
              
              {/* Redirect legacy routes */}
              <Route path="/game-board" element={<Navigate to="/game" replace />} />
              
              {/* 404 fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnalyticsRoute>
          
          {/* Global Achievement & Badge Notifications */}
          <NotificationManager />
          
          {/* Global toast notifications */}
          <Toaster
            position={isOfflineMode ? "bottom-center" : "top-right"}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </Provider>
    </ErrorBoundary>
  )
}

export default App
