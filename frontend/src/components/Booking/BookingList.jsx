// frontend/src/components/Booking/BookingList.jsx

import React from 'react';
import BookingCard from './BookingCard';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

const BookingList = ({ bookings, onTrack }) => {
  const user = useSelector((state) => state.user);
  const role = user.role;

  const decodedToken = jwtDecode(user.token); // Decode the JWT
  const userId = decodedToken.userId;

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
            showAcceptButton={role === 'driver'} // Show accept button only for drivers
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
