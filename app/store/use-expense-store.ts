'use client';

import { create } from 'zustand';
import { Expense, Category } from '@/database/schema';

interface ExpenseFilterState {
  startDate: Date | null;
  endDate: Date | null;
  businessOnly: boolean;
  taxDeductibleOnly: boolean;
  categoryId: number | null;
  searchTerm: string;
}

interface ExpenseState {
  expenses: Expense[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  filters: ExpenseFilterState;
  
  // Actions
  setExpenses: (expenses: Expense[]) => void;
  setCategories: (categories: Category[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filter actions
  setDateRange: (startDate: Date | null, endDate: Date | null) => void;
  setBusinessOnly: (businessOnly: boolean) => void;
  setTaxDeductibleOnly: (taxDeductibleOnly: boolean) => void;
  setCategoryId: (categoryId: number | null) => void;
  setSearchTerm: (searchTerm: string) => void;
  resetFilters: () => void;
  
  // Computed values
  filteredExpenses: () => Expense[];
  getTotalAmount: () => number;
  getDeductibleAmount: () => number;
}

const defaultFilters: ExpenseFilterState = {
  startDate: null,
  endDate: null,
  businessOnly: false,
  taxDeductibleOnly: false,
  categoryId: null,
  searchTerm: '',
};

export const useExpenseStore = create<ExpenseState>()((set, get) => ({
  expenses: [],
  categories: [],
  isLoading: false,
  error: null,
  filters: { ...defaultFilters },
  
  // Actions
  setExpenses: (expenses) => set({ expenses }),
  setCategories: (categories) => set({ categories }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Filter actions
  setDateRange: (startDate, endDate) => 
    set((state) => ({ filters: { ...state.filters, startDate, endDate } })),
  
  setBusinessOnly: (businessOnly) => 
    set((state) => ({ filters: { ...state.filters, businessOnly } })),
  
  setTaxDeductibleOnly: (taxDeductibleOnly) => 
    set((state) => ({ filters: { ...state.filters, taxDeductibleOnly } })),
  
  setCategoryId: (categoryId) => 
    set((state) => ({ filters: { ...state.filters, categoryId } })),
  
  setSearchTerm: (searchTerm) => 
    set((state) => ({ filters: { ...state.filters, searchTerm } })),
  
  resetFilters: () => 
    set((state) => ({ filters: { ...defaultFilters } })),
  
  // Computed values
  filteredExpenses: () => {
    const { expenses, filters } = get();
    
    return expenses.filter((expense) => {
      // Date filtering
      if (filters.startDate && new Date(expense.date) < filters.startDate) {
        return false;
      }
      
      if (filters.endDate) {
        const endDateWithTime = new Date(filters.endDate);
        endDateWithTime.setHours(23, 59, 59);
        if (new Date(expense.date) > endDateWithTime) {
          return false;
        }
      }
      
      // Business filter
      if (filters.businessOnly && !expense.isBusinessExpense) {
        return false;
      }
      
      // Tax deductible filter
      if (filters.taxDeductibleOnly && !expense.isTaxDeductible) {
        return false;
      }
      
      // Category filter
      if (filters.categoryId && expense.categoryId !== filters.categoryId) {
        return false;
      }
      
      // Search term
      if (filters.searchTerm) {
        const searchTermLower = filters.searchTerm.toLowerCase();
        const vendorMatch = expense.vendor.toLowerCase().includes(searchTermLower);
        const notesMatch = expense.notes ? expense.notes.toLowerCase().includes(searchTermLower) : false;
        
        if (!vendorMatch && !notesMatch) {
          return false;
        }
      }
      
      return true;
    });
  },
  
  getTotalAmount: () => {
    const filteredExpenses = get().filteredExpenses();
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  },
  
  getDeductibleAmount: () => {
    const filteredExpenses = get().filteredExpenses();
    return filteredExpenses
      .filter(expense => expense.isTaxDeductible)
      .reduce((sum, expense) => {
        const deductibleAmount = expense.amount * (expense.deductiblePercentage / 100);
        return sum + deductibleAmount;
      }, 0);
  },
}));