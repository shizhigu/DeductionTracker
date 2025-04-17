import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import QuickStats from "@/components/dashboard/QuickStats";
import ActionButtons from "@/components/dashboard/ActionButtons";
import ExpenseList from "@/components/dashboard/ExpenseList";
import CategoryChart from "@/components/dashboard/CategoryChart";
import TaxSavingsTip from "@/components/dashboard/TaxSavingsTip";
import { useMobile } from "@/hooks/use-mobile";
import { formatDate } from "@/lib/utils";

export default function Home() {
  const isMobile = useMobile();
  
  // Fetch user data
  const { data: user } = useQuery<{ id: number; name: string }>({
    queryKey: ['/api/users/me'],
  });
  
  const firstName = user?.name?.split(' ')[0] || 'User';
  const currentDate = new Date();
  
  return (
    <div className={isMobile ? "p-5" : "p-8"}>
      <header className={isMobile ? "mb-6" : "mb-8"}>
        {isMobile ? (
          <>
            <h2 className="text-xl font-semibold text-neutral-800">Hi {firstName},</h2>
            <p className="text-neutral-500 text-sm">Let's log your day's expenses</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-neutral-800">Hi {firstName}, let's log your day's expenses</h2>
            <p className="text-neutral-500 mt-1">{formatDate(currentDate)}</p>
          </>
        )}
      </header>
      
      {/* Quick Stats */}
      <QuickStats />
      
      {/* Action Buttons */}
      <ActionButtons />
      
      {isMobile ? (
        <div className="space-y-6">
          {/* Recent Expenses Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-neutral-800">Recent Expenses</h3>
              <Link href="/expenses">
                <div className="text-primary text-xs cursor-pointer">View All</div>
              </Link>
            </div>
            <ExpenseList />
          </div>
          
          {/* Category Chart */}
          <CategoryChart />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8">
          {/* Recent Expenses Section */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-neutral-800">Recent Expenses</h3>
              <Link href="/expenses">
                <div className="text-primary text-sm hover:text-primary-600 cursor-pointer">View All</div>
              </Link>
            </div>
            <ExpenseList />
          </div>
          
          {/* Category Analysis */}
          <div className="space-y-4">
            <CategoryChart />
            <TaxSavingsTip />
          </div>
        </div>
      )}
    </div>
  );
}
