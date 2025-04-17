import { create } from 'zustand'
import { User } from '@/database/schema'

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

export const useUserStore = create<UserState>()((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const userData = await response.json();
      set({ user: userData, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to login', 
        isLoading: false 
      });
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
      }
      
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to logout', 
        isLoading: false 
      });
    }
  },
  
  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/users/me');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          set({ user: null, isLoading: false });
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user');
      }
      
      const userData = await response.json();
      set({ user: userData, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch user', 
        isLoading: false 
      });
    }
  }
}))