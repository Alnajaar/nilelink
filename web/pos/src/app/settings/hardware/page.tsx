"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

interface Device {
    id: string;
    productName: string;
    manufacturerName: string;
    serialNumber?: string;
    type: 'printer' | 'scanner' | 'unknown';
}

export default function HardwareSettings() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Mock scanning for demo purposes (real WebUSB logic would go here)
    const scanForDevices = async () => {
        setIsSearching(true);
        // Simulate WebUSB requestDevice
        setTimeout(() => {
            const mockDevice: Device = {
                id: 'usb-1234',
                productName: 'TM-T20II Receipt Printer',
                manufacturerName: 'EPSON',
                serialNumber: 'EPS-XP-9921',
                type: 'printer'
            };
            setDevices(prev => [...prev, mockDevice]);
            setIsSearching(false);
        }, 1500);
    };

    const runTestPrint = (device: Device) => {
        alert(`🔔 Printing Test Page to ${device.productName} via ESC/POS protocol...`);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-primary-dark">Hardware Integration</h1>
                    <p className="text-primary-dark/60 mt-2">Manage physical terminals, printers, and scanners.</p>
                </div>
                <Button
                    variant="primary"
                    onClick={scanForDevices}
                    isLoading={isSearching}
                    leftIcon={
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                        </svg>
                    }
                >
                    Discover New Hardware
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary-dark">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Connected Devices ({devices.length})
                    </h2>

                    {devices.length === 0 ? (
                        <div className="py-12 text-center bg-black/5 rounded-2xl border-2 border-dashed border-black/10">
                            <p className="text-primary-dark/40 font-medium">No hardware devices detected.</p>
                            <p className="text-xs text-primary-dark/30 mt-1">Connect your USB receipt printer and click 'Discover'.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {devices.map(device => (
                                <div key={device.id} className="flex items-center justify-between p-4 bg-black/5 rounded-xl border border-black/5 hover:border-black/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-lg shadow-sm">
                                            {device.type === 'printer' ? (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M6 9V2H18V9" /><path d="M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18" /><path d="M18 14H6V22H18V14Z" />
                                                </svg>
                                            ) : (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M17 3.5V5H19V3.5" /><path d="M5 3.5V5H7V3.5" /><path d="M3 21H21" /><path d="M5 19H19" /><path d="M11 11H13V15H11V11Z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-primary-dark">{device.productName}</h4>
                                                <Badge size="sm" variant="info">USB</Badge>
                                            </div>
                                            <p className="text-xs text-primary-dark/50">{device.manufacturerName} • S/N: {device.serialNumber}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => runTestPrint(device)}>Test Print</Button>
                                        <Button variant="secondary" size="sm">Configure</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="text-lg font-bold mb-4 text-primary-dark">Protocol Settings</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 cursor-pointer transition-colors">
                                <div>
                                    <span className="block font-medium">ESC/POS (Standard)</span>
                                    <span className="text-xs text-primary-dark/40">Default for thermal printers.</span>
                                </div>
                                <input type="radio" name="protocol" defaultChecked className="accent-primary-dark" />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 cursor-pointer transition-colors">
                                <div>
                                    <span className="block font-medium">Star Graphics</span>
                                    <span className="text-xs text-primary-dark/40">For Star Micronics hardware.</span>
                                </div>
                                <input type="radio" name="protocol" className="accent-primary-dark" />
                            </label>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-bold mb-4 text-primary-dark">Automation</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 cursor-pointer transition-colors">
                                <div>
                                    <span className="block font-medium">Auto-Open Drawer</span>
                                    <span className="text-xs text-primary-dark/40">Trigger pulse on cash payment.</span>
                                </div>
                                <input type="checkbox" defaultChecked className="accent-primary-dark h-5 w-5 rounded" />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 cursor-pointer transition-colors">
                                <div>
                                    <span className="block font-medium">Kitchen Auto-Print</span>
                                    <span className="text-xs text-primary-dark/40">Direct print on new order.</span>
                                </div>
                                <input type="checkbox" className="accent-primary-dark h-5 w-5 rounded" />
                            </label>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
