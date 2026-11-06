import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { PDFSplitter } from './PDFSplitter';
import { useUsageLimit } from '../hooks/useUsageLimit';
import { UpgradeModal } from './UpgradeModal';
import { useLang } from '../i18n';

interface FeatureCardProps {
  title: string;
  description: string;
  kind: 'merge' | 'split' | 'compress' | 'jpeg';
  icon: LucideIcon;
  accept: string;
  multiple?: boolean;
  onProcess: (files: File[]) => Promise<void>;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  kind,
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
  const { t } = useLang();

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
    if (kind === 'split') {
      if (files.length !== 1) {
        setError(t('errSplitOne'));
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
      setError(error instanceof Error ? error.message : t('errGeneric'));
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
      <div className="border border-white/20 bg-black/60 p-5 hover:border-white/40 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className="border border-white/40 p-2.5">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">{title}</h3>
            <p className="text-white/60 text-xs mt-0.5">{description}</p>
          </div>
        </div>

        {error && (
          <div className="mb-3 border border-red-400/40 bg-red-500/10 p-3">
            <p className="text-red-300 text-xs">{error}</p>
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
          className="w-full mt-4 border border-white text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-white flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>{t('processing')}</span>
            </>
          ) : (
            <span>{kind === 'split' ? t('selectPages') : t('processN', { n: files.length, unit: files.length === 1 ? 'file' : 'files' })}</span>
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