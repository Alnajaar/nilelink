"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
}

const Map: React.FC<MapProps> = ({
    locations,
    center = [20, 0], // Default center (equator)
    zoom = 2,
    height = '400px',
    className = ''
}) => {
    // Custom icon based on type/color
    const createCustomIcon = (location: LocationData) => {
        const color = location.color || '#0A2540';
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });
    };

    return (
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
                {locations.map((location) => (
                    <Marker
                        key={location.id}
                        position={[location.latitude, location.longitude]}
                        icon={createCustomIcon(location)}
                    >
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-semibold text-sm">{location.name}</h3>
                                {location.load && <p className="text-xs text-gray-600">Load: {location.load}</p>}
                                {location.type && <p className="text-xs text-gray-600">Type: {location.type}</p>}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;