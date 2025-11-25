import React, { useCallback, useState } from 'react';
import { UploadedFile, FileType } from '../types';

interface FileUploadProps {
  onFileSelect: (file: UploadedFile) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    setError(null);
    
    // Validate type (Phase 1 restriction)
    const validTypes = [FileType.PDF, FileType.IMAGE_JPEG, FileType.IMAGE_PNG, FileType.TEXT];
    if (!validTypes.includes(file.type as FileType)) {
      setError("Please upload a PDF, Image, or Text file for Phase 1.");
      return;
    }

    // Validate size (10MB limit for client-side demo safety)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onFileSelect({
        name: file.name,
        type: file.type,
        data: result
      });
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-brand-600 bg-brand-50 scale-102' 
            : 'border-slate-300 hover:border-brand-400 bg-white'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-brand-100 rounded-full text-brand-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-700">Upload Study Material</p>
            <p className="text-sm text-slate-500 mt-1">Drag & drop PDF, Images, or Text files</p>
          </div>
          
          <label className="cursor-pointer">
            <span className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg shadow-sm text-sm font-medium transition-colors">
              Browse Files
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf, .txt, .png, .jpg, .jpeg"
              onChange={handleInputChange}
            />
          </label>
        </div>
      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};
