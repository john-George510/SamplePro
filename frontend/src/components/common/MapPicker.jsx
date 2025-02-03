// src/components/common/MapPicker.jsx

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const MAPBOX_TOKEN = "pk.eyJ1IjoiYWRpdHJhbWRhcyIsImEiOiJjbTJoZTVpa20wN2F3MmpzM3F2a2M3ZWNxIn0.ePD_ugk2QndekxDHx3ryhA";

const MapPicker = ({ label, onSelectLocation, initialLocation }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.error(
        'Mapbox token is not set. Please add it to your .env file.'
      );
      return;
    }

    // Initialize Mapbox map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialLocation
        ? [initialLocation.longitude, initialLocation.latitude]
        : [-74.006, 40.7128], // Default to NYC if no initialLocation
      zoom: 12,
    });

    // Add navigation controls (zoom buttons)
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Initialize Geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl,
      marker: false, // We'll handle markers manually
      placeholder: 'Search for places',
    });

    // Add Geocoder to map
    mapRef.current.addControl(geocoder, 'top-left');

    // Handle Geocoder result
    geocoder.on('result', (e) => {
      const [longitude, latitude] = e.result.center;

      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLngLat([longitude, latitude]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
      }

      // Center the map on the selected location
      mapRef.current.flyTo({
        center: [longitude, latitude],
        essential: true,
        speed: 1.2, // Adjust speed for smoother transition
        zoom: 14, // Optional: Adjust zoom level if needed
      });

      // Notify parent component
      onSelectLocation({ latitude, longitude });
    });

    // Handle map click to set marker
    mapRef.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;

      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: 'red' })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      }

      // Center the map on the clicked location
      mapRef.current.flyTo({
        center: [lng, lat],
        essential: true,
        speed: 1.2, // Adjust speed for smoother transition
        zoom: 14, // Optional: Adjust zoom level if needed
      });

      // Notify parent component
      onSelectLocation({ latitude: lat, longitude: lng });
    });

    // Add initial marker if initialLocation exists
    if (initialLocation) {
      markerRef.current = new mapboxgl.Marker({ color: 'green' })
        .setLngLat([initialLocation.longitude, initialLocation.latitude])
        .addTo(mapRef.current);
    }

    // Cleanup on unmount
    return () => {
      mapRef.current.remove();
    };
  }, [MAPBOX_TOKEN]); // Run only once on mount

  useEffect(() => {
    if (initialLocation && mapRef.current) {
      const { latitude, longitude } = initialLocation;

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setLngLat([longitude, latitude]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: 'green' })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
      }

      // Center the map on the initial location
      mapRef.current.flyTo({
        center: [longitude, latitude],
        essential: true,
        speed: 1.2,
        zoom: 14,
      });
    }
  }, [initialLocation]); // Update when initialLocation prop changes

  return (
    <div style={{ marginBottom: '20px' }}>
      <label>{label}</label>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '400px', borderRadius: '8px' }}
      />
    </div>
  );
};

export default MapPicker;
