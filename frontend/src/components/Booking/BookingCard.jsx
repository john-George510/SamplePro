// frontend/src/components/Booking/BookingCard.jsx

import React from 'react';
import { useDispatch } from 'react-redux';
import { acceptBooking } from '../../redux/slices/bookingSlice';

const BookingCard = ({ booking }) => {
  const dispatch = useDispatch();

  const handleAccept = () => {
    dispatch(acceptBooking(booking._id))
      .unwrap()
      .then(() => {
        alert('Booking accepted successfully!');
      })
      .catch((err) => {
        alert(`Error accepting booking: ${err}`);
      });
  };

  const getCoordinate = (coordinate) =>
    coordinate ? coordinate.toFixed(4) : 'N/A';

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '10px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      }}
    >
      <p>
        <strong>Booking ID:</strong> {booking._id}
      </p>
      <p>
        <strong>Pickup:</strong>{' '}
        {getCoordinate(booking.pickupLocation?.coordinates[1])},{' '}
        {getCoordinate(booking.pickupLocation?.coordinates[0])}
      </p>
      <p>
        <strong>Dropoff:</strong>{' '}
        {getCoordinate(booking.dropoffLocation?.coordinates[1])},{' '}
        {getCoordinate(booking.dropoffLocation?.coordinates[0])}
      </p>
      <p>
        <strong>Vehicle Type:</strong> {booking.vehicleType}
      </p>
      <p>
        <strong>Distance:</strong>{' '}
        {booking.distance ? `${booking.distance.toFixed(2)} km` : 'N/A'}
      </p>
      <p>
        <strong>Price:</strong>{' '}
        {booking.price ? `$${booking.price.toFixed(2)}` : 'N/A'}
      </p>
      <p>
        <strong>Status:</strong> {booking.status}
      </p>
      {booking.status === 'Pending' && (
        <button
          onClick={handleAccept}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Accept Booking
        </button>
      )}
    </div>
  );
};

export default BookingCard;
