// web/pos/src/components/ipfs/IPFSGatewayImage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getOptimizedGatewayUrl, prefetchIPFSContent, ipfsCache } from '@/lib/ipfs';

interface IPFSGatewayImageProps {
  cid: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function IPFSGatewayImage({
  cid,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  onLoad,
  onError
}: IPFSGatewayImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!cid) return;

    // Check cache first
    const cachedUrl = ipfsCache.get(`ipfs_image_${cid}`);
    if (cachedUrl) {
      setImageUrl(cachedUrl);
      setIsLoading(false);
      return;
    }

    // Generate optimized gateway URL
    const gatewayUrl = getOptimizedGatewayUrl(cid);
    setImageUrl(gatewayUrl);
    
    // Cache the URL
    ipfsCache.set(`ipfs_image_${cid}`, gatewayUrl);

    // Prefetch content for better performance
    prefetchIPFSContent(cid).catch(console.warn);
  }, [cid]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = (error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(new Error(`Failed to load IPFS image: ${cid}`));
  };

  if (!cid) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      {hasError ? (
        <div className="bg-gray-100 flex items-center justify-center border border-gray-200">
          <div className="text-center p-4">
            <div className="text-gray-400 mb-2">⚠️</div>
            <div className="text-xs text-gray-500">Image unavailable</div>
          </div>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
      
      {/* Fallback to Next.js Image for optimization when not loading from IPFS */}
      {false && !isLoading && !hasError && (
        <Image
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          className={className}
          quality={quality}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

// Hook for getting multiple gateway URLs for redundancy
export function useIPFSGateways(cid: string) {
  const [gateways, setGateways] = useState<string[]>([]);
  
  useEffect(() => {
    if (cid) {
      const urls = [
        `https://gateway.pinata.cloud/ipfs/${cid}`,
        `https://cloudflare-ipfs.com/ipfs/${cid}`,
        `https://ipfs.io/ipfs/${cid}`,
        `https://dweb.link/ipfs/${cid}`
      ];
      setGateways(urls);
    }
  }, [cid]);
  
  return gateways;
}

// Component for displaying image with fallback gateways
export function IPFSImageWithFallback({
  cid,
  alt,
  width,
  height,
  className = '',
  priority = false
}: IPFSGatewayImageProps) {
  const gateways = useIPFSGateways(cid);
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (currentGatewayIndex < gateways.length - 1) {
      setCurrentGatewayIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };

  if (!cid || hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">No image available</span>
      </div>
    );
  }

  const currentUrl = gateways[currentGatewayIndex];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleImageError}
      loading={priority ? 'eager' : 'lazy'}
    />
  );
}