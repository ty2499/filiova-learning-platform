import { ReactNode } from 'react';
import Logo from '@/components/Logo';
import { AuthHeroSection } from '@/components/HeroSectionDisplay';

interface AuthLayoutProps {
  children: ReactNode;
  onNavigate?: (page: string) => void;
  showNotNow?: boolean;
  notNowText?: string;
  notNowAction?: () => void;
}

export default function AuthLayout({
  children,
  onNavigate,
  showNotNow = true,
  notNowText = "Not now",
  notNowAction
}: AuthLayoutProps) {

  const handleNotNow = () => {
    if (notNowAction) {
      notNowAction();
    } else if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Left Side - Dynamic Hero Section (Fixed) */}
        <div className="hidden md:flex md:w-1/2 fixed left-0 top-0 h-screen overflow-hidden z-0">
          <AuthHeroSection className="w-full h-full" />
        </div>

        {/* Right Side - Form Container (Scrollable) */}
        <div className="w-full md:w-1/2 md:ml-[50%] flex flex-col items-center justify-between px-6 py-6 md:px-8 md:py-8 bg-gray-100 lg:bg-gray-50 min-h-screen overflow-y-auto relative">
          <div className="w-full flex-1 flex items-center justify-center">
            {/* Logo - visible on mobile only */}
            <div className="w-full">
              <div className="mb-3 md:hidden flex justify-center">
                <Logo />
              </div>
              {children}
            </div>
          </div>

          {/* Not Now Button - at bottom */}
          {showNotNow && (
            <div className="w-full flex justify-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleNotNow}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                data-testid="button-not-now"
              >
                Not Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
