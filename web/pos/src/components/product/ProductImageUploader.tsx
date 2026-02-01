// web/pos/src/components/product/ProductImageUploader.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useIPFSUpload } from '@/lib/ipfs';
import { formatBytes } from '@/lib/ipfs/utils';

interface ProductImageUploaderProps {
  currentImage?: string;
  onImageUploaded: (cid: string, gatewayUrl: string) => void;
  onImageRemoved: () => void;
  className?: string;
}

export function ProductImageUploader({
  currentImage,
  onImageUploaded,
  onImageRemoved,
  className = ''
}: ProductImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [uploadedCID, setUploadedCID] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isReady } = useIPFSUpload();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleFiles = async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadFile(file, {
        name: file.name,
        description: 'Product image upload'
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
      setUploadedCID(result.cid);
      onImageUploaded(result.cid, result.gatewayUrl);

      // Clear preview after success
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 2000);

    } catch (err) {
      setUploadStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const removeImage = () => {
    setPreview(null);
    setUploadedCID(null);
    setError('');
    setUploadStatus('idle');
    setUploadProgress(0);
    onImageRemoved();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Product Image</h3>
          <p className="text-sm text-gray-600">
            Upload a high-quality image for your product. Supports JPG, PNG, GIF, WebP (max 10MB)
          </p>
        </div>

        {/* Upload Area */}
        {!preview && (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${!isReady() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={isReady() ? triggerFileSelect : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              disabled={!isReady()}
            />
            
            <div className="space-y-3">
              <Upload className={`mx-auto w-12 h-12 ${
                dragActive ? 'text-blue-500' : 'text-gray-400'
              }`} />
              
              <div>
                <p className="font-medium text-gray-700">
                  {dragActive ? 'Drop your image here' : 'Drag & drop your image here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
              </div>
              
              {!isReady() && (
                <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  IPFS service not configured. Images will be stored locally.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Preview and Controls */}
        {preview && (
          <div className="space-y-4">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={preview} 
                alt="Product preview" 
                className="w-full h-64 object-cover rounded-lg border"
              />
              
              {uploadStatus === 'uploading' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="font-medium">Uploading to IPFS...</p>
                    <p className="text-sm">{uploadProgress}% complete</p>
                  </div>
                </div>
              )}
              
              {uploadStatus === 'success' && (
                <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-medium">Upload Successful!</p>
                  </div>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-white hover:bg-gray-100"
                onClick={removeImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* CID and Gateway Info */}
            {uploadedCID && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">IPFS CID</p>
                    <p className="font-mono text-sm text-gray-800 truncate">{uploadedCID}</p>
                  </div>
                  <a 
                    href={`https://gateway.pinata.cloud/ipfs/${uploadedCID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 p-2 text-gray-500 hover:text-blue-600"
                    title="View on IPFS Gateway"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* File Info */}
        {preview && (
          <div className="text-xs text-gray-500 space-y-1">
            <p>Image will be stored permanently on IPFS</p>
            <p>Accessible via decentralized gateway</p>
            <p>Faster loading with content distribution</p>
          </div>
        )}
      </div>
    </Card>
  );
}