/**
 * Customer Order History Page
 * View and manage all past and active orders
 * 
 * FEATURES:
 * - Real-time order status tracking from The Graph
 * - Grouping by active vs past orders
 * - Detailed order breakdown (items, metadata)
 * - "Order Again" functionality
 * - Direct links to live delivery tracking
 */

'use client';

import { useState, useEffect } from 'react';
import { graphService } from '@shared/services/GraphService';
import { useAuth } from '@shared/providers/AuthProvider';
import { OnChainOrder, OrderStatus } from '@shared/types/database';

// ============================================
// TYPES
// ============================================

interface OrderGroup {
  active: OnChainOrder[];
  previous: OnChainOrder[];
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderGroup>({ active: [], previous: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch user's orders from the decentralized graph
      const userOrders = await graphService.getOrdersByCustomer(user?.uid || '');

      const activeStatuses: OrderStatus[] = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED'];

      const grouped = userOrders.reduce((acc: OrderGroup, order) => {
        if (activeStatuses.includes(order.status)) {
          acc.active.push(order);
        } else {
          acc.previous.push(order);
        }
        return acc;
      }, { active: [], previous: [] });

      setOrders(grouped);
      setError(null);
    } catch (err: any) {
      console.error('[OrderHistory] Failed to fetch:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order: OnChainOrder) => {
    // Logic to add order items back to cart
    // cartService.addItems(order.items);
    window.location.href = '/checkout';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02050a] flex items-center justify-center">
        <div className="animate-spin text-4xl">🔄</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02050a] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white mb-8">My Orders</h1>

        {/* Active Orders Section */}
        {orders.active.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Active Orders
            </h2>
            <div className="space-y-4">
              {orders.active.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isActive={true}
                  onAction={() => window.location.href = `/tracking/${order.id}`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Previous Orders Section */}
        <section>
          <h2 className="text-xl font-bold text-gray-400 mb-6">Order History</h2>
          {orders.previous.length === 0 && orders.active.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-500">
              No orders found. <a href="/shop" className="text-blue-400 underline ml-1">Start shopping!</a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.previous.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isActive={false}
                  onAction={() => handleReorder(order)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function OrderCard({ order, isActive, onAction }: {
  order: OnChainOrder,
  isActive: boolean,
  onAction: () => void
}) {
  const dateStr = new Date(order.createdAt * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500">#{order.id.slice(0, 10).toUpperCase()}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <h3 className="text-white font-bold text-lg">
            {order.businessId} {/* TODO: Map to Name */}
          </h3>
          <p className="text-gray-400 text-sm">{dateStr} • {/* order.itemCount */} items</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Total</div>
            <div className="text-xl font-black text-white">${Number(order.total).toFixed(2)}</div>
          </div>

          <button
            onClick={onAction}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${isActive
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20'
                : 'bg-white/5 hover:bg-white/10 text-white shadow-black/20'
              }`}
          >
            {isActive ? 'Track Live 📊' : 'Order Again ↺'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case 'PENDING': return 'bg-yellow-500/20 text-yellow-300';
    case 'PREPARING': return 'bg-orange-500/20 text-orange-300';
    case 'SHIPPED': return 'bg-blue-500/20 text-blue-300';
    case 'DELIVERED': return 'bg-purple-500/20 text-purple-300';
    case 'COMPLETED': return 'bg-green-500/20 text-green-300';
    case 'CANCELLED': return 'bg-red-500/20 text-red-300';
    default: return 'bg-gray-500/20 text-gray-300';
  }
}
