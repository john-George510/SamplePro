import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { io } from 'socket.io-client';

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Replace with your token

const socket = io('http://localhost:5000'); // Connect to backend server

const BookingMap = ({ driverId }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null); // Store the map instance
  const markerRef = useRef(null); // Store the driver's marker

  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    // Initialize the Mapbox map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-122.4194, 37.7749], // Default center (San Francisco)
      zoom: 12,
    });

    // Listen for location updates from the driver
    socket.on('locationUpdate', ({ driverId: updatedDriverId, coordinates }) => {
      if (updatedDriverId === driverId) {
        setDriverLocation(coordinates);
      }
    });

    return () => socket.disconnect(); // Clean up on unmount
  }, [driverId]);

  useEffect(() => {
    if (mapRef.current && driverLocation) {
      const { latitude, longitude } = driverLocation;

      if (!markerRef.current) {
        // Create a new marker if it doesn't exist
        markerRef.current = new mapboxgl.Marker()
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
      } else {
        // Update the marker's position
        markerRef.current.setLngLat([longitude, latitude]);
      }

      // Center the map on the driver's new location
      mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14 });
    }
  }, [driverLocation]);

  return <div ref={mapContainerRef} style={{ height: '500px', width: '100%' }} />;
};

export default BookingMap;
