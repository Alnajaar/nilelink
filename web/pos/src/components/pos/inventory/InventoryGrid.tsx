"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertTriangle, TrendingDown, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { eventBus } from '@/lib/core/EventBus';
import { productInventoryEngine, InventoryAlert } from '@/lib/core/ProductInventoryEngine';
import { POSCard } from '../POSCard';
import { POSButton } from '../POSButton';

interface InventoryItem {
    id: string;
    name: string;
    stock: number;
    minStock: number;
    expiryDate?: string;
    category: string;
}

export function InventoryGrid() {
    const [alerts, setAlerts] = useState<InventoryAlert[]>([]);

    useEffect(() => {
        const loadAlerts = () => {
            const currentAlerts = productInventoryEngine.getAlerts({ acknowledged: false });
            setAlerts(currentAlerts);
        };

        loadAlerts();

        // Subscribe to alerts
        const subId = eventBus.subscribe('INVENTORY_ALERT', () => {
            loadAlerts();
        });

        return () => {
            eventBus.unsubscribe(subId);
        };
    }, []);

    const getStockColor = (stock: number, min: number) => {
        if (stock <= min / 2) return 'text-[var(--pos-danger)]';
        if (stock <= min) return 'text-[var(--pos-warning)]';
        return 'text-[var(--pos-success)]';
    };

    const isExpiringSoon = (date?: string) => {
        if (!date) return false;
        const expiry = new Date(date);
        const today = new Date();
        const diffData = expiry.getTime() - today.getTime();
        return diffData < (1000 * 60 * 60 * 24); // Less than 24h
    };

    return (
        <div className="flex flex-col h-full bg-[var(--pos-bg-secondary)] border-l border-[var(--pos-border-subtle)] w-80">
            <div className="p-6 border-b border-[var(--pos-border-subtle)] bg-[var(--pos-bg-tertiary)]">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black uppercase tracking-tight text-xs">Floor Inventory</h3>
                    <Package size={14} className="text-[var(--pos-accent)]" />
                </div>
                <p className="text-[10px] font-bold text-[var(--pos-text-muted)] uppercase tracking-widest">Real-time Station-7</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {alerts.map((alert) => {
                    const product = productInventoryEngine.getProduct(alert.productId);
                    const severityColor = alert.severity === 'critical' ? 'text-[var(--pos-danger)]' : 'text-[var(--pos-warning)]';

                    return (
                        <POSCard
                            key={alert.id}
                            variant="elevated"
                            padding="sm"
                            className={`border-l-4 ${alert.severity === 'critical' ? 'border-l-[var(--pos-danger)]' : 'border-l-[var(--pos-warning)]'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-black uppercase tracking-tight truncate w-32">{product?.name || 'Unknown Product'}</span>
                                <div className={`text-[10px] font-black uppercase italic ${severityColor}`}>
                                    {alert.type.replace('_', ' ')}
                                </div>
                            </div>

                            <p className="text-[8px] text-[var(--pos-text-muted)] uppercase mb-2 leading-tight">
                                {alert.message}
                            </p>

                            <POSButton
                                variant="outline"
                                size="sm"
                                fullWidth
                                className="h-8 text-[8px] border-dashed"
                                onClick={() => {
                                    eventBus.publish({
                                        type: 'RESTOCK_REQUESTED',
                                        payload: { alert },
                                        metadata: {
                                            source: 'POS_INVENTORY_WIDGET'
                                        }
                                    });
                                }}
                            >
                                <Zap size={10} className="mr-2" />
                                ACKNOWLEDGE & RESTOCK
                            </POSButton>
                        </POSCard>
                    );
                })}
                {alerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 opacity-20">
                        <CheckCircle2 size={32} className="mb-2" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Inventory Stable</span>
                    </div>
                )}
            </div>

            <div className="p-4 bg-[var(--pos-bg-tertiary)] border-t border-[var(--pos-border-subtle)]">
                <div className="text-[8px] font-black text-[var(--pos-text-muted)] uppercase tracking-[0.3em] text-center italic">
                    SYNCED WITH LOCAL LEDGER // 100%
                </div>
            </div>
        </div>
    );
}
