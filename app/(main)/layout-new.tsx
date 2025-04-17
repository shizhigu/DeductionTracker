"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard,
  Receipt,
  Tag,
  FileText,
  Settings,
  Home,
  Plus,
  LogOut,
  User as UserIcon
} from "lucide-react"
import { useUserStore } from "@/store/use-user-store"
import { Logo } from "@/shared/components/ui/Logo"
import { Sidebar, SidebarItem } from "@/shared/components/navigation/Sidebar"
import { MobileHeader, MobileFooter, MobileMenu } from "@/shared/components/navigation/MobileNav"
import { UserProfile } from "@/shared/components/ui/UserProfile"
import { AppLayout } from "@/shared/layout/AppLayout"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useUserStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
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
      mobileIcon: <FileText size={24} />
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings size={20} />,
      mobileIcon: <Settings size={24} />
    },
  ]

  // 转换导航项为侧边栏格式
  const sidebarItems = navItems.map(item => ({
    title: item.title,
    href: item.href,
    icon: item.icon,
    isActive: pathname === item.href
  }))

  // 转换导航项为移动导航格式
  const mobileNavItems = navItems.map(item => ({
    label: item.title,
    href: item.href,
    icon: item.mobileIcon,
    isActive: pathname === item.href
  }))

  // Logo组件
  const logoComponent = <Logo size="sm" showText={true} />
  
  // 用户信息
  const userInfo = {
    name: user?.name || "User",
    email: user?.username || "user@example.com",
    avatarUrl: user?.avatarUrl
  }

  // 侧边栏底部内容
  const sidebarFooter = (
    <UserProfile 
      user={userInfo}
      onSignOutClick={() => console.log('Sign out clicked')}
    />
  )

  // 移动菜单底部内容
  const mobileMenuFooter = (
    <UserProfile 
      user={userInfo}
      onSignOutClick={() => {
        console.log('Sign out clicked')
        setDrawerOpen(false)
      }}
    />
  )

  // 添加按钮
  const fabButton = (
    <button className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
      <Plus size={24} />
    </button>
  )

  return (
    <>
      <AppLayout
        sidebar={
          <Sidebar 
            logo={logoComponent}
            items={sidebarItems}
            footer={sidebarFooter}
          />
        }
        header={
          <MobileHeader 
            logo={logoComponent}
            onMenuClick={() => setDrawerOpen(true)}
            onProfileClick={() => setUserMenuOpen(!userMenuOpen)}
          />
        }
        footer={
          <MobileFooter 
            items={mobileNavItems}
            fabButton={fabButton}
          />
        }
      >
        {children}
      </AppLayout>

      {/* 移动端菜单 */}
      <MobileMenu 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        logo={logoComponent}
        menuItems={mobileNavItems}
        footerContent={mobileMenuFooter}
      />

      {/* 移动端用户菜单 */}
      {userMenuOpen && (
        <div className="fixed right-4 top-16 w-56 bg-white shadow-lg rounded-lg overflow-hidden z-20 animate-in slide-in-from-top lg:hidden">
          <div className="p-3 border-b border-slate-100">
            <p className="font-medium text-slate-900">{userInfo.name}</p>
            <p className="text-xs text-slate-500">{userInfo.email}</p>
          </div>
          <div className="py-1">
            <button onClick={() => setUserMenuOpen(false)} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <UserIcon size={16} className="mr-3 text-slate-400" />
              My Profile
            </button>
            <button onClick={() => setUserMenuOpen(false)} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <Settings size={16} className="mr-3 text-slate-400" />
              Settings
            </button>
          </div>
          <div className="border-t border-slate-100 py-1">
            <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-slate-50">
              <LogOut size={16} className="mr-3" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </>
  )
} 