import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface Props {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
};

export default function UploadZone({ onUpload, disabled }: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onUpload(accepted);
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-3 text-gray-400" size={32} />
      <p className="text-sm text-gray-600">
        {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to browse'}
      </p>
      <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT, MD</p>
    </div>
  );
}
