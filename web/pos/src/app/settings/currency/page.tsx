/**
 * NileLink Currency Settings
 * Allows POS owners to set custom daily exchange rates for their local currency
 * 
 * FEATURES:
 * - Base Currency fixed to USD
 * - Manual Daily Rate Override (Local Currency per 1 USD)
 * - Automatic Market Rate Fallback
 * - Real-time conversion preview
 * - Global synchronization across POS terminals
 */

'use client';

import { useState, useEffect } from 'react';
import { currencyService, CURRENCIES } from '@shared/services/CurrencyService';

export default function CurrencySettingsPage() {
    const [localCurrency, setLocalCurrency] = useState('AED');
    const [manualRate, setManualRate] = useState<number>(3.67);
    const [useCustomRate, setUseCustomRate] = useState(false);
    const [previewAmount, setPreviewAmount] = useState(100);

    useEffect(() => {
        // Detect local currency or load from settings
        const detected = currencyService.getCurrency('AED'); // Default for region
        if (detected) setLocalCurrency(detected.code);
    }, []);

    const handleSave = () => {
        if (useCustomRate) {
            currencyService.setCustomMerchantRate(localCurrency, manualRate);
            alert(`${localCurrency} Daily Rate updated to ${manualRate}`);
        } else {
            currencyService.clearCustomMerchantRate(localCurrency);
            alert(`Switched to automatic market rates for ${localCurrency}`);
        }
    };

    const convertedPreview = useCustomRate
        ? previewAmount * manualRate
        : previewAmount * (currencyService as any).getExchangeRate('USD', localCurrency);

    return (
        <div className="min-h-screen bg-[#02050a] p-8 text-white">
            <div className="max-w-4xl mx-auto">
                <header className="mb-16">
                    <h1 className="text-4xl font-black italic tracking-tighter mb-4">Currency Management</h1>
                    <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest">Global standard: USD | Local Operation Hub</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Rate Configuration */}
                    <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-3xl">
                        <h2 className="text-xl font-bold mb-8 italic">Operating Rates</h2>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Base Protocol Currency</label>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between opacity-50">
                                    <span className="font-bold">US Dollar (USD)</span>
                                    <span className="text-blue-400">Fixed</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Operational Local Currency</label>
                                <select
                                    value={localCurrency}
                                    onChange={(e) => setLocalCurrency(e.target.value)}
                                    className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500 font-bold"
                                >
                                    {Object.values(CURRENCIES).map(c => (
                                        <option key={c.code} value={c.code} className="bg-black text-white">{c.name} ({c.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <div className="flex items-center justify-between mb-8">
                                    <label className="text-sm font-bold">Manual Daily Rate Override</label>
                                    <button
                                        onClick={() => setUseCustomRate(!useCustomRate)}
                                        className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${useCustomRate ? 'bg-blue-600' : 'bg-white/10'}`}
                                    >
                                        <div className={`w-6 h-6 bg-white rounded-full transition-all ${useCustomRate ? 'translate-x-6' : ''}`}></div>
                                    </button>
                                </div>

                                {useCustomRate && (
                                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="flex items-center gap-4 bg-blue-600/10 border border-blue-500/30 p-6 rounded-2xl">
                                            <span className="text-2xl font-black">1 USD =</span>
                                            <input
                                                type="number"
                                                value={manualRate}
                                                onChange={(e) => setManualRate(parseFloat(e.target.value))}
                                                className="bg-transparent text-4xl font-black outline-none w-full text-blue-400"
                                            />
                                            <span className="text-2xl font-black">{localCurrency}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-600 mt-4 leading-relaxed font-bold uppercase tracking-widest">
                                            This rate will be used for all Sales, Stock valuation, and Payouts for this location.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-5 bg-white text-black font-black uppercase text-xs rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl shadow-white/5 mt-8"
                            >
                                Save Operational Rates
                            </button>
                        </div>
                    </div>

                    {/* Real-time Conversion Preview */}
                    <div className="flex flex-col gap-8">
                        <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem]">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-8">Daily Rate Preview</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <span className="text-4xl font-black italic">${previewAmount}</span>
                                    <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">USD Value</span>
                                </div>
                                <div className="h-px bg-white/5"></div>
                                <div className="flex justify-between items-end">
                                    <span className="text-5xl font-black italic text-blue-400">
                                        {convertedPreview.toLocaleString()} {localCurrency}
                                    </span>
                                    <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Local Target</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600/10 to-transparent p-10 rounded-[2.5rem] border border-blue-500/20">
                            <h4 className="font-bold text-white mb-4">Why Manual Rates?</h4>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                In highly dynamic markets, street rates can fluctuate faster than central bank APIs. NileLink allows owners to define their own survival rate to protect profit margins and ensure local business continuity without waiting for protocol synchronization.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
