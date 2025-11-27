// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  // Skip waiting and immediately activate
  self.skipWaiting()
  
  event.waitUntil(
    caches.open('nqueens-v1').then((cache) => {
      console.log('Service Worker: Caching Files')
      return cache.addAll([
        '/',
        '/index.html',
        '/static/js/bundle.js',
        '/static/css/main.css',
        '/icon-192x192.png',
        '/icon-512x512.png',
        '/badge-72x72.png'
      ]).catch(err => {
        console.warn('Service Worker: Some files failed to cache:', err)
        // Don't fail the installation if caching fails
        return Promise.resolve()
      })
    })
  )
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim())
})

// Handle push notifications
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
        icon: '/icon-192x192.png'
      }
    }
  }
  
  const options = {
    title: data.title || 'N-Queens Game',
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    image: data.image,
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    tag: data.tag || 'nqueens-notification',
    renotify: data.renotify || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: Date.now()
  }
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification Click Received', event)
  
  const notification = event.notification
  const data = notification.data || {}
  const action = event.action
  
  notification.close()
  
  event.waitUntil(
    handleNotificationClick(action, data)
  )
})

async function handleNotificationClick(action, data) {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  })
  
  let url = '/'
  
  // Determine URL based on notification type and action
  if (data.type === 'daily-challenge') {
    if (action === 'play') {
      url = '/daily-challenge'
    } else if (action === 'dismiss') {
      return // Just close notification
    } else {
      url = '/daily-challenge'
    }
  } else if (data.type === 'game-invite') {
    if (action === 'accept') {
      url = `/multiplayer?accept=${data.inviteId || ''}`
    } else if (action === 'decline') {
      // Send decline response to server
      try {
        await fetch('/api/multiplayer/decline-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteId: data.inviteId })
        })
      } catch (error) {
        console.error('Failed to decline invite:', error)
      }
      return
    } else {
      url = '/multiplayer'
    }
  } else if (data.type === 'achievement') {
    if (action === 'view') {
      url = '/profile?tab=achievements'
    } else {
      url = '/profile'
    }
  } else if (data.url) {
    url = data.url
  }
  
  // Focus existing window or open new one
  let targetClient = null
  
  for (const client of clients) {
    if (client.url.includes(self.location.origin)) {
      targetClient = client
      break
    }
  }
  
  if (targetClient) {
    // Focus existing window and navigate
    await targetClient.focus()
    if (targetClient.navigate) {
      await targetClient.navigate(url)
    } else {
      // Fallback: send message to client to navigate
      targetClient.postMessage({
        type: 'NAVIGATE',
        url: url
      })
    }
  } else {
    // Open new window
    await self.clients.openWindow(url)
  }
}

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification Closed', event)
  
  const notification = event.notification
  const data = notification.data || {}
  
  // Track notification dismissal if needed
  if (data.trackDismissal) {
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

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background Sync', event)
  
  if (event.tag === 'game-completion') {
    event.waitUntil(syncGameCompletions())
  } else if (event.tag === 'achievement-unlock') {
    event.waitUntil(syncAchievements())
  }
})

async function syncGameCompletions() {
  try {
    // Get pending game completions from IndexedDB
    const pendingCompletions = await getPendingCompletions()
    
    for (const completion of pendingCompletions) {
      try {
        await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(completion)
        })
        
        // Remove from pending after successful sync
        await removePendingCompletion(completion.id)
      } catch (error) {
        console.error('Failed to sync game completion:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

async function syncAchievements() {
  try {
    // Get pending achievements from IndexedDB
    const pendingAchievements = await getPendingAchievements()
    
    for (const achievement of pendingAchievements) {
      try {
        await fetch('/api/achievements/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(achievement)
        })
        
        // Remove from pending after successful sync
        await removePendingAchievement(achievement.id)
      } catch (error) {
        console.error('Failed to sync achievement:', error)
      }
    }
  } catch (error) {
    console.error('Achievement sync failed:', error)
  }
}

// IndexedDB helpers (placeholder - implement as needed)
async function getPendingCompletions() {
  // Implementation for getting pending completions from IndexedDB
  return []
}

async function removePendingCompletion(id) {
  // Implementation for removing completion from IndexedDB
}

async function getPendingAchievements() {
  // Implementation for getting pending achievements from IndexedDB
  return []
}

async function removePendingAchievement(id) {
  // Implementation for removing achievement from IndexedDB
}

// Handle fetch events for offline functionality
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for navigation and critical resources
  if (event.request.method !== 'GET') {
    return
  }
  
  // Skip non-HTTP(S) requests
  if (!event.request.url.startsWith('http')) {
    return
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).catch(() => {
        // If offline and no cache, return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html')
        }
      })
    })
  )
})

// Send message to all clients
async function sendMessageToClients(message) {
  const clients = await self.clients.matchAll()
  clients.forEach(client => {
    client.postMessage(message)
  })
}