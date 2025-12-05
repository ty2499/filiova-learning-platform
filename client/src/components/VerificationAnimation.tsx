import { Mail, Phone, MessageSquare } from 'lucide-react';

interface VerificationAnimationProps {
  method: 'email' | 'sms' | 'whatsapp';
  contactInfo: string;
  isVisible?: boolean;
}

export default function VerificationAnimation({ 
  method, 
  contactInfo,
  isVisible = true
}: VerificationAnimationProps) {
  const getMethodIcon = () => {
    switch (method) {
      case 'email':
        return <Mail className="h-6 w-6 text-emerald-600" />;
      case 'sms':
        return <Phone className="h-6 w-6 text-emerald-600" />;
      case 'whatsapp':
        return <MessageSquare className="h-6 w-6 text-emerald-600" />;
      default:
        return <Mail className="h-6 w-6 text-emerald-600" />;
    }
  };

  const getMethodText = () => {
    switch (method) {
      case 'email':
        return 'Email Verification';
      case 'sms':
        return 'SMS Verification';
      case 'whatsapp':
        return 'WhatsApp Verification';
      default:
        return 'Verification';
    }
  };

  const getMaskedContact = () => {
    if (method === 'email') {
      const [local, domain] = contactInfo.split('@');
      if (local && domain) {
        const maskedLocal = local.length > 3 
          ? local.substring(0, 2) + '***' + local.slice(-1)
          : local.substring(0, 1) + '***';
        return `${maskedLocal}@${domain}`;
      }
    } else {
      // Phone number masking
      if (contactInfo.length > 6) {
        return contactInfo.substring(0, 3) + '***' + contactInfo.slice(-4);
      }
    }
    return contactInfo;
  };

  if (!isVisible) return null;

  return (
    <div className="w-full mb-8">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700 p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center">
            {getMethodIcon()}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {getMethodText()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Code sent to {getMaskedContact()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
