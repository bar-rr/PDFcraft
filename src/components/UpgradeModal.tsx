import React from 'react';
import { X, Crown, Check } from 'lucide-react';
import { useUsageLimit } from '../hooks/useUsageLimit';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { upgradeToPremium, dailyLimit } = useUsageLimit();

  const handleUpgrade = () => {
    window.open('https://buy.stripe.com/5kQ7sM8Ju60m1x17SJ7ok00', '_blank');
    // For demo purposes, we'll upgrade immediately
    // In production, you'd verify payment completion via webhook
    upgradeToPremium();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Limit Reached</h2>
          <p className="text-gray-600">
            You've used your daily limit of {dailyLimit} operations. Upgrade to Premium for unlimited access!
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Premium Features:</h3>
          <ul className="space-y-2">
            {[
              'Unlimited PDF operations',
              'No daily limits',
              'Priority processing',
              'Lifetime access'
            ].map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          Upgrade to Premium - One-time Payment
        </button>

        <p className="text-center text-gray-500 text-xs mt-3">
          Secure payment processed by Stripe
        </p>
      </div>
    </div>
  );
};