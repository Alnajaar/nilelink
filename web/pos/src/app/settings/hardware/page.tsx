"use client";

import React, { useState, useEffect } from 'react';
import {
    Cpu, Printer, Smartphone, Search, Plus, Settings,
    RefreshCw, ShieldCheck, CreditCard, Box, Zap,
    Activity, ArrowLeft, Terminal, Laptop, CheckCircle, XCircle, AlertTriangle,
    ChevronRight, Loader, Globe
} from 'lucide-react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';
import { useRouter } from 'next/navigation';
import { printerService, Printer as PrinterType, PrinterStatus, PrinterType as PrinterTypeEnum } from '@/services/PrinterService';

export default function HardwareSettings() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [printers, setPrinters] = useState<PrinterType[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [printQueue, setPrintQueue] = useState<any[]>([]);
    const [printerSummary, setPrinterSummary] = useState<any>({});

    useEffect(() => {
        setMounted(true);
        loadPrinters();
    }, []);

    const loadPrinters = async () => {
        try {
            const currentPrinters = printerService.getPrinters();
            setPrinters(currentPrinters);
            setPrinterSummary(printerService.getPrinterStatusSummary());
            setPrintQueue(printerService.getPrintQueue());
        } catch (error) {
            console.error('Failed to load printers:', error);
        }
    };

    const scanForDevices = async () => {
        setIsSearching(true);
        try {
            await printerService.detectPrinters();
            await loadPrinters();
        } catch (error) {
            console.error('Device scan failed:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const runTestPrint = async (printer: PrinterType) => {
        try {
            await printerService.testPrinter(printer.id);
        } catch (error) {
            console.error('Test print failed:', error);
        }
    };

    const getStatusIcon = (status: PrinterStatus) => {
        switch (status) {
            case PrinterStatus.CONNECTED:
                return <CheckCircle size={16} className="text-green-600" />;
            case PrinterStatus.DISCONNECTED:
                return <XCircle size={16} className="text-gray-400" />;
            case PrinterStatus.ERROR:
                return <AlertTriangle size={16} className="text-red-600" />;
            case PrinterStatus.BUSY:
                return <Loader size={16} className="text-yellow-600 animate-spin" />;
            default:
                return <AlertTriangle size={16} className="text-yellow-600" />;
        }
    };

    const getStatusVariant = (status: PrinterStatus): "success" | "warning" | "error" | "secondary" | "info" | "neutral" => {
        switch (status) {
            case PrinterStatus.CONNECTED:
                return "success";
            case PrinterStatus.DISCONNECTED:
                return "neutral";
            case PrinterStatus.ERROR:
                return "error";
            case PrinterStatus.BUSY:
                return "warning";
            default:
                return "neutral";
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="px-8 py-6 bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            className="w-10 h-10 rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Hardware Settings</h1>
                            <p className="text-gray-600">Manage printers and peripheral devices</p>
                        </div>
                    </div>

                    <Button
                        onClick={scanForDevices}
                        disabled={isSearching}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        <div className="flex items-center gap-2">
                            {isSearching ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                            {isSearching ? 'Scanning...' : 'Scan Devices'}
                        </div>
                    </Button>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-8">
                {/* Printer Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-white border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Printer size={20} className="text-blue-600" />
                            </div>
                            <Badge variant="info" className="text-xs">
                                {printerSummary.total || 0} Total
                            </Badge>
                        </div>
                        <p className="text-gray-500 text-sm mb-1">Printers</p>
                        <p className="text-2xl font-bold text-gray-900">{printers.length}</p>
                    </Card>

                    <Card className="p-6 bg-white border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle size={20} className="text-green-600" />
                            </div>
                            <Badge variant="success" className="text-xs">
                                Active
                            </Badge>
                        </div>
                        <p className="text-gray-500 text-sm mb-1">Connected</p>
                        <p className="text-2xl font-bold text-green-600">{printerSummary.connected || 0}</p>
                    </Card>

                    <Card className="p-6 bg-white border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle size={20} className="text-yellow-600" />
                            </div>
                            <Badge variant="warning" className="text-xs">
                                Attention
                            </Badge>
                        </div>
                        <p className="text-gray-500 text-sm mb-1">Issues</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {printerSummary.disconnected || 0}
                        </p>
                    </Card>
                </div>

                {/* Printers List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Connected Devices</h2>
                        <Badge variant="neutral" className="text-sm">
                            {printers.length} devices
                        </Badge>
                    </div>

                    {printers.length === 0 ? (
                        <Card className="p-12 text-center bg-white border-2 border-dashed border-gray-300">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Terminal size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No printers found</h3>
                            <p className="text-gray-500 mb-6">Connect printers to your network and scan for devices</p>
                            <Button onClick={scanForDevices} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                                <Search size={18} className="mr-2" />
                                Scan for Printers
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {printers.map((printer, idx) => (
                                <Card 
                                    key={printer.id} 
                                    className={`p-6 bg-white border-2 ${
                                        printer.status === PrinterStatus.CONNECTED 
                                            ? 'border-green-200 bg-green-50' 
                                            : 'border-red-200 bg-red-50'
                                    }`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                                                printer.status === PrinterStatus.CONNECTED
                                                    ? 'bg-green-100 text-green-600'
                                                    : 'bg-red-100 text-red-600'
                                            }`}>
                                                <Printer size={24} />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <h4 className="text-lg font-bold text-gray-900">{printer.name}</h4>
                                                    <Badge variant="neutral" className="text-xs">
                                                        {printer.connectionType}
                                                    </Badge>
                                                    <Badge variant={getStatusVariant(printer.status)} className="text-xs">
                                                        {printer.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <span>{printer.type} Printer</span>
                                                    <span>ID: {printer.id.slice(0, 8)}</span>
                                                    {printer.ipAddress && <span className="font-mono">IP: {printer.ipAddress}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => runTestPrint(printer)}
                                                className="flex items-center gap-2"
                                            >
                                                <Printer size={16} />
                                                Test Print
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex items-center gap-2">
                                                <Settings size={16} />
                                                Configure
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Print Queue */}
                {printQueue.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Print Queue</h2>
                        <Card className="p-6 bg-white border border-gray-200">
                            <div className="space-y-3">
                                {printQueue.map((job, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">Job #{job.id}</p>
                                            <p className="text-sm text-gray-600">{job.documentName}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="neutral" className="text-xs">
                                                {job.status}
                                            </Badge>
                                            <span className="text-sm text-gray-500">
                                                {new Date(job.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}
