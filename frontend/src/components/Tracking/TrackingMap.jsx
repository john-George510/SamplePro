// src/components/Tracking/TrackingMap.jsx
import React, { useEffect, useState } from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';
import io from 'socket.io-client';

const TrackingMap = ({ bookingId }) => {
  const [viewport, setViewport] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    zoom: 12,
    width: '100%',
    height: '400px',
  });
  const [location, setLocation] = useState({
    latitude: 40.7128,
    longitude: -74.006,
  });

  useEffect(() => {
    const socket = io(process.env.REACT_APP_BACKEND_API_URL);

    // Join room based on bookingId
    socket.emit('join', bookingId);

    // Listen for location updates
    socket.on('locationUpdate', (newLocation) => {
      setLocation(newLocation);
      setViewport((prev) => ({
        ...prev,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [bookingId]);

  return (
    <div>
      <h2>Driver Location</h2>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={"pk.eyJ1IjoiYWRpdHJhbWRhcyIsImEiOiJjbTJoZTVpa20wN2F3MmpzM3F2a2M3ZWNxIn0.ePD_ugk2QndekxDHx3ryhA"}
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
      >
        <Marker latitude={location.latitude} longitude={location.longitude}>
          <div
            style={{
              backgroundColor: 'blue',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
            }}
          ></div>
        </Marker>
      </ReactMapGL>
    </div>
  );
};

export default TrackingMap;
