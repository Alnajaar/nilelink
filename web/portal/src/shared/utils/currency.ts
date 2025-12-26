/**
 * Currency Formatting Utilities for NileLink
 * Supports multi-tenant currency settings and real-time conversion.
 */

export interface CurrencySettings {
    code: string;
    symbol: string;
    precision: number;
    separator: string;
    decimal: string;
    format: string; // e.g., "%s %v"
}

export const DEFAULT_CURRENCY: CurrencySettings = {
    code: 'USD',
    symbol: '$',
    precision: 2,
    separator: ',',
    decimal: '.',
    format: '%s%v'
};

/**
 * Format a number to a currency string based on tenant settings.
 */
export const formatCurrency = (
    value: number,
    settings: CurrencySettings = DEFAULT_CURRENCY
): string => {
    const { symbol, precision, separator, decimal, format } = settings;

    const amount = value.toFixed(precision);
    const parts = amount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    const formattedValue = parts.join(decimal);

    return format.replace('%s', symbol).replace('%v', formattedValue);
};

/**
 * Convert an amount from one currency to another using provided rates.
 */
export const convertCurrency = (
    amount: number,
    fromRate: number, // Rate relative to USD (base)
    toRate: number
): number => {
    if (fromRate === 0) return 0;
    // (Amount in From / Rate From) * Rate To
    return (amount / fromRate) * toRate;
};
