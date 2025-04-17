"use client"

import React, { useEffect, useState } from "react"
import { isMobile } from 'react-device-detect'
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
  ArrowRight,
  Receipt,
  CircleDollarSign,
  Filter,
  ChevronDown,
  Clock,
  PiggyBank,
  BookOpen,
  UserCheck,
  Wallet,
  CalendarCheck,
  Share2,
  Sparkles,
  CreditCard as CreditCardIcon
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useUserStore } from "@/store/use-user-store"
import { formatCurrency, formatReadableDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts'

// Material UI components for enhanced UI
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Fab from '@mui/material/Fab'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import ButtonGroup from '@mui/material/ButtonGroup'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

// Type definitions
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

// Custom components
const QuickAddFab = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 80, sm: 80, md: 30 },
          right: 30,
          zIndex: 10,
          display: { xs: 'block', lg: 'block' }
        }}
      >
        <Fab 
          color="primary" 
          aria-label="add"
          onClick={handleClick}
          sx={{ 
            boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
          }}
        >
          <Plus />
        </Fab>
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={handleClose} sx={{ minWidth: 150 }}>
          <Camera className="h-4 w-4 mr-2" /> Scan Receipt
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Plus className="h-4 w-4 mr-2" /> Add Manually
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Clock className="h-4 w-4 mr-2" /> Recurring Expense
        </MenuItem>
      </Menu>
    </>
  );
};

const ExpenseItem = ({ expense, category, icon }: { expense: Expense, category: string, icon: React.ReactNode }) => (
  <Box 
    component={Paper} 
    elevation={0} 
    sx={{ 
      p: 1.5, 
      mb: 1,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      '&:hover': {
        bgcolor: 'action.hover'
      },
      transition: 'all 0.2s'
    }}
  >
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar 
        sx={{ 
          bgcolor: expense.isBusinessExpense ? 'primary.50' : 'grey.100',
          color: expense.isBusinessExpense ? 'primary.main' : 'grey.700'
        }}
      >
        {icon}
      </Avatar>
      
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography 
          variant="subtitle2" 
          noWrap
          sx={{ fontWeight: 600 }}
        >
          {expense.vendor}
        </Typography>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          component="div"
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {category}
          <Box component="span" sx={{ mx: 0.5 }}>•</Box>
          {formatReadableDate(expense.date)}
        </Typography>
      </Box>
      
      <Box sx={{ textAlign: 'right' }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 700,
            color: expense.isBusinessExpense ? 'success.main' : 'text.primary' 
          }}
        >
          {formatCurrency(expense.amount)}
        </Typography>
        <Chip
          label={expense.isBusinessExpense ? "Business" : "Personal"}
          size="small"
          color={expense.isBusinessExpense ? "primary" : "default"}
          variant={expense.isBusinessExpense ? "filled" : "outlined"}
          sx={{ 
            height: 20, 
            fontSize: '0.65rem',
            "& .MuiChip-label": { px: 1 }
          }}
        />
      </Box>
    </Stack>
  </Box>
);

// Dashboard Component
export default function DashboardPage() {
  const { user } = useUserStore()
  const { toast } = useToast()
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [chartPeriod, setChartPeriod] = useState('6m')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  
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
    { name: 'Jan', business: 2400, personal: 1300, total: 3700 },
    { name: 'Feb', business: 1398, personal: 900, total: 2298 },
    { name: 'Mar', business: 9800, personal: 1800, total: 11600 },
    { name: 'Apr', business: 3908, personal: 2000, total: 5908 },
    { name: 'May', business: 4800, personal: 1500, total: 6300 },
    { name: 'Jun', business: 3800, personal: 1700, total: 5500 },
  ];

  // Initial setup
  useEffect(() => {
    setViewMode(window.innerWidth < 1024 || isMobile ? 'mobile' : 'desktop')
    
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 || isMobile ? 'mobile' : 'desktop')
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
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
        
        // Get only the latest expenses
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

  // Get category details
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

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Uncategorized";
    
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Uncategorized";
  }

  const getCategoryIcon = (categoryId: number | null) => {
    switch(categoryId) {
      case 1: return <DollarSign className="h-5 w-5" />;
      case 2: return <FileText className="h-5 w-5" />;
      case 3: return <CreditCardIcon className="h-5 w-5" />;
      case 4: return <Wallet className="h-5 w-5" />;
      case 5: return <BookOpen className="h-5 w-5" />;
      default: return <Receipt className="h-5 w-5" />;
    }
  };

  // Chart data preparation
  const chartData = categoryBreakdown.map(category => ({
    ...category,
    color: getCategoryColor(category.categoryId).chartColor
  }));

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Monthly goal progress (mocked value)
  const monthlyGoalProgress = 65;

  return (
    <div>
      {/* Quick Add Floating Action Button - Mobile & Tablet */}
      <QuickAddFab />
      
      {/* Welcome Header */}
      <Box 
        sx={{ 
          mb: { xs: 3, md: 5 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            Welcome back, {user?.name?.split(' ')[0] || 'there'}!
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric', 
              year: 'numeric'
            })}
          </Typography>
        </Box>
        
        {/* Hide these buttons on mobile - using FAB instead */}
        <Stack 
          direction="row" 
          spacing={1.5}
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          <Button>
            <Camera className="mr-2 h-4 w-4" /> Scan Receipt
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </Stack>
      </Box>
      
      {/* Financial Overview Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {/* Today's Spending */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            component={Paper} 
            elevation={0}
            sx={{ 
              p: 2, 
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              border: '1px solid #e3f2fd',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'primary.dark',
                fontWeight: 600,
                mb: 1
              }}
            >
              Today's Spending
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography 
                variant="h5" 
                component="div"
                sx={{ 
                  fontWeight: 700,
                  color: 'primary.dark' 
                }}
              >
                {isLoading ? '—' : formatCurrency(todayTotal || 0)}
              </Typography>
              
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.light',
                  width: 36,
                  height: 36
                }}
              >
                <DollarSign className="h-5 w-5 text-white" />
              </Avatar>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <Typography 
                variant="caption"
                sx={{ 
                  ml: 0.5,
                  color: 'success.main',
                  fontWeight: 500
                }}
              >
                15% less than yesterday
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Monthly Deductible */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            component={Paper} 
            elevation={0}
            sx={{ 
              p: 2, 
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
              border: '1px solid #e8f5e9',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'success.dark',
                fontWeight: 600,
                mb: 1
              }}
            >
              Monthly Deductible
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography 
                variant="h5" 
                component="div"
                sx={{ 
                  fontWeight: 700,
                  color: 'success.dark' 
                }}
              >
                {isLoading ? '—' : formatCurrency(monthlyDeductible || 0)}
              </Typography>
              
              <Avatar 
                sx={{ 
                  bgcolor: 'success.light',
                  width: 36,
                  height: 36
                }}
              >
                <TrendingUp className="h-5 w-5 text-white" />
              </Avatar>
            </Box>
            
            <Box sx={{ width: '100%', mt: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={monthlyGoalProgress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 1,
                  bgcolor: 'success.100',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'success.main'
                  }
                }}
              />
              <Typography 
                variant="caption"
                sx={{ 
                  display: 'block',
                  mt: 0.5,
                  color: 'success.dark'
                }}
              >
                {monthlyGoalProgress}% of monthly goal
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Tax Savings */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            component={Paper} 
            elevation={0}
            sx={{ 
              p: 2,
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
              border: '1px solid #f3e5f5',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'secondary.dark',
                fontWeight: 600,
                mb: 1
              }}
            >
              Tax Savings
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography 
                variant="h5" 
                component="div"
                sx={{ 
                  fontWeight: 700,
                  color: 'secondary.dark' 
                }}
              >
                {isLoading ? '—' : formatCurrency(taxSavings || 0)}
              </Typography>
              
              <Avatar 
                sx={{ 
                  bgcolor: 'secondary.light',
                  width: 36,
                  height: 36
                }}
              >
                <PiggyBank className="h-5 w-5 text-white" />
              </Avatar>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <ArrowUpRight className="h-3 w-3 text-indigo-600" />
              <Typography 
                variant="caption"
                sx={{ 
                  ml: 0.5,
                  color: 'secondary.dark',
                  fontWeight: 500
                }}
              >
                8% more than last month
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Upcoming Tax Due */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            component={Paper} 
            elevation={0}
            sx={{ 
              p: 2, 
              height: '100%',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #fff8e1 0%, #ffe082 100%)',
              border: '1px solid #fff8e1',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'warning.dark',
                fontWeight: 600,
                mb: 1
              }}
            >
              Projected Q1 Tax
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography 
                variant="h5" 
                component="div"
                sx={{ 
                  fontWeight: 700,
                  color: 'warning.dark' 
                }}
              >
                {isLoading ? '—' : formatCurrency(2459.78)}
              </Typography>
              
              <Avatar 
                sx={{ 
                  bgcolor: 'warning.main',
                  width: 36,
                  height: 36
                }}
              >
                <Calculator className="h-5 w-5 text-white" />
              </Avatar>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
              <Clock className="h-3 w-3 text-amber-700" />
              <Typography 
                variant="caption"
                sx={{ 
                  ml: 0.5,
                  color: 'warning.dark',
                  fontWeight: 500
                }}
              >
                Due in 37 days
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      
      {/* Main Content Area - Desktop Layout */}
      <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
        <Grid container spacing={3}>
          {/* Left Side - 8/12 */}
          <Grid item xs={12} lg={8}>
            {/* Expense Trend Chart */}
            <Box 
              component={Paper} 
              elevation={0}
              sx={{ 
                p: 2.5, 
                mb: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <div>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Expense Trends
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Business vs personal spending
                  </Typography>
                </div>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <ButtonGroup size="small" variant="outlined">
                    {['3m', '6m', '1y'].map((period) => (
                      <Button 
                        key={period}
                        variant={chartPeriod === period ? 'contained' : 'outlined'}
                        onClick={() => setChartPeriod(period)}
                        sx={{ 
                          fontSize: '0.75rem',
                          minWidth: '40px'
                        }}
                      >
                        {period}
                      </Button>
                    ))}
                  </ButtonGroup>
                  
                  <Button 
                    variant="outlined" 
                    size="small"
                    sx={{ fontSize: '0.75rem' }}
                    startIcon={<Filter size={14} />}
                  >
                    Filter
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={expenseTrendData}
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="business" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="personal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value/1000}k`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`$${value.toLocaleString()}`, undefined]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="business" 
                      name="Business" 
                      stroke="#3b82f6" 
                      fillOpacity={1}
                      fill="url(#business)" 
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="personal" 
                      name="Personal" 
                      stroke="#94a3b8" 
                      fillOpacity={1}
                      fill="url(#personal)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
            
            {/* Recent Expenses */}
            <Box 
              component={Paper} 
              elevation={0}
              sx={{ 
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, pb: 1.5 }}>
                <div>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Expenses
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your latest transactions
                  </Typography>
                </div>
                
                <Button 
                  component={Link}
                  href="/expenses"
                  endIcon={<ArrowRight className="h-4 w-4" />}
                  variant="text"
                  sx={{ color: 'primary.main' }}
                >
                  View All
                </Button>
              </Box>
              
              <Box sx={{ p: 2.5, pt: 0 }}>
                {isLoading ? (
                  <Stack spacing={1}>
                    {[1, 2, 3].map(i => (
                      <Box key={i} sx={{ display: 'flex', p: 1.5 }}>
                        <Box sx={{ mr: 2, width: 40, height: 40, borderRadius: '50%', bgcolor: 'grey.200' }} />
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ height: 16, width: '40%', bgcolor: 'grey.200', mb: 1, borderRadius: 1 }} />
                          <Box sx={{ height: 12, width: '20%', bgcolor: 'grey.200', borderRadius: 1 }} />
                        </Box>
                        <Box sx={{ width: 60, height: 20, bgcolor: 'grey.200', borderRadius: 1 }} />
                      </Box>
                    ))}
                  </Stack>
                ) : expenses.length > 0 ? (
                  <Stack spacing={1}>
                    {expenses.map(expense => (
                      <ExpenseItem 
                        key={expense.id}
                        expense={expense}
                        category={getCategoryName(expense.categoryId)}
                        icon={getCategoryIcon(expense.categoryId)}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <Receipt className="h-6 w-6" />
                    </Avatar>
                    <Typography variant="h6" sx={{ mb: 1 }}>No expenses yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 300, mx: 'auto' }}>
                      Start tracking your expenses to see them appear here.
                    </Typography>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Add First Expense
                    </Button>
                  </Box>
                )}
              </Box>
              
              {expenses.length > 0 && (
                <Box 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Showing {expenses.length} of {expenses.length} recent transactions
                  </Typography>
                  
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<FileText className="h-4 w-4" />}
                  >
                    Export CSV
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
          
          {/* Right Side - 4/12 */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Category Breakdown */}
              <Box 
                component={Paper} 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 2.5
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Category Breakdown
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Business expense distribution
                </Typography>
                
                {isLoading ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ height: 160, width: '100%', bgcolor: 'grey.100', borderRadius: 2, mb: 2 }} />
                    <Stack spacing={1}>
                      {[1, 2, 3].map(i => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'grey.200', mr: 1 }} />
                            <Box sx={{ width: 80, height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                          </Box>
                          <Box sx={{ width: 30, height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ) : categoryBreakdown.length > 0 ? (
                  <>
                    <Box sx={{ height: 180, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={70}
                            innerRadius={35}
                            fill="#8884d8"
                            dataKey="percentage"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Stack spacing={1.5}>
                        {categoryBreakdown.map(category => {
                          const color = getCategoryColor(category.categoryId);
                          return (
                            <Box 
                              key={category.categoryId} 
                              sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box 
                                  sx={{ 
                                    width: 10, 
                                    height: 10, 
                                    borderRadius: '50%', 
                                    mr: 1.5,
                                    backgroundColor: color.chartColor 
                                  }} 
                                />
                                <Typography variant="body2">{category.categoryName}</Typography>
                              </Box>
                              <Typography variant="body2" fontWeight={500}>{category.percentage}%</Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: 'grey.100',
                        color: 'text.secondary',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <BarChart3 className="h-6 w-6" />
                    </Avatar>
                    <Typography variant="h6" sx={{ mb: 1 }}>No data available</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Add business expenses to see your distribution.
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Upcoming Tax Dates */}
              <Box 
                component={Paper} 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 2.5
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Upcoming Tax Dates
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Important deadlines to remember
                </Typography>
                
                <Stack spacing={2}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'error.50',
                      border: '1px solid',
                      borderColor: 'error.100'
                    }}
                  >
                    <Stack direction="row" spacing={2}>
                      <Avatar sx={{ bgcolor: 'error.100', color: 'error.main' }}>
                        <Calendar className="h-5 w-5" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="error.dark">
                          Quarterly Estimated Tax
                        </Typography>
                        <Typography variant="caption" color="error.dark">
                          Due in 37 days (April 15, 2025)
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'primary.50',
                      border: '1px solid',
                      borderColor: 'primary.100'
                    }}
                  >
                    <Stack direction="row" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.100', color: 'primary.main' }}>
                        <FileText className="h-5 w-5" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="primary.dark">
                          W-2 and 1099 Forms
                        </Typography>
                        <Typography variant="caption" color="primary.dark">
                          Due in 92 days (June 15, 2025)
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
                
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Calendar className="h-4 w-4" />}
                  sx={{ mt: 2 }}
                >
                  View Tax Calendar
                </Button>
              </Box>
              
              {/* Quick Actions */}
              <Box 
                component={Paper} 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 2.5
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Quick Actions
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Frequently used tools
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ 
                        py: 1.5,
                        height: 'auto',
                        flexDirection: 'column',
                        color: 'primary.main',
                        borderColor: 'primary.100',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.50'
                        }
                      }}
                    >
                      <Calculator className="h-5 w-5 mb-1" />
                      <Typography variant="caption">Tax Calculator</Typography>
                    </Button>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ 
                        py: 1.5,
                        height: 'auto',
                        flexDirection: 'column',
                        color: 'success.main',
                        borderColor: 'success.100',
                        '&:hover': {
                          borderColor: 'success.main',
                          bgcolor: 'success.50'
                        }
                      }}
                    >
                      <FileText className="h-5 w-5 mb-1" />
                      <Typography variant="caption">Generate Report</Typography>
                    </Button>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ 
                        py: 1.5,
                        height: 'auto',
                        flexDirection: 'column',
                        color: 'secondary.main',
                        borderColor: 'secondary.100',
                        '&:hover': {
                          borderColor: 'secondary.main',
                          bgcolor: 'secondary.50'
                        }
                      }}
                    >
                      <Sparkles className="h-5 w-5 mb-1" />
                      <Typography variant="caption">Tax Insights</Typography>
                    </Button>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{ 
                        py: 1.5,
                        height: 'auto',
                        flexDirection: 'column',
                        color: 'warning.main',
                        borderColor: 'warning.100',
                        '&:hover': {
                          borderColor: 'warning.main',
                          bgcolor: 'warning.50'
                        }
                      }}
                    >
                      <CircleDollarSign className="h-5 w-5 mb-1" />
                      <Typography variant="caption">Set Budget</Typography>
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
      
      {/* Mobile Layout */}
      <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
        {/* Tabs for Mobile */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 3,
                py: 1.5
              }
            }}
          >
            <Tab label="Overview" />
            <Tab label="Expenses" />
            <Tab label="Analytics" />
            <Tab label="Tax Dates" />
          </Tabs>
        </Box>
        
        {/* Overview Tab Panel */}
        {tabValue === 0 && (
          <Stack spacing={3}>
            {/* Line chart of spending */}
            <Box 
              component={Paper}
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Spending Trend
                </Typography>
                
                <ButtonGroup size="small" variant="outlined">
                  {['3m', '6m', '1y'].map((period) => (
                    <Button 
                      key={period}
                      variant={chartPeriod === period ? 'contained' : 'outlined'}
                      onClick={() => setChartPeriod(period)}
                      sx={{ 
                        minWidth: 'unset',
                        px: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      {period}
                    </Button>
                  ))}
                </ButtonGroup>
              </Box>
              
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={expenseTrendData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value/1000}k`}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip formatter={(value: any) => [`$${value}`, undefined]} />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Total" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
            
            {/* Category breakdown */}
            <Box 
              component={Paper}
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Category Breakdown
              </Typography>
              
              {isLoading ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ height: 100, width: '100%', bgcolor: 'grey.100', borderRadius: 2, mb: 2 }} />
                </Box>
              ) : categoryBreakdown.length > 0 ? (
                <Stack spacing={1}>
                  {categoryBreakdown.map(category => {
                    const color = getCategoryColor(category.categoryId);
                    return (
                      <Box 
                        key={category.categoryId} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          p: 0.5
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: 10, 
                            height: 10, 
                            borderRadius: '50%', 
                            mr: 1.5,
                            backgroundColor: color.chartColor 
                          }} 
                        />
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {category.categoryName}
                        </Typography>
                        <Box 
                          sx={{ 
                            flexGrow: 1, 
                            mx: 1, 
                            height: 6, 
                            bgcolor: 'grey.100',
                            borderRadius: 3,
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <Box 
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              height: '100%',
                              width: `${category.percentage}%`,
                              bgcolor: color.chartColor,
                              borderRadius: 3
                            }}
                          />
                        </Box>
                        <Typography variant="caption" fontWeight={500} sx={{ minWidth: 30, textAlign: 'right' }}>
                          {category.percentage}%
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No category data available
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Recent Expenses */}
            <Box 
              component={Paper}
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Recent Expenses
                </Typography>
                
                <Button 
                  component={Link}
                  href="/expenses"
                  endIcon={<ArrowRight className="h-4 w-4" />}
                  variant="text"
                  sx={{ 
                    color: 'primary.main',
                    p: 0,
                    minWidth: 'unset',
                    fontSize: '0.75rem'
                  }}
                >
                  View All
                </Button>
              </Box>
              
              {isLoading ? (
                <Stack spacing={1}>
                  {[1, 2].map(i => (
                    <Box key={i} sx={{ display: 'flex', p: 1 }}>
                      <Box sx={{ mr: 2, width: 36, height: 36, borderRadius: '50%', bgcolor: 'grey.200' }} />
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ height: 14, width: '40%', bgcolor: 'grey.200', mb: 1, borderRadius: 1 }} />
                        <Box sx={{ height: 10, width: '20%', bgcolor: 'grey.200', borderRadius: 1 }} />
                      </Box>
                      <Box sx={{ width: 50, height: 18, bgcolor: 'grey.200', borderRadius: 1 }} />
                    </Box>
                  ))}
                </Stack>
              ) : expenses.length > 0 ? (
                <Stack spacing={0.5}>
                  {expenses.slice(0, 3).map(expense => (
                    <ExpenseItem 
                      key={expense.id}
                      expense={expense}
                      category={getCategoryName(expense.categoryId)}
                      icon={getCategoryIcon(expense.categoryId)}
                    />
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    No expenses yet
                  </Typography>
                  <Button size="small">
                    <Plus className="mr-2 h-3 w-3" /> Add Expense
                  </Button>
                </Box>
              )}
            </Box>
            
            {/* Tax Deadlines */}
            <Box 
              component={Paper}
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Tax Deadlines
              </Typography>
              
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'error.50',
                  border: '1px solid',
                  borderColor: 'error.100',
                  mb: 1.5
                }}
              >
                <Stack direction="row" spacing={1.5}>
                  <Avatar sx={{ bgcolor: 'error.100', color: 'error.main', width: 32, height: 32 }}>
                    <Calendar className="h-4 w-4" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={500} color="error.dark">
                      Quarterly Estimated Tax
                    </Typography>
                    <Typography variant="caption" color="error.dark">
                      Due in 37 days
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Button
                fullWidth
                variant="outlined"
                size="small"
                startIcon={<Calendar className="h-4 w-4" />}
              >
                View Calendar
              </Button>
            </Box>
          </Stack>
        )}
        
        {/* Expenses Tab Panel */}
        {tabValue === 1 && (
          <Box>
            {/* Mobile Expenses List */}
            <Box 
              component={Paper}
              elevation={0}
              sx={{ 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
              }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  p: 2,
                  pb: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Recent Expenses
                </Typography>
                
                <Button
                  size="small"
                  variant="text"
                  endIcon={<Filter size={14} />}
                  sx={{ color: 'text.secondary' }}
                >
                  Filter
                </Button>
              </Box>
              
              {isLoading ? (
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    {[1, 2, 3, 4].map(i => (
                      <Box key={i} sx={{ display: 'flex', p: 1 }}>
                        <Box sx={{ mr: 2, width: 36, height: 36, borderRadius: '50%', bgcolor: 'grey.200' }} />
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ height: 14, width: '40%', bgcolor: 'grey.200', mb: 1, borderRadius: 1 }} />
                          <Box sx={{ height: 10, width: '20%', bgcolor: 'grey.200', borderRadius: 1 }} />
                        </Box>
                        <Box sx={{ width: 50, height: 18, bgcolor: 'grey.200', borderRadius: 1 }} />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ) : expenses.length > 0 ? (
                <Box sx={{ p: 2 }}>
                  <Stack spacing={1.5}>
                    {expenses.map(expense => (
                      <ExpenseItem 
                        key={expense.id}
                        expense={expense}
                        category={getCategoryName(expense.categoryId)}
                        icon={getCategoryIcon(expense.categoryId)}
                      />
                    ))}
                  </Stack>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Avatar 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Receipt className="h-5 w-5" />
                  </Avatar>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>No expenses yet</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start tracking your expenses
                  </Typography>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Expense
                  </Button>
                </Box>
              )}
              
              {expenses.length > 0 && (
                <Box 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    justifyContent: 'center',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Button
                    variant="text"
                    color="primary"
                    component={Link}
                    href="/expenses"
                    endIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View All Expenses
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
        
        {/* Analytics Tab */}
        {tabValue === 2 && (
          <Stack spacing={3}>
            {/* Analytics are simplified on mobile */}
            <Box 
              component={Paper}
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Expense Distribution
              </Typography>
              
              {isLoading ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box sx={{ height: 150, width: '100%', bgcolor: 'grey.100', borderRadius: 2, mb: 2 }} />
                </Box>
              ) : categoryBreakdown.length > 0 ? (
                <Box sx={{ height: 180, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={60}
                        innerRadius={30}
                        fill="#8884d8"
                        dataKey="percentage"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No category data available
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        )}
        
        {/* Tax Dates Tab */}
        {tabValue === 3 && (
          <Stack spacing={3}>
            <Box 
              component={Paper}
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Important Tax Dates
              </Typography>
              
              <Stack spacing={2}>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'error.50',
                    border: '1px solid',
                    borderColor: 'error.100'
                  }}
                >
                  <Stack direction="row" spacing={1.5}>
                    <Avatar sx={{ bgcolor: 'error.100', color: 'error.main', width: 36, height: 36 }}>
                      <Calendar className="h-4 w-4" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500} color="error.dark">
                        Quarterly Estimated Tax
                      </Typography>
                      <Typography variant="caption" color="error.dark">
                        Due in 37 days (April 15, 2025)
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'primary.50',
                    border: '1px solid',
                    borderColor: 'primary.100'
                  }}
                >
                  <Stack direction="row" spacing={1.5}>
                    <Avatar sx={{ bgcolor: 'primary.100', color: 'primary.main', width: 36, height: 36 }}>
                      <FileText className="h-4 w-4" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500} color="primary.dark">
                        W-2 and 1099 Forms
                      </Typography>
                      <Typography variant="caption" color="primary.dark">
                        Due in 92 days (June 15, 2025)
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<Calendar className="h-4 w-4" />}
                >
                  View Full Tax Calendar
                </Button>
              </Box>
            </Box>
          </Stack>
        )}
      </Box>
    </div>
  )
}