export default function Maintenance() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex justify-center">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="50" y="120" width="100" height="15" rx="4" fill="#9CA3AF"/>
          <rect x="48" y="135" width="8" height="30" rx="4" fill="#6B7280"/>
          <rect x="144" y="135" width="8" height="30" rx="4" fill="#6B7280"/>
          
          <path d="M60 120 L80 80 L120 80 L140 120" fill="#F59E0B" stroke="#D97706" strokeWidth="2"/>
          <path d="M70 85 L75 75 L80 85" fill="#E5E7EB"/>
          <path d="M90 85 L95 75 L100 85" fill="#E5E7EB"/>
          <path d="M110 85 L115 75 L120 85" fill="#E5E7EB"/>
          
          <circle cx="100" cy="40" r="12" fill="#FEF3C7"/>
          <path d="M100 28 L100 20" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          <path d="M115 45 L120 50" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          <path d="M85 45 L80 50" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
          
          <path d="M140 50 L160 35 L175 50 L160 140 L145 140 Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
          <rect x="155" y="60" width="10" height="3" rx="1.5" fill="#9CA3AF"/>
          <rect x="155" y="68" width="10" height="3" rx="1.5" fill="#9CA3AF"/>
          
          <path d="M165 30 L170 25 L175 30" stroke="#DC2626" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="168" y="32" width="4" height="15" rx="2" fill="#DC2626"/>
          <circle cx="170" cy="52" r="2" fill="#DC2626"/>
        </svg>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-800 mb-3" data-testid="text-maintenance-title">System is down for Maintenance</h2>
      <p className="text-gray-600" data-testid="text-maintenance-description">We promise, we'll be right back!</p>
    </div>
  );
}
