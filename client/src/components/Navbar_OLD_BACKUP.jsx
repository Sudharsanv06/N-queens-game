import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { OfflineAuth } from '../utils/offlineAuth';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check user status on load and when storage changes
  useEffect(() => {
    const checkUser = () => {
      // Use OfflineAuth to get current user consistently
      const userData = OfflineAuth.getCurrentUser();
      setUser(userData);
    };

    // Initial check
    checkUser();

    // Listen for storage events (for cross-tab sync)
    const handleStorageChange = () => checkUser();
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    // Use OfflineAuth logout method for consistency
    OfflineAuth.logout();
    setUser(null);
    setIsMenuOpen(false); // Close mobile menu
    // Notify other tabs
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            N-Queens Game
          </Link>
        </div>

        <button 
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`navbar-link ${location.pathname === '/about' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            About
          </Link>
          <Link 
            to="/leaderboard" 
            className={`navbar-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Leaderboard
          </Link>
          <Link 
            to="/achievements" 
            className={`navbar-link ${location.pathname === '/achievements' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Achievements
          </Link>
          <Link 
            to="/tutorial" 
            className={`navbar-link ${location.pathname === '/tutorial' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Tutorial
          </Link>
          
          {/* Social Features - Only show if logged in */}
          {user && (
            <>
              <Link 
                to="/friends" 
                className={`navbar-link ${location.pathname === '/friends' ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Friends
              </Link>
              <Link 
                to="/replays" 
                className={`navbar-link ${location.pathname === '/replays' ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Replays
              </Link>
              <Link 
                to="/tournaments" 
                className={`navbar-link ${location.pathname === '/tournaments' ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Tournaments
              </Link>
              <Link 
                to="/puzzle-creator" 
                className={`navbar-link ${location.pathname === '/puzzle-creator' ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Create Puzzle
              </Link>
              <Link 
                to="/puzzle-library" 
                className={`navbar-link ${location.pathname === '/puzzle-library' ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Puzzle Library
              </Link>
            </>
          )}
          
          <Link 
            to="/contact" 
            className={`navbar-link ${location.pathname === '/contact' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            Contact
          </Link>
          {user && user.isAdmin && (
            <Link 
              to="/analytics" 
              className={`navbar-link admin-link ${location.pathname === '/analytics' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Analytics
            </Link>
          )}

          <div className="navbar-auth">
            {user ? (
              <div className="user-section">
                <span className="username">Welcome, {user.name}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="navbar-btn login-btn" onClick={closeMobileMenu}>
                  Login
                </Link>
                <Link to="/signup" className="navbar-btn signup-btn" onClick={closeMobileMenu}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;