import { useEffect, useCallback } from 'react'

const defaultShortcuts = {
  'new_game': ['n', 'N'],
  'reset': ['r', 'R'],
  'undo': ['z', 'Z'],
  'hint': ['h', 'H'],
  'pause': ['p', 'P'],
  'fullscreen': ['f', 'F'],
  'leaderboard': ['l', 'L'],
  'settings': ['s', 'S'],
  'home': ['escape']
}

function useKeyboardShortcuts(handlers, enabled = true) {
  const handleKeyPress = useCallback((event) => {
    if (!enabled) return
    
    // Don't trigger when typing in input fields
    const target = event.target
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }
    
    const key = event.key.toLowerCase()
    
    // Check each shortcut
    for (const [action, keys] of Object.entries(defaultShortcuts)) {
      if (keys.map(k => k.toLowerCase()).includes(key)) {
        event.preventDefault()
        
        if (handlers[action]) {
          handlers[action](event)
        }
        break
      }
    }
    
    // Arrow keys for board navigation (if board exists)
    if (handlers.onArrowKey && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      event.preventDefault()
      handlers.onArrowKey(key)
    }
    
    // Number keys for board size (1-9)
    if (handlers.onNumberKey && /^[1-9]$/.test(key)) {
      event.preventDefault()
      handlers.onNumberKey(parseInt(key))
    }
  }, [enabled, handlers])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  return {
    shortcuts: defaultShortcuts
  }
}

export default useKeyboardShortcuts