'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Filter, MapPin, Phone, Mail, Clock, DollarSign, Star, TrendingUp, Package } from 'lucide-react';
import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import AuthGuard from '@shared/components/AuthGuard';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  lastOrderDate: string;
  subscriptionStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  loyaltyPoints: number;
  preferredDeliveryTime: string;
}

export default function SupplierCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'PAUSED' | 'CANCELLED'>('all');
  
  // Mock data - would connect to real API in production
  const [customers] = useState<Customer[]>([
    {
      id: 'cust-1',
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@email.com',
      phone: '+20 123 456 7890',
      address: '123 Main Street, Downtown Cairo',
      totalOrders: 42,
      totalSpent: 1250.75,
      avgOrderValue: 29.78,
      lastOrderDate: '2024-01-19',
      subscriptionStatus: 'ACTIVE',
      loyaltyPoints: 1250,
      preferredDeliveryTime: '08:00-12:00'
    },
    {
      id: 'cust-2',
      name: 'Fatima Mahmoud',
      email: 'fatima.m@email.com',
      phone: '+20 111 222 3333',
      address: '456 Oak Avenue, Alexandria',
      totalOrders: 28,
      totalSpent: 890.50,
      avgOrderValue: 31.80,
      lastOrderDate: '2024-01-18',
      subscriptionStatus: 'ACTIVE',
      loyaltyPoints: 890,
      preferredDeliveryTime: '14:00-18:00'
    },
    {
      id: 'cust-3',
      name: 'Mohamed Ali',
      email: 'mohamed.ali@email.com',
      phone: '+20 444 555 6666',
      address: '789 Palm Street, Giza',
      totalOrders: 15,
      totalSpent: 420.25,
      avgOrderValue: 28.02,
      lastOrderDate: '2024-01-15',
      subscriptionStatus: 'PAUSED',
      loyaltyPoints: 420,
      preferredDeliveryTime: '10:00-14:00'
    }
  ]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    const matchesFilter = filter === 'all' || customer.subscriptionStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      label: 'Total Customers',
      value: customers.length,
      icon: Users,
      color: 'blue' as const,
      change: '+12 this month'
    },
    {
      label: 'Active Subscribers',
      value: customers.filter(c => c.subscriptionStatus === 'ACTIVE').length,
      icon: Package,
      color: 'emerald' as const,
      change: '85% retention'
    },
    {
      label: 'Lifetime Value',
      value: `$${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'purple' as const,
      change: 'Avg $320/customer'
    },
    {
      label: 'Avg Order Value',
      value: `$${(customers.reduce((sum, c) => sum + c.avgOrderValue, 0) / customers.length).toFixed(2)}`,
      icon: TrendingUp,
      color: 'orange' as const,
      change: '+$2.50 vs last month'
    }
  ];

  return (
    <AuthGuard requiredRole={['VENDOR', 'ADMIN', 'SUPER_ADMIN']}>
      <SupplierPageTemplate
        title="Customer Management"
        icon={Users}
        subtitle="Manage your business relationships and customer insights"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>

        {/* Search & Filters */}
        <PageSection title="Customer Directory" subtitle="Search and filter your customer base">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
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
                  {status === 'all' ? 'All' : status} ({customers.filter(c => status === 'all' || c.subscriptionStatus === status).length})
                </motion.button>
              ))}
            </div>
          </div>
        </PageSection>

        {/* Customers List */}
        <PageSection title={`Customers (${filteredCustomers.length})`} subtitle="Your valued business partners">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCustomers.map((customer, idx) => (
                <motion.div
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 mb-1">{customer.name}</h3>
                      <Badge variant={customer.subscriptionStatus === 'ACTIVE' ? 'success' : customer.subscriptionStatus === 'PAUSED' ? 'warning' : 'error'}>
                        {customer.subscriptionStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="text-sm font-bold text-gray-600">{customer.loyaltyPoints}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="mt-0.5" />
                      <span>{customer.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>Prefers {customer.preferredDeliveryTime}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                      <p className="text-lg font-black text-gray-900">{customer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Spent</p>
                      <p className="text-lg font-black text-gray-900">${customer.totalSpent.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-10 text-sm rounded-lg"
                    >
                      View Details
                    </Button>
                    <Button
                      className="flex-1 h-10 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Message
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="h-96 flex flex-col items-center justify-center text-center">
              <Users size={64} className="text-gray-300 mb-4" />
              <p className="text-lg font-bold text-gray-600">No customers found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </PageSection>
      </SupplierPageTemplate>
    </AuthGuard>
  );
}