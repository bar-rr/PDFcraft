import { Merge, Split, Minimize2, FileImage } from 'lucide-react';
import { Header } from './components/Header';
import { FeatureCard } from './components/FeatureCard';
import { useAuth } from './hooks/useAuth';
import { useLang } from './i18n';
import { useUsageLimit } from './hooks/useUsageLimit';
import { SupportBox } from './components/SupportBox';
import {
  mergePDFs,
  splitPDF,
  compressPDF,
  jpegToPDF,
  downloadBlob,
  downloadMultipleBlobs
} from './utils/pdfUtils';

function App() {
  const { loading } = useAuth();
  const { t } = useLang();
  const { dailyLimit } = useUsageLimit();

  const handleMergePDFs = async (files: File[]) => {
    if (files.length < 2) {
      throw new Error(t('errMergeMin'));
    }
    const mergedPdf = await mergePDFs(files);
    downloadBlob(mergedPdf, 'merged_document.pdf');
  };

  const handleSplitPDF = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error(t('errSplitOne'));
    }
    const splitPdfs = await splitPDF(files[0]);
    const baseName = files[0].name.replace(/\.pdf$/i, '');
    await downloadMultipleBlobs(splitPdfs, baseName);
  };

  const handleCompressPDF = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error(t('errCompressOne'));
    }
    const compressedPdf = await compressPDF(files[0]);
    const fileName = files[0].name.replace(/\.pdf$/i, '') + '_compressed.pdf';
    downloadBlob(compressedPdf, fileName);
  };

  const handleJpegToPDF = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error(t('errJpegMin'));
    }
    const pdf = await jpegToPDF(files);
    downloadBlob(pdf, 'images_to_pdf.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/80 text-sm uppercase tracking-widest">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col">
      <Header />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 pb-12 flex-1">
        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{t('heroTitle')}</h1>
          <p className="text-white/70 max-w-3xl mx-auto leading-relaxed">{t('heroDesc', { n: dailyLimit })}</p>
        </div>

        <div className="mb-8"><SupportBox /></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <FeatureCard kind="merge" title={t('mergeTitle')} description={t('mergeDesc')} icon={Merge}
            accept="application/pdf" multiple={true} onProcess={handleMergePDFs} />
          <FeatureCard kind="split" title={t('splitTitle')} description={t('splitDesc')} icon={Split}
            accept="application/pdf" multiple={false} onProcess={handleSplitPDF} />
          <FeatureCard kind="compress" title={t('compressTitle')} description={t('compressDesc')} icon={Minimize2}
            accept="application/pdf" multiple={false} onProcess={handleCompressPDF} />
          <FeatureCard kind="jpeg" title={t('jpegTitle')} description={t('jpegDesc')} icon={FileImage}
            accept="image/jpeg,image/jpg" multiple={true} onProcess={handleJpegToPDF} />
        </div>

        <div className="border border-white/20 bg-black/60 p-6 max-w-3xl mx-auto">
          <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-4 text-center">{t('whyTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-white/70">
            {([['why1t', 'why1d'], ['why2t', 'why2d'], ['why3t', 'why3d']] as const).map(([h, d]) => (
              <div key={h}>
                <h3 className="font-semibold text-white mb-1.5 text-xs uppercase tracking-widest">{t(h)}</h3>
                <p className="text-xs leading-relaxed">{t(d)}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/20 py-4 text-center text-[11px] uppercase tracking-widest text-white/50">
        {t('footer')}{' '}
        <a href="https://www.barisy.org" className="text-white/80 hover:text-white underline">barisy.org</a>
      </footer>
    </div>
  );
}

export default App;
