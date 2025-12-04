import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../store/slices/authSlice';
import { FaChessQueen, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaIdCard } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Signup.css';

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return;
    }

    try {
      const { confirmPassword, ...signupData } = formData;
      const result = await dispatch(signupUser(signupData)).unwrap();
      toast.success('Account created successfully! Welcome aboard!');
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration decoration-1"></div>
      <div className="auth-decoration decoration-2"></div>

      <div className={`auth-container ${isVisible ? 'visible' : ''}`}>
        <div className="auth-card">
          {/* Logo Section */}
          <div className="auth-header">
            <div className="auth-logo">
              <FaChessQueen className="auth-logo-icon" />
            </div>
            <h1 className="auth-title">Join N-Queens</h1>
            <p className="auth-subtitle">Create your account and start your journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <FaUser className="label-icon" />
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a unique username"
                className="form-input"
                required
                minLength={3}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <FaIdCard className="label-icon" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="form-input"
                required
                minLength={2}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FaEnvelope className="label-icon" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="form-input"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FaLock className="label-icon" />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="form-input"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="form-hint">Minimum 6 characters</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <FaLock className="label-icon" />
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="form-input"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <FaArrowRight className="button-icon" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          {/* Login Link */}
          <Link to="/login" className="auth-secondary-button">
            Sign In Instead
          </Link>

          {/* Terms */}
          <p className="terms-text">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="terms-link">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="terms-link">Privacy Policy</Link>
          </p>
        </div>

        {/* Benefits */}
        <div className="auth-features">
          <div className="feature-item">
            <div className="feature-icon">🎯</div>
            <p className="feature-text">Personal Dashboard</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📈</div>
            <p className="feature-text">Progress Tracking</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🏅</div>
            <p className="feature-text">Unlock Achievements</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
