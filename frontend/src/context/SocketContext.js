// frontend/src/context/SocketContext.jsx

import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const token = useSelector((state) => state.user.token); // Access token from Redux
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token) {
      const newSocket = io("http://localhost:5000", { // Replace with your backend URL if different
        auth: {
          token: token,
        },
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        console.log('Disconnected from Socket.IO server');
      };
    } else if (socket) {
      // If no token, disconnect existing socket
      socket.disconnect();
      setSocket(null);
      console.log('Disconnected socket due to missing token');
    }
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
