import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_BACKEND_API_URL); // Connect to backend

const DriverLocationUpdater = ({ driverId }) => {
  useEffect(() => {
    const sendLocation = (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit('driverLocationUpdate', {
        driverId,
        coordinates: { latitude, longitude },
      });
    };

    const handleError = (error) =>
      console.error('Error getting location:', error);

    // Send location updates every 10 seconds
    const watchId = navigator.geolocation.watchPosition(
      sendLocation,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId); // Clean up on unmount
  }, [driverId]);

  return null;
};

export default DriverLocationUpdater;
