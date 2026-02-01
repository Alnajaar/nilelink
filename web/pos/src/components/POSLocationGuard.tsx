"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, ShieldCheck, AlertOctagon, Anchor } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { usePOS } from '@/contexts/POSContext';

export const POSLocationGuard = ({ children }: { children: React.ReactNode }) => {
    // Check localStorage immediately to prevent modal flash
    const [isAnchored, setIsAnchored] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('nilelink_pos_anchored') === 'true';
        }
        return false;
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnchorTerminal = async () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geospatial module not found.');
            setIsLoading(false);
            return;
        }

        // POS requires high accuracy to establish the "Drop Point" for drivers
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // In production: Save this to the Node Registry
                console.log(`POS Anchored at: ${latitude}, ${longitude}`);

                localStorage.setItem('nilelink_pos_anchored', 'true');
                setIsAnchored(true);
                setIsLoading(false);
            },
            (err) => {
                console.error(err);
                setError('Terminal must be anchored to a physical location. Please enable GPS.');
                setIsLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    // Auto-anchor in development environment
    useEffect(() => {
        if (typeof window !== 'undefined' && !isAnchored) {
            // Check if we're in development mode
            const isDev = process.env.NODE_ENV === 'development' || typeof window !== 'undefined' && window.location.hostname === 'localhost';
            
            if (isDev) {
                // Auto-anchor in development
                localStorage.setItem('nilelink_pos_anchored', 'true');
                setIsAnchored(true);
            }
        }
    }, [isAnchored]);

    if (isAnchored) {
        return (
            <div className="min-h-screen flex flex-col">
                {children}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-primary text-white">
            {/* Matrix-like background effect */}
            <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-[scan_3s_linear_infinite]"></div>
            </div>

            <Card className="max-w-lg w-full p-10 text-center border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.1)] bg-primary/90 rounded-[2rem]">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-lg shadow-emerald-500/10 relative">
                    <span className="absolute inset-0 rounded-full border border-emerald-500/50 animate-ping"></span>
                    <Anchor size={48} className="text-emerald-400" />
                </div>

                <h2 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">
                    Terminal Setup
                </h2>

                <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-6 mb-8 text-left">
                    <div className="flex gap-4 mb-3">
                        <AlertOctagon className="text-emerald-400 shrink-0" size={24} />
                        <h4 className="font-bold text-xl text-emerald-100">Location Anchor Required</h4>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        To participate in the <strong>Economic OS</strong>, this Point of Sale terminal must cryptographically anchor itself to a precise physical coordinate.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400/80 font-mono">
                        <ShieldCheck size={12} />
                        <span>Enables Last-Mile Driver Routing</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wide">
                        {error}
                    </div>
                )}

                <Button
                    onClick={handleAnchorTerminal}
                    isLoading={isLoading}
                    size="lg"
                    className="w-full font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-slate-900 shadow-xl shadow-emerald-500/20 h-16 rounded-2xl text-lg"
                >
                    <MapPin size={24} className="mr-2" />
                    Anchor Terminal Here
                </Button>
            </Card>
        </div>
    );
};