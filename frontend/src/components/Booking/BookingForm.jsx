// src/components/Booking/BookingForm.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking } from '../../redux/slices/bookingSlice';
import MapPicker from '../common/MapPicker';

const BookingForm = () => {
  const dispatch = useDispatch();

  // Access necessary state
  const token = useSelector((state) => state.user.token);
  const bookingStatus = useSelector((state) => state.bookings.status);
  const bookingError = useSelector((state) => state.bookings.error);

  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [vehicleType, setVehicleType] = useState('small');

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPickupLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set a default location if geolocation fails
          setPickupLocation({ latitude: 40.7128, longitude: -74.006 }); // New York
        }
      );
    } else {
      // Geolocation not supported
      setPickupLocation({ latitude: 40.7128, longitude: -74.006 }); // New York
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickupLocation || !dropoffLocation) {
      alert('Please select both pickup and dropoff locations.');
      return;
    }
    console.log(pickupLocation, dropoffLocation, vehicleType);
    // Check if user is authenticated
    if (!token) {
      alert('You must be logged in to create a booking.');
      return;
    }

    const bookingData = {
      pickupLocation: {
        type: 'Point',
        coordinates: [pickupLocation.longitude, pickupLocation.latitude],
      },
      dropoffLocation: {
        type: 'Point',
        coordinates: [dropoffLocation.longitude, dropoffLocation.latitude],
      },
      vehicleType,
    };

    dispatch(createBooking(bookingData));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Create a Booking</h3>
      <div style={{ marginBottom: '20px' }}>
        <h4>Pickup Location</h4>
        {pickupLocation ? (
          <MapPicker
            label="Pickup Location"
            onSelectLocation={setPickupLocation}
            initialLocation={pickupLocation}
          />
        ) : (
          <p>Loading pickup location...</p>
        )}
      </div>
      <div style={{ marginBottom: '20px' }}>
        <h4>Dropoff Location</h4>
        <MapPicker
          label="Dropoff Location"
          onSelectLocation={setDropoffLocation}
          initialLocation={dropoffLocation}
        />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="vehicleType">Vehicle Type:</label>
        <select
          id="vehicleType"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <button type="submit" disabled={bookingStatus === 'loading'}>
        {bookingStatus === 'loading' ? 'Creating...' : 'Create Booking'}
      </button>
      {bookingStatus === 'failed' && (
        <p style={{ color: 'red' }}>{bookingError}</p>
      )}
      {bookingStatus === 'succeeded' && (
        <p style={{ color: 'green' }}>Booking created successfully!</p>
      )}
    </form>
  );
};

export default BookingForm;
