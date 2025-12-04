import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { fetchLeaderboard } from '../store/slices/gameSlice';
import { OfflineGameStore } from '../utils/offlineStore';
import { OfflineAuth } from '../utils/offlineAuth';
import { FaTrophy, FaMedal, FaCrown, FaStar, FaChartLine, FaFire, FaAward } from 'react-icons/fa';
import './Leaderboard.css';

const Leaderboard = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const onlineLeaderboard = useSelector((state) => state.game.leaderboard);
  const loadingFromStore = useSelector((state) => state.game.loading.leaderboard);
  const [category, setCategory] = useState(searchParams.get('mode') || 'all');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const categories = [
    { value: 'all', label: 'All Players', icon: FaTrophy },
    { value: 'classic', label: 'Classic Mode', icon: FaStar },
    { value: 'time-trial', label: 'Time Trial', icon: FaChartLine },
    { value: 'modern', label: 'Modern Mode', icon: FaMedal },
    { value: 'adventure', label: 'Adventure', icon: FaCrown },
    { value: 'expert', label: 'Expert Level', icon: FaFire }
  ];

  // Get offline leaderboard data with level completion tracking
  const getOfflineLeaderboard = () => {
    try {
      const allUsers = OfflineAuth.getOfflineUsers();
      const currentUser = OfflineAuth.getCurrentUser();
      const games = OfflineGameStore.getGames();
      
      console.log('🔍 Leaderboard Debug:');
      console.log('All users:', allUsers.length);
      console.log('Current user:', currentUser?.name);
      console.log('Total games stored:', games.length);
      console.log('Solved games:', games.filter(g => g.solved).length);
      
      // Log games by user
      allUsers.forEach(user => {
        const userGames = games.filter(game => game.userId === user.id && game.solved);
        console.log(`User ${user.name}: ${userGames.length} solved games`);
      });
      
      // Create leaderboard from offline users
      const offlineLeaderboard = allUsers.map(user => {
        const userGames = games.filter(game => game.userId === user.id && game.solved);
        const stats = user.stats || {
          gamesPlayed: 0,
          gamesWon: 0,
          totalTime: 0,
          bestTimes: {},
          streak: 0
        };

        // Get completed levels for this specific user
        const userCompletions = JSON.parse(localStorage.getItem(`userCompletions_${user.id}`) || '{}');
        const completedLevels = Object.keys(userCompletions)
          .filter(key => key.startsWith('level_'))
          .map(key => parseInt(key.replace('level_', '')))
          .sort((a, b) => b - a);

        const levelsCompleted = completedLevels.length;
        const highestLevel = levelsCompleted > 0 ? Math.max(...completedLevels) : 0;

        // Use actual game count from saved games, fallback to stats
        const actualGamesWon = Math.max(userGames.length, stats.gamesWon || 0);

        // Calculate scores based on both games and level completions
        const gameScores = userGames.map(game => {
          if (game.score && game.score > 0) {
            return game.score;
          }
          
          let score = 1000;
          if (game.timeElapsed) {
            score += Math.max(0, 500 - game.timeElapsed * 2);
          }
          if (game.moves) {
            score -= game.moves * 10;
          }
          if (game.hints) {
            score -= game.hints * 100;
          }
          score += (game.boardSize || 4) * 50;
          return Math.max(100, score);
        });

        const levelBonusScore = completedLevels.reduce((total, level) => {
          const levelData = userCompletions[`level_${level}`];
          const levelPoints = levelData ? levelData.points : ([100, 120, 150, 180, 220, 250, 280, 300, 350, 500][level - 1] || 500);
          return total + levelPoints;
        }, 0);

        const totalScore = gameScores.reduce((a, b) => a + b, 0) + levelBonusScore;
        const bestScore = Math.max(...gameScores, levelBonusScore || 0);
        const avgScore = gameScores.length > 0 ? gameScores.reduce((a, b) => a + b, 0) / gameScores.length : 0;
        const avgTime = stats.gamesWon > 0 ? stats.totalTime / stats.gamesWon : 0;

        const getRankByLevel = (level) => {
          if (level >= 10) return 'Crown';
          if (level >= 7) return 'Diamond';
          if (level >= 5) return 'Gold';
          if (level >= 3) return 'Silver';
          return 'Bronze';
        };

        return {
          _id: user.id,
          username: user.name,
          gamesWon: actualGamesWon,
          totalScore,
          bestScore,
          avgScore,
          avgTime,
          levelsCompleted,
          highestLevel,
          rank: getRankByLevel(highestLevel),
          isCurrentUser: currentUser && user.id === currentUser.id
        };
      }).sort((a, b) => {
        const scoreA = a.totalScore || a.bestScore || 0;
        const scoreB = b.totalScore || b.bestScore || 0;
        return scoreB - scoreA;
      });
      
      console.log('📊 Final leaderboard:', offlineLeaderboard);
      return offlineLeaderboard;
    } catch (error) {
      console.error('Error loading offline leaderboard:', error);
      return [];
    }
  };

  const loadLeaderboard = () => {
    const isOffline = Capacitor.getPlatform() !== 'web' || !navigator.onLine;
    setIsOfflineMode(isOffline);

    if (isOffline) {
      setLeaderboard(getOfflineLeaderboard());
    } else {
      if (onlineLeaderboard && onlineLeaderboard.length > 0) {
        setLeaderboard(onlineLeaderboard);
      } else {
        dispatch(fetchLeaderboard(category));
      }
    }
  };

  const refreshLeaderboard = () => {
    console.log('🔄 Refreshing leaderboard...');
    loadLeaderboard();
  };

  useEffect(() => {
    loadLeaderboard();
    
    const handleLevelCompleted = () => {
      console.log('📢 Level completed event received, refreshing leaderboard...');
      setTimeout(() => loadLeaderboard(), 500);
    };

    const handleGameCompleted = () => {
      console.log('📢 Game completed event received, refreshing leaderboard...');
      setTimeout(() => loadLeaderboard(), 500);
    };

    window.addEventListener('levelCompleted', handleLevelCompleted);
    window.addEventListener('gameCompleted', handleGameCompleted);

    return () => {
      window.removeEventListener('levelCompleted', handleLevelCompleted);
      window.removeEventListener('gameCompleted', handleGameCompleted);
    };
  }, [category, onlineLeaderboard, dispatch]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const loading = loadingFromStore;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (index) => {
    if (index === 0) return { icon: <FaCrown />, color: '#FFD700', label: 'Champion' };
    if (index === 1) return { icon: <FaTrophy />, color: '#C0C0C0', label: '2nd Place' };
    if (index === 2) return { icon: <FaMedal />, color: '#CD7F32', label: '3rd Place' };
    return { icon: <FaStar />, color: '#c9a961', label: `#${index + 1}` };
  };

  return (
    <div className="leaderboard-page">
      {/* Background Decorations */}
      <div className="bg-decoration decoration-1"></div>
      <div className="bg-decoration decoration-2"></div>
      <div className="bg-decoration decoration-3"></div>

      {/* Hero Section */}
      <div className={`leaderboard-hero ${isVisible ? 'visible' : ''}`}>
        <div className="hero-icon-wrapper">
          <FaTrophy className="hero-icon" />
        </div>
        <h1 className="leaderboard-title">
          Global <span className="title-highlight">Leaderboard</span>
        </h1>
        <p className="leaderboard-subtitle">
          Compete with the best N-Queens solvers worldwide
        </p>
      </div>

      <div className={`leaderboard-container ${isVisible ? 'visible' : ''}`}>
        {/* Category Filters */}
        <div className="category-filters">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => !isOfflineMode && setCategory(cat.value)}
                className={`category-btn ${category === cat.value ? 'active' : ''} ${isOfflineMode ? 'disabled' : ''}`}
                disabled={isOfflineMode}
              >
                <IconComponent className="category-icon" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Offline Mode Indicator */}
        {isOfflineMode && (
          <div className="info-banner">
            <FaChartLine className="banner-icon" />
            <span><strong>Level-Based Rankings:</strong> Showing progress from all completed levels</span>
            <button onClick={refreshLeaderboard} className="refresh-btn">
              <FaFire className="btn-icon" />
              Refresh
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading rankings...</p>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {leaderboard.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaTrophy />
                </div>
                <h3>No Rankings Yet</h3>
                <p>Complete levels to join the leaderboard!</p>
                <div className="rank-badges">
                  <span>🥉 Bronze</span>
                  <span>→</span>
                  <span>🥈 Silver</span>
                  <span>→</span>
                  <span>🥇 Gold</span>
                  <span>→</span>
                  <span>💎 Diamond</span>
                  <span>→</span>
                  <span>👑 Crown</span>
                </div>
                <button onClick={() => window.location.href = '/'} className="cta-button">
                  Start Playing
                </button>
              </div>
            ) : (
              <>
                {/* Top 3 Podium */}
                {leaderboard.length >= 3 && (
                  <div className="podium-section">
                    {/* 2nd Place */}
                    <div className="podium-card rank-2">
                      <div className="podium-rank">
                        <FaTrophy />
                        <span>2nd</span>
                      </div>
                      <div className="podium-avatar">{leaderboard[1].username.charAt(0).toUpperCase()}</div>
                      <h3 className="podium-name">{leaderboard[1].username}</h3>
                      <div className="podium-score">
                        <FaStar className="score-icon" />
                        {Math.round(leaderboard[1].totalScore || leaderboard[1].bestScore)}
                      </div>
                      <div className="podium-stats">
                        <span>{leaderboard[1].levelsCompleted || 0} Levels</span>
                        <span>{leaderboard[1].gamesWon || 0} Wins</span>
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="podium-card rank-1">
                      <div className="podium-crown">
                        <FaCrown />
                      </div>
                      <div className="podium-rank champion">
                        <span>Champion</span>
                      </div>
                      <div className="podium-avatar champion">{leaderboard[0].username.charAt(0).toUpperCase()}</div>
                      <h3 className="podium-name">{leaderboard[0].username}</h3>
                      <div className="podium-score">
                        <FaStar className="score-icon" />
                        {Math.round(leaderboard[0].totalScore || leaderboard[0].bestScore)}
                      </div>
                      <div className="podium-stats">
                        <span>{leaderboard[0].levelsCompleted || 0} Levels</span>
                        <span>{leaderboard[0].gamesWon || 0} Wins</span>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="podium-card rank-3">
                      <div className="podium-rank">
                        <FaMedal />
                        <span>3rd</span>
                      </div>
                      <div className="podium-avatar">{leaderboard[2].username.charAt(0).toUpperCase()}</div>
                      <h3 className="podium-name">{leaderboard[2].username}</h3>
                      <div className="podium-score">
                        <FaStar className="score-icon" />
                        {Math.round(leaderboard[2].totalScore || leaderboard[2].bestScore)}
                      </div>
                      <div className="podium-stats">
                        <span>{leaderboard[2].levelsCompleted || 0} Levels</span>
                        <span>{leaderboard[2].gamesWon || 0} Wins</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rankings List */}
                <div className="rankings-list">
                  <div className="rankings-header">
                    <h3>
                      <FaChartLine />
                      All Rankings
                    </h3>
                  </div>
                  
                  <div className="rankings-grid">
                    {leaderboard.map((player, index) => {
                      const rankData = getRankIcon(index);
                      return (
                        <div 
                          key={player._id} 
                          className={`ranking-card ${index < 3 ? 'top-rank' : ''} ${player.isCurrentUser ? 'current-user' : ''}`}
                        >
                          <div className="rank-badge" style={{ color: rankData.color }}>
                            {rankData.icon}
                            <span className="rank-number">#{index + 1}</span>
                          </div>
                          
                          <div className="player-info">
                            <div className="player-avatar">
                              {player.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="player-details">
                              <h4 className="player-name">
                                {player.username}
                                {player.isCurrentUser && <span className="you-badge">You</span>}
                              </h4>
                              <p className="player-rank">{player.rank || 'Bronze'}</p>
                            </div>
                          </div>

                          <div className="player-stats">
                            <div className="stat-item">
                              <FaStar className="stat-icon" />
                              <span className="stat-value">{Math.round(player.totalScore || player.bestScore)}</span>
                              <span className="stat-label">Score</span>
                            </div>
                            <div className="stat-item">
                              <FaTrophy className="stat-icon" />
                              <span className="stat-value">{player.levelsCompleted || 0}</span>
                              <span className="stat-label">Levels</span>
                            </div>
                            <div className="stat-item">
                              <FaMedal className="stat-icon" />
                              <span className="stat-value">{player.gamesWon || 0}</span>
                              <span className="stat-label">Wins</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
