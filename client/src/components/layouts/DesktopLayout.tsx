import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar, SidebarItem } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, Receipt, PieChart, FileText, Settings 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ReceiptCapture from "@/components/receipts/ReceiptCapture";

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const [location] = useLocation();
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const { data: user } = useQuery<{ id: number; name: string; email: string }>({
    queryKey: ['/api/users/me'],
  });
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar className="w-64 border-r border-neutral-200">
        <div className="p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white mr-3">
              <PieChart className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-semibold text-neutral-800">Dedu<span className="text-primary">X</span></h1>
          </div>
        </div>
        
        <div className="space-y-1 px-3">
          <SidebarItem icon={<Home className="h-4 w-4" />} href="/" title="Dashboard" isActive={location === '/'} />
          <SidebarItem icon={<Receipt className="h-4 w-4" />} href="/expenses" title="Expenses" isActive={location === '/expenses'} />
          <SidebarItem icon={<PieChart className="h-4 w-4" />} href="/categories" title="Categories" isActive={location === '/categories'} />
          <SidebarItem icon={<FileText className="h-4 w-4" />} href="/reports" title="Tax Reports" isActive={location === '/reports'} />
          <SidebarItem icon={<Settings className="h-4 w-4" />} href="/settings" title="Settings" isActive={location === '/settings'} />
        </div>
        
        <div className="p-4 mt-auto border-t border-neutral-100">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80" />
              <AvatarFallback>
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-neutral-800">{user?.name || 'Loading...'}</p>
              <p className="text-xs text-neutral-500">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </Sidebar>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
        
        {/* Receipt Modal */}
        <ReceiptCapture 
          isOpen={showReceiptModal} 
          onClose={() => setShowReceiptModal(false)} 
          isMobile={false}
        />
      </main>
    </div>
  );
}
