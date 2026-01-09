"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DemoContextType {
    isDemoMode: boolean;
    setDemoMode: (mode: boolean) => void;
    showDemoBanner: boolean;
    dismissDemoBanner: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemo = () => {
    const context = useContext(DemoContext);
    if (!context) {
        throw new Error('useDemo must be used within DemoProvider');
    }
    return context;
};

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDemoMode, setIsDemoMode] = useState(true);
    const [showDemoBanner, setShowDemoBanner] = useState(false); // Hide by default until checked
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedMode = localStorage.getItem('nilelink_demo_mode');
        if (savedMode === 'false') {
            setIsDemoMode(false);
        } else {
            setIsDemoMode(true);
            setShowDemoBanner(true);
        }
    }, []);

    const setDemoMode = (mode: boolean) => {
        setIsDemoMode(mode);
        setShowDemoBanner(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('nilelink_demo_mode', mode.toString());
        }
    };

    const dismissDemoBanner = () => {
        setShowDemoBanner(false);
    };

    return (
        <DemoContext.Provider
            value={{
                isDemoMode,
                setDemoMode,
                showDemoBanner,
                dismissDemoBanner,
            }}
        >
            {children}
        </DemoContext.Provider>
    );
};