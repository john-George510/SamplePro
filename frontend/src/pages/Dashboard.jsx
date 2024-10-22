// frontend/src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BookingForm from '../components/Booking/BookingForm';
import BookingList from '../components/Booking/BookingList';
import FleetManagement from '../components/Admin/FleetManagement';
import {
  fetchUserBookings,
  fetchNearbyBookings,
} from '../redux/slices/bookingSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.user.role); // Adjust based on your state structure
  const bookingStatus = useSelector((state) => state.bookings.status);
  const error = useSelector((state) => state.bookings.error);
  const bookings = useSelector((state) => state.bookings.bookings);

  const [driverLocation, setDriverLocation] = useState(null);

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

  if (bookingStatus === 'loading') return <p>Loading bookings...</p>;
  if (bookingStatus === 'failed') return <p>Error: {error}</p>;

  if (userRole === 'user') {
    return (
      <div style={{ padding: '20px' }}>
        <h2>User Dashboard</h2>
        <BookingForm />
        {bookings.length > 0 ? (
          <BookingList bookings={bookings} />
        ) : (
          <p>No bookings found.</p>
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
