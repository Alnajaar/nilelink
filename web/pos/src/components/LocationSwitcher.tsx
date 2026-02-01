'use client';

import React, { useEffect, useState } from 'react';
import { usePOS } from '@/contexts/POSContext';
import { useAuth } from '@shared/providers/AuthProvider';
import graphService from '@shared/services/GraphService';
import { MapPin, ChevronDown, Check, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function LocationSwitcher() {
    const { restaurantId, setRestaurantId } = usePOS();
    const { address, isConnected } = useAuth();
    const [locations, setLocations] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchLocations() {
            if (!address || !isConnected) return;
            setLoading(true);
            try {
                const profile = await graphService.getUserProfile(address);
                if (profile && profile.user && profile.user.ownedRestaurants) {
                    setLocations(profile.user.ownedRestaurants);

                    // Set default if none selected
                    if (!restaurantId && profile.user.ownedRestaurants.length > 0) {
                        setRestaurantId(profile.user.ownedRestaurants[0].id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch locations:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchLocations();
    }, [address, isConnected, restaurantId, setRestaurantId]);

    const currentLocation = locations.find(l => l.id === restaurantId);

    if (locations.length <= 1 && !loading) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-500 transition-colors"
            >
                <Store className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-700 max-w-[150px] truncate">
                    {currentLocation ? `Branch: ${currentLocation.id.slice(0, 8)}...` : 'Select Location'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        <div className="p-2">
                            <p className="text-xs font-semibold text-gray-500 px-3 py-2 uppercase tracking-wider">
                                Switch Business Location
                            </p>
                            <div className="space-y-1">
                                {locations.map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => {
                                            setRestaurantId(loc.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${restaurantId === loc.id
                                                ? 'bg-blue-50 text-blue-700 font-bold'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <MapPin className={`w-4 h-4 ${restaurantId === loc.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <span className="truncate">{loc.id}</span>
                                        </div>
                                        {restaurantId === loc.id && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 border-t">
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                                + Register New Location
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
