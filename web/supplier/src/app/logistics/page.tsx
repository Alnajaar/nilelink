'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { MapPin, Clock, Package, Truck, AlertCircle, CheckCircle, TrendingUp, BarChart3, Route } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { Badge } from '@shared/components/Badge';

interface Shipment {
  id: string;
  shipmentNumber: string;
  departureLocation: string;
  deliveryLocation: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED';
  scheduledDepartureDate: string;
  actualDepartureDate: string;
  estimatedArrivalDate: string;
  actualArrivalDate?: string;
  currentLocation: string;
  gpsLat: number;
  gpsLng: number;
  trackingNumber: string;
  orders: Array<{ id: string; sku: string; name: string; quantity: number; }>;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Logistics() {
  const { data: shipmentsData, isLoading } = useSWR('/api/supplier/shipments', fetcher);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const shipments = shipmentsData || [];
  const filteredShipments = filterStatus === 'ALL'
    ? shipments
    : shipments.filter((s: Shipment) => s.status === filterStatus);

  const statusCounts = {
    ALL: shipments.length,
    PENDING: shipments.filter((s: Shipment) => s.status === 'PENDING').length,
    IN_TRANSIT: shipments.filter((s: Shipment) => s.status === 'IN_TRANSIT').length,
    DELIVERED: shipments.filter((s: Shipment) => s.status === 'DELIVERED').length,
    DELAYED: shipments.filter((s: Shipment) => s.status === 'DELAYED').length,
  };

  const stats = [
    {
      label: 'Active Shipments',
      value: statusCounts.IN_TRANSIT,
      icon: Truck,
      color: 'blue' as const,
      change: 'In Transit'
    },
    {
      label: 'Delivered',
      value: statusCounts.DELIVERED,
      icon: CheckCircle,
      color: 'emerald' as const,
      change: 'Completed'
    },
    {
      label: 'Delayed',
      value: statusCounts.DELAYED,
      icon: AlertCircle,
      color: 'red' as const,
      change: 'Needs Action'
    },
    {
      label: 'Pending',
      value: statusCounts.PENDING,
      icon: Clock,
      color: 'amber' as const,
      change: 'Awaiting'
    }
  ];

  const getStatusColor = (status: Shipment['status']) => {
    const colors: Record<Shipment['status'], 'warning' | 'info' | 'success' | 'error'> = {
      PENDING: 'warning',
      IN_TRANSIT: 'info',
      DELIVERED: 'success',
      DELAYED: 'error',
    };
    return colors[status];
  };

  const getStatusIcon = (status: Shipment['status']) => {
    const icons: Record<Shipment['status'], React.ReactNode> = {
      PENDING: <Clock size={14} />,
      IN_TRANSIT: <Truck size={14} />,
      DELIVERED: <CheckCircle size={14} />,
      DELAYED: <AlertCircle size={14} />,
    };
    return icons[status];
  };

  return (
    <SupplierPageTemplate
      title="Logistics & Tracking"
      icon={Truck}
      subtitle="Real-time shipment tracking and delivery management"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Status Filter */}
      <PageSection title="Filter by Status">
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'DELAYED'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {status} ({statusCounts[status as keyof typeof statusCounts]})
            </motion.button>
          ))}
        </div>
      </PageSection>

      {/* Shipments List */}
      <PageSection title="Shipments">
        <div className="space-y-4">
          <AnimatePresence>
            {filteredShipments.length > 0 ? filteredShipments.map((shipment: Shipment, idx: number) => {
              const isOverdue = new Date(shipment.estimatedArrivalDate) < new Date() && shipment.status !== 'DELIVERED';
              const daysInTransit = Math.floor(
                (Date.now() - new Date(shipment.actualDepartureDate || shipment.scheduledDepartureDate).getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <motion.div
                  key={shipment.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedShipment(selectedShipment?.id === shipment.id ? null : shipment)}
                  className={`bg-white rounded-2xl border-l-4 p-6 hover:shadow-lg transition-all cursor-pointer ${
                    isOverdue
                      ? 'border-l-red-500 border border-gray-200'
                      : shipment.status === 'DELIVERED'
                      ? 'border-l-emerald-500 border border-gray-200'
                      : 'border-l-blue-500 border border-gray-200'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Shipment Info */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Shipment #</p>
                      <h3 className="text-lg font-black text-gray-900">{shipment.shipmentNumber}</h3>
                    </div>

                    {/* Route */}
                    <div className="md:col-span-2">
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Route</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{shipment.departureLocation}</span>
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-900">{shipment.deliveryLocation}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Current: {shipment.currentLocation}</p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Status</p>
                      <Badge variant={getStatusColor(shipment.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(shipment.status)}
                        {shipment.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* ETA */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">ETA</p>
                      <p className="font-bold text-gray-900">{new Date(shipment.estimatedArrivalDate).toLocaleDateString()}</p>
                      {isOverdue && <p className="text-xs text-red-600 font-bold mt-1">Overdue!</p>}
                    </div>
                  </div>

                  {/* Progress & Details */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: shipment.status === 'DELIVERED' ? '100%' : `${Math.min(daysInTransit * 10, 75)}%` }}
                        className={`h-full ${
                          shipment.status === 'DELIVERED' ? 'bg-emerald-500' :
                          shipment.status === 'DELAYED' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-600 font-bold">Items</p>
                        <p className="text-lg font-black text-gray-900">{shipment.orders.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-bold">Units</p>
                        <p className="text-lg font-black text-gray-900">{shipment.orders.reduce((sum, o) => sum + o.quantity, 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-bold">Days Transit</p>
                        <p className="text-lg font-black text-gray-900">{daysInTransit}d</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="h-96 flex flex-col items-center justify-center text-center">
                <Truck size={64} className="text-gray-300 mb-4" />
                <p className="text-lg font-bold text-gray-600">No shipments found</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </PageSection>

      {/* Detailed View */}
      {selectedShipment && (
        <PageSection title="Shipment Details" subtitle={selectedShipment.shipmentNumber}>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-600 mb-4">Journey</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-1">From</p>
                    <p className="text-lg font-bold text-gray-900">{selectedShipment.departureLocation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-1">To</p>
                    <p className="text-lg font-bold text-gray-900">{selectedShipment.deliveryLocation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-1">Current Location</p>
                    <p className="text-lg font-bold text-gray-900">{selectedShipment.currentLocation}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-600 mb-4">Timeline</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-1">Departed</p>
                    <p className="text-lg font-bold text-gray-900">{new Date(selectedShipment.actualDepartureDate || selectedShipment.scheduledDepartureDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-1">ETA</p>
                    <p className="text-lg font-bold text-gray-900">{new Date(selectedShipment.estimatedArrivalDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-1">Tracking</p>
                    <p className="text-lg font-mono font-black text-gray-900">{selectedShipment.trackingNumber}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-600 mb-4">Contents</h4>
                <div className="space-y-2">
                  {selectedShipment.orders.slice(0, 3).map((order, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-sm font-bold text-gray-900">{order.name}</p>
                      <p className="text-xs text-gray-600">{order.sku} × {order.quantity}</p>
                    </div>
                  ))}
                  {selectedShipment.orders.length > 3 && (
                    <p className="text-xs text-gray-600 font-bold">+{selectedShipment.orders.length - 3} more items</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </PageSection>
      )}
    </SupplierPageTemplate>
  );
}
