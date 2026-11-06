import React from 'react';
import { Heart } from 'lucide-react';
import { useLang } from '../i18n';
import { BUYMEACOFFEE_URL, PAYPAL_URL, BUYMEACOFFEE_QR, PAYPAL_QR } from '../config/support';

const CoffeeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" fill="#FFDD00" />
    <path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H16.6" fill="none" stroke="#FFDD00" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M8 3.5c0 1 .8 1.2.8 2.2M11.5 3.5c0 1 .8 1.2.8 2.2" fill="none" stroke="#FFDD00" strokeWidth="1.4" strokeLinecap="round" />
    <rect x="3" y="19.5" width="15" height="1.6" rx=".8" fill="#FFDD00" />
  </svg>
);

const PayPalIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path d="M8.2 21.5 10 9.4h5.2c2.9 0 4.4 1.6 4 4.1-.5 3.1-2.7 4.6-5.6 4.6h-2l-.8 3.4H8.2z" fill="#009CDE" />
    <path d="M5.2 18.6 7.1 3.5h6.3c3 0 4.5 1.4 4.1 3.9-.5 3-2.6 4.6-5.7 4.6H9.4l-.9 6.6H5.2z" fill="#fff" />
    <path d="M5.2 18.6 7.1 3.5h6.3c3 0 4.5 1.4 4.1 3.9-.5 3-2.6 4.6-5.7 4.6H9.4l-.9 6.6H5.2z" fill="#253B80" />
  </svg>
);

const QrCode: React.FC<{ src: string; label: string; href: string }> = ({ src, label, href }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
    <img src={src} alt="QR" width={112} height={112} className="h-28 w-28 bg-white p-1" />
    <span className="text-[11px] uppercase tracking-widest text-white/50 group-hover:text-white">{label}</span>
  </a>
);

export const SupportBox: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useLang();

  return (
    <div className={`border border-white/20 bg-black/60 text-center ${compact ? 'p-4' : 'p-6 max-w-3xl mx-auto'}`}>
      <div className="flex items-center justify-center gap-2 mb-2 text-white">
        <Heart className="h-4 w-4 text-[#ff5a7a]" />
        <h2 className="text-sm font-bold uppercase tracking-widest">{t('supportTitle')}</h2>
      </div>
      <p className="text-white/70 text-xs leading-relaxed mb-4 max-w-xl mx-auto">{t('supportText')}</p>

      <div className="flex flex-wrap items-start justify-center gap-x-8 gap-y-5">
        <div className="flex flex-col items-center gap-3">
          <a
            href={BUYMEACOFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-[#FFDD00]/70 px-4 py-2 text-xs uppercase tracking-widest text-white hover:bg-[#FFDD00] hover:text-black transition-colors"
          >
            <CoffeeIcon />
            Buy Me a Coffee
          </a>
          {BUYMEACOFFEE_QR && <QrCode src={BUYMEACOFFEE_QR} label={t('scan')} href={BUYMEACOFFEE_URL} />}
        </div>
        <div className="flex flex-col items-center gap-3">
          <a
            href={PAYPAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-[#009CDE]/80 px-4 py-2 text-xs uppercase tracking-widest text-white hover:bg-[#009CDE] hover:text-white transition-colors"
          >
            <PayPalIcon />
            PayPal
          </a>
          {PAYPAL_QR && <QrCode src={PAYPAL_QR} label={t('scan')} href={PAYPAL_URL} />}
        </div>
      </div>

      <p className="text-white/40 text-[11px] mt-3">{t('supportNote')}</p>
    </div>
  );
};
