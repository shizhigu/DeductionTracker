import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  PieChart, TrendingUp, TrendingDown, Plus, Pencil, Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMobile } from "@/hooks/use-mobile";
import { type Category, type Expense } from "@/lib/types";

export default function Categories() {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState('business');
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
  });
  
  // Filter expenses based on active tab
  const filteredExpenses = expenses?.filter(expense => 
    activeTab === 'all' || (activeTab === 'business' && expense.isBusinessExpense)
  );
  
  // Calculate category stats
  const categoryStats = calculateCategoryStats(categories, filteredExpenses);
  
  return (
    <div className={isMobile ? "p-5 pb-20" : "p-8"}>
      <header className="mb-6 flex justify-between items-center">
        <h2 className={`${isMobile ? "text-xl" : "text-2xl"} font-semibold text-neutral-800`}>Categories</h2>
        <Button size={isMobile ? "sm" : "default"}>
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </header>
      
      {/* Tabs */}
      <Tabs defaultValue="business" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="all">All Expenses</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Category breakdown chart */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Spending Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingCategories || isLoadingExpenses ? (
            <div className="flex justify-center py-8">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Pie chart will go here */}
              <div className="w-full md:w-1/3 flex justify-center">
                <PieChart className="h-40 w-40 text-neutral-300" />
              </div>
              
              {/* Category list */}
              <div className="w-full md:w-2/3 space-y-3">
                {categoryStats.map((stat) => (
                  <div key={stat.id} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{stat.name}</span>
                      <span className="text-sm font-medium">{stat.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={stat.percentage} className="h-2" />
                      <span className="text-xs text-neutral-500">{stat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingCategories ? (
          Array(5).fill(0).map((_, i) => <CategoryCardSkeleton key={i} />)
        ) : (
          categories?.map((category) => {
            const stat = categoryStats.find(stat => stat.id === category.id);
            return (
              <CategoryCard 
                key={category.id}
                category={category}
                amount={stat?.amount || 0}
                percentage={stat?.percentage || 0}
                count={stat?.count || 0}
                trend={{ value: 5, direction: 'up' }}
                isMobile={isMobile}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function calculateCategoryStats(categories?: Category[], expenses?: Expense[]) {
  if (!categories || !expenses) return [];
  
  // Calculate total amount
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Group expenses by category
  const stats = categories.map(category => {
    const categoryExpenses = expenses.filter(exp => exp.categoryId === category.id);
    const amount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
    
    return {
      id: category.id,
      name: category.name,
      amount,
      percentage,
      count: categoryExpenses.length
    };
  });
  
  // Sort by amount descending
  return stats.sort((a, b) => b.amount - a.amount);
}

interface CategoryCardProps {
  category: Category;
  amount: number;
  percentage: number;
  count: number;
  trend: {
    value: number;
    direction: 'up' | 'down';
  };
  isMobile: boolean;
}

function CategoryCard({ category, amount, percentage, count, trend, isMobile }: CategoryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2`} style={{backgroundColor: `${category.color}20`, color: category.color}}>
              <i className={`fas fa-${category.icon}`}></i>
            </div>
            <h3 className="font-medium">{category.name}</h3>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between mb-1">
          <span className="text-sm text-neutral-500">Total Spent</span>
          <span className="text-sm font-medium">${amount.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between mb-3">
          <span className="text-sm text-neutral-500">Transactions</span>
          <span className="text-sm font-medium">{count}</span>
        </div>
        
        <Progress value={percentage} className="h-1.5 mb-1" />
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-neutral-500">{percentage}% of total</span>
          <span className={`text-xs flex items-center ${trend.direction === 'up' ? 'text-blue-600' : 'text-green-600'}`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {trend.value}% from last month
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <Skeleton className="w-8 h-8 rounded-lg mr-2" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex space-x-1">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>
        
        <div className="flex justify-between mb-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        <div className="flex justify-between mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>
        
        <Skeleton className="h-1.5 w-full mb-1" />
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
