"use client"

import { useEffect, useState } from "react"
import { 
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  Camera,
  FileText,
  Plus,
  ArrowUpRight,
  BarChart3,
  Clock,
  ArrowRight,
  ExternalLink,
  Receipt
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useUserStore } from "@/store/use-user-store"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardPage() {
  const { user } = useUserStore()
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  
  // Stats data
  const [todayTotal, setTodayTotal] = useState<number | null>(null)
  const [monthlyDeductible, setMonthlyDeductible] = useState<number | null>(null)
  const [taxSavings, setTaxSavings] = useState<number | null>(null)
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

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
          expensesResponse
        ] = await Promise.all([
          fetch('/api/summary/today'),
          fetch('/api/summary/monthly-deductible'),
          fetch('/api/summary/tax-savings'),
          fetch('/api/summary/category-breakdown'),
          fetch('/api/expenses')
        ])

        const todayData = await todayResponse.json()
        const monthlyData = await monthlyResponse.json()
        const taxData = await taxResponse.json()
        const breakdownData = await breakdownResponse.json()
        const expensesData = await expensesResponse.json()

        setTodayTotal(todayData.total)
        setMonthlyDeductible(monthlyData.total)
        setTaxSavings(taxData.total)
        setCategoryBreakdown(breakdownData)
        
        // Get only the latest 4 expenses
        setExpenses(expensesData.slice(0, 4))
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
      { bg: "bg-gray-100", text: "text-gray-600" },
      { bg: "bg-blue-100", text: "text-blue-600" },
      { bg: "bg-green-100", text: "text-green-600" },
      { bg: "bg-purple-100", text: "text-purple-600" },
      { bg: "bg-yellow-100", text: "text-yellow-600" },
      { bg: "bg-pink-100", text: "text-pink-600" }
    ];
    
    if (!categoryId) return colors[0];
    return colors[(categoryId % colors.length) || 0];
  }

  // Get category name
  const getCategoryName = (categoryId: number | null) => {
    const categories = [
      "Uncategorized",
      "Office Supplies",
      "Software",
      "Travel",
      "Meals",
      "Marketing"
    ];
    
    if (!categoryId) return categories[0];
    return categories[categoryId] || categories[0];
  }

  // Get category icon
  const getCategoryIcon = (categoryId: number | null) => {
    switch(categoryId) {
      case 1: return <Receipt className="h-5 w-5" />;
      case 2: return <FileText className="h-5 w-5" />;
      case 3: return <ExternalLink className="h-5 w-5" />;
      case 4: return <DollarSign className="h-5 w-5" />;
      case 5: return <TrendingUp className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Hi {user?.name?.split(' ')[0] || 'there'}, let's track your expenses
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric', 
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddExpense} className="whitespace-nowrap">
              <Camera className="mr-2 h-4 w-4" /> Scan Receipt
            </Button>
            <Button variant="outline" className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" /> Log Manually
            </Button>
          </div>
        </div>
      </header>

      {/* Summary Stats (Mobile: vertical, Desktop: horizontal) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Today's Spend */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-sm">Today's Spend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? '—' : formatCurrency(todayTotal || 0)}
                </div>
                <div className="flex items-center mt-1 text-xs font-medium text-green-600">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span>15% less than yesterday</span>
                </div>
              </div>
              <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Deductible */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-sm">Monthly Deductible</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="w-full pr-4">
                <div className="text-2xl font-bold">
                  {isLoading ? '—' : formatCurrency(monthlyDeductible || 0)}
                </div>
                <div className="w-full mt-2">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="text-xs mt-1 text-gray-500">65% of monthly goal</div>
                </div>
              </div>
              <div className="h-11 w-11 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax Savings */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-sm">Saved in Taxes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? '—' : formatCurrency(taxSavings || 0)}
                </div>
                <div className="flex items-center mt-1 text-xs font-medium text-blue-600">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span>8% more than last month</span>
                </div>
              </div>
              <div className="h-11 w-11 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Expenses Section - Left Column (8 units) */}
        <section className="lg:col-span-8 space-y-6">
          {/* Recent Expenses Card */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
              <div>
                <CardTitle className="text-xl">Recent Expenses</CardTitle>
                <CardDescription className="text-sm mt-1">Your latest transactions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/expenses">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-1">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-2 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              ) : expenses.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {expenses.map((expense) => {
                    const categoryColor = getCategoryColor(expense.categoryId);
                    
                    return (
                      <li key={expense.id} className="py-3 first:pt-0 last:pb-0">
                        <Link href={`/expenses/${expense.id}`} className="flex items-center gap-3 group">
                          <div className={`w-9 h-9 rounded-full ${categoryColor.bg} flex items-center justify-center flex-shrink-0`}>
                            {getCategoryIcon(expense.categoryId)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {expense.vendor}
                              </p>
                              <p className={`font-medium text-sm ${expense.isBusinessExpense ? 'text-green-600' : 'text-gray-900'}`}>
                                {formatCurrency(expense.amount)}
                              </p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500 truncate">
                                {getCategoryName(expense.categoryId)} • {new Date(expense.date).toLocaleDateString()}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${expense.isBusinessExpense ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                {expense.isBusinessExpense ? 'Business' : 'Personal'}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No recent expenses found</p>
                  <Button onClick={handleAddExpense}>
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                  </Button>
                </div>
              )}
            </CardContent>
            {expenses.length > 0 && (
              <CardFooter className="border-t pt-4 text-sm text-muted-foreground flex justify-between items-center">
                <span>Showing {expenses.length} of {expenses.length} entries</span>
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                  <FileText className="mr-1 h-3 w-3" /> Export CSV
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* Quick Actions - Mobile Only */}
          <div className="block lg:hidden">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription className="text-sm mt-1">Frequently used tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <Calendar className="h-5 w-5 mb-2" />
                    <span className="text-sm">Tax Calendar</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <FileText className="h-5 w-5 mb-2" />
                    <span className="text-sm">Generate Report</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <Clock className="h-5 w-5 mb-2" />
                    <span className="text-sm">Recurring</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <BarChart3 className="h-5 w-5 mb-2" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Right Sidebar - (4 units) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Category Breakdown */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Category Breakdown</CardTitle>
              <CardDescription className="text-sm mt-1">Business expenses by category</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-24 bg-gray-200 rounded-lg w-full mb-4"></div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center py-1">
                      <div className="h-3 w-3 rounded-full bg-gray-200 mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-12 ml-2"></div>
                    </div>
                  ))}
                </div>
              ) : categoryBreakdown.length > 0 ? (
                <div>
                  {/* Simplified chart placeholder */}
                  <div className="relative h-32 mb-4 flex items-center justify-center">
                    <div className="flex flex-wrap justify-center gap-2">
                      {categoryBreakdown.map((category) => {
                        const color = getCategoryColor(category.categoryId);
                        const size = Math.max(30, Math.min(60, category.percentage * 0.8));
                        
                        return (
                          <div 
                            key={category.categoryId}
                            className={`rounded-full ${color.bg} flex items-center justify-center`}
                            style={{ width: `${size}px`, height: `${size}px` }}
                          >
                            <span className={`text-xs font-semibold ${color.text}`}>
                              {Math.round(category.percentage)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <ul className="space-y-2">
                    {categoryBreakdown.map((category) => {
                      const color = getCategoryColor(category.categoryId);
                      
                      return (
                        <li key={category.categoryId} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${color.bg}`}></div>
                            <span className="text-gray-700">{category.categoryName}</span>
                          </div>
                          <span className="font-medium">{category.percentage}%</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-2 text-sm">No category data available</p>
                  <Button variant="outline" size="sm" onClick={handleAddExpense}>
                    <Plus className="mr-2 h-4 w-4" /> Add Expenses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions - Desktop Only */}
          <div className="hidden lg:block">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription className="text-sm mt-1">Frequently used tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <Calendar className="h-5 w-5 mb-2" />
                    <span className="text-sm">Tax Calendar</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <FileText className="h-5 w-5 mb-2" />
                    <span className="text-sm">Generate Report</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <Clock className="h-5 w-5 mb-2" />
                    <span className="text-sm">Recurring</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                    <BarChart3 className="h-5 w-5 mb-2" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  )
}