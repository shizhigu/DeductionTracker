import { Lightbulb } from "lucide-react";

export default function TaxSavingsTip() {
  return (
    <div className="bg-primary-50 p-4 rounded-xl mt-4 border border-primary-100">
      <div className="flex">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary mr-3 flex-shrink-0">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-medium text-primary-800 mb-1">Tax Savings Tip</h4>
          <p className="text-sm text-primary-700">
            Remember to track your home office expenses. You can deduct $5 per sq ft up to 300 sq ft of your home used for business.
          </p>
        </div>
      </div>
    </div>
  );
}
