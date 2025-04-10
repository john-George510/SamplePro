// frontend/src/redux/slices/bookingSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.baseURL = "http://localhost:5000";

// Create thunks as constants first
const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;

      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get('/api/bookings/all', config);

      const currentTime = new Date();
      
      // Update booking status based on expiration time if not assigned
      data.forEach((booking) => {
        if (booking.status !== 'Pending' || !booking.createdAt || !booking.expiration_time) {
          return booking;
        }
        const expirationTime = new Date(booking.expiration_time);

        const timeRemaining = expirationTime - currentTime;

        const basePrice = booking.price - (booking.insurance_supported ? 500 : 0);

        if (timeRemaining <= 0) {
          booking.price = basePrice * 2 + (booking.insurance_supported ? 500 : 0); // Double the price if expired
        } else if (timeRemaining <= 60 * 60 * 1000) { // Less than 1 hour remaining
          booking.price = basePrice * 1.5 + (booking.insurance_supported ? 500 : 0); // Increase price by 50%
        } else if (timeRemaining <= 6 * 60 * 60 * 1000) { // Less than 6 hours remaining
          booking.price = basePrice * 1.3 + (booking.insurance_supported ? 500 : 0); // Increase price by 30%
        } else if (timeRemaining <= 24 * 60 * 60 * 1000) { // Less than 24 hours remaining
          booking.price = basePrice * 1.2 + (booking.insurance_supported ? 500 : 0); // Increase price by 20%
        } else {
          booking.price = basePrice + (booking.insurance_supported ? 500 : 0); // No increase
        }
      });

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const acceptBooking = createAsyncThunk(
  'bookings/acceptBooking',
  async (bookingId, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;
      const user = getState().user;
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(`/api/bookings/${bookingId}/assign`, { 
        status: 'Assigned', 
        driver: user.id
      }, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const fetchNearbyBookings = createAsyncThunk(
  'bookings/fetchNearbyBookings',
  async ({ latitude, longitude }, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;

      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          latitude,
          longitude,
        },
      };
      const { data } = await axios.get('/api/bookings/all', config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token;

      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.post('/api/bookings', bookingData, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Define the combine booking slice
export const combineBooking = createAsyncThunk(
  'bookings/combine',
  async (bookingData, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token; // Correctly accessing token directly

      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.post('/api/bookings/combine', bookingData, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);


const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    status: 'idle',
    createStatus: 'idle',
    error: null,
  },
  reducers: {
    resetBookingStatus: (state) => {
      state.status = 'idle';
      state.createStatus = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.createStatus = 'loading';
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserBookings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchNearbyBookings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNearbyBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookings = action.payload;
      })
      .addCase(fetchNearbyBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(acceptBooking.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.bookings.findIndex((booking) => booking._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(acceptBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Export actions and thunks
export const { resetBookingStatus } = bookingSlice.actions;
export { fetchUserBookings, acceptBooking, fetchNearbyBookings, createBooking };

// Export reducer
export default bookingSlice.reducer;

