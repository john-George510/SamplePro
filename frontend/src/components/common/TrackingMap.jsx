// src/components/common/TrackingMap.jsx

import React from 'react';
import ReactMapGL, { Marker } from 'react-map-gl';

const TrackingMap = ({ bookingId }) => {
  // Placeholder coordinates; in a real application, you'd fetch the driver's location based on bookingId
  const driverLocation = {
    latitude: 40.73061,
    longitude: -73.935242,
  };

  return (
    <div>
      <h4>Tracking Map for Booking ID: {bookingId}</h4>
      <ReactMapGL
        latitude={driverLocation.latitude}
        longitude={driverLocation.longitude}
        zoom={12}
        width="100%"
        height="400px"
        mapboxAccessToken={"pk.eyJ1IjoiYWRpdHJhbWRhcyIsImEiOiJjbTJoZTVpa20wN2F3MmpzM3F2a2M3ZWNxIn0.ePD_ugk2QndekxDHx3ryhA"}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        <Marker latitude={driverLocation.latitude} longitude={driverLocation.longitude}>
          <div
            style={{
              backgroundColor: 'blue',
              borderRadius: '50%',
              width: '12px',
              height: '12px',
              cursor: 'pointer',
            }}
          ></div>
        </Marker>
      </ReactMapGL>
    </div>
  );
};

export default TrackingMap;
