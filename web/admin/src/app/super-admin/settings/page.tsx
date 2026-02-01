'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '@shared/components/GlassCard';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { toast } from 'react-hot-toast';
import {
    Settings,
    Shield,
    Globe,
    Zap,
    Cpu,
    Brain,
    Save,
    RefreshCw,
    Database,
    Lock
} from 'lucide-react';
import { useAuth } from '@shared/providers/AuthProvider';

export default function SystemSettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        protocolFee: 1.5,
        dailyVolumeLimit: 500000,
        maintenanceMode: false,
        aiServiceUrl: 'http://localhost:8000',
        enableFraudDetection: true,
        nodeSyncInterval: 30,
        gasOptimizationLevel: 'Aggressive'
    });

    useEffect(() => {
        // Load settings from API/DB
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            // In a real app, this would be an API call
            // Using simulated load for now to demonstrate UI
            setTimeout(() => {
                setLoading(false);
            }, 800);
        } catch (error) {
            toast.error('Failed to load system settings');
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // API Call: POST /api/admin/settings
            await new Promise(r => setTimeout(r, 1500));
            toast.success('System Configuration Synchronized');
        } catch (error) {
            toast.error('Failed to update protocol parameters');
        } finally {
            setSaving(false);
        }
    };

    if (!user || user.role !== 'SUPER_ADMIN') {
        return <div className="p-20 text-center text-white font-black uppercase italic tracking-widest">Access Denied</div>;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-black uppercase text-[10px] tracking-[0.3em]">Accessing Core Registry...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-blue-500">
                        <Cpu size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol Layer 0</span>
                    </div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                        Platform <span className="text-blue-500">Settings</span>
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">Fine-tune internal mechanisms and governance parameters.</p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-900/30 flex items-center gap-3 rounded-2xl"
                >
                    {saving ? <RefreshCw className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Synchronizing...' : 'Save Configuration'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Parameters */}
                <GlassCard className="p-8 border border-white/5">
                    <h3 className="text-xl font-black text-white uppercase italic mb-6 flex items-center gap-3">
                        <Zap className="text-yellow-500" /> Financial Treasury
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Protocol Fee (%)</label>
                            <input
                                type="number"
                                value={settings.protocolFee}
                                onChange={(e) => setSettings({ ...settings, protocolFee: parseFloat(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white font-black italic focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Daily Volume Hard-Cap (USD)</label>
                            <input
                                type="number"
                                value={settings.dailyVolumeLimit}
                                onChange={(e) => setSettings({ ...settings, dailyVolumeLimit: parseInt(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white font-black italic focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* AI & Intelligence */}
                <GlassCard className="p-8 border border-white/5">
                    <h3 className="text-xl font-black text-white uppercase italic mb-6 flex items-center gap-3">
                        <Brain className="text-purple-500" /> Neural Network
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">AI Service Endpoint</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={settings.aiServiceUrl}
                                    onChange={(e) => setSettings({ ...settings, aiServiceUrl: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-6 py-4 text-white font-black focus:outline-none focus:border-blue-500/50"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <div>
                                <p className="text-sm font-black text-white uppercase italic">Active Fraud Detection</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time risk scoring for nodes</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, enableFraudDetection: !settings.enableFraudDetection })}
                                className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${settings.enableFraudDetection ? 'bg-blue-600' : 'bg-white/10'}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform ${settings.enableFraudDetection ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {/* Infrastructure */}
                <GlassCard className="p-8 border border-white/5">
                    <h3 className="text-xl font-black text-white uppercase italic mb-6 flex items-center gap-3">
                        <Database className="text-blue-500" /> Infrastructure
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Node Sync Interval (sec)</label>
                            <input
                                type="number"
                                value={settings.nodeSyncInterval}
                                onChange={(e) => setSettings({ ...settings, nodeSyncInterval: parseInt(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white font-black italic focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Gas Policy</label>
                            <select
                                value={settings.gasOptimizationLevel}
                                onChange={(e) => setSettings({ ...settings, gasOptimizationLevel: e.target.value })}
                                className="w-full bg-[#02050a] border border-white/10 rounded-xl px-6 py-4 text-white font-black uppercase text-[10px] tracking-widest focus:outline-none focus:border-blue-500/50 appearance-none"
                            >
                                <option>Conservative</option>
                                <option>Standard</option>
                                <option>Aggressive</option>
                            </select>
                        </div>
                    </div>
                </GlassCard>

                {/* Safety & Protocol Security */}
                <GlassCard className="p-8 border-red-500/20 bg-red-500/5">
                    <h3 className="text-xl font-black text-white uppercase italic mb-6 flex items-center gap-3">
                        <Lock className="text-red-500" /> Dangerous Area
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                            <div>
                                <p className="text-sm font-black text-red-500 uppercase italic">Protocol Maintenance Mode</p>
                                <p className="text-[10px] text-red-400/60 font-bold uppercase tracking-widest mt-1">Disables all non-critical transactions</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${settings.maintenanceMode ? 'bg-red-600' : 'bg-white/10'}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <Button className="w-full h-12 bg-transparent border border-red-500/20 hover:bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">
                            Purge System Cache
                        </Button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
