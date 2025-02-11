// frontend/src/redux/slices/userSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const initialState = {
  token: sessionStorage.getItem('token') || null,
  role: sessionStorage.getItem('role') || null,
  status: 'idle',
  error: null,
};

export const register = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
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
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
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
      state.status = 'idle';
      state.error = null;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle register.fulfilled
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.status = 'succeeded';
        state.error = null;
        sessionStorage.setItem('token', action.payload.token);
        sessionStorage.setItem('role', action.payload.role);
      })
      // Handle register.rejected
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Handle login.fulfilled
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.status = 'succeeded';
        state.error = null;
        sessionStorage.setItem('token', action.payload.token);
        sessionStorage.setItem('role', action.payload.role);
      })
      // Handle login.rejected
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;

export default userSlice.reducer;
