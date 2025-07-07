import { getProfile } from "@/queries/profile";
import { UserProfile } from "@/queries/types";
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isAppLoading: boolean;
  user: UserProfile | null;
  changeAuthStatus: (status: boolean) => void;
  login: (userData: UserProfile) => void;
  logout: () => void;
  checkAuthStatus: () => void;
  setLocation: (coordinates: [number, number]) => void;
}
const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAppLoading: true,
  user: null,
  changeAuthStatus: (status: boolean) => {
    set({
      isAuthenticated: status,
    });
  },
  login: (userData: UserProfile) => {
    // Assuming the token is set in cookies by the server
    set({ isAuthenticated: true, user: userData });
  },
  logout: () => {
    // Assuming the token is removed from cookies by the server
    set({ isAuthenticated: false, user: null });
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
  setLocation: (coordinates) => {
    set((prev) => {
      if (prev.user) {
        return {
          user: {
            ...prev.user,
            essentials: {
              location: { type: "Point", coordinates },
              education: prev.user.essentials?.education,
            },
          },
        };
      }
      return prev;
    });
  },
}));

export default useAuthStore;
