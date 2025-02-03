// frontend/src/redux/slices/bookingSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.baseURL = "http://localhost:5000";
// Fetch user bookings
export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token; // Correctly accessing token directly

      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
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

// Accept a booking
export const acceptBooking = createAsyncThunk(
  'bookings/acceptBooking',
  async (bookingId, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token; // Correctly accessing token directly
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
        driver: user.id // Ensure the driver ID is sent correctly 
      }, config); // Empty body
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

// Fetch nearby bookings for driver
export const fetchNearbyBookings = createAsyncThunk(
  'bookings/fetchNearbyBookings',
  async ({ latitude, longitude }, { getState, rejectWithValue }) => {
    try {
      const token = getState().user.token; // Correctly accessing token directly

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

// Create a new booking
export const createBooking = createAsyncThunk(
  'bookings/createBooking',
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

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    // Add synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      // Handle createBooking lifecycle
      .addCase(createBooking.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookings.unshift(action.payload); // Add the new booking to the top
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // Handle fetchUserBookings lifecycle
    builder
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
      });

    // Handle fetchNearbyBookings lifecycle
    builder
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
      });

    // Handle acceptBooking lifecycle
    builder
      .addCase(acceptBooking.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the specific booking in the bookings array
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

// Default export (reducer)
export default bookingSlice.reducer;

// Named exports (thunks)
// export { fetchUserBookings, acceptBooking, fetchNearbyBookings, createBooking };
