"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package } from 'lucide-react';
import { usePOS } from '@/contexts/POSContext';
import { eventBus } from '@/lib/core/EventBus';
import { productInventoryEngine, Product } from '@/lib/core/ProductInventoryEngine';
import { POSButton } from '../POSButton';
import { InventoryGrid } from '../inventory/InventoryGrid';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

export function RetailPersonality() {
    const { branchId, engines } = usePOS();
    const router = useRouter();
    const [cart, setCart] = useState<any[]>([]);
    const [scanBuffer, setScanBuffer] = useState('');
    const scanInputRef = useRef<HTMLInputElement>(null);

    // Synchronize local cart with POSEngine transaction
    useEffect(() => {
        const syncCart = () => {
            const txn = engines.posEngine?.getCurrentTransaction();
            if (txn) {
                const mappedItems = txn.items.map(item => ({
                    id: item.productId,
                    sku: item.metadata.variantName || item.productId,
                    name: item.metadata.productName,
                    price: item.unitPrice,
                    qty: item.quantity
                }));
                setCart(mappedItems);
            } else {
                setCart([]);
            }
        };

        syncCart();
        const subId = eventBus.subscribe('TRANSACTION_ITEM_ADDED', syncCart);
        return () => {
            eventBus.unsubscribe(subId);
        };
    }, [engines.posEngine]);

    // Auto-focus on scan field
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.activeElement?.tagName !== 'INPUT') {
                scanInputRef.current?.focus();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const updateCartQty = async (itemId: string, delta: number) => {
        if (!engines.posEngine) return;
        
        const txn = engines.posEngine.getCurrentTransaction();
        if (!txn) return;

        const item = txn.items.find((i: any) => i.productId === itemId);
        if (!item) return;

        const newQty = item.quantity + delta;
        
        try {
            if (newQty <= 0) {
                await engines.posEngine.removeItem(itemId);
            } else {
                await engines.posEngine.updateItemQuantity(itemId, newQty);
            }
        } catch (error) {
            console.error('Failed to update cart quantity:', error);
        }
    };

    const handleScan = async (e: React.FormEvent) => {

        // Search for product by SKU or Barcode
        const products = productInventoryEngine.searchProducts({ searchTerm: scanBuffer, limit: 1 });
        const product = products[0];

        if (product) {
            try {
                if (!engines.posEngine.getCurrentTransaction()) {
                    await engines.posEngine.startTransaction('sale');
                }

                await engines.posEngine.addItem(product.id, 1, product.variants[0]?.id);

                eventBus.publish({
                    type: 'PRODUCT_SCANNED',
                    payload: { product, sku: scanBuffer },
                    metadata: {
                        source: 'RETAIL_UI'
                    }
                });
            } catch (error) {
                console.error('Scan processing failed:', error);
            }
        } else {
            console.warn(`Product with SKU/Barcode ${scanBuffer} not found`);
        }

        setScanBuffer('');
    };

    const cartTotal = cart.reduce((acc, item) => acc + parseFloat(item.price) * item.qty, 0);

    return (
        <ErrorBoundary context="Retail Personality">
            <div className="min-h-screen bg-[var(--pos-bg-primary)] text-[var(--pos-text-primary)] flex flex-col overflow-hidden combat-bg font-mono">
            {/* Supermarket HUD */}
            <header className="sticky top-0 z-40 bg-[var(--pos-bg-secondary)] border-b border-[var(--pos-border-subtle)] h-20 shadow-[var(--pos-shadow-sm)]">
                <div className="h-full px-8 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black uppercase tracking-tighter">RETAIL TERMINAL</h1>
                            <span className="text-[8px] font-black text-[var(--pos-accent)] uppercase tracking-[0.4em]">STATION-7 // {branchId}</span>
                        </div>

                        {/* Always-Focused Scan Field */}
                        <form onSubmit={handleScan} className="relative group min-w-[400px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pos-accent)] opacity-50" size={16} />
                            <input
                                ref={scanInputRef}
                                type="text"
                                placeholder="WAITING FOR SCAN..."
                                value={scanBuffer}
                                onChange={(e) => setScanBuffer(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-[var(--pos-bg-primary)] border border-[var(--pos-border-strong)] rounded-lg focus:outline-none focus:border-[var(--pos-accent)] text-sm font-black tracking-widest uppercase placeholder:opacity-30"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px]">ENTER</kbd>
                            </div>
                        </form>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] text-[var(--pos-text-muted)] font-black uppercase tracking-widest mb-1">TOTAL DUE</span>
                            <span className="text-3xl font-black text-[var(--pos-accent)] italic leading-none">${cartTotal.toFixed(2)}</span>
                        </div>
                        <POSButton 
                            variant="primary" 
                            size="md" 
                            className="h-14 px-10 font-black uppercase"
                            disabled={cart.length === 0}
                            onClick={() => router.push('/terminal/payment')}
                        >
                            PAY [F12]
                        </POSButton>
                    </div>
                </div>
            </header>

            {/* Dense Ledger Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Main Ledger */}
                <div className="flex-1 p-6 overflow-y-auto no-scrollbar">
                    <div className="combat-glass rounded-xl border border-[var(--pos-border-subtle)] overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[var(--pos-bg-tertiary)] text-[10px] font-black text-[var(--pos-text-muted)] uppercase tracking-widest">
                                <tr>
                                    <th className="p-4">SKU / ITEM</th>
                                    <th className="p-4">PRICE</th>
                                    <th className="p-4">QTY</th>
                                    <th className="p-4">ACTION</th>
                                    <th className="p-4 text-right">SUBTOTAL</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--pos-border-subtle)]">
                                {cart.map((item) => (
                                    <tr key={item.id} className="text-xs font-bold hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span>{item.name}</span>
                                                <span className="text-[9px] text-[var(--pos-text-muted)] mt-1">{item.sku}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">${item.price}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10">-</button>
                                                <span className="w-4 text-center">{item.qty}</span>
                                                <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10">+</button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => engines.posEngine?.removeItem(item.id)}
                                                className="text-[var(--pos-danger)] hover:underline font-black uppercase text-[9px] tracking-widest"
                                            >
                                                VOID
                                            </button>
                                        </td>
                                        <td className="p-4 text-right text-[var(--pos-accent)]">${(item.price * item.qty).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {cart.length === 0 && (
                            <div className="p-20 text-center">
                                <Package size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="text-[10px] uppercase font-black tracking-[0.5em] opacity-30">Waiting for first input...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vertical Control Sidebar - Real-time Inventory Integration */}
                <InventoryGrid />
            </div>
            </div>
        </ErrorBoundary>
    );
}
