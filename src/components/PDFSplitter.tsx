import React, { useState, useEffect } from 'react';
import { FileText, Download, X } from 'lucide-react';
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
        setError(err instanceof Error ? err.message : 'Failed to load PDF');
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
      setError('Please select at least one page to split');
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
      setError(err instanceof Error ? err.message : 'Failed to split PDF');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading PDF and generating previews...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">PDFcraft - Split PDF - Select Pages</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              Select pages to extract ({selectedPages.size} of {pageCount} selected)
            </p>
            <div className="space-x-2">
              <button
                onClick={selectAll}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Select All
              </button>
              <button
                onClick={selectNone}
                className="text-gray-600 hover:text-gray-700 text-sm"
              >
                Select None
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                onClick={() => togglePage(i)}
                className={`
                  aspect-[3/4] border-2 rounded-lg flex flex-col items-center justify-center p-1 transition-all relative overflow-hidden
                  ${selectedPages.has(i)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }
                `}
              >
                {loadingPreviews ? (
                  <>
                    <FileText className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{i + 1}</span>
                  </>
                ) : pagePreviews[i] ? (
                  <>
                    <img 
                      src={pagePreviews[i]} 
                      alt={`Page ${i + 1}`}
                      className="w-full h-full object-contain rounded"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 text-center">
                      {i + 1}
                    </div>
                  </>
                ) : (
                  <>
                    <FileText className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{i + 1}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSplit}
            disabled={selectedPages.size === 0 || processing}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Splitting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Split & Download</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};