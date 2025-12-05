import { Button } from "@/components/ui/button";

export default function Error401() {
  const handleGoToDashboard = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="50" y="60" width="80" height="100" rx="4" fill="#E5E7EB"/>
          <rect x="60" y="70" width="60" height="4" rx="2" fill="#D1D5DB"/>
          <rect x="60" y="80" width="50" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="60" y="88" width="55" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="60" y="96" width="45" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="60" y="104" width="52" height="3" rx="1.5" fill="#D1D5DB"/>
          <rect x="60" y="112" width="48" height="3" rx="1.5" fill="#D1D5DB"/>
          <circle cx="145" cy="90" r="30" fill="#D1D5DB"/>
          <circle cx="145" cy="90" r="22" fill="#F3F4F6"/>
          <path d="M145 75 L145 85" stroke="#6B7280" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="145" cy="95" r="2" fill="#6B7280"/>
          <path d="M130 115 L125 105 L135 105 Z" fill="#3B82F6"/>
          <rect x="123" y="115" width="4" height="20" rx="2" fill="#3B82F6"/>
        </svg>
      </div>
      
      <h1 className="text-6xl font-bold text-blue-600 mb-4" data-testid="text-error-code">401</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-3" data-testid="text-error-title">Unauthorized</h2>
      <p className="text-gray-600 mb-8" data-testid="text-error-description">Something has gone wrong on the web site's server</p>
      
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
