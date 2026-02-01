'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@shared/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, Clock, DollarSign, Package, Phone, MessageCircle, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import graphService from '@shared/services/GraphService';
import { useContractInteractions } from '@shared/hooks/useContractInteractions';
import { useWallet } from '@shared/contexts/WalletContext';
import { useLocation } from '@shared/hooks/useLocation';

interface Delivery {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'completed';
  estimatedArrival: string;
  orderValue: number;
  customerName: string;
  customerPhone: string;
  items: number;
  distance: number;
}

export default function DeliveriesDashboard() {
  const { address, isConnected, isLoading: authLoading } = useAuth();
  const { wallet } = useWallet();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const { city, country } = useLocation();
  const { pickUpOrder, completeDelivery } = useContractInteractions();

  // Fetch real deliveries from The Graph
  useEffect(() => {
    async function fetchDeliveries() {
      if (!address) return;

      try {
        setLoading(true);
        const data = await graphService.getDeliveries(20, 0, {
          assignedDriver_: address.toLowerCase()
        });

        if (data && data.deliveries) {
          const formatted = data.deliveries.map((d: any) => ({
            id: d.id,
            orderId: d.order?.id,
            pickupAddress: d.restaurant?.metadataCid || 'Restaurant Location',
            deliveryAddress: d.order?.deliveryAddress || 'Customer Address',
            status: d.status.toLowerCase(),
            estimatedArrival: '15 min',
            orderValue: parseFloat(d.amountUsd6 || '0') / 1000000,
            customerName: d.customer?.displayName || 'Customer',
            customerPhone: '+201234567890',
            items: 3,
            distance: 2.8
          }));
          setDeliveries(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch deliveries for list:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isConnected && address) {
      fetchDeliveries();
    }
  }, [isConnected, address]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Please connect your wallet and login as a driver.
          </p>
          <Link href="/auth/login" className="inline-block">
            <Button>Login as Driver</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeDeliveries = deliveries.filter(d => d.status !== 'completed');

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Dashboard</h1>
          <p className="text-gray-600">
            {activeDeliveries.length} active deliveries in {city || '...'}, {country || '...'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{activeDeliveries.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${activeDeliveries.reduce((sum, d) => sum + d.orderValue, 0).toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Distance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeDeliveries.reduce((sum, d) => sum + d.distance, 0).toFixed(1)} km
                </p>
              </div>
              <Navigation className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Deliveries List */}
        <div className="space-y-6">
          {activeDeliveries.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active deliveries</h3>
              <p className="text-gray-600">New orders will appear here when assigned to you.</p>
            </Card>
          ) : (
            activeDeliveries.map((delivery) => (
              <Card key={delivery.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{delivery.customerName}</h3>
                      <Badge variant="default">
                        Order #{delivery.id.split('-')[1]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {delivery.items} {delivery.items === 1 ? 'item' : 'items'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        {delivery.distance} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        ETA {delivery.estimatedArrival}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">${delivery.orderValue.toFixed(2)}</p>
                    <Badge
                      variant={
                        delivery.status === 'assigned' ? 'secondary' :
                          delivery.status === 'picked_up' ? 'warning' :
                            delivery.status === 'in_transit' ? 'primary' :
                              'success'
                      }
                    >
                      {delivery.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Pickup Location</p>
                      <p className="flex items-start gap-2 text-gray-900">
                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span>{delivery.pickupAddress}</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address</p>
                      <p className="flex items-start gap-2 text-gray-900">
                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span>{delivery.deliveryAddress}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Customer</p>
                      <p className="flex items-center gap-2 text-gray-900">
                        <User className="w-4 h-4" />
                        <span>{delivery.customerName}</span>
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                        <Phone className="w-4 h-4" />
                        Call
                      </button>

                      {delivery.status.toLowerCase() === 'created' || delivery.status.toLowerCase() === 'assigned' ? (
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={async () => {
                            try {
                              setLoading(true);
                              const tx = await pickUpOrder(delivery.orderId || delivery.id);
                              if (tx) {
                                setDeliveries(prev => prev.map(d => d.id === delivery.id ? { ...d, status: 'picked_up' } : d));
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          Pick Up
                        </button>
                      ) : delivery.status.toLowerCase() !== 'delivered' && delivery.status.toLowerCase() !== 'completed' ? (
                        <button
                          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors ml-auto"
                          onClick={async () => {
                            try {
                              setLoading(true);
                              const tx = await completeDelivery(delivery.orderId || delivery.id);
                              if (tx) {
                                setDeliveries(prev => prev.map(d => d.id === delivery.id ? { ...d, status: 'delivered' } : d));
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Delivered
                        </button>
                      ) : (
                        <Badge variant="success">Completed</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
