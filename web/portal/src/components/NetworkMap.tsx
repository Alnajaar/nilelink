"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SmartNodeLocation } from '@/lib/mockData';
import { colors } from '../../../shared/styles/colors';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface NetworkMapProps {
    nodes: SmartNodeLocation[];
    center?: [number, number];
    zoom?: number;
    height?: string;
}

const NetworkMap: React.FC<NetworkMapProps> = ({
    nodes,
    center = [20, 0],
    zoom = 2,
    height = '600px'
}) => {
    const createCustomIcon = (node: SmartNodeLocation) => {
        const color = node.status === 'online' ? colors.info : node.status === 'syncing' ? colors.accent.DEFAULT : colors.error;
        const pulseClass = node.status === 'online' ? 'animate-pulse' : '';

        return L.divIcon({
            className: 'custom-network-marker',
            html: `
                <div class="relative">
                    <div class="absolute inset-0 rounded-full bg-white opacity-20 scale-150"></div>
                    <div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px ${color};" class="${pulseClass}"></div>
                </div>
            `,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
        });
    };

    return (
        <div className="w-full relative group overflow-hidden rounded-[2.5rem] border-2 border-text/5 shadow-2xl" style={{ height }}>
            {/* Custom map style overlay for ultra-premium look */}
            <div className="absolute inset-0 z-[10] pointer-events-none bg-gradient-to-b from-background/20 via-transparent to-background/40" />

            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
            >
                {/* CartoDB Dark Matter tiles look very professional and premium */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {nodes.map((node) => (
                    <Marker
                        key={node.id}
                        position={[node.latitude, node.longitude]}
                        icon={createCustomIcon(node)}
                    >
                        <Popup className="premium-popup">
                            <div className="p-3 min-w-[180px] bg-background text-text">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-emerald-500' :
                                            node.status === 'syncing' ? 'bg-amber-500' : 'bg-red-500'
                                        }`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{node.status}</span>
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-tight mb-1">{node.name}</h4>
                                <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest mb-3">{node.region}</p>
                                <div className="grid grid-cols-2 gap-2 border-t border-text/5 pt-3">
                                    <div>
                                        <p className="text-[8px] font-black uppercase opacity-20">Network Load</p>
                                        <p className="text-xs font-black">{node.load}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase opacity-20">Latency</p>
                                        <p className="text-xs font-black">1.2ms</p>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Floating Info HUD */}
            <div className="absolute bottom-10 left-10 z-[20] p-6 bg-background/80 backdrop-blur-xl border border-text/10 rounded-3xl max-w-xs transition-all opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4 italic">Protocol Distribution</p>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-4 italic leading-tight">Global Cluster Presence</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span>Total Edge Nodes</span>
                        <span className="text-primary">1,242</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span>Active Regions</span>
                        <span className="text-primary">6 Major Clusters</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span>Mesh Health</span>
                        <span className="text-emerald-500">Optimum</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .premium-popup .leaflet-popup-content-wrapper {
                    background: white !important;
                    border-radius: 1.5rem !important;
                    padding: 0 !important;
                    overflow: hidden;
                    border: 2px solid rgba(15, 23, 42, 0.05);
                }
                .premium-popup .leaflet-popup-content {
                    margin: 0 !important;
                }
                .premium-popup .leaflet-popup-tip {
                    background: white !important;
                }
            `}</style>
        </div>
    );
};

export default NetworkMap;
