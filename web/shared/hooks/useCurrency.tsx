"use client";

/**
 * Currency Hook - React integration for multi-currency support
 */

import { useState, useEffect } from 'react';
import { currencyService, Currency, CurrencyConversion } from '../services/CurrencyService';
// import { geospatialService } from '../services/GeospatialService'; // TODO: Implement GeospatialService

export interface UseCurrencyReturn {
    currentCurrency: string;
    currencies: Currency[];
    setCurrency: (code: string) => void;
    convert: (amount: number, fromCurrency?: string) => CurrencyConversion;
    formatAmount: (amount: number, currencyCode?: string) => string;
    isLoading: boolean;
    error: string | null;
}

export function useCurrency(): UseCurrencyReturn {
    const [currentCurrency, setCurrentCurrency] = useState<string>('USD');
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        initializeCurrency();
    }, []);

    const initializeCurrency = async () => {
        try {
            setIsLoading(true);

            // Get all currencies
            const allCurrencies = currencyService.getAllCurrencies();
            setCurrencies(allCurrencies);

            // Try to detect currency from stored preference
            const storedCurrency = localStorage.getItem('userCurrency');
            if (storedCurrency) {
                setCurrentCurrency(storedCurrency);
                setIsLoading(false);
                return;
            }

            // Try to detect from GPS location
            // TODO: Implement GPS-based currency detection
            try {
                // const locationValidation = await geospatialService.enforceGPSRequirement();
                // if (locationValidation.isValid && locationValidation.coordinates) {
                //     const detectedCurrency = await currencyService.detectCurrencyFromLocation(
                //         locationValidation.coordinates.latitude,
                //         locationValidation.coordinates.longitude
                //     );
                //     if (detectedCurrency) {
                //         setCurrentCurrency(detectedCurrency);
                //         localStorage.setItem('userCurrency', detectedCurrency);
                //         setIsLoading(false);
                //         return;
                //     }
                // }
            } catch (gpsError) {
                console.warn('GPS-based currency detection failed:', gpsError);
            }

            // Try to detect from browser locale
            const browserLocale = navigator.language || 'en-US';
            const countryCode = browserLocale.split('-')[1];

            if (countryCode) {
                const detectedCurrency = currencyService.detectCurrencyFromCountry(countryCode);
                setCurrentCurrency(detectedCurrency);
                localStorage.setItem('userCurrency', detectedCurrency);
            }

            setIsLoading(false);

        } catch (err) {
            console.error('Currency initialization failed:', err);
            setError('Failed to initialize currency');
            setCurrentCurrency('USD'); // Fallback to USD
            setIsLoading(false);
        }
    };

    const setCurrency = (code: string) => {
        setCurrentCurrency(code);
        localStorage.setItem('userCurrency', code);
    };

    const convert = (amount: number, fromCurrency?: string): CurrencyConversion => {
        return currencyService.convert(
            amount,
            fromCurrency || 'USD',
            currentCurrency
        );
    };

    const formatAmount = (amount: number, currencyCode?: string): string => {
        return currencyService.formatAmount(amount, currencyCode || currentCurrency);
    };

    return {
        currentCurrency,
        currencies,
        setCurrency,
        convert,
        formatAmount,
        isLoading,
        error
    };
}

/**
 * Currency Selector Component
 */
export interface CurrencySelectorProps {
    value: string;
    onChange: (currency: string) => void;
    className?: string;
    showFlag?: boolean;
}

export function CurrencySelector({ value, onChange, className = '', showFlag = true }: CurrencySelectorProps) {
    const { currencies } = useCurrency();
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredCurrencies = currencies.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase())
    );

    const selectedCurrency = currencies.find(c => c.code === value);

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-background-subtle border border-border-subtle rounded-2xl text-text-main font-bold hover:border-primary transition-colors"
            >
                <div className="flex items-center gap-3">
                    {selectedCurrency && (
                        <>
                            <span className="text-2xl">{selectedCurrency.symbol}</span>
                            <div className="text-left">
                                <div className="font-black">{selectedCurrency.code}</div>
                                <div className="text-xs text-text-muted">{selectedCurrency.name}</div>
                            </div>
                        </>
                    )}
                </div>
                <svg className="w-5 h-5 text-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-border-subtle rounded-2xl shadow-2xl max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                        <input
                            type="text"
                            placeholder="Search currency..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 bg-background-subtle border border-border-subtle rounded-xl text-text-main font-medium placeholder:text-text-subtle/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="overflow-y-auto max-h-80 custom-scrollbar">
                        {filteredCurrencies.map((currency) => (
                            <button
                                key={currency.code}
                                onClick={() => {
                                    onChange(currency.code);
                                    setIsOpen(false);
                                    setSearch('');
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-background-subtle transition-colors ${currency.code === value ? 'bg-primary/10' : ''
                                    }`}
                            >
                                <span className="text-2xl">{currency.symbol}</span>
                                <div className="flex-1 text-left">
                                    <div className="font-black text-text-main">{currency.code}</div>
                                    <div className="text-xs text-text-muted">{currency.name}</div>
                                    <div className="text-xs text-text-subtle">{currency.country}</div>
                                </div>
                                {currency.code === value && (
                                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
