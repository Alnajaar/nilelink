// Security Risk HUD Component
// Real-time visualization of AI-driven security status
import React, { useState, useEffect } from 'react';
import { eventBus, EventTypes } from '../../lib/core/EventBus';
import { SecurityThreatLevel } from '../../../../shared/lib/ai/SecurityAgentManager';

interface SecurityRiskHUDProps {
    className?: string;
}

const SecurityRiskHUD: React.FC<SecurityRiskHUDProps> = ({ className = '' }) => {
    const [threatLevel, setThreatLevel] = useState<SecurityThreatLevel>(SecurityThreatLevel.STABLE);
    const [lastThreatAt, setLastThreatAt] = useState<number | null>(null);
    const [recentConcerns, setRecentConcerns] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Subscribe to security threat events
        const subId = eventBus.subscribe(EventTypes.SECURITY_THREAT_DETECTED, (event) => {
            const { threatLevel: level, concerns, isBlocked } = event.payload;

            setThreatLevel(level);
            if (concerns && concerns.length > 0) {
                setRecentConcerns(prev => [...new Set([...concerns, ...prev])].slice(0, 5));
            }
            setLastThreatAt(Date.now());

            // Show HUD if threat is elevated or higher
            if (level !== SecurityThreatLevel.STABLE || isBlocked) {
                setIsVisible(true);
            }
        });

        // Hide HUD after 30 seconds of stability if it was visible
        const timer = setInterval(() => {
            if (threatLevel === SecurityThreatLevel.STABLE && lastThreatAt && (Date.now() - lastThreatAt > 30000)) {
                setIsVisible(false);
            }
        }, 5000);

        return () => {
            eventBus.unsubscribe(subId);
            clearInterval(timer);
        };
    }, [threatLevel, lastThreatAt]);

    const getStatusColor = () => {
        switch (threatLevel) {
            case SecurityThreatLevel.STABLE: return 'text-green-500 bg-green-500/10 border-green-500/20';
            case SecurityThreatLevel.ELEVATED: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case SecurityThreatLevel.HIGH: return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case SecurityThreatLevel.CRITICAL: return 'text-red-500 bg-red-500/10 border-red-500/20';
            case SecurityThreatLevel.EMERGENCY: return 'text-red-600 bg-red-600/20 border-red-600/30 animate-pulse';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getStatusIcon = () => {
        switch (threatLevel) {
            case SecurityThreatLevel.STABLE: return '🛡️';
            case SecurityThreatLevel.ELEVATED: return '⚠️';
            case SecurityThreatLevel.HIGH: return '🔥';
            case SecurityThreatLevel.CRITICAL: return '🚨';
            case SecurityThreatLevel.EMERGENCY: return '☣️';
            default: return '🤖';
        }
    };

    if (!isVisible && threatLevel === SecurityThreatLevel.STABLE) return null;

    return (
        <div className={`fixed bottom-24 right-6 w-80 glass-v2 border p-4 rounded-xl shadow-2xl transition-all duration-500 z-40 ${getStatusColor()} ${className}`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getStatusIcon()}</span>
                    <div>
                        <h4 className="font-bold text-sm tracking-widest uppercase">AI Security HUD</h4>
                        <p className="text-[10px] opacity-80 font-medium">REAL-TIME THREAT ANALYSIS</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-black/10 border border-white/10">
                        {threatLevel}
                    </span>
                    {lastThreatAt && (
                        <span className="text-[8px] opacity-60 mt-1">
                            UPDATED: {new Date(lastThreatAt).toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            {recentConcerns.length > 0 && (
                <div className="space-y-2 mt-4">
                    <p className="text-[9px] font-bold uppercase tracking-tighter opacity-50">Active Concerns</p>
                    {recentConcerns.map((concern, idx) => (
                        <div key={idx} className="flex items-start space-x-2 bg-black/5 p-2 rounded border border-white/5">
                            <span className="text-[10px] mt-0.5">🔹</span>
                            <p className="text-[11px] leading-tight font-medium">{concern}</p>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                    <div className={`w-2 h-2 rounded-full ${threatLevel === SecurityThreatLevel.STABLE ? 'bg-green-500' : 'bg-red-500 animate-ping'}`} />
                    <span className="text-[10px] font-bold uppercase">Defense Active</span>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-[10px] font-bold uppercase opacity-50 hover:opacity-100 transition-opacity"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};

export default SecurityRiskHUD;
