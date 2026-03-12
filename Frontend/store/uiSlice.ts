import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  cartDrawerOpen: boolean;
  searchOpen: boolean;
  activeModal: string | null;
  modalData: Record<string, unknown>;
}

const initialState: UIState = {
  sidebarOpen: false,
  cartDrawerOpen: false,
  searchOpen: false,
  activeModal: null,
  modalData: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleCartDrawer(state) {
      state.cartDrawerOpen = !state.cartDrawerOpen;
    },
    setCartDrawerOpen(state, action: PayloadAction<boolean>) {
      state.cartDrawerOpen = action.payload;
    },
    toggleSearch(state) {
      state.searchOpen = !state.searchOpen;
    },
    setSearchOpen(state, action: PayloadAction<boolean>) {
      state.searchOpen = action.payload;
    },
    openModal(state, action: PayloadAction<{ id: string; data?: Record<string, unknown> }>) {
      state.activeModal = action.payload.id;
      state.modalData = action.payload.data ?? {};
    },
    closeModal(state) {
      state.activeModal = null;
      state.modalData = {};
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleCartDrawer,
  setCartDrawerOpen,
  toggleSearch,
  setSearchOpen,
  openModal,
  closeModal,
} = uiSlice.actions;

export default uiSlice.reducer;
