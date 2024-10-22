// frontend/src/components/Booking/BookingList.jsx

import React from 'react';
import BookingCard from './BookingCard';

const BookingList = ({ bookings }) => {
  if (!bookings || bookings.length === 0) return <p>No bookings available.</p>;
  console.log(bookings);
  return (
    <div>
      <h3>Bookings</h3>
      {bookings.map((booking) => (
        <BookingCard key={booking._id} booking={booking} />
      ))}
    </div>
  );
};

export default BookingList;
