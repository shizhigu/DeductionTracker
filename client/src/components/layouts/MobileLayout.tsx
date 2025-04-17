import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, Receipt, PieChart, FileText, Settings, Plus 
} from "lucide-react";
import ReceiptCapture from "@/components/receipts/ReceiptCapture";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [location] = useLocation();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around items-center py-2 z-10">
        <Link href="/" className={`flex flex-col items-center justify-center p-2 ${location === '/' ? 'text-primary' : 'text-neutral-400'}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/expenses" className={`flex flex-col items-center justify-center p-2 ${location === '/expenses' ? 'text-primary' : 'text-neutral-400'}`}>
          <Receipt className="h-5 w-5" />
          <span className="text-xs mt-1">Expenses</span>
        </Link>
        <button 
          onClick={() => setShowReceiptModal(true)}
          className="flex flex-col items-center p-0"
        >
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white -mt-5 shadow-lg">
            <Plus className="h-5 w-5" />
          </div>
        </button>
        <Link href="/reports" className={`flex flex-col items-center justify-center p-2 ${location === '/reports' ? 'text-primary' : 'text-neutral-400'}`}>
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">Reports</span>
        </Link>
        <Link href="/settings" className={`flex flex-col items-center justify-center p-2 ${location === '/settings' ? 'text-primary' : 'text-neutral-400'}`}>
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </nav>
      
      {/* Receipt Modal */}
      <ReceiptCapture 
        isOpen={showReceiptModal} 
        onClose={() => setShowReceiptModal(false)} 
        isMobile={true}
      />
    </div>
  );
}
