"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { isMobile } from 'react-device-detect'
import { 
  LayoutDashboard,
  Receipt,
  Tag,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  User as UserIcon,
  ChevronRight,
  Home,
  BarChart4,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserStore } from "@/store/use-user-store"

// Material UI imports for enhanced mobile experience
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Divider from '@mui/material/Divider'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'
import Fab from '@mui/material/Fab'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const { user } = useUserStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileView, setMobileView] = useState(false)
  const [bottomNavValue, setBottomNavValue] = useState(0)
  
  // Navigation links configuration
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      mobileIcon: <Home size={24} />
    },
    {
      title: "Expenses",
      href: "/expenses",
      icon: <Receipt size={20} />,
      mobileIcon: <Receipt size={24} />
    },
    {
      title: "Categories",
      href: "/categories",
      icon: <Tag size={20} />,
      mobileIcon: <Tag size={24} />
    },
    {
      title: "Tax Reports",
      href: "/tax-reports",
      icon: <FileText size={20} />,
      mobileIcon: <BarChart4 size={24} />
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings size={20} />,
      mobileIcon: <MoreHorizontal size={24} />
    },
  ]

  // Initial setup 
  useEffect(() => {
    setMobileView(window.innerWidth < 1024 || isMobile)
    
    const handleResize = () => {
      setMobileView(window.innerWidth < 1024 || isMobile)
    }
    
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  
  // Close drawers on navigation
  useEffect(() => {
    setDrawerOpen(false)
    setUserMenuOpen(false)
    
    // Set bottom nav value based on pathname
    const index = navItems.findIndex(item => item.href === pathname)
    if (index !== -1) {
      setBottomNavValue(index)
    }
  }, [pathname])
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U'
    
    const nameParts = user.name.split(' ')
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()
    
    return (
      nameParts[0].charAt(0) + 
      nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase()
  }

  // Drawer toggle handlers
  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open)
  }

  // Drawer content
  const drawerContent = (
    <Box sx={{ width: 280, pt: 1 }} role="presentation">
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/dashboard" className="flex items-center" onClick={() => setDrawerOpen(false)}>
          <div className="h-9 w-9 rounded-md bg-blue-600 flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            DeduX
          </span>
        </Link>
        <IconButton onClick={toggleDrawer(false)}>
          <X size={20} />
        </IconButton>
      </div>
      
      <List sx={{ pt: 2 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <ListItem key={item.href} disablePadding>
              <ListItemButton 
                component={Link} 
                href={item.href}
                selected={isActive}
                sx={{
                  my: 0.5,
                  mx: 1,
                  borderRadius: 1,
                  color: isActive ? 'primary.main' : 'text.primary',
                  bgcolor: isActive ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? 'action.selected' : 'action.hover',
                  },
                  '& .MuiListItemIcon-root': {
                    color: isActive ? 'primary.main' : 'text.secondary',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
                {isActive && (
                  <ChevronRight size={16} className="text-blue-600" />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <div className="px-4 py-3">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={user?.name || "User"} />
            <AvatarFallback>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.username || "user@example.com"}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="w-full">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button variant="outline" size="sm" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </Box>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar - only visible on lg screens and up */}
      <aside className="fixed inset-y-0 left-0 hidden lg:flex lg:w-64 flex-col z-20 
                       transform transition-all duration-300 ease-in-out
                       bg-gradient-to-b from-white to-slate-50 border-r border-slate-200">
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center">
            <div className="h-10 w-10 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              DeduX
            </h1>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-4 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-50 text-blue-600 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                      }
                    `}
                  >
                    <span className={`mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.title}</span>
                    {isActive && (
                      <span className="ml-auto">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="px-4 py-4 border-t border-slate-200">
          <div className="flex items-center p-3 bg-slate-50 rounded-lg mb-4">
            <Avatar className="h-10 w-10 ring-2 ring-white">
              <AvatarImage src="" alt={user?.name || "User"} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.username || "user@example.com"}</p>
            </div>
            <IconButton size="small" className="text-slate-400 hover:text-slate-600">
              <Settings size={18} />
            </IconButton>
          </div>
          
          <Button variant="outline" size="sm" className="w-full flex items-center justify-center text-slate-600 border-slate-300">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm flex items-center px-4 z-10 lg:hidden">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 1 }}
            >
              <Menu size={24} />
            </IconButton>
            
            <Link href="/dashboard" className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <h1 className="ml-2 text-lg font-bold">DeduX</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-1">
            <IconButton size="small" className="text-slate-500">
              <Search size={20} />
            </IconButton>
            <IconButton size="small" className="text-slate-500">
              <Bell size={20} />
            </IconButton>
            <IconButton 
              size="small" 
              className="text-slate-500"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </IconButton>
          </div>
        </div>
        
        {/* Mobile User Menu */}
        {userMenuOpen && (
          <div className="absolute right-4 top-16 w-56 bg-white shadow-lg rounded-lg overflow-hidden z-20 animate-in slide-in-from-top">
            <div className="p-3 border-b border-slate-100">
              <p className="font-medium text-slate-900">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500">{user?.username || "user@example.com"}</p>
            </div>
            <div className="py-1">
              <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <UserIcon size={16} className="mr-3 text-slate-400" />
                My Profile
              </Link>
              <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Settings size={16} className="mr-3 text-slate-400" />
                Settings
              </Link>
            </div>
            <div className="border-t border-slate-100 py-1">
              <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-slate-50">
                <LogOut size={16} className="mr-3" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>
      
      {/* Mobile Navigation Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        disableBackdropTransition={true}
        sx={{
          '& .MuiDrawer-paper': {
            width: '80%',
            maxWidth: 300,
            boxSizing: 'border-box',
          },
          display: { lg: 'none' }
        }}
      >
        {drawerContent}
      </SwipeableDrawer>
      
      {/* Bottom Navigation for Mobile */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 10,
          display: { lg: 'none' },
          borderRadius: 0,
          boxShadow: '0px -1px 3px rgba(0,0,0,0.05)'
        }} 
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={bottomNavValue}
          onChange={(_, newValue) => {
            setBottomNavValue(newValue);
          }}
          sx={{ 
            height: 64, 
            '& .MuiBottomNavigationAction-root': {
              padding: '6px 0 8px',
              minWidth: 'auto',
              '&.Mui-selected': {
                color: theme => theme.palette.primary.main,
              }
            },
          }}
        >
          {navItems.map((item, index) => (
            <BottomNavigationAction 
              key={item.href}
              label={<span className="text-xs">{item.title}</span>}
              icon={item.mobileIcon}
              component={Link}
              href={item.href}
              sx={{
                color: pathname === item.href ? 'primary.main' : 'text.secondary',
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
      
      {/* Main Content Container */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 pb-16 lg:pb-0 transition-all duration-300">
        <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}