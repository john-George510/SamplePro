// src/components/Booking/BookingCard.jsx

import React, { useState, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { acceptBooking } from '../../redux/slices/bookingSlice';
import { SocketContext } from '../../context/SocketContext';
import TrackModal from './TrackModal';
import debounce from 'lodash/debounce';

// Ensure Mapbox CSS is imported
import 'mapbox-gl/dist/mapbox-gl.css';

const BookingCard = ({
  booking,
  showAcceptButton,
  onTrack,
  driverLocation,
}) => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);

  const [isTracking, setIsTracking] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [distanceBetweenLocations, setDistanceBetweenLocations] =
    useState(null);
  const [distanceToPickup, setDistanceToPickup] = useState(null);

  const addressCache = useRef({}); // To cache addresses and reduce API calls

  const role = useSelector((state) => state.user.role); // Access role from Redux

  // Function to perform reverse geocoding with caching
  const reverseGeocode = async (longitude, latitude) => {
    const key = `${latitude},${longitude}`;
    if (addressCache.current[key]) {
      console.log(`Address fetched from cache for coordinates: ${key}`);
      return addressCache.current[key];
    }
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        addressCache.current[key] = address; // Cache the result
        console.log(`Address fetched from API for coordinates: ${key}`);
        return address;
      }
      return 'Unknown location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Unknown location';
    }
  };

  // Fetch addresses when booking is loaded
  useEffect(() => {
    const fetchAddresses = async () => {
      if (booking.pickupLocation && booking.pickupLocation.coordinates) {
        const [pickupLongitude, pickupLatitude] =
          booking.pickupLocation.coordinates;
        console.log('Fetching pickup address...');
        const address = await reverseGeocode(pickupLongitude, pickupLatitude);
        setPickupAddress(address);
        console.log('Pickup address set:', address);
      }

      if (booking.dropoffLocation && booking.dropoffLocation.coordinates) {
        const [dropoffLongitude, dropoffLatitude] =
          booking.dropoffLocation.coordinates;
        console.log('Fetching dropoff address...');
        const address = await reverseGeocode(dropoffLongitude, dropoffLatitude);
        setDropoffAddress(address);
        console.log('Dropoff address set:', address);
      }
    };

    fetchAddresses();
  }, [booking]);

  // Function to calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2); // Distance in km
  };

  // Debounced distance calculation between Pickup and Dropoff
  const debouncedCalculateDistanceBetween = useRef(
    debounce((lat1, lon1, lat2, lon2) => {
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      console.log(`Distance between Pickup and Dropoff: ${distance} km`);
      setDistanceBetweenLocations(distance);
    }, 500)
  ).current;

  // Debounced distance calculation from Driver to Pickup
  const debouncedCalculateDistanceToPickup = useRef(
    debounce((lat1, lon1, lat2, lon2) => {
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      console.log(`Distance from Driver to Pickup: ${distance} km`);
      setDistanceToPickup(distance);
    }, 500)
  ).current;

  // Calculate distance between Pickup and Dropoff
  useEffect(() => {
    console.log('Pickup coordinates', booking.pickupLocation.coordinates);
    if (
      booking.pickupLocation &&
      booking.pickupLocation.coordinates &&
      booking.dropoffLocation &&
      booking.dropoffLocation.coordinates
    ) {
      const [pickupLongitude, pickupLatitude] =
        booking.pickupLocation.coordinates;
      const [dropoffLongitude, dropoffLatitude] =
        booking.dropoffLocation.coordinates;
      console.log('Calculating distances for booking:', booking._id);
      console.log('Pickup:', pickupLatitude, pickupLongitude);
      console.log('Dropoff:', dropoffLatitude, dropoffLongitude);

      // Validate coordinates
      if (
        typeof pickupLatitude !== 'number' ||
        typeof pickupLongitude !== 'number' ||
        typeof dropoffLatitude !== 'number' ||
        typeof dropoffLongitude !== 'number'
      ) {
        console.error('Invalid coordinates for booking:', booking._id);
        setDistanceBetweenLocations('N/A');
        return;
      }

      const distance = calculateDistance(
        pickupLatitude,
        pickupLongitude,
        dropoffLatitude,
        dropoffLongitude
      );
      console.log(`Distance between Pickup and Dropoff: ${distance} km`);
      setDistanceBetweenLocations(distance);
    }
  }, [booking, debouncedCalculateDistanceBetween]);

  // Calculate distance from Driver to Pickup (only for Drivers)
  useEffect(() => {
    if (
      role === 'driver' && // Directly check role
      driverLocation &&
      booking.pickupLocation &&
      booking.pickupLocation.coordinates
    ) {
      const [pickupLongitude, pickupLatitude] =
        booking.pickupLocation.coordinates;
      console.log('Calculating distance from Driver to Pickup...');

      // Validate coordinates
      if (
        typeof driverLocation.latitude !== 'number' ||
        typeof driverLocation.longitude !== 'number' ||
        typeof pickupLatitude !== 'number' ||
        typeof pickupLongitude !== 'number'
      ) {
        console.error(
          'Invalid driver or pickup coordinates for booking:',
          booking._id
        );
        setDistanceToPickup('N/A');
        return;
      }

      debouncedCalculateDistanceToPickup(
        driverLocation.latitude,
        driverLocation.longitude,
        pickupLatitude,
        pickupLongitude
      );
    }
  }, [role, driverLocation, booking, debouncedCalculateDistanceToPickup]);

  const handleTrack = () => {
    setIsTracking(true);
    // Join the booking room for real-time updates
    socket.emit('joinBookingRoom', { bookingId: booking._id });
    console.log(`Joined booking room: ${booking._id}`);
  };

  const handleCloseTrack = () => {
    setIsTracking(false);
    // Optionally, leave the booking room
    socket.emit('leaveBookingRoom', { bookingId: booking._id });
    console.log(`Left booking room: ${booking._id}`);
  };

  const handleAccept = () => {
    dispatch(acceptBooking(booking._id));
    socket.emit('joinBookingRoom', { bookingId: booking._id });
    console.log(`Accepted and joined booking room: ${booking._id}`);
  };

  const handleStatusUpdate = (status) => {
    // Emit status update via Socket.IO
    socket.emit('driverStatusUpdate', { bookingId: booking._id, status });
    console.log(`Booking ${booking._id} status updated to: ${status}`);
    // Optionally, update the booking status in Redux state
  };

  return (
    <div className="booking-card">
      {/* Removed Booking ID Display */}

      <p>
        <strong>Pickup Location:</strong> {pickupAddress}
      </p>
      <p>
        <strong>Dropoff Location:</strong> {dropoffAddress}
      </p>
      <p>
        <strong>Vehicle Type:</strong> {booking.vehicleType}
      </p>

      {/* Display distance between Pickup and Dropoff for all roles */}
      <p>
        <strong>Distance Between Pickup and Dropoff:</strong>{' '}
        {distanceBetweenLocations
          ? `${distanceBetweenLocations} km`
          : 'Calculating...'}
      </p>

      {/* Conditionally display distance from Driver to Pickup for Drivers only */}
      {role === 'driver' && (
        <p>
          <strong>Distance to Pickup:</strong>{' '}
          {distanceToPickup ? `${distanceToPickup} km` : 'Calculating...'}
        </p>
      )}

      <p>
        <strong>Price:</strong>{' '}
        {booking.price ? `$${booking.price.toFixed(2)}` : 'N/A'}
      </p>
      <p>
        <strong>Status:</strong> {booking.status}
      </p>

      {showAcceptButton && booking.status === 'Pending' && (
        <button onClick={handleAccept}>Accept Booking</button>
      )}

      {onTrack && booking.driver && (
        <button className="track-button" onClick={handleTrack}>
          Track Driver
        </button>
      )}

      {showAcceptButton && booking.status === 'Assigned' && (
        <div className="status-buttons">
          <button
            className="status-button"
            onClick={() => handleStatusUpdate('On the way')}
          >
            On the way
          </button>
          <button
            className="status-button"
            onClick={() => handleStatusUpdate('Arrived')}
          >
            Arrived
          </button>
        </div>
      )}

      {isTracking && (
        <TrackModal bookingId={booking._id} onClose={handleCloseTrack} />
      )}
    </div>
  );
};

export default BookingCard;
