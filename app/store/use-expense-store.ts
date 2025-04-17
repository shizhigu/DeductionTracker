import { create } from 'zustand'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { Expense, Category } from '@/database/schema'

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
  
  // Expense CRUD
  fetchExpenses: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createExpense: (expense: Partial<Expense>) => Promise<Expense | null>;
  updateExpense: (id: number, expense: Partial<Expense>) => Promise<Expense | null>;
  deleteExpense: (id: number) => Promise<boolean>;
  
  // Computed values
  getFilteredExpenses: () => Expense[];
  getTotalAmount: () => number;
  getDeductibleAmount: () => number;
}

const defaultFilters: ExpenseFilterState = {
  startDate: startOfMonth(new Date()),
  endDate: endOfMonth(new Date()),
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
  filters: defaultFilters,
  
  // State setters
  setExpenses: (expenses) => set({ expenses }),
  setCategories: (categories) => set({ categories }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Filter setters
  setDateRange: (startDate, endDate) => set((state) => ({
    filters: { ...state.filters, startDate, endDate }
  })),
  
  setBusinessOnly: (businessOnly) => set((state) => ({
    filters: { ...state.filters, businessOnly }
  })),
  
  setTaxDeductibleOnly: (taxDeductibleOnly) => set((state) => ({
    filters: { ...state.filters, taxDeductibleOnly }
  })),
  
  setCategoryId: (categoryId) => set((state) => ({
    filters: { ...state.filters, categoryId }
  })),
  
  setSearchTerm: (searchTerm) => set((state) => ({
    filters: { ...state.filters, searchTerm }
  })),
  
  resetFilters: () => set({ filters: defaultFilters }),
  
  // API methods
  fetchExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/expenses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      
      const data = await response.json();
      set({ expenses: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error fetching expenses', 
        isLoading: false 
      });
    }
  },
  
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      set({ categories: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error fetching categories', 
        isLoading: false 
      });
    }
  },
  
  createExpense: async (expense) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create expense');
      }
      
      const newExpense = await response.json();
      
      // Update expenses state with the new expense
      set((state) => ({
        expenses: [...state.expenses, newExpense],
        isLoading: false,
      }));
      
      return newExpense;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error creating expense', 
        isLoading: false 
      });
      return null;
    }
  },
  
  updateExpense: async (id, expense) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update expense');
      }
      
      const updatedExpense = await response.json();
      
      // Update expenses state with the updated expense
      set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === id ? updatedExpense : e
        ),
        isLoading: false,
      }));
      
      return updatedExpense;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error updating expense', 
        isLoading: false 
      });
      return null;
    }
  },
  
  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }
      
      // Remove the expense from state
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        isLoading: false,
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error deleting expense', 
        isLoading: false 
      });
      return false;
    }
  },
  
  // Computed values
  getFilteredExpenses: () => {
    const { expenses, filters } = get();
    
    return expenses.filter((expense) => {
      // Date range filter
      if (filters.startDate && filters.endDate) {
        const expenseDate = new Date(expense.date);
        if (
          expenseDate < filters.startDate || 
          expenseDate > filters.endDate
        ) {
          return false;
        }
      }
      
      // Business expenses filter
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
      
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          expense.vendor.toLowerCase().includes(searchLower) ||
          (expense.description && 
            expense.description.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  },
  
  getTotalAmount: () => {
    return get().getFilteredExpenses().reduce(
      (sum, expense) => sum + Number(expense.amount), 
      0
    );
  },
  
  getDeductibleAmount: () => {
    return get().getFilteredExpenses()
      .filter(expense => expense.isTaxDeductible)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
  },
}))