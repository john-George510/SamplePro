import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fleetService from '../../services/fleetService';

const initialState = {
  vehicles: [],
  status: 'idle',
  error: null,
};

export const fetchAllVehicles = createAsyncThunk('fleet/fetchAllVehicles', async () => {
  const response = await fleetService.getAllVehicles();
  return response.data;
});

const fleetSlice = createSlice({
  name: 'fleet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllVehicles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllVehicles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.vehicles = action.payload;
      })
      .addCase(fetchAllVehicles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default fleetSlice.reducer;
