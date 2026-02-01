'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, Shield, Zap } from 'lucide-react';

// Emergency pause levels (matching smart contract)
enum PauseLevel {
  NONE = 0,
  MINOR = 1,
  MAJOR = 2,
  CRITICAL = 3,
  COMPLETE = 4
}

interface EmergencyStatus {
  pauseLevel: PauseLevel;
  statusDescription: string;
  lastPauseTime: number;
  expectedResolutionTime: number;
  isFullyOperational: boolean;
}

interface EmergencyModeBannerProps {
  onDismiss?: () => void;
  autoHide?: boolean;
  className?: string;
}

export const EmergencyModeBanner: React.FC<EmergencyModeBannerProps> = ({
  onDismiss,
  autoHide = false,
  className = ''
}) => {
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Mock emergency status - in production, this would fetch from blockchain
  useEffect(() => {
    // Simulate fetching emergency status
    const fetchEmergencyStatus = async () => {
      try {
        // Mock API call - replace with actual blockchain query
        const mockStatus: EmergencyStatus = {
          pauseLevel: PauseLevel.NONE, // Change to test different levels
          statusDescription: "System fully operational",
          lastPauseTime: 0,
          expectedResolutionTime: 0,
          isFullyOperational: true
        };

        setEmergencyStatus(mockStatus);
        setIsLoading(false);

        // Auto-hide if system is operational and autoHide is enabled
        if (mockStatus.isFullyOperational && autoHide) {
          setTimeout(() => setIsVisible(false), 3000);
        }
      } catch (error) {
        console.error('Failed to fetch emergency status:', error);
        setIsLoading(false);
      }
    };

    fetchEmergencyStatus();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchEmergencyStatus, 30000);
    return () => clearInterval(interval);
  }, [autoHide]);

  if (!isVisible || !emergencyStatus) {
    return null;
  }

  // Don't show banner if system is fully operational and autoHide is enabled
  if (emergencyStatus.isFullyOperational && autoHide) {
    return null;
  }

  const getBannerStyle = () => {
    switch (emergencyStatus.pauseLevel) {
      case PauseLevel.NONE:
        return {
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          icon: Shield,
          title: 'System Operational'
        };
      case PauseLevel.MINOR:
        return {
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: AlertTriangle,
          title: 'Minor System Issues'
        };
      case PauseLevel.MAJOR:
        return {
          bgColor: 'bg-orange-50 border-orange-200',
          textColor: 'text-orange-800',
          iconColor: 'text-orange-600',
          icon: Clock,
          title: 'Major System Issues'
        };
      case PauseLevel.CRITICAL:
        return {
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: Zap,
          title: 'Critical System Issues'
        };
      case PauseLevel.COMPLETE:
        return {
          bgColor: 'bg-gray-900 border-gray-700',
          textColor: 'text-white',
          iconColor: 'text-red-400',
          icon: AlertTriangle,
          title: 'System Shutdown'
        };
      default:
        return {
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          icon: AlertTriangle,
          title: 'System Status Unknown'
        };
    }
  };

  const bannerStyle = getBannerStyle();
  const Icon = bannerStyle.icon;

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getTimeUntilResolution = () => {
    if (!emergencyStatus.expectedResolutionTime) return null;

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = emergencyStatus.expectedResolutionTime - now;

    if (timeLeft <= 0) return 'Overdue';

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);

    return `${hours}h ${minutes}m remaining`;
  };

  // Hide banner for minor issues in customer-facing apps
  if (emergencyStatus.pauseLevel === PauseLevel.MINOR && window.location.pathname.includes('/customer')) {
    return null;
  }

  return (
    <div className={`border-l-4 p-4 ${bannerStyle.bgColor} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <Icon className={`w-5 h-5 mt-0.5 mr-3 ${bannerStyle.iconColor}`} />
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${bannerStyle.textColor}`}>
              {bannerStyle.title}
            </h3>

            <div className={`mt-1 text-sm ${bannerStyle.textColor} opacity-90`}>
              <p>{emergencyStatus.statusDescription}</p>

              {emergencyStatus.lastPauseTime > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs">
                    Last updated: {formatTime(emergencyStatus.lastPauseTime)}
                  </p>

                  {emergencyStatus.expectedResolutionTime > 0 && (
                    <p className="text-xs">
                      Expected resolution: {formatTime(emergencyStatus.expectedResolutionTime)}
                      <span className="ml-2 font-medium">
                        ({getTimeUntilResolution()})
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Action recommendations based on pause level */}
              <div className="mt-3">
                {emergencyStatus.pauseLevel === PauseLevel.NONE && (
                  <p className="text-xs opacity-75">
                    All systems operational. You can proceed with transactions.
                  </p>
                )}

                {emergencyStatus.pauseLevel === PauseLevel.MINOR && (
                  <p className="text-xs opacity-75">
                    Some features may be limited. Contact support if you experience issues.
                  </p>
                )}

                {emergencyStatus.pauseLevel === PauseLevel.MAJOR && (
                  <p className="text-xs opacity-75">
                    Transaction processing may be delayed. Please wait before retrying.
                  </p>
                )}

                {emergencyStatus.pauseLevel === PauseLevel.CRITICAL && (
                  <div className="text-xs opacity-75">
                    <p className="font-medium">⚠️ Emergency Mode Active</p>
                    <p>Only critical operations allowed. New transactions blocked.</p>
                  </div>
                )}

                {emergencyStatus.pauseLevel === PauseLevel.COMPLETE && (
                  <div className="text-xs opacity-75">
                    <p className="font-medium text-red-600">🚫 SYSTEM SHUTDOWN</p>
                    <p>All operations suspended. Contact support immediately.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className={`ml-4 ${bannerStyle.textColor} opacity-60 hover:opacity-100`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="mt-2">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 bg-current opacity-20 rounded flex-1"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyModeBanner;