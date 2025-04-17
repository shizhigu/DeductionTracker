import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
  return date.toISOString().split('T')[0]
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
  icon: string;
  color: string;
} {
  const icons: Record<string, { icon: string; color: string }> = {
    "Office Supplies": { icon: "tag", color: "blue" },
    "Software": { icon: "laptop-code", color: "purple" },
    "Travel": { icon: "plane", color: "green" },
    "Meals": { icon: "utensils", color: "yellow" },
    "Marketing": { icon: "bullhorn", color: "pink" },
    "Rent": { icon: "building", color: "gray" },
    "Utilities": { icon: "bolt", color: "orange" },
    "Insurance": { icon: "shield-alt", color: "red" },
    "Professional Services": { icon: "briefcase", color: "indigo" },
    "Equipment": { icon: "desktop", color: "teal" },
  }

  return icons[categoryName] || { icon: "tag", color: "gray" }
}

/**
 * Determine if an expense is business or personal
 */
export function getExpenseType(expense: {
  isBusinessExpense?: boolean;
  isTaxDeductible?: boolean;
}): { type: string; color: string } {
  if (expense.isBusinessExpense) {
    return {
      type: "Business",
      color: expense.isTaxDeductible ? "green" : "blue",
    }
  }
  return {
    type: "Personal",
    color: "gray",
  }
}

/**
 * Format a date in a readable format
 */
export function formatReadableDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // If the date is today, return "Today"
  const today = new Date()
  if (dateObj.toDateString() === today.toDateString()) {
    return 'Today'
  }
  
  // If the date is yesterday, return "Yesterday"
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateObj.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  // If the date is within the last 7 days, return the day name
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 6)
  if (dateObj >= lastWeek) {
    return dateObj.toLocaleDateString('en-US', { weekday: 'long' })
  }
  
  // Otherwise, return the month and day
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}