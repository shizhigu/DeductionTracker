import { useState, useRef, useEffect } from "react";
import { X, Camera, Upload, Edit, CheckCircle, Briefcase, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertExpense } from "@/lib/types";

interface ReceiptCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function ReceiptCapture({ isOpen, onClose, isMobile }: ReceiptCaptureProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [vendor, setVendor] = useState("Office Depot");
  const [amount, setAmount] = useState("86.45");
  const [category, setCategory] = useState("1"); // Office Supplies
  const [isBusinessExpense, setIsBusinessExpense] = useState(true);
  const [notes, setNotes] = useState("");
  
  // 从文件输入获取照片
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const createExpenseMutation = useMutation({
    mutationFn: async (newExpense: InsertExpense) => {
      const res = await apiRequest('POST', '/api/expenses', newExpense);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/monthly-deductible'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/tax-savings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary/category-breakdown'] });
      
      toast({
        title: "收据已保存",
        description: "您的支出记录已成功创建。",
      });
      
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "保存失败",
        description: "请稍后再试。",
      });
    }
  });
  
  // 打开系统摄像头
  const handleCameraCapture = () => {
    // 确保文件输入引用存在
    if (fileInputRef.current) {
      // 设置accept属性为image/*,capture=camera以激活原生摄像头
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };
  
  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // 创建文件预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "收据已捕获",
        description: "成功获取收据图像。",
      });
    }
  };
  
  const resetForm = () => {
    setVendor("Office Depot");
    setAmount("86.45");
    setCategory("1");
    setIsBusinessExpense(true);
    setNotes("");
    setPhotoFile(null);
    setPhotoPreview(null);
  };
  
  const handleSave = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        variant: "destructive",
        title: "金额无效",
        description: "请输入有效的金额。",
      });
      return;
    }
    
    const newExpense: InsertExpense = {
      userId: 1, // Demo用户ID
      amount: amountValue,
      vendor,
      date: new Date(),
      categoryId: parseInt(category),
      notes,
      isBusinessExpense,
      isTaxDeductible: isBusinessExpense, // 假设业务支出可抵税
      deductiblePercentage: isBusinessExpense ? 100 : 0
    };
    
    createExpenseMutation.mutate(newExpense);
  };
  
  if (isMobile) {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end overflow-y-auto">
        <div className="bg-white rounded-t-xl w-full p-5 slide-in-bottom max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">拍摄收据</h3>
            <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-4 border-2 border-dashed border-neutral-300 rounded-lg p-4 flex flex-col items-center justify-center">
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="收据图片" 
                className="max-w-xs mb-3 rounded-lg" 
              />
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1567301861581-f135cd5ff9de?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                alt="收据示例" 
                className="max-w-xs mb-3 rounded-lg" 
              />
            )}
            
            <div className="flex space-x-2">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button onClick={handleCameraCapture}>
                <Camera className="h-4 w-4 mr-1" /> {photoPreview ? "重新拍照" : "拍摄收据"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
              >
                <Upload className="h-4 w-4 mr-1" /> 上传图片
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 mb-4">
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">商家</Label>
              <div className="flex">
                <div className="flex-1 border border-neutral-300 p-2 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-500 mr-2">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <span>{vendor}</span>
                  </div>
                </div>
                <button 
                  className="ml-2 border border-neutral-300 px-3 rounded-lg"
                  onClick={() => setVendor(prompt("输入商家名称", vendor) || vendor)}
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">金额</Label>
                <input 
                  type="text"
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="border border-neutral-300 p-3 rounded-lg w-full"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">日期</Label>
                <div className="border border-neutral-300 p-3 rounded-lg">
                  <span>今天, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">分类</Label>
              <Select defaultValue={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full border border-neutral-300 p-3 rounded-lg bg-white">
                  <SelectValue placeholder="选择类别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">办公用品</SelectItem>
                  <SelectItem value="2">软件</SelectItem>
                  <SelectItem value="3">差旅</SelectItem>
                  <SelectItem value="4">餐饮</SelectItem>
                  <SelectItem value="5">市场营销</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="flex items-center justify-between text-sm font-medium text-neutral-700 mb-1">
                <span>支出类型</span>
                <div className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>可抵税!</span>
                </div>
              </Label>
              <div className="flex">
                <button 
                  className={`flex-1 ${isBusinessExpense ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-neutral-300 text-neutral-500'} border p-3 rounded-l-lg font-medium`}
                  onClick={() => setIsBusinessExpense(true)}
                >
                  <Briefcase className="h-4 w-4 inline mr-1" /> 业务
                </button>
                <button 
                  className={`flex-1 ${!isBusinessExpense ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-neutral-300 text-neutral-500'} border p-3 rounded-r-lg font-medium`}
                  onClick={() => setIsBusinessExpense(false)}
                >
                  <User className="h-4 w-4 inline mr-1" /> 个人
                </button>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">备注（可选）</Label>
              <Textarea 
                className="w-full border border-neutral-300 p-3 rounded-lg" 
                rows={2} 
                placeholder="添加有关此支出的详细信息..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            className="w-full py-6 text-base"
            disabled={createExpenseMutation.isPending}
            onClick={handleSave}
          >
            保存支出
          </Button>
        </div>
      </div>
    );
  }
  
  // 桌面版本
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>添加新支出</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2 flex flex-col items-center justify-start">
            <div className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden mb-3">
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="收据图片" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="p-6 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">拍摄或上传收据图片</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button onClick={handleCameraCapture} className="w-full">
                <Camera className="h-4 w-4 mr-2" /> {photoPreview ? "重新拍照" : "拍摄收据"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
              >
                <Upload className="h-4 w-4 mr-2" /> 上传图片
              </Button>
            </div>
          </div>
          
          <div className="col-span-3 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="vendor">商家</Label>
                <input
                  id="vendor"
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="amount">金额</Label>
                <input
                  id="amount"
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="date">日期</Label>
                <input
                  id="date"
                  className="w-full p-2 border border-gray-300 rounded-md mt-1"
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <Label htmlFor="category">分类</Label>
                <Select defaultValue={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full p-2 border border-gray-300 rounded-md mt-1 bg-white">
                    <SelectValue placeholder="选择类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">办公用品</SelectItem>
                    <SelectItem value="2">软件</SelectItem>
                    <SelectItem value="3">差旅</SelectItem>
                    <SelectItem value="4">餐饮</SelectItem>
                    <SelectItem value="5">市场营销</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="expense-type">支出类型</Label>
                <div className="flex mt-1 rounded-md overflow-hidden">
                  <button 
                    className={`flex-1 ${isBusinessExpense ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-300 text-gray-500'} border p-2 font-medium border-r-0`}
                    onClick={() => setIsBusinessExpense(true)}
                  >
                    <Briefcase className="h-4 w-4 inline mr-1" /> 业务
                  </button>
                  <button 
                    className={`flex-1 ${!isBusinessExpense ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-300 text-gray-500'} border p-2 font-medium`}
                    onClick={() => setIsBusinessExpense(false)}
                  >
                    <User className="h-4 w-4 inline mr-1" /> 个人
                  </button>
                </div>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="notes">备注（可选）</Label>
                <Textarea 
                  id="notes"
                  className="w-full p-2 border border-gray-300 rounded-md mt-1" 
                  rows={4} 
                  placeholder="添加有关此支出的详细信息..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pt-2 flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button
                disabled={createExpenseMutation.isPending}
                onClick={handleSave}
              >
                保存支出
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}