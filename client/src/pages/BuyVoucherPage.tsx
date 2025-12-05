import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import BuyVoucherSection from "@/components/BuyVoucherSection";

export default function BuyVoucherPage() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/');
  };

  const handleSuccess = () => {
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
          data-testid="button-back-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <BuyVoucherSection 
          onBack={handleBack} 
          onSuccess={handleSuccess} 
        />
      </div>
    </div>
  );
}
