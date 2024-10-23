// frontend/src/components/Booking/BookingCard.jsx

import React, { useState, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { acceptBooking } from '../../redux/slices/bookingSlice';
import { SocketContext } from '../../context/SocketContext';
import TrackModal from './TrackModal';

const BookingCard = ({ booking, showAcceptButton, onTrack }) => {
  const dispatch = useDispatch();
  const [isTracking, setIsTracking] = useState(false);
  const socket = useContext(SocketContext);
  const handleTrack = () => {
    setIsTracking(true);
    // Join the booking room for real-time updates
    socket.emit('joinBookingRoom', { bookingId: booking._id });
  };

  const handleCloseTrack = () => {
    setIsTracking(false);
    // Optionally, leave the booking room
    socket.emit('leaveBookingRoom', { bookingId: booking._id });
  };
  const handleAccept = () => {
    dispatch(acceptBooking(booking._id));
    socket.emit('joinBookingRoom', { bookingId: booking._id });
  };

  const getCoordinate = (coordinate) =>
    coordinate ? coordinate.toFixed(4) : 'N/A';

  const handleStatusUpdate = (status) => {
    // Emit status update via Socket.IO
    socket.emit('driverStatusUpdate', { bookingId: booking._id, status });
    console.log(`Booking ${booking._id} status updated to: ${status}`);
    // Optionally, update the booking status in Redux state
  };
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
      {showAcceptButton && booking.status === 'Pending' && (
        <button
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
          onClick={handleAccept}
        >
          Accept Booking
        </button>
      )}

      {onTrack && booking.driver && (
        <button onClick={handleTrack} style={styles.trackButton}>
          Track Driver
        </button>
      )}

      {showAcceptButton && booking.status === 'Assigned' && (
        <div style={styles.statusButtons}>
          <button
            onClick={() => handleStatusUpdate('On the way')}
            style={styles.statusButton}
          >
            On the way
          </button>
          <button
            onClick={() => handleStatusUpdate('Arrived')}
            style={styles.statusButton}
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

const styles = {
  card: {
    border: '1px solid #ddd',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '8px',
  },
  acceptButton: {
    padding: '8px 12px',
    cursor: 'pointer',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    marginRight: '10px',
  },
  trackButton: {
    padding: '8px 12px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
  },
  statusButtons: {
    marginTop: '10px',
  },
  statusButton: {
    padding: '6px 10px',
    cursor: 'pointer',
    backgroundColor: '#ffc107',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    marginRight: '5px',
  },
};

export default BookingCard;
