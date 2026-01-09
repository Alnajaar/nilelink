"use client";

import React, { useEffect, useCallback } from 'react';

export type HapticType = 'SUCCESS' | 'ERROR' | 'ALERT' | 'TICK';

interface HapticHUDProps {
    enabled?: boolean;
}

export const HapticHUD: React.FC<HapticHUDProps> = ({ enabled = true }) => {

    const triggerHaptic = useCallback((type: HapticType) => {
        if (!enabled || typeof window === 'undefined') return;

        // 1. Audio Feedback (Web Audio API)
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        switch (type) {
            case 'SUCCESS':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.2);
                break;
            case 'ERROR':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
                oscillator.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.2);
                break;
            case 'ALERT':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.3); // Multi-beep would be better
                break;
            case 'TICK':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.05);
                break;
        }

        // 2. Physical Haptic Feedback (Vibration API)
        if ('vibrate' in navigator) {
            switch (type) {
                case 'SUCCESS':
                    navigator.vibrate(50);
                    break;
                case 'ERROR':
                    navigator.vibrate([100, 50, 100]);
                    break;
                case 'ALERT':
                    navigator.vibrate([50, 50, 50]);
                    break;
                case 'TICK':
                    navigator.vibrate(10);
                    break;
            }
        }
    }, [enabled]);

    // Expose trigger to global window for easy access from non-React code (Engines)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).triggerNileLinkHaptic = triggerHaptic;
        }
    }, [triggerHaptic]);

    return null; // Silent HUD
};

/**
 * Helper to trigger haptics from anywhere
 */
export const triggerHaptic = (type: HapticType) => {
    if (typeof window !== 'undefined' && (window as any).triggerNileLinkHaptic) {
        (window as any).triggerNileLinkHaptic(type);
    }
};
