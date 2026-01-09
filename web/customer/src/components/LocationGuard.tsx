"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Bell } from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { useCustomer } from '@/contexts/CustomerContext';

export const LocationGuard = ({ children }: { children: React.ReactNode }) => {
    const { location, setLocation } = useCustomer();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEnableLocation = async () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setIsLoading(false);
            return;
        }

        // Request Notification Permission simultaneously
        if ('Notification' in window) {
            Notification.requestPermission();
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Mock Reverse Geocoding (In production, call Google Maps / Mapbox API)
                const mockAddress = "Zamalek, Cairo"; // Dynamic mock based on region?

                setLocation({
                    lat: latitude,
                    lng: longitude,
                    address: mockAddress
                });
                setIsLoading(false);
            },
            (err) => {
                console.error(err);
                setError('Unable to retrieve your location. Please enable location services manually.');
                setIsLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    if (location) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <Card className="max-w-md w-full p-8 text-center border-border-subtle shadow-2xl bg-white rounded-[32px]">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary animate-pulse">
                    <Navigation size={40} />
                </div>

                <h2 className="text-2xl font-black text-text-main mb-3 tracking-tight">
                    Where are you?
                </h2>

                <p className="text-text-muted font-medium mb-8 leading-relaxed">
                    NileLink needs your precise location to show you nearby restaurants and track your delivery in real-time.
                </p>

                {error && (
                    <div className="mb-6 p-4 bg-danger/10 text-danger rounded-xl text-sm font-bold">
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
                    Enable Location
                </Button>

                <p className="mt-6 text-[10px] text-text-subtle font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Bell size={12} />
                    Also enables order alerts
                </p>
            </Card>
        </div>
    );
};
