import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tripService from '../../services/tripService';

const initialState = {
  trips: [],
  currentTrip: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  total: 0,
  page: 1,
  pages: 1,
};

// Create trip
export const createTrip = createAsyncThunk(
  'trips/create',
  async (tripData, thunkAPI) => {
    try {
      return await tripService.createTrip(tripData);
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get user trips
export const getTrips = createAsyncThunk(
  'trips/getAll',
  async (params, thunkAPI) => {
    try {
      return await tripService.getTrips(params);
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get single trip
export const getTrip = createAsyncThunk(
  'trips/getOne',
  async (id, thunkAPI) => {
    try {
      return await tripService.getTrip(id);
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update trip
export const updateTrip = createAsyncThunk(
  'trips/update',
  async ({ id, tripData }, thunkAPI) => {
    try {
      return await tripService.updateTrip(id, tripData);
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete trip
export const deleteTrip = createAsyncThunk(
  'trips/delete',
  async (id, thunkAPI) => {
    try {
      await tripService.deleteTrip(id);
      return id;
    } catch (error) {
      const message = error.response?.data?.error || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    resetTrips: (state) => initialState,
    setCurrentTrip: (state, action) => {
      state.currentTrip = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips.unshift(action.payload);
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTrips.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(getTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTrip.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTrip = action.payload;
      })
      .addCase(getTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const index = state.trips.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.trips[index] = action.payload;
        if (state.currentTrip?._id === action.payload._id) {
          state.currentTrip = action.payload;
        }
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.trips = state.trips.filter((t) => t._id !== action.payload);
        if (state.currentTrip?._id === action.payload) {
          state.currentTrip = null;
        }
      });
  },
});

export const { resetTrips, setCurrentTrip } = tripSlice.actions;
export default tripSlice.reducer;
