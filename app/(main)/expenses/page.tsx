"use client"

import { useEffect, useState } from "react"
import { 
  Search, 
  Filter, 
  Calendar, 
  CreditCard,
  Plus,
  ArrowUpDown,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Expense, Category } from "@/database/schema"

export default function ExpensesPage() {
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [showBusinessOnly, setShowBusinessOnly] = useState(false)
  const [showDeductibleOnly, setShowDeductibleOnly] = useState(false)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  
  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Fetch expenses and categories
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [expensesResponse, categoriesResponse] = await Promise.all([
          fetch('/api/expenses'),
          fetch('/api/categories')
        ])

        if (!expensesResponse.ok || !categoriesResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const expensesData = await expensesResponse.json()
        const categoriesData = await categoriesResponse.json()

        setExpenses(expensesData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load expenses. Please try again later."
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Filter expenses based on search term and filters
  const filteredExpenses = expenses.filter(expense => {
    // Filter by search term
    if (searchTerm && 
        !expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return false
    }
    
    // Filter by category
    if (selectedCategoryId !== null && expense.categoryId !== selectedCategoryId) {
      return false
    }
    
    // Filter by business expenses
    if (showBusinessOnly && !expense.isBusinessExpense) {
      return false
    }
    
    // Filter by tax deductible
    if (showDeductibleOnly && !expense.isTaxDeductible) {
      return false
    }
    
    return true
  })

  // Get category name by ID
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Uncategorized"
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : "Uncategorized"
  }

  // Get category color
  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId) return "bg-gray-100 text-gray-600"
    
    const category = categories.find(c => c.id === categoryId)
    if (!category) return "bg-gray-100 text-gray-600"
    
    switch (category.color) {
      case "blue": return "bg-blue-100 text-blue-600"
      case "green": return "bg-green-100 text-green-600"
      case "purple": return "bg-purple-100 text-purple-600"
      case "orange": return "bg-orange-100 text-orange-600"
      case "pink": return "bg-pink-100 text-pink-600"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  // Get expense type label
  const getExpenseTypeLabel = (expense: Expense) => {
    if (expense.isTaxDeductible) return { label: "Deductible", color: "text-green-700 bg-green-50" }
    if (expense.isBusinessExpense) return { label: "Business", color: "text-blue-700 bg-blue-50" }
    return { label: "Personal", color: "text-gray-700 bg-gray-50" }
  }

  return (
    <div className="px-4 py-6 md:px-6 lg:px-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Expenses</h1>
          <p className="text-gray-500">Track and manage all your business expenses</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Expense
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4 md:space-y-0 md:grid md:grid-cols-12 md:gap-4">
        <div className="relative md:col-span-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search expenses..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 md:col-span-7 md:justify-end">
          <div className="relative">
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            >
              <Filter className="h-4 w-4 mr-2" /> Filters <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            
            {isFilterMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-lg rounded-md border border-gray-200 p-4 z-10">
                <h3 className="font-medium mb-2">Filter by</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <select 
                      className="w-full border-gray-300 rounded-md"
                      value={selectedCategoryId === null ? "" : selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="business-only" 
                      className="h-4 w-4"
                      checked={showBusinessOnly}
                      onChange={(e) => setShowBusinessOnly(e.target.checked)}
                    />
                    <label htmlFor="business-only" className="ml-2 text-sm">Business expenses only</label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="deductible-only" 
                      className="h-4 w-4"
                      checked={showDeductibleOnly}
                      onChange={(e) => setShowDeductibleOnly(e.target.checked)}
                    />
                    <label htmlFor="deductible-only" className="ml-2 text-sm">Tax deductible only</label>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedCategoryId(null)
                      setShowBusinessOnly(false)
                      setShowDeductibleOnly(false)
                      setIsFilterMenuOpen(false)
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" /> Date Range
          </Button>
          
          <Button variant="outline">
            <ArrowUpDown className="h-4 w-4 mr-2" /> Sort
          </Button>
        </div>
      </div>

      {/* Expense List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-md"></div>
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredExpenses.length > 0 ? (
        <div className="space-y-4">
          {filteredExpenses.map(expense => {
            const typeInfo = getExpenseTypeLabel(expense)
            return (
              <div 
                key={expense.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center ${getCategoryColor(expense.categoryId)}`}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium">{expense.vendor}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="mr-3">{getCategoryName(expense.categoryId)}</span>
                      <span>{formatDate(new Date(expense.date))}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(expense.amount)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategoryId !== null || showBusinessOnly || showDeductibleOnly
                ? "Try adjusting your filters or search term"
                : "Get started by adding your first expense"}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Expense
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}