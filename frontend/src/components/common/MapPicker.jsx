// src/components/common/MapPicker.jsx

import React, { useState, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const MapPicker = ({ label, onSelectLocation, initialLocation }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const [marker, setMarker] = useState(initialLocation || null);
  const [viewport, setViewport] = useState({
    latitude: initialLocation ? initialLocation.latitude : 40.7128, // Default to NYC
    longitude: initialLocation ? initialLocation.longitude : -74.006,
    zoom: 12,
  });

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.error(
        'Mapbox token is not set. Please add it to your .env file.',
      );
      return;
    }
    mapboxgl.accessToken = MAPBOX_TOKEN;
    // Initialize Mapbox map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom,
    });

    // Add navigation control (the +/- zoom buttons)
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

      // Remove existing markers
      const existingMarkers = document.querySelectorAll('.marker');
      existingMarkers.forEach((marker) => marker.remove());

      // Add a new marker
      new mapboxgl.Marker({ color: 'blue' })
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current);

      // Fly to the selected location
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 14,
        speed: 2,
        curve: 1.42,
      });

      // Update state
      setMarker({ latitude, longitude });
      onSelectLocation({ latitude, longitude });
    });

    // Handle map click to set marker
    mapRef.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;

      // Remove existing markers
      const existingMarkers = document.querySelectorAll('.marker');
      existingMarkers.forEach((marker) => marker.remove());

      // Add a new marker
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      // Update state
      setMarker({ latitude: lat, longitude: lng });
      onSelectLocation({ latitude: lat, longitude: lng });
    });

    // Add initial marker if exists
    if (marker) {
      new mapboxgl.Marker({ color: 'green' })
        .setLngLat([marker.longitude, marker.latitude])
        .addTo(mapRef.current);
    }

    // Cleanup on unmount
    return () => {
      mapRef.current.remove();
    };
  }, [
    MAPBOX_TOKEN,
    initialLocation,
    onSelectLocation,
    marker,
    viewport.latitude,
    viewport.longitude,
    viewport.zoom,
  ]);

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
