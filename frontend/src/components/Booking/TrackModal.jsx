// src/components/common/TrackModal.jsx

import React, { useEffect, useRef, useState, useContext } from 'react';
import mapboxgl from 'mapbox-gl';
import { SocketContext } from '../../context/SocketContext';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox CSS

// Set your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiYWRpdHJhbWRhcyIsImEiOiJjbTJoZTVpa20wN2F3MmpzM3F2a2M3ZWNxIn0.ePD_ugk2QndekxDHx3ryhA"; // Replace with your Mapbox token

const TrackModal = ({ bookingId, onClose }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const socket = useContext(SocketContext);
  const [driverLocation, setDriverLocation] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Initialize Mapbox map only once
    if (mapRef.current) return; // Prevent multiple map instances

    // Initialize Mapbox map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0], // Temporary center; will update once location is received
      zoom: 12,
    });

    // Add navigation controls (zoom buttons)
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Listen for location updates from Socket.IO
    socket.on('locationUpdate', ({ driverId, coordinates }) => {
      console.log('Received location update:', coordinates);
      setDriverLocation(coordinates);
    });

    // Listen for status updates
    socket.on('statusUpdate', ({ status }) => {
      console.log('Received status update:', status);
      setStatus(status);
    });

    // Join the booking room to listen for updates
    socket.emit('joinBookingRoom', { bookingId });
    console.log(`Joined booking room: ${bookingId}`);

    return () => {
      // Cleanup event listeners
      socket.off('locationUpdate');
      socket.off('statusUpdate');

      // Leave the booking room
      socket.emit('leaveBookingRoom', { bookingId });
      console.log(`Left booking room: ${bookingId}`);

      // Remove the Mapbox instance if it exists
      if (mapRef.current) {
        mapRef.current.remove(); // Ensure map instance exists
        mapRef.current = null;
      }
    };
  }, [bookingId, socket]);

  useEffect(() => {
    if (driverLocation && mapRef.current) {
      const { latitude, longitude } = driverLocation;

      // Initialize the marker if it doesn't exist
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ color: 'red' })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
        console.log('Added marker to the map.');
      } else {
        // Update marker position
        markerRef.current.setLngLat([longitude, latitude]);
        console.log('Updated marker position.');
      }

      // Center the map on the driver's location
      mapRef.current.flyTo({
        center: [longitude, latitude],
        essential: true,
        speed: 1.2, // Adjust speed for smoother transition
        zoom: 14, // Optional: Adjust zoom level if needed
      });
      console.log(`Map centered on: ${latitude}, ${longitude}`);
    }
  }, [driverLocation]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeButton}>
          Close
        </button>
        <h3>Driver Location</h3>
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '400px', marginBottom: '20px' }}
        />
        {driverLocation ? (
          <p>Status: {status}</p>
        ) : (
          <p>Waiting for driver location...</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '80%',
    maxWidth: '600px',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default TrackModal;
