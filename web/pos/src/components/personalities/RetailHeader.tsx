// Retail POS Header Component
// Scanner-focused with customer loyalty, promotions, and quick checkout

import React, { useState, useEffect } from 'react';
import { usePOSPersonality, POSMode } from '../../lib/ui/AdaptivePOSPersonality';
import { eventBus, EventTypes } from '../../lib/core/EventBus';

interface RetailHeaderProps {
  customer?: {
    id: string;
    name: string;
    loyaltyPoints: number;
    membershipLevel: string;
  };
  onCustomerSelect: () => void;
  onScanModeToggle: (enabled: boolean) => void;
  scanModeEnabled: boolean;
  className?: string;
}

const RetailHeader: React.FC<RetailHeaderProps> = ({
  customer,
  onCustomerSelect,
  onScanModeToggle,
  scanModeEnabled,
  className = ''
}) => {
  const { personality, mode, setMode, posEngine } = usePOSPersonality();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activePromotions, setActivePromotions] = useState(0);
  const [lowStockAlerts, setLowStockAlerts] = useState(0);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Listen for promotion updates
    const unsubscribePromos = eventBus.subscribe('PROMOTIONS_UPDATE', (event) => {
      setActivePromotions(event.payload.count);
    });

    // Listen for inventory alerts
    const unsubscribeAlerts = eventBus.subscribe('INVENTORY_ALERTS_UPDATE', (event) => {
      setLowStockAlerts(event.payload.lowStockCount);
    });

    return () => {
      clearInterval(timer);
      unsubscribePromos();
      unsubscribeAlerts();
    };
  }, []);

  const modeButtons = [
    { mode: POSMode.SALE, label: 'Sale', icon: '💰' },
    { mode: POSMode.RETURN, label: 'Return', icon: '↩️' },
    { mode: POSMode.VOID, label: 'Void', icon: '❌' },
    { mode: POSMode.HOLD, label: 'Hold', icon: '⏸️' }
  ];

  const quickActions = [
    { id: 'scan', label: 'Scan', icon: '📱', shortcut: 'F1' },
    { id: 'search', label: 'Search', icon: '🔍', shortcut: 'F2' },
    { id: 'customer', label: 'Customer', icon: '👤', shortcut: 'F5' },
    { id: 'loyalty', label: 'Loyalty', icon: '⭐', shortcut: 'F6' },
    { id: 'discount', label: 'Discount', icon: '🏷️', shortcut: 'F7' },
    { id: 'payment', label: 'Payment', icon: '💳', shortcut: 'F8' }
  ];

  const getMembershipColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'gold': return 'text-yellow-400 bg-yellow-900';
      case 'silver': return 'text-gray-300 bg-gray-700';
      case 'bronze': return 'text-orange-400 bg-orange-900';
      default: return 'text-purple-400 bg-purple-900';
    }
  };

  return (
    <header className={`bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Business Info & Status */}
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-xl font-bold">Retail POS</h1>
              <p className="text-purple-200 text-sm">
                {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-3">
              {activePromotions > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-900 bg-opacity-50 text-green-300">
                  <span>🏷️</span>
                  <span className="text-sm font-medium">{activePromotions} Active</span>
                </div>
              )}

              {lowStockAlerts > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-900 bg-opacity-50 text-red-300">
                  <span>⚠️</span>
                  <span className="text-sm font-medium">{lowStockAlerts} Low Stock</span>
                </div>
              )}

              {scanModeEnabled && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900 bg-opacity-50 text-blue-300">
                  <span>📱</span>
                  <span className="text-sm font-medium">Scan Mode</span>
                </div>
              )}
            </div>
          </div>

          {/* Center Section - Customer & Loyalty */}
          <div className="flex items-center space-x-4">
            {/* Customer Section */}
            <div className="flex items-center space-x-3">
              {customer ? (
                <div className="flex items-center space-x-3 bg-black bg-opacity-20 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">👤</span>
                    <div>
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-purple-200">
                        {customer.loyaltyPoints.toLocaleString()} pts • {customer.membershipLevel}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getMembershipColor(customer.membershipLevel)}`}>
                    {customer.membershipLevel}
                  </span>
                </div>
              ) : (
                <button
                  onClick={onCustomerSelect}
                  className="flex items-center space-x-2 bg-black bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <span>👤</span>
                  <span>Add Customer</span>
                </button>
              )}

              {/* Loyalty Quick Actions */}
              {customer && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => eventBus.publish({ type: 'APPLY_LOYALTY_POINTS', payload: { customerId: customer.id } })}
                    className="bg-black bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
                    title="Apply Loyalty Points"
                  >
                    ⭐
                  </button>
                  <button
                    onClick={() => eventBus.publish({ type: 'VIEW_LOYALTY_HISTORY', payload: { customerId: customer.id } })}
                    className="bg-black bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
                    title="Loyalty History"
                  >
                    📊
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - POS Mode & Quick Actions */}
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
                      : 'text-purple-200 hover:text-white hover:bg-white hover:bg-opacity-10'
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
                        onScanModeToggle(!scanModeEnabled);
                        break;
                      case 'search':
                        eventBus.publish({ type: 'OPEN_PRODUCT_SEARCH', payload: {} });
                        break;
                      case 'customer':
                        onCustomerSelect();
                        break;
                      case 'loyalty':
                        eventBus.publish({ type: 'OPEN_LOYALTY_PANEL', payload: {} });
                        break;
                      case 'discount':
                        eventBus.publish({ type: 'OPEN_DISCOUNT_PANEL', payload: {} });
                        break;
                      case 'payment':
                        eventBus.publish({ type: 'INITIATE_PAYMENT', payload: {} });
                        break;
                    }
                  }}
                  className="flex flex-col items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200 min-w-[60px]"
                  title={`${action.label} (${action.shortcut})`}
                >
                  <span className="text-lg mb-1">{action.icon}</span>
                  <span className="text-xs">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex items-center justify-between text-sm text-purple-200">
          <div className="flex items-center space-x-6">
            <span>Staff: Jane Smith 👤</span>
            <span>Register: #3 🏪</span>
            <span>Transactions Today: 89 📊</span>
            <span>Avg Transaction: $24.50 💰</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Network: Online 🟢</span>
            <span>Scanner: Connected 📱</span>
            <span>Card Reader: Ready 💳</span>
            <span>Last Sync: 5m ago 🔄</span>
          </div>
        </div>

        {/* Scan Mode Banner */}
        {scanModeEnabled && (
          <div className="mt-4 bg-blue-900 bg-opacity-50 border border-blue-400 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📱</span>
                <span className="font-medium">Scan Mode Active</span>
              </div>
              <div className="text-sm text-blue-200">
                Point scanner at barcode or enter manually • Press ESC to exit
              </div>
              <button
                onClick={() => onScanModeToggle(false)}
                className="bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded text-sm transition-colors duration-200"
              >
                Exit Scan Mode
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default RetailHeader;