// Supermarket POS Header Component
// Security-focused with weight scanning, bulk operations, and manager oversight

import React, { useState, useEffect } from 'react';
import { usePOSPersonality, POSMode } from '../../lib/ui/AdaptivePOSPersonality';
import { eventBus, EventTypes } from '../../lib/core/EventBus';

interface SupermarketHeaderProps {
  securityMode: 'normal' | 'heightened' | 'lockdown';
  weightMode: boolean;
  bulkMode: boolean;
  onSecurityModeChange: (mode: 'normal' | 'heightened' | 'lockdown') => void;
  onWeightModeToggle: () => void;
  onBulkModeToggle: () => void;
  onManagerOverride: () => void;
  className?: string;
}

const SupermarketHeader: React.FC<SupermarketHeaderProps> = ({
  securityMode,
  weightMode,
  bulkMode,
  onSecurityModeChange,
  onWeightModeToggle,
  onBulkModeToggle,
  onManagerOverride,
  className = ''
}) => {
  const { personality, mode, setMode, posEngine } = usePOSPersonality();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeCameras, setActiveCameras] = useState(4);
  const [securityAlerts, setSecurityAlerts] = useState(0);
  const [weightStable, setWeightStable] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [bulkItems, setBulkItems] = useState(0);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Listen for security events
    const unsubscribeSecurity = eventBus.subscribe('SECURITY_ALERT', (event) => {
      setSecurityAlerts(prev => prev + 1);
    });

    // Listen for weight data
    const unsubscribeWeight = eventBus.subscribe('HARDWARE_DATA_SCALE', (event) => {
      const { data } = event.payload;
      setCurrentWeight(data.weight);
      setWeightStable(data.stable);
    });

    return () => {
      clearInterval(timer);
      unsubscribeSecurity();
      unsubscribeWeight();
    };
  }, []);

  const modeButtons = [
    { mode: POSMode.SALE, label: 'Sale', icon: '💰' },
    { mode: POSMode.RETURN, label: 'Return', icon: '↩️' },
    { mode: POSMode.VOID, label: 'Void', icon: '❌' },
    { mode: POSMode.HOLD, label: 'Hold', icon: '⏸️' }
  ];

  const securityModes = [
    { mode: 'normal', label: 'Normal', icon: '🟢', color: 'text-green-400' },
    { mode: 'heightened', label: 'Heightened', icon: '🟡', color: 'text-yellow-400' },
    { mode: 'lockdown', label: 'Lockdown', icon: '🔴', color: 'text-red-400' }
  ];

  const quickActions = [
    { id: 'scan', label: 'Scan', icon: '📱', shortcut: 'F1' },
    { id: 'weight', label: 'Weight', icon: '⚖️', shortcut: 'F2' },
    { id: 'bulk', label: 'Bulk', icon: '📦', shortcut: 'F3' },
    { id: 'security', label: 'Security', icon: '🔒', shortcut: 'F7' },
    { id: 'manager', label: 'Manager', icon: '👨‍💼', shortcut: 'F11' },
    { id: 'reports', label: 'Reports', icon: '📊', shortcut: 'F12' }
  ];

  const getSecurityModeColor = (mode: string) => {
    switch (mode) {
      case 'normal': return 'bg-green-900 bg-opacity-50 border-green-400';
      case 'heightened': return 'bg-yellow-900 bg-opacity-50 border-yellow-400';
      case 'lockdown': return 'bg-red-900 bg-opacity-50 border-red-400';
      default: return 'bg-gray-900 bg-opacity-50 border-gray-400';
    }
  };

  return (
    <header className={`bg-gradient-to-r from-green-600 to-green-800 text-white shadow-lg ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Business Info & Security Status */}
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-xl font-bold">Supermarket POS</h1>
              <p className="text-green-200 text-sm">
                {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>

            {/* Security Status */}
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg border ${getSecurityModeColor(securityMode)}`}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {securityModes.find(m => m.mode === securityMode)?.icon}
                </span>
                <div>
                  <p className="text-sm font-medium capitalize">{securityMode} Security</p>
                  <p className="text-xs text-green-200">
                    {activeCameras} cameras • {securityAlerts} alerts
                  </p>
                </div>
              </div>

              {securityAlerts > 0 && (
                <button
                  onClick={() => setSecurityAlerts(0)}
                  className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs transition-colors duration-200"
                >
                  Clear ({securityAlerts})
                </button>
              )}
            </div>

            {/* Weight Display */}
            {weightMode && (
              <div className="flex items-center space-x-3 bg-black bg-opacity-20 rounded-lg px-4 py-2">
                <span className="text-lg">⚖️</span>
                <div>
                  <p className="text-sm font-medium">
                    {currentWeight.toFixed(2)} kg
                  </p>
                  <p className={`text-xs ${weightStable ? 'text-green-400' : 'text-yellow-400'}`}>
                    {weightStable ? 'Stable' : 'Measuring...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Center Section - Mode Controls & Special Modes */}
          <div className="flex items-center space-x-4">
            {/* Special Modes */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onWeightModeToggle}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  weightMode
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-black bg-opacity-20 text-green-200 hover:bg-opacity-30'
                }`}
              >
                <span>⚖️</span>
                <span className="text-sm">Weight Mode</span>
              </button>

              <button
                onClick={onBulkModeToggle}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  bulkMode
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-black bg-opacity-20 text-green-200 hover:bg-opacity-30'
                }`}
              >
                <span>📦</span>
                <span className="text-sm">Bulk Mode</span>
                {bulkMode && bulkItems > 0 && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                    {bulkItems}
                  </span>
                )}
              </button>
            </div>

            {/* Security Mode Selector */}
            <div className="flex bg-black bg-opacity-20 rounded-lg p-1">
              {securityModes.map((secMode) => (
                <button
                  key={secMode.mode}
                  onClick={() => onSecurityModeChange(secMode.mode as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                    securityMode === secMode.mode
                      ? 'bg-white bg-opacity-20 text-white shadow-lg'
                      : 'text-green-200 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <span>{secMode.icon}</span>
                  <span>{secMode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Section - POS Mode & Actions */}
          <div className="flex items-center space-x-3">
            {/* POS Mode Buttons */}
            <div className="flex bg-black bg-opacity-20 rounded-lg p-1">
              {modeButtons.map((button) => (
                <button
                  key={button.mode}
                  onClick={() => setMode(button.mode)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                    mode === button.mode
                      ? 'bg-white bg-opacity-20 text-white shadow-lg'
                      : 'text-green-200 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <span>{button.icon}</span>
                  <span>{button.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-1">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    switch (action.id) {
                      case 'scan':
                        eventBus.publish({ type: 'TOGGLE_SCAN_MODE', payload: {} });
                        break;
                      case 'weight':
                        onWeightModeToggle();
                        break;
                      case 'bulk':
                        onBulkModeToggle();
                        break;
                      case 'security':
                        onSecurityModeChange(securityMode === 'normal' ? 'heightened' : 'normal');
                        break;
                      case 'manager':
                        onManagerOverride();
                        break;
                      case 'reports':
                        eventBus.publish({ type: 'OPEN_REPORTS_PANEL', payload: {} });
                        break;
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                    action.id === 'security' && securityMode !== 'normal'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-black bg-opacity-20 hover:bg-opacity-30'
                  }`}
                  title={`${action.label} (${action.shortcut})`}
                >
                  <span className="text-lg mb-1">{action.icon}</span>
                  <span className="text-xs">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Manager Override Button */}
            <button
              onClick={onManagerOverride}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Manager Override
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex items-center justify-between text-sm text-green-200">
          <div className="flex items-center space-x-6">
            <span>Staff: Mike Johnson 👤</span>
            <span>Register: Express #5 🏪</span>
            <span>Transactions Today: 156 📊</span>
            <span>Avg Transaction: $67.20 💰</span>
            <span>Security Rating: A+ 🛡️</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Network: Secure 🟢</span>
            <span>Scanner: Active 📱</span>
            <span>Scale: Calibrated ⚖️</span>
            <span>EAS Gates: Armed 🔒</span>
            <span>Last Audit: 2h ago 📋</span>
          </div>
        </div>

        {/* Security Alert Banner */}
        {securityMode === 'lockdown' && (
          <div className="mt-4 bg-red-900 bg-opacity-50 border border-red-400 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🚨</span>
                <span className="font-bold text-red-200">SECURITY LOCKDOWN ACTIVE</span>
              </div>
              <div className="text-sm text-red-200">
                All transactions suspended • Manager authorization required
              </div>
              <button
                onClick={() => onSecurityModeChange('heightened')}
                className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
              >
                Deactivate Lockdown
              </button>
            </div>
          </div>
        )}

        {/* Bulk Mode Banner */}
        {bulkMode && (
          <div className="mt-4 bg-purple-900 bg-opacity-50 border border-purple-400 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📦</span>
                <span className="font-medium">Bulk Purchase Mode</span>
              </div>
              <div className="text-sm text-purple-200">
                Scanning multiple items • {bulkItems} items in batch
              </div>
              <button
                onClick={onBulkModeToggle}
                className="bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded text-sm transition-colors duration-200"
              >
                Complete Batch
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default SupermarketHeader;