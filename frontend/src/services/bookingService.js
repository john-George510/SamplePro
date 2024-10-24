import api from './api';

const createBooking = (bookingData) => api.post('/api/bookings', bookingData);

const getUserBookings = () => api.get('/api/bookings');

export default { createBooking, getUserBookings };
