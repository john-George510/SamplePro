// frontend/src/pages/Dashboard.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import BookingForm from '../components/Booking/BookingForm';
import BookingList from '../components/Booking/BookingList';
import FleetManagement from '../components/Admin/FleetManagement';
import TrackModal from '../components/Booking/TrackModal';
import {
  fetchUserBookings,
  fetchNearbyBookings,
} from '../redux/slices/bookingSlice';
import { SocketContext } from '../context/SocketContext'; // Ensure correct import

const Dashboard = () => {
  const dispatch = useDispatch();
  const socket = useContext(SocketContext); // Access the socket instance
  const userRole = useSelector((state) => state.user.role);
  const bookingStatus = useSelector((state) => state.bookings.status);
  const error = useSelector((state) => state.bookings.error);
  const bookings = useSelector((state) => state.bookings.bookings);
  const user = useSelector((state) => state.user);

  const [driverLocation, setDriverLocation] = useState(null);
  const [trackingBookingId, setTrackingBookingId] = useState(null); // To track which booking is being tracked

  // Decode the JWT token to get userId
  const decodedToken = jwtDecode(user.token);
  const userId = decodedToken.userId || decodedToken.id; // Adjust based on JWT payload
  console.log('Decoded user ID:', userId);

  // Log the user object to inspect its structure
  console.log('User object:', user);

  useEffect(() => {
    if (userRole === 'user') {
      dispatch(fetchUserBookings());
      console.log('User role:', userRole);
      console.log('Bookings from dashboard:', bookings);
    } else if (userRole === 'driver') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setDriverLocation({ latitude, longitude });
            dispatch(fetchNearbyBookings({ latitude, longitude }));
            console.log(`Driver's initial location: ${latitude}, ${longitude}`);
          },
          (error) => {
            console.error('Error getting location:', error);
            // Optionally, display an error message to the driver
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
        // Optionally, display an error message to the driver
      }
    }
  }, [dispatch, userRole]);

  // Effect to emit location updates
  useEffect(() => {
    if (userRole === 'driver' && driverLocation && socket) {
      // Use watchPosition to continuously track the driver's location
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDriverLocation({ latitude, longitude });
          console.log(`Updated driver location: ${latitude}, ${longitude}`);

          // Emit location update to the server for each assigned booking
          bookings.forEach((booking, index) => {
            console.log(`Processing booking at index ${index}:`, booking);
            if (
              booking.status === 'Assigned' &&
              booking.driver &&
              booking.driver.toString() === userId.toString()
            ) {
              socket.emit('driverLocationUpdate', {
                bookingId: booking._id,
                driverId: userId,
                coordinates: { latitude, longitude },
              });
              console.log(
                `Emitted location update for booking ID: ${booking._id}`
              );

              // Ensure driver joins the booking room
              socket.emit('joinBookingRoom', { bookingId: booking._id });
              console.log(`Driver joined booking room: ${booking._id}`);
            } else {
              console.log(`Skipping booking ID: ${booking._id}`);
            }
          });
        },
        (error) => {
          console.error('Error watching position:', error);
          // Optionally, display an error message to the driver
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000, // Update every 10 seconds
          timeout: 5000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        console.log('Cleared geolocation watch');
      };
    }
  }, [driverLocation, bookings, userRole, userId, socket]);

  // Effect to ensure driver joins all assigned booking rooms on load
  useEffect(() => {
    if (userRole === 'driver' && bookings.length > 0 && socket) {
      bookings.forEach((booking) => {
        if (
          booking.status === 'Assigned' &&
          booking.driver &&
          booking.driver.toString() === userId.toString()
        ) {
          socket.emit('joinBookingRoom', { bookingId: booking._id });
          console.log(`Driver joined booking room: ${booking._id}`);
        }
      });
    }
  }, [userRole, bookings, userId, socket]);

  const handleTrack = (bookingId) => {
    setTrackingBookingId(bookingId);
    // Join the booking room for real-time updates
    socket.emit('joinBookingRoom', { bookingId: bookingId });
    console.log(`Joined booking room: ${bookingId}`);
  };

  const handleCloseTrack = () => {
    if (trackingBookingId && socket) {
      socket.emit('leaveBookingRoom', { bookingId: trackingBookingId });
      console.log(`Left booking room: ${trackingBookingId}`);
      setTrackingBookingId(null);
    }
  };

  if (bookingStatus === 'loading') return <p>Loading bookings...</p>;
  if (bookingStatus === 'failed') return <p>Error: {error}</p>;

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
