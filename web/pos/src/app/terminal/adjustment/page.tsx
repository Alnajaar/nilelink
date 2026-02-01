'use client';

import React, { useState } from 'react';
import { usePOS } from '@/contexts/POSContext';
import {
    Settings, Package, DollarSign, AlertTriangle, Shield, FileText,
    Plus, Minus, Check, X, Lock, Unlock, Search, TrendingUp, TrendingDown
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    currentPrice: number;
    category: string;
}

interface Adjustment {
    id: string;
    type: 'inventory' | 'price' | 'void';
    product?: Product;
    oldValue: number;
    newValue: number;
    reason: string;
    requestedBy: string;
    approvedBy?: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp: Date;
    notes?: string;
}

export default function FixingAdjustmentTerminal() {
    const { engines, isInitialized } = usePOS();

    // State
    const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
    const [products, setProducts] = useState<Product[]>([
        { id: '1', name: 'Burger', sku: 'BRG001', currentStock: 45, currentPrice: 12.99, category: 'Food' },
        { id: '2', name: 'Fries', sku: 'FRY001', currentStock: 75, currentPrice: 3.99, category: 'Food' },
        { id: '3', name: 'Coke', sku: 'COK001', currentStock: 120, currentPrice: 2.99, category: 'Beverage' },
        { id: '4', name: 'Salad', sku: 'SLD001', currentStock: 30, currentPrice: 8.99, category: 'Food' },
        { id: '5', name: 'Water', sku: 'WAT001', currentStock: 200, currentPrice: 1.99, category: 'Beverage' },
    ]);

    const [adjustmentType, setAdjustmentType] = useState<'inventory' | 'price' | 'void'>('inventory');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [newValue, setNewValue] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [managerCode, setManagerCode] = useState('');
    const [showApprovalModal, setShowApprovalModal] = useState<Adjustment | null>(null);
    const [isManagerMode, setIsManagerMode] = useState(false);

    const voidReasons = [
        'Customer returned item',
        'Wrong item entered',
        'Pricing error',
        'Staff training',
        'Item damaged',
        'System error',
        'Other (see notes)'
    ];

    const inventoryAdjustmentReasons = [
        'Physical count correction',
        'Damaged goods',
        'Expired items',
        'Theft/Loss',
        'Received shipment',
        'Returns',
        'System error',
        'Other (see notes)'
    ];

    const priceAdjustmentReasons = [
        'Market price change',
        'Promotional pricing',
        'Supplier price update',
        'Seasonal adjustment',
        'System correction',
        'Competitor pricing',
        'Other (see notes)'
    ];

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingAdjustments = adjustments.filter(a => a.status === 'pending');

    const createAdjustment = () => {
        if (!selectedProduct || !newValue || !reason) {
            alert('Please fill in all required fields');
            return;
        }

        const oldValue = adjustmentType === 'inventory'
            ? selectedProduct.currentStock
            : selectedProduct.currentPrice;

        const adjustment: Adjustment = {
            id: `adj-${Date.now()}`,
            type: adjustmentType,
            product: selectedProduct,
            oldValue,
            newValue: parseFloat(newValue),
            reason,
            requestedBy: 'Current User', // Replace with actual user
            status: 'pending',
            timestamp: new Date(),
            notes
        };

        setAdjustments([adjustment, ...adjustments]);

        // Reset form
        setSelectedProduct(null);
        setNewValue('');
        setReason('');
        setNotes('');

        alert('Adjustment request submitted for manager approval');
    };

    const approveAdjustment = (adjustmentId: string) => {
        if (managerCode !== '1234') {
            alert('Invalid manager code');
            return;
        }

        const adjustment = adjustments.find(a => a.id === adjustmentId);
        if (!adjustment || !adjustment.product) return;

        // Apply the adjustment
        if (adjustment.type === 'inventory') {
            const productIndex = products.findIndex(p => p.id === adjustment.product!.id);
            if (productIndex >= 0) {
                const newProducts = [...products];
                newProducts[productIndex].currentStock = adjustment.newValue;
                setProducts(newProducts);
            }
        } else if (adjustment.type === 'price') {
            const productIndex = products.findIndex(p => p.id === adjustment.product!.id);
            if (productIndex >= 0) {
                const newProducts = [...products];
                newProducts[productIndex].currentPrice = adjustment.newValue;
                setProducts(newProducts);
            }
        }

        // Update adjustment status
        const newAdjustments = adjustments.map(a =>
            a.id === adjustmentId
                ? { ...a, status: 'approved' as const, approvedBy: 'Manager' }
                : a
        );
        setAdjustments(newAdjustments);
        setShowApprovalModal(null);
        setManagerCode('');

        alert('Adjustment approved and applied!');
    };

    const rejectAdjustment = (adjustmentId: string) => {
        const newAdjustments = adjustments.map(a =>
            a.id === adjustmentId
                ? { ...a, status: 'rejected' as const, approvedBy: 'Manager' }
                : a
        );
        setAdjustments(newAdjustments);
        setShowApprovalModal(null);
        setManagerCode('');
    };

    const getReasonOptions = () => {
        switch (adjustmentType) {
            case 'inventory':
                return inventoryAdjustmentReasons;
            case 'price':
                return priceAdjustmentReasons;
            case 'void':
                return voidReasons;
            default:
                return [];
        }
    };

    const getAdjustmentIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
        if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <div className="max-w-[1920px] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <Settings className="w-8 h-8 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Fixing & Adjustment Terminal</h1>
                            <p className="text-gray-400">Inventory corrections & price adjustments</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsManagerMode(!isManagerMode)}
                            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${isManagerMode
                                    ? 'bg-green-600 text-white'
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                }`}
                        >
                            {isManagerMode ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            <span>{isManagerMode ? 'Manager Mode' : 'Staff Mode'}</span>
                        </button>
                        {pendingAdjustments.length > 0 && (
                            <div className="bg-yellow-500/20 px-4 py-2 rounded-lg">
                                <p className="text-yellow-400 font-semibold">
                                    {pendingAdjustments.length} Pending
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Create Adjustment */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Adjustment Type */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <h2 className="text-lg font-semibold text-white mb-4">Adjustment Type</h2>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setAdjustmentType('inventory')}
                                    className={`p-4 rounded-lg border-2 transition-all ${adjustmentType === 'inventory'
                                            ? 'border-red-500 bg-red-500/20'
                                            : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                                        }`}
                                >
                                    <Package className="w-6 h-6 mx-auto mb-2 text-white" />
                                    <p className="text-white font-semibold text-sm">Inventory</p>
                                    <p className="text-xs text-gray-400">Stock count fix</p>
                                </button>
                                <button
                                    onClick={() => setAdjustmentType('price')}
                                    className={`p-4 rounded-lg border-2 transition-all ${adjustmentType === 'price'
                                            ? 'border-red-500 bg-red-500/20'
                                            : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                                        }`}
                                >
                                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-white" />
                                    <p className="text-white font-semibold text-sm">Price</p>
                                    <p className="text-xs text-gray-400">Update pricing</p>
                                </button>
                                <button
                                    onClick={() => setAdjustmentType('void')}
                                    className={`p-4 rounded-lg border-2 transition-all ${adjustmentType === 'void'
                                            ? 'border-red-500 bg-red-500/20'
                                            : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                                        }`}
                                >
                                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-white" />
                                    <p className="text-white font-semibold text-sm">Void</p>
                                    <p className="text-xs text-gray-400">Cancel transaction</p>
                                </button>
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <h2 className="text-lg font-semibold text-white mb-4">Select Product</h2>

                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name or SKU..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                                />
                            </div>

                            {/* Products Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => setSelectedProduct(product)}
                                        className={`p-3 rounded-lg border-2 text-left transition-all ${selectedProduct?.id === product.id
                                                ? 'border-red-500 bg-red-500/20'
                                                : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                                            }`}
                                    >
                                        <p className="font-semibold text-white text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-400">{product.sku}</p>
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs text-gray-300">Stock: {product.currentStock}</p>
                                            <p className="text-xs text-gray-300">Price: ${product.currentPrice.toFixed(2)}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Adjustment Details */}
                        {selectedProduct && (
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-4">
                                <h2 className="text-lg font-semibold text-white">Adjustment Details</h2>

                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-400 mb-2">Selected Product:</p>
                                    <p className="text-xl font-bold text-white">{selectedProduct.name}</p>
                                    <p className="text-sm text-gray-400">SKU: {selectedProduct.sku}</p>
                                    <div className="mt-3 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Current {adjustmentType === 'inventory' ? 'Stock' : 'Price'}</p>
                                            <p className="text-lg font-semibold text-white">
                                                {adjustmentType === 'inventory'
                                                    ? selectedProduct.currentStock
                                                    : `$${selectedProduct.currentPrice.toFixed(2)}`
                                                }
                                            </p>
                                        </div>
                                        {newValue && (
                                            <div>
                                                <p className="text-xs text-gray-500">New {adjustmentType === 'inventory' ? 'Stock' : 'Price'}</p>
                                                <p className="text-lg font-semibold text-green-400">
                                                    {adjustmentType === 'inventory'
                                                        ? newValue
                                                        : `$${parseFloat(newValue).toFixed(2)}`
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        New {adjustmentType === 'inventory' ? 'Stock Count' : 'Price'}
                                    </label>
                                    <input
                                        type="number"
                                        step={adjustmentType === 'price' ? '0.01' : '1'}
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none text-lg"
                                        placeholder={adjustmentType === 'inventory' ? 'Enter new stock count...' : 'Enter new price...'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Reason <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                                    >
                                        <option value="">Select reason...</option>
                                        {getReasonOptions().map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none"
                                        placeholder="Enter additional context..."
                                    />
                                </div>

                                <button
                                    onClick={createAdjustment}
                                    className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center space-x-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    <span>Submit for Manager Approval</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Pending Adjustments */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sticky top-4">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2" />
                                Approval Queue ({pendingAdjustments.length})
                            </h2>

                            {pendingAdjustments.length === 0 ? (
                                <div className="text-center py-12">
                                    <Check className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500">No pending adjustments</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[700px] overflow-y-auto">
                                    {pendingAdjustments.map(adjustment => (
                                        <div key={adjustment.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-white text-sm">
                                                        {adjustment.product?.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 capitalize">{adjustment.type} Adjustment</p>
                                                </div>
                                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                                    Pending
                                                </span>
                                            </div>

                                            <div className="space-y-1 mb-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-400">Old Value:</span>
                                                    <span className="text-white">
                                                        {adjustment.type === 'price' ? `$${adjustment.oldValue.toFixed(2)}` : adjustment.oldValue}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-400">New Value:</span>
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-green-400 font-semibold">
                                                            {adjustment.type === 'price' ? `$${adjustment.newValue.toFixed(2)}` : adjustment.newValue}
                                                        </span>
                                                        {getAdjustmentIcon(adjustment.newValue - adjustment.oldValue)}
                                                    </div>
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-slate-600">
                                                    <p className="text-xs text-gray-400">Reason:</p>
                                                    <p className="text-xs text-white">{adjustment.reason}</p>
                                                </div>
                                                {adjustment.notes && (
                                                    <div className="mt-1">
                                                        <p className="text-xs text-gray-400">Notes:</p>
                                                        <p className="text-xs text-white">{adjustment.notes}</p>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500 mt-2">
                                                    By: {adjustment.requestedBy} • {adjustment.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>

                                            {isManagerMode && (
                                                <button
                                                    onClick={() => setShowApprovalModal(adjustment)}
                                                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                                                >
                                                    Review & Approve
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recent History */}
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent History</h3>
                                <div className="space-y-2">
                                    {adjustments
                                        .filter(a => a.status !== 'pending')
                                        .slice(0, 5)
                                        .map(adjustment => (
                                            <div key={adjustment.id} className="bg-slate-700/30 rounded p-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-white">{adjustment.product?.name}</p>
                                                    <span className={`text-xs ${adjustment.status === 'approved' ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                        {adjustment.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">{adjustment.timestamp.toLocaleDateString()}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Manager Approval Modal */}
                {showApprovalModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                                <Shield className="w-6 h-6 mr-2 text-green-400" />
                                Manager Approval Required
                            </h2>

                            <div className="bg-slate-700/50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-gray-400 mb-2">Product:</p>
                                <p className="text-lg font-semibold text-white">{showApprovalModal.product?.name}</p>
                                <p className="text-sm text-gray-400 mt-3">Type: <span className="text-white capitalize">{showApprovalModal.type}</span></p>
                                <p className="text-sm text-gray-400">Change: <span className="text-red-400">{showApprovalModal.oldValue}</span> → <span className="text-green-400">{showApprovalModal.newValue}</span></p>
                                <p className="text-sm text-gray-400 mt-2">Reason: <span className="text-white">{showApprovalModal.reason}</span></p>
                            </div>

                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Manager Code
                            </label>
                            <input
                                type="password"
                                value={managerCode}
                                onChange={(e) => setManagerCode(e.target.value)}
                                placeholder="Enter manager code..."
                                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-green-500 focus:outline-none mb-4"
                                autoFocus
                            />

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => rejectAdjustment(showApprovalModal.id)}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <X className="w-5 h-5" />
                                    <span>Reject</span>
                                </button>
                                <button
                                    onClick={() => approveAdjustment(showApprovalModal.id)}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Check className="w-5 h-5" />
                                    <span>Approve</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
