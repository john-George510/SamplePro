// src/components/common/MapPicker.jsx

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const MAPBOX_TOKEN = "pk.eyJ1IjoiYWRpdHJhbWRhcyIsImEiOiJjbTJoZTVpa20wN2F3MmpzM3F2a2M3ZWNxIn0.ePD_ugk2QndekxDHx3ryhA";

const MapPicker = ({ label, onSelectLocation, initialLocation, height = 400 }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token is not set. Please add it to your .env file.');
      return;
    }

    // Initialize Mapbox map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: initialLocation
        ? [initialLocation.longitude, initialLocation.latitude]
        : [-74.006, 40.7128],
      zoom: 12,
    });

    // Add navigation controls (zoom buttons)
    mapRef.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'top-right'
    );

    // Initialize Geocoder with custom styling
    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: 'Search for places',
      countries: 'in', // Limit to India
      bbox: [68.1766451354, 7.96553477623, 97.4025614766, 35.4940095078], // India bounds
    });

    // Add Geocoder to map
    mapRef.current.addControl(geocoder, 'top-left');

    // Handle Geocoder result
    geocoder.on('result', (e) => {
      const [longitude, latitude] = e.result.center;
      updateMarkerAndLocation(longitude, latitude);
    });

    // Handle map click to set marker
    mapRef.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      updateMarkerAndLocation(lng, lat);
    });

    // Add initial marker if initialLocation exists
    if (initialLocation) {
      markerRef.current = new mapboxgl.Marker({ color: '#0066FF' })
        .setLngLat([initialLocation.longitude, initialLocation.latitude])
        .addTo(mapRef.current);
    }

    // Helper function to update marker and notify parent
    const updateMarkerAndLocation = (lng, lat) => {
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: '#0066FF' })
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      }

      mapRef.current.flyTo({
        center: [lng, lat],
        essential: true,
        speed: 1.2,
        zoom: 14,
      });

      onSelectLocation({ latitude: lat, longitude: lng });
    };

    // Cleanup on unmount
    return () => {
      mapRef.current.remove();
    };
  }, [MAPBOX_TOKEN]); // Run only once on mount

  useEffect(() => {
    if (initialLocation && mapRef.current) {
      const { latitude, longitude } = initialLocation;

      if (markerRef.current) {
        markerRef.current.setLngLat([longitude, latitude]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: '#0066FF' })
          .setLngLat([longitude, latitude])
          .addTo(mapRef.current);
      }

      mapRef.current.flyTo({
        center: [longitude, latitude],
        essential: true,
        speed: 1.2,
        zoom: 14,
      });
    }
  }, [initialLocation]);

  return (
    <div style={{ marginBottom: label ? '20px' : '0' }}>
      {label && <label>{label}</label>}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: `${height}px`,
          borderRadius: '8px',
          border: '1px solid var(--border)',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

export default MapPicker;
