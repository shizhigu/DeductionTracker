"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Receipt, 
  Tags, 
  FileText, 
  Settings, 
  ChevronRight,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/use-user-store"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { user, fetchCurrentUser } = useUserStore()

  // Check if current device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Fetch current user data on mount
  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  // Navigation links
  const navLinks = [
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
      icon: <Tags className="h-5 w-5" />,
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex justify-between items-center px-4 h-14">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mr-2"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
              <Link href="/dashboard" className="flex items-center">
                <span className="bg-blue-600 text-white rounded h-8 w-8 flex items-center justify-center font-bold text-lg mr-2">D</span>
                <span className="font-semibold text-xl">DeduX</span>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {user?.name.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50">
            <div className="bg-white w-3/4 max-w-xs h-full overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <Link href="/dashboard" className="flex items-center">
                  <span className="bg-blue-600 text-white rounded h-8 w-8 flex items-center justify-center font-bold text-lg mr-2">D</span>
                  <span className="font-semibold text-xl">DeduX</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="p-4">
                <ul className="space-y-2">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center py-2 px-3 rounded-md",
                          pathname === link.href 
                            ? "bg-blue-50 text-blue-700 font-medium" 
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.icon}
                        <span className="ml-3">{link.title}</span>
                        {pathname === link.href && (
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}

        <main className="flex-1">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-30">
        <div className="bg-white border-r border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b flex items-center">
            <span className="bg-blue-600 text-white rounded h-8 w-8 flex items-center justify-center font-bold text-lg mr-2">D</span>
            <span className="font-semibold text-xl">DeduX</span>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center py-2 px-3 rounded-md",
                      pathname === link.href 
                        ? "bg-blue-50 text-blue-700 font-medium" 
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {link.icon}
                    <span className="ml-3">{link.title}</span>
                    {pathname === link.href && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="font-medium">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64">
        {children}
      </main>
    </div>
  )
}