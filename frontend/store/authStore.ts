import { create } from "zustand";
import { User, TokenResponse } from "@/types/api";
import { apiClient } from "@/services/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (email: string, name: string, uid: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  register: async (name, email, password, role = "user") => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<TokenResponse>("/auth/register", {
        name,
        email,
        password,
        role,
      });
      
      const token = response.data.access_token;
      localStorage.setItem("authToken", token);
      if (typeof window !== "undefined") {
        document.cookie = `authToken=${token}; path=/; max-age=604800; SameSite=Lax`;
      }
      
      set({
        token,
        isAuthenticated: true,
      });

      // Fetch user profile to get role and user details
      const userResponse = await apiClient.get<User>("/auth/me");
      set({
        user: userResponse.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<TokenResponse>("/auth/login", {
        email,
        password,
      });
      
      const token = response.data.access_token;
      localStorage.setItem("authToken", token);
      if (typeof window !== "undefined") {
        document.cookie = `authToken=${token}; path=/; max-age=604800; SameSite=Lax`;
      }
      
      set({
        token,
        isAuthenticated: true,
      });

      // Fetch user profile to get role and user details
      const userResponse = await apiClient.get<User>("/auth/me");
      set({
        user: userResponse.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  googleLogin: async (email, name, uid) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<TokenResponse>("/auth/google", {
        email,
        name,
        uid,
      });
      
      const token = response.data.access_token;
      localStorage.setItem("authToken", token);
      if (typeof window !== "undefined") {
        document.cookie = `authToken=${token}; path=/; max-age=604800; SameSite=Lax`;
      }
      
      set({
        token,
        isAuthenticated: true,
      });

      // Fetch user profile to get role and user details
      const userResponse = await apiClient.get<User>("/auth/me");
      set({
        user: userResponse.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Google Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    if (typeof window !== "undefined") {
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  restoreSession: async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      set({
        token,
        isAuthenticated: true,
        isLoading: true,
      });
      try {
        const userResponse = await apiClient.get<User>("/auth/me");
        set({
          user: userResponse.data,
          isLoading: false,
        });
      } catch (error) {
        localStorage.removeItem("authToken");
        if (typeof window !== "undefined") {
          document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }
  },

  clearError: () => set({ error: null }),
}));
