import { useSyncExternalStore } from 'react';

export type Lang = 'en' | 'tr';
const KEY = 'pdfcraft_lang';

// Language order: ?lang= from barisy.org > saved choice > browser language.
const detect = (): Lang => {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'tr' || q === 'en') {
      try { localStorage.setItem(KEY, q); } catch { /* ignore */ }
      return q;
    }
  } catch { /* ignore */ }
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'tr' || saved === 'en') return saved;
  } catch { /* ignore */ }
  return (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en';
};

const dict = {
  en: {
    supportTitle: 'Support this project',
    supportText: 'PDFcraft is free to use and has no ads. If it saved you time, you can support it with a donation. Your support helps keep this tool running and funds new projects I build and share for free.',
    supportNote: 'Donations are voluntary and do not unlock anything.',
    siteTitle: 'PDFcraft – Free PDF Tools by barisy.org',
    heroTitle: 'PDFcraft – Free PDF Tools by barisy.org',
    heroDesc: 'Merge, split, compress, and convert PDFs easily, right in your browser. Enjoy {n} free uses daily, more than enough for most tasks.',
    loading: 'Loading...',
    usesLeft: '{n} uses remaining today',
    premium: 'Premium',
    signIn: 'Sign in with Google',
    signOut: 'Sign out',
    mergeTitle: 'Merge PDFs',
    mergeDesc: 'Combine multiple PDF files into one document',
    splitTitle: 'Split PDF',
    splitDesc: 'Split a PDF into separate pages',
    compressTitle: 'Compress PDF',
    compressDesc: 'Reduce PDF file size while maintaining quality',
    jpegTitle: 'JPEG to PDF',
    jpegDesc: 'Convert JPEG images to PDF format',
    drop: 'Drag and drop files here, or',
    browse: 'browse',
    pdfOnly: 'PDF files only',
    jpegOnly: 'JPEG/JPG files only',
    processN: 'Process {n} {unit}',
    processing: 'Processing...',
    selectPages: 'Select Pages',
    whyTitle: 'Why Choose PDFcraft?',
    why1t: 'Secure & Private',
    why1d: 'All processing happens in your browser. Your files never leave your device.',
    why2t: 'Fast Processing',
    why2d: 'Lightning-fast PDF operations with no server uploads required.',
    why3t: 'Professional Quality',
    why3d: 'Maintain document quality and formatting in all operations.',
    footer: 'Built by',
    errMergeMin: 'Please select at least 2 PDF files to merge',
    errSplitOne: 'Please select exactly 1 PDF file to split',
    errCompressOne: 'Please select exactly 1 PDF file to compress',
    errJpegMin: 'Please select at least 1 JPEG file',
    errGeneric: 'An error occurred',
    errEncrypted: 'Cannot process encrypted PDF: {name}. Please remove password protection first.',
    errMerge: 'Failed to merge PDFs. Please ensure all files are valid PDF documents.',
    errSplit: 'Failed to split PDF. Please ensure the file is a valid PDF document.',
    errCompress: 'Failed to compress PDF. Please ensure the file is a valid PDF document.',
    errRead: 'Failed to read PDF. Please ensure the file is a valid PDF document.',
    errJpeg: 'Failed to convert images to PDF. Please ensure all files are valid JPEG images.',
    splitModalTitle: 'PDFcraft - Split PDF - Select Pages',
    splitLoading: 'Loading PDF and generating previews...',
    splitSelected: 'Select pages to extract ({a} of {b} selected)',
    selectAll: 'Select All',
    selectNone: 'Select None',
    cancel: 'Cancel',
    splitting: 'Splitting...',
    splitDownload: 'Split & Download',
    errSplitNone: 'Please select at least one page to split',
    errSplitLoad: 'Failed to load PDF',
    limitTitle: 'Daily Limit Reached',
    limitDesc: 'You\'ve used your {n} free operations for today. Your limit resets tomorrow. If PDFcraft is useful to you, consider supporting it.',
    premiumFeatures: 'Premium Features:',
    pf1: 'Unlimited PDF operations',
    pf2: 'No daily limits',
    pf3: 'Priority processing',
    pf4: 'Lifetime access',
    upgrade: 'Upgrade to Premium - One-time Payment',
    securePay: 'Secure payment processed by Stripe',
  },
  tr: {
    supportTitle: 'Projeye destek ol',
    supportText: 'PDFcraft ücretsizdir ve reklam içermez. Size zaman kazandırdıysa bağışla destek olabilirsiniz. Desteğiniz bu aracın yaşamasına ve geliştirip ücretsiz paylaştığım yeni projelere katkı sağlar.',
    supportNote: 'Bağışlar gönüllüdür ve herhangi bir özelliği açmaz.',
    siteTitle: 'PDFcraft – barisy.org tarafından Ücretsiz PDF Araçları',
    heroTitle: 'PDFcraft – barisy.org tarafından Ücretsiz PDF Araçları',
    heroDesc: 'PDF\'leri doğrudan tarayıcınızda kolayca birleştirin, bölün, sıkıştırın ve dönüştürün. Günde {n} ücretsiz kullanım, çoğu iş için fazlasıyla yeterli.',
    loading: 'Yükleniyor...',
    usesLeft: 'Bugün {n} kullanım hakkı kaldı',
    premium: 'Premium',
    signIn: 'Google ile giriş yap',
    signOut: 'Çıkış yap',
    mergeTitle: 'PDF Birleştir',
    mergeDesc: 'Birden fazla PDF dosyasını tek belgede birleştirin',
    splitTitle: 'PDF Böl',
    splitDesc: 'Bir PDF\'i ayrı sayfalara bölün',
    compressTitle: 'PDF Sıkıştır',
    compressDesc: 'Kaliteyi koruyarak PDF dosya boyutunu küçültün',
    jpegTitle: 'JPEG → PDF',
    jpegDesc: 'JPEG görselleri PDF formatına dönüştürün',
    drop: 'Dosyaları buraya sürükleyip bırakın veya',
    browse: 'göz atın',
    pdfOnly: 'Yalnızca PDF dosyaları',
    jpegOnly: 'Yalnızca JPEG/JPG dosyaları',
    processN: '{n} dosyayı işle',
    processing: 'İşleniyor...',
    selectPages: 'Sayfa Seç',
    whyTitle: 'Neden PDFcraft?',
    why1t: 'Güvenli ve Gizli',
    why1d: 'Tüm işlemler tarayıcınızda yapılır. Dosyalarınız cihazınızdan çıkmaz.',
    why2t: 'Hızlı İşlem',
    why2d: 'Sunucuya yükleme gerektirmeyen, çok hızlı PDF işlemleri.',
    why3t: 'Profesyonel Kalite',
    why3d: 'Tüm işlemlerde belge kalitesi ve biçimi korunur.',
    footer: 'Geliştiren:',
    errMergeMin: 'Birleştirmek için en az 2 PDF dosyası seçin',
    errSplitOne: 'Bölmek için tam olarak 1 PDF dosyası seçin',
    errCompressOne: 'Sıkıştırmak için tam olarak 1 PDF dosyası seçin',
    errJpegMin: 'En az 1 JPEG dosyası seçin',
    errGeneric: 'Bir hata oluştu',
    errEncrypted: 'Şifreli PDF işlenemiyor: {name}. Lütfen önce parola korumasını kaldırın.',
    errMerge: 'PDF\'ler birleştirilemedi. Tüm dosyaların geçerli PDF olduğundan emin olun.',
    errSplit: 'PDF bölünemedi. Dosyanın geçerli bir PDF olduğundan emin olun.',
    errCompress: 'PDF sıkıştırılamadı. Dosyanın geçerli bir PDF olduğundan emin olun.',
    errRead: 'PDF okunamadı. Dosyanın geçerli bir PDF olduğundan emin olun.',
    errJpeg: 'Görseller PDF\'e dönüştürülemedi. Tüm dosyaların geçerli JPEG olduğundan emin olun.',
    splitModalTitle: 'PDFcraft - PDF Böl - Sayfa Seç',
    splitLoading: 'PDF yükleniyor ve önizlemeler hazırlanıyor...',
    splitSelected: 'Ayıklanacak sayfaları seçin ({b} sayfadan {a} seçili)',
    selectAll: 'Tümünü Seç',
    selectNone: 'Hiçbirini Seçme',
    cancel: 'İptal',
    splitting: 'Bölünüyor...',
    splitDownload: 'Böl ve İndir',
    errSplitNone: 'Bölmek için en az bir sayfa seçin',
    errSplitLoad: 'PDF yüklenemedi',
    limitTitle: 'Günlük Limite Ulaşıldı',
    limitDesc: 'Bugünkü {n} ücretsiz işlem hakkınızı kullandınız. Hakkınız yarın yenilenir. PDFcraft işinize yaradıysa destek olmayı düşünün.',
    premiumFeatures: 'Premium Özellikler:',
    pf1: 'Sınırsız PDF işlemi',
    pf2: 'Günlük limit yok',
    pf3: 'Öncelikli işlem',
    pf4: 'Ömür boyu erişim',
    upgrade: 'Premium\'a Geç - Tek Seferlik Ödeme',
    securePay: 'Güvenli ödeme Stripe tarafından işlenir',
  },
} as const;

export type Key = keyof typeof dict.en;

let lang: Lang = detect();
const listeners = new Set<() => void>();

const apply = () => {
  document.documentElement.lang = lang;
  document.title = dict[lang].siteTitle;
};
apply();

export const setLang = (l: Lang) => {
  lang = l;
  try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  apply();
  listeners.forEach((fn) => fn());
};

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

// Non-hook translator for plain functions (e.g. error messages).
export const t = (key: Key, params?: Record<string, string | number>): string => {
  let s: string = dict[lang][key] ?? dict.en[key];
  if (params) for (const k of Object.keys(params)) s = s.split(`{${k}}`).join(String(params[k]));
  return s;
};

export const useLang = () => {
  const l = useSyncExternalStore(subscribe, () => lang);
  return { lang: l, setLang, t };
};
