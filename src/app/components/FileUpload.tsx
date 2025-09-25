// app/components/FileUpload.tsx

import { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: () => void;
  isLoading: boolean;
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export const FileUpload = ({ onFileUpload, isLoading, file, onFileSelect }: FileUploadProps) => {
  // State to hold the selected file object
  // const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setError(null); // Clear previous errors

    if (fileRejections.length > 0) {
      setError(`File error: ${fileRejections[0].errors[0].message}. Please upload a valid audio or video file.`);
      setFile(null);
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'video/*': ['.mp4', '.mov', '.webm'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB limit
  });

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* --- Renders the Dropzone if no file is selected --- */}
      {!file && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'border-cyan-400 bg-slate-800' : 'border-slate-600 hover:border-cyan-500'}`}
        >
          <input {...getInputProps()} />
          <p className="text-slate-300 text-lg">
            Drag & drop your meeting audio/video file here
          </p>
          <p className="text-slate-500 mt-2">or click to select file</p>
          <p className="text-xs text-slate-600 mt-4">Max file size: 50MB</p>
        </div>
      )}

      {/* --- Renders file info and actions if a file IS selected --- */}
      {file && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
          <p className="text-slate-400">Selected File:</p>
          <p className="text-cyan-400 font-semibold text-lg my-2 break-all">{file.name}</p>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleRemoveFile}
              disabled={isLoading}
              className="bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg"
            >
              Remove
            </button>
            <button
              onClick={onFileUpload}
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all"
            >
              {isLoading ? 'Processing...' : 'Start Analysis'}
            </button>
          </div>
        </div>
      )}

      {/* --- Renders any file validation errors --- */}
      {error && (
        <p className="text-red-400 text-center mt-4">{error}</p>
      )}
    </div>
  );
};

function setFile(arg0: null) {
  throw new Error('Function not implemented.');
}
