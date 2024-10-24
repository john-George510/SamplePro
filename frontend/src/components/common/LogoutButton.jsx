// frontend/src/components/Common/LogoutButton.jsx

import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const handleLogout = () => {
    // Dispatch the logout action to Redux
    dispatch(logout());

    // Disconnect the socket if connected
    if (socket) {
      socket.disconnect();
      console.log('Socket disconnected on logout');
    }

    // Redirect to login page
    navigate('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
