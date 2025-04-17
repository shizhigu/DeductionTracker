"use client"

import { useState, useEffect, Fragment } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Transition, Dialog } from "@headlessui/react"
import { 
  LayoutDashboard,
  Receipt,
  Tag,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Bell,
  Search,
  User as UserIcon,
  HelpCircle
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
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false)
  
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
    setIsMobileUserMenuOpen(false)
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
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile menu dialog */}
      <Transition show={isMobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setIsMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setIsMobileMenuOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                {/* Mobile sidebar */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <Link href="/dashboard" className="flex items-center">
                      <div className="h-9 w-9 rounded-md bg-blue-600 flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-lg">D</span>
                      </div>
                      <h1 className="text-xl font-bold tracking-tight">DeduX</h1>
                    </Link>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="-mx-2 space-y-1">
                      {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`
                                group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6
                                ${isActive 
                                  ? 'bg-blue-50 text-blue-600' 
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                }
                              `}
                            >
                              <span className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`}>
                                {item.icon}
                              </span>
                              {item.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                  
                  <div className="mt-auto">
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt={user?.name || "User"} />
                          <AvatarFallback>
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.username || "user@example.com"}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-col gap-2">
                        <Button size="sm" variant="outline" className="justify-start">
                          <UserIcon className="mr-2 h-4 w-4" />
                          View profile
                        </Button>
                        <Button size="sm" variant="outline" className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign out
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                DeduX
              </h1>
            </Link>
          </div>
          
          <nav className="flex flex-1 flex-col pt-2">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`
                            group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6
                            ${isActive 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                            }
                          `}
                        >
                          <span className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`}>
                            {item.icon}
                          </span>
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={user?.name || "User"} />
                      <AvatarFallback>
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.username || "user@example.com"}</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5 text-gray-400" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <Button variant="outline" size="sm" className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile top navigation */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        
        <div className="flex-1 flex justify-center">
          <Link href="/dashboard" className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight">DeduX</h1>
          </Link>
        </div>
        
        <div className="flex gap-x-3">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-gray-500" />
          </Button>
          <button 
            onClick={() => setIsMobileUserMenuOpen(!isMobileUserMenuOpen)}
            className="relative"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            {isMobileUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Settings
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                  Sign out
                </button>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-72">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}