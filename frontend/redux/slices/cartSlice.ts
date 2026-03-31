import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addToCart(state, action) {
      const item = action.payload;
      const existing = state.items.find((i: any) => i.productId === item.productId && i.variantId === item.variantId);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        state.items.push(item);
      }
    },
    updateQuantity(state, action) {
      const { productId, variantId, quantity } = action.payload;
      const item = state.items.find((i: any) => i.productId === productId && i.variantId === variantId);
      if (item) item.quantity = quantity;
    },
    removeFromCart(state, action) {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter((i: any) => i.productId !== productId || i.variantId !== variantId);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
