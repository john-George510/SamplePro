import api from './api';

const createBooking = (bookingData) => api.post('/api/bookings', bookingData);

const getUserBookings = () => api.get('/api/bookings');

// Combine two bookings into a single route
export const combineBookings = async (booking1Id, booking2Id) => {
  return api.post('/api/bookings/combine', {
    booking1Id,
    booking2Id
  });
};

export default { createBooking, getUserBookings };
