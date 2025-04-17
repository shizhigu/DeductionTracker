import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, Calendar, Edit, Trash2, Save, 
  Briefcase, User, Tag, Receipt, DollarSign, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, formatCurrency, getExpenseType } from "@/lib/utils";
import { type Expense, type Category } from "@/lib/types";

export default function ExpenseDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/expenses/:id");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useMobile();
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Expense ID from URL
  const expenseId = match ? parseInt(params.id) : null;
  
  // Fetch expense data
  const { data: expense, isLoading } = useQuery<Expense>({
    queryKey: [`/api/expenses/${expenseId}`],
    enabled: !!expenseId,
  });
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Form state
  const [formData, setFormData] = useState<Partial<Expense>>({});
  
  // Initialize form data when expense loads
  useState(() => {
    if (expense && Object.keys(formData).length === 0) {
      setFormData(expense);
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: name === 'categoryId' ? parseInt(value) : value
    });
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: async (updatedExpense: Partial<Expense>) => {
      const res = await apiRequest('PATCH', `/api/expenses/${expenseId}`, updatedExpense);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/expenses/${expenseId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/monthly-deductible'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/tax-savings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/category-breakdown'] });
      
      toast({
        title: "Expense updated",
        description: "Your expense has been updated successfully.",
      });
      
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update expense",
        description: "Please try again later.",
      });
    }
  });
  
  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/expenses/${expenseId}`, undefined);
      return res;
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/monthly-deductible'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/tax-savings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/category-breakdown'] });
      
      toast({
        title: "Expense deleted",
        description: "Your expense has been deleted successfully.",
      });
      
      // Navigate back to expenses list
      navigate('/expenses');
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete expense",
        description: "Please try again later.",
      });
    }
  });
  
  const handleSave = () => {
    updateExpenseMutation.mutate(formData);
  };
  
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate();
    }
  };
  
  // If expense not found
  if (!isLoading && !expense) {
    return (
      <div className={isMobile ? "p-5 pb-20" : "p-8"}>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/expenses')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        
        <div className="text-center py-12">
          <h2 className="text-lg font-medium mb-3">Expense not found</h2>
          <p className="text-neutral-500 mb-6">The expense you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/expenses')}>
            Go back to expenses
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={isMobile ? "p-5 pb-20" : "p-8"}>
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/expenses')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <Button onClick={handleSave} disabled={updateExpenseMutation.isPending}>
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
          )}
          
          <Button 
            variant="destructive" 
            size="icon"
            onClick={handleDelete}
            disabled={deleteExpenseMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'} flex flex-col md:flex-row gap-6`}>
              <div className="md:w-2/3">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Vendor</Label>
                      <Input 
                        name="vendor"
                        value={formData.vendor || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <Input 
                            name="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount || ""}
                            onChange={handleInputChange}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <Input 
                            name="date"
                            type="date"
                            value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ""}
                            onChange={handleInputChange}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Notes</Label>
                      <Textarea 
                        name="notes"
                        value={formData.notes || ""}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-semibold">{expense.vendor}</h2>
                    <p className="text-lg text-primary font-medium mt-1 mb-3">
                      {formatCurrency(expense.amount)}
                    </p>
                    <p className="text-neutral-500 flex items-center mb-4">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(new Date(expense.date))}
                    </p>
                    
                    <div className="bg-neutral-50 p-4 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-1">Notes</p>
                      <p className="text-neutral-600">
                        {expense.notes || "No notes added for this expense."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:w-1/3 flex flex-col">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Category</Label>
                      <Select 
                        value={formData.categoryId?.toString() || ""} 
                        onValueChange={(value) => handleSelectChange('categoryId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="mb-2 block">Expense Type</Label>
                      <div className="flex items-center justify-between mb-2 p-3 rounded-lg border">
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          <span>Business Expense</span>
                        </div>
                        <Switch 
                          checked={formData.isBusinessExpense || false}
                          onCheckedChange={(checked) => handleSwitchChange('isBusinessExpense', checked)}
                        />
                      </div>
                    </div>
                    
                    {formData.isBusinessExpense && (
                      <div>
                        <Label className="mb-2 block">Tax Deductible</Label>
                        <div className="flex items-center justify-between mb-2 p-3 rounded-lg border">
                          <div className="flex items-center">
                            <Receipt className="h-4 w-4 mr-2" />
                            <span>Tax Deductible</span>
                          </div>
                          <Switch 
                            checked={formData.isTaxDeductible || false}
                            onCheckedChange={(checked) => handleSwitchChange('isTaxDeductible', checked)}
                          />
                        </div>
                        
                        {formData.isTaxDeductible && (
                          <div className="mt-2">
                            <Label>Deductible Percentage</Label>
                            <Select 
                              value={formData.deductiblePercentage?.toString() || "100"} 
                              onValueChange={(value) => handleSelectChange('deductiblePercentage', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select percentage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="100">100%</SelectItem>
                                <SelectItem value="75">75%</SelectItem>
                                <SelectItem value="50">50%</SelectItem>
                                <SelectItem value="25">25%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Tag className="h-5 w-5 mr-2 text-neutral-400" />
                        <p className="text-sm font-medium">Category</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mr-2">
                          <i className="fas fa-briefcase"></i>
                        </div>
                        <p>
                          {categories?.find(c => c.id === expense.categoryId)?.name || "Uncategorized"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <FileText className="h-5 w-5 mr-2 text-neutral-400" />
                        <p className="text-sm font-medium">Tax Information</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-sm">Business Expense</p>
                          <Badge variant={expense.isBusinessExpense ? 'success' : 'outline'}>
                            {expense.isBusinessExpense ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between items-center">
                          <p className="text-sm">Tax Deductible</p>
                          <Badge variant={expense.isTaxDeductible ? 'success' : 'outline'}>
                            {expense.isTaxDeductible ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        
                        {expense.isTaxDeductible && (
                          <>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <p className="text-sm">Deductible Portion</p>
                              <Badge variant={expense.deductiblePercentage === 100 ? 'success' : 'warning'}>
                                {expense.deductiblePercentage}%
                              </Badge>
                            </div>
                            
                            <div className="mt-2">
                              <p className="text-xs text-neutral-500 mb-1">Deductible Amount</p>
                              <p className="font-medium text-green-600">
                                {formatCurrency(expense.amount * (expense.deductiblePercentage / 100))}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {expense.receiptUrl && (
                      <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <Receipt className="h-5 w-5 mr-2 text-neutral-400" />
                          <p className="text-sm font-medium">Receipt</p>
                        </div>
                        <div className="flex justify-center">
                          <img 
                            src={expense.receiptUrl} 
                            alt="Receipt" 
                            className="max-w-full rounded-lg border border-neutral-200" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {!isEditing && (
            <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
              <div className="flex">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-3 flex-shrink-0">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium text-primary-800 mb-1">Tax Tip</h4>
                  <p className="text-sm text-primary-700">
                    {expense.isTaxDeductible ? 
                      `This expense may save you approximately ${formatCurrency(expense.amount * (expense.deductiblePercentage / 100) * 0.21)} in taxes (estimated).` : 
                      "Consider whether this expense is related to your business activities as it may be tax deductible."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
