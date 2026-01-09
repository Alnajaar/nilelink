"use client";

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Printer,
    Wifi,
    Globe,
    Shield,
    CreditCard,
    Bell,
    Monitor,
    Save,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Bluetooth,
    Usb,
    Zap,
    Loader
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Badge } from '@/shared/components/Badge';
import { motion } from 'framer-motion';
import { printerService, PrinterStatus, PrinterConnectionType, PrinterType } from '@/services/PrinterService';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('hardware');
    const [isSaving, setIsSaving] = useState(false);
    const [printers, setPrinters] = useState<any[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [lastScan, setLastScan] = useState<Date | null>(null);

    // Load printers on mount and set up monitoring
    useEffect(() => {
        const loadPrinters = () => {
            setPrinters(printerService.getPrinters());
        };

        loadPrinters();

        // Set up periodic refresh
        const interval = setInterval(loadPrinters, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    const handleScanPrinters = async () => {
        setIsScanning(true);
        try {
            await printerService.detectPrinters();
            setPrinters(printerService.getPrinters());
            setLastScan(new Date());
        } catch (error) {
            console.error('Printer scan failed:', error);
        } finally {
            setIsScanning(false);
        }
    };

    const handleTestPrinter = async (printerId: string) => {
        try {
            await printerService.testPrinter(printerId);
            // Refresh printer list to show updated status
            setPrinters([...printerService.getPrinters()]);
        } catch (error) {
            console.error('Printer test failed:', error);
        }
    };

    const getStatusIcon = (status: PrinterStatus) => {
        switch (status) {
            case PrinterStatus.CONNECTED:
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case PrinterStatus.DISCONNECTED:
                return <XCircle className="w-4 h-4 text-red-500" />;
            case PrinterStatus.ERROR:
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case PrinterStatus.BUSY:
                return <Loader className="w-4 h-4 text-yellow-500 animate-spin" />;
            case PrinterStatus.LOW_PAPER:
                return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            default:
                return <XCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusVariant = (status: PrinterStatus): "success" | "warning" | "error" | "info" | "neutral" => {
        switch (status) {
            case PrinterStatus.CONNECTED:
                return 'success';
            case PrinterStatus.DISCONNECTED:
                return 'error';
            case PrinterStatus.ERROR:
                return 'error';
            case PrinterStatus.BUSY:
                return 'warning';
            case PrinterStatus.LOW_PAPER:
                return 'warning';
            default:
                return 'neutral';
        }
    };

    const getConnectionIcon = (connectionType: PrinterConnectionType) => {
        switch (connectionType) {
            case PrinterConnectionType.USB:
                return <Usb className="w-4 h-4" />;
            case PrinterConnectionType.BLUETOOTH:
                return <Bluetooth className="w-4 h-4" />;
            case PrinterConnectionType.WIFI:
                return <Wifi className="w-4 h-4" />;
            default:
                return <Printer className="w-4 h-4" />;
        }
    };

    const getPrinterWarnings = (printer: any) => {
        const warnings = [];

        if (printer.status === PrinterStatus.DISCONNECTED) {
            warnings.push(`${printer.connectionType.toUpperCase()} connection lost`);
        }

        if (printer.status === PrinterStatus.ERROR) {
            warnings.push('Printer error - check connection');
        }

        if (printer.status === PrinterStatus.LOW_PAPER) {
            warnings.push('Low paper - replace soon');
        }

        if (printer.connectionType === PrinterConnectionType.BLUETOOTH && printer.status !== PrinterStatus.CONNECTED) {
            warnings.push('Bluetooth pairing may be required');
        }

        return warnings;
    };

    const navItems = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'hardware', label: 'Hardware & Printers', icon: Printer },
        { id: 'network', label: 'Network & Sync', icon: Wifi },
        { id: 'taxes', label: 'Taxes & Fees', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'display', label: 'Display & Theme', icon: Monitor },
    ];

    return (
        <div className="p-8 flex flex-col h-full gap-8 bg-background">
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <Settings size={22} />
                        </div>
                        <h1 className="text-4xl font-black text-text-main uppercase tracking-tight">System Core</h1>
                    </div>
                    <p className="text-text-muted font-bold uppercase tracking-widest text-xs ml-1">Terminal Configuration & Protocol Parameters</p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="lg"
                    className="font-black uppercase tracking-widest px-8 shadow-xl bg-primary text-background"
                >
                    {isSaving ? <RefreshCw className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                    {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                </Button>
            </header>

            <div className="flex-1 flex gap-8 min-h-0">
                {/* Sidebar Nav */}
                <div className="w-80 shrink-0 flex flex-col gap-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`
                                flex items-center gap-4 p-4 rounded-2xl transition-all text-left group relative overflow-hidden
                                ${activeTab === item.id
                                    ? 'bg-white text-primary shadow-lg ring-2 ring-primary'
                                    : 'bg-transparent text-text-muted hover:bg-white hover:text-text-main hover:shadow-sm'
                                }
                            `}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${activeTab === item.id ? 'bg-primary/10' : 'bg-background-subtle group-hover:bg-primary/5'}`}>
                                <item.icon size={20} className={activeTab === item.id ? 'text-primary' : 'text-text-muted group-hover:text-primary'} />
                            </div>
                            <span className="font-black uppercase text-xs tracking-widest flex-1">{item.label}</span>
                            {activeTab === item.id && (
                                <motion.div layoutId="active-settings-pill" className="w-1.5 h-8 bg-primary rounded-full absolute left-0" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <Card className="flex-1 bg-white border-border-subtle rounded-[40px] p-8 overflow-y-auto shadow-sm">
                    {activeTab === 'general' && (
                        <div className="max-w-2xl space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-text-main uppercase tracking-tight mb-6">Terminal Identity</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 block">Terminal Name</label>
                                        <Input defaultValue="POS-Main-01" className="bg-background-subtle border-transparent h-14 font-bold rounded-2xl" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 block">Branch ID</label>
                                            <Input defaultValue="BR-EGY-CAI-01" disabled className="bg-background-subtle border-transparent h-14 font-medium opacity-60 rounded-2xl" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 block">License Key</label>
                                            <Input defaultValue="PRO-ENT-2921" disabled className="bg-background-subtle border-transparent h-14 font-medium opacity-60 rounded-2xl" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-border-subtle">
                                <h3 className="text-2xl font-black text-text-main uppercase tracking-tight mb-6">Regional Settings</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 block">Language</label>
                                            <select className="w-full h-14 px-4 bg-background-subtle rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary border-transparent">
                                                <option>English (US)</option>
                                                <option>Arabic (EG)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 block">Timezone</label>
                                            <select className="w-full h-14 px-4 bg-background-subtle rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary border-transparent">
                                                <option>Cairo (GMT+2)</option>
                                                <option>Dubai (GMT+4)</option>
                                                <option>London (GMT+0)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hardware' && (
                        <div className="max-w-4xl space-y-8">
                            {/* Header with Controls */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-text-main uppercase tracking-tight mb-2">Printer Management</h3>
                                    <p className="text-text-muted font-medium text-sm">
                                        {printers.length} printer{printers.length !== 1 ? 's' : ''} detected
                                        {lastScan && ` • Last scanned: ${lastScan.toLocaleTimeString()}`}
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleScanPrinters}
                                        disabled={isScanning}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        {isScanning ? <Loader className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                        {isScanning ? 'Scanning...' : 'Scan Devices'}
                                    </Button>

                                    <Button size="sm" variant="outline" className="gap-2">
                                        <Zap size={16} />
                                        Quick Test All
                                    </Button>
                                </div>
                            </div>

                            {/* Printer Status Summary */}
                            {printers.length > 0 && (
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: 'Total', value: printers.length, color: 'text-text-main' },
                                        { label: 'Connected', value: printers.filter(p => p.status === PrinterStatus.CONNECTED).length, color: 'text-green-600' },
                                        { label: 'Issues', value: printers.filter(p => p.status !== PrinterStatus.CONNECTED).length, color: 'text-red-600' },
                                        { label: 'Receipt', value: printers.filter(p => p.type === PrinterType.RECEIPT).length, color: 'text-blue-600' }
                                    ].map((stat, i) => (
                                        <Card key={i} className="p-4 text-center">
                                            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {/* Printer List */}
                            <div className="space-y-4">
                                {printers.length === 0 ? (
                                    <Card className="p-12 text-center border-dashed border-2 border-border-subtle">
                                        <Printer className="w-16 h-16 text-text-muted mx-auto mb-4" />
                                        <h4 className="text-lg font-black text-text-main uppercase tracking-tight mb-2">No Printers Detected</h4>
                                        <p className="text-text-muted mb-6">Connect USB, Bluetooth, or network printers to get started</p>
                                        <Button onClick={handleScanPrinters} disabled={isScanning} className="gap-2">
                                            {isScanning ? <Loader className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                                            {isScanning ? 'Scanning...' : 'Scan for Printers'}
                                        </Button>
                                    </Card>
                                ) : (
                                    printers.map((printer) => {
                                        const warnings = getPrinterWarnings(printer);
                                        return (
                                            <Card key={printer.id} className={`p-6 border-l-4 transition-all ${
                                                printer.status === PrinterStatus.CONNECTED
                                                    ? 'border-l-green-500 bg-green-50/50'
                                                    : 'border-l-red-500 bg-red-50/50'
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                                                            printer.status === PrinterStatus.CONNECTED
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-red-100 text-red-600'
                                                        }`}>
                                                            {getStatusIcon(printer.status)}
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <h4 className="font-black text-text-main uppercase text-sm">{printer.name}</h4>
                                                                {getConnectionIcon(printer.connectionType)}
                                                                <Badge variant={getStatusVariant(printer.status)} className="text-[8px] font-black uppercase">
                                                                    {printer.status.replace('_', ' ')}
                                                                </Badge>
                                                            </div>

                                                            <div className="flex items-center gap-4 text-xs text-text-muted">
                                                                <span className="font-bold uppercase tracking-widest">{printer.type}</span>
                                                                <span>•</span>
                                                                <span>{printer.connectionType.toUpperCase()}</span>
                                                                {printer.ipAddress && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="font-mono">{printer.ipAddress}:{printer.port}</span>
                                                                    </>
                                                                )}
                                                                {printer.macAddress && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="font-mono">{printer.macAddress}</span>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {/* Warnings */}
                                                            {warnings.length > 0 && (
                                                                <div className="mt-3 space-y-1">
                                                                    {warnings.map((warning, i) => (
                                                                        <div key={i} className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                                                                            <AlertTriangle size={12} />
                                                                            <span className="font-medium">{warning}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleTestPrinter(printer.id)}
                                                            disabled={printer.status !== PrinterStatus.CONNECTED}
                                                        >
                                                            Test Print
                                                        </Button>

                                                        <div className="text-right text-xs text-text-muted">
                                                            <div>Last seen</div>
                                                            <div className="font-mono">
                                                                {printer.lastSeen ? new Date(printer.lastSeen).toLocaleTimeString() : 'Never'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })
                                )}
                            </div>

                            {/* Print Queue Status */}
                            {printers.length > 0 && (
                                <Card className="p-6 bg-blue-50/50 border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Printer className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <h4 className="font-black text-blue-900 uppercase text-sm">Print Queue</h4>
                                                <p className="text-xs text-blue-700">Monitor active print jobs</p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-black text-blue-900">
                                                {printerService.getPrintQueue().length}
                                            </p>
                                            <p className="text-xs text-blue-700 uppercase tracking-widest">jobs</p>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {['network', 'taxes', 'notifications', 'display'].includes(activeTab) && (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <Settings size={64} className="mb-4 text-text-muted" />
                            <h3 className="text-xl font-black uppercase tracking-tight text-text-main">Configuration Module</h3>
                            <p className="text-sm font-bold uppercase tracking-widest text-text-muted">This settings block is currently managed by the central admin.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
