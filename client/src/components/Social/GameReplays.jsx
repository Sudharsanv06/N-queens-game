import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FiPlay, FiHeart, FiShare2, FiEye, FiClock, FiTrophy, FiFilter } from 'react-icons/fi'
import './Social.css'

const GameReplays = () => {
  const [replays, setReplays] = useState([])
  const [myReplays, setMyReplays] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    boardSize: '',
    difficulty: '',
    sortBy: 'createdAt'
  })

  const { token } = useSelector(state => state.auth)

  const apiCall = async (url, options = {}) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    })
    
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }
    return data
  }

  const loadReplays = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      
      if (filters.boardSize) queryParams.append('boardSize', filters.boardSize)
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty)
      queryParams.append('sortBy', filters.sortBy)
      
      const response = await apiCall(`/api/social/replays?${queryParams}`)
      if (response.success) {
        setReplays(response.replays)
      }
    } catch (error) {
      setError('Failed to load replays')
    } finally {
      setLoading(false)
    }
  }

  const loadMyReplays = async () => {
    try {
      const response = await apiCall('/api/social/replays/my')
      if (response.success) {
        setMyReplays(response.replays)
      }
    } catch (error) {
      setError('Failed to load your replays')
    }
  }

  const likeReplay = async (replayId) => {
    try {
      const response = await apiCall(`/api/social/replays/${replayId}/like`, {
        method: 'POST'
      })
      
      if (response.success) {
        // Update both replays lists
        setReplays(prev => prev.map(replay => 
          replay._id === replayId 
            ? { ...replay, likes: response.likes, isLiked: response.isLiked }
            : replay
        ))
        setMyReplays(prev => prev.map(replay => 
          replay._id === replayId 
            ? { ...replay, likes: response.likes, isLiked: response.isLiked }
            : replay
        ))
      }
    } catch (error) {
      setError('Failed to like replay')
    }
  }

  const shareReplay = async (replayId) => {
    try {
      const response = await apiCall(`/api/social/replays/${replayId}/share`, {
        method: 'POST'
      })
      
      if (response.success) {
        // Update share count
        setReplays(prev => prev.map(replay => 
          replay._id === replayId 
            ? { ...replay, shares: response.shares }
            : replay
        ))
        setMyReplays(prev => prev.map(replay => 
          replay._id === replayId 
            ? { ...replay, shares: response.shares }
            : replay
        ))
        
        // Copy share link to clipboard
        const shareUrl = `${window.location.origin}/replay/${replayId}`
        await navigator.clipboard.writeText(shareUrl)
        
        // Show success message
        const message = document.createElement('div')
        message.className = 'share-success'
        message.textContent = 'Share link copied to clipboard!'
        document.body.appendChild(message)
        setTimeout(() => document.body.removeChild(message), 3000)
      }
    } catch (error) {
      setError('Failed to share replay')
    }
  }

  const playReplay = (replay) => {
    // Store replay data and navigate to game page in replay mode
    localStorage.setItem('replayData', JSON.stringify(replay))
    window.location.href = `/game?replay=${replay._id}`
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    loadReplays()
    loadMyReplays()
  }, [filters])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const renderReplayCard = (replay) => (
    <div key={replay._id} className="replay-card">
      <div className="replay-header">
        <div className="player-info">
          <div className="player-avatar">
            {replay.player.username.charAt(0).toUpperCase()}
          </div>
          <div className="player-details">
            <h4>{replay.player.username}</h4>
            <p className="replay-date">
              {new Date(replay.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="replay-difficulty">
          <span className={`difficulty-badge ${replay.gameData.difficulty || 'medium'}`}>
            {(replay.gameData.difficulty || 'medium').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="replay-details">
        <div className="game-info">
          <div className="info-item">
            <FiTrophy className="info-icon" />
            <span>{replay.gameData.boardSize}×{replay.gameData.boardSize} Board</span>
          </div>
          <div className="info-item">
            <FiClock className="info-icon" />
            <span>{formatTime(replay.gameData.timeElapsed)}</span>
          </div>
          <div className="info-item">
            <span>Score: {replay.gameData.score}</span>
          </div>
          {replay.gameData.moves && (
            <div className="info-item">
              <span>{replay.gameData.moves} moves</span>
            </div>
          )}
        </div>

        {replay.title && (
          <div className="replay-title">
            <h5>{replay.title}</h5>
          </div>
        )}

        {replay.description && (
          <div className="replay-description">
            <p>{replay.description}</p>
          </div>
        )}
      </div>

      <div className="replay-actions">
        <button 
          onClick={() => playReplay(replay)}
          className="btn-play"
        >
          <FiPlay /> Watch Replay
        </button>
        
        <div className="social-actions">
          <button 
            onClick={() => likeReplay(replay._id)}
            className={`btn-like ${replay.isLiked ? 'liked' : ''}`}
          >
            <FiHeart /> {replay.likes}
          </button>
          
          <button 
            onClick={() => shareReplay(replay._id)}
            className="btn-share"
          >
            <FiShare2 /> {replay.shares}
          </button>
          
          <div className="view-count">
            <FiEye /> {replay.views}
          </div>
        </div>
      </div>
    </div>
  )

  const renderFilters = () => (
    <div className="replay-filters">
      <div className="filter-group">
        <label>Board Size:</label>
        <select 
          value={filters.boardSize}
          onChange={(e) => setFilters(prev => ({ ...prev, boardSize: e.target.value }))}
        >
          <option value="">All Sizes</option>
          <option value="4">4×4</option>
          <option value="5">5×5</option>
          <option value="6">6×6</option>
          <option value="7">7×7</option>
          <option value="8">8×8</option>
          <option value="9">9×9</option>
          <option value="10">10×10</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Difficulty:</label>
        <select 
          value={filters.difficulty}
          onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Sort By:</label>
        <select 
          value={filters.sortBy}
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
        >
          <option value="createdAt">Newest</option>
          <option value="likes">Most Liked</option>
          <option value="views">Most Viewed</option>
          <option value="score">Highest Score</option>
        </select>
      </div>
    </div>
  )

  return (
    <div className="game-replays-container">
      <div className="replays-header">
        <h2>Game Replays</h2>
        <div className="replay-tabs">
          <button 
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            All Replays ({replays.length})
          </button>
          <button 
            className={activeTab === 'my' ? 'active' : ''}
            onClick={() => setActiveTab('my')}
          >
            My Replays ({myReplays.length})
          </button>
        </div>
      </div>

      {renderFilters()}

      {error && <div className="error-message">{error}</div>}

      <div className="replays-content">
        {loading && <div className="loading-spinner">Loading replays...</div>}
        
        {activeTab === 'all' && (
          <div className="replays-grid">
            {replays.length === 0 ? (
              <div className="empty-state">
                <FiPlay className="empty-icon" />
                <p>No replays found. Be the first to share a game!</p>
              </div>
            ) : (
              replays.map(renderReplayCard)
            )}
          </div>
        )}

        {activeTab === 'my' && (
          <div className="replays-grid">
            {myReplays.length === 0 ? (
              <div className="empty-state">
                <FiPlay className="empty-icon" />
                <p>You haven't shared any replays yet. Complete a game and save it to share!</p>
              </div>
            ) : (
              myReplays.map(renderReplayCard)
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GameReplays