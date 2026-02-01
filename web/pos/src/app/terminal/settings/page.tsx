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
    Loader,
    ChevronRight,
    Search,
    Cpu,
    Activity,
    Smartphone
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { Badge } from '@/shared/components/Badge';
import { motion, AnimatePresence } from 'framer-motion';
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
                return <CheckCircle className="w-5 h-5 text-success shadow-glow-success/20" />;
            case PrinterStatus.DISCONNECTED:
                return <XCircle className="w-5 h-5 text-text-tertiary" />;
            case PrinterStatus.ERROR:
                return <AlertTriangle className="w-5 h-5 text-error shadow-glow-error/20" />;
            case PrinterStatus.BUSY:
                return <Loader className="w-5 h-5 text-warning animate-spin shadow-glow-warning/20" />;
            case PrinterStatus.LOW_PAPER:
                return <AlertTriangle className="w-5 h-5 text-warning shadow-glow-warning/20" />;
            default:
                return <XCircle className="w-5 h-5 text-text-tertiary/40" />;
        }
    };

    const getStatusVariant = (status: PrinterStatus): "success" | "warning" | "error" | "info" | "neutral" => {
        switch (status) {
            case PrinterStatus.CONNECTED:
                return 'success';
            case PrinterStatus.DISCONNECTED:
                return 'neutral';
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
                return <Usb className="w-4 h-4 opacity-70" />;
            case PrinterConnectionType.BLUETOOTH:
                return <Bluetooth className="w-4 h-4 opacity-70" />;
            case PrinterConnectionType.WIFI:
                return <Wifi className="w-4 h-4 opacity-70" />;
            default:
                return <Printer className="w-4 h-4 opacity-70" />;
        }
    };

    const navItems = [
        { id: 'general', label: 'System Core', icon: Cpu, desc: 'Terminal identity & region' },
        { id: 'hardware', label: 'Peripherals', icon: Printer, desc: 'Printers & hardware sync' },
        { id: 'network', label: 'Neural Link', icon: Wifi, desc: 'Network & cloud status' },
        { id: 'taxes', label: 'Fiscal Rules', icon: CreditCard, desc: 'Taxes, fees & rounding' },
        { id: 'notifications', label: 'Alert Center', icon: Bell, desc: 'Status & system pings' },
        { id: 'display', label: 'Interface', icon: Monitor, desc: 'Theme & visual layers' },
    ];

    return (
        <div className="min-h-screen bg-background-primary flex flex-col relative selection:bg-primary/20 overflow-hidden bg-mesh-primary antialiased">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 flex flex-col relative z-10 gap-8 p-8 lg:p-12">
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center border-2 border-primary/20 shadow-glow-primary/10">
                                <Settings size={32} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-5xl lg:text-6xl font-black text-text-primary uppercase tracking-tighter italic leading-none">Terminal <span className="text-primary italic">Sync</span></h1>
                                <p className="text-text-tertiary text-[11px] font-black uppercase tracking-[0.4em] opacity-40 italic mt-2">Executive Node Parameters & Operations Control</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="h-20 px-10 rounded-[2rem] bg-primary text-white hover:scale-105 active:scale-95 font-black tracking-[0.3em] uppercase text-[11px] shadow-glow-primary transition-all italic border-2 border-primary/20 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="flex items-center gap-4">
                                {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                                {isSaving ? 'SYNCHRONIZING...' : 'COMMIT CHANGES'}
                            </div>
                        </Button>
                    </div>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row gap-10 min-h-0">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-[380px] shrink-0 space-y-4">
                        <Card variant="glass" className="p-6 rounded-[3rem] border-2 border-border-default/50 shadow-2xl backdrop-blur-3xl overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                            <div className="space-y-2 relative z-10">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`
                                            w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all text-left relative group/btn
                                            ${activeTab === item.id
                                                ? 'bg-primary/10 text-primary border-2 border-primary/20 shadow-glow-primary/5'
                                                : 'bg-transparent text-text-tertiary hover:bg-white/5 hover:text-text-primary'
                                            }
                                        `}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors border ${activeTab === item.id
                                                ? 'bg-primary text-white border-primary/30 shadow-glow-primary'
                                                : 'bg-background-tertiary/40 text-text-tertiary/60 border-border-default/50 group-hover/btn:border-primary/30 group-hover/btn:text-primary group-hover/btn:bg-primary/5'
                                            }`}>
                                            <item.icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-black uppercase text-[11px] tracking-[0.2em] italic">{item.label}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest opacity-40 italic mt-0.5 group-hover/btn:opacity-60 ${activeTab === item.id ? 'text-primary opacity-60' : ''}`}>
                                                {item.desc}
                                            </p>
                                        </div>
                                        {activeTab === item.id && (
                                            <motion.div layoutId="nav-glow" className="absolute left-0 w-1.5 h-10 bg-primary rounded-full shadow-glow-primary" />
                                        )}
                                        <ChevronRight size={16} className={`opacity-0 group-hover/btn:opacity-100 transition-all ${activeTab === item.id ? 'translate-x-0 opacity-40' : '-translate-x-2'}`} />
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Node Health Card */}
                        <Card variant="glass" className="p-8 rounded-[3rem] border-2 border-border-default/50 shadow-2xl backdrop-blur-3xl bg-success/5">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-success/20 rounded-[1.2rem] flex items-center justify-center text-success border border-success/30">
                                    <Shield size={22} className="animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-success uppercase tracking-[0.3em] italic">System Status: Optimal</p>
                                    <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest opacity-40 italic mt-0.5">All neural links active</p>
                                </div>
                            </div>
                            <div className="h-1 bg-background-tertiary/40 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-success shadow-glow-success"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5 }}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Content Area */}
                    <Card variant="glass" className="flex-1 border-2 border-border-default/50 rounded-[4rem] p-12 lg:p-16 overflow-y-auto shadow-3xl backdrop-blur-4xl relative">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/2 blur-[120px] rounded-full pointer-events-none -mr-64 -mt-64" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="relative z-10 h-full"
                            >
                                {activeTab === 'general' && (
                                    <div className="max-w-4xl space-y-12">
                                        <div>
                                            <div className="flex items-center gap-4 mb-10">
                                                <Badge variant="primary" className="text-[9px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full italic shadow-glow-primary/20">Operational Identity</Badge>
                                            </div>
                                            <h3 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic mb-10">Terminal <span className="text-primary italic">Geometry</span></h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">Assigned Logical Name</label>
                                                    <Input defaultValue="POS-Main-01" className="bg-background-tertiary/40 border-2 border-border-default/50 h-20 font-black uppercase tracking-[0.2em] rounded-[1.5rem] px-8 text-xs focus:border-primary/50 italic transition-all shadow-xl" />
                                                </div>
                                                <div className="space-y-3 opacity-60">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">Active License Hub</label>
                                                    <div className="h-20 bg-background-tertiary/20 border-2 border-border-default/30 rounded-[1.5rem] px-8 flex items-center justify-between">
                                                        <span className="text-xs font-black uppercase tracking-widest text-text-tertiary italic">PRO-ENT-2921</span>
                                                        <Shield className="text-primary/40" size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-12 border-t-2 border-border-default/30">
                                            <div className="flex items-center gap-4 mb-10">
                                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full italic border-border-default/50">Space-Time Parameters</Badge>
                                            </div>
                                            <h3 className="text-4xl font-black text-text-primary uppercase tracking-tighter italic mb-10">Regional <span className="text-primary italic">Sync</span></h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">Primary Linguistics</label>
                                                    <div className="relative group">
                                                        <select className="w-full h-20 px-8 bg-background-tertiary/40 border-2 border-border-default/50 rounded-[1.5rem] font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-primary/20 appearance-none italic transition-all shadow-xl group-hover:border-primary/30">
                                                            <option>English (Universal)</option>
                                                            <option>Arabic (Regional)</option>
                                                        </select>
                                                        <Globe size={20} className="absolute right-8 top-1/2 -translate-y-1/2 text-text-tertiary/40 group-hover:text-primary transition-colors" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40 italic px-2">Temporal Alignment</label>
                                                    <div className="relative group">
                                                        <select className="w-full h-20 px-8 bg-background-tertiary/40 border-2 border-border-default/50 rounded-[1.5rem] font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-primary/20 appearance-none italic transition-all shadow-xl group-hover:border-primary/30">
                                                            <option>Cairo (GMT+2)</option>
                                                            <option>Dubai (GMT+4)</option>
                                                            <option>London (GMT+0)</option>
                                                        </select>
                                                        <RefreshCw size={20} className="absolute right-8 top-1/2 -translate-y-1/2 text-text-tertiary/40 group-hover:text-primary transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'hardware' && (
                                    <div className="max-w-5xl space-y-12">
                                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
                                            <div>
                                                <div className="flex items-center gap-4 mb-4 text-primary">
                                                    <Printer size={24} className="shadow-glow-primary" />
                                                    <h3 className="text-4xl font-black uppercase tracking-tighter italic">Peripheral <span className="text-primary italic">Manifest</span></h3>
                                                </div>
                                                <p className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.4em] italic opacity-40">
                                                    {printers.length} detected nodes • Neural scan active
                                                </p>
                                            </div>

                                            <div className="flex gap-4">
                                                <Button
                                                    onClick={handleScanPrinters}
                                                    disabled={isScanning}
                                                    variant="glass"
                                                    className="h-16 px-8 rounded-2xl border-2 border-border-default/50 hover:border-primary/50 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-3 transition-all"
                                                >
                                                    {isScanning ? <Loader className="animate-spin text-primary" size={18} /> : <Search size={18} />}
                                                    {isScanning ? 'SCANNING HUB...' : 'DISCOVER NODES'}
                                                </Button>
                                                <Button
                                                    variant="glass"
                                                    className="h-16 px-8 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest italic flex items-center gap-3 transition-all"
                                                >
                                                    <Zap size={18} className="shadow-glow-primary" />
                                                    PULSE ALL
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Printer Stats Grid */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                            {[
                                                { label: 'Total Hubs', value: printers.length, icon: Box, color: 'text-text-primary' },
                                                { label: 'Active Sync', value: printers.filter(p => p.status === PrinterStatus.CONNECTED).length, icon: Activity, color: 'text-success' },
                                                { label: 'Neural Errors', value: printers.filter(p => p.status === PrinterStatus.ERROR).length, icon: AlertTriangle, color: 'text-error' },
                                                { label: 'Fiscal Units', value: printers.filter(p => p.type === PrinterType.RECEIPT).length, icon: CreditCard, color: 'text-primary' }
                                            ].map((stat, i) => (
                                                <Card key={i} className="p-8 bg-background-tertiary/20 backdrop-blur-3xl rounded-[2.5rem] border-2 border-border-default/50 flex flex-col items-center text-center group hover:border-primary/30 transition-all shadow-xl">
                                                    <stat.icon size={20} className={stat.color + " opacity-40 mb-3 group-hover:scale-110 transition-transform shadow-glow-" + stat.color.split('-')[1]} />
                                                    <p className={`text-4xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
                                                    <p className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.3em] italic mt-1">{stat.label}</p>
                                                </Card>
                                            ))}
                                        </div>

                                        {/* Printer List */}
                                        <div className="space-y-6">
                                            {printers.length === 0 ? (
                                                <Card className="p-20 text-center border-4 border-dashed border-border-default/30 bg-background-tertiary/10 rounded-[4rem]">
                                                    <div className="w-24 h-24 bg-background-tertiary/40 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border-2 border-border-default/50 shadow-inner opacity-20">
                                                        <Printer size={48} />
                                                    </div>
                                                    <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-3 italic">Void Shard Detected</h3>
                                                    <p className="text-[11px] font-black text-text-tertiary uppercase tracking-[0.3em] mb-10 max-w-sm mx-auto opacity-40 italic">Initialize node discovery to synchronize peripheral hardware manifesting on the local network.</p>
                                                    <Button onClick={handleScanPrinters} className="h-18 px-12 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-widest text-xs italic shadow-glow-primary">
                                                        EXECUTE DISCOVERY PROTOCOL
                                                    </Button>
                                                </Card>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-6">
                                                    {printers.map((printer) => (
                                                        <Card key={printer.id} className={`p-8 rounded-[3rem] border-2 transition-all relative overflow-hidden group/printer shadow-2xl ${printer.status === PrinterStatus.CONNECTED
                                                                ? 'border-success/30 bg-success/5 hover:border-success/50'
                                                                : 'border-error/30 bg-error/5 hover:border-error/50'
                                                            }`}>
                                                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none opacity-40" />

                                                            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                                                                <div className="flex items-center gap-8 w-full">
                                                                    <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-glow transition-all duration-500 group-hover/printer:scale-110 ${printer.status === PrinterStatus.CONNECTED
                                                                            ? 'bg-success/20 text-success border-2 border-success/30'
                                                                            : 'bg-error/20 text-error border-2 border-error/30'
                                                                        }`}>
                                                                        {getStatusIcon(printer.status)}
                                                                    </div>

                                                                    <div className="flex-1">
                                                                        <div className="flex flex-wrap items-center gap-4 mb-3">
                                                                            <h4 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic group-hover/printer:text-primary transition-colors">{printer.name}</h4>
                                                                            <Badge variant={getStatusVariant(printer.status)} className="text-[8px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full italic shadow-sm">
                                                                                Node {printer.status.replace('_', ' ')}
                                                                            </Badge>
                                                                            <div className="w-10 h-10 rounded-xl bg-background-tertiary/40 flex items-center justify-center border border-border-default/50 text-text-tertiary/60">
                                                                                {getConnectionIcon(printer.connectionType)}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex flex-wrap items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary opacity-50 italic">
                                                                            <span className="flex items-center gap-2 italic">{printer.type} Unit</span>
                                                                            <span className="flex items-center gap-2 italic">{printer.connectionType} Bridge</span>
                                                                            {printer.ipAddress && <span className="font-mono text-primary italic">Gateway: {printer.ipAddress}</span>}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-6 w-full lg:w-auto">
                                                                    <div className="text-right hidden sm:block shrink-0">
                                                                        <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest opacity-40 italic">Sync Integrity</p>
                                                                        <p className="text-xs font-black text-text-primary tracking-widest italic mt-1 tabular-nums">
                                                                            {printer.lastSeen ? new Date(printer.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00'}
                                                                        </p>
                                                                    </div>

                                                                    <Button
                                                                        variant="glass"
                                                                        size="lg"
                                                                        onClick={() => handleTestPrinter(printer.id)}
                                                                        disabled={printer.status !== PrinterStatus.CONNECTED}
                                                                        className="h-16 px-10 rounded-2xl border-2 border-border-default/50 hover:border-primary/50 text-[10px] font-black uppercase tracking-widest italic italic transition-all shadow-glow-primary/10"
                                                                    >
                                                                        TEST PAYLOAD
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Activity Log / Status */}
                                        <Card variant="glass" className="p-10 rounded-[3rem] border-2 border-primary/20 bg-primary/2 relative overflow-hidden group shadow-3xl">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-glow-primary/20 border border-primary/30">
                                                        <Activity size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black text-text-primary uppercase tracking-tighter italic">Operational Queue</h4>
                                                        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.3em] opacity-40 italic mt-0.5">Stream buffer visualization</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-4xl font-black text-primary italic tracking-tighter shadow-glow-primary/10">
                                                        {printerService.getPrintQueue().length}
                                                    </p>
                                                    <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest opacity-60 italic">Jobs Pending</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* Placeholder for other tabs */}
                                {['network', 'taxes', 'notifications', 'display'].includes(activeTab) && (
                                    <div className="h-full flex flex-col items-center justify-center py-40">
                                        <motion.div
                                            animate={{
                                                rotate: 360,
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{
                                                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                                scale: { duration: 4, repeat: Infinity }
                                            }}
                                            className="mb-12"
                                        >
                                            <Settings size={120} className="text-primary opacity-10 shadow-glow-primary/5" />
                                        </motion.div>
                                        <h3 className="text-3xl font-black uppercase tracking-[0.2em] text-text-primary italic mb-4">Module Locked</h3>
                                        <div className="flex items-center gap-3 px-8 py-3 bg-warning/10 border-2 border-warning/30 rounded-full mb-6 shadow-glow-warning/10">
                                            <AlertTriangle size={16} className="text-warning animate-pulse" />
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-warning italic">Executive Authorization Required</p>
                                        </div>
                                        <p className="max-w-md text-center text-[11px] font-black uppercase tracking-[0.3em] text-text-tertiary opacity-40 italic leading-relaxed">
                                            This operational parameter is managed by the Central Node Authority. Please authenticate via the ecosystem command board to modify global configuration variables.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </Card>
                </div>
            </main>

            {/* Ecosystem Signature */}
            <footer className="p-8 lg:p-12 border-t border-border-default/30 flex justify-between items-center relative z-20 backdrop-blur-3xl bg-background-primary/20">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 opacity-40">
                        <Smartphone size={16} className="text-text-tertiary" />
                        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.5em] italic">Node #01 • Operational</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-40">
                        <Zap size={16} className="text-primary" />
                        <span className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.5em] italic">Stream: 2.4gbps</span>
                    </div>
                </div>
                <p className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.8em] opacity-20 italic">
                    NILELINK SECURE PROTOCOL SYNC · v2.0
                </p>
            </footer>

            <style jsx global>{`
                :root {
                    --primary-rgb: 0, 0, 0;
                }
            `}</style>
        </div>
    );
}
