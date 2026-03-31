import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async () => {
  return apiFetch('/products');
});

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;
