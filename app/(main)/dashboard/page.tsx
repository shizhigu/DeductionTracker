"use client"

import { useEffect, useState } from "react"
import { 
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  Camera,
  FileText,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useUserStore } from "@/store/use-user-store"
import { formatCurrency } from "@/lib/utils"

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

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Hi {user?.name?.split(' ')[0] || 'there'}, let's log your day's expenses
        </h1>
        <p className="text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Today's Spend */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Today's Spend</span>
            <span className="bg-blue-50 p-2 rounded-md">
              <DollarSign className="h-4 w-4 text-blue-500" />
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">
              {isLoading ? '—' : formatCurrency(todayTotal || 0)}
            </span>
            <span className="ml-2 text-xs font-medium text-green-500">+15% than yesterday</span>
          </div>
        </div>

        {/* Monthly Deductible */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Monthly Deductible</span>
            <span className="bg-green-50 p-2 rounded-md">
              <CreditCard className="h-4 w-4 text-green-500" />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {isLoading ? '—' : formatCurrency(monthlyDeductible || 0)}
            </span>
            <div className="mt-2 flex flex-col">
              <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <span className="text-xs text-gray-500 mt-1">60% of monthly goal</span>
            </div>
          </div>
        </div>

        {/* Saved in Taxes */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500">Saved in Taxes</span>
            <span className="bg-purple-50 p-2 rounded-md">
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">
              {isLoading ? '—' : formatCurrency(taxSavings || 0)}
            </span>
            <span className="ml-2 text-xs font-medium text-blue-500">+8% more than last month</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 mb-6">
        <Button onClick={handleAddExpense} className="shadow-sm">
          <Camera className="h-4 w-4 mr-2" /> Scan Receipt
        </Button>
        <Button variant="outline" className="shadow-sm">
          <Calendar className="h-4 w-4 mr-2" /> Log Manually
        </Button>
        <Button variant="outline" className="shadow-sm">
          <FileText className="h-4 w-4 mr-2" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold">Recent Expenses</h2>
            <a href="/expenses" className="text-sm text-blue-600 hover:underline">View All</a>
          </div>
          <div className="divide-y">
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="p-4 animate-pulse">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))
            ) : expenses.length > 0 ? (
              expenses.map((expense) => (
                <div key={expense.id} className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center text-blue-500">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium">{expense.vendor}</p>
                      <p className="text-sm text-gray-500">
                        {expense.isBusinessExpense ? 'Business' : 'Personal'}
                      </p>
                    </div>
                    <div className={`font-medium ${expense.isBusinessExpense ? 'text-green-600' : ''}`}>
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No recent expenses</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleAddExpense}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Expense
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold">Category Breakdown</h2>
            <div className="flex">
              <Button variant="outline" size="sm" className="mr-2 text-xs">Business</Button>
              <Button variant="ghost" size="sm" className="text-xs">All</Button>
            </div>
          </div>
          <div className="p-4">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="mx-auto w-48 h-48 rounded-full bg-gray-200 mb-4"></div>
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center">
                      <div className="h-3 bg-gray-200 rounded w-1/4 mr-2"></div>
                      <div className="h-2 bg-gray-200 rounded flex-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6 ml-2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : categoryBreakdown.length > 0 ? (
              <div className="relative flex items-center justify-center">
                {/* This would normally be a chart component */}
                <div className="rounded-full h-48 w-48 bg-gray-100 flex items-center justify-center mb-4">
                  <span className="text-lg font-medium text-gray-500">Chart Placeholder</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add expense dialog would be added here */}
    </div>
  )
}