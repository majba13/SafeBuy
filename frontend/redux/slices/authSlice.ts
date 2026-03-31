import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiFetch } from '../../utils/api';

export const login = createAsyncThunk('auth/login', async (data: { email: string; password: string }) => {
  return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) });
});

export const register = createAsyncThunk('auth/register', async (data: { email: string; password: string; name: string }) => {
  return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) });
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null, status: 'idle', error: null },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
