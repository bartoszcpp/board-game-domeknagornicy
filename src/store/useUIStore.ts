import { create } from 'zustand';

interface UIState {
  isInventoryOpen: boolean;
  toggleInventory: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isInventoryOpen: false,
  toggleInventory: () => set((state) => ({ isInventoryOpen: !state.isInventoryOpen })),
}));