"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Bell, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';

export const DriverLocationGuard = ({ children }: { children: React.ReactNode }) => {
    // In a real app we would use a context, but local state is fine for this demo wrapper
    const [hasLocation, setHasLocation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Persist location grant
    useEffect(() => {
        const granted = sessionStorage.getItem('nilelink_driver_location_granted');
        if (granted) setHasLocation(true);
    }, []);

    const handleEnableLocation = async () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your device.');
            setIsLoading(false);
            return;
        }

        // Request Background Location & Notification Permission
        // In a real mobile app (PWA/Native), this would request "Always Allow"
        if ('Notification' in window) {
            await Notification.requestPermission();
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                sessionStorage.setItem('nilelink_driver_location_granted', 'true');
                setHasLocation(true);
                setIsLoading(false);
            },
            (err) => {
                console.error(err);
                setError('High-accuracy GPS is mandatory for the Delivery Protocol. Please enable it in system settings.');
                setIsLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    if (hasLocation) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/90 backdrop-blur-xl">
            <Card className="max-w-md w-full p-8 text-center border-border-subtle shadow-2xl bg-white rounded-[32px]">
                <div className="relative mx-auto mb-8 w-24 h-24">
                    <span className="absolute inset-0 rounded-full border-4 border-error/30 animate-ping"></span>
                    <div className="absolute inset-0 bg-primary/10 rounded-full flex items-center justify-center text-primary border-4 border-white shadow-xl">
                        <Navigation size={48} />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-text-main mb-3 tracking-tight">
                    Mission Critical
                </h2>

                <div className="bg-warning/10 rounded-xl p-4 mb-6 text-left">
                    <div className="flex gap-3 mb-2">
                        <AlertTriangle className="text-warning shrink-0" size={20} />
                        <h4 className="font-bold text-lg text-text-main">GPS Required</h4>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed font-medium">
                        To participate in the <strong>NileLink Delivery Protocol</strong>, your device must broadcast high-accuracy location data to verify proof-of-transit.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-danger/10 text-danger rounded-xl text-xs font-bold uppercase tracking-wide">
                        {error}
                    </div>
                )}

                <Button
                    onClick={handleEnableLocation}
                    isLoading={isLoading}
                    size="lg"
                    className="w-full font-black uppercase tracking-widest shadow-xl shadow-primary/20 h-14 rounded-2xl"
                >
                    <MapPin size={20} className="mr-2" />
                    Activate GPS Node
                </Button>

                <p className="mt-6 text-[10px] text-text-subtle font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Bell size={12} />
                    Granting protocol access
                </p>
            </Card>
        </div>
    );
};
