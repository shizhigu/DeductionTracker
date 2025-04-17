import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMobile } from "@/hooks/use-mobile";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  percentage: number;
}

const COLORS = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
];

export default function CategoryChart() {
  const isMobile = useMobile();
  const [businessOnly, setBusinessOnly] = useState(true);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  
  const { data: breakdown, isLoading } = useQuery<CategoryBreakdown[]>({
    queryKey: ['/api/summary/category-breakdown', businessOnly ? 'business' : 'all'],
    queryFn: async () => {
      const res = await fetch(`/api/summary/category-breakdown?businessOnly=${businessOnly}`);
      return res.json();
    }
  });

  useEffect(() => {
    if (chartRef.current && breakdown) {
      // Destroy existing chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
      
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstanceRef.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: breakdown.map(item => item.categoryName),
            datasets: [{
              data: breakdown.map(item => item.percentage),
              backgroundColor: breakdown.map((_, i) => COLORS[i % COLORS.length]),
              borderWidth: 0,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            cutout: isMobile ? '60%' : '70%',
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    return `${context.label}: ${context.raw}%`;
                  }
                }
              }
            }
          }
        });
      }
    }
    
    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [breakdown, isMobile]);
  
  if (isMobile) {
    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-neutral-800">Categories</h3>
          <div className="flex space-x-1">
            <button 
              className={`text-xs ${businessOnly ? 'bg-primary text-white' : 'bg-white text-neutral-600 border border-neutral-200'} px-2 py-0.5 rounded-lg`}
              onClick={() => setBusinessOnly(true)}
            >
              Business
            </button>
            <button 
              className={`text-xs ${!businessOnly ? 'bg-primary text-white' : 'bg-white text-neutral-600 border border-neutral-200'} px-2 py-0.5 rounded-lg`}
              onClick={() => setBusinessOnly(false)}
            >
              All
            </button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex justify-center mb-3">
                  <Skeleton className="h-40 w-40 rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center">
                      <Skeleton className="h-2 w-2 rounded-full mr-2" />
                      <Skeleton className="h-3 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-3">
                  <canvas ref={chartRef} width="200" height="200"></canvas>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {breakdown?.map((item, index) => (
                    <div key={item.categoryId} className="flex items-center">
                      <span 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{backgroundColor: COLORS[index % COLORS.length]}}
                      ></span>
                      <span className="text-xs text-neutral-600">{item.categoryName}</span>
                      <span className="ml-auto font-medium text-xs">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-semibold text-neutral-800">Category Breakdown</h3>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant={businessOnly ? "default" : "outline"}
            onClick={() => setBusinessOnly(true)}
          >
            Business
          </Button>
          <Button 
            size="sm" 
            variant={!businessOnly ? "default" : "outline"}
            onClick={() => setBusinessOnly(false)}
          >
            All
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="flex justify-center mb-4">
                <Skeleton className="h-60 w-60 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-3 w-3 rounded-full mr-2" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <canvas ref={chartRef} width="300" height="300"></canvas>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                {breakdown?.map((item, index) => (
                  <div key={item.categoryId} className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{backgroundColor: COLORS[index % COLORS.length]}}
                    ></span>
                    <span className="text-sm text-neutral-600">{item.categoryName}</span>
                    <span className="ml-auto font-medium text-sm">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
