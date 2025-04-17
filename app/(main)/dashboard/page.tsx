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
  ArrowRight
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
    const colors = ["bg-blue-100", "bg-green-100", "bg-purple-100", "bg-yellow-100", "bg-pink-100"];
    if (!categoryId) return "bg-gray-100 text-gray-500";
    return `${colors[categoryId % colors.length]} text-${colors[categoryId % colors.length].replace('bg-', '').replace('100', '600')}`;
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

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Hi {user?.name?.split(' ')[0] || 'there'}, let's track your expenses
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric', 
              year: 'numeric'
            })}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button onClick={handleAddExpense}>
            <Camera className="mr-2 h-4 w-4" /> Scan Receipt
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Log Manually
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Stats Cards Row */}
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardDescription>Today's Spend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {isLoading ? '—' : formatCurrency(todayTotal || 0)}
                </div>
                <div className="flex items-center mt-1 text-xs font-medium text-green-600">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span>15% less than yesterday</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardDescription>Monthly Deductible</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {isLoading ? '—' : formatCurrency(monthlyDeductible || 0)}
                </div>
                <div className="w-full mt-2">
                  <div className="h-2 w-full bg-gray-100 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="text-xs mt-1 text-gray-500">65% of monthly goal</div>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardDescription>Saved in Taxes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {isLoading ? '—' : formatCurrency(taxSavings || 0)}
                </div>
                <div className="flex items-center mt-1 text-xs font-medium text-blue-600">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  <span>8% more than last month</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area - 2/3 width */}
        <div className="md:col-span-2">
          <Card className="bg-white h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/expenses">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
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
                <div className="divide-y">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center py-3">
                      <div className={`w-10 h-10 rounded-full ${getCategoryColor(expense.categoryId)} flex items-center justify-center mr-3`}>
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{expense.vendor}</div>
                        <div className="text-sm text-muted-foreground">
                          {getCategoryName(expense.categoryId)} • {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`font-medium ${expense.isBusinessExpense ? 'text-green-600' : ''}`}>
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No recent expenses found</p>
                  <Button onClick={handleAddExpense}>
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                <div>Showing {expenses.length} of {expenses.length} entries</div>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" /> Export Report
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar Content - 1/3 width */}
        <div className="space-y-6">
          {/* Category Breakdown */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Business expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-32 bg-gray-200 rounded-lg w-full mb-4"></div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-gray-200 mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-12 ml-2"></div>
                    </div>
                  ))}
                </div>
              ) : categoryBreakdown.length > 0 ? (
                <div>
                  <div className="relative h-48 mb-6">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <BarChart3 className="h-24 w-24 opacity-20" />
                      <div className="absolute">
                        <div className="text-center">
                          <div className="text-xl font-bold">Category</div>
                          <div className="text-sm">Distribution</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {categoryBreakdown.map((category) => (
                      <div key={category.categoryId} className="flex items-center">
                        <div className={`h-3 w-3 rounded-full ${getCategoryColor(category.categoryId)} mr-2`}></div>
                        <span className="flex-1">{category.categoryName}</span>
                        <span className="font-medium">{category.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-2">No category data available</p>
                  <Button variant="outline" size="sm" onClick={handleAddExpense}>
                    <Plus className="mr-2 h-4 w-4" /> Add Expenses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Tax Calendar</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>Generate Report</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <Clock className="h-6 w-6 mb-2" />
                  <span>Recurring</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  <span>Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}