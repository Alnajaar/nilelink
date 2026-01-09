"use client";

import React from 'react';
import { Globe } from 'lucide-react';

interface Node {
    id: string;
    name: string;
    status: 'online' | 'offline' | 'degraded';
    latitude: number;
    longitude: number;
    region: string;
    load: string;
}

interface NetworkMapProps {
    nodes: Node[];
    height?: string;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ nodes, height = '400px' }) => {
    return (
        <div
            className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden flex items-center justify-center"
            style={{ height }}
        >
            <div className="absolute inset-0 bg-slate-900/50" />
            <div className="relative z-10 text-center">
                <Globe className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">Network Map Visualization</p>
                <p className="text-slate-500 text-xs mt-1">{nodes.length} nodes active</p>
            </div>
            {/* Placeholder dots for nodes */}
            {nodes.slice(0, 10).map((node, index) => (
                <div
                    key={node.id}
                    className={`absolute w-2 h-2 rounded-full ${
                        node.status === 'online' ? 'bg-green-500' :
                        node.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{
                        left: `${20 + (index * 8)}%`,
                        top: `${20 + (index * 6)}%`,
                    }}
                />
            ))}
        </div>
    );
};