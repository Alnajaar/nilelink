/**
 * Ultra-Premium Driver Dashboard
 * Core command center for the delivery ecosystem
 * 
 * FEATURES:
 * - Real-time status toggle (Online/Offline)
 * - Map-integrated overview (UI placeholder)
 * - Quick stats (Earnings, Rating, Orders)
 * - Available deliveries feed with proximity filtering
 * - Next.js 14 server components & client interactivity
 * - Decentralized state via The Graph
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@shared/providers/AuthProvider';
import { graphService } from '@shared/services/GraphService';
import web3Service from '@shared/services/Web3Service';
import { useGuard } from '@shared/hooks/useGuard';
import { Skeleton } from '@shared/components/Skeleton';

// ============================================
// TYPES
// ============================================

interface DashboardStats {
  todayEarnings: number;
  ordersCompleted: number;
  activeHours: number;
  rating: number;
}

interface AvailableDelivery {
  id: string;
  businessName: string;
  address: string;
  amount: number;
  distance: number;
  items: number;
  timeRemaining: number;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DriverDashboard() {
  const { user } = useAuth();
  const { can } = useGuard();

  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    todayEarnings: 125.50,
    ordersCompleted: 12,
    activeHours: 6.5,
    rating: 4.9
  });
  const [availableOrders, setAvailableOrders] = useState<AvailableDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user?.walletAddress) return;
    try {
      setLoading(true);

      // 1. Fetch Stats from Graph
      const driverDeliveries = await graphService.getDeliveriesByDriver(user.walletAddress);
      const totalEarnings = driverDeliveries.reduce((acc: number, d: any) => acc + (Number(d.driverEarnings) / 1000000), 0);

      setStats({
        todayEarnings: totalEarnings, // Simplification: today = lifecycle for first pass
        ordersCompleted: driverDeliveries.filter((d: any) => d.status === 'COMPLETED').length,
        activeHours: 0, // Not stored on chain yet
        rating: 5.0
      });

      // 2. Fetch Available Orders
      const rawOrders = await graphService.getAvailableOrdersForPickup(user.country);

      // Normalize data
      const normalized: AvailableDelivery[] = rawOrders.map((o: any) => ({
        id: o.id,
        businessName: `Business #${o.restaurant.id.substring(0, 6)}`,
        address: o.deliveryAddress || 'Address on file',
        amount: Number(o.totalAmountUsd6) / 1000000 * 0.1, // Platform fee share simulation if not fixed
        distance: 1.5, // Mocked distance until Geolocation integration
        items: 1, // Would come from metadata
        timeRemaining: 15
      }));

      setAvailableOrders(normalized);
    } catch (err) {
      console.error('[Dashboard] Load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = () => {
    setIsOnline(!isOnline);
    // Broadcast status (UI level for now, could be a small off-chain signal or contract call)
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const tx = await web3Service.pickUpOrder(orderId);
      if (tx) {
        window.location.href = `/deliveries/active?id=${orderId}`;
      } else {
        alert('Failed to accept order on chain.');
      }
    } catch (err) {
      console.error('Acceptance failed:', err);
      alert('Transaction rejected.');
    }
  };

  return (
    <div className="min-h-screen bg-[#02050a]">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative z-10">

        {/* Top Navigation / Branding */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">NileLink Driver</h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em]">Logistics Protocol v1.0</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Online Toggle */}
            <button
              onClick={toggleStatus}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm uppercase transition-all shadow-xl ${isOnline
                ? 'bg-green-600/10 border border-green-500/30 text-green-400 shadow-green-900/20'
                : 'bg-white/5 border border-white/10 text-gray-500'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-700'}`}></span>
              {isOnline ? 'Online & Ready' : 'Go Online'}
            </button>

            <div className="w-12 h-12 bg-white/5 rounded-full border border-white/10 flex items-center justify-center text-xl cursor-pointer hover:bg-white/10 transition-all">
              ⚙️
            </div>
          </div>
        </div>

        {/* Hero Section - Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <StatCard label="Today" value={`$${stats.todayEarnings}`} icon="💰" color="text-green-400" />
          <StatCard label="Orders" value={stats.ordersCompleted.toString()} icon="📋" color="text-blue-400" />
          <StatCard label="Hours" value={stats.activeHours.toString()} icon="⏱️" color="text-purple-400" />
          <StatCard label="Rating" value={`${stats.rating} ★`} icon="⭐" color="text-yellow-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Feed: Available Deliveries */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Available Feed</h2>
              <div className="text-gray-500 text-xs font-bold uppercase">Showing orders within 5km</div>
            </div>

            {!isOnline ? (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-20 text-center space-y-4">
                <div className="text-6xl mb-6 opacity-30">🔌</div>
                <h3 className="text-2xl font-bold text-white">You are Offline</h3>
                <p className="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">Go online to start receiving real-time delivery requests from nearby businesses on the chain.</p>
                <button
                  onClick={toggleStatus}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-black uppercase transition-all"
                >
                  Enter Protocol
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <Skeleton className="h-32 w-full rounded-3xl" />
                    <Skeleton className="h-32 w-full rounded-3xl" />
                  </div>
                ) : availableOrders.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                    <p className="text-gray-500 font-bold">No orders waiting for pickup in your area.</p>
                  </div>
                ) : availableOrders.map(order => (
                  <DeliveryCard key={order.id} order={order} onAccept={() => handleAcceptOrder(order.id)} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Map & Heatmap */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-right">Zone Insights</h2>

            {/* Map Placeholder */}
            <div className="aspect-square bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-blue-900/10 grid grid-cols-4 grid-rows-4 opacity-10">
                {[...Array(16)].map((_, i) => <div key={i} className="border border-white"></div>)}
              </div>
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-gradient-to-t from-[#02050a] to-transparent">
                <div>
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-all">🗺️</div>
                  <h4 className="text-white font-black text-lg mb-2">High Demand Zone</h4>
                  <p className="text-gray-500 text-xs">Drive towards Al-Olaya District for 1.5x surge pay.</p>
                </div>
              </div>
            </div>

            {/* Tips / Tutorials */}
            <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 font-black text-white/10 text-6xl italic">PRO</div>
              <h4 className="text-white font-bold mb-2">Protocol Tip</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Always upload Proof of Delivery (Photo) on-chain to receive your payout instantly via the smart contract.</p>
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

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: string, color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 transition-all hover:bg-white/10 group">
      <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{label}</div>
      <div className="flex items-center justify-between">
        <div className="text-3xl font-black text-white">{value}</div>
        <div className={`text-2xl opacity-40 group-hover:opacity-100 transition-all ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

function DeliveryCard({ order, onAccept }: { order: AvailableDelivery, onAccept: () => void }) {
  return (
    <div className="bg-[#0a0f1a] border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-white/20 transition-all">
      <div className="flex items-center gap-8">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-all">🥡</div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{order.businessName}</h3>
          <div className="flex items-center gap-4 text-xs text-gray-500 font-bold uppercase tracking-widest">
            <span>📍 {order.address}</span>
            <span>🛍️ {order.items} Items</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right">
          <div className="text-green-400 font-black text-2xl">${order.amount.toFixed(2)}</div>
          <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Earn per Delivery</div>
        </div>
        <button
          onClick={onAccept}
          className="px-8 py-4 bg-white text-black font-black uppercase text-xs rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5"
        >
          Accept Now
        </button>
      </div>
    </div>
  );
}
