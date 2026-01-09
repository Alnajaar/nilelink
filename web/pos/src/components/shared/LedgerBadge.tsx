import React from 'react';
import { Badge } from './Badge';

interface LedgerBadgeProps {
    verified: boolean;
    hash?: string;
}

export const LedgerBadge: React.FC<LedgerBadgeProps> = ({ verified, hash }) => {
    if (!verified) {
        return (
            <Badge variant="neutral" className="opacity-50">
                Unverified
            </Badge>
        );
    }

    return (
        <div
            className={`inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border border-success/20 bg-success/10 text-success`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-medium">Ledger Verified</span>
            {hash && (
                <span className="text-[10px] font-mono opacity-50 border-l border-green-200 pl-1.5 ml-0.5">
                    {hash.slice(0, 6)}...
                </span>
            )}
        </div>
    );
};
