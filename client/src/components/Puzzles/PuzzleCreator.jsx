import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FiPlus, FiSave, FiEye, FiEdit3, FiTrash2, FiShare2, FiGrid, FiClock, FiStar } from 'react-icons/fi'
import './Puzzles.css'

const PuzzleCreator = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [myPuzzles, setMyPuzzles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Puzzle creation state
  const [puzzle, setPuzzle] = useState({
    title: '',
    description: '',
    boardSize: 8,
    difficulty: 'medium',
    category: 'classic',
    tags: [],
    initialQueens: [],
    solution: [],
    hints: [],
    timeLimit: 0
  })

  const [board, setBoard] = useState([])
  const [mode, setMode] = useState('queens') // 'queens' or 'solution'
  const [newTag, setNewTag] = useState('')
  const [editingPuzzle, setEditingPuzzle] = useState(null)

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

  const initializeBoard = (size) => {
    const newBoard = Array(size).fill(null).map(() => Array(size).fill(null))
    setBoard(newBoard)
    setPuzzle(prev => ({ 
      ...prev, 
      boardSize: size, 
      initialQueens: [], 
      solution: [] 
    }))
  }

  const toggleCell = (row, col) => {
    const newBoard = [...board]
    const cellKey = `${row}-${col}`
    
    if (mode === 'queens') {
      // Toggle initial queen placement
      const isQueen = newBoard[row][col] === 'queen'
      newBoard[row][col] = isQueen ? null : 'queen'
      
      const newQueens = puzzle.initialQueens.filter(q => `${q.row}-${q.col}` !== cellKey)
      if (!isQueen) {
        newQueens.push({ row, col })
      }
      
      setPuzzle(prev => ({ ...prev, initialQueens: newQueens }))
    } else {
      // Toggle solution queen placement
      const isQueen = newBoard[row][col] === 'solution' || newBoard[row][col] === 'queen'
      newBoard[row][col] = isQueen ? null : 'solution'
      
      const newSolution = puzzle.solution.filter(q => `${q.row}-${q.col}` !== cellKey)
      if (!isQueen) {
        newSolution.push({ row, col })
      }
      
      setPuzzle(prev => ({ ...prev, solution: newSolution }))
    }
    
    setBoard(newBoard)
  }

  const addTag = () => {
    if (newTag.trim() && !puzzle.tags.includes(newTag.trim())) {
      setPuzzle(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag) => {
    setPuzzle(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const validatePuzzle = () => {
    if (!puzzle.title.trim()) {
      throw new Error('Puzzle title is required')
    }
    
    if (puzzle.solution.length !== puzzle.boardSize) {
      throw new Error(`Solution must have exactly ${puzzle.boardSize} queens`)
    }
    
    // Check if solution is valid (no conflicts)
    const positions = puzzle.solution
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const pos1 = positions[i]
        const pos2 = positions[j]
        
        // Same row or column
        if (pos1.row === pos2.row || pos1.col === pos2.col) {
          throw new Error('Solution has conflicting queens in the same row or column')
        }
        
        // Same diagonal
        if (Math.abs(pos1.row - pos2.row) === Math.abs(pos1.col - pos2.col)) {
          throw new Error('Solution has conflicting queens on the same diagonal')
        }
      }
    }
    
    return true
  }

  const savePuzzle = async () => {
    try {
      validatePuzzle()
      setLoading(true)
      
      const puzzleData = {
        ...puzzle,
        isPublic: false // Save as draft initially
      }
      
      let response
      if (editingPuzzle) {
        response = await apiCall(`/api/puzzles/${editingPuzzle._id}`, {
          method: 'PUT',
          body: JSON.stringify(puzzleData)
        })
      } else {
        response = await apiCall('/api/puzzles', {
          method: 'POST',
          body: JSON.stringify(puzzleData)
        })
      }
      
      if (response.success) {
        setSuccess(editingPuzzle ? 'Puzzle updated successfully!' : 'Puzzle saved as draft!')
        loadMyPuzzles()
        resetForm()
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const publishPuzzle = async (puzzleId) => {
    try {
      setLoading(true)
      const response = await apiCall(`/api/puzzles/${puzzleId}/publish`, {
        method: 'POST'
      })
      
      if (response.success) {
        setSuccess('Puzzle published successfully!')
        loadMyPuzzles()
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const deletePuzzle = async (puzzleId) => {
    if (!confirm('Are you sure you want to delete this puzzle?')) return
    
    try {
      setLoading(true)
      const response = await apiCall(`/api/puzzles/${puzzleId}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        setSuccess('Puzzle deleted successfully!')
        loadMyPuzzles()
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const editPuzzle = (puzzleToEdit) => {
    setEditingPuzzle(puzzleToEdit)
    setPuzzle({
      title: puzzleToEdit.title,
      description: puzzleToEdit.description,
      boardSize: puzzleToEdit.boardSize,
      difficulty: puzzleToEdit.difficulty,
      category: puzzleToEdit.category,
      tags: puzzleToEdit.tags || [],
      initialQueens: puzzleToEdit.initialQueens || [],
      solution: puzzleToEdit.solution || [],
      hints: puzzleToEdit.hints || [],
      timeLimit: puzzleToEdit.timeLimit || 0
    })
    
    // Rebuild board
    const newBoard = Array(puzzleToEdit.boardSize).fill(null).map(() => Array(puzzleToEdit.boardSize).fill(null))
    puzzleToEdit.initialQueens?.forEach(({ row, col }) => {
      newBoard[row][col] = 'queen'
    })
    puzzleToEdit.solution?.forEach(({ row, col }) => {
      if (newBoard[row][col] !== 'queen') {
        newBoard[row][col] = 'solution'
      }
    })
    setBoard(newBoard)
    setActiveTab('create')
  }

  const resetForm = () => {
    setEditingPuzzle(null)
    setPuzzle({
      title: '',
      description: '',
      boardSize: 8,
      difficulty: 'medium',
      category: 'classic',
      tags: [],
      initialQueens: [],
      solution: [],
      hints: [],
      timeLimit: 0
    })
    initializeBoard(8)
  }

  const loadMyPuzzles = async () => {
    try {
      setLoading(true)
      const response = await apiCall('/api/puzzles/my')
      if (response.success) {
        setMyPuzzles(response.puzzles)
      }
    } catch (error) {
      setError('Failed to load puzzles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    initializeBoard(puzzle.boardSize)
  }, [])

  useEffect(() => {
    if (activeTab === 'my') {
      loadMyPuzzles()
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

  const renderBoard = () => (
    <div className="puzzle-board-container">
      <div className="board-controls">
        <div className="mode-selector">
          <button 
            className={mode === 'queens' ? 'active' : ''}
            onClick={() => setMode('queens')}
          >
            Initial Queens
          </button>
          <button 
            className={mode === 'solution' ? 'active' : ''}
            onClick={() => setMode('solution')}
          >
            Solution
          </button>
        </div>
        <div className="board-info">
          <span>Mode: {mode === 'queens' ? 'Place starting queens' : 'Place solution queens'}</span>
        </div>
      </div>
      
      <div 
        className="puzzle-board"
        style={{ 
          gridTemplateColumns: `repeat(${puzzle.boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${puzzle.boardSize}, 1fr)`
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`board-cell ${(rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark'} ${
                cell === 'queen' ? 'has-queen' : ''
              } ${cell === 'solution' ? 'has-solution' : ''}`}
              onClick={() => toggleCell(rowIndex, colIndex)}
            >
              {(cell === 'queen' || cell === 'solution') && '♛'}
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderCreateForm = () => (
    <div className="puzzle-creator-form">
      <div className="form-section">
        <h3>{editingPuzzle ? 'Edit Puzzle' : 'Create New Puzzle'}</h3>
        
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={puzzle.title}
            onChange={(e) => setPuzzle(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter puzzle title..."
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={puzzle.description}
            onChange={(e) => setPuzzle(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your puzzle..."
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Board Size</label>
            <select
              value={puzzle.boardSize}
              onChange={(e) => {
                const size = parseInt(e.target.value)
                setPuzzle(prev => ({ ...prev, boardSize: size }))
                initializeBoard(size)
              }}
            >
              {[4, 5, 6, 7, 8, 9, 10].map(size => (
                <option key={size} value={size}>{size}×{size}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <select
              value={puzzle.difficulty}
              onChange={(e) => setPuzzle(prev => ({ ...prev, difficulty: e.target.value }))}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={puzzle.category}
              onChange={(e) => setPuzzle(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="classic">Classic</option>
              <option value="variant">Variant</option>
              <option value="challenge">Challenge</option>
              <option value="educational">Educational</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Time Limit (seconds, 0 = unlimited)</label>
          <input
            type="number"
            min="0"
            value={puzzle.timeLimit}
            onChange={(e) => setPuzzle(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="form-group">
          <label>Tags</label>
          <div className="tags-input">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add tag..."
            />
            <button type="button" onClick={addTag}>
              <FiPlus />
            </button>
          </div>
          <div className="tags-list">
            {puzzle.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button onClick={() => removeTag(tag)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="puzzle-stats">
          <div className="stat">
            <span>Initial Queens: {puzzle.initialQueens.length}</span>
          </div>
          <div className="stat">
            <span>Solution Queens: {puzzle.solution.length}/{puzzle.boardSize}</span>
          </div>
        </div>

        <div className="form-actions">
          <button 
            onClick={savePuzzle}
            disabled={loading}
            className="btn-save"
          >
            <FiSave /> {editingPuzzle ? 'Update' : 'Save'} Draft
          </button>
          {editingPuzzle && (
            <button onClick={resetForm} className="btn-cancel">
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {renderBoard()}
    </div>
  )

  const renderMyPuzzles = () => (
    <div className="my-puzzles-list">
      {myPuzzles.length === 0 ? (
        <div className="empty-state">
          <FiGrid className="empty-icon" />
          <p>No puzzles created yet. Start by creating your first puzzle!</p>
        </div>
      ) : (
        <div className="puzzles-grid">
          {myPuzzles.map(puzzle => (
            <div key={puzzle._id} className="puzzle-card">
              <div className="puzzle-header">
                <h4>{puzzle.title}</h4>
                <div className="puzzle-status">
                  <span className={`status ${puzzle.isPublic ? 'published' : 'draft'}`}>
                    {puzzle.isPublic ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>

              <div className="puzzle-info">
                <div className="info-row">
                  <span><FiGrid /> {puzzle.boardSize}×{puzzle.boardSize}</span>
                  <span className={`difficulty ${puzzle.difficulty}`}>
                    {puzzle.difficulty.toUpperCase()}
                  </span>
                </div>
                
                {puzzle.description && (
                  <p className="puzzle-description">{puzzle.description}</p>
                )}

                <div className="puzzle-stats">
                  {puzzle.isPublic && (
                    <>
                      <span><FiEye /> {puzzle.views || 0} views</span>
                      <span><FiStar /> {puzzle.rating?.average?.toFixed(1) || 'No rating'}</span>
                    </>
                  )}
                  <span><FiClock /> Created {new Date(puzzle.createdAt).toLocaleDateString()}</span>
                </div>

                {puzzle.tags && puzzle.tags.length > 0 && (
                  <div className="puzzle-tags">
                    {puzzle.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {puzzle.tags.length > 3 && <span className="tag">+{puzzle.tags.length - 3}</span>}
                  </div>
                )}
              </div>

              <div className="puzzle-actions">
                <button 
                  onClick={() => editPuzzle(puzzle)}
                  className="btn-edit"
                >
                  <FiEdit3 /> Edit
                </button>
                
                {!puzzle.isPublic && (
                  <button 
                    onClick={() => publishPuzzle(puzzle._id)}
                    className="btn-publish"
                    disabled={loading}
                  >
                    <FiShare2 /> Publish
                  </button>
                )}
                
                <button 
                  onClick={() => deletePuzzle(puzzle._id)}
                  className="btn-delete"
                  disabled={loading}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="puzzle-creator-container">
      <div className="creator-header">
        <h2>Puzzle Creator</h2>
        <div className="creator-tabs">
          <button 
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
          >
            {editingPuzzle ? 'Edit Puzzle' : 'Create New'}
          </button>
          <button 
            className={activeTab === 'my' ? 'active' : ''}
            onClick={() => setActiveTab('my')}
          >
            My Puzzles ({myPuzzles.length})
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="creator-content">
        {loading && <div className="loading-overlay">
          <div className="loading-spinner">Processing...</div>
        </div>}
        
        {activeTab === 'create' && renderCreateForm()}
        {activeTab === 'my' && renderMyPuzzles()}
      </div>
    </div>
  )
}

export default PuzzleCreator