// Login.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Ensure this path is correct based on your project structure

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
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
