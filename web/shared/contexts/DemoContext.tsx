"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DemoContextType {
    isDemoMode: boolean;
    setDemoMode: (mode: boolean) => void;
    showDemoBanner: boolean;
    dismissDemoBanner: () => void;
    simulatedState: {
        tps: number;
        blockHeight: number;
        activeSignals: string[];
        currentStage: 'IDLE' | 'TERMINAL_TX' | 'AI_ANALYSIS' | 'FLEET_DISPATCH' | 'SETTLEMENT';
    };
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
    const [showDemoBanner, setShowDemoBanner] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [simulatedState, setSimulatedState] = useState({
        tps: 842.5,
        blockHeight: 19204300,
        activeSignals: [],
        currentStage: 'IDLE' as any
    });

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

    // Global Demo Simulation Tick
    useEffect(() => {
        if (!isDemoMode) return;

        const interval = setInterval(() => {
            setSimulatedState(prev => {
                const nextTps = 842.5 + (Math.random() * 50) - 25;
                const nextHeight = prev.blockHeight + 1;

                // Cycle through stages for demo feel if idling
                let nextStage = prev.currentStage;
                if (Math.random() > 0.9) {
                    const stages = ['IDLE', 'TERMINAL_TX', 'AI_ANALYSIS', 'FLEET_DISPATCH', 'SETTLEMENT'] as any[];
                    nextStage = stages[Math.floor(Math.random() * stages.length)];
                }

                return {
                    tps: nextTps,
                    blockHeight: nextHeight,
                    activeSignals: [`NODE_SYNC_${Math.floor(Math.random() * 100)}`, ...prev.activeSignals].slice(0, 3),
                    currentStage: nextStage
                };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isDemoMode]);

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
                simulatedState
            }}
        >
            {children}
        </DemoContext.Provider>
    );
};
