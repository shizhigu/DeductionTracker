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
  
  // Camera handling states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
        title: "Expense saved",
        description: "Your expense has been recorded successfully.",
      });
      
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to save expense",
        description: "Please try again later.",
      });
    }
  });
  
  // Camera functionality
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      
      if (!videoRef.current) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      
      toast({
        title: "相机已开启",
        description: "请对准收据拍照",
      });
    } catch (error) {
      console.error("相机启动失败:", error);
      toast({
        variant: "destructive",
        title: "相机访问失败",
        description: "请确保已授予相机权限，或尝试上传已有照片",
      });
      setIsCameraActive(false);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
  };
  
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // 设置Canvas尺寸与视频相同
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 绘制视频帧到Canvas
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 转换为图像URL
    const imageUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageUrl);
    
    // 停止相机
    stopCamera();
    
    toast({
      title: "拍照成功",
      description: "收据已捕获",
    });
  };
  
  useEffect(() => {
    // 组件卸载时停止相机
    return () => {
      stopCamera();
    };
  }, []);
  
  const resetForm = () => {
    setVendor("Office Depot");
    setAmount("86.45");
    setCategory("1");
    setIsBusinessExpense(true);
    setNotes("");
    setCapturedImage(null);
  };
  
  const handleSave = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount.",
      });
      return;
    }
    
    const newExpense: InsertExpense = {
      userId: 1, // For demo purposes
      amount: amountValue,
      vendor,
      date: new Date(),
      categoryId: parseInt(category),
      notes,
      isBusinessExpense,
      isTaxDeductible: isBusinessExpense, // Assume business expenses are deductible
      deductiblePercentage: isBusinessExpense ? 100 : 0
    };
    
    createExpenseMutation.mutate(newExpense);
  };
  
  if (isMobile) {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
        <div className="bg-white rounded-t-xl w-full p-5 slide-in-bottom">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Capture Receipt</h3>
            <button 
              onClick={() => {
                stopCamera();
                onClose();
              }} 
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mb-4 border-2 border-dashed border-neutral-300 rounded-lg p-4 flex flex-col items-center justify-center">
            {isCameraActive ? (
              <div className="relative w-full h-64 mb-3">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay 
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : capturedImage ? (
              <img 
                src={capturedImage} 
                alt="Captured receipt" 
                className="max-w-xs mb-3 rounded-lg" 
              />
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1567301861581-f135cd5ff9de?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
                alt="Receipt placeholder" 
                className="max-w-xs mb-3 rounded-lg" 
              />
            )}
            
            <div className="flex space-x-2">
              {isCameraActive ? (
                <Button onClick={captureImage}>
                  <Camera className="h-4 w-4 mr-1" /> 拍照
                </Button>
              ) : (
                <Button onClick={startCamera}>
                  <Camera className="h-4 w-4 mr-1" /> {capturedImage ? "重新拍照" : "拍摄收据"}
                </Button>
              )}
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-1" /> 上传图片
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 mb-4">
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Vendor</Label>
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
                  onClick={() => setVendor(prompt("Enter vendor name", vendor) || vendor)}
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Amount</Label>
                <input 
                  type="text"
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="border border-neutral-300 p-3 rounded-lg w-full"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-neutral-700 mb-1">Date</Label>
                <div className="border border-neutral-300 p-3 rounded-lg">
                  <span>Today, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Category</Label>
              <Select defaultValue={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full border border-neutral-300 p-3 rounded-lg bg-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Office Supplies</SelectItem>
                  <SelectItem value="2">Software</SelectItem>
                  <SelectItem value="3">Travel</SelectItem>
                  <SelectItem value="4">Meals</SelectItem>
                  <SelectItem value="5">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="flex items-center justify-between text-sm font-medium text-neutral-700 mb-1">
                <span>Expense Type</span>
                <div className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  <span>Looks deductible!</span>
                </div>
              </Label>
              <div className="flex">
                <button 
                  className={`flex-1 ${isBusinessExpense ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-neutral-300 text-neutral-500'} border p-3 rounded-l-lg font-medium`}
                  onClick={() => setIsBusinessExpense(true)}
                >
                  <Briefcase className="h-4 w-4 inline mr-1" /> Business
                </button>
                <button 
                  className={`flex-1 ${!isBusinessExpense ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-neutral-300 text-neutral-500'} border p-3 rounded-r-lg font-medium`}
                  onClick={() => setIsBusinessExpense(false)}
                >
                  <User className="h-4 w-4 inline mr-1" /> Personal
                </button>
              </div>
            </div>
            
            <div>
              <Label className="block text-sm font-medium text-neutral-700 mb-1">Notes (Optional)</Label>
              <Textarea 
                className="w-full border border-neutral-300 p-3 rounded-lg" 
                rows={2} 
                placeholder="Add details about this expense..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={handleSave}
            disabled={createExpenseMutation.isPending}
          >
            {createExpenseMutation.isPending ? "Saving..." : "Save Expense"}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          stopCamera();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Capture Receipt</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 border-2 border-dashed border-neutral-300 rounded-lg p-4 flex flex-col items-center justify-center">
          {isCameraActive ? (
            <div className="relative w-full h-64 mb-3">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover rounded-lg"
                autoPlay 
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured receipt" 
              className="max-w-xs mb-3 rounded-lg" 
            />
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1567301861581-f135cd5ff9de?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" 
              alt="Receipt placeholder" 
              className="max-w-xs mb-3 rounded-lg" 
            />
          )}
            
          <div className="flex space-x-2">
            {isCameraActive ? (
              <Button onClick={captureImage}>
                <Camera className="h-4 w-4 mr-1" /> 拍照
              </Button>
            ) : (
              <Button onClick={startCamera}>
                <Camera className="h-4 w-4 mr-1" /> {capturedImage ? "重新拍照" : "拍摄收据"}
              </Button>
            )}
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-1" /> 上传图片
            </Button>
          </div>
        </div>
        
        <div className="space-y-4 mb-4">
          <div>
            <Label>Vendor</Label>
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
                onClick={() => setVendor(prompt("Enter vendor name", vendor) || vendor)}
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount</Label>
              <input 
                type="text"
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="border border-neutral-300 p-2 rounded-lg w-full"
              />
            </div>
            <div>
              <Label>Date</Label>
              <div className="border border-neutral-300 p-2 rounded-lg">
                <span>Today, {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>
          
          <div>
            <Label>Category</Label>
            <Select defaultValue={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Office Supplies</SelectItem>
                <SelectItem value="2">Software</SelectItem>
                <SelectItem value="3">Travel</SelectItem>
                <SelectItem value="4">Meals</SelectItem>
                <SelectItem value="5">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Expense Type</Label>
              <div className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Looks deductible!</span>
              </div>
            </div>
            <div className="flex">
              <button 
                className={`flex-1 ${isBusinessExpense ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-neutral-300 text-neutral-500'} border p-2 rounded-l-lg font-medium`}
                onClick={() => setIsBusinessExpense(true)}
              >
                <Briefcase className="h-4 w-4 inline mr-1" /> Business
              </button>
              <button 
                className={`flex-1 ${!isBusinessExpense ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-neutral-300 text-neutral-500'} border p-2 rounded-r-lg font-medium`}
                onClick={() => setIsBusinessExpense(false)}
              >
                <User className="h-4 w-4 inline mr-1" /> Personal
              </button>
            </div>
          </div>
          
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea 
              rows={2} 
              placeholder="Add details about this expense..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <Button 
          className="w-full"
          onClick={handleSave}
          disabled={createExpenseMutation.isPending}
        >
          {createExpenseMutation.isPending ? "Saving..." : "Save Expense"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
