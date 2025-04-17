import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search, Filter, Plus, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMobile } from "@/hooks/use-mobile";
import ReceiptCapture from "@/components/receipts/ReceiptCapture";
import { type Expense } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function Expenses() {
  const isMobile = useMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
  });
  
  // Function to filter expenses
  const filterExpenses = (expenses: Expense[] | undefined): Expense[] => {
    if (!expenses) return [];
    
    let filtered = [...expenses];
    
    // Filter by tab
    if (activeTab === 'business') {
      filtered = filtered.filter(exp => exp.isBusinessExpense);
    } else if (activeTab === 'personal') {
      filtered = filtered.filter(exp => !exp.isBusinessExpense);
    } else if (activeTab === 'deductible') {
      filtered = filtered.filter(exp => exp.isTaxDeductible);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.vendor.toLowerCase().includes(query) || 
        exp.notes?.toLowerCase().includes(query)
      );
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  const filteredExpenses = filterExpenses(expenses);
  
  // Group expenses by date
  const groupedExpenses: Record<string, Expense[]> = {};
  filteredExpenses.forEach(expense => {
    const date = new Date(expense.date).toDateString();
    if (!groupedExpenses[date]) {
      groupedExpenses[date] = [];
    }
    groupedExpenses[date].push(expense);
  });
  
  return (
    <div className={isMobile ? "p-5 pb-20" : "p-8"}>
      <header className="mb-6 flex justify-between items-center">
        <h2 className={`${isMobile ? "text-xl" : "text-2xl"} font-semibold text-neutral-800`}>Expenses</h2>
        <Button 
          size={isMobile ? "sm" : "default"}
          onClick={() => setShowReceiptModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Expense
        </Button>
      </header>
      
      {/* Search and filter */}
      <div className="mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input 
            placeholder="Search expenses" 
            className="pl-9" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex-shrink-0">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="deductible">Deductible</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Expenses list */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-5 w-40 mb-3" />
              <Card>
                <CardContent className="p-4 space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-lg mr-3" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex justify-between mt-1">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-16 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-3">No expenses found</p>
          <Button variant="outline" onClick={() => setShowReceiptModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add your first expense
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExpenses).map(([date, expenses]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-neutral-500 mb-3">{formatDate(new Date(date))}</h3>
              <Card>
                <CardContent className={isMobile ? "p-3 space-y-3" : "p-4 space-y-4"}>
                  {expenses.map((expense) => (
                    <ExpenseItem 
                      key={expense.id} 
                      expense={expense} 
                      isMobile={isMobile} 
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
      
      {/* Receipt Capture Modal */}
      <ReceiptCapture 
        isOpen={showReceiptModal} 
        onClose={() => setShowReceiptModal(false)} 
        isMobile={isMobile}
      />
    </div>
  );
}

interface ExpenseItemProps {
  expense: Expense;
  isMobile: boolean;
}

function ExpenseItem({ expense, isMobile }: ExpenseItemProps) {
  // Determine icon based on category or vendor
  let iconClass = "bg-blue-50 text-blue-500";
  let IconComponent = "coffee";
  
  if (expense.vendor.includes('Adobe') || expense.vendor.includes('Software')) {
    iconClass = "bg-purple-50 text-purple-500";
    IconComponent = "laptop";
  } else if (expense.vendor.includes('Chipotle') || expense.notes?.includes('Lunch')) {
    iconClass = "bg-red-50 text-red-500";
    IconComponent = "utensils";
  } else if (expense.vendor.includes('Gas') || expense.notes?.includes('Fuel')) {
    iconClass = "bg-yellow-50 text-yellow-500";
    IconComponent = "fuel";
  }
  
  // Determine badge
  let badgeVariant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' | 'warning' = 'outline';
  let badgeText = 'Personal';
  
  if (expense.isTaxDeductible) {
    badgeVariant = 'success';
    badgeText = 'Deductible';
    
    if (expense.deductiblePercentage < 100) {
      badgeVariant = 'warning';
      badgeText = `Partial (${expense.deductiblePercentage}%)`;
    }
  }
  
  const formattedAmount = `$${expense.amount.toFixed(2)}`;
  const time = new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <Link href={`/expenses/${expense.id}`}>
      <a className="flex items-center hover:bg-neutral-50 rounded-lg p-2">
        <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg ${iconClass} flex items-center justify-center mr-3`}>
          <i className={`fas fa-${IconComponent}`}></i>
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <h4 className={`font-medium ${isMobile ? 'text-sm' : ''} text-neutral-800`}>{expense.vendor}</h4>
            <p className={`font-medium ${isMobile ? 'text-sm' : ''} text-neutral-800`}>{formattedAmount}</p>
          </div>
          <div className="flex justify-between mt-1">
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-neutral-500`}>
              {expense.notes || 'No description'} • {time}
            </p>
            <Badge variant={badgeVariant} className={isMobile ? "text-[10px] px-1.5 py-0.5" : ""}>
              {badgeText}
            </Badge>
          </div>
        </div>
      </a>
    </Link>
  );
}
