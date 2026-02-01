// DEPRECATED: This component has been replaced by GlobalNavbar
// All instances should be updated to use GlobalNavbar instead
// This file will be removed in a future update

import React from 'react';

interface UniversalHeaderProps {
    appName?: string;
    links?: { href: string; label: string }[];
    user?: {
        name: string;
        role: string;
        avatar?: string;
    };
    onLogin?: () => void;
    onLogout?: () => void;
    status?: 'online' | 'offline' | 'syncing' | 'error';
    lastSynced?: string;
}

export const UniversalHeader: React.FC<UniversalHeaderProps> = (props) => {
    console.warn('UniversalHeader is deprecated. Please use GlobalNavbar instead.');

    // Return null to prevent rendering - this forces developers to update their imports
    return null;
};
