'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';

export type BusinessType = 'SUPERMARKET' | 'RESTAURANT' | 'CAFE' | 'RETAIL';

interface BusinessContextType {
    businessType: BusinessType;
    setBusinessType: (type: BusinessType) => void;
    isSupermarket: boolean;
    isRestaurant: boolean;
    isCafe: boolean;
    isRetail: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [businessType, setBusinessType] = useState<BusinessType>('RESTAURANT'); // Default

    useEffect(() => {
        // Sync with user metadata or local storage
        const storedType = localStorage.getItem('nilelink_business_type') as BusinessType;
        if (storedType) {
            setBusinessType(storedType);
        } else if (user?.role === 'ADMIN' || user?.role === 'OWNER') {
            // Logic to infer type from business metadata if available
        }
    }, [user]);

    const handleSetType = (type: BusinessType) => {
        setBusinessType(type);
        localStorage.setItem('nilelink_business_type', type);
    };

    const value: BusinessContextType = {
        businessType,
        setBusinessType: handleSetType,
        isSupermarket: businessType === 'SUPERMARKET',
        isRestaurant: businessType === 'RESTAURANT',
        isCafe: businessType === 'CAFE',
        isRetail: businessType === 'RETAIL'
    };

    return (
        <BusinessContext.Provider value={value}>
            {children}
        </BusinessContext.Provider>
    );
};

export const useBusiness = () => {
    const context = useContext(BusinessContext);
    if (context === undefined) {
        throw new Error('useBusiness must be used within a BusinessProvider');
    }
    return context;
};
