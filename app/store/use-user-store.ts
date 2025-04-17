'use client';

import { create } from 'zustand';
import { User } from '@/database/schema';

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
  
  // Actions
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Auth actions
  login: async (username, password) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to login');
      }
      
      const data = await response.json();
      set({ user: data.user, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to logout');
      }
      
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false 
      });
    }
  },
  
  fetchCurrentUser: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('/api/users/me');
      
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, but not an error
          set({ user: null, isLoading: false });
          return;
        }
        
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user');
      }
      
      const data = await response.json();
      set({ user: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        isLoading: false,
        user: null
      });
    }
  },
}));