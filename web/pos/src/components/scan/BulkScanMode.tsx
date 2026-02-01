'use client';

import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@shared/components/GlassCard';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Scan, CheckCircle2, AlertCircle, Zap, Package } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface BulkScanModeProps {
    onProductScanned: (barcode: string) => Promise<void>;
    businessId: string;
}

export function BulkScanMode({ onProductScanned, businessId }: BulkScanModeProps) {
    const [isActive, setIsActive] = useState(false);
    const [scannedCount, setScannedCount] = useState(0);
    const [lastBarcode, setLastBarcode] = useState<string>('');
    const [recentScans, setRecentScans] = useState<Array<{ barcode: string; time: Date; success: boolean }>>([]);
    const [autoScanInterval, setAutoScanInterval] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isActive]);

    const handleScan = async (barcode: string) => {
        if (!barcode.trim()) return;

        try {
            await onProductScanned(barcode);

            setScannedCount(prev => prev + 1);
            setLastBarcode(barcode);
            setRecentScans(prev => [
                { barcode, time: new Date(), success: true },
                ...prev.slice(0, 9) // Keep last 10
            ]);

            // Clear input for next scan
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        } catch (error) {
            console.error('[BulkScan] Failed:', error);
            setRecentScans(prev => [
                { barcode, time: new Date(), success: false },
                ...prev.slice(0, 9)
            ]);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const barcode = e.currentTarget.value;
            handleScan(barcode);
        }
    };

    const toggleMode = () => {
        if (!isActive) {
            setScannedCount(0);
            setRecentScans([]);
        }
        setIsActive(!isActive);
    };

    const startAutoScan = () => {
        // Simulate auto-scan for testing (replace with real barcode scanner integration)
        const interval = window.setInterval(() => {
            const fakeBarcode = `${Math.floor(Math.random() * 1000000000000)}`;
            handleScan(fakeBarcode);
        }, 1000);

        setAutoScanInterval(interval);
    };

    const stopAutoScan = () => {
        if (autoScanInterval) {
            clearInterval(autoScanInterval);
            setAutoScanInterval(null);
        }
    };

    return (
        <GlassCard className="p-6 border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Bulk Scan Mode</h3>
                </div>
                <Button
                    onClick={toggleMode}
                    className={cn(
                        "text-[10px] font-black uppercase px-4 py-2 rounded-xl transition-all",
                        isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-purple-600 hover:bg-purple-700"
                    )}
                >
                    {isActive ? 'Stop' : 'Start'} Bulk Scan
                </Button>
            </div>

            {isActive && (
                <div className="space-y-4">
                    {/* Scanner Input */}
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                            Scan Barcode
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            onKeyPress={handleKeyPress}
                            placeholder="Point scanner here..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                            autoFocus
                        />
                        <p className="text-[9px] text-gray-500 mt-1 italic">
                            💡 Focus here and scan continuously. Press Enter after each barcode.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3">
                            <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">
                                Total Scanned
                            </div>
                            <div className="text-2xl font-black text-white">{scannedCount}</div>
                        </div>
                        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                            <div className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">
                                Success Rate
                            </div>
                            <div className="text-2xl font-black text-white">
                                {scannedCount > 0
                                    ? Math.round((recentScans.filter(s => s.success).length / recentScans.length) * 100)
                                    : 0}%
                            </div>
                        </div>
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                            <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">
                                Last Barcode
                            </div>
                            <div className="text-xs font-bold text-white truncate">
                                {lastBarcode || '—'}
                            </div>
                        </div>
                    </div>

                    {/* Recent Scans */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Recent Scans
                            </label>
                            <Badge className="bg-gray-500/10 text-gray-400 border-gray-500/20 text-[8px] font-black uppercase">
                                Last 10
                            </Badge>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 max-h-48 overflow-y-auto">
                            {recentScans.length === 0 ? (
                                <div className="text-center text-gray-500 text-xs py-4">
                                    No scans yet. Start scanning products.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {recentScans.map((scan, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex items-center justify-between p-2 rounded-lg transition-all",
                                                scan.success
                                                    ? "bg-green-500/5 border border-green-500/20"
                                                    : "bg-red-500/5 border border-red-500/20"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {scan.success ? (
                                                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                                                ) : (
                                                    <AlertCircle className="w-3 h-3 text-red-400" />
                                                )}
                                                <span className="text-xs text-white font-mono">{scan.barcode}</span>
                                            </div>
                                            <span className="text-[9px] text-gray-500">
                                                {scan.time.toLocaleTimeString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button
                            onClick={startAutoScan}
                            disabled={autoScanInterval !== null}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-[10px] font-black uppercase rounded-xl"
                        >
                            <Package className="w-3 h-3 mr-1" />
                            Test Auto-Scan
                        </Button>
                        <Button
                            onClick={stopAutoScan}
                            disabled={autoScanInterval === null}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-[10px] font-black uppercase rounded-xl"
                        >
                            Stop Test
                        </Button>
                    </div>

                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
                        <p className="text-yellow-400 text-[9px] font-bold">
                            ⚡ Bulk scan mode automatically creates placeholder products if barcode not found. Stock is incremented by +1 for each scan.
                        </p>
                    </div>
                </div>
            )}

            {!isActive && (
                <div className="text-center py-8">
                    <Scan className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-2">Bulk scan mode is inactive</p>
                    <p className="text-gray-600 text-xs">
                        Use this for fast inventory stocking. Scan 1000+ products without interruption.
                    </p>
                </div>
            )}
        </GlassCard>
    );
}
