import React from 'react';

interface CurrencyDisplayProps {
    amount: number;
    currency?: 'USD' | 'NILE' | 'ETH';
    decimals?: number;
    showSymbol?: boolean;
    className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
    amount,
    currency = 'USD',
    decimals = 2,
    showSymbol = true,
    className = ''
}) => {
    const formatValue = (val: number, cur: string) => {
        if (cur === 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: showSymbol ? 'currency' : 'decimal',
                currency: 'USD',
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            }).format(val);
        }

        // Crypto formatting
        return `${val.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        })} ${showSymbol ? cur : ''}`;
    };

    return (
        <span className={`font-mono ${className}`}>
            {formatValue(amount, currency)}
        </span>
    );
};
