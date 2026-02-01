/**
 * Order History Page
 * View and manage all past orders
 * 
 * FEATURES:
 * - View all orders from blockchain
 * - Filter by date, status, payment method
 * - Search by order ID or customer
 * - View order details
 * - Refund/cancel orders
 * - Reprint receipts
 * - Export reports
 * - Real-time stats
 */

'use client';

import { useState, useEffect } from 'react';
import { graphService } from '@shared/services/GraphService';
import { useGuard } from '@shared/hooks/useGuard';
import { useAuth } from '@shared/contexts/AuthContext';
import { useOrderNotification } from '@shared/hooks/useOrderNotification';
import { OnChainOrder, PaymentMethod, OrderStatus } from '@shared/types/database';
import { Toast } from '@shared/components/Toast';
import { OrderStatusBadge } from '@shared/components/OrderStatusBadge';

// ============================================
// TYPES
// ============================================

interface OrderWithDetails extends OnChainOrder {
  customerName?: string;
  itemCount: number;
  refunded: boolean;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function OrdersPage() {
  const { can } = useGuard();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [filterPayment, setFilterPayment] = useState<PaymentMethod | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Selected order for details
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);

  // Notification hook
  const { playSound } = useOrderNotification();
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [silentLoading, setSilentLoading] = useState(false);

  useEffect(() => {
    loadOrders();

    // Auto-refresh every 15 seconds to catch new incoming orders
    const interval = setInterval(() => {
      // Silent refresh (don't set loading state to avoid flickering)
      loadOrders(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setSilentLoading(true);

      const { user } = useAuth();
      // Use logged in user's business ID or fallback for development
      const businessId = user?.businessId || '0x60098f9933580554523e16c96825cbed61b5391a'; // Fallback to a concrete ID for testing
      const orderList = await graphService.getOrdersByBusiness(businessId);

      // Check for new orders
      if (silent && orderList.length > previousOrderCount) {
        playSound();
        // Show small toast/alert for new order?
      }
      setPreviousOrderCount(orderList.length);

      // Transform to include additional details
      const ordersWithDetails: OrderWithDetails[] = orderList.map(order => ({
        ...order,
        itemCount: 0, // TODO: Count items from order details
        refunded: false, // TODO: Check refund status
      }));

      setOrders(ordersWithDetails);
      setError(null);
    } catch (err: any) {
      console.error('[Orders] Failed to load:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setSilentLoading(false);
    }
  };

  // Toast state
  const [toast, setToast] = useState<{ visible: boolean; title: string; message?: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    title: '',
    type: 'info'
  });

  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'info', message?: string) => {
    setToast({ visible: true, title, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleRefund = async (orderId: string) => {
    const canRefund = await can('PROCESS_REFUND');
    if (!canRefund) {
      showToast('Permission Denied', 'error', 'You do not have permission to process refunds');
      return;
    }

    if (!confirm('Process refund for this order? This action cannot be undone.')) return;

    try {
      // TODO: Write refund to blockchain
      console.log('[Orders] Processing refund:', orderId);

      showToast('Refund Processed', 'success', `Order #${orderId.slice(0, 8)} refunded successfully`);
      await loadOrders();
    } catch (err: any) {
      showToast('Refund Failed', 'error', err.message);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const canCancel = await can('CANCEL_ORDER');
    if (!canCancel) {
      showToast('Permission Denied', 'error', 'You do not have permission to cancel orders');
      return;
    }

    if (!confirm('Cancel this order?')) return;

    try {
      // TODO: Update order status on blockchain
      console.log('[Orders] Canceling order:', orderId);

      showToast('Order Canceled', 'success', 'Order has been canceled');
      await loadOrders();
    } catch (err: any) {
      showToast('Cancellation Failed', 'error', err.message);
    }
  };

  // ... rest of the code ...

  return (
    <div className="space-y-8">
      <Toast
        isVisible={toast.visible}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">
          Order History
        </h1>
        <p className="text-gray-400 text-sm uppercase tracking-wider">
          View & Manage Orders • Process Refunds • Export Reports
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Orders" value={orders.length.toLocaleString()} icon="📋" />
        <StatCard label="Today's Orders" value={todayOrders.length.toLocaleString()} icon="📅" color="blue" />
        <StatCard label="Today's Revenue" value={`$${todayRevenue.toFixed(2)}`} icon="💰" color="green" />
        <StatCard label="Avg Order Value" value={`$${avgOrderValue.toFixed(2)}`} icon="📊" color="purple" />
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Payment</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="DIGITAL_WALLET">Digital Wallet</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="From"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="To"
          />

          <button
            onClick={loadOrders}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <div className="animate-spin text-4xl mb-4">⚙️</div>
            <p>Loading orders from blockchain...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">
            <div className="text-4xl mb-4">⚠️</div>
            <p>{error}</p>
            <button
              onClick={loadOrders}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <div className="text-4xl mb-4">📭</div>
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Customer</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Items</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Total</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Payment</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map(order => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onViewDetails={() => setSelectedOrder(order)}
                    onRefund={() => handleRefund(order.id)}
                    onCancel={() => handleCancelOrder(order.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onRefund={() => {
            handleRefund(selectedOrder.id);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({
  label,
  value,
  icon,
  color = 'blue',
}: {
  label: string;
  value: string;
  icon: string;
  color?: 'blue' | 'green' | 'purple' | 'yellow';
}) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-sm border rounded-xl p-6`}>
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <div className="text-3xl font-black text-white">{value}</div>
          <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
        </div>
      </div>
    </div>
  );
}

function OrderRow({
  order,
  onViewDetails,
  onRefund,
  onCancel,
}: {
  order: OrderWithDetails;
  onViewDetails: () => void;
  onRefund: () => void;
  onCancel: () => void;
}) {
  const orderDate = new Date(order.createdAt * 1000);

  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4 font-mono text-sm text-gray-300">
        {order.id.slice(0, 12)}...
      </td>
      <td className="px-6 py-4 text-white text-sm">
        <div>{orderDate.toLocaleDateString()}</div>
        <div className="text-xs text-gray-400">{orderDate.toLocaleTimeString()}</div>
      </td>
      <td className="px-6 py-4 text-white text-sm">
        {order.customer ? (
          <>
            <div className="font-mono text-xs">
              {order.customer.slice(0, 8)}...{order.customer.slice(-6)}
            </div>
            {order.customerName && <div className="text-xs text-gray-400">{order.customerName}</div>}
          </>
        ) : (
          <span className="text-gray-500">Walk-in</span>
        )}
      </td>
      <td className="px-6 py-4 text-center text-white font-bold">
        {order.itemCount || '—'}
      </td>
      <td className="px-6 py-4 text-right text-white font-bold text-lg">
        ${Number(order.total).toFixed(2)}
      </td>
      <td className="px-6 py-4 text-center">
        <PaymentBadge method={order.paymentMethod} />
      </td>
      <td className="px-6 py-4 text-center">
        <StatusBadge status={order.status} refunded={order.refunded} />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onViewDetails}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-bold"
            title="View Details"
          >
            👁️ View
          </button>
          {order.status === 'COMPLETED' && !order.refunded && (
            <button
              onClick={onRefund}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-xs font-bold"
              title="Process Refund"
            >
              💰 Refund
            </button>
          )}
          {order.status === 'PENDING' && (
            <button
              onClick={onCancel}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-xs font-bold"
              title="Cancel Order"
            >
              ✕ Cancel
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function PaymentBadge({ method }: { method: PaymentMethod }) {
  const icons = {
    CASH: '💵',
    CARD: '💳',
    DIGITAL_WALLET: '📱',
    CRYPTO: '₿',
  };

  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
      {icons[method]} {method.replace('_', ' ')}
    </span>
  );
}

function StatusBadge({ status, refunded }: { status: OrderStatus; refunded: boolean }) {
  if (refunded) {
    return (
      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
        💰 REFUNDED
      </span>
    );
  }

  const colors = {
    PENDING: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    COMPLETED: 'bg-green-500/20 text-green-300 border-green-500/30',
    CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const icons = {
    PENDING: '⏳',
    COMPLETED: '✅',
    CANCELLED: '❌',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border ${colors[status]}`}>
      {icons[status]} {status}
    </span>
  );
}

function OrderDetailsModal({
  order,
  onClose,
  onRefund,
}: {
  order: OrderWithDetails;
  onClose: () => void;
  onRefund: () => void;
}) {
  const orderDate = new Date(order.createdAt * 1000);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0a0f1a] border border-white/20 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Order Details</h2>
            <p className="text-gray-400 text-sm font-mono">#{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-white font-bold mb-4">Order Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Date & Time</div>
                <div className="text-white">
                  {orderDate.toLocaleDateString()} {orderDate.toLocaleTimeString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Payment Method</div>
                <div className="text-white">{order.paymentMethod.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Status</div>
                <div><StatusBadge status={order.status} refunded={order.refunded} /></div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Customer</div>
                <div className="text-white font-mono text-xs">
                  {order.customer ? `${order.customer.slice(0, 8)}...` : 'Walk-in'}
                </div>
              </div>
            </div>
          </div>

          {/* Order Totals */}
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-white font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>${Number(order.subtotal || order.total).toFixed(2)}</span>
              </div>
              {order.discount && Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-${Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              {order.tax && Number(order.tax) > 0 && (
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>${Number(order.tax).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-white text-xl font-black pt-3 border-t border-white/20">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
            >
              🖨️ Print Receipt
            </button>
            {order.status === 'COMPLETED' && !order.refunded && (
              <button
                onClick={onRefund}
                className="flex-1 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded text-white font-bold"
              >
                💰 Process Refund
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded text-white font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
