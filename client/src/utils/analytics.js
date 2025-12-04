import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

class AnalyticsTracker {
  constructor() {
    this.sessionId = this.generateSessionId()
    this.pageStartTime = Date.now()
    this.eventQueue = []
    this.isOnline = navigator.onLine
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushEventQueue()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('page_unload', {
        behaviorData: {
          timeOnPage: Date.now() - this.pageStartTime
        }
      })
      this.flushEventQueue()
    })

    // Auto-flush queue every 30 seconds
    setInterval(() => {
      this.flushEventQueue()
    }, 30000)
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  async trackEvent(eventType, data = {}) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        // Skip tracking for unauthenticated users
        return
      }

      const eventData = {
        eventType,
        sessionId: this.sessionId,
        gameData: data.gameData || {},
        behaviorData: {
          deviceType: this.getDeviceType(),
          browserType: this.getBrowserType(),
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          platform: 'web',
          timeOnPage: Date.now() - this.pageStartTime,
          ...data.behaviorData
        },
        performanceData: {
          loadTime: this.getPageLoadTime(),
          ...data.performanceData
        },
        customData: data.customData || {},
        timestamp: new Date().toISOString()
      }

      if (this.isOnline) {
        await this.sendEvent(eventData)
      } else {
        this.eventQueue.push(eventData)
      }
    } catch (error) {
      // Silently ignore analytics errors
    }
  }

  async sendEvent(eventData) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        // Silently skip tracking for unauthenticated users
        return
      }

      await axios.post(`${API_URL}/api/analytics/track`, eventData, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000 // 5 second timeout
      })
    } catch (error) {
      // Silently fail - don't spam console with analytics errors
      if (error.response?.status === 401) {
        // Token expired, don't retry
        return
      }
      // For other errors, just ignore
    }
  }

  async flushEventQueue() {
    if (this.eventQueue.length === 0) return

    const eventsToSend = [...this.eventQueue]
    this.eventQueue = []

    for (const event of eventsToSend) {
      try {
        await this.sendEvent(event)
      } catch (error) {
        // Put failed events back in queue
        this.eventQueue.push(event)
      }
    }
  }

  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/mobile|android|iphone|ipad|tablet/.test(userAgent)) {
      return /ipad|tablet/.test(userAgent) ? 'tablet' : 'mobile'
    }
    return 'desktop'
  }

  getBrowserType() {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('chrome')) return 'chrome'
    if (userAgent.includes('firefox')) return 'firefox'
    if (userAgent.includes('safari')) return 'safari'
    if (userAgent.includes('edge')) return 'edge'
    return 'other'
  }

  getPageLoadTime() {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing
      return timing.loadEventEnd - timing.navigationStart
    }
    return null
  }

  // Game-specific tracking methods
  trackGameStarted(gameData) {
    this.trackEvent('game_started', {
      gameData: {
        mode: gameData.mode,
        boardSize: gameData.boardSize,
        difficulty: gameData.difficulty,
        level: gameData.level,
        timeLimit: gameData.timeLimit
      }
    })
  }

  trackGameCompleted(gameData) {
    this.trackEvent('game_completed', {
      gameData: {
        mode: gameData.mode,
        boardSize: gameData.boardSize,
        difficulty: gameData.difficulty,
        timeElapsed: gameData.timeElapsed,
        movesCount: gameData.moves,
        hintsUsed: gameData.hints,
        score: gameData.score,
        completed: true,
        level: gameData.level
      }
    })
  }

  trackGameAbandoned(gameData) {
    this.trackEvent('game_abandoned', {
      gameData: {
        mode: gameData.mode,
        boardSize: gameData.boardSize,
        timeElapsed: gameData.timeElapsed,
        movesCount: gameData.moves,
        hintsUsed: gameData.hints,
        completed: false
      }
    })
  }

  trackHintUsed(gameData) {
    this.trackEvent('hint_used', {
      gameData: {
        mode: gameData.mode,
        boardSize: gameData.boardSize,
        hintsUsed: gameData.hintsUsed
      }
    })
  }

  trackAchievementUnlocked(achievementData) {
    this.trackEvent('achievement_unlocked', {
      customData: {
        achievementId: achievementData.id,
        achievementName: achievementData.name,
        achievementCategory: achievementData.category,
        achievementPoints: achievementData.points
      }
    })
  }

  trackDailyChallengeCompleted(challengeData) {
    this.trackEvent('daily_challenge_completed', {
      gameData: {
        mode: 'daily-challenge',
        boardSize: challengeData.boardSize,
        timeElapsed: challengeData.timeElapsed,
        score: challengeData.score
      },
      customData: {
        challengeDate: challengeData.date,
        streak: challengeData.streak
      }
    })
  }

  trackMultiplayerJoined(gameData) {
    this.trackEvent('multiplayer_joined', {
      gameData: {
        mode: 'multiplayer',
        roomId: gameData.roomId,
        playerCount: gameData.playerCount
      }
    })
  }

  trackMultiplayerCompleted(gameData) {
    this.trackEvent('multiplayer_completed', {
      gameData: {
        mode: 'multiplayer',
        roomId: gameData.roomId,
        timeElapsed: gameData.timeElapsed,
        score: gameData.score,
        position: gameData.position,
        playerCount: gameData.playerCount
      }
    })
  }

  trackTutorialCompleted(tutorialData) {
    this.trackEvent('tutorial_completed', {
      customData: {
        tutorialSection: tutorialData.section,
        timeSpent: tutorialData.timeSpent
      }
    })
  }

  trackSettingsChanged(settingsData) {
    this.trackEvent('settings_changed', {
      customData: {
        settingType: settingsData.type,
        oldValue: settingsData.oldValue,
        newValue: settingsData.newValue
      }
    })
  }

  trackSocialShare(shareData) {
    this.trackEvent('social_share', {
      customData: {
        platform: shareData.platform,
        contentType: shareData.contentType,
        contentId: shareData.contentId
      }
    })
  }

  trackPuzzleCreated(puzzleData) {
    this.trackEvent('puzzle_created', {
      gameData: {
        boardSize: puzzleData.boardSize,
        difficulty: puzzleData.difficulty
      },
      customData: {
        puzzleId: puzzleData.id,
        isPublic: puzzleData.isPublic
      }
    })
  }

  trackPuzzleShared(puzzleData) {
    this.trackEvent('puzzle_shared', {
      customData: {
        puzzleId: puzzleData.id,
        shareMethod: puzzleData.shareMethod
      }
    })
  }

  // Performance tracking
  trackPerformanceError(errorData) {
    this.trackEvent('performance_error', {
      performanceData: {
        errorCount: 1,
        errorTypes: [errorData.type]
      },
      customData: {
        errorMessage: errorData.message,
        errorStack: errorData.stack,
        userAgent: navigator.userAgent
      }
    })
  }

  // User interaction tracking
  trackClick(element) {
    this.trackEvent('user_click', {
      behaviorData: {
        clicksCount: 1
      },
      customData: {
        elementType: element.tagName,
        elementId: element.id,
        elementClass: element.className
      }
    })
  }

  trackPageView(page) {
    this.trackEvent('page_view', {
      customData: {
        page,
        referrer: document.referrer,
        url: window.location.href
      }
    })
  }
}

// Create global instance
const analytics = new AnalyticsTracker()

// Export convenience methods
export const trackGameStarted = (gameData) => analytics.trackGameStarted(gameData)
export const trackGameCompleted = (gameData) => analytics.trackGameCompleted(gameData)
export const trackGameAbandoned = (gameData) => analytics.trackGameAbandoned(gameData)
export const trackHintUsed = (gameData) => analytics.trackHintUsed(gameData)
export const trackAchievementUnlocked = (achievementData) => analytics.trackAchievementUnlocked(achievementData)
export const trackDailyChallengeCompleted = (challengeData) => analytics.trackDailyChallengeCompleted(challengeData)
export const trackMultiplayerJoined = (gameData) => analytics.trackMultiplayerJoined(gameData)
export const trackMultiplayerCompleted = (gameData) => analytics.trackMultiplayerCompleted(gameData)
export const trackTutorialCompleted = (tutorialData) => analytics.trackTutorialCompleted(tutorialData)
export const trackSettingsChanged = (settingsData) => analytics.trackSettingsChanged(settingsData)
export const trackSocialShare = (shareData) => analytics.trackSocialShare(shareData)
export const trackPuzzleCreated = (puzzleData) => analytics.trackPuzzleCreated(puzzleData)
export const trackPuzzleShared = (puzzleData) => analytics.trackPuzzleShared(puzzleData)
export const trackPerformanceError = (errorData) => analytics.trackPerformanceError(errorData)
export const trackPageView = (page) => analytics.trackPageView(page)

export default analytics