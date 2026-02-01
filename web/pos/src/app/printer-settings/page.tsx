'use client';

import React, { useState, useEffect } from 'react';
import { Printer, Settings, Plus, Trash2, TestTube, Wifi, Usb, Bluetooth } from 'lucide-react';

// Import printer types from service
enum PrinterType {
    RECEIPT = 'receipt',
    LABEL = 'label',
    KITCHEN = 'kitchen'
}

enum PrinterConnectionType {
    USB = 'usb',
    BLUETOOTH = 'bluetooth',
    WIFI = 'wifi',
    SERIAL = 'serial'
}

enum PrinterStatus {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    BUSY = 'busy',
    ERROR = 'error',
    LOW_PAPER = 'low_paper',
    OFFLINE = 'offline'
}

interface PrinterConfig {
    id: string;
    name: string;
    type: PrinterType;
    connectionType: PrinterConnectionType;
    status: PrinterStatus;
    ipAddress?: string;
    macAddress?: string;
    port?: number;
    lastSeen?: Date;
    capabilities: {
        paperWidth: number;
        dpi: number;
        cutter: boolean;
        buzzer: boolean;
        cashDrawer: boolean;
    };
}

export default function PrinterSettingsPage() {
    const [printers, setPrinters] = useState<PrinterConfig[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPrinter, setNewPrinter] = useState({
        ip: '',
        port: '9100',
        name: '',
        type: PrinterType.RECEIPT
    });
    const [testingPrinter, setTestingPrinter] = useState<string | null>(null);

    // Load printers from localStorage on mount
    useEffect(() => {
        loadPrinters();
    }, []);

    const loadPrinters = () => {
        try {
            const stored = localStorage.getItem('nilelink_printer_config');
            if (stored) {
                const printersData = JSON.parse(stored);
                setPrinters(printersData);
            }
        } catch (error) {
            console.error('Failed to load printers:', error);
        }
    };

    const savePrinters = (printersData: PrinterConfig[]) => {
        try {
            localStorage.setItem('nilelink_printer_config', JSON.stringify(printersData));
            setPrinters(printersData);
        } catch (error) {
            console.error('Failed to save printers:', error);
        }
    };

    const handleAddPrinter = () => {
        if (!newPrinter.ip || !newPrinter.name) {
            alert('Please fill in all required fields');
            return;
        }

        const printer: PrinterConfig = {
            id: `net-${newPrinter.ip}`,
            name: newPrinter.name,
            type: newPrinter.type,
            connectionType: PrinterConnectionType.WIFI,
            status: PrinterStatus.DISCONNECTED,
            ipAddress: newPrinter.ip,
            port: parseInt(newPrinter.port),
            capabilities: {
                paperWidth: newPrinter.type === PrinterType.KITCHEN ? 58 : 80,
                dpi: 203,
                cutter: newPrinter.type !== PrinterType.KITCHEN,
                buzzer: newPrinter.type === PrinterType.KITCHEN,
                cashDrawer: newPrinter.type === PrinterType.RECEIPT
            }
        };

        const updatedPrinters = [...printers, printer];
        savePrinters(updatedPrinters);
        setShowAddModal(false);
        setNewPrinter({ ip: '', port: '9100', name: '', type: PrinterType.RECEIPT });
    };

    const handleRemovePrinter = (printerId: string) => {
        if (confirm('Are you sure you want to remove this printer?')) {
            const updatedPrinters = printers.filter(p => p.id !== printerId);
            savePrinters(updatedPrinters);
        }
    };

    const handleTestPrint = async (printerId: string) => {
        setTestingPrinter(printerId);

        // Simulate test print
        setTimeout(() => {
            setTestingPrinter(null);
            alert('Test print sent! Check your printer.');
        }, 2000);
    };

    const handleConfigurePrinter = (printerId: string, type: PrinterType) => {
        const updatedPrinters = printers.map(p => {
            if (p.id === printerId) {
                return {
                    ...p,
                    type,
                    capabilities: {
                        ...p.capabilities,
                        paperWidth: type === PrinterType.KITCHEN ? 58 : 80,
                        buzzer: type === PrinterType.KITCHEN,
                        cutter: type !== PrinterType.KITCHEN,
                        cashDrawer: type === PrinterType.RECEIPT
                    }
                };
            }
            return p;
        });
        savePrinters(updatedPrinters);
    };

    const getConnectionIcon = (type: PrinterConnectionType) => {
        switch (type) {
            case PrinterConnectionType.WIFI:
                return <Wifi className="w-4 h-4" />;
            case PrinterConnectionType.USB:
                return <Usb className="w-4 h-4" />;
            case PrinterConnectionType.BLUETOOTH:
                return <Bluetooth className="w-4 h-4" />;
            default:
                return <Wifi className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: PrinterStatus) => {
        switch (status) {
            case PrinterStatus.CONNECTED:
                return 'text-green-500';
            case PrinterStatus.BUSY:
                return 'text-yellow-500';
            case PrinterStatus.ERROR:
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Printer className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Printer Settings</h1>
                            <p className="text-gray-400">Manage your POS printers</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Printer</span>
                    </button>
                </div>

                {/* Printers List */}
                <div className="grid gap-4">
                    {printers.length === 0 ? (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                            <Printer className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Printers Configured</h3>
                            <p className="text-gray-500 mb-4">Add a network printer to get started</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Add Your First Printer
                            </button>
                        </div>
                    ) : (
                        printers.map(printer => (
                            <div key={printer.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className={`p-2 bg-slate-700 rounded-lg ${getStatusColor(printer.status)}`}>
                                                {getConnectionIcon(printer.connectionType)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{printer.name}</h3>
                                                <p className="text-sm text-gray-400">{printer.ipAddress}:{printer.port}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${printer.status === PrinterStatus.CONNECTED ? 'bg-green-500/20 text-green-400' :
                                                    printer.status === PrinterStatus.ERROR ? 'bg-red-500/20 text-red-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {printer.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Type</p>
                                                <p className="text-sm text-white capitalize">{printer.type}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Paper Width</p>
                                                <p className="text-sm text-white">{printer.capabilities.paperWidth}mm</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Cutter</p>
                                                <p className="text-sm text-white">{printer.capabilities.cutter ? 'Yes' : 'No'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Cash Drawer</p>
                                                <p className="text-sm text-white">{printer.capabilities.cashDrawer ? 'Yes' : 'No'}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <select
                                                value={printer.type}
                                                onChange={(e) => handleConfigurePrinter(printer.id, e.target.value as PrinterType)}
                                                className="px-3 py-1.5 bg-slate-700 text-white text-sm rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value={PrinterType.RECEIPT}>Receipt Printer</option>
                                                <option value={PrinterType.KITCHEN}>Kitchen Printer</option>
                                                <option value={PrinterType.LABEL}>Label/Adjustment</option>
                                            </select>

                                            <button
                                                onClick={() => handleTestPrint(printer.id)}
                                                disabled={testingPrinter === printer.id}
                                                className="flex items-center space-x-1 px-3 py-1.5 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg transition-colors text-sm disabled:opacity-50"
                                            >
                                                <TestTube className="w-4 h-4" />
                                                <span>{testingPrinter === printer.id ? 'Testing...' : 'Test Print'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRemovePrinter(printer.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Printer Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-white mb-4">Add Network Printer</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Printer Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newPrinter.name}
                                        onChange={(e) => setNewPrinter({ ...newPrinter, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., Kitchen Printer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        IP Address
                                    </label>
                                    <input
                                        type="text"
                                        value={newPrinter.ip}
                                        onChange={(e) => setNewPrinter({ ...newPrinter, ip: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g., 192.168.1.100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Port
                                    </label>
                                    <input
                                        type="number"
                                        value={newPrinter.port}
                                        onChange={(e) => setNewPrinter({ ...newPrinter, port: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                        placeholder="9100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Printer Type
                                    </label>
                                    <select
                                        value={newPrinter.type}
                                        onChange={(e) => setNewPrinter({ ...newPrinter, type: e.target.value as PrinterType })}
                                        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value={PrinterType.RECEIPT}>Receipt Printer</option>
                                        <option value={PrinterType.KITCHEN}>Kitchen Printer</option>
                                        <option value={PrinterType.LABEL}>Label/Adjustment</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddPrinter}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add Printer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
