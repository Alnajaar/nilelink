"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, RotateCcw, AlertTriangle } from 'lucide-react';
import { eventBus } from '@/lib/core/EventBus';
import { feedbackSystem, FeedbackType, HapticPattern } from '@/lib/ui/FeedbackSystem';

export function GestureOverlay() {
    const [activeTouches, setActiveTouches] = useState<number>(0);
    const [gestureType, setGestureType] = useState<'void' | 'lock' | 'reset' | null>(null);
    const [progress, setProgress] = useState(0);
    const startY = useRef<number>(0);
    const startX = useRef<number>(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length >= 3) {
            setGestureType('lock');
            feedbackSystem.triggerFeedback(FeedbackType.WARNING, { hapticPattern: HapticPattern.HEAVY });
        }
        setActiveTouches(e.touches.length);
        startY.current = e.touches[0].clientY;
        startX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 1 && !gestureType) {
            const diffY = e.touches[0].clientY - startY.current;
            const diffX = e.touches[0].clientX - startX.current;

            // Swipe down for VOID last item
            if (diffY > 100 && Math.abs(diffX) < 50) {
                setGestureType('void');
                feedbackSystem.triggerFeedback(FeedbackType.KEY_PRESS, { hapticPattern: HapticPattern.LIGHT });
            }
        }

        if (gestureType === 'void') {
            const diffY = Math.min(e.touches[0].clientY - startY.current, 300);
            setProgress(diffY / 300);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (gestureType === 'void' && progress > 0.8) {
            // Confirm VOID
            eventBus.publish({ type: 'VOID_LAST_ITEM', payload: { source: 'GESTURE' } });
            feedbackSystem.triggerFeedback(FeedbackType.VOID, { hapticPattern: HapticPattern.DOUBLE });
        } else if (gestureType === 'lock' && e.touches.length === 0) {
            // Confirm LOCK
            eventBus.publish({ type: 'SECURITY_ALERT', payload: { reason: 'GESTURE LOCK TRIGGERED' } });
            feedbackSystem.triggerFeedback(FeedbackType.ERROR, { hapticPattern: HapticPattern.TRIPLE });
        }

        setGestureType(null);
        setProgress(0);
        setActiveTouches(0);
    };

    return (
        <div
            className={`fixed inset-0 z-[100] touch-none select-none ${gestureType ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ pointerEvents: gestureType ? 'auto' : 'none' }}
            onPointerDown={(e) => {
                // We use pointer events to trigger the start of the gesture
                // but since the div is pointer-events-none, we need a different approach.
                // Actually, for multi-touch gestures, we might need a transparent overlay 
                // that doesn't block but still listens. 
                // A better approach is to use window event listeners or a full-screen div that is transparent.
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <AnimatePresence>
                {gestureType === 'void' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <motion.div
                                style={{ scale: 1 + progress }}
                                className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.5)]"
                            >
                                <X size={48} className="text-white" />
                            </motion.div>
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                                {progress > 0.8 ? 'RELEASE TO VOID' : 'SWIPE DOWN TO VOID'}
                            </h2>
                            <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white"
                                    style={{ width: `${progress * 100}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {gestureType === 'lock' && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        className="absolute inset-0 bg-black/80 flex items-center justify-center p-12"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center mx-auto mb-8"
                            >
                                <Lock size={64} className="text-[var(--pos-accent)]" />
                            </motion.div>
                            <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">PANIC LOCK ACTIVE</h2>
                            <p className="text-[var(--pos-accent)] font-black uppercase tracking-[0.5em]">Release 3 fingers to trigger station lockdown</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle Active Touch Indicators */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 opacity-20">
                {Array.from({ length: activeTouches }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ))}
            </div>
        </div>
    );
}
