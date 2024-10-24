import React, { useEffect, useState, useContext, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import throttle from 'lodash/throttle';
import BookingForm from '../components/Booking/BookingForm';
import BookingList from '../components/Booking/BookingList';
import FleetManagement from '../components/Admin/FleetManagement';
import TrackModal from '../components/Booking/TrackModal';
import {
  fetchUserBookings,
  fetchNearbyBookings,
} from '../redux/slices/bookingSlice';
import { SocketContext } from '../context/SocketContext';

const Dashboard = () => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext);
  const userRole = useSelector((state) => state.user.role);
  const bookings = useSelector((state) => state.bookings.bookings);
  const user = useSelector((state) => state.user);

  const [driverLocation, setDriverLocation] = useState(null);
  const [trackingBookingId, setTrackingBookingId] = useState(null);
  const [isTracking, setIsTracking] = useState(false); // To toggle tracking
  const lastLocation = useRef(null); // Store the last known location

  const decodedToken = jwtDecode(user.token);
  const userId = decodedToken.userId || decodedToken.id;
  const joinedRooms = useRef(new Set());
  console.log('Decoded user ID:', userId);

  // Throttle function to send location updates at intervals
  const emitThrottledLocation = throttle((bookingId, latitude, longitude) => {
    socket.emit('driverLocationUpdate', {
      bookingId,
      driverId: userId,
      coordinates: { latitude, longitude },
    });
    console.log(`Location update emitted for booking ID: ${bookingId}`);
    lastLocation.current = { latitude, longitude };
  }, 15000);

  useEffect(() => {
    if (userRole === 'driver' && socket && socket.connected) {
      bookings.forEach((booking) => {
        if (
          booking.status === 'Assigned' &&
          booking.driver &&
          booking.driver.toString() === userId &&
          !joinedRooms.current.has(booking._id)
        ) {
          console.log(
            `Emitting joinBookingRoom event for booking: ${booking._id}`
          );
          socket.emit('joinBookingRoom', { bookingId: booking._id });
          joinedRooms.current.add(booking._id);
        }
      });
    }
  }, [userRole, bookings, socket, userId]);

  // Fetch bookings based on user role
  useEffect(() => {
    if (userRole === 'user') {
      dispatch(fetchUserBookings());
    } else if (userRole === 'driver') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setDriverLocation({ latitude, longitude });
            dispatch(fetchNearbyBookings({ latitude, longitude }));
          },
          (error) => console.error('Geolocation error:', error),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    }
  }, [userRole, dispatch, bookings, userId, socket]);

  // Emit location updates only when tracking is active
  useEffect(() => {
    let watchId;

    if (userRole === 'driver' && socket) {
      console.log('Driver connected, starting location watch...');

      // Watch the driver's location continuously
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Driver position updated:', { latitude, longitude });

          setDriverLocation({ latitude, longitude });

          // Emit location update to the assigned booking room
          bookings.forEach((booking) => {
            if (
              booking.status === 'Assigned' &&
              booking.driver &&
              booking.driver.toString() === userId
            ) {
              socket.emit('driverLocationUpdate', {
                bookingId: booking._id,
                driverId: userId,
                coordinates: { latitude, longitude },
              });
              console.log(`Location emitted for booking ${booking._id}`);
            }
          });
        },
        (error) => console.error('Error watching driver position:', error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [userRole, bookings, socket, userId]);

  const handleTrack = (bookingId) => {
    setTrackingBookingId(bookingId);
    setIsTracking(true); // Enable tracking

    if (socket && socket.connected) {
      socket.emit('joinBookingRoom', { bookingId });
      console.log(`Driver joined booking room: ${bookingId}`);
    } else {
      console.error('Socket not connected. Cannot join room.');
    }
  };

  const handleCloseTrack = () => {
    setIsTracking(false); // Disable tracking
    if (trackingBookingId) {
      socket.emit('leaveBookingRoom', { bookingId: trackingBookingId });
      setTrackingBookingId(null);
      console.log(`Tracking stopped for booking ID: ${trackingBookingId}`);
    }
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Distance in meters
  };

  if (userRole === 'user') {
    return (
      <div style={{ padding: '20px' }}>
        <h2>User Dashboard</h2>
        <BookingForm />
        {bookings.length > 0 ? (
          <BookingList bookings={bookings} onTrack={handleTrack} />
        ) : (
          <p>No bookings found.</p>
        )}
        {trackingBookingId && (
          <TrackModal
            bookingId={trackingBookingId}
            onClose={handleCloseTrack}
          />
        )}
      </div>
    );
  } else if (userRole === 'admin') {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Admin Dashboard</h2>
        <FleetManagement />
      </div>
    );
  } else if (userRole === 'driver') {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Driver Dashboard</h2>
        {driverLocation ? (
          <BookingList bookings={bookings} />
        ) : (
          <p>Fetching your location...</p>
        )}
      </div>
    );
  } else {
    return <h2>Unknown Role</h2>;
  }
};

export default Dashboard;
