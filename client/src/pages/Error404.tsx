import { Button } from "@/components/ui/button";

export default function Error404() {
  const handleGoToDashboard = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="60" y="40" width="80" height="100" rx="4" fill="#E5E7EB"/>
          <rect x="70" y="50" width="60" height="4" rx="2" fill="#D1D5DB"/>
          <circle cx="77" cy="65" r="3" fill="#9CA3AF"/>
          <circle cx="77" cy="75" r="3" fill="#9CA3AF"/>
          <circle cx="77" cy="85" r="3" fill="#9CA3AF"/>
          <circle cx="77" cy="95" r="3" fill="#9CA3AF"/>
          <rect x="85" y="62" width="40" height="2" rx="1" fill="#D1D5DB"/>
          <rect x="85" y="72" width="35" height="2" rx="1" fill="#D1D5DB"/>
          <rect x="85" y="82" width="30" height="2" rx="1" fill="#D1D5DB"/>
          <rect x="85" y="92" width="38" height="2" rx="1" fill="#D1D5DB"/>
          <circle cx="160" cy="80" r="35" fill="white" stroke="#E5E7EB" strokeWidth="3"/>
          <circle cx="160" cy="80" r="25" stroke="#3B82F6" strokeWidth="3" fill="none"/>
          <rect x="172" y="68" width="3" height="24" rx="1.5" fill="#3B82F6" transform="rotate(45 172 68)"/>
        </svg>
      </div>
      
      <h1 className="text-6xl font-bold text-blue-600 mb-4" data-testid="text-error-code">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-3" data-testid="text-error-title">Something went wrong</h2>
      <p className="text-gray-600 mb-8" data-testid="text-error-description">Sorry we were unable to find that page</p>
      
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
