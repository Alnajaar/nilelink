'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Filter, Edit, Trash2,
  Calendar, Clock, MapPin, DollarSign, Package,
  CheckCircle, Pause, Play, XCircle, Repeat
} from 'lucide-react';

import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';
import { useNotifications } from '@shared/contexts/NotificationContext';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { AuthGuard } from '@/components/AuthGuard';
import { useApiQuery } from '@shared/hooks/useApi';
import { subscriptionsService, SubscriptionPlan, UserSubscription } from '@shared/services/subscriptionsService';
import CreateSubscriptionPlanModal from '@/components/CreateSubscriptionPlanModal';

interface Subscriber {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  startDate: string;
  nextDelivery: string;
  deliveryAddress: string;
  deliveryTime: string;
  totalSpent: number;
  lastOrderDate: string;
}

export default function SupplierSubscriptionsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { addNotification } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'PAUSED' | 'CANCELLED'>('all');
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch subscription plans for the supplier
        const plansResponse = await fetch('/api/subscriptions/plans');
        if (plansResponse.ok) {
          const plansData = await plansResponse.json();
          if (plansData.success) {
            setPlans(plansData.plans || []);
          }
        }
        
        // Fetch subscribers for the supplier
        const subscribersResponse = await fetch('/api/subscriptions/subscribers');
        if (subscribersResponse.ok) {
          const subscribersData = await subscribersResponse.json();
          if (subscribersData.success) {
            setSubscribers(subscribersData.subscribers || []);
          }
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
        addNotification({ type: 'error', title: 'Load Error', message: 'Failed to load subscription data' });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      loadData();
    }
  }, [user, addNotification]);

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.planName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || subscriber.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      label: 'Total Plans',
      value: plans.length,
      icon: Package,
      color: 'blue' as const,
      change: `${plans.filter(p => p.visibility === 'PUBLIC').length} Active`
    },
    {
      label: 'Active Subscribers',
      value: subscribers.filter(s => s.status === 'ACTIVE').length,
      icon: Users,
      color: 'emerald' as const,
      change: 'This Month'
    },
    {
      label: 'Monthly Revenue',
      value: `$${subscribers
        .filter(s => s.status === 'ACTIVE')
        .reduce((sum, sub) => sum + (sub.totalSpent / 30 * 30), 0)
        .toFixed(0)}`,
      icon: DollarSign,
      color: 'purple' as const,
      change: 'Projected'
    },
    {
      label: 'Avg Order Value',
      value: `$${(subscribers.reduce((sum, sub) => sum + sub.totalSpent, 0) / subscribers.length).toFixed(2)}`,
      icon: Repeat,
      color: 'cyan' as const,
      change: 'Per Subscriber'
    }
  ];

  const handleTogglePlanStatus = async (planId: string) => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;
      
      const response = await fetch(`/api/subscriptions/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...plan,
          visibility: plan.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setPlans(prev => prev.map(p => 
          p.id === planId ? result.plan : p
        ));
        addNotification({ type: 'success', title: 'Plan Updated', message: 'Plan status toggled successfully' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }
    } catch (error: any) {
      console.error('Error toggling plan status:', error);
      addNotification({ type: 'error', title: 'Update Error', message: error.message });
    }
  };

  const handleToggleSubscriberStatus = async (subscriberId: string) => {
    try {
      const subscriber = subscribers.find(s => s.id === subscriberId);
      if (!subscriber) return;
      
      const newStatus = subscriber.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      const response = await fetch(`/api/subscriptions/subscribers/${subscriberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...subscriber,
          status: newStatus
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setSubscribers(prev => prev.map(sub => 
          sub.id === subscriberId ? result.subscriber : sub
        ));
        addNotification({ type: 'success', title: 'Subscriber Updated', message: 'Subscription status updated' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subscriber');
      }
    } catch (error: any) {
      console.error('Error toggling subscriber status:', error);
      addNotification({ type: 'error', title: 'Update Error', message: error.message });
    }
  };

  const handleCreatePlan = async (planData: any) => {
    try {
      const response = await fetch('/api/subscriptions/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });
      
      if (response.ok) {
        const result = await response.json();
        setPlans(prev => [...prev, result.plan]);
        addNotification({ type: 'success', title: 'Plan Created', message: `Successfully created ${planData.name}` });
        // Close modal after successful creation
        setShowAddPlanModal(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plan');
      }
    } catch (error: any) {
      console.error('Error creating plan:', error);
      addNotification({ type: 'error', title: 'Creation Error', message: error.message });
    }
  };

  const handleCancelSubscription = (subscriberId: string) => {
    setSubscribers(prev => prev.map(sub => 
      sub.id === subscriberId ? { ...sub, status: 'CANCELLED' } : sub
    ));
    addNotification({ type: 'info', title: 'Subscription Cancelled', message: 'Customer subscription has been cancelled' });
  };

  return (
    <AuthGuard requireAuth={true}>
      <SupplierPageTemplate
        title="Subscription Management"
        icon={Users}
        subtitle="Manage your subscription plans and recurring customers"
        actions={
          <Button
            onClick={() => setShowAddPlanModal(true)}
            className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black uppercase tracking-widest px-6 shadow-lg"
          >
            <Plus size={18} className="mr-2" />
            Create Plan
          </Button>
        }
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Search & Filters */}
        <PageSection title="Manage Subscribers" subtitle="Search and filter your subscription customers">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or plan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'ACTIVE', 'PAUSED', 'CANCELLED'] as const).map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                >
                  {status === 'all' ? 'All' : status} ({subscribers.filter(s => status === 'all' || s.status === status).length})
                </motion.button>
              ))}
            </div>
          </div>
        </PageSection>

        {/* Plans Section */}
        <PageSection title="Subscription Plans" subtitle="Manage your recurring delivery offerings">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <AnimatePresence>
              {plans.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                    </div>
                    <Badge variant={plan.visibility === 'PUBLIC' ? 'success' : 'neutral'}>
                      {plan.visibility === 'PUBLIC' ? 'Public' : 'Private'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price</p>
                      <p className="text-lg font-black text-gray-900">${plan.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{plan.billingCycle}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subscribers</p>
                      <p className="text-lg font-black text-gray-900">{plan.currentSubscribers}</p>
                      <p className="text-xs text-gray-500">of {plan.maxSubscribers}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleTogglePlanStatus(plan.id)}
                      variant="outline"
                      className="flex-1 h-10 text-sm rounded-lg"
                    >
                      {plan.visibility === 'PUBLIC' ? <Pause size={16} /> : <Play size={16} />}
                      {plan.visibility === 'PUBLIC' ? 'Private' : 'Public'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-10 text-sm rounded-lg hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </PageSection>

        {/* Subscribers List */}
        <PageSection title={`Subscribers (${filteredSubscribers.length})`} subtitle="Customers subscribed to your recurring services">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-600">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-600">Plan</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-600">Next Delivery</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-600">Total Spent</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredSubscribers.map((subscriber, idx) => (
                      <motion.tr
                        key={subscriber.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: idx * 0.02 }}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900">{subscriber.customerName}</p>
                            <p className="text-sm text-gray-600">{subscriber.customerEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900">{subscriber.planName}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <MapPin size={12} />
                              <span>{subscriber.deliveryAddress}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>{subscriber.deliveryTime}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={subscriber.status === 'ACTIVE' ? 'success' : subscriber.status === 'PAUSED' ? 'warning' : 'error'}>
                            {subscriber.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900">{new Date(subscriber.nextDelivery).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{subscriber.lastOrderDate ? `Last: ${new Date(subscriber.lastOrderDate).toLocaleDateString()}` : 'New'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-black text-gray-900">
                          ${subscriber.totalSpent.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {subscriber.status === 'ACTIVE' && (
                              <button 
                                onClick={() => handleToggleSubscriberStatus(subscriber.id)}
                                className="p-2 hover:bg-yellow-50 rounded-lg transition-colors text-yellow-600"
                                title="Pause Subscription"
                              >
                                <Pause size={16} />
                              </button>
                            )}
                            {subscriber.status === 'PAUSED' && (
                              <button 
                                onClick={() => handleToggleSubscriberStatus(subscriber.id)}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                                title="Resume Subscription"
                              >
                                <Play size={16} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleCancelSubscription(subscriber.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                              title="Cancel Subscription"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {filteredSubscribers.length === 0 && (
            <div className="h-96 flex flex-col items-center justify-center text-center">
              <Users size={64} className="text-gray-300 mb-4" />
              <p className="text-lg font-bold text-gray-600">No subscribers found</p>
              <p className="text-sm text-gray-500 mt-2">Create subscription plans to attract recurring customers</p>
            </div>
          )}
        </PageSection>
        {/* Add Plan Modal */}
        <CreateSubscriptionPlanModal
          isOpen={showAddPlanModal}
          onClose={() => setShowAddPlanModal(false)}
          onSubmit={handleCreatePlan}
        />
      </SupplierPageTemplate>
    </AuthGuard>
  );
}