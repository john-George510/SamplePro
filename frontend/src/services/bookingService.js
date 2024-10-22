import api from './api';

const createBooking = (bookingData) => api.post('/bookings', bookingData);

const getUserBookings = () => api.get('/bookings');

export default { createBooking, getUserBookings };
