"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface LocationData {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type?: string;
    load?: string;
    color?: string;
}

interface MapProps {
    locations: LocationData[];
    center?: [number, number];
    zoom?: number;
    height?: string;
    className?: string;
    routes?: Array<[number, number][]>; // Optional route lines
    showRoutes?: boolean;
}

const Map: React.FC<MapProps> = ({
    locations,
    center = [30.0444, 31.2357], // Default to Cairo
    zoom = 13,
    height = '400px',
    className = '',
    routes = [],
    showRoutes = false
}) => {
    // Custom icon based on type/color
    const createCustomIcon = (location: LocationData) => {
        const color = location.color || '#3b82f6';
        const isActive = location.type === 'active' || location.type === 'in_transit';

        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div style="
                    background-color: ${color}; 
                    width: ${isActive ? '24px' : '20px'}; 
                    height: ${isActive ? '24px' : '20px'}; 
                    border-radius: 50%; 
                    border: 3px solid white; 
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ${isActive ? 'animation: pulse 2s infinite;' : ''}
                ">
                    ${isActive ? '<div style="width: 8px; height: 8px; background: white; border-radius: 50%; margin: 5px auto;"></div>' : ''}
                </div>
            `,
            iconSize: [isActive ? 24 : 20, isActive ? 24 : 20],
            iconAnchor: [isActive ? 12 : 10, isActive ? 12 : 10],
        });
    };

    return (
        <>
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
            `}</style>
            <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
                <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Draw routes if enabled */}
                    {showRoutes && routes.map((route, index) => (
                        <Polyline
                            key={`route-${index}`}
                            positions={route}
                            color="#3b82f6"
                            weight={4}
                            opacity={0.7}
                            dashArray="10, 10"
                        />
                    ))}

                    {/* Place markers */}
                    {locations.map((location) => (
                        <Marker
                            key={location.id}
                            position={[location.latitude, location.longitude]}
                            icon={createCustomIcon(location)}
                        >
                            <Popup>
                                <div className="p-2 min-w-[150px]">
                                    <h3 className="font-bold text-sm mb-1">{location.name}</h3>
                                    {location.load && (
                                        <p className="text-xs text-gray-600 mb-1">
                                            📦 {location.load}
                                        </p>
                                    )}
                                    {location.type && (
                                        <p className="text-xs">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-white text-[10px] font-bold uppercase ${location.type === 'active' ? 'bg-green-500' :
                                                    location.type === 'idle' ? 'bg-yellow-500' :
                                                        location.type === 'in_transit' ? 'bg-blue-500' :
                                                            'bg-gray-500'
                                                }`}>
                                                {location.type}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </>
    );
};

export default Map;
