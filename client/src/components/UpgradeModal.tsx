import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckmarkIcon } from "@/components/ui/checkmark-icon";
import { Crown, Lock, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPlan: 'primary_basic' | 'high_school_basic' | 'college_course';
  subjectName?: string;
  courseName?: string;
  planPrice?: string;
  message?: string;
}

const UpgradeModal = ({ isOpen, onClose, requiredPlan, subjectName, courseName, planPrice, message }: UpgradeModalProps) => {
  const { user, profile } = useAuth();

  const planDetails = {
    primary_basic: {
      name: "Primary Basic",
      price: planPrice || "$5",
      period: "/month",
      description: "Perfect for Grade 1-7 students",
      features: [
        "Unlimited lessons across all subjects",
        "Progress tracking and certificates",
        "Interactive quizzes and assessments",
        "Chat support with teachers",
        "Downloadable resources"
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600"
    },
    high_school_basic: {
      name: "High School Basic", 
      price: planPrice || "$9.99",
      period: "/month",
      description: "Advanced learning for High School",
      features: [
        "All subjects with advanced content",
        "Exam preparation materials", 
        "Priority teacher support",
        "Advanced progress analytics",
        "College prep resources"
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "from-blue-500 to-purple-600"
    },
    college_course: {
      name: "College Course",
      price: planPrice || "$39.99", 
      period: "/course",
      description: "Professional course access",
      features: [
        "Complete course access forever",
        "Downloadable course materials",
        "Professional certificate",
        "Expert instructor support",
        "Industry-standard content"
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600"
    }
  };

  const plan = planDetails[requiredPlan];

  const handleSubscribe = async () => {
    if (!user) return;

    try {
      // Map plan types to subscription tiers
      const tierMap: Record<string, string> = {
        'primary_basic': 'elementary',
        'high_school_basic': 'high_school',
        'college_course': 'college_university'
      };

      const subscriptionTier = tierMap[requiredPlan] || 'high_school';
      
      // Extract price from plan.price (e.g., "$5" => 5, "$9.99" => 9.99)
      const priceStr = plan.price.replace(/[\$,]/g, '');
      const amount = parseFloat(priceStr);
      
      const billingCycle = requiredPlan === 'college_course' ? 'yearly' : 'monthly';

      // Create a payment intent instead of a subscription
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          planName: plan.name,
          billingCycle,
          subscriptionTier,
          gradeLevel: profile?.gradeLevel || 12
        })
      });

      const result = await response.json();
      
      if (result.success && result.clientSecret) {
        // Redirect to checkout page with payment intent
        const params = new URLSearchParams({
          amount: amount.toString(),
          planName: plan.name,
          billingCycle,
          clientSecret: result.clientSecret
        });
        window.location.href = `/checkout?${params.toString()}`;
      } else {
        console.error('Payment intent error:', result.error);
        alert(result.error || 'Failed to create payment. Please try again.');
      }
    } catch (error) {
      console.error('Subscription creation error:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-500" />
            Upgrade Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              {message || `You've reached your free lesson limit for ${subjectName || 'this subject'}. Upgrade to continue learning!`}
            </p>
          </div>

          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className={`flex items-center gap-3 mb-4 p-3 rounded-lg bg-gradient-to-r ${plan.color} text-white`}>
                {plan.icon}
                <div>
                  <h3 className="font-semibold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-sm opacity-90">{plan.period}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckmarkIcon size="sm" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <Lock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  What's currently restricted:
                </p>
                <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Access to additional lessons in {subjectName || 'subjects'}</li>
                  <li>• Downloadable resources and materials</li>
                  {profile?.role === 'student' && <li>• Ability to switch between grade levels</li>}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button 
              onClick={handleSubscribe} 
              className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              data-testid="button-upgrade"
            >
              {requiredPlan === 'college_course' ? 'Purchase Course' : 'Subscribe Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
