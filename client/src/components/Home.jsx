import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaBook, FaTrophy, FaBrain, FaChess } from 'react-icons/fa';
import './Home.css';

function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="home">
      {/* Background Decorations */}
      <div className="bg-decoration decoration-1"></div>
      <div className="bg-decoration decoration-2"></div>
      <div className="bg-decoration decoration-3"></div>

      {/* Hero Section */}
      <section className={`hero-container ${isVisible ? 'visible' : ''}`}>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <FaChess className="badge-icon" />
              <span>Classic Strategy Puzzle</span>
            </div>
            
            <h1 className="hero-title">
              N-Queens
              <span className="title-highlight"> Challenge</span>
            </h1>
            
            <p className="hero-subtitle">
              Master the timeless chess puzzle that challenges your logic and strategic thinking. 
              Place queens on the board so none can attack each other.
            </p>

            <div className="cta-buttons">
              <Link to="/play" className="btn btn-primary">
                <FaPlay className="btn-icon" />
                <span>Start Playing</span>
              </Link>
              <Link to="/tutorial" className="btn btn-glass">
                <FaBook className="btn-icon" />
                <span>Learn More</span>
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <FaBrain className="stat-icon" />
                <div className="stat-text">
                  <span className="stat-number">∞</span>
                  <span className="stat-label">Puzzles</span>
                </div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <FaTrophy className="stat-icon" />
                <div className="stat-text">
                  <span className="stat-number">4-12</span>
                  <span className="stat-label">Board Sizes</span>
                </div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <FaChess className="stat-icon" />
                <div className="stat-text">
                  <span className="stat-number">Classic</span>
                  <span className="stat-label">Gameplay</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="board-container">
              <div className="board-glow"></div>
              <div className="chess-board">
                {Array(8).fill(null).map((_, row) => (
                  <div key={row} className="board-row">
                    {Array(8).fill(null).map((_, col) => {
                      const isQueen = 
                        (row === 0 && col === 0) || 
                        (row === 1 && col === 4) || 
                        (row === 2 && col === 7) || 
                        (row === 3 && col === 5) ||
                        (row === 4 && col === 2) ||
                        (row === 5 && col === 6) ||
                        (row === 6 && col === 1) ||
                        (row === 7 && col === 3);
                      
                      return (
                        <div 
                          key={col}
                          className={`board-cell ${(row + col) % 2 === 0 ? 'light' : 'dark'} ${isQueen ? 'has-queen' : ''}`}
                          style={{ animationDelay: `${(row * 8 + col) * 0.01}s` }}
                        >
                          {isQueen && (
                            <span className="queen-piece" style={{ animationDelay: `${(row * 8 + col) * 0.02}s` }}>
                              ♛
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="board-label">8-Queens Solution</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaBrain className="feature-icon" />
            </div>
            <h3 className="feature-title">Strategic Thinking</h3>
            <p className="feature-description">
              Develop problem-solving skills and logical reasoning through elegant puzzle mechanics.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaTrophy className="feature-icon" />
            </div>
            <h3 className="feature-title">Track Progress</h3>
            <p className="feature-description">
              Compete on leaderboards and earn achievements as you master increasingly complex boards.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FaChess className="feature-icon" />
            </div>
            <h3 className="feature-title">Classic Puzzle</h3>
            <p className="feature-description">
              Experience the timeless chess challenge that has fascinated mathematicians for centuries.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
