import { getProfile } from "@/queries/profile";
import { UserProfile } from "@/queries/types";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isAppLoading: boolean;
  user: UserProfile | null;
  login: (userData: UserProfile) => void;
  logout: () => void;
  checkAuthStatus: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAppLoading: true,
  user: null,
  login: (userData: UserProfile) => {
    // Assuming the token is set in cookies by the server
    set({ isAuthenticated: true, user: userData });
  },
  logout: () => {
    // Assuming the token is removed from cookies by the server
    set({ isAuthenticated: false });
  },
  checkAuthStatus: async () => {
    try {
      const res = await getProfile();
      if (res.data._id) {
        set({ isAuthenticated: true, user: res.data });
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
