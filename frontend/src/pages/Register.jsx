// Register.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../redux/slices/userSlice';
import { useNavigate, Link } from 'react-router-dom';
import LogiFleetLogo from '../assets/LogiFLeet_logo.png';
import '../App.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get error state from Redux
  const { error, status } = useSelector((state) => state.user);

  const getErrorMessage = (error) => {
    if (!error) return '';
    
    // Check for common error patterns
    if (typeof error === 'string') {
      if (error.includes('duplicate key') || 
          error.includes('already exists') || 
          error.includes('E11000') ||
          error.includes('400')) {
        return 'An account with this email already exists. Please sign in instead.';
      }
    }
    // Return a user-friendly message for other errors
    return 'Something went wrong. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(register({ name, email, password, role })).unwrap();
      if (result && result.token) {
        navigate('/dashboard');
      }
    } catch (err) {
      // Error is handled by Redux and will be available in the error state
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="container">
      <div className="content-box" style={{ maxWidth: '400px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '700' }}>Create Account</h1>
        <p className="subtitle">Join us to manage your fleet efficiently</p>
        
        {/* Display error message if exists */}
        {error && (
          <div className="error-message" style={{
            color: 'var(--error)',
            backgroundColor: '#FFE9E9',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="var(--error)"/>
            </svg>
            {getErrorMessage(error)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a strong password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
            >
              <option value="user">User</option>
              <option value="driver">Driver</option>
            </select>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
