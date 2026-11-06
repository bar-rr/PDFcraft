import React from 'react';
import { X } from 'lucide-react';
import { useUsageLimit } from '../hooks/useUsageLimit';
import { useLang } from '../i18n';
import { SupportBox } from './SupportBox';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Shown when the free daily limit is reached. No paid tier: it only offers voluntary donations.
export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { dailyLimit } = useUsageLimit();
  const { t } = useLang();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/40 max-w-lg w-full p-6 relative text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <div className="text-center mb-5">
          <h2 className="text-lg font-bold uppercase tracking-widest mb-2">{t('limitTitle')}</h2>
          <p className="text-white/70 text-xs">{t('limitDesc', { n: dailyLimit })}</p>
        </div>
        <SupportBox compact />
      </div>
    </div>
  );
};
