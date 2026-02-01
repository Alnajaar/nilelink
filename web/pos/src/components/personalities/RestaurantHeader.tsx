// Restaurant POS Header Component
// Table service focused with order types, table management, and kitchen status

import React, { useState, useEffect } from 'react';
import { usePOSPersonality, POSMode } from '../../lib/ui/AdaptivePOSPersonality';
import { eventBus, EventTypes } from '../../lib/core/EventBus';

interface RestaurantHeaderProps {
  currentTable?: string;
  orderType: 'dine_in' | 'takeout' | 'delivery';
  onOrderTypeChange: (type: 'dine_in' | 'takeout' | 'delivery') => void;
  onTableSelect: (tableId: string) => void;
  className?: string;
}

const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({
  currentTable,
  orderType,
  onOrderTypeChange,
  onTableSelect,
  className = ''
}) => {
  const { personality, mode, setMode, posEngine } = usePOSPersonality();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [kitchenStatus, setKitchenStatus] = useState<'normal' | 'busy' | 'offline'>('normal');
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Listen for kitchen status updates
    const unsubscribe = eventBus.subscribe('KITCHEN_STATUS_UPDATE', (event) => {
      setKitchenStatus(event.payload.status);
    });

    // Listen for pending orders count
    const unsubscribeOrders = eventBus.subscribe('PENDING_ORDERS_UPDATE', (event) => {
      setPendingOrders(event.payload.count);
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
      unsubscribeOrders();
    };
  }, []);

  const orderTypes = [
    { id: 'dine_in', label: 'Dine In', icon: '🍽️', color: 'bg-orange-500' },
    { id: 'takeout', label: 'Takeout', icon: '🥡', color: 'bg-blue-500' },
    { id: 'delivery', label: 'Delivery', icon: '🚚', color: 'bg-green-500' }
  ];

  const modeButtons = [
    { mode: POSMode.SALE, label: 'Sale', icon: '💰' },
    { mode: POSMode.RETURN, label: 'Return', icon: '↩️' },
    { mode: POSMode.VOID, label: 'Void', icon: '❌' },
    { mode: POSMode.HOLD, label: 'Hold', icon: '⏸️' }
  ];

  const getKitchenStatusColor = () => {
    switch (kitchenStatus) {
      case 'normal': return 'text-green-400';
      case 'busy': return 'text-yellow-400';
      case 'offline': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getKitchenStatusIcon = () => {
    switch (kitchenStatus) {
      case 'normal': return '👨‍🍳';
      case 'busy': return '🔥';
      case 'offline': return '❌';
      default: return '👨‍🍳';
    }
  };

  return (
    <header className={`bg-gradient-to-r from-orange-600 to-orange-800 text-white shadow-lg ${className}`}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Business Info & Time */}
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-xl font-bold">Restaurant POS</h1>
              <p className="text-orange-200 text-sm">
                {currentTime.toLocaleDateString()} • {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>

            {/* Kitchen Status */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-black bg-opacity-20 ${getKitchenStatusColor()}`}>
              <span className="text-lg">{getKitchenStatusIcon()}</span>
              <span className="text-sm font-medium capitalize">{kitchenStatus}</span>
              {pendingOrders > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingOrders}
                </span>
              )}
            </div>
          </div>

          {/* Center Section - Order Type & Table Selection */}
          <div className="flex items-center space-x-4">
            {/* Order Type Buttons */}
            <div className="flex bg-black bg-opacity-20 rounded-lg p-1">
              {orderTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onOrderTypeChange(type.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                    orderType === type.id
                      ? `${type.color} text-white shadow-lg`
                      : 'text-orange-200 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Table Selection (only for dine-in) */}
            {orderType === 'dine_in' && (
              <div className="flex items-center space-x-2">
                <span className="text-orange-200">Table:</span>
                <button
                  onClick={() => {/* Open table selector */}}
                  className="bg-black bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-200"
                >
                  {currentTable || 'Select Table'} 🪑
                </button>
              </div>
            )}
          </div>

          {/* Right Section - Mode Buttons & Actions */}
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
                      : 'text-orange-200 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <span>{button.icon}</span>
                  <span>{button.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => eventBus.publish({ type: 'OPEN_MODIFIERS', payload: {} })}
                className="bg-black bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
                title="Modifiers"
              >
                ⚙️
              </button>
              <button
                onClick={() => eventBus.publish({ type: 'OPEN_CUSTOMER_DISPLAY', payload: {} })}
                className="bg-black bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
                title="Customer Display"
              >
                🖥️
              </button>
              <button
                onClick={() => eventBus.publish({ type: 'OPEN_KITCHEN_DISPLAY', payload: {} })}
                className="bg-black bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all duration-200"
                title="Kitchen Display"
              >
                👨‍🍳
              </button>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex items-center justify-between text-sm text-orange-200">
          <div className="flex items-center space-x-6">
            <span>Staff: John Doe 👤</span>
            <span>Shift: Morning 🌅</span>
            <span>Transactions Today: 47 📊</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Network: Online 🟢</span>
            <span>Hardware: Connected 🔗</span>
            <span>Last Backup: 2h ago 💾</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RestaurantHeader;