// Types based on our API and schema
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: number;
  userId: number;
  amount: number;
  vendor: string;
  date: string | Date;
  categoryId: number | null;
  notes: string | null;
  isBusinessExpense: boolean;
  isTaxDeductible: boolean;
  deductiblePercentage: number;
  receiptUrl: string | null;
}

export interface Report {
  id: number;
  userId: number;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  format: string;
  createdAt: string | Date;
}

// Insert types
export interface InsertUser {
  username: string;
  password: string;
  name: string;
  email: string;
}

export interface InsertCategory {
  name: string;
  icon: string;
  color: string;
}

export interface InsertExpense {
  userId: number;
  amount: number;
  vendor: string;
  date: Date;
  categoryId: number | null;
  notes?: string | null;
  isBusinessExpense: boolean;
  isTaxDeductible: boolean;
  deductiblePercentage: number;
  receiptUrl?: string | null;
}

export interface InsertReport {
  userId: number;
  name: string;
  startDate: Date;
  endDate: Date;
  format: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface SummaryResponse {
  total: number;
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  percentage: number;
}
