import React, { useState, useEffect } from 'react';
import { FileText, Download, X } from 'lucide-react';
import { useLang } from '../i18n';
import { getPDFPageCount, splitPDF, downloadMultipleBlobs, renderPDFPage } from '../utils/pdfUtils';

interface PDFSplitterProps {
  file: File;
  onClose: () => void;
  onComplete: () => void;
}

export const PDFSplitter: React.FC<PDFSplitterProps> = ({ file, onClose, onComplete }) => {
  const [pageCount, setPageCount] = useState<number>(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPreviews, setLoadingPreviews] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const { t } = useLang();

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const count = await getPDFPageCount(file);
        setPageCount(count);
        // Select all pages by default
        setSelectedPages(new Set(Array.from({ length: count }, (_, i) => i)));
        
        // Load page previews
        setLoadingPreviews(true);
        const previews: string[] = [];
        for (let i = 0; i < count; i++) {
          const preview = await renderPDFPage(file, i);
          previews.push(preview);
        }
        setPagePreviews(previews);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errSplitLoad'));
      } finally {
        setLoading(false);
        setLoadingPreviews(false);
      }
    };

    loadPDF();
  }, [file]);

  const togglePage = (pageIndex: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageIndex)) {
      newSelected.delete(pageIndex);
    } else {
      newSelected.add(pageIndex);
    }
    setSelectedPages(newSelected);
  };

  const selectAll = () => {
    setSelectedPages(new Set(Array.from({ length: pageCount }, (_, i) => i)));
  };

  const selectNone = () => {
    setSelectedPages(new Set());
  };

  const handleSplit = async () => {
    if (selectedPages.size === 0) {
      setError(t('errSplitNone'));
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const splitPdfs = await splitPDF(file, Array.from(selectedPages));
      const baseName = file.name.replace(/\.pdf$/i, '');
      await downloadMultipleBlobs(splitPdfs, baseName);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errSplit'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-black border border-white/40 p-6 max-w-md w-full text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xs">{t('splitLoading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/40 max-w-2xl w-full max-h-[80vh] overflow-hidden text-white">
        <div className="p-5 border-b border-white/20 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest">{t('splitModalTitle')}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="border border-red-400/40 bg-red-500/10 p-3 mb-4">
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-white/70 text-xs">{t('splitSelected', { a: selectedPages.size, b: pageCount })}</p>
            <div className="space-x-3 text-xs">
              <button onClick={selectAll} className="text-white underline hover:text-[#00e676]">{t('selectAll')}</button>
              <button onClick={selectNone} className="text-white/60 underline hover:text-white">{t('selectNone')}</button>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => togglePage(i)}
                className={`aspect-[3/4] border flex flex-col items-center justify-center p-1 transition-all relative overflow-hidden ${
                  selectedPages.has(i) ? 'border-[#00e676] bg-[#00e676]/10' : 'border-white/20 hover:border-white/50'
                }`}
              >
                {!loadingPreviews && pagePreviews[i] ? (
                  <>
                    <img src={pagePreviews[i]} alt={`Page ${i + 1}`} className="w-full h-full object-contain bg-white" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs py-1 text-center">{i + 1}</div>
                  </>
                ) : (
                  <>
                    <FileText className="h-6 w-6 mb-1 text-white/60" />
                    <span className="text-xs">{i + 1}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-white/20 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs uppercase tracking-widest text-white/70 hover:text-white">
            {t('cancel')}
          </button>
          <button
            onClick={handleSplit}
            disabled={selectedPages.size === 0 || processing}
            className="px-5 py-2 border border-white text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-white flex items-center gap-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>{t('splitting')}</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>{t('splitDownload')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
