// src/components/Booking/BookingList.jsx

import React from 'react';
import BookingCard from './BookingCard';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode'; // Corrected import

const BookingList = ({ bookings, onTrack, driverLocation }) => {
  const user = useSelector((state) => state.user);
  const role = user.role;

  let userId = null;
  if (user.token) {
    try {
      const decodedToken = jwtDecode(user.token); // Corrected usage
      userId = decodedToken.userId;
    } catch (error) {
      console.error('Invalid token:', error);
    }
  }

  console.log('userId', typeof userId);
  if (!bookings || bookings.length === 0) return <p>No bookings available.</p>;
  console.log('bookings', bookings);

  const filteredBookings =
    role === 'driver'
      ? bookings // Show all bookings for drivers
      : bookings.filter((booking) => booking.user === userId);

  return (
    <div>
      <h3>Bookings</h3>
      {filteredBookings.length > 0 ? (
        filteredBookings.map((booking) => (
          <BookingCard
            key={booking._id}
            booking={booking}
            driverLocation={driverLocation}
            showAcceptButton={role === 'driver'}
            onTrack={onTrack}
          />
        ))
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
