import { create } from "zustand";

interface SidebarState {
  isFullModeActive: boolean;
  toggleFullMode: () => void;
}

const useSideBarStore = create<SidebarState>((set) => ({
  isFullModeActive: false,
  toggleFullMode: () => {
    set((state) => ({
      isFullModeActive: !state.isFullModeActive,
    }));
  },
}));

export default useSideBarStore;
