import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Coffee, Laptop, Utensils, Fuel, Briefcase, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMobile } from "@/hooks/use-mobile";
import { type Expense, type Category } from "@/lib/types";

const iconMap: Record<string, React.ReactNode> = {
  'coffee': <Coffee className="h-5 w-5" />,
  'laptop': <Laptop className="h-5 w-5" />,
  'utensils': <Utensils className="h-5 w-5" />,
  'car': <Fuel className="h-5 w-5" />,
  'briefcase': <Briefcase className="h-5 w-5" />,
  'bullhorn': <ShoppingBag className="h-5 w-5" />
};

export default function ExpenseList() {
  const isMobile = useMobile();
  
  const { data: expenses, isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
  });
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const isLoading = expensesLoading || categoriesLoading;
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <ExpenseSkeleton key={i} isMobile={isMobile} />
        ))}
      </div>
    );
  }
  
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-neutral-100 text-center">
        <p className="text-neutral-500">No expenses found</p>
      </div>
    );
  }
  
  // Sort expenses by date, newest first
  const sortedExpenses = [...expenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Take only the first 4 expenses
  const recentExpenses = sortedExpenses.slice(0, 4);
  
  return (
    <div className="space-y-4">
      {recentExpenses.map((expense) => (
        <ExpenseItem 
          key={expense.id} 
          expense={expense} 
          category={categories?.find(c => c.id === expense.categoryId)}
          isMobile={isMobile} 
        />
      ))}
    </div>
  );
}

interface ExpenseItemProps {
  expense: Expense;
  category?: Category;
  isMobile: boolean;
}

function ExpenseItem({ expense, category, isMobile }: ExpenseItemProps) {
  // Format amount
  const formattedAmount = `$${expense.amount.toFixed(2)}`;
  
  // Determine badge type
  let badgeType: 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' = 'outline';
  let badgeText = 'Personal';
  
  if (expense.isTaxDeductible) {
    badgeType = 'success';
    badgeText = 'Deductible';
    
    if (expense.deductiblePercentage < 100) {
      badgeType = 'warning';
      badgeText = `Partial (${expense.deductiblePercentage}%)`;
    }
  }
  
  const bgColor = category?.color ? `${category.color}20` : 'bg-blue-50';
  const textColor = category?.color || 'text-blue-500';
  const icon = category?.icon || 'briefcase';
  const IconComponent = iconMap[icon] || <Briefcase className="h-5 w-5" />;
  
  if (isMobile) {
    return (
      <div 
        className="bg-white rounded-xl p-3 border border-neutral-100 shadow-sm flex items-center cursor-pointer"
        onClick={() => window.location.href = `/expenses/${expense.id}`}
      >
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center ${textColor} mr-3`}>
          {IconComponent}
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className="font-medium text-sm text-neutral-800">
              {expense.vendor.length > 15 ? expense.vendor.substring(0, 15) + '...' : expense.vendor}
            </h4>
            <p className="font-medium text-sm text-neutral-800">{formattedAmount}</p>
          </div>
          <div className="flex justify-between mt-0.5">
            <p className="text-xs text-neutral-500">
              {expense.notes?.substring(0, 20) || category?.name || ''}
            </p>
            <Badge variant={badgeType} className="text-[10px] px-1.5 py-0.5 rounded-full">
              {badgeText}
            </Badge>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm flex items-center cursor-pointer"
      onClick={() => window.location.href = `/expenses/${expense.id}`}
    >
      <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center ${textColor} mr-4`}>
        {IconComponent}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="font-medium text-neutral-800">{expense.vendor}</h4>
          <p className="font-medium text-neutral-800">{formattedAmount}</p>
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-sm text-neutral-500">{expense.notes || category?.name || ''}</p>
          <Badge variant={badgeType} className="rounded-full">
            {badgeText}
          </Badge>
        </div>
      </div>
    </div>
  );
}

interface ExpenseSkeletonProps {
  isMobile: boolean;
}

function ExpenseSkeleton({ isMobile }: ExpenseSkeletonProps) {
  if (isMobile) {
    return (
      <div className="bg-white rounded-xl p-3 border border-neutral-100 shadow-sm flex items-center">
        <Skeleton className="w-10 h-10 rounded-lg mr-3" />
        <div className="flex-1">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex justify-between mt-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl p-4 border border-neutral-100 shadow-sm flex items-center">
      <Skeleton className="w-12 h-12 rounded-lg mr-4" />
      <div className="flex-1">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex justify-between mt-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
