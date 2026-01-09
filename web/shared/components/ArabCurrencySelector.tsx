"use client";

import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ARAB_CURRENCIES = [
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
    { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
    { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
    { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦' },
    { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭' },
    { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲' },
    { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴' },
    { code: 'LBP', name: 'Lebanese Pound', flag: '🇱🇧' },
    { code: 'IQD', name: 'Iraqi Dinar', flag: '🇮🇶' },
    { code: 'SYP', name: 'Syrian Pound', flag: '🇸🇾' },
    { code: 'YER', name: 'Yemeni Rial', flag: '🇾🇪' },
    { code: 'SDG', name: 'Sudanese Pound', flag: '🇸🇩' },
    { code: 'LYD', name: 'Libyan Dinar', flag: '🇱🇾' },
    { code: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳' },
    { code: 'DZD', name: 'Algerian Dinar', flag: '🇩🇿' },
    { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦' },
    { code: 'MRU', name: 'Mauritanian Ouguiya', flag: '🇲🇷' },
    { code: 'SOS', name: 'Somali Shilling', flag: '🇸🇴' },
    { code: 'DJF', name: 'Djiboutian Franc', flag: '🇩🇯' },
    { code: 'KMF', name: 'Comorian Franc', flag: '🇰🇲' },
    { code: 'ILS', name: 'Palestine (ILS)', flag: '🇵🇸' },
];

export default function ArabCurrencySelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(ARAB_CURRENCIES[0]);

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 glass-v2 border border-white/10 rounded-lg text-xs font-black uppercase tracking-widest text-white/70 hover:text-white transition-all"
            >
                <span className="text-lg">{selected.flag}</span>
                {selected.code}
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 glass-v2 border border-white/10 bg-black/80 backdrop-blur-2xl rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto"
                    >
                        <div className="p-2 grid grid-cols-1 gap-1">
                            {ARAB_CURRENCIES.map((currency) => (
                                <button
                                    key={currency.code}
                                    onClick={() => {
                                        setSelected(currency);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center justify-between w-full p-2.5 rounded-lg text-left transition-all ${selected.code === currency.code ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{currency.flag}</span>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-tighter">{currency.code}</p>
                                            <p className="text-[8px] text-white/40 font-bold uppercase">{currency.name}</p>
                                        </div>
                                    </div>
                                    {selected.code === currency.code && <Check size={14} className="text-emerald-500" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
