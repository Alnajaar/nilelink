'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { DollarSign, CheckCircle, Clock, AlertCircle, Download, Send, TrendingUp, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SupplierPageTemplate, { PageSection, StatCard } from '@/components/SupplierPageTemplate';
import { Badge } from '@shared/components/Badge';

interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  status: 'ISSUED' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  blockchainHash?: string;
  payments?: Array<{ id: string; amount: number; paymentMethod: string; transactionHash?: string; processedDate: string; }>;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Payments() {
  const { data: invoicesData, isLoading } = useSWR('/api/supplier/invoices', fetcher);
  const { data: analyticsData } = useSWR('/api/supplier/analytics/revenue', fetcher);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const invoices = invoicesData || [];
  const analytics = analyticsData || {};

  const filteredInvoices = selectedStatus === 'ALL'
    ? invoices
    : invoices.filter((inv: Invoice) => inv.status === selectedStatus);

  const statusCounts = {
    ALL: invoices.length,
    ISSUED: invoices.filter((inv: Invoice) => inv.status === 'ISSUED').length,
    SENT: invoices.filter((inv: Invoice) => inv.status === 'SENT').length,
    PARTIALLY_PAID: invoices.filter((inv: Invoice) => inv.status === 'PARTIALLY_PAID').length,
    PAID: invoices.filter((inv: Invoice) => inv.status === 'PAID').length,
    OVERDUE: invoices.filter((inv: Invoice) => inv.status === 'OVERDUE').length,
  };

  const totalOutstanding = invoices
    .filter((inv: Invoice) => ['ISSUED', 'SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status))
    .reduce((sum: number, inv: Invoice) => sum + inv.totalAmount, 0);

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${(analytics.totalRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'emerald' as const,
      change: 'All Time'
    },
    {
      label: 'This Month',
      value: `$${(analytics.thisMonthRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: 'blue' as const,
      change: 'Current Period'
    },
    {
      label: 'Outstanding',
      value: `$${totalOutstanding.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: AlertCircle,
      color: 'red' as const,
      change: 'Needs Payment'
    },
    {
      label: 'Pending Invoices',
      value: statusCounts.ISSUED + statusCounts.SENT,
      icon: Clock,
      color: 'amber' as const,
      change: 'Awaiting'
    }
  ];

  const getStatusColor = (status: Invoice['status']) => {
    const colors: Record<Invoice['status'], 'warning' | 'info' | 'success' | 'error' | 'neutral'> = {
      ISSUED: 'warning',
      SENT: 'info',
      PARTIALLY_PAID: 'warning',
      PAID: 'success',
      OVERDUE: 'error',
    };
    return colors[status];
  };

  const getStatusIcon = (status: Invoice['status']) => {
    const icons: Record<Invoice['status'], React.ReactNode> = {
      ISSUED: <Clock size={14} />,
      SENT: <Send size={14} />,
      PARTIALLY_PAID: <AlertCircle size={14} />,
      PAID: <CheckCircle size={14} />,
      OVERDUE: <AlertCircle size={14} />,
    };
    return icons[status];
  };

  return (
    <SupplierPageTemplate
      title="Payments & Invoicing"
      icon={CreditCard}
      subtitle="Manage invoices and payment settlement"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Status Tabs */}
      <PageSection title="Filter by Status">
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'ISSUED', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'].map((status) => (
            <motion.button
              key={status}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedStatus === status
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
            >
              {status} ({statusCounts[status as keyof typeof statusCounts]})
            </motion.button>
          ))}
        </div>
      </PageSection>

      {/* Invoices Table */}
      <PageSection title="Invoices">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-600">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-600">Issue Date</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-gray-600">Due Date</th>
                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-600">Amount</th>
                  <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-gray-600">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredInvoices.length > 0 ? filteredInvoices.map((invoice: Invoice, idx: number) => {
                    const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID';
                    return (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: idx * 0.02 }}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${isOverdue ? 'bg-red-50' : ''}`}
                      >
                        <td className="px-6 py-4 font-bold text-gray-900">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4 text-gray-600">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                            {isOverdue && ' (OVERDUE)'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-gray-900">
                          ${invoice.totalAmount.toFixed(2)} {invoice.currency}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={getStatusColor(invoice.status)} className="flex items-center gap-1 w-fit mx-auto">
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {invoice.status !== 'PAID' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-bold flex items-center gap-1"
                              >
                                <DollarSign size={14} />
                                Pay
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 font-bold flex items-center gap-1"
                            >
                              <Download size={14} />
                              PDF
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-600 font-bold">No invoices found</p>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </PageSection>
    </SupplierPageTemplate>
  );
}
