// src/components/Admin/AdminBookings.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllBookings } from '../../redux/slices/fleetSlice';

const AdminBookings = () => {
  const dispatch = useDispatch();
  const bookings = useSelector((state) => state.fleet.bookings);
  const status = useSelector((state) => state.fleet.status);
  const error = useSelector((state) => state.fleet.error);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAllBookings());
    }
  }, [status, dispatch]);

  if (status === 'loading') return <p>Loading bookings...</p>;
  if (status === 'failed') return <p>Error: {error}</p>;

  return (
    <div>
      <h2>All Bookings</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Driver</th>
            <th>Status</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking._id}>
              <td>{booking._id}</td>
              <td>{booking.userId.name}</td>
              <td>{booking.driverId ? booking.driverId.name : 'Unassigned'}</td>
              <td>{booking.status}</td>
              <td>${booking.estimatedCost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookings;
