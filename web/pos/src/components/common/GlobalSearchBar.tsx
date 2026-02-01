'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, ShoppingBag, User, ArrowRight } from 'lucide-react';
import { searchService, SearchResult } from '@/services/SearchService';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    placeholder?: string;
    onSelect?: (result: SearchResult) => void;
    dataSources: {
        products: any[];
        orders: any[];
        customers: any[];
    };
}

export function GlobalSearchBar({ placeholder = 'Search products, orders...', onSelect, dataSources }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                const searchResults = await searchService.globalSearch(query, dataSources);
                setResults(searchResults);
                setIsOpen(searchResults.length > 0);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, dataSources]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'product': return <Package className="w-5 h-5 text-blue-400" />;
            case 'order': return <ShoppingBag className="w-5 h-5 text-purple-400" />;
            case 'customer': return <User className="w-5 h-5 text-green-400" />;
            default: return <Search className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-xl">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-10 py-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm backdrop-blur-sm"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-lg text-gray-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                    >
                        <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            <p className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Search Results ({results.length})
                            </p>
                            {results.map((result) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => {
                                        onSelect?.(result);
                                        setIsOpen(false);
                                        setQuery('');
                                    }}
                                    className="w-full flex items-center p-3 hover:bg-slate-800 rounded-xl transition-all group text-left"
                                >
                                    <div className="w-10 h-10 bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center rounded-xl mr-4 border border-slate-700 transition-colors">
                                        {getIcon(result.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{result.title}</p>
                                        <p className="text-xs text-gray-400 truncate">{result.subtitle}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                        <div className="bg-slate-900 border-t border-slate-800 p-3 text-center">
                            <p className="text-[10px] text-gray-500">
                                Use <kbd className="bg-slate-800 px-1 rounded font-sans text-gray-400">↑↓</kbd> to navigate, <kbd className="bg-slate-800 px-1 rounded font-sans text-gray-400">Enter</kbd> to select
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
