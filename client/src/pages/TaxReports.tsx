import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Filter, FileText, Download, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMobile } from "@/hooks/use-mobile";
import { type Report, type Expense } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function TaxReports() {
  const isMobile = useMobile();
  const [dateRange, setDateRange] = useState("thisMonth");
  const [exportFormat, setExportFormat] = useState("pdf");
  
  const { data: reports } = useQuery<Report[]>({
    queryKey: ['/api/reports'],
  });
  
  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ['/api/expenses'],
  });
  
  // Filter tax deductible expenses
  const deductibleExpenses = expenses?.filter(exp => exp.isTaxDeductible);
  
  // Get date range for preview
  let startDate = new Date();
  let endDate = new Date();
  
  if (dateRange === 'thisMonth') {
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  } else if (dateRange === 'lastMonth') {
    startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
    endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
  } else if (dateRange === 'thisQuarter') {
    const quarter = Math.floor(startDate.getMonth() / 3);
    startDate = new Date(startDate.getFullYear(), quarter * 3, 1);
    endDate = new Date(startDate.getFullYear(), (quarter + 1) * 3, 0);
  } else if (dateRange === 'thisYear') {
    startDate = new Date(startDate.getFullYear(), 0, 1);
    endDate = new Date(startDate.getFullYear(), 11, 31);
  }
  
  // Filter expenses by date range
  const previewExpenses = deductibleExpenses?.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate >= startDate && expDate <= endDate;
  });
  
  return (
    <div className={isMobile ? "p-5 pb-20" : "p-8"}>
      <header className="mb-6 flex justify-between items-center">
        <h2 className={`${isMobile ? "text-xl" : "text-2xl"} font-semibold text-neutral-800`}>Tax Reports</h2>
        <Button size={isMobile ? "sm" : "default"}>
          <Plus className="h-4 w-4 mr-2" /> New Report
        </Button>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        {/* Report Generator Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Generate Tax Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">Date Range</Label>
                <RadioGroup defaultValue="thisMonth" onValueChange={setDateRange}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="thisMonth" id="thisMonth" />
                      <Label htmlFor="thisMonth">This Month</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lastMonth" id="lastMonth" />
                      <Label htmlFor="lastMonth">Last Month</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="thisQuarter" id="thisQuarter" />
                      <Label htmlFor="thisQuarter">This Quarter</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="thisYear" id="thisYear" />
                      <Label htmlFor="thisYear">This Year</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="mb-2 block">Custom Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input placeholder="Start Date" className="pl-9" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input placeholder="End Date" className="pl-9" />
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="mb-2 block">Export Format</Label>
                <RadioGroup defaultValue="pdf" className="flex gap-4" onValueChange={setExportFormat}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf">PDF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="csv" id="csv" />
                    <Label htmlFor="csv">CSV</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email">Email to Accountant</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex gap-3">
                <Button className="flex-1">
                  {exportFormat === 'email' ? (
                    <>
                      <Mail className="h-4 w-4 mr-2" /> 
                      Email Report
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" /> 
                      Download {exportFormat.toUpperCase()}
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" /> Advanced Options
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Report Summary Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Date Range</p>
                <p className="font-medium">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Deductible Expenses</p>
                <p className="font-medium">
                  ${previewExpenses?.reduce((sum, exp) => sum + (exp.amount * exp.deductiblePercentage / 100), 0).toFixed(2) || '0.00'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Number of Transactions</p>
                <p className="font-medium">{previewExpenses?.length || 0}</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500">Estimated Tax Savings</p>
                <p className="font-medium text-green-600">
                  ${((previewExpenses?.reduce((sum, exp) => sum + (exp.amount * exp.deductiblePercentage / 100), 0) || 0) * 0.21).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Preview Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Expense Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-2 px-3 text-sm font-medium text-neutral-500">Date</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-neutral-500">Vendor</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-neutral-500">Category</th>
                  <th className="text-right py-2 px-3 text-sm font-medium text-neutral-500">Amount</th>
                  <th className="text-center py-2 px-3 text-sm font-medium text-neutral-500">Deductible</th>
                </tr>
              </thead>
              <tbody>
                {previewExpenses?.length ? (
                  previewExpenses.map(expense => (
                    <tr key={expense.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-3 text-sm">{formatDate(new Date(expense.date))}</td>
                      <td className="py-3 px-3 text-sm">{expense.vendor}</td>
                      <td className="py-3 px-3 text-sm">
                        {/* This would normally come from the category relation */}
                        {expense.categoryId === 1 ? 'Office Supplies' : 
                          expense.categoryId === 2 ? 'Software' : 
                          expense.categoryId === 3 ? 'Travel' : 
                          expense.categoryId === 4 ? 'Meals' : 'Marketing'}
                      </td>
                      <td className="py-3 px-3 text-sm text-right">${expense.amount.toFixed(2)}</td>
                      <td className="py-3 px-3 text-sm text-center">
                        {expense.deductiblePercentage === 100 ? 'Yes' : `${expense.deductiblePercentage}%`}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-500">
                      No deductible expenses found for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Previous Reports */}
      {reports?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Previous Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.map(report => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{report.name}</h4>
                    <FileText className="h-4 w-4 text-neutral-400" />
                  </div>
                  <p className="text-sm text-neutral-500 mb-2">
                    {formatDate(new Date(report.startDate))} - {formatDate(new Date(report.endDate))}
                  </p>
                  <div className="flex justify-between mt-3">
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
