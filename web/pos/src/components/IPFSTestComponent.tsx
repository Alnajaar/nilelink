// web/pos/src/components/IPFSTestComponent.tsx
'use client';

import React, { useState } from 'react';
import { Card } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { Input } from '@shared/components/Input';
import { 
  Upload, 
  FileImage, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useIPFSUpload } from '@/lib/ipfs';
import { formatBytes, estimateUploadCost } from '@/lib/ipfs/utils';

interface IPFSTestComponentProps {
  className?: string;
}

export function IPFSTestComponent({ className = '' }: IPFSTestComponentProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const { uploadFile, isReady, getConfigStatus } = useIPFSUpload();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setError('');
    setUploadResult(null);

    try {
      const result = await uploadFile(selectedFile, {
        name: selectedFile.name,
        description: 'Test upload from NileLink POS'
      });
      
      setUploadResult(result);
      setUploadStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadStatus('error');
    }
  };

  const configStatus = getConfigStatus();
  const costEstimate = selectedFile ? estimateUploadCost(selectedFile.size) : null;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">IPFS Integration Test</h2>
          <p className="text-gray-600 text-sm">
            Test decentralized file storage with IPFS and Pinata
          </p>
        </div>

        {/* Configuration Status */}
        <div className="p-4 rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-2">Configuration Status</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${configStatus.configured ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>API Keys</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${configStatus.initialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Initialized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${configStatus.ready ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Ready</span>
            </div>
          </div>
        </div>

        {/* File Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File to Upload
          </label>
          <div className="flex items-center gap-3">
            <Input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.json"
              className="flex-1"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileImage className="w-4 h-4" />
                <span>{selectedFile.name}</span>
                <span>({formatBytes(selectedFile.size)})</span>
              </div>
            )}
          </div>
          {costEstimate && (
            <p className="text-xs text-gray-500 mt-1">
              Estimated cost: {costEstimate.estimatedCost} for {costEstimate.fileSizeFormatted}
            </p>
          )}
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !isReady() || uploadStatus === 'uploading'}
          className="w-full flex items-center justify-center gap-2"
        >
          {uploadStatus === 'uploading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading to IPFS...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload to IPFS
            </>
          )}
        </Button>

        {/* Error Display */}
        {uploadStatus === 'error' && error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-red-800">Upload Failed</h3>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {uploadStatus === 'success' && uploadResult && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-green-800">Upload Successful!</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">CID:</span>
                <code className="font-mono text-gray-800">{uploadResult.cid}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IPFS URL:</span>
                <code className="font-mono text-gray-800 text-xs truncate flex-1 ml-2">
                  {uploadResult.ipfsUrl}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gateway URL:</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-gray-800 text-xs truncate flex-1">
                    {uploadResult.gatewayUrl}
                  </code>
                  <a 
                    href={uploadResult.gatewayUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="text-gray-800">
                  {new Date(uploadResult.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">Setup Instructions</h3>
          <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
            <li>Sign up for a free account at <a href="https://www.pinata.cloud" target="_blank" rel="noopener noreferrer" className="underline">Pinata.cloud</a></li>
            <li>Create API keys in your Pinata dashboard</li>
            <li>Add your API keys to the .env.local file</li>
            <li>Restart the development server</li>
            <li>Try uploading a file to test the integration</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}