import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Tutorial.css'

const Tutorial = () => {
  const navigate = useNavigate()

  return (
    <div className="tutorial-container">
      <div className="tutorial-hero">
        <h1 className="tutorial-title">How to Master N-Queens</h1>
        <p className="tutorial-subtitle">Learn the classic chess puzzle step by step</p>
      </div>

      {/* Introduction Section */}
      <section className="tutorial-section">
        <div className="section-header">
          <span className="section-number">01</span>
          <h2>What is the N-Queens Problem?</h2>
        </div>
        <div className="section-content">
          <p className="section-text">
            The N-Queens puzzle is a classic problem where you must place N chess queens on an N×N chessboard 
            so that no two queens threaten each other. This means no two queens can share the same row, column, 
            or diagonal.
          </p>
          <div className="video-wrapper">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/xouin83ebxE"
              title="N-Queens Problem Explanation"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="info-box">
            <h4>💡 Did You Know?</h4>
            <p>The 8-Queens puzzle was first proposed by chess player Max Bezzel in 1848, and it has been studied extensively in mathematics and computer science ever since!</p>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="tutorial-section">
        <div className="section-header">
          <span className="section-number">02</span>
          <h2>Understanding Queen Movements</h2>
        </div>
        <div className="section-content">
          <p className="section-text">
            A queen is the most powerful piece in chess. It can move any number of squares in eight directions: 
            horizontally, vertically, and diagonally.
          </p>
          <div className="rules-grid">
            <div className="rule-card">
              <span className="rule-icon">↔️</span>
              <h3>Horizontal</h3>
              <p>Queens attack all squares in the same row, left and right</p>
            </div>
            <div className="rule-card">
              <span className="rule-icon">↕️</span>
              <h3>Vertical</h3>
              <p>Queens attack all squares in the same column, up and down</p>
            </div>
            <div className="rule-card">
              <span className="rule-icon">⤢</span>
              <h3>Diagonal</h3>
              <p>Queens attack all squares on both diagonal directions</p>
            </div>
          </div>
          <div className="video-wrapper">
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/Ph95IHn3_39"
              title="N Queens Visualization"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Strategy Section */}
      <section className="tutorial-section">
        <div className="section-header">
          <span className="section-number">03</span>
          <h2>Solving Strategies</h2>
        </div>
        <div className="section-content">
          <p className="section-text">
            While there's no single "correct" way to solve N-Queens, here are some strategies that can help:
          </p>
          <div className="strategy-list">
            <div className="strategy-item">
              <div className="strategy-number">1</div>
              <div className="strategy-content">
                <h4>Start with One Row</h4>
                <p>Begin by placing one queen in the first row, then move to the next row. This systematic approach helps you avoid conflicts.</p>
              </div>
            </div>
            <div className="strategy-item">
              <div className="strategy-number">2</div>
              <div className="strategy-content">
                <h4>Check Before You Place</h4>
                <p>Before placing a queen, ensure it doesn't attack any previously placed queens. Look at the row, column, and both diagonals.</p>
              </div>
            </div>
            <div className="strategy-item">
              <div className="strategy-number">3</div>
              <div className="strategy-content">
                <h4>Use Backtracking</h4>
                <p>If you reach a dead end where no safe squares exist, go back and try a different position for the previous queen.</p>
              </div>
            </div>
            <div className="strategy-item">
              <div className="strategy-number">4</div>
              <div className="strategy-content">
                <h4>Visualize the Pattern</h4>
                <p>Look for patterns in successful solutions. Often queens are spread out evenly across the board.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Example Solutions */}
      <section className="tutorial-section">
        <div className="section-header">
          <span className="section-number">04</span>
          <h2>Example Solutions</h2>
        </div>
        <div className="section-content">
          <p className="section-text">
            Here are some example solutions for different board sizes. Notice how the queens are positioned:
          </p>
          <div className="examples-grid">
            <div className="example-card">
              <h4>4×4 Board</h4>
              <p className="example-description">2 possible solutions</p>
              <div className="example-info">Position queens at: (0,1), (1,3), (2,0), (3,2)</div>
            </div>
            <div className="example-card">
              <h4>8×8 Board</h4>
              <p className="example-description">92 possible solutions</p>
              <div className="example-info">Many symmetrical patterns exist</div>
            </div>
            <div className="example-card">
              <h4>12×12 Board</h4>
              <p className="example-description">14,200 possible solutions</p>
              <div className="example-info">Complexity increases exponentially</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tips */}
      <section className="tutorial-section tips-section">
        <div className="section-header">
          <span className="section-number">05</span>
          <h2>Tips for Playing</h2>
        </div>
        <div className="section-content">
          <div className="tips-grid">
            <div className="tip-card">
              <span className="tip-emoji">🎯</span>
              <h4>Start Small</h4>
              <p>Begin with a 4×4 or 6×6 board before tackling larger challenges</p>
            </div>
            <div className="tip-card">
              <span className="tip-emoji">⚡</span>
              <h4>Use Hints Wisely</h4>
              <p>Use the hint feature when stuck, but try to understand the pattern</p>
            </div>
            <div className="tip-card">
              <span className="tip-emoji">🧠</span>
              <h4>Practice Patience</h4>
              <p>Some puzzles may take multiple attempts. Don't give up!</p>
            </div>
            <div className="tip-card">
              <span className="tip-emoji">📊</span>
              <h4>Track Progress</h4>
              <p>Monitor your solve times and try to beat your personal best</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className="tutorial-cta">
        <h3>Ready to Start?</h3>
        <p>Put your knowledge to the test and start solving N-Queens puzzles!</p>
        <button
          onClick={() => navigate('/play')}
          className="cta-button"
        >
          Start Playing Now
        </button>
      </div>
    </div>
  )
}

export default Tutorial