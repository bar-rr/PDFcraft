import React, { useState } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { PDFSplitter } from './PDFSplitter';
import { useUsageLimit } from '../hooks/useUsageLimit';
import { UpgradeModal } from './UpgradeModal';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  accept: string;
  multiple?: boolean;
  onProcess: (files: File[]) => Promise<void>;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  accept,
  multiple = false,
  onProcess
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSplitter, setShowSplitter] = useState(false);
  const [error, setError] = useState<string>('');
  const { canUseFeature, incrementUsage } = useUsageLimit();

  const handleFilesSelect = (newFiles: File[]) => {
    if (multiple) {
      setFiles([...files, ...newFiles]);
    } else {
      setFiles(newFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    setError('');
    
    if (!canUseFeature) {
      setShowUpgrade(true);
      return;
    }

    if (files.length === 0) return;

    // Special handling for PDF splitter
    if (title === 'Split PDF') {
      if (files.length !== 1) {
        setError('Please select exactly 1 PDF file to split');
        return;
      }
      setShowSplitter(true);
      return;
    }

    const canProceed = incrementUsage();
    if (!canProceed) {
      setShowUpgrade(true);
      return;
    }

    setProcessing(true);
    try {
      await onProcess(files);
      setFiles([]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error processing files:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSplitterComplete = () => {
    const canProceed = incrementUsage();
    if (!canProceed) {
      setShowUpgrade(true);
    }
    setShowSplitter(false);
    setFiles([]);
  };

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-white/70 text-sm">{description}</p>
          </div>
        </div>

        {error && (
          <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <FileUpload
          onFilesSelect={handleFilesSelect}
          accept={accept}
          multiple={multiple}
          files={files}
          onRemoveFile={handleRemoveFile}
        />

        <button
          onClick={handleProcess}
          disabled={files.length === 0 || processing}
          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <span>
              {title === 'Split PDF' ? 'Select Pages' : `Process ${files.length} file${files.length !== 1 ? 's' : ''}`}
            </span>
          )}
        </button>
      </div>

      {showSplitter && files[0] && (
        <PDFSplitter
          file={files[0]}
          onClose={() => setShowSplitter(false)}
          onComplete={handleSplitterComplete}
        />
      )}

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
};