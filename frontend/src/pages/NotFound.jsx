// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import brokenBox from '../assets/404brokenbox.png';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: 'var(--background)'
    }}>
      <img 
        src={brokenBox} 
        alt="404 Broken Box" 
        style={{
          maxWidth: '300px',
          width: '100%',
          height: 'auto',
          marginBottom: '2rem'
        }}
      />
      <h1 style={{
        fontSize: '4rem',
        fontWeight: '700',
        color: 'var(--text)',
        marginBottom: '1rem',
        lineHeight: '1'
      }}>
        404
      </h1>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '500',
        color: 'var(--text-secondary)',
        marginBottom: '2rem'
      }}>
        Page Not Found
      </h2>
      <Link 
        to="/"
        style={{
          background: 'var(--primary)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '1rem',
          fontWeight: '500',
          transition: 'background-color 0.2s ease'
        }}
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
