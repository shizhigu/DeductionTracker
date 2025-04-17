import { useQuery } from "@tanstack/react-query";
import { 
  WalletCards, Receipt, PiggyBank, TrendingDown, TrendingUp
} from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export default function QuickStats() {
  const isMobile = useMobile();
  
  const { data: todayTotal, isLoading: isLoadingToday } = useQuery<{ total: number }>({
    queryKey: ['/api/summary/today'],
  });
  
  const { data: monthlyDeductible, isLoading: isLoadingMonthly } = useQuery<{ total: number }>({
    queryKey: ['/api/summary/monthly-deductible'],
  });
  
  const { data: taxSavings, isLoading: isLoadingTax } = useQuery<{ total: number }>({
    queryKey: ['/api/summary/tax-savings'],
  });
  
  if (isMobile) {
    return (
      <div className="flex overflow-x-auto space-x-4 pb-4 mb-6 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
        <StatCardMobile 
          title="Today's Spend"
          value={isLoadingToday ? null : todayTotal?.total}
          trend={{
            value: "15% less",
            direction: "down"
          }}
        />
        
        <StatCardMobile 
          title="Monthly Deductible"
          value={isLoadingMonthly ? null : monthlyDeductible?.total}
          progress={65}
        />
        
        <StatCardMobile 
          title="Saved in Taxes"
          value={isLoadingTax ? null : taxSavings?.total}
          trend={{
            value: "8% more",
            direction: "up"
          }}
        />
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      <StatCard 
        title="Today's Spend"
        value={isLoadingToday ? null : todayTotal?.total}
        icon={<WalletCards className="h-5 w-5" />}
        iconBgColor="bg-primary-50"
        iconColor="text-primary"
        trend={{
          value: "15% less than yesterday",
          direction: "down"
        }}
      />
      
      <StatCard 
        title="Monthly Deductible"
        value={isLoadingMonthly ? null : monthlyDeductible?.total}
        icon={<Receipt className="h-5 w-5" />}
        iconBgColor="bg-green-50"
        iconColor="text-green-500"
        progress={65}
        progressLabel="65% of monthly goal"
      />
      
      <StatCard 
        title="Saved in Taxes"
        value={isLoadingTax ? null : taxSavings?.total}
        icon={<PiggyBank className="h-5 w-5" />}
        iconBgColor="bg-blue-50"
        iconColor="text-blue-500"
        trend={{
          value: "8% more than last month",
          direction: "up"
        }}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  progress?: number;
  progressLabel?: string;
}

function StatCard({ 
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  trend,
  progress,
  progressLabel
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-neutral-500 text-sm">{title}</p>
          {value === null ? (
            <Skeleton className="h-8 w-28 mt-1" />
          ) : (
            <h3 className="text-2xl font-semibold text-neutral-800 mt-1">{formatCurrency(value)}</h3>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <p className={`text-xs ${trend.direction === 'up' ? 'text-blue-600' : 'text-green-600'} flex items-center`}>
          {trend.direction === 'up' ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {trend.value}
        </p>
      )}
      
      {progress !== undefined && (
        <>
          <div className="w-full bg-neutral-100 rounded-full h-1.5">
            <div 
              className="bg-green-500 h-1.5 rounded-full" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          {progressLabel && <p className="text-xs text-neutral-500 mt-2">{progressLabel}</p>}
        </>
      )}
    </div>
  );
}

interface StatCardMobileProps {
  title: string;
  value: number | null;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  progress?: number;
}

function StatCardMobile({ 
  title,
  value,
  trend,
  progress
}: StatCardMobileProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-neutral-100 min-w-[180px] flex-shrink-0">
      <p className="text-neutral-500 text-xs">{title}</p>
      {value === null ? (
        <Skeleton className="h-6 w-24 mt-1" />
      ) : (
        <h3 className="text-xl font-semibold text-neutral-800 mt-1">{formatCurrency(value)}</h3>
      )}
      
      {trend && (
        <p className={`text-xs ${trend.direction === 'up' ? 'text-blue-600' : 'text-green-600'} flex items-center mt-1`}>
          {trend.direction === 'up' ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {trend.value}
        </p>
      )}
      
      {progress !== undefined && (
        <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-1">
          <div 
            className="bg-green-500 h-1.5 rounded-full" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      )}
    </div>
  );
}
