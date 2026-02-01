"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, Wifi, WifiOff } from 'lucide-react';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  color: string;
  type: 'driver' | 'customer' | 'restaurant';
  lastUpdate?: number;
}

interface RealtimeMapProps {
  driverLocation?: Location;
  customerLocation?: Location;
  restaurantLocation?: Location;
  orderStatus: string;
  eta?: number;
  isConnected: boolean;
  className?: string;
}

export default function RealtimeMap({
  driverLocation,
  customerLocation,
  restaurantLocation,
  orderStatus,
  eta,
  isConnected,
  className = ""
}: RealtimeMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // All locations combined
  const locations = [
    restaurantLocation,
    customerLocation,
    driverLocation
  ].filter(Boolean) as Location[];

  // Calculate bounds and center point
  const calculateBounds = () => {
    if (locations.length === 0) return null;

    const lats = locations.map(loc => loc.latitude);
    const lngs = locations.map(loc => loc.longitude);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      centerLat: (Math.min(...lats) + Math.max(...lats)) / 2,
      centerLng: (Math.min(...lngs) + Math.max(...lngs)) / 2
    };
  };

  const bounds = calculateBounds();

  // Draw map on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bounds) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Convert lat/lng to canvas coordinates
    const latToY = (lat: number) => {
      return ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * rect.height;
    };

    const lngToX = (lng: number) => {
      return ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * rect.width;
    };

    // Draw route line if driver and customer exist
    if (driverLocation && customerLocation) {
      const driverX = lngToX(driverLocation.longitude);
      const driverY = latToY(driverLocation.latitude);
      const customerX = lngToX(customerLocation.longitude);
      const customerY = latToY(customerLocation.latitude);

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(driverX, driverY);
      ctx.lineTo(customerX, customerY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw locations
    locations.forEach(location => {
      const x = lngToX(location.longitude);
      const y = latToY(location.latitude);

      // Location pin
      ctx.fillStyle = location.color;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // White border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Location icon
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        location.type === 'driver' ? '🚗' :
        location.type === 'customer' ? '🏠' : '🏪',
        x, y + 1
      );
    });

    // Draw pulsing effect for driver
    if (driverLocation && isConnected) {
      const x = lngToX(driverLocation.longitude);
      const y = latToY(driverLocation.latitude);

      const pulse = Date.now() * 0.005 % (2 * Math.PI);
      const radius = 15 + Math.sin(pulse) * 5;

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

  }, [locations, bounds, isConnected]);

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      case 'PREPARING': return 'bg-yellow-100 text-yellow-700';
      case 'READY': return 'bg-orange-100 text-orange-700';
      case 'IN_TRANSIT': return 'bg-cyan-100 text-cyan-700';
      case 'DELIVERED': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Navigation size={16} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Live Tracking</h3>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(orderStatus)} border-0 text-xs`}>
                  {orderStatus.replace('_', ' ')}
                </Badge>
                {isConnected ? (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <Wifi size={12} />
                    Live
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 text-xs">
                    <WifiOff size={12} />
                    Offline
                  </div>
                )}
              </div>
            </div>
          </div>

          {eta && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <Clock size={14} />
                ETA: {eta} min
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative h-64 bg-gray-50">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ imageRendering: 'crisp-edges' }}
        />

        {/* Location Legend */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
          <div className="flex flex-col gap-1 text-xs">
            {restaurantLocation && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>🏪 Restaurant</span>
              </div>
            )}
            {customerLocation && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>🏠 Delivery</span>
              </div>
            )}
            {driverLocation && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span>🚗 Driver</span>
              </div>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium"
            >
              Connection Lost
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Updates */}
      <div className="p-4 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          {driverLocation && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Driver location updated {driverLocation.lastUpdate ? new Date(driverLocation.lastUpdate).toLocaleTimeString() : 'just now'}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Tracking active • Real-time updates</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
