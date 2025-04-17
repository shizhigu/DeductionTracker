"use client"

import { useEffect, useState } from "react"
import { 
  DollarSign,
  TrendingUp,
  CreditCard,
  Calculator,
  Calendar,
  Camera,
  FileText,
  Plus,
  ArrowUpRight,
  BarChart3,
  Clock,
  ArrowRight,
  Receipt,
  CircleDollarSign,
  MoreHorizontal,
  Filter,
  ShoppingBag,
  Book,
  CheckCircle,
  PiggyBank,
  Layers,
  Landmark,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useUserStore } from "@/store/use-user-store"
import { formatCurrency, formatReadableDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

// Interfaces
interface Expense {
  id: number;
  userId: number;
  amount: number;
  vendor: string;
  date: string;
  notes?: string;
  categoryId: number | null;
  isBusinessExpense: boolean;
  isTaxDeductible: boolean;
  receiptUrl?: string;
}

interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  percentage: number;
  amount?: number;
}

// Dashboard Component
export default function DashboardPage() {
  const { user } = useUserStore()
  const { toast } = useToast()
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  
  // Stats data
  const [todayTotal, setTodayTotal] = useState<number | null>(null)
  const [monthlyDeductible, setMonthlyDeductible] = useState<number | null>(null)
  const [taxSavings, setTaxSavings] = useState<number | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Expense trend data (mocked for now)
  const expenseTrendData = [
    { name: 'Jan', business: 2400, personal: 1300 },
    { name: 'Feb', business: 1398, personal: 900 },
    { name: 'Mar', business: 9800, personal: 1800 },
    { name: 'Apr', business: 3908, personal: 2000 },
    { name: 'May', business: 4800, personal: 1500 },
    { name: 'Jun', business: 3800, personal: 1700 },
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Fetch summary data
        const [
          todayResponse,
          monthlyResponse,
          taxResponse,
          breakdownResponse,
          expensesResponse,
          categoriesResponse
        ] = await Promise.all([
          fetch('/api/summary/today'),
          fetch('/api/summary/monthly-deductible'),
          fetch('/api/summary/tax-savings'),
          fetch('/api/summary/category-breakdown'),
          fetch('/api/expenses'),
          fetch('/api/categories')
        ])

        const todayData = await todayResponse.json()
        const monthlyData = await monthlyResponse.json()
        const taxData = await taxResponse.json()
        const breakdownData = await breakdownResponse.json()
        const expensesData = await expensesResponse.json()
        const categoriesData = await categoriesResponse.json()

        setTodayTotal(todayData.total)
        setMonthlyDeductible(monthlyData.total)
        setTaxSavings(taxData.total)
        setCategoryBreakdown(breakdownData)
        setCategories(categoriesData)
        
        // Get only the latest 5 expenses
        setExpenses(expensesData.slice(0, 5))
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast({
          variant: "destructive",
          title: "Error loading dashboard",
          description: "Could not load dashboard data. Please try again later."
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const handleAddExpense = () => {
    setIsReceiptDialogOpen(true)
  }

  // Get category color
  const getCategoryColor = (categoryId: number | null) => {
    const colors = [
      { bg: "bg-gray-100", text: "text-gray-600", chartColor: "#94a3b8" },
      { bg: "bg-blue-100", text: "text-blue-600", chartColor: "#3b82f6" },
      { bg: "bg-green-100", text: "text-green-600", chartColor: "#22c55e" },
      { bg: "bg-purple-100", text: "text-purple-600", chartColor: "#a855f7" },
      { bg: "bg-amber-100", text: "text-amber-600", chartColor: "#f59e0b" },
      { bg: "bg-pink-100", text: "text-pink-600", chartColor: "#ec4899" },
      { bg: "bg-indigo-100", text: "text-indigo-600", chartColor: "#6366f1" },
      { bg: "bg-red-100", text: "text-red-600", chartColor: "#ef4444" }
    ];
    
    if (!categoryId) return colors[0];
    return colors[(categoryId % colors.length) || 0];
  }

  // Get category name
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Uncategorized";
    
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Uncategorized";
  }

  // Get category icon
  const getCategoryIcon = (categoryId: number | null) => {
    switch(categoryId) {
      case 1: return <ShoppingBag className="h-5 w-5" />;
      case 2: return <Layers className="h-5 w-5" />;
      case 3: return <Landmark className="h-5 w-5" />;
      case 4: return <CreditCard className="h-5 w-5" />;
      case 5: return <Book className="h-5 w-5" />;
      default: return <Receipt className="h-5 w-5" />;
    }
  };

  // Format date for display
  const formatExpenseDate = (dateString: string) => {
    return formatReadableDate(new Date(dateString));
  };

  // Enhance chart data with colors
  const chartData = categoryBreakdown.map(category => ({
    ...category,
    color: getCategoryColor(category.categoryId).chartColor
  }));

  // Calculate monthly goal progress
  const monthlyGoalProgress = 65; // Mocked for now, calculate based on actual goal if available

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric', 
                year: 'numeric'
              })}
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 lg:mt-0">
            <Button className="shadow-sm">
              <Camera className="mr-2 h-4 w-4" /> 
              Scan Receipt
            </Button>
            <Button variant="outline" className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> 
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Today's Spending */}
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-700 font-medium">Today's Spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {isLoading ? '—' : formatCurrency(todayTotal || 0)}
                </div>
                <div className="flex items-center mt-1 text-xs font-medium text-blue-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span>15% less than yesterday</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Deductible */}
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-700 font-medium">Monthly Deductible</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="w-full pr-4">
                <div className="text-2xl font-bold text-green-900">
                  {isLoading ? '—' : formatCurrency(monthlyDeductible || 0)}
                </div>
                <div className="w-full mt-2">
                  <div className="h-2 w-full bg-green-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-green-600 rounded-full" style={{ width: `${monthlyGoalProgress}%` }}></div>
                  </div>
                  <div className="text-xs mt-1 text-green-700">{monthlyGoalProgress}% of monthly goal</div>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Savings */}
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-700 font-medium">Tax Savings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {isLoading ? '—' : formatCurrency(taxSavings || 0)}
                </div>
                <div className="flex items-center mt-1 text-xs font-medium text-purple-700">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span>8% more than last month</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Balance */}
        <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-700 font-medium">Projected Q1 Tax</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-900">
                  {isLoading ? '—' : formatCurrency(2459.78)}
                </div>
                <div className="flex items-center mt-1 text-xs font-medium text-amber-700">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>Due in 37 days</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-200 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column - 8/12 width */}
        <div className="lg:col-span-8 space-y-6">
          {/* Expense Trend Chart */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Expense Trends</CardTitle>
                  <CardDescription>Business vs personal spending over time</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Filter className="h-3 w-3 mr-1" /> Filter
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Clock className="h-3 w-3 mr-1" /> Last 6 Months
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expenseTrendData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, undefined]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="business" name="Business" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="personal" name="Personal" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Expenses</CardTitle>
                  <CardDescription>Your latest transactions</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/expenses" className="text-blue-600 hover:text-blue-700">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : expenses.length > 0 ? (
                <div className="space-y-1">
                  {expenses.map((expense) => {
                    const categoryColor = getCategoryColor(expense.categoryId);
                    
                    return (
                      <Link href={`/expenses/${expense.id}`} key={expense.id}>
                        <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className={`w-10 h-10 rounded-full ${categoryColor.bg} flex items-center justify-center mr-3`}>
                            {getCategoryIcon(expense.categoryId)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <h3 className="font-medium truncate">{expense.vendor}</h3>
                              <span className={`font-medium ${expense.isBusinessExpense ? 'text-green-600' : ''}`}>
                                {formatCurrency(expense.amount)}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <span className="truncate">{getCategoryName(expense.categoryId)}</span>
                                <span className="mx-1">•</span>
                                <span>{formatExpenseDate(expense.date)}</span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                expense.isBusinessExpense ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {expense.isBusinessExpense ? 'Business' : 'Personal'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-block p-3 rounded-full bg-blue-100 mb-4">
                    <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-6">
                    Start tracking your expenses to see them appear here.
                  </p>
                  <Button onClick={handleAddExpense}>
                    <Plus className="mr-2 h-4 w-4" /> Add First Expense
                  </Button>
                </div>
              )}
            </CardContent>
            {expenses.length > 0 && (
              <CardFooter className="border-t pt-4 flex justify-between text-sm text-gray-500">
                <span>Showing {expenses.length} of {expenses.length} recent expenses</span>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" /> Export All
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Right Column - 4/12 width */}
        <div className="lg:col-span-4 space-y-6">
          {/* Category Breakdown */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Category Breakdown</CardTitle>
              <CardDescription>Business expense distribution</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-[180px] bg-gray-200 rounded-lg mb-4"></div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center py-1">
                      <div className="h-3 w-3 rounded-full bg-gray-200 mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-12 ml-2"></div>
                    </div>
                  ))}
                </div>
              ) : categoryBreakdown.length > 0 ? (
                <>
                  <div className="h-[180px] mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={40}
                          paddingAngle={2}
                          dataKey="percentage"
                          labelLine={false}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    {categoryBreakdown.map((category) => {
                      const color = getCategoryColor(category.categoryId);
                      return (
                        <div key={category.categoryId} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`h-3 w-3 rounded-full ${color.bg}`}></div>
                            <span className="ml-2 text-sm text-gray-700">{category.categoryName}</span>
                          </div>
                          <span className="text-sm font-medium">{category.percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="inline-block p-3 rounded-full bg-gray-100 mb-4">
                    <BarChart3 className="h-6 w-6 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No data available</h3>
                  <p className="text-gray-500 max-w-sm mx-auto mb-4">
                    Add business expenses to see category breakdown.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tax Dates */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Upcoming Tax Dates</CardTitle>
              <CardDescription>Important deadlines</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-red-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-red-800">Quarterly Estimated Tax</h4>
                    <p className="text-sm text-red-700 mt-0.5">Due in 37 days (April 15, 2025)</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">W-2 and 1099 Forms</h4>
                    <p className="text-sm text-blue-700 mt-0.5">Due in 92 days (June 15, 2025)</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" /> View Tax Calendar
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Actions */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-3 flex flex-col items-center justify-center">
                <Calculator className="h-5 w-5 mb-2 text-blue-600" />
                <span className="text-sm">Tax Calculator</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col items-center justify-center">
                <FileText className="h-5 w-5 mb-2 text-green-600" />
                <span className="text-sm">Generate Report</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col items-center justify-center">
                <Sparkles className="h-5 w-5 mb-2 text-purple-600" />
                <span className="text-sm">Tax Insights</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex flex-col items-center justify-center">
                <CircleDollarSign className="h-5 w-5 mb-2 text-amber-600" />
                <span className="text-sm">Set Budget</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}