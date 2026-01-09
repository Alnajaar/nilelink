'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    Settings,
    ArrowLeft,
    Globe,
    DollarSign,
    Mail,
    Bell,
    Shield,
    Database,
    Zap,
    Save
} from 'lucide-react'

interface SystemSettings {
    // General
    siteName: string
    siteUrl: string
    supportEmail: string

    // Currency
    baseCurrency: string
    allowMultiCurrency: boolean
    autoSyncRates: boolean
    lastSyncTimestamp?: number

    // Notifications
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean

    // Security
    requireEmailVerification: boolean
    requirePhoneVerification: boolean
    twoFactorAuth: boolean
    sessionTimeout: number

    // Features
    enableBlockchain: boolean
    enableAIFraud: boolean
    enableGeoVerification: boolean
    enableOfflineMode: boolean

    // Limits
    maxUsersPerAccount: number
    maxLocationsPerAccount: number
    orderRetentionDays: number
}

export default function SettingsPage() {
    const router = useRouter()
    const [settings, setSettings] = useState<SystemSettings>({
        siteName: 'NileLink',
        siteUrl: 'https://nilelink.app',
        supportEmail: 'support@nilelink.app',
        baseCurrency: 'USD',
        allowMultiCurrency: true,
        autoSyncRates: true,
        lastSyncTimestamp: Date.now(),
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        requireEmailVerification: true,
        requirePhoneVerification: false,
        twoFactorAuth: false,
        sessionTimeout: 30,
        enableBlockchain: true,
        enableAIFraud: true,
        enableGeoVerification: true,
        enableOfflineMode: true,
        maxUsersPerAccount: 100,
        maxLocationsPerAccount: 10,
        orderRetentionDays: 365
    })
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        // Check admin authentication
        const adminSession = localStorage.getItem('admin_session')
        if (!adminSession) {
            router.push('/login')
            return
        }

        loadSettings()
    }, [router])

    const loadSettings = () => {
        const storedSettings = localStorage.getItem('systemSettings')
        if (storedSettings) {
            setSettings(JSON.parse(storedSettings))
        }
    }

    const handleSave = async () => {
        setIsSaving(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        localStorage.setItem('systemSettings', JSON.stringify(settings))
        setIsSaving(false)

        alert('Settings saved successfully!')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <button onClick={() => router.push('/dashboard')} className="mr-4">
                                <ArrowLeft className="h-6 w-6 text-gray-600" />
                            </button>
                            <div className="flex items-center">
                                <Settings className="h-8 w-8 text-red-600 mr-3" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                                    <p className="text-sm text-gray-500">Configure ecosystem parameters</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Save className="h-5 w-5 mr-2" />
                            )}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* General Settings */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center mb-6">
                            <Globe className="h-6 w-6 text-blue-500 mr-3" />
                            <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Site Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Site URL
                                </label>
                                <input
                                    type="url"
                                    value={settings.siteUrl}
                                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Support Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.supportEmail}
                                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Currency Settings */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center mb-6">
                            <DollarSign className="h-6 w-6 text-green-500 mr-3" />
                            <h2 className="text-xl font-bold text-gray-900">Currency Settings</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Base Currency
                                </label>
                                <select
                                    value={settings.baseCurrency}
                                    onChange={(e) => setSettings({ ...settings, baseCurrency: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="AED">AED - UAE Dirham</option>
                                    <option value="SAR">SAR - Saudi Riyal</option>
                                </select>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.allowMultiCurrency}
                                    onChange={(e) => setSettings({ ...settings, allowMultiCurrency: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Allow Multi-Currency Support
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={settings.autoSyncRates}
                                    onChange={(e) => setSettings({ ...settings, autoSyncRates: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">
                                    Auto-Sync Exchange Rates (Real-Time)
                                </label>
                            </div>
                            {settings.lastSyncTimestamp && (
                                <p className="text-[10px] text-gray-400 font-mono">
                                    Last Sync: {new Date(settings.lastSyncTimestamp).toLocaleString()}
                                </p>
                            )}
                            <button
                                onClick={() => setSettings({ ...settings, lastSyncTimestamp: Date.now() })}
                                className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                            >
                                Sync Rates Now
                            </button>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center mb-6">
                            <Bell className="h-6 w-6 text-yellow-500 mr-3" />
                            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">Email Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={settings.emailNotifications}
                                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">SMS Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={settings.smsNotifications}
                                    onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">Push Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={settings.pushNotifications}
                                    onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center mb-6">
                            <Shield className="h-6 w-6 text-red-500 mr-3" />
                            <h2 className="text-xl font-bold text-gray-900">Security</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">Require Email Verification</span>
                                <input
                                    type="checkbox"
                                    checked={settings.requireEmailVerification}
                                    onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">Require Phone Verification</span>
                                <input
                                    type="checkbox"
                                    checked={settings.requirePhoneVerification}
                                    onChange={(e) => setSettings({ ...settings, requirePhoneVerification: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">Two-Factor Authentication</span>
                                <input
                                    type="checkbox"
                                    checked={settings.twoFactorAuth}
                                    onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Session Timeout (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={settings.sessionTimeout}
                                    onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center mb-6">
                            <Zap className="h-6 w-6 text-purple-500 mr-3" />
                            <h2 className="text-xl font-bold text-gray-900">Features</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">Blockchain Integration</span>
                                <input
                                    type="checkbox"
                                    checked={settings.enableBlockchain}
                                    onChange={(e) => setSettings({ ...settings, enableBlockchain: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">AI Fraud Detection</span>
                                <input
                                    type="checkbox"
                                    checked={settings.enableAIFraud}
                                    onChange={(e) => setSettings({ ...settings, enableAIFraud: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">Geo-Verification</span>
                                <input
                                    type="checkbox"
                                    checked={settings.enableGeoVerification}
                                    onChange={(e) => setSettings({ ...settings, enableGeoVerification: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">Offline Mode</span>
                                <input
                                    type="checkbox"
                                    checked={settings.enableOfflineMode}
                                    onChange={(e) => setSettings({ ...settings, enableOfflineMode: e.target.checked })}
                                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                />
                            </div>
                        </div>
                    </div>

                    {/* System Limits */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center mb-6">
                            <Database className="h-6 w-6 text-indigo-500 mr-3" />
                            <h2 className="text-xl font-bold text-gray-900">System Limits</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Users Per Account
                                </label>
                                <input
                                    type="number"
                                    value={settings.maxUsersPerAccount}
                                    onChange={(e) => setSettings({ ...settings, maxUsersPerAccount: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Locations Per Account
                                </label>
                                <input
                                    type="number"
                                    value={settings.maxLocationsPerAccount}
                                    onChange={(e) => setSettings({ ...settings, maxLocationsPerAccount: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Order Retention (days)
                                </label>
                                <input
                                    type="number"
                                    value={settings.orderRetentionDays}
                                    onChange={(e) => setSettings({ ...settings, orderRetentionDays: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button (Bottom) */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-lg font-semibold"
                    >
                        {isSaving ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="h-5 w-5 mr-2" />
                        )}
                        {isSaving ? 'Saving Settings...' : 'Save All Changes'}
                    </button>
                </div>
            </div>
        </div>
    )
}
