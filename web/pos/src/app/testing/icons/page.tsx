'use client';

import React from 'react';
import * as Icons from 'lucide-react';

export default function IconTest() {
    const iconNames = [
        'BarChart3', 'ShoppingCart', 'Users', 'Settings',
        'LogOut', 'Bell', 'Search', 'Menu', 'X', 'TrendingUp',
        'Activity', 'Package', 'Shield', 'CheckCircle',
        'Clock', 'AlertCircle', 'Database', 'Cpu', 'Network',
        'Zap', 'Globe', 'MapPin', 'User', 'Plus', 'Eye', 'Edit', 'Trash2',
        'Filter', 'Download', 'Upload', 'ArrowUpRight', 'ArrowDownRight',
        'RefreshCw', 'HardDrive', 'LayoutGrid', 'List', 'Layers', 'Wallet',
        'Key', 'ShieldAlert', 'Wifi', 'Printer', 'Tablet', 'UserPlus'
    ];

    const results = iconNames.map(name => ({
        name,
        exists: !!(Icons as any)[name]
    }));

    return (
        <div className="p-10 bg-black text-white font-mono">
            <h1 className="text-2xl mb-8">Icon Discovery Log</h1>
            <div className="grid grid-cols-2 gap-4">
                {results.map(res => (
                    <div key={res.name} className="flex justify-between border-b border-white/20 pb-2">
                        <span>{res.name}:</span>
                        <span className={res.exists ? 'text-green-500' : 'text-red-500'}>
                            {res.exists ? 'FOUND' : 'MISSING'}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-10">
                <p>Missing Icons total: {results.filter(r => !r.exists).length}</p>
            </div>
        </div>
    );
}
