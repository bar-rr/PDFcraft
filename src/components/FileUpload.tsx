import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

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
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const allowed = accept.split(',').map((t) => t.trim());
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
        const selectedFiles = Array.from(e.target.files);
        onFilesSelect(selectedFiles);
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
        className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-white/5"
      >
        <Upload className="mx-auto h-12 w-12 text-blue-400 mb-4" />
        <p className="text-white mb-2">
          Drag and drop files here, or{' '}
          <label className="text-blue-400 hover:text-blue-300 cursor-pointer underline">
            browse
            <input
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-white/60 text-sm">
          {accept === 'application/pdf' ? 'PDF files only' : 'JPEG/JPG files only'}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white/10 rounded-lg p-3"
            >
              <span className="text-white text-sm truncate">{file.name}</span>
              <button
                onClick={() => onRemoveFile(index)}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};