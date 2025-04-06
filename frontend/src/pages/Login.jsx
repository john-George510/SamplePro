// Login.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../redux/slices/userSlice';
import { useNavigate, Link } from 'react-router-dom';
import LogiFleetLogo from '../assets/LogiFLeet_logo.png';
import '../App.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(login({ email, password }));
    console.log('Logged in successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="container">
      <div className="content-box" style={{ maxWidth: '400px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '700' }}>Welcome Back!</h1>
        <p className="subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
