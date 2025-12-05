import { useState, useEffect } from "react";
import { useLocation, Route, Switch } from "wouter";
import { usePageTransition } from "@/hooks/usePageTransition";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import LogoutAnimation from "@/components/LogoutAnimation";
import TopProgressBar from "@/components/TopProgressBar";
import Header from "@/components/Header";
import PortfolioNavigation from "@/components/PortfolioNavigation";
import AuthModern from "./AuthModern";
import TeacherLogin from "./TeacherLogin";
import StudySettings from "./StudySettings";
import LandingPage from "./LandingPage";
import PremiumPage from "./PremiumPage";
import ContactPage from "./ContactPage";
import TermsPage from "./TermsPage";
import StudentTermsPage from "./StudentTermsPage";
import TeacherTermsPage from "./TeacherTermsPage";
import SchoolInstitutionTermsPage from "./SchoolInstitutionTermsPage";
import RefundPolicyPage from "./RefundPolicyPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import CookiesPolicyPage from "./CookiesPolicyPage";
import WhatsAppPolicyPage from "./WhatsAppPolicyPage";
import DataRetentionPolicyPage from "./DataRetentionPolicyPage";
import CopyrightDMCAPolicyPage from "./CopyrightDMCAPolicyPage";
import CommunityGuidelinesPage from "./CommunityGuidelinesPage";
import PaymentBillingPolicyPage from "./PaymentBillingPolicyPage";
import AboutPage from "./AboutPage";
import HelpCenter from "./HelpCenter";
import Subscribe from "./Subscribe";
import Checkout from "./Checkout";
import LearnMorePage from "./LearnMorePage";
import StudentDashboard from "./StudentDashboard";
import AdminPaymentDashboard from "./AdminPaymentDashboard";
import AdminShowcaseDashboard from "./AdminShowcaseDashboard";
import { FindTalent } from "./FindTalent";
import StudentNetworking from "./StudentNetworking";
import ResetPassword from "@/components/ResetPassword";
import Survey from "@/components/Survey";
import PaymentSuccess from "./PaymentSuccess";
import TransactionDashboard from "./TransactionDashboard";
import { TeacherDashboard } from "@/components/TeacherDashboard";
import { TeacherDashboardPending } from "@/components/TeacherDashboardPending";
import { FreelancerDashboard } from "@/components/FreelancerDashboard";
import { FreelancerDashboardPending } from "@/components/FreelancerDashboardPending";
import { PayoutPolicy } from "./PayoutPolicy";
import { LogoManagementPage } from "./LogoManagementPage";
import ChatTermsPage from "./ChatTermsPage";
import AdvertiseWithUs from "./AdvertiseWithUs";
import DesignTeamContact from "./DesignTeamContact";
import BannerCreator from "./BannerCreator";
import BannerPayment from "./BannerPayment";
import CourseCreator from "./CourseCreator";
import SubjectCreator from "./SubjectCreator";
import EducationLevelSelector from "@/components/EducationLevelSelector";
import CourseBrowse from "./CourseBrowse";
import CourseDetail from "./CourseDetail";
import CoursePlayer from "./CoursePlayer";
import ClaimCertificate from "./ClaimCertificate";
import PortfolioGallery from "./PortfolioGallery";
import PortfolioCreate from "./PortfolioCreate";
import PortfolioPreview from "./PortfolioPreview";
import FreelancerProfile from "./FreelancerProfile";
import FreelancerSignup from "./FreelancerSignup";
import EmailVerification from "./EmailVerification";
import ShopAuth from "./ShopAuth";
import CustomerDashboard from "./CustomerDashboard";
import CreatorEarningsDashboard from "./CreatorEarningsDashboard";
import AdminPayoutManagement from "./AdminPayoutManagement";
import TeacherMeetings from "./TeacherMeetings";
import TeacherMeetingDetail from "./TeacherMeetingDetail";
import StudentMeetings from "./StudentMeetings";
import MeetingScheduler from "./MeetingScheduler";
import MeetingRoom from "./MeetingRoom";
import ProductShop from "./ProductShop";
import ProductDetail from "./ProductDetail";
import Cart from "./Cart";
import { CategoryManagement } from "./CategoryManagement";
import { CategoryDetail } from "./CategoryDetail";
import ProductCreation from "./ProductCreation";
import CouponManagement from "./CouponManagement";
import FreelancerCheckout from "./FreelancerCheckout";
import MyCertificatesPage from "./MyCertificatesPage";
import VerifyCertificatePage from "./VerifyCertificatePage";
import AdminEmailManagement from "./AdminEmailManagement";
import AdminEmailCampaigns from "./AdminEmailCampaigns";
import EnhancedEmailInbox from "./EnhancedEmailInbox";
import BlogPage from "./BlogPage";
import BlogPostDetail from "./BlogPostDetail";
import AdminBlogManagement from "./AdminBlogManagement";
import AdminCourseManagement from "./AdminCourseManagement";
import AdminContactMessages from "./AdminContactMessages";
import AdminApplicationsManagement from "./AdminApplicationsManagement";
import AdminSubjectApproval from "./AdminSubjectApproval";
import CustomerPricingPage from "./CustomerPricingPage";
import CreatorPricingPage from "./CreatorPricingPage";
import EducationPricingPage from "./EducationPricingPage";
import TeacherPricingPage from "./TeacherPricingPage";
import Error404 from "./Error404";
import Error403 from "./Error403";
import Error401 from "./Error401";
import Error500 from "./Error500";
import Maintenance from "./Maintenance";
import TeacherSignup from "./TeacherSignup";
import TeacherSignupBasic from "./TeacherSignupBasic";
import TeacherVerifyEmail from "./TeacherVerifyEmail";
import VerifyTeacherEmail from "./VerifyTeacherEmail";
import TeacherApplicationStatus from "./TeacherApplicationStatus";
import FreelancerSignupBasic from "./FreelancerSignupBasic";
import FreelancerApplicationStatus from "./FreelancerApplicationStatus";
import BecomeTeacherPage from "./BecomeTeacherPage";
import BuyVoucherPage from "./BuyVoucherPage";

type AppState = "home" | "auth" | "student-signup" | "creator-signup" | "teacher-login" | "freelancer-login" | "teacher-signup-basic" | "teacher-signup" | "teacher-verify-email" | "teacher-verify-code" | "teacher-application-status" | "teacher-application" | "premium" | "contact" | "design-team-contact" | "privacy" | "terms" | "student-terms" | "teacher-terms" | "school-terms" | "refund-policy" | "privacy-policy" | "cookies-policy" | "whatsapp-policy" | "data-retention" | "copyright-dmca" | "community-guidelines" | "payment-billing" | "chat-terms" | "settings" | "about" | "help" | "subscribe" | "checkout" | "learn-more" | "reset-password" | "student-dashboard" | "survey" | "customer-pricing" | "creator-pricing" | "education-pricing" | "teacher-pricing" | "admin-dashboard" | "admin-showcase-dashboard" | "admin-email-management" | "admin-email-campaigns" | "admin-email-inbox" | "admin-blog-management" | "admin-course-management" | "admin-contact-messages" | "admin-applications-management" | "admin-subject-approval" | "blog" | "blog-post-detail" | "community" | "networking" | "payment-success" | "transaction-dashboard" | "teacher-dashboard" | "teacher-meetings" | "teacher-meeting-detail" | "teacher-meetings-schedule" | "student-meetings" | "meeting-room" | "freelancer-dashboard" | "freelancer-signup-basic" | "freelancer-signup" | "freelancer-application-status" | "shop-auth" | "customer-dashboard" | "payout-policy" | "logo-management" | "advertise-with-us" | "banner-creator" | "banner-payment" | "education-level-selector" | "course-creator" | "subject-creator" | "course-browse" | "course-detail" | "course-player" | "portfolio-gallery" | "portfolio-create" | "portfolio-edit" | "portfolio-preview" | "freelancer-profile" | "product-shop" | "product-detail" | "cart" | "category-management" | "category-detail" | "product-creation" | "coupon-management" | "freelancer-checkout" | "my-certificates" | "verify-certificate" | "claim-certificate" | "error-404" | "error-403" | "error-401" | "error-500" | "maintenance" | "creator-earnings-dashboard" | "admin-payout-management" | "buy-voucher";

// Smart initial state based on URL parameters only - Auth context will handle routing
const getInitialState = (): AppState => {
  try {
    // Check path-based routes first (higher priority)
    const path = window.location.pathname;
    if (path.startsWith('/meeting-room/')) {
      return "meeting-room";
    }
    if (path.startsWith('/teacher-meeting-detail/')) {
      return "teacher-meeting-detail";
    }
    if (path === '/freelancer-application-status') {
      return "freelancer-application-status";
    }
    if (path === '/freelancer-signup') {
      return "freelancer-signup";
    }
    if (path === '/freelancer-signup-basic') {
      return "freelancer-signup-basic";
    }
    
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam === 'freelancer-login') {
      return "freelancer-login";
    }
    if (pageParam === 'payout-policy') {
      return "payout-policy";
    }
    if (pageParam === 'logo-management') {
      return "logo-management";
    }
    if (pageParam === 'admin-dashboard') {
      return "admin-dashboard";
    }
    if (pageParam === 'admin-showcase-dashboard') {
      return "admin-showcase-dashboard";
    }
    if (pageParam === 'admin-email-management') {
      return "admin-email-management";
    }
    if (pageParam === 'admin-email-campaigns') {
      return "admin-email-campaigns";
    }
    if (pageParam === 'admin-email-inbox') {
      return "admin-email-inbox";
    }
    if (pageParam === 'chat-terms') {
      return "chat-terms";
    }
    if (pageParam === 'student-terms') {
      return "student-terms";
    }
    if (pageParam === 'teacher-terms') {
      return "teacher-terms";
    }
    if (pageParam === 'school-terms') {
      return "school-terms";
    }
    if (pageParam === 'refund-policy') {
      return "refund-policy";
    }
    if (pageParam === 'privacy-policy') {
      return "privacy-policy";
    }
    if (pageParam === 'cookies-policy') {
      return "cookies-policy";
    }
    if (pageParam === 'whatsapp-policy') {
      return "whatsapp-policy";
    }
    if (pageParam === 'data-retention') {
      return "data-retention";
    }
    if (pageParam === 'copyright-dmca') {
      return "copyright-dmca";
    }
    if (pageParam === 'community-guidelines') {
      return "community-guidelines";
    }
    if (pageParam === 'payment-billing') {
      return "payment-billing";
    }
    if (pageParam === 'privacy') {
      return "privacy";
    }
    if (pageParam === 'advertise-with-us') {
      return "advertise-with-us";
    }
    if (pageParam === 'design-team-contact') {
      return "design-team-contact";
    }
    if (pageParam === 'banner-creator') {
      return "banner-creator";
    }
    if (pageParam === 'banner-payment') {
      return "banner-payment";
    }
    if (pageParam === 'education-level-selector') {
      return "education-level-selector";
    }
    if (pageParam === 'course-creator') {
      return "course-creator";
    }
    if (pageParam === 'subject-creator') {
      return "subject-creator";
    }
    if (pageParam === 'course-browse') {
      return "course-browse";
    }
    if (pageParam === 'freelancer-signup-basic') {
      return "freelancer-signup-basic";
    }
    if (pageParam === 'freelancer-signup') {
      return "freelancer-signup";
    }
    if (pageParam === 'freelancer-application-status') {
      return "freelancer-application-status";
    }
    if (pageParam === 'teacher-signup-basic') {
      return "teacher-signup-basic";
    }
    if (pageParam === 'teacher-signup') {
      return "teacher-signup";
    }
    if (pageParam === 'teacher-verify-email') {
      return "teacher-verify-email";
    }
    if (pageParam === 'teacher-application-status') {
      return "teacher-application-status";
    }
    if (pageParam === 'shop-auth') {
      return "shop-auth";
    }
    if (pageParam === 'customer-dashboard') {
      return "customer-dashboard";
    }
    if (pageParam === 'course-detail') {
      return "course-detail";
    }
    if (pageParam === 'course-player') {
      return "course-player";
    }
    if (pageParam === 'portfolio-gallery') {
      return "portfolio-gallery";
    }
    if (pageParam === 'portfolio-create') {
      return "portfolio-create";
    }
    if (pageParam === 'portfolio-edit') {
      return "portfolio-edit";
    }
    if (pageParam === 'portfolio-preview') {
      return "portfolio-preview";
    }
    if (pageParam === 'freelancer-profile') {
      return "freelancer-profile";
    }
    if (pageParam === 'product-shop') {
      return "product-shop";
    }
    if (pageParam === 'product-detail') {
      return "product-detail";
    }
    if (pageParam === 'category-management') {
      return "category-management";
    }
    if (pageParam === 'category-detail') {
      return "category-detail";
    }
    if (pageParam === 'product-creation') {
      return "product-creation";
    }
    if (pageParam === 'coupon-management') {
      return "coupon-management";
    }
    if (pageParam === 'freelancer-checkout') {
      return "freelancer-checkout";
    }
    if (pageParam === 'my-certificates') {
      return "my-certificates";
    }
    if (pageParam === 'verify-certificate') {
      return "verify-certificate";
    }
    if (pageParam === 'blog') {
      return "blog";
    }
    if (pageParam === 'blog-post-detail') {
      return "blog-post-detail";
    }
    if (pageParam === 'admin-blog-management') {
      return "admin-blog-management";
    }
    if (pageParam === 'admin-course-management') {
      return "admin-course-management";
    }
    if (pageParam === 'admin-contact-messages') {
      return "admin-contact-messages";
    }
    if (pageParam === 'error-404') {
      return "error-404";
    }
    if (pageParam === 'error-403') {
      return "error-403";
    }
    if (pageParam === 'error-401') {
      return "error-401";
    }
    if (pageParam === 'error-500') {
      return "error-500";
    }
    if (pageParam === 'maintenance') {
    if (pageParam === 'creator-earnings-dashboard') {
      return "creator-earnings-dashboard";
    }
    if (pageParam === 'admin-payout-management') {
      return "admin-payout-management";
    }
      return "maintenance";
    }
    
    // Check if we have a session - let Auth context handle routing
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      // Auth context will handle routing after loading user data
      return "home"; // Start at home and let auto-routing handle the rest
    }
  } catch (error) {
    console.error('Error determining initial state:', error);
  }
  
  return "home";
};

// Wrapper components to check application status before showing dashboard
function TeacherDashboardWithStatusCheck({ onNavigate, userId }: { onNavigate: any; userId: number }) {
  const { data: application } = useQuery({
    queryKey: [`/api/teacher-applications/status/${userId}`],
  });

  // Show pending dashboard if application status is pending, under_review, or rejected
  if (application && ((application as any).status === 'pending' || (application as any).status === 'under_review' || (application as any).status === 'rejected')) {
    return <TeacherDashboardPending onNavigate={onNavigate} />;
  }

  return <TeacherDashboard onNavigate={onNavigate} />;
}

function FreelancerDashboardWithStatusCheck({ onNavigate, initialTab, userId }: { onNavigate: any; initialTab: string; userId: number }) {
  const { data: application } = useQuery({
    queryKey: [`/api/freelancer/applications/status/${userId}`],
  });

  // Show pending dashboard if application status is pending, under_review, or rejected
  if (application && ((application as any).status === 'pending' || (application as any).status === 'under_review' || (application as any).status === 'rejected')) {
    return <FreelancerDashboardPending onNavigate={onNavigate} />;
  }

  return <FreelancerDashboard onNavigate={onNavigate} initialTab={initialTab} />;
}

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>(getInitialState());
  const [location, navigate] = useLocation();
  const { 
    currentPage, 
    isTransitioning, 
    transitionType, 
    navigateToPage,
    isLoading,
    loadingProgress,
    isExiting
  } = usePageTransition("home");
  const { user, loading, profile, logout, freelancerApplicationStatus } = useAuth();
  
  // Logout animation state
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  
  // Category detail state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  
  // Freelancer dashboard tab state
  const [freelancerDashboardTab, setFreelancerDashboardTab] = useState<string>('overview');
  
  // Checkout details state
  const [checkoutDetails, setCheckoutDetails] = useState({
    amount: 29.99,
    courseName: "Premium Access",
    planName: "Premium",
    billingCycle: "monthly",
    clientSecret: "",
    orderData: null
  });

  // Search state for product shop
  const [searchQuery, setSearchQuery] = useState('');

  // Meeting ID state for dynamic routes - extract from initial URL
  const [meetingId, setMeetingId] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/meeting-room/')) {
      return path.split('/meeting-room/')[1]?.split('?')[0] || null;
    }
    if (path.startsWith('/teacher-meeting-detail/')) {
      return path.split('/teacher-meeting-detail/')[1]?.split('?')[0] || null;
    }
    return null;
  });

  // Course ID state for course navigation (state-based, no URL changes)
  const [courseId, setCourseId] = useState<string | null>(null);
  
  // Blog slug state for blog post navigation (state-based, like courses)
  const [blogSlug, setBlogSlug] = useState<string | null>(null);

  // Track URL search params to detect changes
  const [urlSearch, setUrlSearch] = useState(window.location.search);

  // Listen for URL changes (including query param changes)
  useEffect(() => {
    const handleUrlChange = () => {
      setUrlSearch(window.location.search);
    };

    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleUrlChange);
    
    // Also listen for pushState/replaceState (programmatic navigation)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleUrlChange();
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleUrlChange();
    };

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  // Sync URL changes from wouter navigate() to currentState
  useEffect(() => {
    console.log('🔄 URL sync - location changed:', location, 'search:', urlSearch);
    
    // Check for query parameters
    const urlParams = new URLSearchParams(urlSearch);
    const pageParam = urlParams.get('page');
    
    // Handle query parameter routes first
    if (pageParam === 'teacher-signup') {
      console.log('🔄 Detected teacher-signup query param, updating state');
      setCurrentState('teacher-signup');
      navigateToPage('teacher-signup', 'fade');
      return;
    } else if (pageParam === 'teacher-verify-email') {
      console.log('🔄 Detected teacher-verify-email query param, updating state');
      setCurrentState('teacher-verify-email');
      navigateToPage('teacher-verify-email', 'fade');
      return;
    } else if (pageParam === 'teacher-application-status') {
      console.log('🔄 Detected teacher-application-status query param, updating state');
      setCurrentState('teacher-application-status');
      navigateToPage('teacher-application-status', 'fade');
      return;
    } else if (pageParam === 'teacher-login') {
      console.log('🔄 Detected teacher-login query param, updating state');
      setCurrentState('teacher-login');
      navigateToPage('teacher-login', 'fade');
      return;
    } else if (pageParam === 'freelancer-login') {
      console.log('🔄 Detected freelancer-login query param, updating state');
      setCurrentState('freelancer-login');
      navigateToPage('freelancer-login', 'fade');
      return;
    } else if (pageParam === 'freelancer-signup') {
      console.log('🔄 Detected freelancer-signup query param, updating state');
      setCurrentState('freelancer-signup');
      navigateToPage('freelancer-signup', 'fade');
      return;
    } else if (pageParam === 'freelancer-application-status') {
      console.log('🔄 Detected freelancer-application-status query param, updating state');
      setCurrentState('freelancer-application-status');
      navigateToPage('freelancer-application-status', 'fade');
      return;
    } else if (pageParam === 'privacy-policy') {
      console.log('🔄 Detected privacy-policy query param, updating state');
      setCurrentState('privacy-policy');
      navigateToPage('privacy-policy', 'fade');
      return;
    } else if (pageParam === 'cookies-policy') {
      console.log('🔄 Detected cookies-policy query param, updating state');
      setCurrentState('cookies-policy');
      navigateToPage('cookies-policy', 'fade');
      return;
    } else if (pageParam === 'course-detail') {
      // Legacy URL parameter support - prefer state-based navigation (course-detail-{id})
      const courseIdParam = urlParams.get('courseId');
      if (courseIdParam) {
        console.log('🔄 Detected legacy course-detail URL, redirecting to state-based navigation');
        // Clean URL by removing parameters
        window.history.replaceState({}, '', '/');
        // Use state-based navigation
        handleNavigation(`course-detail-${courseIdParam}`);
      }
      return;
    } else if (pageParam === 'course-player') {
      // Legacy URL parameter support - prefer state-based navigation (course-player-{id})
      const courseIdParam = urlParams.get('courseId');
      if (courseIdParam) {
        console.log('🔄 Detected legacy course-player URL, redirecting to state-based navigation');
        // Clean URL by removing parameters
        window.history.replaceState({}, '', '/');
        // Use state-based navigation
        handleNavigation(`course-player-${courseIdParam}`);
      }
      return;
    } else if (pageParam === 'claim-certificate') {
      // Legacy URL parameter support - prefer state-based navigation
      const courseIdParam = urlParams.get('courseId');
      if (courseIdParam) {
        console.log('🔄 Detected legacy claim-certificate URL, redirecting to state-based navigation');
        // Clean URL by removing parameters
        window.history.replaceState({}, '', '/');
        // Use state-based navigation
        handleNavigation(`claim-certificate-${courseIdParam}`);
      }
      return;
    } else if (pageParam === 'course-browse') {
      console.log('🔄 Redirecting old course-browse URL to new route: /courses');
      navigate('/courses');
      return;
    }
    
    // Map pathname to AppState
    if (location.startsWith('/meeting-room/')) {
      console.log('🔄 Detected meeting room route, updating state');
      const id = location.split('/meeting-room/')[1]?.split('?')[0]; // Remove query params
      setMeetingId(id);
      setCurrentState('meeting-room');
      navigateToPage('meeting-room', 'instant');
    } else if (location.startsWith('/teacher-meeting-detail/')) {
      console.log('🔄 Detected teacher meeting detail route, updating state');
      const id = location.split('/teacher-meeting-detail/')[1]?.split('?')[0]; // Remove query params
      setMeetingId(id);
      setCurrentState('teacher-meeting-detail');
      navigateToPage('teacher-meeting-detail', 'instant');
    } else if (location === '/teacher-meetings') {
      console.log('🔄 Detected teacher meetings route, updating state');
      setCurrentState('teacher-meetings');
      navigateToPage('teacher-meetings', 'instant');
    } else if (location === '/teacher-apply/verify' || location.startsWith('/teacher-apply/verify?')) {
      console.log('🔄 Detected email verification route, updating state');
      setCurrentState('teacher-apply-verify');
      navigateToPage('teacher-apply-verify', 'instant');
    } else if (location === '/teacher-dashboard') {
      setCurrentState('teacher-dashboard');
      navigateToPage('teacher-dashboard', 'instant');
    } else if (location === '/student-dashboard') {
      setCurrentState('student-dashboard');
      navigateToPage('student-dashboard', 'instant');
    } else if (location === '/about') {
      console.log('🔄 Detected about route, updating state');
      setCurrentState('about');
      navigateToPage('about', 'instant');
    } else if (location === '/contact') {
      console.log('🔄 Detected contact route, updating state');
      setCurrentState('contact');
      navigateToPage('contact', 'instant');
    } else if (location === '/help') {
      console.log('🔄 Detected help route, updating state');
      setCurrentState('help');
      navigateToPage('help', 'instant');
    } else if (location === '/privacy-policy') {
      console.log('🔄 Detected privacy policy route, updating state');
      setCurrentState('privacy-policy');
      navigateToPage('privacy-policy', 'instant');
    } else if (location === '/terms-and-conditions') {
      console.log('🔄 Detected terms route, updating state');
      setCurrentState('terms');
      navigateToPage('terms', 'instant');
    } else if (location === '/marketplace') {
      console.log('🔄 Detected marketplace route, updating state');
      setCurrentState('portfolio-gallery');
      navigateToPage('portfolio-gallery', 'instant');
    } else if (location === '/courses') {
      console.log('🔄 Detected courses route, updating state');
      setCurrentState('course-browse');
      navigateToPage('course-browse', 'instant');
    }
    // Note: Don't force navigation back to home for "/" - the app uses state-based routing
    // Many pages share the "/" URL and use query params or internal state
    // Add more route mappings as needed
  }, [location, urlSearch, navigateToPage]);

  // Optimized auto-routing - only redirects when absolutely necessary
  useEffect(() => {
    console.log('🔄 Auto-routing check - loading:', loading, 'user:', !!user, 'profile:', !!profile, 'currentState:', currentState);
    
    if (!loading && user && profile) {
      console.log('🔄 Auto-routing check - User role:', profile.role);
      
      // Define public pages that customers can access while logged in
      const publicPages = ["home", "about", "help", "contact", "privacy", "terms", "blog",
                          "chat-terms", "course-browse", "course-detail", "course-player", "claim-certificate", "product-shop", 
                          "product-detail", "cart", "portfolio-gallery", "portfolio-preview", "freelancer-profile",
                          "advertise-with-us", "banner-creator", "banner-payment", "freelancer-checkout", "checkout",
                          "customer-pricing", "creator-pricing", "education-pricing", "privacy-policy"];
      
      // Check if trying to access wrong dashboard
      const wrongDashboardAccess = 
        (currentState === "admin-dashboard" && !["admin", "accountant", "customer_service"].includes(profile.role)) ||
        (currentState === "teacher-dashboard" && profile.role !== "teacher") ||
        (currentState === "freelancer-dashboard" && profile.role !== "freelancer") ||
        (currentState === "customer-dashboard" && profile.role !== "general") ||
        (currentState === "student-dashboard" && ["admin", "teacher", "freelancer", "general", "accountant", "customer_service"].includes(profile.role));
      
      console.log('🔒 Wrong dashboard access check:', wrongDashboardAccess, 'for', profile.role, 'on', currentState);
      
      // Only auto-redirect when on auth/home pages OR accessing wrong dashboard
      // Don't trigger routing when already on survey page (unless navigating away)
      const shouldAutoRoute = currentState === "auth" || 
                              wrongDashboardAccess ||
                              (currentState === "home" && !publicPages.includes(currentState));
      
      if (shouldAutoRoute) {
        console.log('🔄 Current state requires auto-routing:', currentState);
        
        // Check if profile is incomplete (missing required survey fields)
        const needsSurvey = !profile.country || !profile.educationLevel || !profile.pronouns;
        
        if (needsSurvey && currentState !== "survey") {
          console.log('🔀 Redirecting to survey');
          setCurrentState("survey");
          return;
        }
        
        // Route to appropriate dashboard based on role
        if (["admin", "accountant", "customer_service"].includes(profile.role) && currentState !== "admin-dashboard") {
          console.log('🔀 Redirecting', profile.role, 'to admin dashboard');
          navigateToPage("admin-dashboard", 'instant');
          setCurrentState("admin-dashboard");
        } else if (profile.role === "teacher" && currentState !== "teacher-dashboard") {
          console.log('🔀 Redirecting teacher to teacher dashboard');
          navigateToPage("teacher-dashboard", 'instant');
          setCurrentState("teacher-dashboard");
        } else if (profile.role === "freelancer") {
          // Check if freelancer is approved before allowing dashboard access
          const isApproved = freelancerApplicationStatus?.status === "approved";
          
          if (isApproved && currentState !== "freelancer-dashboard") {
            console.log('🔀 Redirecting approved freelancer to freelancer dashboard');
            navigateToPage("freelancer-dashboard", 'instant');
            setCurrentState("freelancer-dashboard");
          } else if (!isApproved && (currentState === "auth" || currentState === "home")) {
            // Only redirect to application status from auth/home, not from profile pages
            console.log('🔀 Redirecting unapproved freelancer to application status page');
            navigateToPage("freelancer-application-status", 'instant');
            setCurrentState("freelancer-application-status");
          }
        } else if (profile.role === "general" && (currentState === "auth" || wrongDashboardAccess)) {
          console.log('🔀 Redirecting customer (general role) to customer dashboard');
          navigateToPage("customer-dashboard", 'instant');
          setCurrentState("customer-dashboard");
        } else if ((profile.role === "student" || profile.role === "user") && currentState !== "student-dashboard") {
          console.log('🔀 Redirecting student/user to student dashboard');
          navigateToPage("student-dashboard", 'instant');
          setCurrentState("student-dashboard");
        }
      } else {
        console.log('🔄 Current state does not require auto-routing:', currentState);
      }
    } else {
      console.log('🔄 Auto-routing conditions not met - loading:', loading, 'user exists:', !!user, 'profile exists:', !!profile);
    }
  }, [user, profile, loading, currentState]);

  // Handle URL parameters and hash on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    
    // Handle reset password route
    if (window.location.pathname === '/reset-password' || pageParam === 'reset-password') {
      setCurrentState('reset-password');
      return;
    }

    // Handle payment success route
    if (window.location.pathname === '/payment-success' || pageParam === 'payment-success') {
      setCurrentState('payment-success');
      return;
    }
    
    // Handle teacher meeting detail route (with dynamic ID)
    if (window.location.pathname.startsWith('/teacher-meeting-detail') || pageParam === 'teacher-meeting-detail') {
      setCurrentState('teacher-meeting-detail');
      return;
    }
    
    // Handle teacher meetings route
    if (window.location.pathname === '/teacher-meetings' || pageParam === 'teacher-meetings') {
      setCurrentState('teacher-meetings');
      return;
    }

  }, []);

  const handleLogin = () => {
    console.log('🚀 handleLogin CALLED - User logged in successfully');
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Don't manually redirect - let the auto-routing useEffect handle the proper flow
    // This ensures users go through survey -> pricing -> dashboard sequence
    console.log('🔄 Letting auto-routing handle navigation after login');
  };

  const handleLogout = async () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setShowLogoutAnimation(true);
  };

  const completeLogout = async () => {
    await logout();
    
    setShowLogoutAnimation(false);
    setCurrentState("auth");
  };

  const handleSettings = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setCurrentState("settings");
  };

  const handleProfile = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // All users stay on home page for now
    setCurrentState("home");
  };


  const handleBackToDashboard = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // All users return to home page - instant transition
    navigateToPage("home", 'instant');
    setCurrentState("home");
  };

  const handleSurveyComplete = () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    // After survey, go directly to appropriate dashboard based on role - skip pricing
    if (["admin", "accountant", "customer_service"].includes(profile?.role || "")) {
      navigateToPage("admin-dashboard", 'fade');
      setCurrentState("admin-dashboard");
    } else if (profile?.role === "teacher") {
      navigateToPage("teacher-dashboard", 'fade');
      setCurrentState("teacher-dashboard");
    } else {
      // All other users (students, users, etc.) go to student dashboard
      navigateToPage("student-dashboard", 'fade');
      setCurrentState("student-dashboard");
    }
  };


  const handleNavigation = (page: string, customTransition?: string, data?: any) => {
    console.log('🚀 handleNavigation called with page:', page);
    let transition = customTransition || 'fade';
    let finalPage = page;
    
    // Handle 'back' navigation for standalone PortfolioPreview
    if (page === 'back') {
      finalPage = 'portfolio-gallery';
      transition = 'slide-right';
    }
    // Handle meeting room routes
    else if (page.startsWith('meeting-room/')) {
      const meetingIdFromPage = page.split('meeting-room/')[1];
      setMeetingId(meetingIdFromPage);
      finalPage = 'meeting-room';
    }
    // Handle teacher meeting detail routes
    else if (page.startsWith('teacher-meeting-detail/')) {
      const meetingIdFromPage = page.split('teacher-meeting-detail/')[1];
      setMeetingId(meetingIdFromPage);
      finalPage = 'teacher-meeting-detail';
    }
    // Handle dynamic product routes
    else if (page.startsWith('product/')) {
      const productId = page.replace('product/', '');
      finalPage = 'product-detail';
      // Set URL parameter for productId
      const url = new URL(window.location.href);
      url.searchParams.set('productId', productId);
      window.history.pushState({}, '', url.toString());
    } else if (page === 'products') {
      finalPage = 'product-shop';
    }
    // Handle dynamic course routes - use state-based navigation (like dashboards)
    else if (page.startsWith('course-detail-')) {
      const courseIdFromPage = page.replace('course-detail-', '');
      setCourseId(courseIdFromPage);
      finalPage = 'course-detail';
    } else if (page.startsWith('course-player-')) {
      const courseIdFromPage = page.replace('course-player-', '');
      setCourseId(courseIdFromPage);
      finalPage = 'course-player';
    } else if (page.startsWith('claim-certificate-')) {
      const courseIdFromPage = page.replace('claim-certificate-', '');
      setCourseId(courseIdFromPage);
      finalPage = 'claim-certificate';
    } else if (page === 'course-browse') {
      finalPage = 'course-browse';
    } else if (page.startsWith('blog-post-')) {
      // Handle blog post navigation like course detail (pure state-based, no URL change)
      const slugFromPage = page.replace('blog-post-', '');
      console.log('📝 Blog post navigation - slug:', slugFromPage);
      setBlogSlug(slugFromPage);
      finalPage = 'blog-post-detail';
      console.log('📝 Blog post navigation - finalPage set to:', finalPage);
    } else if (page === 'blog') {
      // Clear blog slug when going to blog list
      setBlogSlug(null);
      finalPage = 'blog';
    } else if (page.startsWith('verify-certificate-')) {
      const code = page.replace('verify-certificate-', '');
      finalPage = 'verify-certificate';
      // Set URL parameter for code
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'verify-certificate');
      url.searchParams.set('code', code);
      window.history.pushState({}, '', url.toString());
    }
    
    // If checkout data is provided, store it
    if (finalPage === 'checkout' && data) {
      setCheckoutDetails(data);
    }
    
    // If category detail navigation with categoryId, store it
    if (finalPage === 'category-detail' && data?.categoryId) {
      setSelectedCategoryId(data.categoryId);
    }
    
    // If product detail navigation with productId, set URL parameter
    if (finalPage === 'product-detail' && data?.productId) {
      const url = new URL(window.location.href);
      url.searchParams.set('productId', data.productId);
      window.history.pushState({}, '', url.toString());
    }
    
    // If freelancer dashboard navigation with tab, store it
    if (finalPage === 'freelancer-dashboard' && data?.tab) {
      setFreelancerDashboardTab(data.tab);
    }
    
    // If portfolio preview navigation with workId, set URL parameter
    if (finalPage === 'portfolio-preview' && data?.workId) {
      const url = new URL(window.location.href);
      url.searchParams.set('workId', data.workId);
      if (data?.commentId) {
        url.searchParams.set('commentId', data.commentId);
      } else {
        url.searchParams.delete('commentId'); // Clear stale commentId
      }
      window.history.pushState({}, '', url.toString());
    }
    
    // If portfolio edit navigation with workId, set URL parameter
    if (finalPage === 'portfolio-edit' && data?.workId) {
      const url = new URL(window.location.href);
      url.searchParams.set('workId', data.workId);
      url.searchParams.set('page', 'portfolio-edit');
      window.history.pushState({}, '', url.toString());
    }
    
    // If portfolio create navigation, clear workId parameter
    if (finalPage === 'portfolio-create') {
      const url = new URL(window.location.href);
      url.searchParams.delete('workId');
      url.searchParams.set('page', 'portfolio-create');
      window.history.pushState({}, '', url.toString());
    }
    
    // Clear blog slug when navigating away from blog-post-detail
    if (finalPage !== 'blog-post-detail' && currentState === 'blog-post-detail') {
      setBlogSlug(null);
    }
    
    if (!customTransition) {
      if (finalPage === 'auth') {
        transition = 'scale';
      } else if (finalPage === 'premium') {
        transition = 'slide-right';
      } else if (finalPage === 'help' || finalPage === 'contact' || finalPage === 'learn-more') {
        transition = 'slide-left';
      } else if (finalPage.includes('dashboard') || finalPage === 'home' || finalPage === 'course-browse') {
        transition = 'instant'; // Make dashboard, home, and course browse navigation instant
      }
    }
    
    navigateToPage(finalPage, transition as any);
    setCurrentState(finalPage as AppState);
  };

  const renderPage = () => {
    switch (currentState) {
      case "home":
        return (
          <PageTransition 
            isActive={currentPage === "home"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <LandingPage onNavigate={handleNavigation} />
          </PageTransition>
        );
      
      case "premium":
        return (
          <PageTransition 
            isActive={currentPage === "premium"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <PremiumPage onNavigate={handleNavigation} />
          </PageTransition>
        );
      
      case "contact":
        return (
          <PageTransition 
            isActive={currentPage === "contact"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <ContactPage onNavigate={handleNavigation} />
          </PageTransition>
        );
      
      case "about":
        return (
          <PageTransition 
            isActive={currentPage === "about"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <AboutPage onNavigate={handleNavigation} />
          </PageTransition>
        );
      
      case "help":
        return (
          <PageTransition 
            isActive={currentPage === "help"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <HelpCenter onNavigate={handleNavigation} />
          </PageTransition>
        );
      
      case "privacy":
        return (
          <PageTransition 
            isActive={currentPage === "privacy"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <PrivacyPolicyPage onNavigate={handleNavigation} />
          </PageTransition>
        );
      
      case "terms":
        return (
          <PageTransition 
            isActive={currentPage === "terms"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <TermsPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "student-terms":
        return (
          <PageTransition 
            isActive={currentPage === "student-terms"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <StudentTermsPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "teacher-terms":
        return (
          <PageTransition 
            isActive={currentPage === "teacher-terms"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <TeacherTermsPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "school-terms":
        return (
          <PageTransition 
            isActive={currentPage === "school-terms"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <SchoolInstitutionTermsPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "refund-policy":
        return (
          <PageTransition 
            isActive={currentPage === "refund-policy"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <RefundPolicyPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "privacy-policy":
        return (
          <PageTransition 
            isActive={currentPage === "privacy-policy"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <PrivacyPolicyPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "cookies-policy":
        return (
          <PageTransition 
            isActive={currentPage === "cookies-policy"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <CookiesPolicyPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "chat-terms":
        return (
          <PageTransition 
            isActive={currentPage === "chat-terms"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <ChatTermsPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "whatsapp-policy":
        return (
          <PageTransition 
            isActive={currentPage === "whatsapp-policy"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <WhatsAppPolicyPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "data-retention":
        return (
          <PageTransition 
            isActive={currentPage === "data-retention"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <DataRetentionPolicyPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "copyright-dmca":
        return (
          <PageTransition 
            isActive={currentPage === "copyright-dmca"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <CopyrightDMCAPolicyPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "community-guidelines":
        return (
          <PageTransition 
            isActive={currentPage === "community-guidelines"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <CommunityGuidelinesPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "payment-billing":
        return (
          <PageTransition 
            isActive={currentPage === "payment-billing"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <PaymentBillingPolicyPage onNavigate={handleNavigation} />
          </PageTransition>
        );
    
      case "auth":
        return <div className="page-transition"><AuthModern onLogin={handleLogin} onNavigate={handleNavigation} /></div>;
    
      case "student-signup":
        return <div className="page-transition"><AuthModern onLogin={handleLogin} onNavigate={handleNavigation} userType="student" /></div>;
    
      case "creator-signup":
        return <div className="page-transition"><AuthModern onLogin={handleLogin} onNavigate={handleNavigation} userType="teacher" /></div>;
    
      case "teacher-login":
        return <div className="page-transition"><TeacherLogin onLogin={handleLogin} onNavigate={handleNavigation} /></div>;
    
      case "freelancer-login":
        return <div className="page-transition"><AuthModern onLogin={handleLogin} onNavigate={handleNavigation} userType="freelancer" /></div>;
    
      case "settings":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        return <div className="page-transition"><StudySettings onBack={handleBackToDashboard} /></div>;
    





      case "subscribe":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="page-transition">
            <Subscribe onNavigate={handleNavigation} />
          </div>
        );

      case "checkout":
        return (
          <div className="page-transition">
            <Checkout
              amount={checkoutDetails.amount}
              courseName={checkoutDetails.courseName || checkoutDetails.planName}
              courseId={checkoutDetails.planName?.toLowerCase().replace(/\s+/g, '-') || 'plan'}
              clientSecret={checkoutDetails.clientSecret}
              planName={checkoutDetails.planName}
              billingCycle={checkoutDetails.billingCycle}
              orderData={checkoutDetails.orderData}
              onSuccess={() => handleNavigation("payment-success", "instant")}
              onCancel={() => handleNavigation(checkoutDetails.orderData ? "cart" : "premium")}
            />
          </div>
        );

      case "learn-more":
        return (
          <PageTransition 
            isActive={currentPage === "learn-more"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <LearnMorePage onNavigate={handleNavigation} />
          </PageTransition>
        );


      case "reset-password":
        return (
          <div className="page-transition">
            <ResetPassword />
          </div>
        );

      case "student-dashboard":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="instant-transition">
            <StudentDashboard onNavigate={handleNavigation} />
          </div>
        );

      case "survey":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="page-transition">
            <Survey onComplete={handleSurveyComplete} userId={user.id} />
          </div>
        );

      case "customer-pricing":
        return (
          <PageTransition 
            isActive={currentPage === "customer-pricing"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <CustomerPricingPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "creator-pricing":
        return (
          <PageTransition 
            isActive={currentPage === "creator-pricing"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <CreatorPricingPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "education-pricing":
        return (
          <PageTransition 
            isActive={currentPage === "education-pricing"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <EducationPricingPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "teacher-pricing":
        return (
          <PageTransition 
            isActive={currentPage === "teacher-pricing"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <TeacherPricingPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "admin-dashboard":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && !["admin", "accountant", "customer_service"].includes(profile.role)) {
          console.log('❌ Access denied - User does not have admin/accountant/customer_service role');
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <AdminPaymentDashboard onNavigate={handleNavigation} />
          </div>
        );

      case "admin-payout-management":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && !["admin", "accountant", "customer_service"].includes(profile.role)) {
          console.log('❌ Access denied - User does not have admin/accountant/customer_service role');
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <AdminPayoutManagement />
          </div>
        );

      case "admin-showcase-dashboard":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="instant-transition">
            <AdminShowcaseDashboard />
          </div>
        );

      case "admin-email-management":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && !["admin", "moderator"].includes(profile.role)) {
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <AdminEmailManagement onNavigate={handleNavigation} />
          </div>
        );

      case "admin-email-campaigns":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && !["admin", "moderator"].includes(profile.role)) {
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <AdminEmailCampaigns onNavigate={handleNavigation} />
          </div>
        );

      case "admin-email-inbox":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && !["admin", "moderator", "customer_service"].includes(profile.role)) {
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <EnhancedEmailInbox onNavigate={handleNavigation} />
          </div>
        );

      case "admin-blog-management":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && !["admin", "moderator"].includes(profile.role)) {
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <Header onNavigate={handleNavigation} currentPage={currentState} />
            <AdminBlogManagement />
          </div>
        );

      case "admin-course-management":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && !["admin", "moderator"].includes(profile.role)) {
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <Header onNavigate={handleNavigation} currentPage={currentState} />
            <AdminCourseManagement />
          </div>
        );

      case "admin-contact-messages":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && !["admin", "moderator", "customer_service"].includes(profile.role)) {
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <Header onNavigate={handleNavigation} currentPage={currentState} />
            <AdminContactMessages onNavigate={handleNavigation} />
          </div>
        );

      case "admin-applications-management":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && !["admin", "moderator"].includes(profile.role)) {
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <AdminApplicationsManagement onNavigate={handleNavigation} />
          </div>
        );

      case "admin-subject-approval":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && !["admin", "moderator"].includes(profile.role)) {
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <AdminSubjectApproval onNavigate={handleNavigation} />
          </div>
        );

      case "blog":
        return (
          <div className="page-transition">
            <Header onNavigate={handleNavigation} currentPage={currentState} />
            <BlogPage onNavigate={handleNavigation} />
          </div>
        );

      case "blog-post-detail":
        return (
          <div className="page-transition">
            <Header onNavigate={handleNavigation} currentPage={currentState} />
            <BlogPostDetail onNavigate={handleNavigation} slug={blogSlug} />
          </div>
        );

      case "networking":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="page-transition">
            <StudentNetworking />
          </div>
        );

      case "community":
        return (
          <div className="page-transition">
            <PortfolioNavigation onNavigate={handleNavigation} />
            <FindTalent onNavigate={handleNavigation} />
          </div>
        );

      case "payment-success":
        return (
          <div className="page-transition">
            <PaymentSuccess onNavigate={handleNavigation} />
          </div>
        );

      case "transaction-dashboard":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="page-transition">
            <TransactionDashboard />
          </div>
        );

      case "teacher-dashboard":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && profile.role !== "teacher") {
          console.log('❌ Access denied - User is not a teacher');
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <TeacherDashboardWithStatusCheck onNavigate={handleNavigation} userId={user.id} />
          </div>
        );

      case "teacher-meetings":
      case "teacher-meetings-schedule":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && profile.role !== "teacher") {
          console.log('❌ Access denied - User is not a teacher');
          handleNavigation("customer-dashboard");
          return <div className="page-transition">Redirecting...</div>;
        }
        handleNavigation("teacher-dashboard");
        return <div className="instant-transition">Redirecting to dashboard...</div>;

      case "teacher-meeting-detail":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && profile.role !== "teacher") {
          console.log('❌ Access denied - User is not a teacher');
          handleNavigation("customer-dashboard");
          return <div className="page-transition">Redirecting...</div>;
        }
        return (
          <div className="page-transition">
            <TeacherMeetingDetail meetingId={meetingId} />
          </div>
        );

      case "student-meetings":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && profile.role !== "student") {
          console.log('❌ Access denied - User is not a student');
          handleNavigation("customer-dashboard");
          return <div className="page-transition">Redirecting...</div>;
        }
        return (
          <div className="page-transition">
            <StudentMeetings />
          </div>
        );

      case "meeting-room":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        console.log('🎥 Rendering meeting room with meetingId:', meetingId);
        if (!meetingId) {
          console.error('❌ Missing meetingId for meeting room');
          handleNavigation("teacher-meetings");
          return <div className="instant-transition">Redirecting to meetings...</div>;
        }
        return (
          <div className="instant-transition">
            <MeetingRoom meetingId={meetingId} />
          </div>
        );

      case "freelancer-dashboard":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && profile.role !== "freelancer") {
          console.log('❌ Access denied - User is not a freelancer');
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <FreelancerDashboardWithStatusCheck onNavigate={handleNavigation} initialTab={freelancerDashboardTab} userId={user.id} />
          </div>
        );

      case "creator-earnings-dashboard":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        if (profile && !["freelancer", "teacher"].includes(profile.role)) {
          console.log('❌ Access denied - User is not a creator (freelancer/teacher)');
          handleNavigation("customer-dashboard");
          return <div className="instant-transition">Redirecting...</div>;
        }
        return (
          <div className="instant-transition">
            <CreatorEarningsDashboard />
          </div>
        );

      case "freelancer-signup-basic":
        return (
          <PageTransition 
            isActive={currentPage === "freelancer-signup-basic"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <FreelancerSignupBasic />
          </PageTransition>
        );

      case "freelancer-signup":
        return (
          <PageTransition 
            isActive={currentPage === "freelancer-signup"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <FreelancerSignup onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "freelancer-application-status":
        // If user is logged in as freelancer, show the pending dashboard
        if (user && profile?.role === 'freelancer') {
          return (
            <div className="instant-transition">
              <FreelancerDashboardPending onNavigate={handleNavigation} />
            </div>
          );
        }
        // Otherwise show the public application status page
        return (
          <PageTransition 
            isActive={currentPage === "freelancer-application-status"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <FreelancerApplicationStatus />
          </PageTransition>
        );

      case "teacher-application":
        return (
          <PageTransition 
            isActive={currentPage === "teacher-application"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <Header onNavigate={handleNavigation} currentPage={currentState} />
            <BecomeTeacherPage onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "teacher-signup-basic":
        return (
          <PageTransition 
            isActive={currentPage === "teacher-signup-basic"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <TeacherSignupBasic />
          </PageTransition>
        );

      case "teacher-signup":
        return (
          <PageTransition 
            isActive={currentPage === "teacher-signup"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <TeacherSignup />
          </PageTransition>
        );

      case "teacher-verify-email":
      case "teacher-apply-verify":
        return (
          <PageTransition 
            isActive={currentState === "teacher-verify-email" || currentState === "teacher-apply-verify"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <VerifyTeacherEmail />
          </PageTransition>
        );

      case "teacher-application-status":
        return (
          <PageTransition 
            isActive={currentPage === "teacher-application-status"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <TeacherApplicationStatus />
          </PageTransition>
        );

      case "shop-auth":
        return (
          <PageTransition 
            isActive={currentPage === "shop-auth"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <ShopAuth onNavigate={handleNavigation} />
          </PageTransition>
        );
        
      case "customer-dashboard":
        return (
          <PageTransition 
            isActive={currentPage === "customer-dashboard"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <CustomerDashboard onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "payout-policy":
        return (
          <PageTransition 
            isActive={currentPage === "payout-policy"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <PayoutPolicy onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "logo-management":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="page-transition">
            <LogoManagementPage />
          </div>
        );

      case "advertise-with-us":
        return (
          <PageTransition 
            isActive={currentPage === "advertise-with-us"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <AdvertiseWithUs onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "design-team-contact":
        return (
          <PageTransition 
            isActive={currentPage === "design-team-contact"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <DesignTeamContact onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "banner-creator":
        return (
          <PageTransition 
            isActive={currentPage === "banner-creator"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <BannerCreator onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "banner-payment":
        return (
          <PageTransition 
            isActive={currentPage === "banner-payment"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <BannerPayment onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "education-level-selector":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <PageTransition 
            isActive={currentPage === "education-level-selector"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <EducationLevelSelector 
              onNavigate={handleNavigation}
              userRole={profile?.role || 'student'}
            />
          </PageTransition>
        );

      case "course-creator":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <PageTransition 
            isActive={currentPage === "course-creator"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <CourseCreator 
              onNavigate={handleNavigation}
              userRole={profile?.role || 'student'}
            />
          </PageTransition>
        );

      case "subject-creator":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <PageTransition 
            isActive={currentPage === "subject-creator"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <SubjectCreator 
              onNavigate={handleNavigation}
              userRole={profile?.role || 'student'}
            />
          </PageTransition>
        );

      case "course-browse":
        return (
          <PageTransition 
            isActive={currentPage === "course-browse"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <CourseBrowse onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "course-detail":
        return (
          <PageTransition 
            isActive={currentPage === "course-detail"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <Header onNavigate={handleNavigation} currentPage={currentState} />
            <CourseDetail 
              courseId={courseId || ''}
              onNavigate={handleNavigation} 
              onBack={() => handleNavigation('course-browse')}
            />
          </PageTransition>
        );

      case "course-player":
        return (
          <PageTransition 
            isActive={currentPage === "course-player"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <CoursePlayer 
              courseId={courseId || ''}
              onNavigate={handleNavigation}
            />
          </PageTransition>
        );

      case "claim-certificate":
        return (
          <PageTransition 
            isActive={currentPage === "claim-certificate"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <ClaimCertificate 
              courseId={courseId || ''}
              onNavigate={handleNavigation}
            />
          </PageTransition>
        );


      case "portfolio-gallery":
        return (
          <PageTransition 
            isActive={currentPage === "portfolio-gallery"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <PortfolioGallery onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "portfolio-create":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <PageTransition 
            isActive={currentPage === "portfolio-create"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <PortfolioCreate onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "portfolio-edit":
        if (!user) return <div className="instant-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <PageTransition 
            isActive={currentPage === "portfolio-edit"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <PortfolioCreate onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "portfolio-preview":
        return (
          <PageTransition 
            isActive={currentPage === "portfolio-preview"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <PortfolioPreview onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "freelancer-profile":
        return (
          <PageTransition 
            isActive={currentPage === "freelancer-profile"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <FreelancerProfile onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "product-shop":
        return (
          <PageTransition 
            isActive={currentPage === "product-shop"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <ProductShop 
              onNavigate={handleNavigation} 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </PageTransition>
        );

      case "product-detail":
        return (
          <PageTransition 
            isActive={currentPage === "product-detail"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <ProductDetail 
              onNavigate={handleNavigation}
              productId={new URLSearchParams(window.location.search).get('productId') || ''}
            />
          </PageTransition>
        );

      case "cart":
        return (
          <PageTransition 
            isActive={currentPage === "cart"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <Cart onNavigate={handleNavigation} />
          </PageTransition>
        );

      case "category-management":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="page-transition">
            <CategoryManagement />
          </div>
        );

      case "category-detail":
        return (
          <PageTransition 
            isActive={currentPage === "category-detail"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <CategoryDetail 
              categoryId={selectedCategoryId || new URLSearchParams(window.location.search).get('categoryId') || ''}
              onNavigate={handleNavigation} 
            />
          </PageTransition>
        );

      case "product-creation":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="page-transition">
            <ProductCreation onNavigate={handleNavigation} />
          </div>
        );

      case "coupon-management":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="page-transition">
            <CouponManagement />
          </div>
        );

      case "freelancer-checkout":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="page-transition">
            <FreelancerCheckout onNavigate={handleNavigation} />
          </div>
        );

      case "my-certificates":
        if (!user) return <div className="page-transition"><AuthModern onLogin={handleLogin} /></div>;
        return (
          <div className="page-transition">
            <Header onNavigate={handleNavigation} currentPage={currentState} />
            <MyCertificatesPage />
          </div>
        );

      case "verify-certificate":
        return (
          <div className="page-transition">
            <Header onNavigate={handleNavigation} currentPage={currentState} />
            <VerifyCertificatePage />
          </div>
        );

      case "buy-voucher":
        return (
          <PageTransition 
            isActive={currentPage === "buy-voucher"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <Header onNavigate={handleNavigation} currentPage={currentState} />
            <BuyVoucherPage />
          </PageTransition>
        );

      case "error-404":
        return (
          <div className="page-transition">
            <Error404 />
          </div>
        );

      case "error-403":
        return (
          <div className="page-transition">
            <Error403 />
          </div>
        );

      case "error-401":
        return (
          <div className="page-transition">
            <Error401 />
          </div>
        );

      case "error-500":
        return (
          <div className="page-transition">
            <Error500 />
          </div>
        );

      case "maintenance":
        return (
          <div className="page-transition">
            <Maintenance />
          </div>
        );

      default:
        return (
          <PageTransition 
            isActive={currentPage === "home"} 
            transitionType={transitionType} 
            isTransitioning={isTransitioning}
            isExiting={isExiting}
          >
            <LandingPage onNavigate={handleNavigation} />
          </PageTransition>
        );
    }
  };

  return (
    <>
      {/* Top Progress Bar for navigation feedback */}
      <TopProgressBar isLoading={isLoading} progress={loadingProgress} />
      
      {/* State-based routing - render based on currentState */}
      {renderPage()}
      
      {showLogoutAnimation && (
        <LogoutAnimation isVisible={showLogoutAnimation} onComplete={completeLogout} />
      )}
    </>
  );
};

export default Index;
