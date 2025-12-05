import { Button } from "@/components/ui/button";

export default function Error500() {
  const handleGoToDashboard = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="40" y="60" width="50" height="80" rx="4" fill="#E5E7EB"/>
          <rect x="50" y="70" width="30" height="4" rx="2" fill="#D1D5DB"/>
          <rect x="50" y="78" width="25" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="50" y="85" width="28" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="50" y="92" width="22" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="50" y="99" width="26" height="3" rx="1.5" fill="#D1D5DB"/>
          
          <rect x="105" y="60" width="50" height="80" rx="4" fill="#E5E7EB"/>
          <rect x="115" y="70" width="30" height="4" rx="2" fill="#D1D5DB"/>
          <rect x="115" y="78" width="25" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="115" y="85" width="28" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="115" y="92" width="22" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="115" y="99" width="26" height="3" rx="1.5" fill="#D1D5DB"/>
          
          <rect x="72.5" y="45" width="50" height="80" rx="4" fill="#F3F4F6"/>
          <rect x="82.5" y="55" width="30" height="4" rx="2" fill="#D1D5DB"/>
          <rect x="82.5" y="63" width="25" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="82.5" y="70" width="28" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="82.5" y="77" width="22" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="82.5" y="84" width="26" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="82.5" y="91" width="24" height="3" rx="1.5" fill="#D1D5DB"/>
        </svg>
      </div>
      
      <h1 className="text-6xl font-bold text-blue-600 mb-4" data-testid="text-error-code">500</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-3" data-testid="text-error-title">This page isn't working</h2>
      <p className="text-gray-600 mb-8" data-testid="text-error-description">We apologise and are fixing the problem. Please try again later.</p>
      
      <Button 
        onClick={handleGoToDashboard}
        className="bg-[#1e293b] hover:bg-[#334155] text-white px-8 py-2 rounded-full"
        data-testid="button-go-home"
      >
        Go to Home
      </Button>
    </div>
  );
}
