import { useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { 
  Home, 
  Receipt, 
  Tag, 
  FileText, 
  Settings as SettingsIcon,
  Plus,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './lib/theme';

// 假设我们从shared导入共享组件
// 在实际环境下，这些组件可能需要适配wouter等React Native特定库
// 为了简化示例，我们假设已经完成了适配
import { Logo } from '../shared/components/ui/Logo';
import { Sidebar } from '../shared/components/navigation/Sidebar';
import { MobileHeader, MobileFooter, MobileMenu } from '../shared/components/navigation/MobileNav';
import { UserProfile } from '../shared/components/ui/UserProfile';
import { AppLayout } from '../shared/layout/AppLayout';

// 页面组件
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Categories from './pages/Categories';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// 创建React Query客户端
const queryClient = new QueryClient();

function App() {
  const [location] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // 模拟用户数据
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
  };
  
  // 导航配置
  const navItems = [
    {
      title: "Home",
      href: "/",
      icon: <Home size={20} />,
      mobileIcon: <Home size={22} />
    },
    {
      title: "Expenses",
      href: "/expenses",
      icon: <Receipt size={20} />,
      mobileIcon: <Receipt size={22} />
    },
    {
      title: "Categories",
      href: "/categories",
      icon: <Tag size={20} />,
      mobileIcon: <Tag size={22} />
    },
    {
      title: "Reports",
      href: "/reports",
      icon: <FileText size={20} />,
      mobileIcon: <FileText size={22} />
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <SettingsIcon size={20} />,
      mobileIcon: <SettingsIcon size={22} />
    },
  ];
  
  // 转换为侧边栏项
  const sidebarItems = navItems.map(item => ({
    title: item.title,
    href: item.href,
    icon: item.icon,
    isActive: location === item.href,
  }));
  
  // 转换为移动导航项
  const mobileNavItems = navItems.map(item => ({
    label: item.title,
    href: item.href,
    icon: item.mobileIcon,
    isActive: location === item.href,
  }));
  
  // Logo组件
  const logoComponent = <Logo size="sm" showText={true} />;
  
  // 添加按钮
  const fabButton = (
    <button className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
      <Plus size={24} />
    </button>
  );
  
  // 侧边栏底部内容
  const sidebarFooter = (
    <UserProfile 
      user={user}
      onSignOutClick={() => console.log('Sign out clicked')}
    />
  );
  
  // 移动菜单底部内容
  const mobileMenuFooter = (
    <UserProfile 
      user={user}
      onSignOutClick={() => {
        console.log('Sign out clicked');
        setDrawerOpen(false);
      }}
    />
  );
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppLayout
          isMobileOverride={true} // 移动端应用总是使用移动视图
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
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/expenses" component={Expenses} />
            <Route path="/categories" component={Categories} />
            <Route path="/reports" component={Reports} />
            <Route path="/settings" component={Settings} />
          </Switch>
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
          <div className="fixed right-4 top-16 w-56 bg-white shadow-lg rounded-lg overflow-hidden z-20">
            <div className="p-3 border-b border-neutral-100">
              <p className="font-medium text-neutral-900">{user.name}</p>
              <p className="text-xs text-neutral-500">{user.email}</p>
            </div>
            <div className="py-1">
              <button onClick={() => setUserMenuOpen(false)} className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                <UserIcon size={16} className="mr-3 text-neutral-400" />
                My Profile
              </button>
              <button onClick={() => setUserMenuOpen(false)} className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                <SettingsIcon size={16} className="mr-3 text-neutral-400" />
                Settings
              </button>
            </div>
            <div className="border-t border-neutral-100 py-1">
              <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-neutral-50">
                <LogOut size={16} className="mr-3" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 