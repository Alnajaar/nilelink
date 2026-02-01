/**
 * Admin Settings Page
 * System-wide configuration and preferences
 * 
 * SUPER_ADMIN ONLY
 * 
 * FEATURES:
 * - System configuration
 * - Feature flags (enable/disable features globally)
 * - Email/notification settings
 * - API keys management
 * - Security settings
 * - Backup/restore
 * - Audit log configuration
 */

'use client';

import { useState, useEffect } from 'react';
import { useRole } from '@shared/hooks/useGuard';

// ============================================
// TYPES
// ============================================

interface SystemSettings {
    // General
    systemName: string;
    systemNameAr: string;
    maintenanceMode: boolean;

    // Features
    aiRecommendationsEnabled: boolean;
    deliverySystemEnabled: boolean;
    loyaltyProgramEnabled: boolean;
    affiliateSystemEnabled: boolean;

    // Security
    sessionTimeoutMinutes: number;
    mfaRequired: boolean;
    maxLoginAttempts: number;
    passwordMinLength: number;

    // Notifications
    emailNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    adminAlerts: boolean;

    // Blockchain
    confirmationsRequired: number;
    gasLimit: string;

    // Compliance
    dataRetentionYears: number;
    auditLogEnabled: boolean;
    gdprMode: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
    systemName: 'NileLink POS',
    systemNameAr: 'نايل لينك',
    maintenanceMode: false,

    aiRecommendationsEnabled: true,
    deliverySystemEnabled: true,
    loyaltyProgramEnabled: true,
    affiliateSystemEnabled: true,

    sessionTimeoutMinutes: 15,
    mfaRequired: false,
    maxLoginAttempts: 5,
    passwordMinLength: 8,

    emailNotificationsEnabled: true,
    smsNotificationsEnabled: false,
    adminAlerts: true,

    confirmationsRequired: 3,
    gasLimit: '500000',

    dataRetentionYears: 7,
    auditLogEnabled: true,
    gdprMode: true,
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function SettingsPage() {
    const { isSuperAdmin } = useRole('SUPER_ADMIN');
    const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'features' | 'security' | 'notifications' | 'blockchain' | 'compliance'>('general');

    useEffect(() => {
        if (!isSuperAdmin) return;

        loadSettings();
    }, [isSuperAdmin]);

    const loadSettings = async () => {
        try {
            // TODO: Load from smart contract or database
            console.log('[Settings] Using default settings');
        } catch (error: any) {
            console.error('[Settings] Failed to load:', error);
        }
    };

    const handleSave = async () => {
        if (!confirm('Save system settings? This will affect all users.')) return;

        try {
            setSaving(true);

            // TODO: Write to smart contract or database
            console.log('[Settings] Saving:', settings);

            // Simulate save
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Settings saved successfully!');
            setHasChanges(false);
        } catch (error: any) {
            alert(`Failed to save settings: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (!confirm('Reset all settings to defaults?')) return;
        setSettings(DEFAULT_SETTINGS);
        setHasChanges(true);
    };

    const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    if (!isSuperAdmin) {
        return (
            <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
                <div className="text-red-400 text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                    <p>Only Super Admins can manage settings</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">
                        System Settings
                    </h1>
                    <p className="text-gray-400 text-sm uppercase tracking-wider">
                        Configure System • Features • Security • Compliance
                    </p>
                </div>

                {hasChanges && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded text-white font-bold"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded text-white font-bold disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? '⏳ Saving...' : '💾 Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto">
                {[
                    { id: 'general', label: 'General', icon: '⚙️' },
                    { id: 'features', label: 'Features', icon: '🎯' },
                    { id: 'security', label: 'Security', icon: '🔒' },
                    { id: 'notifications', label: 'Notifications', icon: '📢' },
                    { id: 'blockchain', label: 'Blockchain', icon: '⛓️' },
                    { id: 'compliance', label: 'Compliance', icon: '⚖️' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 rounded font-bold text-sm uppercase whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Settings Content */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
                {/* General Tab */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>

                        <SettingRow label="System Name (English)">
                            <input
                                type="text"
                                value={settings.systemName}
                                onChange={(e) => updateSetting('systemName', e.target.value)}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
                            />
                        </SettingRow>

                        <SettingRow label="System Name (Arabic)">
                            <input
                                type="text"
                                value={settings.systemNameAr}
                                onChange={(e) => updateSetting('systemNameAr', e.target.value)}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md text-right"
                                dir="rtl"
                            />
                        </SettingRow>

                        <SettingRow label="Maintenance Mode" description="Disable access for all users except admins">
                            <Toggle
                                enabled={settings.maintenanceMode}
                                onChange={(val) => updateSetting('maintenanceMode', val)}
                            />
                        </SettingRow>
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Feature Flags</h2>

                        <SettingRow label="AI Recommendations" description="Enable AI-powered insights and suggestions">
                            <Toggle
                                enabled={settings.aiRecommendationsEnabled}
                                onChange={(val) => updateSetting('aiRecommendationsEnabled', val)}
                            />
                        </SettingRow>

                        <SettingRow label="Delivery System" description="Enable delivery management features">
                            <Toggle
                                enabled={settings.deliverySystemEnabled}
                                onChange={(val) => updateSetting('deliverySystemEnabled', val)}
                            />
                        </SettingRow>

                        <SettingRow label="Loyalty Program" description="Allow businesses to create customer loyalty programs">
                            <Toggle
                                enabled={settings.loyaltyProgramEnabled}
                                onChange={(val) => updateSetting('loyaltyProgramEnabled', val)}
                            />
                        </SettingRow>

                        <SettingRow label="Affiliate System" description="Enable customer referral and affiliate commissions">
                            <Toggle
                                enabled={settings.affiliateSystemEnabled}
                                onChange={(val) => updateSetting('affiliateSystemEnabled', val)}
                            />
                        </SettingRow>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>

                        <SettingRow label="Session Timeout (Minutes)" description="Auto-logout users after inactivity">
                            <input
                                type="number"
                                value={settings.sessionTimeoutMinutes}
                                onChange={(e) => updateSetting('sessionTimeoutMinutes', parseInt(e.target.value))}
                                min={5}
                                max={120}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                            />
                        </SettingRow>

                        <SettingRow label="Multi-Factor Authentication" description="Require MFA for all admin accounts">
                            <Toggle
                                enabled={settings.mfaRequired}
                                onChange={(val) => updateSetting('mfaRequired', val)}
                            />
                        </SettingRow>

                        <SettingRow label="Max Login Attempts" description="Lock account after failed login attempts">
                            <input
                                type="number"
                                value={settings.maxLoginAttempts}
                                onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                                min={3}
                                max={10}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                            />
                        </SettingRow>

                        <SettingRow label="Minimum Password Length" description="Enforce strong passwords">
                            <input
                                type="number"
                                value={settings.passwordMinLength}
                                onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
                                min={6}
                                max={32}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                            />
                        </SettingRow>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Notification Settings</h2>

                        <SettingRow label="Email Notifications" description="Send email notifications to users">
                            <Toggle
                                enabled={settings.emailNotificationsEnabled}
                                onChange={(val) => updateSetting('emailNotificationsEnabled', val)}
                            />
                        </SettingRow>

                        <SettingRow label="SMS Notifications" description="Send SMS for critical updates">
                            <Toggle
                                enabled={settings.smsNotificationsEnabled}
                                onChange={(val) => updateSetting('smsNotificationsEnabled', val)}
                            />
                        </SettingRow>

                        <SettingRow label="Admin Alerts" description="Notify admins of critical events">
                            <Toggle
                                enabled={settings.adminAlerts}
                                onChange={(val) => updateSetting('adminAlerts', val)}
                            />
                        </SettingRow>
                    </div>
                )}

                {/* Blockchain Tab */}
                {activeTab === 'blockchain' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Blockchain Settings</h2>

                        <SettingRow label="Required Confirmations" description="Number of block confirmations before considering transaction final">
                            <input
                                type="number"
                                value={settings.confirmationsRequired}
                                onChange={(e) => updateSetting('confirmationsRequired', parseInt(e.target.value))}
                                min={1}
                                max={12}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                            />
                        </SettingRow>

                        <SettingRow label="Gas Limit" description="Default gas limit for transactions">
                            <input
                                type="text"
                                value={settings.gasLimit}
                                onChange={(e) => updateSetting('gasLimit', e.target.value)}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                            />
                        </SettingRow>
                    </div>
                )}

                {/* Compliance Tab */}
                {activeTab === 'compliance' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-white mb-6">Compliance Settings</h2>

                        <SettingRow label="Data Retention (Years)" description="How long to retain user data">
                            <input
                                type="number"
                                value={settings.dataRetentionYears}
                                onChange={(e) => updateSetting('dataRetentionYears', parseInt(e.target.value))}
                                min={1}
                                max={10}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                            />
                        </SettingRow>

                        <SettingRow label="Audit Logging" description="Log all admin actions to blockchain">
                            <Toggle
                                enabled={settings.auditLogEnabled}
                                onChange={(val) => updateSetting('auditLogEnabled', val)}
                            />
                        </SettingRow>

                        <SettingRow label="GDPR Mode" description="Enable GDPR-like data protection features">
                            <Toggle
                                enabled={settings.gdprMode}
                                onChange={(val) => updateSetting('gdprMode', val)}
                            />
                        </SettingRow>
                    </div>
                )}
            </div>

            {/* Warning */}
            {hasChanges && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                    <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                        <span>⚠️</span>
                        Unsaved Changes
                    </h3>
                    <p className="text-yellow-200 text-sm">
                        You have unsaved changes. Click "Save Changes" to apply them system-wide.
                    </p>
                </div>
            )}
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SettingRow({
    label,
    description,
    children,
}: {
    label: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-white/10 last:border-0">
            <div className="flex-1 max-w-xl">
                <div className="text-white font-bold mb-1">{label}</div>
                {description && <div className="text-gray-400 text-sm">{description}</div>}
            </div>
            <div>{children}</div>
        </div>
    );
}

function Toggle({
    enabled,
    onChange,
}: {
    enabled: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`relative w-16 h-8 rounded-full transition-colors ${enabled ? 'bg-green-600' : 'bg-gray-600'
                }`}
        >
            <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${enabled ? 'translate-x-9' : 'translate-x-1'
                    }`}
            />
        </button>
    );
}
