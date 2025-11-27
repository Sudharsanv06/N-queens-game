import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FiSearch, FiFilter, FiGrid, FiClock, FiStar, FiHeart, FiPlay, FiUser, FiEye } from 'react-icons/fi'
import './Puzzles.css'

const PuzzleLibrary = () => {
  const [puzzles, setPuzzles] = useState([])
  const [filteredPuzzles, setFilteredPuzzles] = useState([])
  const [collections, setCollections] = useState([])
  const [activeTab, setActiveTab] = useState('browse')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    boardSize: '',
    category: '',
    tags: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [showFilters, setShowFilters] = useState(false)

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

  const loadPuzzles = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty)
      if (filters.boardSize) queryParams.append('boardSize', filters.boardSize)
      if (filters.category) queryParams.append('category', filters.category)
      if (filters.tags) queryParams.append('tags', filters.tags)
      queryParams.append('sortBy', filters.sortBy)
      queryParams.append('sortOrder', filters.sortOrder)
      queryParams.append('limit', '50')
      
      const response = await apiCall(`/api/puzzles?${queryParams}`)
      if (response.success) {
        setPuzzles(response.puzzles)
        applySearch(response.puzzles, filters.search)
      }
    } catch (error) {
      setError('Failed to load puzzles')
    } finally {
      setLoading(false)
    }
  }

  const loadCollections = async () => {
    try {
      const response = await apiCall('/api/puzzles/collections')
      if (response.success) {
        setCollections(response.collections)
      }
    } catch (error) {
      setError('Failed to load collections')
    }
  }

  const applySearch = (puzzleList, searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredPuzzles(puzzleList)
      return
    }

    const filtered = puzzleList.filter(puzzle => 
      puzzle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      puzzle.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      puzzle.creator.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      puzzle.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    
    setFilteredPuzzles(filtered)
  }

  const likePuzzle = async (puzzleId) => {
    try {
      const response = await apiCall(`/api/puzzles/${puzzleId}/like`, {
        method: 'POST'
      })
      
      if (response.success) {
        const updatePuzzle = (puzzle) => puzzle._id === puzzleId 
          ? { ...puzzle, isLiked: response.liked, likes: response.likeCount }
          : puzzle

        setPuzzles(prev => prev.map(updatePuzzle))
        setFilteredPuzzles(prev => prev.map(updatePuzzle))
      }
    } catch (error) {
      setError('Failed to like puzzle')
    }
  }

  const ratePuzzle = async (puzzleId, rating) => {
    try {
      const response = await apiCall(`/api/puzzles/${puzzleId}/rate`, {
        method: 'POST',
        body: JSON.stringify({ rating })
      })
      
      if (response.success) {
        setSuccess('Rating submitted!')
        loadPuzzles() // Reload to get updated ratings
      }
    } catch (error) {
      setError('Failed to rate puzzle')
    }
  }

  const startPuzzle = async (puzzleId) => {
    try {
      const response = await apiCall(`/api/puzzles/${puzzleId}/start`, {
        method: 'POST'
      })
      
      if (response.success) {
        // Store puzzle data and navigate to game
        localStorage.setItem('customPuzzle', JSON.stringify(response.puzzle))
        window.location.href = `/game?puzzle=${puzzleId}`
      }
    } catch (error) {
      setError('Failed to start puzzle')
    }
  }

  useEffect(() => {
    loadPuzzles()
    if (activeTab === 'collections') {
      loadCollections()
    }
  }, [filters.difficulty, filters.boardSize, filters.category, filters.tags, filters.sortBy, filters.sortOrder])

  useEffect(() => {
    applySearch(puzzles, filters.search)
  }, [filters.search, puzzles])

  useEffect(() => {
    if (activeTab === 'collections') {
      loadCollections()
    }
  }, [activeTab])

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('')
        setSuccess('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const renderFilters = () => (
    <div className={`puzzle-filters ${showFilters ? 'expanded' : ''}`}>
      <div className="filter-row">
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
          <label>Category:</label>
          <select 
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            <option value="classic">Classic</option>
            <option value="variant">Variant</option>
            <option value="challenge">Challenge</option>
            <option value="educational">Educational</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select 
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          >
            <option value="createdAt">Newest</option>
            <option value="rating">Rating</option>
            <option value="likes">Likes</option>
            <option value="views">Views</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group full-width">
          <label>Tags:</label>
          <input
            type="text"
            placeholder="Search by tags (comma separated)..."
            value={filters.tags}
            onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
          />
        </div>
      </div>
    </div>
  )

  const renderPuzzleCard = (puzzle) => (
    <div key={puzzle._id} className="puzzle-library-card">
      <div className="puzzle-card-header">
        <div className="puzzle-title-section">
          <h4>{puzzle.title}</h4>
          <div className="puzzle-meta">
            <span className="creator">
              <FiUser /> {puzzle.creator.username}
            </span>
            <span className="created-date">
              {new Date(puzzle.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="puzzle-difficulty">
          <span className={`difficulty-badge ${puzzle.difficulty}`}>
            {puzzle.difficulty.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="puzzle-card-content">
        <div className="puzzle-info-grid">
          <div className="info-item">
            <FiGrid className="info-icon" />
            <span>{puzzle.boardSize}×{puzzle.boardSize}</span>
          </div>
          <div className="info-item">
            <FiEye className="info-icon" />
            <span>{puzzle.views || 0} views</span>
          </div>
          <div className="info-item">
            <FiStar className="info-icon" />
            <span>{puzzle.rating?.average?.toFixed(1) || 'No rating'}</span>
          </div>
          {puzzle.timeLimit > 0 && (
            <div className="info-item">
              <FiClock className="info-icon" />
              <span>{Math.floor(puzzle.timeLimit / 60)}:{(puzzle.timeLimit % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
        </div>

        {puzzle.description && (
          <p className="puzzle-description">{puzzle.description}</p>
        )}

        {puzzle.tags && puzzle.tags.length > 0 && (
          <div className="puzzle-tags">
            {puzzle.tags.slice(0, 4).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
            {puzzle.tags.length > 4 && <span className="tag">+{puzzle.tags.length - 4}</span>}
          </div>
        )}
      </div>

      <div className="puzzle-card-actions">
        <button 
          onClick={() => startPuzzle(puzzle._id)}
          className="btn-play-puzzle"
        >
          <FiPlay /> Play Puzzle
        </button>
        
        <div className="puzzle-social-actions">
          <button 
            onClick={() => likePuzzle(puzzle._id)}
            className={`btn-like-puzzle ${puzzle.isLiked ? 'liked' : ''}`}
          >
            <FiHeart /> {puzzle.likes || 0}
          </button>
          
          <div className="rating-section">
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => ratePuzzle(puzzle._id, star)}
                  className={`star ${puzzle.userRating >= star ? 'filled' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCollectionCard = (collection) => (
    <div key={collection._id} className="collection-card">
      <div className="collection-header">
        <h4>{collection.name}</h4>
        <span className="puzzle-count">{collection.puzzles.length} puzzles</span>
      </div>
      
      <p className="collection-description">{collection.description}</p>
      
      <div className="collection-info">
        <span className="creator">By {collection.creator.username}</span>
        <span className={`difficulty ${collection.difficulty}`}>
          {collection.difficulty.toUpperCase()}
        </span>
      </div>
      
      <div className="collection-actions">
        <button className="btn-view-collection">
          <FiGrid /> View Collection
        </button>
      </div>
    </div>
  )

  const renderBrowse = () => (
    <div className="puzzle-browse-section">
      <div className="browse-header">
        <div className="search-section">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search puzzles by title, creator, or tags..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
          >
            <FiFilter /> Filters
          </button>
        </div>
      </div>

      {renderFilters()}

      <div className="browse-results">
        <div className="results-header">
          <span className="results-count">
            {filteredPuzzles.length} puzzle{filteredPuzzles.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {loading && (
          <div className="loading-section">
            <div className="loading-spinner">Loading puzzles...</div>
          </div>
        )}

        <div className="puzzles-grid">
          {filteredPuzzles.length === 0 && !loading ? (
            <div className="empty-state">
              <FiGrid className="empty-icon" />
              <p>No puzzles found matching your criteria.</p>
            </div>
          ) : (
            filteredPuzzles.map(renderPuzzleCard)
          )}
        </div>
      </div>
    </div>
  )

  const renderCollections = () => (
    <div className="collections-section">
      <div className="collections-header">
        <h3>Puzzle Collections</h3>
        <p>Curated sets of puzzles organized by theme or difficulty</p>
      </div>

      {loading ? (
        <div className="loading-section">
          <div className="loading-spinner">Loading collections...</div>
        </div>
      ) : (
        <div className="collections-grid">
          {collections.length === 0 ? (
            <div className="empty-state">
              <FiGrid className="empty-icon" />
              <p>No collections available yet.</p>
            </div>
          ) : (
            collections.map(renderCollectionCard)
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="puzzle-library-container">
      <div className="library-header">
        <h2>Puzzle Library</h2>
        <div className="library-tabs">
          <button 
            className={activeTab === 'browse' ? 'active' : ''}
            onClick={() => setActiveTab('browse')}
          >
            Browse Puzzles ({puzzles.length})
          </button>
          <button 
            className={activeTab === 'collections' ? 'active' : ''}
            onClick={() => setActiveTab('collections')}
          >
            Collections ({collections.length})
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="library-content">
        {activeTab === 'browse' && renderBrowse()}
        {activeTab === 'collections' && renderCollections()}
      </div>
    </div>
  )
}

export default PuzzleLibrary