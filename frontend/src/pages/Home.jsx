// Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const Home = () => (
  <div className="container">
    <h1>Welcome to the Logistics Platform</h1>
    <div className="link-container">
      <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
    </div>
  </div>
);

export default Home;
