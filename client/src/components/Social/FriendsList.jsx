import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FiUsers, FiUser, FiCheck, FiX, FiSearch, FiUserPlus } from 'react-icons/fi'
import './Social.css'

const FriendsList = () => {
  const [activeTab, setActiveTab] = useState('friends')
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  const loadFriends = async () => {
    try {
      setLoading(true)
      const response = await apiCall('/api/social/friends')
      if (response.success) {
        setFriends(response.friends)
      }
    } catch (error) {
      setError('Failed to load friends')
    } finally {
      setLoading(false)
    }
  }

  const loadPendingRequests = async () => {
    try {
      const response = await apiCall('/api/social/friends/pending')
      if (response.success) {
        setPendingRequests(response.requests)
      }
    } catch (error) {
      setError('Failed to load pending requests')
    }
  }

  const loadSentRequests = async () => {
    try {
      const response = await apiCall('/api/social/friends/sent')
      if (response.success) {
        setSentRequests(response.requests)
      }
    } catch (error) {
      setError('Failed to load sent requests')
    }
  }

  const sendFriendRequest = async (friendId) => {
    try {
      const response = await apiCall('/api/social/friends/request', {
        method: 'POST',
        body: JSON.stringify({ friendId })
      })
      
      if (response.success) {
        setSuccess('Friend request sent!')
        setSearchQuery('')
        setSearchResults([])
        loadSentRequests()
      }
    } catch (error) {
      setError(error.message)
    }
  }

  const respondToRequest = async (requestId, action) => {
    try {
      const response = await apiCall(`/api/social/friends/respond/${requestId}`, {
        method: 'POST',
        body: JSON.stringify({ action })
      })
      
      if (response.success) {
        setSuccess(`Friend request ${action}ed!`)
        loadPendingRequests()
        if (action === 'accept') {
          loadFriends()
        }
      }
    } catch (error) {
      setError(error.message)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) return
    
    try {
      setLoading(true)
      const response = await apiCall(`/api/social/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.success) {
        setSearchResults(response.users)
      }
    } catch (error) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFriends()
    loadPendingRequests()
    loadSentRequests()
  }, [])

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('')
        setSuccess('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  const renderFriends = () => (
    <div className="friends-list">
      {friends.length === 0 ? (
        <div className="empty-state">
          <FiUsers className="empty-icon" />
          <p>No friends yet. Add some friends to get started!</p>
        </div>
      ) : (
        friends.map(friend => (
          <div key={friend._id} className="friend-card">
            <div className="friend-info">
              <div className="friend-avatar">
                {friend.username.charAt(0).toUpperCase()}
              </div>
              <div className="friend-details">
                <h4>{friend.username}</h4>
                <p>Level {friend.level || 1} • {friend.totalScore || 0} points</p>
              </div>
            </div>
            <div className="friend-stats">
              <span className={`status ${friend.isOnline ? 'online' : 'offline'}`}>
                {friend.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderPendingRequests = () => (
    <div className="requests-list">
      {pendingRequests.length === 0 ? (
        <div className="empty-state">
          <FiUser className="empty-icon" />
          <p>No pending friend requests</p>
        </div>
      ) : (
        pendingRequests.map(request => (
          <div key={request._id} className="request-card">
            <div className="friend-info">
              <div className="friend-avatar">
                {request.from.username.charAt(0).toUpperCase()}
              </div>
              <div className="friend-details">
                <h4>{request.from.username}</h4>
                <p>Wants to be your friend</p>
              </div>
            </div>
            <div className="request-actions">
              <button 
                onClick={() => respondToRequest(request._id, 'accept')}
                className="btn-accept"
              >
                <FiCheck />
              </button>
              <button 
                onClick={() => respondToRequest(request._id, 'reject')}
                className="btn-reject"
              >
                <FiX />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderSentRequests = () => (
    <div className="requests-list">
      {sentRequests.length === 0 ? (
        <div className="empty-state">
          <FiUserPlus className="empty-icon" />
          <p>No sent requests</p>
        </div>
      ) : (
        sentRequests.map(request => (
          <div key={request._id} className="request-card">
            <div className="friend-info">
              <div className="friend-avatar">
                {request.to.username.charAt(0).toUpperCase()}
              </div>
              <div className="friend-details">
                <h4>{request.to.username}</h4>
                <p>Request sent</p>
              </div>
            </div>
            <div className="request-status">
              <span className="status pending">Pending</span>
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderSearch = () => (
    <div className="search-section">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
        />
        <button onClick={searchUsers} disabled={loading}>
          <FiSearch />
        </button>
      </div>
      
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map(user => (
            <div key={user._id} className="user-result">
              <div className="friend-info">
                <div className="friend-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="friend-details">
                  <h4>{user.username}</h4>
                  <p>Level {user.level || 1}</p>
                </div>
              </div>
              <button 
                onClick={() => sendFriendRequest(user._id)}
                className="btn-add-friend"
                disabled={user.isFriend || user.requestSent}
              >
                {user.isFriend ? 'Friends' : user.requestSent ? 'Sent' : 'Add Friend'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="friends-list-container">
      <div className="social-header">
        <h2>Friends & Social</h2>
        <div className="social-tabs">
          <button 
            className={activeTab === 'friends' ? 'active' : ''}
            onClick={() => setActiveTab('friends')}
          >
            Friends ({friends.length})
          </button>
          <button 
            className={activeTab === 'pending' ? 'active' : ''}
            onClick={() => setActiveTab('pending')}
          >
            Requests ({pendingRequests.length})
          </button>
          <button 
            className={activeTab === 'sent' ? 'active' : ''}
            onClick={() => setActiveTab('sent')}
          >
            Sent ({sentRequests.length})
          </button>
          <button 
            className={activeTab === 'search' ? 'active' : ''}
            onClick={() => setActiveTab('search')}
          >
            Add Friends
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="social-content">
        {loading && <div className="loading-spinner">Loading...</div>}
        
        {activeTab === 'friends' && renderFriends()}
        {activeTab === 'pending' && renderPendingRequests()}
        {activeTab === 'sent' && renderSentRequests()}
        {activeTab === 'search' && renderSearch()}
      </div>
    </div>
  )
}

export default FriendsList