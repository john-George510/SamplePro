// src/redux/slices/driverSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import driverService from '../../services/driverService';

const initialState = {
  assignments: [],
  status: 'idle',
  error: null,
};

export const fetchAssignments = createAsyncThunk('drivers/fetchAssignments', async () => {
  const response = await driverService.getAssignments();
  return response.data;
});

export const acceptAssignment = createAsyncThunk('drivers/acceptAssignment', async (assignmentId) => {
  const response = await driverService.acceptAssignment(assignmentId);
  return response.data;
});

const driverSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(acceptAssignment.fulfilled, (state, action) => {
        // Remove accepted assignment from the list
        state.assignments = state.assignments.filter((a) => a._id !== action.payload._id);
      });
  },
});

export default driverSlice.reducer;
