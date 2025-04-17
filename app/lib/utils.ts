import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from 'date-fns'

/**
 * Combines class names with Tailwind merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date to YYYY-MM-DD format
 */
export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy')
}

/**
 * Formats a number as currency ($)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Returns an icon and color for a category
 */
export function getCategoryIcon(categoryName: string): {
  icon: string, 
  color: string,
  bgColor: string
} {
  const lowerName = categoryName.toLowerCase();
  
  if (lowerName.includes('office')) {
    return { 
      icon: 'clipboardList', 
      color: 'text-blue-500',
      bgColor: 'bg-blue-100'
    };
  } else if (lowerName.includes('software') || lowerName.includes('subscription')) {
    return { 
      icon: 'laptop', 
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    };
  } else if (lowerName.includes('travel')) {
    return { 
      icon: 'plane', 
      color: 'text-green-500',
      bgColor: 'bg-green-100'
    };
  } else if (lowerName.includes('meal') || lowerName.includes('food')) {
    return { 
      icon: 'utensils', 
      color: 'text-orange-500',
      bgColor: 'bg-orange-100'
    };
  } else if (lowerName.includes('market') || lowerName.includes('ad')) {
    return { 
      icon: 'megaphone', 
      color: 'text-pink-500',
      bgColor: 'bg-pink-100'
    };
  } else {
    return { 
      icon: 'receipt', 
      color: 'text-gray-500',
      bgColor: 'bg-gray-100'
    };
  }
}

/**
 * Determine if an expense is business or personal
 */
export function getExpenseType(expense: {
  isBusinessExpense: boolean,
  isTaxDeductible: boolean,
}): {
  label: string,
  color: string,
  bgColor: string
} {
  if (expense.isBusinessExpense) {
    if (expense.isTaxDeductible) {
      return {
        label: 'Deductible',
        color: 'text-green-700',
        bgColor: 'bg-green-100'
      };
    }
    return {
      label: 'Business',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100'
    };
  }
  return {
    label: 'Personal',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100'
  };
}