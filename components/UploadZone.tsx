import React, { useCallback, useState } from 'react';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_MB } from '../constants';

interface UploadZoneProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  isProcessing: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload JPG, PNG, or WebP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size too large. Maximum ${MAX_FILE_SIZE_MB}MB allowed.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageSelected(result, file.type);
      }
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) setIsDragging(true);
  }, [isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [isProcessing]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full max-w-2xl mx-auto rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        p-10 flex flex-col items-center justify-center text-center shadow-sm
      `}
    >
      <input
        type="file"
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleFileInput}
        disabled={isProcessing}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {isProcessing ? 'Processing image...' : 'Upload a photo'}
      </h3>
      
      <p className="text-gray-500 mb-4 max-w-sm">
        Drag and drop a clear photo of a person, or click to select.
      </p>

      <div className="text-xs text-gray-400 uppercase tracking-wide">
        JPG, PNG, WebP up to {MAX_FILE_SIZE_MB}MB
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-pulse">
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadZone;
