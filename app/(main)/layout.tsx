"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard,
  Receipt,
  Tag,
  FileText,
  Settings,
  Menu,
  X,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserStore } from "@/store/use-user-store"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const { user } = useUserStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Navigation links
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Expenses",
      href: "/expenses",
      icon: <Receipt className="h-5 w-5" />,
    },
    {
      title: "Categories",
      href: "/categories",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      title: "Tax Reports",
      href: "/tax-reports",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]
  
  // Close mobile menu on pathname change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])
  
  // Close menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  // Get user initials
  const getUserInitials = () => {
    if (!user?.name) return 'U'
    
    const nameParts = user.name.split(' ')
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase()
    
    return (
      nameParts[0].charAt(0) + 
      nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 border-r border-gray-200 bg-white">
          <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center">
              <div className="h-9 w-9 rounded-md bg-blue-600 flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">DeduX</h1>
            </Link>
          </div>
          
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <nav className="mt-2 flex-1 px-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                      {item.icon}
                    </span>
                    {item.title}
                  </Link>
                )
              })}
            </nav>
            
            {/* User info */}
            <div className="border-t border-gray-200 mt-auto">
              <div className="flex items-center px-4 py-3 h-16">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt={user?.name || "User"} />
                  <AvatarFallback className="text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.username || "user@example.com"}</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-1">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">DeduX</h1>
          </Link>
          
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-3">
              <AvatarFallback className="text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 z-40 bg-gray-800/40 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="md:hidden fixed inset-y-0 right-0 z-50 w-full max-w-[280px] bg-white shadow-xl overflow-y-auto transition transform">
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <p className="text-lg font-medium">Menu</p>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="px-3 py-4">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className={`mr-4 ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                        {item.icon}
                      </span>
                      {item.title}
                    </Link>
                  )
                })}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <main className="flex-1 px-0 pb-8 pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}