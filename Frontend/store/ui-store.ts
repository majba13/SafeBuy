'use client';

import { create } from 'zustand';

type UiStore = {
  cartOpen: boolean;
  recentSearches: string[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
};

const MAX_RECENT = 6;

export const useUiStore = create<UiStore>((set) => ({
  cartOpen: false,
  recentSearches: [],
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  addRecentSearch: (query) =>
    set((state) => {
      const value = query.trim();
      if (!value) return state;
      const next = [value, ...state.recentSearches.filter((q) => q.toLowerCase() !== value.toLowerCase())].slice(0, MAX_RECENT);
      return { recentSearches: next };
    }),
  clearRecentSearches: () => set({ recentSearches: [] }),
}));
