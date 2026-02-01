import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

interface CurrencyDisplayProps {
    amount: number; // Always in USD Base
    className?: string;
    hideSymbol?: boolean;
    forceEsatblishedCurrency?: boolean; // If true, ignore toggle and show what's passed (not used currently but good for future)
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
    amount,
    className = '',
    hideSymbol = false
}) => {
    const { formatPrice } = useCurrency();

    return (
        <span className={`font-mono ${className}`}>
            {formatPrice(amount, { hideSymbol })}
        </span>
    );
};

