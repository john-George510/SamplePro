// src/components/Booking/BookingList.jsx

import React from 'react';
import BookingCard from './BookingCard';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { combineBookings } from '../../services/bookingService';

const BookingList = ({ bookings, onTrack, driverLocation, onBookingsUpdate, isOnline }) => {
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
      console.error('Error combining routes:', error);
    }
  };

  const filteredBookings = bookings || [];

  if (role === 'driver') {
    const activeBookings = filteredBookings.filter(booking => 
      ['Assigned', 'On the way'].includes(booking.status)
    );

    const availableBookings = filteredBookings.filter(booking => 
      booking.status === 'Pending'
    );

    const pastBookings = filteredBookings.filter(booking => 
      ['Completed', 'Cancelled', 'Expired'].includes(booking.status)
    );

    return (
      <div className="p-6">
        {/* Active Bookings Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Active Bookings</h3>
          <div className="space-y-4">
            {activeBookings.length > 0 ? (
              activeBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  driverLocation={driverLocation}
                  showAcceptButton={false}
                  onTrack={onTrack}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                No active bookings
              </div>
            )}
          </div>
        </div>

        {/* Available Bookings Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Available Bookings</h3>
          {!isOnline ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
              Go online to view and accept bookings
            </div>
          ) : (
            <div className="space-y-4">
              {availableBookings.length > 0 ? (
                availableBookings.map((booking) => {
                  // Filter out the current booking and only show pending bookings for route combination
                  const otherBookings = filteredBookings.filter(
                    (otherBooking) =>
                      otherBooking._id !== booking._id &&
                      otherBooking.status === 'Pending'
                  );
                  return (
                    <BookingCard
                      key={booking._id}
                      booking={booking}
                      driverLocation={driverLocation}
                      showAcceptButton={true}
                      onTrack={onTrack}
                      otherBookings={otherBookings}
                      onCombineRoutes={handleCombineRoutes}
                    />
                  );
                })
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                  No available bookings
                </div>
              )}
            </div>
          )}
        </div>

        {/* Past Bookings Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Past Bookings</h3>
          <div className="space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  driverLocation={driverLocation}
                  showAcceptButton={false}
                  onTrack={onTrack}
                />
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
                No past bookings
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User view
  return (
    <div className="space-y-4">
      {filteredBookings.map((booking) => (
        <BookingCard
          key={booking._id}
          booking={booking}
          showAcceptButton={false}
          onTrack={onTrack}
          driverLocation={driverLocation}
        />
      ))}
    </div>
  );
};

export default BookingList;
