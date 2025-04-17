import { useState } from "react";
import { Camera, Pen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import ReceiptCapture from "@/components/receipts/ReceiptCapture";

export default function ActionButtons() {
  const isMobile = useMobile();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  if (isMobile) {
    return (
      <div className="grid grid-cols-3 gap-3 mb-8">
        <button 
          onClick={() => setShowReceiptModal(true)}
          className="flex flex-col items-center justify-center bg-primary-50 text-primary py-3 px-2 rounded-xl"
        >
          <Camera className="h-4 w-4 mb-1" />
          <span className="text-xs">Snap</span>
        </button>
        
        <button className="flex flex-col items-center justify-center bg-neutral-50 text-neutral-600 py-3 px-2 rounded-xl">
          <Pen className="h-4 w-4 mb-1" />
          <span className="text-xs">Log</span>
        </button>
        
        <button className="flex flex-col items-center justify-center bg-neutral-50 text-neutral-600 py-3 px-2 rounded-xl">
          <Download className="h-4 w-4 mb-1" />
          <span className="text-xs">Export</span>
        </button>
        
        {/* Receipt Modal */}
        <ReceiptCapture 
          isOpen={showReceiptModal} 
          onClose={() => setShowReceiptModal(false)} 
          isMobile={true}
        />
      </div>
    );
  }
  
  return (
    <div className="flex gap-4 mb-8">
      <Button 
        onClick={() => setShowReceiptModal(true)}
        className="flex items-center bg-primary hover:bg-primary-600 text-white"
      >
        <Camera className="h-4 w-4 mr-2" />
        <span>Snap Receipt</span>
      </Button>
      
      <Button variant="outline" className="flex items-center bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200">
        <Pen className="h-4 w-4 mr-2" />
        <span>Log Manually</span>
      </Button>
      
      <Button variant="outline" className="flex items-center bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200">
        <Download className="h-4 w-4 mr-2" />
        <span>Export Report</span>
      </Button>
      
      {/* Receipt Modal */}
      <ReceiptCapture 
        isOpen={showReceiptModal} 
        onClose={() => setShowReceiptModal(false)} 
        isMobile={false}
      />
    </div>
  );
}
