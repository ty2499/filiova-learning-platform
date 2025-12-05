import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  CheckCircle2,
  DollarSign,
  BookOpen,
  X,
  Wallet
} from "lucide-react";
import { CardElement, useStripe, useElements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SiPaypal } from "react-icons/si";
import { useAuth } from "@/hooks/useAuth";
import { usePaystackPayment } from 'react-paystack';
import { useIPLocation } from "@/hooks/useIPLocation";
import { WORLD_CURRENCIES } from '@shared/currency';
import { useQuery } from "@tanstack/react-query";
import { useEnabledGateways } from "@/hooks/useEnabledGateways";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
}

interface NewPaymentModalProps {
  courseId: string;
  course: Course;
  onClose: () => void;
  purchaseMutation: any;
  confirmPurchaseMutation: any;
}

type PaymentMethod = 'card' | 'paypal' | 'wallet' | 'paystack' | 'saved_card' | 'dodopay' | 'vodapay' | 'system_wallet' | string;

interface SavedPaymentMethod {
  id: string;
  displayName: string;
  lastFour?: string;
  expiryDate?: string;
  cardholderName?: string;
  type: string;
  isDefault: boolean;
  stripePaymentMethodId?: string;
}

export default function NewPaymentModal({ 
  courseId, 
  course, 
  onClose, 
  purchaseMutation, 
  confirmPurchaseMutation 
}: NewPaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { profile } = useAuth();
  
  // IP-based location detection for South Africa
  const { isSouthAfrican, countryCode, loading: locationLoading } = useIPLocation();
  
  // Get currency info for South Africa
  const userCurrency = isSouthAfrican && countryCode ? WORLD_CURRENCIES[countryCode] : null;
  const currencySymbol = userCurrency?.symbol || '$';
  const exchangeRate = userCurrency?.rate || 1.0;
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed'>('success');
  const [promoCode, setPromoCode] = useState('');
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [selectedSavedCard, setSelectedSavedCard] = useState<string | null>(null);

  // Fetch enabled payment gateways
  const { data: enabledGateways = [], isLoading: gatewaysLoading } = useEnabledGateways();

  // Get primary gateway (fallback to first enabled if no primary set)
  const primaryGateway = enabledGateways.find(g => g.isPrimary) || enabledGateways[0];
  
  // Check if Stripe is enabled (for wallet and saved cards)
  const isStripeEnabled = enabledGateways.some(g => g.gatewayId === 'stripe');
  
  // Check if PayPal is enabled (should always show if enabled)
  const isPayPalEnabled = enabledGateways.some(g => g.gatewayId === 'paypal');

  // Fetch user's wallet balance
  const { data: wallet } = useQuery({
    queryKey: ['/api/shop/wallet'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/shop/wallet');
      } catch (error) {
        return { balance: '0.00' };
      }
    }
  });

  // Fetch saved payment methods
  const { data: savedPaymentMethods = [] } = useQuery<SavedPaymentMethod[]>({
    queryKey: ['/api/payment-methods'],
    queryFn: async () => {
      try {
        return await apiRequest('/api/payment-methods');
      } catch (error) {
        return [];
      }
    }
  });

  // Helper function to check if a gateway is the primary gateway
  const isPrimaryGateway = (gatewayId: string) => {
    return primaryGateway?.gatewayId === gatewayId;
  };

  // Set initial payment method based on available options
  useEffect(() => {
    if (!gatewaysLoading && primaryGateway && !selectedMethod) {
      // Use the primary gateway as the default payment method
      if (primaryGateway.gatewayId === 'vodapay') {
        setSelectedMethod('vodapay');
      } else if (primaryGateway.gatewayId === 'stripe') {
        // For Stripe, prioritize saved cards if available
        if (savedPaymentMethods.length > 0) {
          setSelectedMethod('saved_card');
        } else {
          setSelectedMethod('card');
        }
      } else {
        // For other gateways (dodopay, paystack, etc.)
        setSelectedMethod(primaryGateway.gatewayId as PaymentMethod);
      }
    }
  }, [gatewaysLoading, primaryGateway, selectedMethod, savedPaymentMethods.length]);

  const coursePrice = parseFloat(course.price?.toString() || '0');
  
  // Calculate discount and final price in USD
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const { discountType, discountValue, maxDiscount } = appliedCoupon.coupon;
    
    if (discountType === 'percentage') {
      const discount = (coursePrice * discountValue) / 100;
      return maxDiscount ? Math.min(discount, maxDiscount) : discount;
    } else {
      return Math.min(discountValue, coursePrice);
    }
  };
  
  const discountAmount = calculateDiscount();
  const finalPriceUSD = Math.max(coursePrice - discountAmount, 0);
  
  // Convert prices to local currency for South African users
  const coursePriceLocal = isSouthAfrican ? coursePrice * exchangeRate : coursePrice;
  const discountAmountLocal = isSouthAfrican ? discountAmount * exchangeRate : discountAmount;
  const finalPriceLocal = isSouthAfrican ? finalPriceUSD * exchangeRate : finalPriceUSD;

  // Wallet balance calculations (after finalPriceUSD is defined)
  const walletBalance = parseFloat(wallet?.balance || '0');
  const hasWalletBalance = walletBalance > 0;
  const hasSufficientBalance = walletBalance >= finalPriceUSD;

  // Initialize Stripe Payment Request (for Apple Pay & Google Pay)
  // Show wallet whenever Stripe is enabled, regardless of primary status
  useEffect(() => {
    if (!isStripeEnabled || !stripe || !finalPriceUSD) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: course.title,
        amount: Math.round(finalPriceUSD * 100), // Use discounted price
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if Payment Request is available
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
      }
    });

    // Handle payment method received
    pr.on('paymentmethod', async (ev) => {
      try {
        if (!clientSecret) {
          const couponCode = appliedCoupon?.coupon?.code || '';
          const purchaseResult = await purchaseMutation.mutateAsync(couponCode);
          const secret = purchaseResult.clientSecret;
          
          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
            secret,
            { payment_method: ev.paymentMethod.id },
            { handleActions: false }
          );

          if (confirmError) {
            ev.complete('fail');
            return;
          }

          if (paymentIntent?.status === 'succeeded') {
            await confirmPurchaseMutation.mutateAsync({ 
              paymentIntentId: paymentIntent.id,
              amount: finalPriceUSD
            });
            
            // Store payment details for success screen
            setPaymentDetails({
              transactionId: paymentIntent.id,
              date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              paymentMethod: 'Digital Wallet',
              total: finalPriceUSD,
              currency: currencySymbol,
              courseId: courseId
            });
            
            ev.complete('success');
            setPaymentStatus('success');
            setShowSuccess(true);
          }
        }
      } catch (error: any) {
        ev.complete('fail');
        // Show failure receipt
        setPaymentDetails({
          transactionId: 'N/A',
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          paymentMethod: 'Digital Wallet',
          total: finalPriceUSD,
          currency: currencySymbol,
          courseId: courseId,
          errorMessage: error?.message || 'Digital wallet payment failed. Please try again.'
        });
        setPaymentStatus('failed');
        setShowSuccess(true);
      }
    });
  }, [stripe, finalPriceUSD, course.title, isStripeEnabled]);

  // Create payment intent when modal opens (for card payments)
  // Recreate when coupon is applied/removed to ensure correct amount
  useEffect(() => {
    if (isStripeEnabled && (selectedMethod === 'card' || selectedMethod === 'saved_card')) {
      const createPaymentIntent = async () => {
        try {
          // Pass the coupon code to the backend to create the intent with correct amount
          const couponCode = appliedCoupon?.coupon?.code || '';
          const purchaseResult = await purchaseMutation.mutateAsync(couponCode);
          setClientSecret(purchaseResult.clientSecret);
        } catch (error: any) {
          const errorMessage = error?.message || error?.response?.data?.error || 'Failed to create payment intent. Please try again.';
          console.error('Payment intent error:', errorMessage);
          
          // Show failure slip/receipt instead of simple error modal
          setPaymentDetails({
            transactionId: 'N/A',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            paymentMethod: 'Card',
            total: finalPriceUSD,
            currency: currencySymbol,
            courseId: courseId,
            errorMessage: errorMessage
          });
          setPaymentStatus('failed');
          setShowSuccess(true);
        }
      };
      createPaymentIntent();
    }
  }, [selectedMethod, appliedCoupon, isStripeEnabled]); // Recreate when coupon changes

  // Handle Stripe Card Payment
  const handleCardPayment = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        await confirmPurchaseMutation.mutateAsync({ 
          paymentIntentId: paymentIntent.id,
          amount: finalPriceUSD
        });
        
        // Store payment details for success screen
        setPaymentDetails({
          transactionId: paymentIntent.id,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          paymentMethod: 'Card',
          total: finalPriceUSD,
          currency: currencySymbol,
          courseId: courseId
        });
        
        setPaymentStatus('success');
        setShowSuccess(true);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (error: any) {
      // Show failure receipt
      setPaymentDetails({
        transactionId: 'N/A',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        paymentMethod: 'Card',
        total: finalPriceUSD,
        currency: currencySymbol,
        courseId: courseId,
        errorMessage: error?.message || 'Payment failed. Please try again.'
      });
      setPaymentStatus('failed');
      setShowSuccess(true);
    } finally {
      setProcessing(false);
    }
  };

  // Handle PayPal Payment
  const handlePayPalPayment = async () => {
    setProcessing(true);
    try {
      // Initialize PayPal payment (always use USD)
      // Note: PayPal requires redirect for approval, so the success screen
      // will be handled by the return URL callback on the backend
      const response = await fetch('/api/paypal/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: finalPriceUSD.toFixed(2), 
          currency: 'USD',
          intent: 'CAPTURE',
          returnUrl: `${window.location.origin}/course-player-${courseId}?payment=success`,
          cancelUrl: `${window.location.origin}/course-detail-${courseId}?payment=cancelled`
        }),
      });
      
      const orderData = await response.json();
      
      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to create PayPal order');
      }
      
      // Redirect to PayPal for approval
      // User will return to the course page after payment
      if (orderData.links) {
        const approvalLink = orderData.links.find((link: any) => link.rel === 'approve');
        if (approvalLink) {
          window.location.href = approvalLink.href;
        } else {
          throw new Error('No approval link found in PayPal response');
        }
      } else {
        throw new Error('Invalid PayPal order response');
      }
    } catch (error: any) {
      setProcessing(false);
    }
  };

  // Handle System Wallet Payment
  const handleSystemWalletPayment = async () => {
    if (!hasSufficientBalance) {
      // Show failure receipt for insufficient balance
      setPaymentDetails({
        transactionId: 'N/A',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        paymentMethod: 'System Wallet',
        total: finalPriceUSD,
        currency: currencySymbol,
        courseId: courseId,
        errorMessage: `Insufficient wallet balance. You have $${walletBalance.toFixed(2)}, but need $${finalPriceUSD.toFixed(2)}.`
      });
      setPaymentStatus('failed');
      setShowSuccess(true);
      return;
    }

    setProcessing(true);
    try {
      // Process wallet payment
      const response = await apiRequest('/api/courses/purchase-with-wallet', {
        method: 'POST',
        body: JSON.stringify({
          courseId,
          amount: finalPriceUSD,
          couponCode: appliedCoupon?.coupon?.code || ''
        })
      });

      if (response.success) {
        // Invalidate queries to refresh enrollment and purchase status
        queryClient.invalidateQueries({ queryKey: [`/api/course-creator/courses/${courseId}/enrollment`] });
        queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/purchase-status`] });
        queryClient.invalidateQueries({ queryKey: ['/api/course-creator/my-courses'] });
        queryClient.invalidateQueries({ queryKey: ['/api/shop/wallet'] });
        
        // Show success receipt
        setPaymentDetails({
          transactionId: response.transactionId || `wallet-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          paymentMethod: 'System Wallet',
          total: finalPriceUSD,
          currency: currencySymbol,
          courseId: courseId
        });
        
        setPaymentStatus('success');
        setShowSuccess(true);
      } else {
        throw new Error(response.error || 'Wallet payment failed');
      }
    } catch (error: any) {
      // Show failure receipt
      setPaymentDetails({
        transactionId: 'N/A',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        paymentMethod: 'System Wallet',
        total: finalPriceUSD,
        currency: currencySymbol,
        courseId: courseId,
        errorMessage: error?.message || 'Wallet payment failed. Please try another payment method.'
      });
      setPaymentStatus('failed');
      setShowSuccess(true);
    } finally {
      setProcessing(false);
    }
  };

  // Paystack configuration (for South African users only)
  const paystackConfig = {
    reference: `course-${courseId}-${new Date().getTime()}`,
    email: profile?.email || 'user@example.com',
    amount: Math.round(finalPriceLocal * 100), // Paystack expects amount in kobo (100 kobo = 1 ZAR)
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    currency: 'ZAR',
    metadata: {
      custom_fields: [
        {
          display_name: "Course ID",
          variable_name: "course_id",
          value: courseId
        },
        {
          display_name: "Course Title",
          variable_name: "course_title",
          value: course.title
        },
        {
          display_name: "Amount USD",
          variable_name: "amount_usd",
          value: finalPriceUSD.toFixed(2)
        }
      ]
    },
  };

  // Paystack payment handlers
  const onPaystackSuccess = async (reference: any) => {
    try {
      setProcessing(true);
      
      // Verify payment and complete purchase on backend (use USD amount)
      await confirmPurchaseMutation.mutateAsync({ 
        paymentIntentId: reference.reference,
        amount: finalPriceUSD,
        paymentMethod: 'paystack'
      });
      
      // Store payment details for success screen
      setPaymentDetails({
        transactionId: reference.reference,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        paymentMethod: 'Card Payment',
        total: finalPriceUSD,
        currency: currencySymbol,
        courseId: courseId
      });
      
      setPaymentStatus('success');
      setShowSuccess(true);
    } catch (error: any) {
      // Show failure receipt
      setPaymentDetails({
        transactionId: 'N/A',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        paymentMethod: 'Card Payment',
        total: finalPriceUSD,
        currency: currencySymbol,
        courseId: courseId,
        errorMessage: error?.message || 'Payment verification failed. Please try again.'
      });
      setPaymentStatus('failed');
      setShowSuccess(true);
    } finally {
      setProcessing(false);
    }
  };

  const onPaystackClose = () => {
    // Silent close - AJAX only
  };

  const initializePaystackPayment = usePaystackPayment(paystackConfig);

  // Success/Failure state - Payment Receipt Screen
  if (showSuccess && paymentDetails) {
    const isSuccess = paymentStatus === 'success';
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto pt-16 md:pt-20 px-4 pb-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-900">
          <div className="flex justify-end p-4 pb-0">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              data-testid="button-close-receipt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <CardContent className="p-8 pt-2">
            {/* Success/Failure Icon and Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-24 h-24 mb-4 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="35" y="15" width="40" height="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" />
                  <rect x="25" y="25" width="50" height="50" fill="white" stroke="currentColor" strokeWidth="2" rx="4" className="text-gray-800 dark:text-gray-200" />
                  <line x1="30" y1="35" x2="70" y2="35" stroke="currentColor" strokeWidth="1.5" className="text-gray-400" />
                  <line x1="30" y1="45" x2="65" y2="45" stroke="currentColor" strokeWidth="1.5" className="text-gray-400" />
                  <line x1="30" y1="55" x2="60" y2="55" stroke="currentColor" strokeWidth="1.5" className="text-gray-400" />
                  {isSuccess ? (
                    <>
                      <circle cx="80" cy="30" r="15" fill="#10b981" />
                      <path d="M 73 30 L 78 35 L 87 25" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  ) : (
                    <>
                      <circle cx="80" cy="30" r="15" fill="#ef4444" />
                      <path d="M 75 25 L 85 35 M 85 25 L 75 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  )}
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2 dark:text-white">
                {isSuccess ? 'Payment Successful' : 'Payment Failed'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isSuccess 
                  ? 'Payment Successful! Thanks for your order — it\'s now confirmed.'
                  : paymentDetails.errorMessage || 'Unfortunately, your payment could not be processed. Please try again.'}
              </p>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 space-y-3">
              <h3 className="font-semibold text-sm mb-3 dark:text-white">Payment Details</h3>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-medium dark:text-white">
                  {paymentDetails.transactionId === 'N/A' 
                    ? paymentDetails.transactionId 
                    : paymentDetails.transactionId.slice(-12)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium dark:text-white">{paymentDetails.date}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type of Transaction</span>
                <span className="font-medium dark:text-white">{paymentDetails.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium dark:text-white">{paymentDetails.currency}{paymentDetails.total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                {isSuccess ? (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Success
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 font-medium">
                    <X className="w-4 h-4" />
                    Failed
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons for Failed Payments */}
            {!isSuccess && (
              <div className="space-y-2">
                <Button 
                  onClick={() => {
                    setShowSuccess(false);
                    setPaymentDetails(null);
                    setPaymentStatus('success');
                    setClientSecret(null);
                  }}
                  className="w-full"
                  data-testid="button-try-again"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                  data-testid="button-cancel-payment"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (gatewaysLoading) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <Card className="w-full max-w-md mx-4 bg-white dark:bg-gray-900">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded mb-4 w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded mb-2 w-1/2 mx-auto"></div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Loading payment options...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - no payment methods available
  if (!selectedMethod && !gatewaysLoading) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <Card className="w-full max-w-md mx-4 bg-white dark:bg-gray-900">
          <CardContent className="p-8 text-center">
            <X className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment Methods Available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No payment methods are currently configured. Please contact support or try again later.
            </p>
            <Button onClick={onClose} variant="outline" data-testid="button-close-no-payment">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isStripeEnabled && selectedMethod === 'card' && !clientSecret) {
    return (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <Card className="w-full max-w-md mx-4 bg-white dark:bg-gray-900">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded mb-4 w-3/4 mx-auto"></div>
              <div className="h-4 bg-muted rounded mb-2 w-1/2 mx-auto"></div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Initializing payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-[60] overflow-y-auto pt-16 md:pt-20 px-4 pb-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !processing) {
          onClose();
        }
      }}
    >
      <Card className="rounded-2xl text-[#1F1E30] transition-colors duration-300 border-gray-100 w-full md:max-w-5xl bg-gradient-to-br from-white via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/20 md:shadow-2xl shadow-none border-0 md:border md:rounded-2xl">
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            disabled={processing}
            data-testid="button-close-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <CardContent className="p-4 md:p-8 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Left Side - Order Summary */}
            <div className="space-y-4 md:space-y-6">
              <h3 className="font-semibold text-base md:text-lg dark:text-white">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{course.title}</div>
                    <div className="text-xs text-muted-foreground">One-time purchase • Lifetime access</div>
                  </div>
                </div>
              </div>

              {!showPromoInput && !appliedCoupon && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4" 
                  onClick={() => setShowPromoInput(true)}
                  data-testid="button-show-promo"
                >
                  Add Promo Code
                </Button>
              )}

              {showPromoInput && !appliedCoupon && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      className="flex-1"
                      data-testid="input-promo-code"
                    />
                    <Button 
                      size="sm" 
                      onClick={async () => {
                        if (!promoCode.trim()) {
                          setCouponError('Please enter a promo code');
                          return;
                        }
                        
                        setIsApplyingCoupon(true);
                        setCouponError('');
                        
                        try {
                          const response = await apiRequest('/api/cart/apply-coupon', {
                            method: 'POST',
                            body: JSON.stringify({ code: promoCode.trim().toUpperCase() }),
                          });
                          setAppliedCoupon(response);
                          setShowPromoInput(false);
                        } catch (error: any) {
                          setCouponError(error.message || 'Invalid promo code');
                        } finally {
                          setIsApplyingCoupon(false);
                        }
                      }}
                      disabled={isApplyingCoupon || !promoCode.trim()}
                      data-testid="button-apply-promo"
                    >
                      {isApplyingCoupon ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500">{couponError}</p>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs" 
                    onClick={() => {
                      setShowPromoInput(false);
                      setPromoCode('');
                      setCouponError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {appliedCoupon && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          {appliedCoupon.coupon.code}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {appliedCoupon.coupon.description || 'Discount applied'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setPromoCode('');
                        setCouponError('');
                      }}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{currencySymbol}{coursePriceLocal.toFixed(2)}</span>
                </div>
                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedCoupon.coupon.code})</span>
                    <span>-{currencySymbol}{discountAmountLocal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total due today</span>
                  <span>{currencySymbol}{finalPriceLocal.toFixed(2)}</span>
                </div>
                {isSouthAfrican && (
                  <p className="text-xs text-muted-foreground text-right">
                    ≈ ${finalPriceUSD.toFixed(2)} USD
                  </p>
                )}
              </div>
            </div>

            {/* Right Side - Payment Form */}
            <div className="space-y-4 md:space-y-6">
              {/* Saved Payment Methods - Show only if Stripe is primary and has saved cards */}
              {isStripeEnabled && primaryGateway?.gatewayId === 'stripe' && savedPaymentMethods.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-base md:text-lg dark:text-white">Payment</h3>
                  <div className="space-y-2 mb-4">
                    {savedPaymentMethods.slice(0, 2).map((method) => (
                      <button
                        key={method.id}
                        onClick={() => {
                          setSelectedSavedCard(method.id);
                          setSelectedMethod('saved_card');
                        }}
                        className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                          selectedSavedCard === method.id && selectedMethod === 'saved_card'
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{method.displayName}</div>
                            {method.lastFour && (
                              <div className="text-xs text-muted-foreground">•••• {method.lastFour}</div>
                            )}
                          </div>
                          {selectedSavedCard === method.id && selectedMethod === 'saved_card' && (
                            <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                    
                    {/* Visual Card Display for Selected Card */}
                    {selectedSavedCard && selectedMethod === 'saved_card' && (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 p-6 shadow-lg">
                        <div className="absolute top-6 left-6">
                          <div className="w-12 h-10 bg-white/20 rounded backdrop-blur-sm flex items-center justify-center">
                            <div className="text-2xl">💳</div>
                          </div>
                        </div>
                        
                        {/* Card Number */}
                        <div className="absolute bottom-20 left-6 right-6">
                          <div className="flex gap-3 text-white font-mono text-lg">
                            <span>1234</span>
                            <span>1234</span>
                            <span>1234</span>
                            <span>{savedPaymentMethods.find(m => m.id === selectedSavedCard)?.lastFour || '1234'}</span>
                          </div>
                        </div>
                        
                        {/* Cardholder Name and Expiry */}
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                          <div className="text-white">
                            <div className="text-xs opacity-80">Cardholder</div>
                            <div className="text-sm font-medium">
                              {savedPaymentMethods.find(m => m.id === selectedSavedCard)?.cardholderName || 'Card Holder'}
                            </div>
                          </div>
                          <div className="text-white text-right">
                            <div className="text-xs opacity-80">Expires</div>
                            <div className="text-sm font-medium">
                              {savedPaymentMethods.find(m => m.id === selectedSavedCard)?.expiryDate || '12/29'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Mastercard Logo */}
                        <div className="absolute top-6 right-6">
                          <div className="flex gap-1">
                            <div className="w-8 h-8 rounded-full bg-red-500 opacity-80" />
                            <div className="w-8 h-8 rounded-full bg-orange-500 opacity-80 -ml-4" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Payment Method Selection */}
              <div>
                <h3 className="font-semibold mb-3 text-base md:text-lg dark:text-white">Payment method</h3>
                {gatewaysLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading payment methods...</div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {/* VodaPay - Show as primary card payment when it's the primary gateway */}
                    {primaryGateway?.gatewayId === 'vodapay' && (
                      <button
                        onClick={() => setSelectedMethod('vodapay')}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          selectedMethod === 'vodapay'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                        data-testid="button-method-vodapay"
                      >
                        <CreditCard className="w-5 h-5 mx-auto dark:text-white" />
                        <span className="text-xs mt-1 block dark:text-white">Card</span>
                      </button>
                    )}

                    {/* Card Payment - Show Stripe card only when Stripe is the primary gateway */}
                    {isStripeEnabled && primaryGateway?.gatewayId === 'stripe' && (
                      <button
                        onClick={() => setSelectedMethod('card')}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          selectedMethod === 'card'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                        data-testid="button-method-card"
                      >
                        <CreditCard className="w-5 h-5 mx-auto dark:text-white" />
                        <span className="text-xs mt-1 block dark:text-white">Card</span>
                      </button>
                    )}

                    {/* Apple Pay - Always show if Stripe is enabled and paymentRequest available */}
                    {isStripeEnabled && paymentRequest && (
                      <>
                        <button
                          onClick={() => setSelectedMethod('wallet')}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            selectedMethod === 'wallet'
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                          data-testid="button-method-applepay"
                        >
                          <svg className="w-5 h-5 mx-auto dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                          </svg>
                          <span className="text-xs mt-1 block dark:text-white">Pay</span>
                        </button>

                        <button
                          onClick={() => setSelectedMethod('wallet')}
                          className={`p-3 border-2 rounded-lg transition-all ${
                            selectedMethod === 'wallet'
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                          data-testid="button-method-googlepay"
                        >
                          <svg className="w-5 h-5 mx-auto" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                            <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                          </svg>
                          <span className="text-xs mt-1 block dark:text-white">G Pay</span>
                        </button>
                      </>
                    )}
                    
                    {/* PayPal - Always show if enabled */}
                    {isPayPalEnabled && (
                      <button
                        onClick={() => setSelectedMethod('paypal')}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          selectedMethod === 'paypal'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                        data-testid="button-method-paypal"
                      >
                        <img 
                          src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" 
                          alt="PayPal" 
                          className="h-8 mx-auto"
                        />
                        <span className="text-xs mt-1 block dark:text-white">PayPal</span>
                      </button>
                    )}

                    {/* System Wallet - Always show if user has wallet balance */}
                    {hasWalletBalance && (
                      <button
                        onClick={() => setSelectedMethod('system_wallet')}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          selectedMethod === 'system_wallet'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                            : hasSufficientBalance 
                              ? 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                              : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                        }`}
                        data-testid="button-method-system-wallet"
                        disabled={!hasSufficientBalance}
                      >
                        <Wallet className="w-5 h-5 mx-auto dark:text-white" />
                        <span className="text-xs mt-1 block dark:text-white">Wallet</span>
                        <span className="text-[10px] block dark:text-white">${walletBalance.toFixed(2)}</span>
                      </button>
                    )}

                    {primaryGateway?.gatewayId === 'paystack' && isSouthAfrican && (
                      <button
                        onClick={() => setSelectedMethod('paystack')}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          selectedMethod === 'paystack'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                        data-testid="button-method-paystack"
                      >
                        <CreditCard className="w-5 h-5 mx-auto dark:text-white" />
                        <span className="text-xs mt-1 block truncate dark:text-white">Pay</span>
                      </button>
                    )}

                    {primaryGateway?.gatewayId === 'dodopay' && (
                      <button
                        onClick={() => setSelectedMethod('dodopay')}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          selectedMethod === 'dodopay'
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                        data-testid="button-method-dodopay"
                      >
                        <DollarSign className="w-5 h-5 mx-auto dark:text-white" />
                        <span className="text-xs mt-1 block dark:text-white">Pay</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="font-semibold mb-3 md:mb-4 text-base md:text-lg dark:text-white">Payment information</h3>
                
                {selectedMethod === 'card' && (
                  <form onSubmit={handleCardPayment} className="space-y-4">
                    {/* Card Icons */}
                    <div className="flex gap-2 mb-4">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                      <img src="https://www.americanexpress.com/content/dam/amex/us/merchant/supplies-uplift/product/images/4_Card_color_horizontal.png" alt="American Express Accepted Here" className="h-6" />
                    </div>

                    <div className="border rounded-xl p-4 bg-white dark:bg-gray-950">
                      <CardElement 
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#1f2937',
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              '::placeholder': {
                                color: '#9ca3af',
                              },
                            },
                            invalid: {
                              color: '#ef4444',
                            },
                          },
                          hidePostalCode: true,
                        }}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={!stripe || processing || confirmPurchaseMutation.isPending}
                      className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white h-12 text-base font-semibold rounded-xl"
                      data-testid="button-subscribe"
                    >
                      {processing || confirmPurchaseMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        <>Complete Purchase</>
                      )}
                    </Button>
                  </form>
                )}

                {selectedMethod === 'paypal' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your purchase</p>
                    <Button
                      onClick={handlePayPalPayment}
                      disabled={processing}
                      className="w-full bg-[#0070ba] hover:bg-[#003087] text-white h-12 text-base font-semibold rounded-xl"
                      data-testid="button-paypal-checkout"
                    >
                      {processing ? 'Redirecting...' : 'Continue with PayPal'}
                    </Button>
                  </div>
                )}

                {selectedMethod === 'saved_card' && selectedSavedCard && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      You will be charged using your saved card ending in {savedPaymentMethods.find(m => m.id === selectedSavedCard)?.lastFour}
                    </p>
                    <Button
                      onClick={async () => {
                        setProcessing(true);
                        try {
                          // Pass the coupon code when creating payment intent
                          const couponCode = appliedCoupon?.coupon?.code || '';
                          const purchaseResult = await purchaseMutation.mutateAsync(couponCode);
                          const { clientSecret } = purchaseResult;
                          
                          const savedCard = savedPaymentMethods.find(m => m.id === selectedSavedCard);
                          if (!savedCard?.stripePaymentMethodId || !stripe) {
                            throw new Error('Payment method not found');
                          }
                          
                          const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                            payment_method: savedCard.stripePaymentMethodId
                          });
                          
                          if (error) {
                            throw new Error(error.message);
                          }
                          
                          if (paymentIntent?.status === 'succeeded') {
                            await confirmPurchaseMutation.mutateAsync({ 
                              paymentIntentId: paymentIntent.id,
                              amount: finalPriceUSD
                            });
                            
                            setPaymentDetails({
                              transactionId: paymentIntent.id,
                              date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                              paymentMethod: savedCard.displayName,
                              total: finalPriceUSD,
                              currency: currencySymbol,
                              courseId: courseId
                            });
                            
                            setPaymentStatus('success');
                            setShowSuccess(true);
                          }
                        } catch (error: any) {
                          // Show failure receipt
                          const savedCard = savedPaymentMethods.find(m => m.id === selectedSavedCard);
                          setPaymentDetails({
                            transactionId: 'N/A',
                            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                            paymentMethod: savedCard?.displayName || 'Saved Card',
                            total: finalPriceUSD,
                            currency: currencySymbol,
                            courseId: courseId
                          });
                          setPaymentStatus('failed');
                          setShowSuccess(true);
                        } finally {
                          setProcessing(false);
                        }
                      }}
                      disabled={processing}
                      className="w-full bg-[#ff9500] hover:bg-[#e68600] text-white h-12 text-base font-semibold rounded-xl"
                      data-testid="button-pay-saved-card"
                    >
                      {processing ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        <>Pay {currencySymbol}{finalPriceLocal.toFixed(2)}</>
                      )}
                    </Button>
                  </div>
                )}

                {selectedMethod === 'wallet' && paymentRequest && (
                  <div className="space-y-4">
                    <PaymentRequestButtonElement options={{ paymentRequest }} />
                    <p className="text-xs text-center text-muted-foreground">
                      Click the button above to pay with Apple Pay or Google Pay
                    </p>
                  </div>
                )}

                {selectedMethod === 'paystack' && isSouthAfrican && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Pay securely (South African Rand)</p>
                    <div className="flex gap-2 mb-4">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                    </div>
                    <Button
                      onClick={() => {
                        setProcessing(true);
                        initializePaystackPayment({
                          onSuccess: onPaystackSuccess,
                          onClose: onPaystackClose
                        });
                      }}
                      disabled={processing || !profile?.email}
                      className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white h-12 text-base font-semibold rounded-xl"
                      data-testid="button-paystack-checkout"
                    >
                      {processing ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        <>Complete Purchase</>
                      )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Secure payment processing
                    </p>
                  </div>
                )}

                {selectedMethod === 'system_wallet' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Wallet Balance</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">${walletBalance.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Course Price</span>
                        <span className="text-sm font-medium">${finalPriceUSD.toFixed(2)}</span>
                      </div>
                      {hasSufficientBalance && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                          <span className="text-sm font-medium">Remaining Balance</span>
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            ${(walletBalance - finalPriceUSD).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    {!hasSufficientBalance && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          Insufficient balance. You need ${(finalPriceUSD - walletBalance).toFixed(2)} more to complete this purchase.
                        </p>
                      </div>
                    )}
                    <Button
                      onClick={handleSystemWalletPayment}
                      disabled={processing || !hasSufficientBalance}
                      className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white h-12 text-base font-semibold rounded-xl"
                      data-testid="button-wallet-checkout"
                    >
                      {processing ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        <>Pay ${finalPriceUSD.toFixed(2)} from Wallet</>
                      )}
                    </Button>
                  </div>
                )}

                {selectedMethod === 'dodopay' && (
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                    </div>
                    <Button
                      onClick={async () => {
                        setProcessing(true);
                        try {
                          const response = await apiRequest('/api/dodopay/checkout-session', {
                            method: 'POST',
                            body: JSON.stringify({
                              amount: finalPriceUSD,
                              currency: 'USD',
                              courseId: courseId,
                              courseName: course.title,
                              userEmail: profile?.email,
                              userName: profile?.name,
                              returnUrl: `${window.location.origin}/course-player-${courseId}?payment=success`,
                            }),
                          });

                          if (response.success && response.checkoutUrl) {
                            window.location.href = response.checkoutUrl;
                          } else {
                            throw new Error(response.error || 'Failed to initialize payment');
                          }
                        } catch (error: any) {
                          console.error('Payment error:', error);
                          setPaymentDetails({
                            transactionId: 'N/A',
                            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                            paymentMethod: 'Card Payment',
                            total: finalPriceUSD,
                            currency: currencySymbol,
                            courseId: courseId,
                            errorMessage: error?.message || 'Payment failed. Please try again.'
                          });
                          setPaymentStatus('failed');
                          setShowSuccess(true);
                        } finally {
                          setProcessing(false);
                        }
                      }}
                      disabled={processing}
                      className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white h-12 text-base font-semibold rounded-xl"
                      data-testid="button-dodopay-checkout"
                    >
                      {processing ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        <>Complete Purchase</>
                      )}
                    </Button>
                  </div>
                )}

                {selectedMethod === 'vodapay' && (
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-4">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                    </div>
                    <Button
                      onClick={async () => {
                        setProcessing(true);
                        try {
                          // Convert USD to ZAR (approximate rate: 1 USD = 18 ZAR)
                          const zarAmount = finalPriceUSD * (userCurrency?.rate || 18);
                          
                          const response = await apiRequest('/api/vodapay/initialize', {
                            method: 'POST',
                            body: JSON.stringify({
                              amount: zarAmount,
                              currency: 'ZAR',
                              courseId: courseId,
                              courseName: course.title,
                              userEmail: profile?.email,
                              returnUrl: `${window.location.origin}/course-player-${courseId}?payment=success`,
                              cancelUrl: `${window.location.origin}/course-detail-${courseId}?payment=cancelled`,
                            }),
                          });

                          if (response.success && response.checkoutUrl) {
                            window.location.href = response.checkoutUrl;
                          } else {
                            throw new Error(response.error || 'Payment service is temporarily unavailable. Please try another payment method.');
                          }
                        } catch (error: any) {
                          console.error('Payment error:', error);
                          setPaymentDetails({
                            transactionId: 'N/A',
                            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                            paymentMethod: 'Card Payment',
                            total: finalPriceUSD,
                            currency: currencySymbol,
                            courseId: courseId,
                            errorMessage: error?.message || 'Payment service is temporarily unavailable. Please try another payment method.'
                          });
                          setPaymentStatus('failed');
                          setShowSuccess(true);
                        } finally {
                          setProcessing(false);
                        }
                      }}
                      disabled={processing}
                      className="w-full bg-[#6366f1] hover:bg-[#5558e3] text-white h-12 text-base font-semibold rounded-xl"
                      data-testid="button-vodapay-checkout"
                    >
                      {processing ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        <>Complete Purchase</>
                      )}
                    </Button>
                  </div>
                )}

                {/* Generic fallback for any other unsupported gateway */}
                {selectedMethod && 
                 !['card', 'paypal', 'wallet', 'paystack', 'saved_card', 'dodopay', 'vodapay', 'system_wallet'].includes(selectedMethod) && (
                  <div className="space-y-4" data-testid="div-unsupported-gateway-container">
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4" data-testid="div-unsupported-gateway-warning">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2" data-testid="text-unsupported-gateway-name">
                        {enabledGateways.find(g => g.gatewayId === selectedMethod)?.gatewayName || selectedMethod} - Not Yet Implemented
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300" data-testid="text-unsupported-gateway-message">
                        This payment gateway is configured in your admin settings but payment processing is not yet implemented. Please use another payment method or contact your administrator.
                      </p>
                    </div>
                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="w-full"
                      data-testid="button-unsupported-gateway-close"
                    >
                      Choose Another Payment Method
                    </Button>
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure 256-bit SSL encrypted payment</span>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By completing this purchase, you agree to our{' '}
                <a 
                  href="/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Terms of Service
                </a>
                {' '}and{' '}
                <a 
                  href="/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
