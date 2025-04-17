import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return format(date, "MMMM d, yyyy");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function getCategoryIcon(categoryName: string): {
  icon: string;
  bgColor: string;
  textColor: string;
} {
  switch (categoryName.toLowerCase()) {
    case 'office supplies':
      return { icon: 'briefcase', bgColor: 'bg-blue-50', textColor: 'text-blue-500' };
    case 'software':
      return { icon: 'laptop', bgColor: 'bg-purple-50', textColor: 'text-purple-500' };
    case 'travel':
      return { icon: 'car', bgColor: 'bg-green-50', textColor: 'text-green-500' };
    case 'meals':
      return { icon: 'utensils', bgColor: 'bg-yellow-50', textColor: 'text-yellow-500' };
    case 'marketing':
      return { icon: 'bullhorn', bgColor: 'bg-red-50', textColor: 'text-red-500' };
    default:
      return { icon: 'receipt', bgColor: 'bg-neutral-50', textColor: 'text-neutral-500' };
  }
}

export function getExpenseType(expense: {
  isBusinessExpense: boolean;
  isTaxDeductible: boolean;
  deductiblePercentage: number;
}): {
  badgeVariant: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary';
  badgeText: string;
} {
  if (!expense.isBusinessExpense) {
    return { badgeVariant: 'outline', badgeText: 'Personal' };
  }
  
  if (expense.isTaxDeductible) {
    if (expense.deductiblePercentage === 100) {
      return { badgeVariant: 'success', badgeText: 'Deductible' };
    } else {
      return { badgeVariant: 'warning', badgeText: `Partial (${expense.deductiblePercentage}%)` };
    }
  }
  
  return { badgeVariant: 'secondary', badgeText: 'Business' };
}
