import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { FaChessQueen, FaHome, FaGamepad, FaTrophy, FaBook, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          <FaChessQueen className="logo-icon" />
          <span className="logo-text">N-Queens</span>
        </Link>
        
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="menu-section">
            <Link 
              to="/" 
              className={`navbar-link ${isActive('/') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaHome className="link-icon" />
              <span>Home</span>
            </Link>
            <Link 
              to="/play" 
              className={`navbar-link ${isActive('/play') || location.pathname.startsWith('/game') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaGamepad className="link-icon" />
              <span>Play</span>
            </Link>
            <Link 
              to="/leaderboard" 
              className={`navbar-link ${isActive('/leaderboard') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaTrophy className="link-icon" />
              <span>Leaderboard</span>
            </Link>
            <Link 
              to="/tutorial" 
              className={`navbar-link ${isActive('/tutorial') ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <FaBook className="link-icon" />
              <span>Tutorial</span>
            </Link>
          </div>
          
          <div className="menu-divider"></div>

          <div className="menu-section menu-auth">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <FaUser className="link-icon" />
                  <span>{user.username || user.name}</span>
                </Link>
                <button onClick={handleLogout} className="navbar-link logout-btn">
                  <FaSignOutAlt className="link-icon" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`navbar-link ${isActive('/login') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <FaSignInAlt className="link-icon" />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/signup" 
                  className={`navbar-link signup-highlight ${isActive('/signup') ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <FaUserPlus className="link-icon" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={closeMobileMenu}></div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
