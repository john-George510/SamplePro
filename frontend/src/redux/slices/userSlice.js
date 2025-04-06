// frontend/src/redux/slices/userSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const initialState = {
  token: sessionStorage.getItem('token') || null,
  role: sessionStorage.getItem('role') || null,
  name: null,
  email: null,
  status: 'idle',
  error: null,
  isOnline: true,
};

export const register = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 400 && error.response.data.message) {
          return rejectWithValue(error.response.data.message);
        }
        if (error.response.status === 409 || 
            (error.response.data && error.response.data.code === 11000)) {
          return rejectWithValue('An account with this email already exists');
        }
        return rejectWithValue(error.response.data.message || 'Registration failed');
      } else if (error.request) {
        // The request was made but no response was received
        return rejectWithValue('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        return rejectWithValue('Error setting up request. Please try again.');
      }
    }
  }
);

export const login = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Login failed');
      }
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.role = null;
      state.name = null;
      state.email = null;
      state.status = 'idle';
      state.error = null;
      state.isOnline = false;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
    },
    clearError(state) {
      state.error = null;
    },
    setOnlineStatus(state, action) {
      state.isOnline = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle register cases
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.status = 'succeeded';
        state.error = null;
        sessionStorage.setItem('token', action.payload.token);
        sessionStorage.setItem('role', action.payload.role);
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Handle login cases
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.status = 'succeeded';
        state.error = null;
        sessionStorage.setItem('token', action.payload.token);
        sessionStorage.setItem('role', action.payload.role);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setOnlineStatus } = userSlice.actions;

export default userSlice.reducer;
