// Service Worker for N-Queens Game - Push Notifications & Offline Support
// Version: 1.0.0

const CACHE_NAME = 'nqueens-v1'
const OFFLINE_URL = '/offline.html'

// Assets to cache on install (core assets only - dynamic assets will be cached on fetch)
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/badge-72x72.png',
  '/offline.html'
]

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  // Skip waiting to activate immediately
  self.skipWaiting()
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('Service Worker: Caching static assets')
      
      // Cache each asset individually to avoid failing the whole install if one fails
      const cachePromises = STATIC_CACHE_URLS.map(async (url) => {
        try {
          const response = await fetch(url)
          if (response.ok) {
            await cache.put(url, response)
            console.log(`Cached: ${url}`)
          } else {
            console.warn(`Failed to cache ${url}: ${response.status}`)
          }
        } catch (error) {
          console.warn(`Failed to fetch ${url}:`, error)
        }
      })
      
      await Promise.all(cachePromises)
      console.log('Service Worker: Static assets cached')
    }).catch(err => {
      console.warn('Service Worker: Cache open failed:', err)
    })
  )
})

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Service Worker: Deleting old cache: ${cacheName}`)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker: Taking control of clients')
      return self.clients.claim()
    })
  )
})

// Fetch event - serve from cache first, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip cross-origin requests (except for CDNs)
  if (url.origin !== self.location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return
  }
  
  // Skip API calls - never cache
  if (url.pathname.startsWith('/api/')) {
    return
  }
  
  // Skip analytics and tracking
  if (url.pathname.includes('analytics') || url.pathname.includes('tracking')) {
    return
  }
  
  event.respondWith(
    caches.match(request).then(async (cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse
      }
      
      // Try network fetch
      try {
        const networkResponse = await fetch(request)
        
        // Cache successful responses for static assets
        if (networkResponse && networkResponse.ok) {
          const responseToCache = networkResponse.clone()
          
          // Only cache specific file types
          const shouldCache = (
            request.destination === 'style' ||
            request.destination === 'script' ||
            request.destination === 'font' ||
            request.destination === 'image' ||
            url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.json')
          )
          
          if (shouldCache) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            }).catch(err => {
              console.warn('Failed to cache response:', err)
            })
          }
        }
        
        return networkResponse
      } catch (error) {
        console.warn('Fetch failed, returning offline page:', error)
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL)
        }
        
        return new Response('Network error - please check your connection', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        })
      }
    })
  )
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received', event)
  
  let data = {}
  
  if (event.data) {
    try {
      data = event.data.json()
    } catch (error) {
      console.error('Service Worker: Error parsing push data:', error)
      data = {
        title: 'N-Queens Game',
        body: 'You have a new notification',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      }
    }
  }
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    image: data.image,
    data: data.data || {},
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    tag: data.tag || 'nqueens-notification',
    renotify: data.renotify || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: Date.now()
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'N-Queens Game', options)
  )
})

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification Click Received', event)
  
  const notification = event.notification
  const data = notification.data || {}
  const action = event.action
  
  notification.close()
  
  event.waitUntil(handleNotificationClick(action, data))
})

// Handle different notification types and actions
async function handleNotificationClick(action, data) {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  
  let url = '/'
  
  // Determine URL based on notification type and action
  switch (data.type) {
    case 'daily-challenge':
    case 'daily-challenge-reminder':
      if (action === 'play') {
        url = '/daily-challenge'
      } else if (action === 'dismiss') {
        return // Just close notification
      } else {
        url = '/daily-challenge'
      }
      break
      
    case 'game-invite':
    case 'multiplayer-invite':
      if (action === 'accept') {
        const roomId = data.roomId || ''
        url = `/multiplayer/room/${roomId}`
        
        // Send acceptance to server
        try {
          await fetch('/api/multiplayer/accept-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              inviteId: data.inviteId,
              roomId: data.roomId 
            })
          })
        } catch (error) {
          console.error('Failed to accept invite:', error)
        }
      } else if (action === 'decline') {
        // Send decline response to server
        try {
          await fetch('/api/multiplayer/decline-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              inviteId: data.inviteId,
              roomId: data.roomId 
            })
          })
        } catch (error) {
          console.error('Failed to decline invite:', error)
        }
        return
      } else {
        url = '/multiplayer'
      }
      break
      
    case 'achievement':
    case 'achievement-unlock':
      if (action === 'view') {
        url = '/achievements'
      } else {
        url = '/profile?tab=achievements'
      }
      break
      
    case 'match-found':
      if (action === 'join') {
        const roomId = data.roomId || ''
        url = `/multiplayer/room/${roomId}`
      } else {
        url = '/multiplayer'
      }
      break
      
    case 'tournament':
    case 'tournament-update':
      if (action === 'view') {
        const tournamentId = data.tournamentId || ''
        url = `/tournaments/${tournamentId}`
      } else {
        url = '/tournaments'
      }
      break
      
    default:
      url = data.url || '/'
  }
  
  // Find existing window or open new one
  let existingClient = null
  
  for (const client of clients) {
    if (client.url.includes(self.location.origin)) {
      existingClient = client
      break
    }
  }
  
  if (existingClient) {
    // Focus existing window
    await existingClient.focus()
    
    // Navigate if needed
    if (existingClient.url !== url && existingClient.navigate) {
      try {
        await existingClient.navigate(url)
      } catch (error) {
        // Fallback: send message to client
        existingClient.postMessage({
          type: 'NAVIGATE',
          url: url
        })
      }
    }
  } else {
    // Open new window
    await self.clients.openWindow(url)
  }
}

// Notification close event - track dismissals
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification Closed', event)
  
  const notification = event.notification
  const data = notification.data || {}
  
  // Track notification dismissal if needed
  if (data.trackDismissal && data.id) {
    event.waitUntil(
      fetch('/api/notifications/track-dismissal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: data.id,
          type: data.type,
          dismissedAt: Date.now()
        })
      }).catch(error => {
        console.error('Failed to track notification dismissal:', error)
      })
    )
  }
})

// Message event - handle messages from client
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background Sync', event.tag)
  
  switch (event.tag) {
    case 'game-completion':
      event.waitUntil(syncGameCompletions())
      break
    case 'achievement-unlock':
      event.waitUntil(syncAchievements())
      break
    case 'game-save':
      event.waitUntil(syncGameSaves())
      break
    default:
      console.log('Unknown sync tag:', event.tag)
  }
})

// Sync pending game completions
async function syncGameCompletions() {
  try {
    const pendingCompletions = await getPendingData('pendingGames')
    
    for (const completion of pendingCompletions) {
      try {
        const response = await fetch('/api/games', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${completion.token}`
          },
          body: JSON.stringify(completion.data)
        })
        
        if (response.ok) {
          await removePendingData('pendingGames', completion.id)
          console.log('Game completion synced successfully')
        }
      } catch (error) {
        console.error('Failed to sync game completion:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Sync pending achievements
async function syncAchievements() {
  try {
    const pendingAchievements = await getPendingData('pendingAchievements')
    
    for (const achievement of pendingAchievements) {
      try {
        const response = await fetch('/api/achievements/unlock', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${achievement.token}`
          },
          body: JSON.stringify(achievement.data)
        })
        
        if (response.ok) {
          await removePendingData('pendingAchievements', achievement.id)
          console.log('Achievement synced successfully')
        }
      } catch (error) {
        console.error('Failed to sync achievement:', error)
      }
    }
  } catch (error) {
    console.error('Achievement sync failed:', error)
  }
}

// Sync pending game saves
async function syncGameSaves() {
  try {
    const pendingSaves = await getPendingData('pendingSaves')
    
    for (const save of pendingSaves) {
      try {
        const response = await fetch('/api/games/save', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${save.token}`
          },
          body: JSON.stringify(save.data)
        })
        
        if (response.ok) {
          await removePendingData('pendingSaves', save.id)
          console.log('Game save synced successfully')
        }
      } catch (error) {
        console.error('Failed to sync game save:', error)
      }
    }
  } catch (error) {
    console.error('Game save sync failed:', error)
  }
}

// IndexedDB helpers for pending data
async function getPendingData(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NQueensOfflineDB', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const getAll = store.getAll()
      
      getAll.onsuccess = () => resolve(getAll.result)
      getAll.onerror = () => reject(getAll.error)
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' })
      }
    }
  })
}

async function removePendingData(storeName, id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('NQueensOfflineDB', 1)
    
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const deleteRequest = store.delete(id)
      
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    }
    
    request.onerror = () => reject(request.error)
  })
}

// Periodic background sync (if supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    console.log('Periodic sync:', event.tag)
    
    switch (event.tag) {
      case 'refresh-stats':
        event.waitUntil(refreshUserStats())
        break
      case 'check-daily-challenge':
        event.waitUntil(checkDailyChallenge())
        break
    }
  })
}

async function refreshUserStats() {
  const clients = await self.clients.matchAll()
  clients.forEach(client => {
    client.postMessage({
      type: 'REFRESH_STATS'
    })
  })
}

async function checkDailyChallenge() {
  try {
    const response = await fetch('/api/daily-challenge/current')
    const data = await response.json()
    
    if (data.challenge && !data.completedToday) {
      self.registration.showNotification('🎯 Daily Challenge Available!', {
        body: 'A new N-Queens challenge awaits you!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'daily-challenge',
        data: {
          type: 'daily-challenge',
          url: '/daily-challenge'
        }
      })
    }
  } catch (error) {
    console.error('Failed to check daily challenge:', error)
  }
}