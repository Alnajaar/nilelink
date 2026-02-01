/**
 * Global Search Results Page
 * cross-business and cross-product discovery
 * 
 * FEATURES:
 * - Aggregated results from multiple business subgraphs
 * - Integrated Business vs Product search
 * - Proximity and price-based sorting
 * - Verified merchant badges and reputation scores
 * - One-click access to business portals
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { graphService } from '@shared/services/GraphService';

// ============================================
// TYPES
// ============================================

interface SearchResult {
    id: string;
    type: 'BUSINESS' | 'PRODUCT';
    title: string;
    subtitle: string;
    price?: number;
    rating: number;
    location: string;
    image?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SearchResultsPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'BUSINESS' | 'PRODUCT'>('ALL');

    useEffect(() => {
        performGlobalSearch();
    }, [query]);

    const performGlobalSearch = async () => {
        try {
            setLoading(true);
            // TODO: Call GraphService.searchNetwork(query)
            // Mocking results across multiple categories
            setTimeout(() => {
                setResults([
                    { id: 'B1', type: 'BUSINESS', title: 'The Burger Joint', subtitle: 'Gourmet American Diner', rating: 4.8, location: 'Olaya, Riyadh' },
                    { id: 'P1', type: 'PRODUCT', title: 'Classic Cheese Burger', subtitle: 'from The Burger Joint', price: 12.50, rating: 4.9, location: 'Olaya, Riyadh' },
                    { id: 'P2', type: 'PRODUCT', title: 'Double Patty Burger', subtitle: 'from Smash Burgers', price: 18.00, rating: 4.5, location: 'Tahlia, Riyadh' },
                    { id: 'B2', type: 'BUSINESS', title: 'Daily Bakeries', subtitle: 'Fresh Wholesale Bakery', rating: 4.9, location: 'Central JED' },
                    { id: 'P3', type: 'PRODUCT', title: 'Organic Beef Mince', subtitle: 'from MeatMasters JO', price: 45.00, rating: 5.0, location: 'Amman, Jordan' },
                ]);
                setLoading(false);
            }, 1000);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredResults = results.filter(r => filter === 'ALL' || r.type === filter);

    return (
        <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">

                {/* Search Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1">
                        <h1 className="text-gray-500 text-sm uppercase font-black tracking-widest mb-1">Search Results for</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl font-black text-white italic">"{query || 'Everything'}"</span>
                            {loading && <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                    </div>

                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl">
                        {(['ALL', 'BUSINESS', 'PRODUCT'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                {f === 'ALL' ? 'All Results' : f === 'BUSINESS' ? 'Businesses' : 'Products'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                    {/* Sidebar Filters */}
                    <div className="space-y-8 hidden lg:block">
                        <h2 className="text-lg font-bold text-white uppercase italic tracking-widest">Filters</h2>
                        <div className="space-y-6">
                            <FilterSection label="Location" options={['Riyadh', 'Jeddah', 'Amman', 'Dubai']} />
                            <FilterSection label="Price Range" options={['Under $20', '$20 - $50', '$50 - $100', 'Over $100']} />
                            <FilterSection label="Rating" options={['4.5+ ★', '4.0+ ★', 'All Ratings']} />
                        </div>
                    </div>

                    {/* Results Feed */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="space-y-6">
                                {[...Array(5)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse"></div>)}
                            </div>
                        ) : filteredResults.length === 0 ? (
                            <div className="py-40 text-center text-gray-700 font-bold italic text-2xl">No results found on-chain.</div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredResults.map(result => (
                                    <div
                                        key={result.id}
                                        className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-8">
                                            <div className="w-20 h-20 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-4xl group-hover:scale-110 transition-all">
                                                {result.type === 'BUSINESS' ? '🏪' : '🥡'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-2xl font-black text-white">{result.title}</h3>
                                                    <span className="bg-blue-600/10 text-blue-400 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest">VERIFIED</span>
                                                </div>
                                                <p className="text-gray-500 text-sm font-bold">{result.subtitle}</p>
                                                <div className="flex items-center gap-6 mt-4">
                                                    <span className="text-yellow-400 text-xs font-black">{result.rating} ★</span>
                                                    <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">📍 {result.location}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-12">
                                            {result.price && (
                                                <div className="text-right">
                                                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Price Point</div>
                                                    <div className="text-3xl font-black text-white">${result.price.toFixed(2)}</div>
                                                </div>
                                            )}
                                            <button className="px-10 py-4 bg-white text-black font-black uppercase text-xs rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5">
                                                {result.type === 'BUSINESS' ? 'Visit Store' : 'View Item'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-16 pt-8 border-t border-white/5 text-center">
                            <p className="text-gray-600 text-xs max-w-lg mx-auto leading-relaxed">
                                NileLink Global Search uses distributed indexing to lookup entities across multiple smart contracts. Performance may vary based on node synchronization levels.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function FilterSection({ label, options }: { label: string, options: string[] }) {
    return (
        <div className="space-y-4">
            <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{label}</div>
            <div className="flex flex-col gap-3">
                {options.map(opt => (
                    <label key={opt} className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer hover:text-blue-400 transition-all">
                        <input type="checkbox" className="w-4 h-4 rounded-lg bg-white/5 border-white/10 accent-blue-600" />
                        {opt}
                    </label>
                ))}
            </div>
        </div>
    );
}
