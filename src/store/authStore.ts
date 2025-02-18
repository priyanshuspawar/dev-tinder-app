import { getProfile } from "@/queries/profile";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isAppLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuthStatus: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAppLoading: true,
  login: () => {
    // Assuming the token is set in cookies by the server
    set({ isAuthenticated: true });
  },
  logout: () => {
    // Assuming the token is removed from cookies by the server
    set({ isAuthenticated: false });
  },
  checkAuthStatus: async () => {
    try {
      const res = await getProfile();
      if (res.data._id) {
        set({ isAuthenticated: true });
      } else {
        set({ isAuthenticated: false });
      }
    } catch (error) {
      set({ isAuthenticated: false });
    } finally {
      set({ isAppLoading: false });
    }
  },
}));

export default useAuthStore;
