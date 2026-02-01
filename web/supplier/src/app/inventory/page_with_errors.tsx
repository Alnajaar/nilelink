'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Plus, Search, AlertTriangle, Package, BarChart3, RotateCcw } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Card } from '@shared/components/Card';
import AuthGuard from '@shared/components/AuthGuard';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';
import { useNotifications } from '@shared/contexts/NotificationContext';
import graphService from '@shared/services/GraphService';
import ipfsService from '@shared/services/IPFSService';

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
  const { user } = useAuth();
  const { addNotification: notify } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load inventory data from blockchain/IPFS
  useEffect(() => {
    const loadInventory = async () => {
      if (!user?.walletAddress) return;
      
      try {
        setLoading(true);
        
        // 1. Fetch Supplier Profile from The Graph
        const suppliers = await graphService.getSuppliers(1, 0, { id: user.walletAddress.toLowerCase() });
        const supplier = suppliers?.suppliers?.[0];
        
        if (supplier) {
          // 2. Fetch Inventory from IPFS via metadataCid
          if (supplier.metadataCid) {
            const metadata = await ipfsService.getJSONContent(supplier.metadataCid);
            if (metadata?.inventory) {
              setInventory(metadata.inventory.map((item: any) => ({
                ...item,
                id: item.id,
                name: item.name,
                sku: item.sku,
                category: item.category || 'General',
                currentStock: item.current || item.stock || 0,
                minStock: item.min || item.minStock || 10,
                maxStock: item.max || item.maxStock || 100,
                unit: item.unit || 'units',
                lastUpdated: item.lastUpdated || new Date().toISOString().split('T')[0],
                status: calculateStatus(item.current || item.stock || 0, item.min || item.minStock || 10, item.max || item.maxStock || 100),
                recentMovements: item.movements || []
              })));
            } else {
              // If no inventory in IPFS, initialize with empty array
              setInventory([]);
            }
          } else {
            // If no metadataCid, initialize with empty array
            setInventory([]);
          }
        } else {
          // If no supplier found, initialize with empty array
          setInventory([]);
        }
      } catch (error) {
        console.error('Failed to load inventory from blockchain/IPFS:', error);
        notify({ type: 'warning', title: 'Load Error', message: 'Failed to load inventory data from blockchain. Showing empty inventory.' });
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadInventory();
  }, [user, notify]);

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
      'low-stock': { color: 'amber', text: 'Low Stock', icon: AlertTriangle },
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

  if (loading) {
    return (
      <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory data from blockchain...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-50 antialiased">
        <main className="max-w-7xl mx-auto px-6 py-8 w-full">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Inventory Management
              </h1>
              <p className="text-slate-600 font-medium">Monitor stock levels, track movements, and prevent stockouts</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="p-6 border-2 border-slate-200 bg-white shadow-sm flex flex-col justify-between group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-6">
                      <Icon size={24} />
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{stat.label}</h4>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter italic mb-4">{stat.value}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{stat.change}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Search & Filters */}
          <Card className="p-6 mb-12 border-2 border-slate-200 bg-white shadow-sm">
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
          </Card>

          {/* Inventory List */}
          <Card className="p-6 border-2 border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Inventory Items ({filteredInventory.length})</h2>
            </div>
            
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
          </Card>

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
        </main>
      </div>
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