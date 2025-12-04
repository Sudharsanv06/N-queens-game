import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaChessQueen, FaUser, FaEnvelope, FaTrophy, FaStar, FaClock, 
  FaChartLine, FaEdit, FaSignOutAlt, FaCheckCircle,
  FaCrown, FaMedal, FaFire, FaGamepad, FaLock, FaCamera
} from 'react-icons/fa';
import { logoutUser, updateProfile, changePassword } from '../store/slices/authSlice';
import { OfflineGameStore } from '../utils/offlineStore';
import { OfflineAuth } from '../utils/offlineAuth';
import toast from 'react-hot-toast';
import './Dashboard.css';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarUpdateKey, setAvatarUpdateKey] = useState(0);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
  });

  // Predefined avatars
  const avatars = [
    { id: 1, emoji: '👑', color: '#FFD700', name: 'Crown' },
    { id: 2, emoji: '🎮', color: '#4169E1', name: 'Gamer' },
    { id: 3, emoji: '🎯', color: '#FF6347', name: 'Target' },
    { id: 4, emoji: '⚡', color: '#FFD700', name: 'Lightning' },
    { id: 5, emoji: '🔥', color: '#FF4500', name: 'Fire' },
    { id: 6, emoji: '🌟', color: '#FFD700', name: 'Star' },
    { id: 7, emoji: '🎨', color: '#FF69B4', name: 'Artist' },
    { id: 8, emoji: '🚀', color: '#1E90FF', name: 'Rocket' },
    { id: 9, emoji: '🏆', color: '#FFD700', name: 'Trophy' },
    { id: 10, emoji: '💎', color: '#00CED1', name: 'Diamond' },
  ];
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsVisible(true);
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
      });
      console.log('Current user avatar:', user.avatar);
    }
  }, [isAuthenticated, navigate, user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode && user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(updateProfile(editData)).unwrap();
      toast.success('Profile updated successfully!');
      setIsEditMode(false);
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })).unwrap();
      
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error || 'Failed to change password');
    }
  };

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleAvatarSelect = async (avatar) => {
    console.log('Selected avatar:', avatar);
    setSelectedAvatar(avatar);
    try {
      const avatarString = JSON.stringify(avatar);
      console.log('Sending avatar string:', avatarString);
      
      const result = await dispatch(updateProfile({ 
        name: user.name, 
        email: user.email,
        avatar: avatarString
      })).unwrap();
      
      console.log('Update profile result:', result);
      console.log('Updated user from result:', result.user);
      
      // Force re-render
      setAvatarUpdateKey(prev => prev + 1);
      
      toast.success('Avatar updated successfully!');
      setShowAvatarModal(false);
    } catch (error) {
      console.error('Avatar update error:', error);
      toast.error(error || 'Failed to update avatar');
    }
  };

  const getCurrentAvatar = () => {
    if (user?.avatar) {
      // If avatar is already an object (shouldn't happen but just in case)
      if (typeof user.avatar === 'object') {
        console.log('Avatar is already an object:', user.avatar);
        return user.avatar;
      }
      
      try {
        // Try to parse as JSON (new format)
        const avatarData = JSON.parse(user.avatar);
        console.log('Parsed avatar data:', avatarData);
        return avatarData;
      } catch (e) {
        // Old format (file path) or invalid - return default
        console.log('Avatar is old format (file path), using default');
        return null;
      }
    }
    console.log('No avatar found in user object');
    return null;
  };

  if (!user) {
    return null;
  }

  console.log('Current user object:', user);
  console.log('Current avatar from getCurrentAvatar:', getCurrentAvatar());

  // Fetch real game data
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    winRate: 0,
    currentStreak: 0,
    bestTime: '0:00',
    level: 1,
    xp: 0,
  });
  const [recentGames, setRecentGames] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    // Fetch real game data from local storage or backend
    const fetchGameData = async () => {
      try {
        // Get current user
        const currentUser = OfflineAuth.getCurrentUser();
        const currentUsername = user?.name || user?.username;
        
        // Get all games from offline storage
        const allGames = OfflineGameStore.getGames();
        console.log('All games:', allGames);
        
        // Filter games for current user
        const userGames = allGames.filter(game => {
          return game.userId === currentUser?.id || 
                 game.username === currentUsername ||
                 game.userId === user?.id;
        });
        
        console.log('User games:', userGames);
        
        // Calculate stats
        const wonGames = userGames.filter(g => g.solved || g.completed);
        const totalGames = userGames.length;
        const totalScore = userGames.reduce((sum, g) => sum + (g.score || 0), 0);
        const winRate = totalGames > 0 ? Math.round((wonGames.length / totalGames) * 100) : 0;
        
        // Calculate best time (fastest completion in seconds)
        const completedGames = userGames.filter(g => (g.solved || g.completed) && g.timeElapsed);
        const bestTimeSeconds = completedGames.length > 0 
          ? Math.min(...completedGames.map(g => g.timeElapsed))
          : 0;
        const bestTimeFormatted = formatTime(bestTimeSeconds);
        
        // Calculate current streak
        const sortedGames = [...userGames]
          .filter(g => g.completedAt)
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
        
        let streak = 0;
        for (const game of sortedGames) {
          if (game.solved || game.completed) {
            streak++;
          } else {
            break;
          }
        }
        
        // Calculate level and XP based on score
        const level = Math.floor(totalScore / 1000) + 1;
        const xp = totalScore % 1000;
        
        setGameStats({
          gamesPlayed: totalGames,
          gamesWon: wonGames.length,
          totalScore: totalScore,
          winRate: winRate,
          currentStreak: streak,
          bestTime: bestTimeFormatted,
          level: level,
          xp: totalScore,
        });
        
        // Set recent games (last 10)
        const recentUserGames = sortedGames.slice(0, 10).map(game => ({
          id: game.id,
          size: game.boardSize || game.n || 8,
          difficulty: getDifficulty(game.boardSize || game.n || 8),
          score: game.score || 0,
          time: formatTime(game.timeElapsed || 0),
          result: game.solved || game.completed ? 'won' : 'lost',
          mode: game.mode || 'classic',
          date: game.completedAt ? new Date(game.completedAt).toLocaleDateString() : 'N/A'
        }));
        
        setRecentGames(recentUserGames);
        
        // Generate achievements based on actual performance
        const generatedAchievements = generateAchievements(userGames, wonGames, streak, bestTimeSeconds);
        setAchievements(generatedAchievements);
        
      } catch (error) {
        console.error('Error fetching game data:', error);
      }
    };
    
    if (user) {
      fetchGameData();
      
      // Listen for game completion events to refresh stats
      const handleGameComplete = () => {
        fetchGameData();
      };
      
      window.addEventListener('gameCompleted', handleGameComplete);
      
      return () => {
        window.removeEventListener('gameCompleted', handleGameComplete);
      };
    }
  }, [user]);

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficulty = (size) => {
    if (size <= 6) return 'Easy';
    if (size <= 10) return 'Medium';
    if (size <= 14) return 'Hard';
    return 'Expert';
  };

  const generateAchievements = (allGames, wonGames, streak, bestTime) => {
    const achievementsList = [];
    
    // Speed Demon achievement
    if (bestTime > 0 && bestTime < 180) {
      achievementsList.push({
        id: 1,
        name: 'Speed Demon',
        icon: '⚡',
        description: `Completed puzzle in under 3 minutes (${formatTime(bestTime)})`,
        date: 'Recently'
      });
    }
    
    // Winning Streak achievement
    if (streak >= 3) {
      achievementsList.push({
        id: 2,
        name: 'Winning Streak',
        icon: '🔥',
        description: `Won ${streak} games in a row`,
        date: 'Active now'
      });
    }
    
    // Master Player achievement
    if (wonGames.length >= 10) {
      achievementsList.push({
        id: 3,
        name: 'Master Player',
        icon: '🏆',
        description: `Won ${wonGames.length} games`,
        date: 'Active now'
      });
    }
    
    // Expert Level achievement
    const expertGames = wonGames.filter(g => (g.boardSize || g.n) >= 12);
    if (expertGames.length > 0) {
      achievementsList.push({
        id: 4,
        name: 'Expert Strategist',
        icon: '🧠',
        description: 'Completed expert level puzzles',
        date: 'Recently'
      });
    }
    
    // Time Trial Master
    const timeTrialGames = wonGames.filter(g => g.mode === 'time-trial');
    if (timeTrialGames.length >= 5) {
      achievementsList.push({
        id: 5,
        name: 'Time Trial Master',
        icon: '⏱️',
        description: `Beat the clock ${timeTrialGames.length} times`,
        date: 'Active now'
      });
    }
    
    // First Victory
    if (wonGames.length >= 1) {
      achievementsList.push({
        id: 6,
        name: 'First Victory',
        icon: '🎯',
        description: 'Won your first game',
        date: wonGames[0]?.completedAt ? new Date(wonGames[0].completedAt).toLocaleDateString() : 'Recently'
      });
    }
    
    return achievementsList.slice(0, 5); // Return top 5 achievements
  };

  // Mock data - replace with real data from backend
  const stats = {
    gamesPlayed: gameStats.gamesPlayed,
    gamesWon: gameStats.gamesWon,
    totalScore: gameStats.totalScore,
    winRate: gameStats.winRate,
    currentStreak: gameStats.currentStreak,
    bestTime: gameStats.bestTime,
    level: gameStats.level,
    xp: gameStats.xp,
  };

  const recentAchievements = achievements.length > 0 ? achievements : [
    { id: 1, name: 'Getting Started', icon: '🎮', description: 'Play your first game to earn achievements!', date: 'Waiting' }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-decoration decoration-1"></div>
      <div className="dashboard-decoration decoration-2"></div>

      <div className={`dashboard-container ${isVisible ? 'visible' : ''}`}>
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="user-welcome">
            <div className="user-avatar-wrapper">
              <div 
                key={`avatar-${avatarUpdateKey}`}
                className="user-avatar" 
                onClick={handleAvatarClick}
                style={{ 
                  backgroundColor: getCurrentAvatar()?.color || '#DAA520',
                  cursor: 'pointer'
                }}
              >
                {getCurrentAvatar() ? (
                  <span className="avatar-emoji">{getCurrentAvatar().emoji}</span>
                ) : (
                  <span className="avatar-emoji">👤</span>
                )}
                <div className="avatar-overlay">
                  <FaCamera />
                </div>
              </div>
            </div>
            <div className="user-info">
              <h1 className="user-greeting">Welcome back, {user.name}!</h1>
              <p className="user-subtitle">Level {stats.level} • {stats.xp} XP</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={handleEditToggle} className="icon-button edit-button">
              <FaEdit />
            </button>
            <button onClick={handleLogout} className="icon-button logout-button">
              <FaSignOutAlt />
            </button>
          </div>
        </div>

        {/* Edit Profile Form */}
        {isEditMode && (
          <div className="edit-profile-section">
            <h3 className="section-title">Edit Profile</h3>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    <FaUser className="label-icon" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <FaEnvelope className="label-icon" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button" disabled={loading}>
                  <FaCheckCircle />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={handleEditToggle} className="cancel-button">
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(true)} 
                  className="password-button"
                >
                  <FaLock />
                  Change Password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon games-icon">
              <FaGamepad />
            </div>
            <div className="stat-content">
              <p className="stat-label">Games Played</p>
              <p className="stat-value">{stats.gamesPlayed}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon trophy-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <p className="stat-label">Games Won</p>
              <p className="stat-value">{stats.gamesWon}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon score-icon">
              <FaStar />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Score</p>
              <p className="stat-value">{stats.totalScore.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon rate-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <p className="stat-label">Win Rate</p>
              <p className="stat-value">{stats.winRate}%</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon streak-icon">
              <FaFire />
            </div>
            <div className="stat-content">
              <p className="stat-label">Current Streak</p>
              <p className="stat-value">{stats.currentStreak}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon time-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <p className="stat-label">Best Time</p>
              <p className="stat-value">{stats.bestTime}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Game History
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="content-card">
                <h3 className="card-title">
                  <FaCrown className="title-icon" />
                  Recent Achievements
                </h3>
                <div className="achievements-list">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="achievement-item">
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-info">
                        <h4 className="achievement-name">{achievement.name}</h4>
                        <p className="achievement-description">{achievement.description}</p>
                        <span className="achievement-date">{achievement.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="content-card">
                <h3 className="card-title">
                  <FaGamepad className="title-icon" />
                  Quick Actions
                </h3>
                <div className="action-buttons">
                  <Link to="/play" className="action-button primary">
                    <FaChessQueen />
                    Start New Game
                  </Link>
                  <Link to="/leaderboard" className="action-button secondary">
                    <FaTrophy />
                    View Leaderboard
                  </Link>
                  <Link to="/achievements" className="action-button secondary">
                    <FaMedal />
                    All Achievements
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="achievements-section">
              <div className="content-card">
                <h3 className="card-title">
                  <FaMedal className="title-icon" />
                  All Achievements
                </h3>
                <p className="coming-soon">More achievements coming soon!</p>
                <div className="achievements-grid">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="achievement-card">
                      <div className="achievement-card-icon">{achievement.icon}</div>
                      <h4 className="achievement-card-name">{achievement.name}</h4>
                      <p className="achievement-card-desc">{achievement.description}</p>
                      <span className="achievement-card-date">{achievement.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-section">
              <div className="content-card">
                <h3 className="card-title">
                  <FaClock className="title-icon" />
                  Recent Games
                </h3>
                {recentGames.length > 0 ? (
                  <div className="games-table">
                    <div className="table-header">
                      <span>Board Size</span>
                      <span>Mode</span>
                      <span>Difficulty</span>
                      <span>Score</span>
                      <span>Time</span>
                      <span>Result</span>
                      <span>Date</span>
                    </div>
                    {recentGames.map((game) => (
                      <div key={game.id} className="table-row">
                        <span>{game.size}×{game.size}</span>
                        <span className="mode-badge">{game.mode || 'classic'}</span>
                        <span className={`difficulty-badge ${game.difficulty.toLowerCase()}`}>
                          {game.difficulty}
                        </span>
                        <span className="score-value">{game.score}</span>
                        <span>{game.time}</span>
                        <span className={`result-badge ${game.result}`}>
                          {game.result === 'won' ? '✓ Won' : '✗ Lost'}
                        </span>
                        <span className="date-value">{game.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-games-message">
                    <FaGamepad size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No games played yet. Start playing to see your history!</p>
                    <Link to="/play" className="action-button primary" style={{ marginTop: '1rem' }}>
                      <FaChessQueen />
                      Start Playing
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">
                  <FaLock className="label-icon" />
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  <FaLock className="label-icon" />
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  <FaLock className="label-icon" />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  required
                  minLength={6}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-button" disabled={loading}>
                  <FaCheckCircle />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowPasswordModal(false)} 
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Avatar Selection Modal */}
      {showAvatarModal && (
        <div className="modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="modal-content avatar-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Choose Your Avatar</h3>
            <div className="avatar-grid">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`avatar-option ${getCurrentAvatar()?.id === avatar.id ? 'selected' : ''}`}
                  style={{ backgroundColor: avatar.color }}
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <span className="avatar-option-emoji">{avatar.emoji}</span>
                  <span className="avatar-option-name">{avatar.name}</span>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => setShowAvatarModal(false)} 
                className="cancel-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
