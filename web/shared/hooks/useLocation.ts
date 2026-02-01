'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    error: string | null;
    loading: boolean;
    timestamp: number | null;
    city?: string;
    country?: string;
}

export function useLocation() {
    const [state, setState] = useState<LocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
        loading: true,
        timestamp: null
    });

    const updateLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setState(prev => ({ ...prev, error: 'Geolocation not supported', loading: false }));
            return;
        }

        setState(prev => ({ ...prev, loading: true }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                // Regional hub resolver based on coordinates
                // Automatically identifies operational hubs for NileLink launch
                let city = 'Cairo';
                let country = 'Egypt';

                if (latitude > 24 && latitude < 32 && longitude > 25 && longitude < 35) {
                    city = 'Cairo';
                    country = 'Egypt';
                } else if (latitude > 22 && latitude < 26 && longitude > 51 && longitude < 57) {
                    city = 'Dubai';
                    country = 'UAE';
                }

                setState({
                    latitude,
                    longitude,
                    accuracy,
                    error: null,
                    loading: false,
                    timestamp: position.timestamp,
                    city,
                    country
                });
            },
            (error) => {
                setState(prev => ({
                    ...prev,
                    error: error.message,
                    loading: false
                }));
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }, []);

    useEffect(() => {
        updateLocation();
    }, [updateLocation]);

    return { ...state, updateLocation };
}
