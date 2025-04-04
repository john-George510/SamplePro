// src/components/Booking/BookingList.jsx

import React from 'react';
import BookingCard from './BookingCard';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { combineBookings } from '../../services/bookingService';

const BookingList = ({ bookings, onTrack, driverLocation, onBookingsUpdate }) => {
  const user = useSelector((state) => state.user);
  const role = user.role;

  let userId = null;
  if (user.token) {
    try {
      const decodedToken = jwtDecode(user.token);
      userId = decodedToken.userId;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  const handleCombineRoutes = async (booking1Id, booking2Id) => {
    try {
      await combineBookings(booking1Id, booking2Id);
      // Notify parent component to refresh bookings
      if (onBookingsUpdate) {
        onBookingsUpdate();
      }
    } catch (error) {
    }
  };

  const filteredBookings =
    role === 'driver'
      ? bookings // Show all bookings for drivers
      : bookings.filter((booking) => booking.user === userId);

  return (
    <div className="booking-list">
      <h3>Bookings</h3>
      {filteredBookings.length > 0 ? (
        filteredBookings.map((booking) => {
          console.log('bookings', bookings);
          // Filter out the current booking and only show pending bookings for route combination
          const otherBookings = bookings.filter(
            (otherBooking) =>
              otherBooking._id !== booking._id &&
              otherBooking.status === 'Pending'
          );
          console.log('otherBookings', otherBookings);
          return (
            <BookingCard
              key={booking._id}
              booking={booking}
              showAcceptButton={booking.status === 'Pending' && role === 'driver'}
              onTrack={onTrack}
              driverLocation={driverLocation}
              otherBookings={booking.status === 'Pending' ? otherBookings : []}
              onCombineRoutes={handleCombineRoutes}
            />
          );
        })
      ) : (
        <p>
          {role === 'driver'
            ? 'No bookings available.'
            : 'You have no bookings.'}
        </p>
      )}
    </div>
  );
};

export default BookingList;
