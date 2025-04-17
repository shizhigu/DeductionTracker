"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  LayoutDashboard,
  Receipt,
  Tag,
  FileText,
  Settings,
  Menu,
  X 
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Link href="/dashboard" className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">DeduX</h1>
            </Link>
          </div>
          
          <nav className="mt-5 flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
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
          <div className="flex items-center px-4 mt-6 mb-2">
            <Avatar>
              <AvatarImage src="" alt={user?.name || "User"} />
              <AvatarFallback>
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500">{user?.username || "user@example.com"}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">DeduX</h1>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-800 bg-opacity-25 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-lg z-50">
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <Link href="/dashboard" className="flex items-center">
                <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <h1 className="text-lg font-bold tracking-tight">DeduX</h1>
              </Link>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-base font-medium rounded-md ${
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
            </div>
            
            {/* User info */}
            <div className="border-t border-gray-200 mt-4 pt-4 px-4">
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src="" alt={user?.name || "User"} />
                  <AvatarFallback>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500">{user?.username || "user@example.com"}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Backdrop click to close */}
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-0">
        <main className="flex-1 pb-8 mt-16 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  )
}