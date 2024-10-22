import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import bookingReducer from './slices/bookingSlice';
import fleetReducer from './slices/fleetSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    bookings: bookingReducer,
    fleet: fleetReducer,
  },
});

export default store;
