'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Plus, Search, Filter, AlertTriangle, Package, BarChart3, RotateCcw } from 'lucide-react';
import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import AuthGuard from '@shared/components/AuthGuard';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  lastUpdated: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock';
  recentMovements: Movement[];
}

interface Movement {
  id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  date: string;
  reason: string;
  user: string;
}

export default function SupplierInventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'inv-1',
      name: 'Organic Whole Milk',
      sku: 'MLK-ORG-001',
      category: 'Dairy',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unit: 'liters',
      lastUpdated: '2024-01-20',
      status: 'in-stock',
      recentMovements: [
        { id: 'mov-1', type: 'in', quantity: 50, date: '2024-01-20', reason: 'Supplier delivery', user: 'Admin' },
        { id: 'mov-2', type: 'out', quantity: 5, date: '2024-01-19', reason: 'Customer orders', user: 'System' }
      ]
    },
    {
      id: 'inv-2',
      name: 'Free-range Brown Eggs',
      sku: 'EGG-FR-012',
      category: 'Dairy',
      currentStock: 12,
      minStock: 24,
      maxStock: 60,
      unit: 'dozens',
      lastUpdated: '2024-01-19',
      status: 'low-stock',
      recentMovements: [
        { id: 'mov-3', type: 'out', quantity: 12, date: '2024-01-20', reason: 'Daily orders', user: 'System' },
        { id: 'mov-4', type: 'in', quantity: 24, date: '2024-01-18', reason: 'Restock', user: 'Admin' }
      ]
    },
    {
      id: 'inv-3',
      name: 'Artisan Sourdough Bread',
      sku: 'BRD-SD-001',
      category: 'Bakery',
      currentStock: 0,
      minStock: 12,
      maxStock: 30,
      unit: 'loaves',
      lastUpdated: '2024-01-20',
      status: 'out-of-stock',
      recentMovements: [
        { id: 'mov-5', type: 'out', quantity: 8, date: '2024-01-20', reason: 'Customer orders', user: 'System' }
      ]
    },
    {
      id: 'inv-4',
      name: 'Organic Mixed Vegetables',
      sku: 'VEG-ORG-001',
      category: 'Produce',
      currentStock: 150,
      minStock: 50,
      maxStock: 120,
      unit: 'bundles',
      lastUpdated: '2024-01-18',
      status: 'overstock',
      recentMovements: [
        { id: 'mov-6', type: 'in', quantity: 100, date: '2024-01-18', reason: 'Bulk purchase', user: 'Admin' }
      ]
    }
  ]);

  const calculateStatus = (current: number, min: number, max: number): 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstock' => {
    if (current <= 0) return 'out-of-stock';
    if (current <= min) return 'low-stock';
    if (current > max) return 'overstock';
    return 'in-stock';
  };

  const categories = ['all', 'Dairy', 'Bakery', 'Produce', 'Meat', 'Pantry'];
  const statuses = ['all', 'in-stock', 'low-stock', 'out-of-stock', 'overstock'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusConfig = (status: InventoryItem['status']) => {
    const configs = {
      'in-stock': { color: 'green', text: 'In Stock', icon: TrendingUp },
      'low-stock': { color: 'yellow', text: 'Low Stock', icon: AlertTriangle },
      'out-of-stock': { color: 'red', text: 'Out of Stock', icon: Minus },
      'overstock': { color: 'blue', text: 'Overstock', icon: TrendingDown }
    };
    return configs[status];
  };

  const adjustStock = (itemId: string, adjustment: number, reason: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        const newStock = item.currentStock + adjustment;
        let newStatus: InventoryItem['status'] = 'in-stock';
        
        if (newStock <= 0) newStatus = 'out-of-stock';
        else if (newStock <= item.minStock) newStatus = 'low-stock';
        else if (newStock > item.maxStock) newStatus = 'overstock';
        
        const newMovement: Movement = {
          id: `mov-${Date.now()}`,
          type: adjustment > 0 ? 'in' : adjustment < 0 ? 'out' : 'adjustment',
          quantity: Math.abs(adjustment),
          date: new Date().toISOString().split('T')[0],
          reason,
          user: 'Admin'
        };
        
        return {
          ...item,
          currentStock: Math.max(0, newStock),
          status: newStatus,
          lastUpdated: new Date().toISOString().split('T')[0],
          recentMovements: [newMovement, ...item.recentMovements].slice(0, 5)
        };
      }
      return item;
    }));
    setShowAdjustModal(false);
    setSelectedItem(null);
  };

  const stats = [
    {
      label: 'Total Items',
      value: inventory.length,
      icon: Package,
      color: 'blue' as const,
      change: `${inventory.filter(i => i.status === 'in-stock').length} in stock`
    },
    {
      label: 'Low Stock Alerts',
      value: inventory.filter(i => i.status === 'low-stock').length,
      icon: AlertTriangle,
      color: 'yellow' as const,
      change: 'Requires attention'
    },
    {
      label: 'Out of Stock',
      value: inventory.filter(i => i.status === 'out-of-stock').length,
      icon: Minus,
      color: 'red' as const,
      change: 'Immediate restock needed'
    },
    {
      label: 'Inventory Value',
      value: '$12,450',
      icon: BarChart3,
      color: 'purple' as const,
      change: 'Estimated retail value'
    }
  ];

  return (
    <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
      <SupplierPageTemplate
        title="Inventory Management"
        icon={Package}
        subtitle="Monitor stock levels, track movements, and prevent stockouts"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Search & Filters */}
        <PageSection title="Inventory Overview" subtitle="Search and filter your inventory">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        categoryFilter === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        statusFilter === status
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {status === 'all' ? 'All Status' : status.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageSection>

        {/* Inventory List */}
        <PageSection title={`Inventory Items (${filteredInventory.length})`} subtitle="Current stock levels and movements">
          <div className="space-y-4">
            <AnimatePresence>
              {filteredInventory.map((item, idx) => {
                const statusConfig = getStatusConfig(item.status);
                const StatusIcon = statusConfig.icon;
                const stockPercentage = Math.min((item.currentStock / item.maxStock) * 100, 100);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-black text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{item.sku} • {item.category}</p>
                            <Badge variant={statusConfig.color as any}>
                              <StatusIcon size={14} className="mr-1" />
                              {statusConfig.text}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-gray-900">{item.currentStock}</p>
                            <p className="text-sm text-gray-500">{item.unit}</p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Stock Level</span>
                            <span className="font-bold">
                              {item.currentStock}/{item.maxStock} {item.unit}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                stockPercentage < 20 ? 'bg-red-500' :
                                stockPercentage < 50 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${stockPercentage}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Min: {item.minStock}</span>
                            <span>Max: {item.maxStock}</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Movements</p>
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {item.recentMovements.slice(0, 3).map((movement) => (
                              <div key={movement.id} className="flex items-center justify-between text-xs">
                                <span className={`font-medium ${
                                  movement.type === 'in' ? 'text-green-600' : 
                                  movement.type === 'out' ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                  {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}
                                  {movement.quantity} {item.unit}
                                </span>
                                <span className="text-gray-500 truncate ml-2 flex-1">{movement.reason}</span>
                                <span className="text-gray-400">{movement.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 min-w-[200px]">
                        <Button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowAdjustModal(true);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl"
                        >
                          <RotateCcw size={18} className="mr-2" />
                          Adjust Stock
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => adjustStock(item.id, 1, 'Manual adjustment')}
                            variant="outline"
                            className="py-2 text-sm font-bold rounded-lg"
                          >
                            <Plus size={16} />
                          </Button>
                          <Button
                            onClick={() => adjustStock(item.id, -1, 'Manual adjustment')}
                            variant="outline"
                            className="py-2 text-sm font-bold rounded-lg"
                            disabled={item.currentStock <= 0}
                          >
                            <Minus size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredInventory.length === 0 && (
            <div className="h-96 flex flex-col items-center justify-center text-center">
              <Package size={64} className="text-gray-300 mb-4" />
              <p className="text-lg font-bold text-gray-600">No inventory items found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </PageSection>

        {/* Stock Adjustment Modal */}
        {showAdjustModal && selectedItem && (
          <StockAdjustmentModal
            item={selectedItem}
            onAdjust={adjustStock}
            onClose={() => {
              setShowAdjustModal(false);
              setSelectedItem(null);
            }}
          />
        )}
      </SupplierPageTemplate>
    </AuthGuard>
  );
}

// Stock Adjustment Modal Component
function StockAdjustmentModal({ 
  item, 
  onAdjust, 
  onClose 
}: { 
  item: InventoryItem; 
  onAdjust: (itemId: string, adjustment: number, reason: string) => void; 
  onClose: () => void; 
}) {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustment !== 0 && reason.trim()) {
      onAdjust(item.id, adjustment, reason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-black text-gray-900">Adjust Stock Level</h2>
          <p className="text-gray-600 mt-1">{item.name} ({item.sku})</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Current Stock</p>
            <p className="text-4xl font-black text-gray-900">{item.currentStock} {item.unit}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Adjustment Amount
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAdjustment(prev => prev - 1)}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={adjustment}
                onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
                className="flex-1 text-center text-2xl font-black border border-gray-300 rounded-lg py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setAdjustment(prev => prev + 1)}
                className="px-4 py-2 bg-green-100 text-green-600 rounded-lg font-bold hover:bg-green-200 transition-colors"
              >
                +
              </button>
            </div>
            {adjustment !== 0 && (
              <p className="text-center mt-2 text-sm font-bold">
                New Stock: {item.currentStock + adjustment} {item.unit}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Reason for Adjustment *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            >
              <option value="">Select a reason</option>
              <option value="Received shipment">Received shipment</option>
              <option value="Customer returns">Customer returns</option>
              <option value="Damaged goods">Damaged goods</option>
              <option value="Theft or loss">Theft or loss</option>
              <option value="Inventory correction">Inventory correction</option>
              <option value="Promotional giveaway">Promotional giveaway</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={adjustment === 0 || !reason.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold shadow-lg disabled:opacity-50"
            >
              Apply Adjustment
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}