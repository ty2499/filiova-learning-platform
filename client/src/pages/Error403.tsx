import { Button } from "@/components/ui/button";

export default function Error403() {
  const handleGoToDashboard = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="70" y="90" width="60" height="70" rx="4" fill="#E5E7EB"/>
          <rect x="85" y="85" width="30" height="5" rx="2.5" fill="#9CA3AF"/>
          <circle cx="100" cy="125" r="8" fill="#D1D5DB"/>
          <rect x="98" y="133" width="4" height="15" rx="2" fill="#D1D5DB"/>
          <path d="M70 115 L70 95 C70 80 85 70 100 70 C115 70 130 80 130 95 L130 115" stroke="#9CA3AF" strokeWidth="5" fill="none"/>
          <path d="M85 45 L100 30 L115 45" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="98" y="50" width="4" height="25" rx="2" fill="#F59E0B"/>
          <circle cx="100" cy="82" r="3" fill="#F59E0B"/>
          <path d="M55 75 L50 85 L65 100" stroke="#D1D5DB" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="48" cy="95" r="8" fill="#E5E7EB"/>
          <circle cx="48" cy="95" r="4" fill="#F3F4F6"/>
        </svg>
      </div>
      
      <h1 className="text-6xl font-bold text-blue-600 mb-4" data-testid="text-error-code">403</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-3" data-testid="text-error-title">Forbidden</h2>
      <p className="text-gray-600 mb-8" data-testid="text-error-description">Accessing the page or resource you were trying to reach is forbidden.</p>
      
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
