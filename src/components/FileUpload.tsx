import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { useLang } from '../i18n';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  accept: string;
  multiple?: boolean;
  files: File[];
  onRemoveFile: (index: number) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelect,
  accept,
  multiple = false,
  files,
  onRemoveFile
}) => {
  const { t } = useLang();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const allowed = accept.split(',').map((x) => x.trim());
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => allowed.includes(f.type));
      if (droppedFiles.length > 0) onFilesSelect(multiple ? droppedFiles : droppedFiles.slice(0, 1));
    },
    [onFilesSelect, accept, multiple]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        onFilesSelect(Array.from(e.target.files));
        e.target.value = ''; // allow picking the same file again
      }
    },
    [onFilesSelect]
  );

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border border-dashed border-white/30 p-6 text-center hover:border-white/60 transition-colors bg-white/[0.02]"
      >
        <Upload className="mx-auto h-8 w-8 text-white/70 mb-3" />
        <p className="text-white/90 mb-1">
          {t('drop')}{' '}
          <label className="text-white underline cursor-pointer hover:text-[#00e676]">
            {t('browse')}
            <input type="file" accept={accept} multiple={multiple} onChange={handleFileSelect} className="hidden" />
          </label>
        </p>
        <p className="text-white/50 text-xs">
          {accept === 'application/pdf' ? t('pdfOnly') : t('jpegOnly')}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between border border-white/20 px-3 py-2">
              <span className="text-white text-xs truncate">{file.name}</span>
              <button onClick={() => onRemoveFile(index)} className="text-white/60 hover:text-white ml-3">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
