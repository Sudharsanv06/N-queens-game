import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'

function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showBanner, setShowBanner] = useState(false)
  const [pendingOperations, setPendingOperations] = useState(0)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowBanner(true)
      setTimeout(() => setShowBanner(false), 5000)
      
      // Sync pending operations
      syncPendingOperations()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check pending operations from IndexedDB
    checkPendingOperations()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const checkPendingOperations = async () => {
    try {
      const db = await openIndexedDB()
      const transaction = db.transaction(['pendingGames', 'pendingAchievements'], 'readonly')
      const gamesStore = transaction.objectStore('pendingGames')
      const achievementsStore = transaction.objectStore('pendingAchievements')
      
      const gamesCount = await new Promise((resolve) => {
        const request = gamesStore.count()
        request.onsuccess = () => resolve(request.result)
      })
      
      const achievementsCount = await new Promise((resolve) => {
        const request = achievementsStore.count()
        request.onsuccess = () => resolve(request.result)
      })
      
      setPendingOperations(gamesCount + achievementsCount)
    } catch (error) {
      console.error('Failed to check pending operations:', error)
    }
  }

  const syncPendingOperations = async () => {
    // Trigger background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('game-completion')
      await registration.sync.register('achievement-unlock')
    }
    
    // Also try immediate sync
    await fetch('/api/sync-pending', { method: 'POST' }).catch(console.error)
    
    setPendingOperations(0)
  }

  const openIndexedDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NQueensOfflineDB', 1)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('pendingGames')) {
          db.createObjectStore('pendingGames', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('pendingAchievements')) {
          db.createObjectStore('pendingAchievements', { keyPath: 'id' })
        }
      }
    })
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`fixed top-0 left-0 right-0 z-50 p-3 text-center ${
            isOnline 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}
        >
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {isOnline ? (
              <>
                <Wifi size={18} />
                <span className="text-sm font-medium">Back Online!</span>
                {pendingOperations > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    Syncing {pendingOperations} pending {pendingOperations === 1 ? 'operation' : 'operations'}...
                  </span>
                )}
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1 text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-all"
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              </>
            ) : (
              <>
                <WifiOff size={18} />
                <span className="text-sm font-medium">You're offline</span>
                <span className="text-xs">Some features may be unavailable</span>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-all"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineBanner