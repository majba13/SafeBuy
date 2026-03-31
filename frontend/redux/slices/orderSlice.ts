import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (userId: string) => {
  return apiFetch(`/orders?customerId=${userId}`);
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default orderSlice.reducer;
