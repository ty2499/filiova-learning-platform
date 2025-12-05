import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  X,
  Mail,
  CheckCircle
} from 'lucide-react';
import Logo from '@/components/Logo';
import { ShopAuthHeroSection } from '@/components/HeroSectionDisplay';

interface ShopAuthProps {
  onNavigate?: (page: string, transition?: string) => void;
  returnUrl?: string;
}

type AuthMode = 'signin' | 'signup';

export default function ShopAuth({ onNavigate, returnUrl }: ShopAuthProps) {
  const { user, profile, loading, refreshAuth } = useAuth();
  
  // Form states
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  
  // Error handling
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle verification callback from email link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');
    const sessionId = params.get('session');
    const refCode = params.get('ref');
    
    if (refCode) {
      localStorage.setItem('pendingReferralCode', refCode);
    }
    
    // Handle successful email verification via link
    if (verified === 'true' && sessionId) {
      localStorage.setItem('sessionId', sessionId);
      
      // Track referral if we have a pending referral code
      const pendingReferralCode = localStorage.getItem('pendingReferralCode');
      if (pendingReferralCode) {
        fetch('/api/shop/referral/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralCode: pendingReferralCode }),
        }).then(() => {
          localStorage.removeItem('pendingReferralCode');
        }).catch(console.error);
      }
      
      // Clear URL params and redirect
      window.history.replaceState({}, '', window.location.pathname);
      refreshAuth().then(() => {
        const destination = returnUrl || 'product-shop';
        onNavigate?.(destination, 'slide-left');
      });
    }
  }, [refreshAuth, onNavigate, returnUrl]);

  // Redirect authenticated users back to where they came from or to shop
  useEffect(() => {
    if (!loading && user && profile) {
      const destination = returnUrl || 'product-shop';
      onNavigate?.(destination, 'slide-left');
    }
  }, [user, profile, loading, onNavigate, returnUrl]);

  // Clear errors when user types
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (authMode === 'signup') {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      }
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (authMode === 'signup' && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!agreeToTerms) {
        newErrors.terms = 'You must agree to the terms and conditions';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    setErrors({});
    
    try {
      const endpoint = authMode === 'signup' ? '/api/shop/signup' : '/api/shop/signin';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...(authMode === 'signup' && { fullName: name }),
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Check if link-based verification is needed (new flow)
        if (result.requiresLinkVerification) {
          setVerificationSent(true);
          setIsProcessing(false);
          return;
        }
        
        // Check if code-based verification is needed (legacy flow)
        if (result.needsVerification) {
          setNeedsVerification(true);
          setIsProcessing(false);
          return;
        }
        
        // Store session data and refresh auth context
        if (result.sessionId) {
          localStorage.setItem('sessionId', result.sessionId);
          // Refresh auth context to load user data from database
          await refreshAuth();
        }
        
        // Track referral if this was a signup and we have a pending referral code
        if (authMode === 'signup') {
          const referralCode = localStorage.getItem('pendingReferralCode');
          if (referralCode) {
            try {
              await fetch('/api/shop/referral/track', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ referralCode }),
              });
              localStorage.removeItem('pendingReferralCode');
            } catch (error) {
              console.error('Failed to track referral:', error);
            }
          }
        }
        
        // Redirect to shop or return URL
        const destination = returnUrl || 'product-shop';
        onNavigate?.(destination, 'slide-left');
      } else {
        if (result.error?.includes('Email already registered') && authMode === 'signup') {
          setAuthMode('signin');
          setErrors({ general: 'Email already registered. Please sign in instead.' });
        } else {
          setErrors({ general: result.error || `${authMode === 'signup' ? 'Signup' : 'Sign in'} failed. Please try again.` });
        }
      }
    } catch (error) {
      console.error(`${authMode} error:`, error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setErrors({ verification: 'Verification code is required' });
      return;
    }
    
    setIsProcessing(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/shop/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Store session data and refresh auth context
        if (result.sessionId) {
          localStorage.setItem('sessionId', result.sessionId);
          await refreshAuth();
        }
        
        // Track referral if we have a pending referral code
        const referralCode = localStorage.getItem('pendingReferralCode');
        if (referralCode) {
          try {
            await fetch('/api/shop/referral/track', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ referralCode }),
            });
            localStorage.removeItem('pendingReferralCode');
          } catch (error) {
            console.error('Failed to track referral:', error);
          }
        }
        
        // Redirect to shop or return URL
        const destination = returnUrl || 'product-shop';
        onNavigate?.(destination, 'slide-left');
      } else {
        setErrors({ verification: result.error || 'Verification failed. Please try again.' });
      }
    } catch (error) {
      console.error('Verification error:', error);
      setErrors({ verification: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendLink = async () => {
    if (!email || !email.trim()) {
      setErrors({ general: 'Email not found. Please go back and sign up again.' });
      return;
    }
    
    setIsProcessing(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/shop/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setErrors({});
        setSuccessMessage('A new verification link has been sent to your email.');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrors({ general: result.error || 'Failed to resend link. Please try again.' });
      }
    } catch (error) {
      console.error('Resend link error:', error);
      setErrors({ general: 'Failed to resend link. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Close button for mobile */}
      <button
        onClick={() => onNavigate?.(returnUrl || 'product-shop', 'slide-right')}
        className="absolute top-6 left-6 z-[100] text-gray-800 hover:text-gray-900 font-medium text-sm p-2 rounded-lg transition-colors lg:hidden"
        data-testid="button-not-now"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Left Side - Dynamic Hero Section - Fixed */}
        <div className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-1/2 md:flex relative overflow-hidden z-0">
          <ShopAuthHeroSection className="w-full h-full" />
        </div>

        {/* Right Side - Form Container - Scrollable */}
        <div className="w-full md:w-1/2 md:ml-auto flex flex-col items-center justify-start md:justify-center p-8 bg-gray-100 lg:bg-gray-50 pt-20 md:pt-12 min-h-screen md:min-h-0 md:max-h-screen md:overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Logo - visible on mobile only, centered */}
            <div className="mb-3 md:hidden flex justify-center">
              <Logo 
                size="sm" 
                variant="default" 
                type="auth"
                onClick={() => onNavigate?.('home')}
                className="cursor-pointer"
                data-testid="auth-logo"
              />
            </div>
            <div className="p-8 md:pt-32">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {authMode === 'signin' ? 'Welcome Back!' : 'Join Our Shop'}
                </h2>
                <p className="text-gray-600">
                  {authMode === 'signin' 
                    ? 'Sign in to continue shopping' 
                    : 'Create an account to start shopping'
                  }
                </p>
              </div>

              {/* Check Your Email Screen - Link-based verification */}
              {verificationSent ? (
                <div className="text-center py-8" data-testid="verification-sent-screen">
                  {/* Success Message (Link Resent) */}
                  {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm mb-4">
                      {successMessage}
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {errors.general && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm mb-4">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>{errors.general}</span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-10 w-10 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
                    <p className="text-gray-600 mb-4">
                      We've sent a verification link to<br />
                      <strong className="text-gray-900">{email}</strong>
                    </p>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3 text-left">
                      <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-orange-800">
                        <p className="font-medium mb-1">Click the link in your email to verify your account</p>
                        <p className="text-orange-600">The link will expire in 24 hours</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setVerificationSent(false);
                        setErrors({});
                        setSuccessMessage('');
                      }}
                      className="w-full"
                      data-testid="button-back-to-signup"
                    >
                      Back to Sign Up
                    </Button>
                    <p className="text-sm text-gray-500">
                      Didn't receive the email? Check your spam folder or{' '}
                      <button
                        type="button"
                        onClick={handleResendLink}
                        className="text-orange-600 hover:text-orange-800 font-medium hover:underline"
                        disabled={isProcessing}
                        data-testid="button-resend-link"
                      >
                        {isProcessing ? 'Sending...' : 'resend the link'}
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
              <form onSubmit={needsVerification ? handleVerification : handleSubmit} className="space-y-5" data-testid="form-shop-auth">
                {/* General Error */}
                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{errors.general}</span>
                  </div>
                )}

                {/* Verification Success Message - Legacy code flow */}
                {needsVerification && !errors.verification && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                    <p>We've sent a verification code to <strong>{email}</strong></p>
                    <p className="mt-1">Please check your email and enter the code below.</p>
                  </div>
                )}

                {/* Verification Error */}
                {errors.verification && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{errors.verification}</span>
                  </div>
                )}

                {/* Success Message (Link Resent) */}
                {successMessage && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {successMessage}
                  </div>
                )}

                {/* Verification Code Field - When email verification is needed (legacy) */}
                {needsVerification ? (
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode" className="text-gray-700 font-medium">
                      Verification Code
                    </Label>
                    <Input
                      id="verificationCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value);
                        clearError('verification');
                      }}
                      className={errors.verification ? 'border-red-500' : ''}
                      disabled={isProcessing}
                      data-testid="input-verification-code"
                      autoFocus
                    />
                    {errors.verification && <p className="text-sm text-red-600">{errors.verification}</p>}
                    <div className="flex gap-4 justify-between">
                      <button
                        type="button"
                        onClick={handleResendLink}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        disabled={isProcessing}
                        data-testid="button-resend-code"
                      >
                        Resend link
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNeedsVerification(false);
                          setVerificationCode('');
                          setErrors({});
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                        disabled={isProcessing}
                        data-testid="button-back-to-signup"
                      >
                        Back to signup
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Name Field - Signup Only */}
                    {authMode === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            clearError('name');
                          }}
                          className={errors.name ? 'border-red-500' : ''}
                          disabled={isProcessing}
                          data-testid="input-name"
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                      </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearError('email');
                        }}
                        className={errors.email ? 'border-red-500' : ''}
                        disabled={isProcessing}
                        data-testid="input-email"
                      />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700 font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder={authMode === 'signin' ? 'Enter your password' : 'Create a password (min 8 characters)'}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearError('password');
                          }}
                          className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
                          disabled={isProcessing}
                          data-testid="input-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          disabled={isProcessing}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>

                    {/* Confirm Password - Signup Only */}
                    {authMode === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            clearError('confirmPassword');
                          }}
                          className={errors.confirmPassword ? 'border-red-500' : ''}
                          disabled={isProcessing}
                          data-testid="input-confirm-password"
                        />
                        {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                      </div>
                    )}

                    {/* Terms Checkbox - Signup Only */}
                    {authMode === 'signup' && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="terms"
                            checked={agreeToTerms}
                            onCheckedChange={(checked) => {
                              setAgreeToTerms(checked as boolean);
                              clearError('terms');
                            }}
                            disabled={isProcessing}
                            className="h-4 w-4 mt-0.5"
                            data-testid="checkbox-terms"
                          />
                          <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 leading-snug cursor-pointer">
                            I agree to the{' '}
                            <a href="/terms" target="_blank" className="text-blue-600 hover:underline font-medium">
                              Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" target="_blank" className="text-blue-600 hover:underline font-medium">
                              Privacy Policy
                            </a>
                          </label>
                        </div>
                        {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}
                      </div>
                    )}
                  </>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-base font-semibold"
                  disabled={isProcessing}
                  data-testid={`button-${needsVerification ? 'verify' : authMode}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {needsVerification ? 'Verifying...' : (authMode === 'signin' ? 'Signing In...' : 'Creating Account...')}
                    </>
                  ) : (
                    needsVerification ? 'Verify Email' : (authMode === 'signin' ? 'Sign In' : 'Create Account')
                  )}
                </Button>

                {/* Toggle between Sign In / Sign Up */}
                <div className="text-center pt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                      setErrors({});
                      setName('');
                      setPassword('');
                      setConfirmPassword('');
                      setAgreeToTerms(false);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline block w-full"
                    disabled={isProcessing}
                    data-testid={`button-switch-to-${authMode === 'signin' ? 'signup' : 'signin'}`}
                  >
                    {authMode === 'signin' 
                      ? "Don't have an account? Sign up" 
                      : 'Already have an account? Sign in'
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(returnUrl || 'product-shop', 'slide-right')}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium hover:underline"
                    disabled={isProcessing}
                    data-testid="button-not-now"
                  >
                    Not now
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
