"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'EGP' | 'KES' | 'NGN' | 'ZAR';

interface CurrencyContextType {
    baseCurrency: 'USD';
    localCurrency: CurrencyCode;
    exchangeRate: number;
    useLocalCurrency: boolean;
    setLocalCurrency: (code: CurrencyCode) => void;
    setExchangeRate: (rate: number) => void;
    toggleCurrencyMode: () => void;
    formatPrice: (amountInUsd: number) => string;
    convertPrice: (amountInUsd: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
    children: ReactNode;
    defaultLocalCurrency?: CurrencyCode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({
    children,
    defaultLocalCurrency = 'AED'
}) => {
    // State persistence could be added with localStorage
    const [localCurrency, setLocalCurrency] = useState<CurrencyCode>(defaultLocalCurrency);
    const [exchangeRate, setExchangeRate] = useState<number>(1.0); // 1 USD = X Local
    const [useLocalCurrency, setUseLocalCurrency] = useState<boolean>(false);

    // Initial load from local storage
    useEffect(() => {
        const savedRate = localStorage.getItem('nilelink_exchange_rate');
        const savedCurrency = localStorage.getItem('nilelink_local_currency') as CurrencyCode;
        const savedMode = localStorage.getItem('nilelink_use_local_currency');

        if (savedRate) setExchangeRate(parseFloat(savedRate));
        if (savedCurrency) setLocalCurrency(savedCurrency);
        if (savedMode === 'true') setUseLocalCurrency(true);
    }, []);

    // Persist changes
    useEffect(() => {
        localStorage.setItem('nilelink_exchange_rate', exchangeRate.toString());
        localStorage.setItem('nilelink_local_currency', localCurrency);
        localStorage.setItem('nilelink_use_local_currency', useLocalCurrency.toString());
    }, [exchangeRate, localCurrency, useLocalCurrency]);

    const toggleCurrencyMode = () => setUseLocalCurrency(prev => !prev);

    const convertPrice = (amountInUsd: number) => {
        return amountInUsd * exchangeRate;
    };

    const formatPrice = (amountInUsd: number) => {
        const currency = useLocalCurrency ? localCurrency : 'USD';
        const value = useLocalCurrency ? amountInUsd * exchangeRate : amountInUsd;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <CurrencyContext.Provider value={{
            baseCurrency: 'USD',
            localCurrency,
            exchangeRate,
            useLocalCurrency,
            setLocalCurrency,
            setExchangeRate,
            toggleCurrencyMode,
            formatPrice,
            convertPrice
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};