import React from 'react';
import { X, Crown, Check } from 'lucide-react';
import { useUsageLimit } from '../hooks/useUsageLimit';
import { useLang } from '../i18n';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { upgradeToPremium, dailyLimit } = useUsageLimit();
  const { t } = useLang();

  const handleUpgrade = () => {
    window.open('https://buy.stripe.com/5kQ7sM8Ju60m1x17SJ7ok00', '_blank');
    // Temporary: premium is granted locally. Real payment verification comes with the PayPal step.
    upgradeToPremium();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/40 max-w-md w-full p-6 relative text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="border border-[#ffd180] w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <Crown className="h-7 w-7 text-[#ffd180]" />
          </div>
          <h2 className="text-lg font-bold uppercase tracking-widest mb-2">{t('limitTitle')}</h2>
          <p className="text-white/70 text-xs">{t('limitDesc', { n: dailyLimit })}</p>
        </div>

        <div className="border border-white/20 p-4 mb-6">
          <h3 className="text-xs uppercase tracking-widest text-white/80 mb-3">{t('premiumFeatures')}</h3>
          <ul className="space-y-2">
            {(['pf1', 'pf2', 'pf3', 'pf4'] as const).map((k) => (
              <li key={k} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#00e676]" />
                <span className="text-white/80 text-xs">{t(k)}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleUpgrade}
          className="w-full border border-white py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          {t('upgrade')}
        </button>

        <p className="text-center text-white/50 text-[11px] mt-3">{t('securePay')}</p>
      </div>
    </div>
  );
};
