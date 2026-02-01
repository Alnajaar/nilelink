'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Users, ShoppingCart,
    DollarSign, Package, Clock, BarChart3,
    PieChart, Activity, Download, RefreshCw,
    Calendar, Filter
} from 'lucide-react';
import { AnalyticsEngine, SalesMetrics, CustomerMetrics, InventoryMetrics, PerformanceMetrics } from '@/lib/analytics/AnalyticsEngine';
import { OrderManager } from '@/lib/orders/OrderManager';
import { Button } from '@/shared/components/Button';
import { Badge } from '@/shared/components/Badge';

interface AnalyticsDashboardProps {
  analyticsEngine: AnalyticsEngine;
  orderManager: OrderManager;
}

type TimeRange = 'day' | 'week' | 'month' | 'year';
type MetricType = 'sales' | 'customers' | 'inventory' | 'performance';

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analyticsEngine,
  orderManager
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [activeTab, setActiveTab] = useState<MetricType>('sales');
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
  const [inventoryMetrics, setInventoryMetrics] = useState<InventoryMetrics | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);

    try {
      // Load all metrics in parallel
      const [sales, customers, inventory, performance] = await Promise.all([
        Promise.resolve(analyticsEngine.getSalesMetrics(timeRange)),
        Promise.resolve(analyticsEngine.getCustomerMetrics()),
        Promise.resolve(analyticsEngine.getInventoryMetrics()),
        Promise.resolve(analyticsEngine.getPerformanceMetrics())
      ]);

      setSalesMetrics(sales);
      setCustomerMetrics(customers);
      setInventoryMetrics(inventory);
      setPerformanceMetrics(performance);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: MetricType) => {
    try {
      const data = await analyticsEngine.exportData(type, 'csv');
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const renderSalesTab = () => {
    if (!salesMetrics) return null;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesMetrics.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{salesMetrics.totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesMetrics.averageOrderValue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesMetrics.dailyRevenue)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales by Day */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Sales by Day (Last 7 Days)</h3>
            <div className="space-y-3">
              {salesMetrics.salesByDay.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.day}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{day.orders} orders</span>
                    <span className="font-semibold">{formatCurrency(day.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Items */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
            <div className="space-y-3">
              {salesMetrics.topSellingItems.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-600 ml-2">({item.quantity} sold)</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly Sales */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Sales by Hour</h3>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {salesMetrics.salesByHour.map((hour) => (
              <div key={hour.hour} className="text-center">
                <div className="text-xs text-gray-600 mb-1">
                  {hour.hour === 0 ? '12AM' : hour.hour < 12 ? `${hour.hour}AM` : hour.hour === 12 ? '12PM' : `${hour.hour - 12}PM`}
                </div>
                <div className="bg-blue-100 rounded p-2">
                  <div className="text-xs font-medium">{hour.orders}</div>
                  <div className="text-xs text-gray-600">{formatCurrency(hour.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCustomersTab = () => {
    if (!customerMetrics) return null;

    return (
      <div className="space-y-6">
        {/* Customer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customerMetrics.totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Repeat Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customerMetrics.repeatCustomers}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Customer Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(customerMetrics.averageCustomerValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                <p className="text-2xl font-bold text-gray-900">{formatPercentage(customerMetrics.customerRetentionRate)}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Customer Segments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Customers</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(customerMetrics.customerSegments.new / customerMetrics.totalCustomers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{customerMetrics.customerSegments.new}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Regular Customers</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(customerMetrics.customerSegments.regular / customerMetrics.totalCustomers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{customerMetrics.customerSegments.regular}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">VIP Customers</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(customerMetrics.customerSegments.vip / customerMetrics.totalCustomers) * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-semibold">{customerMetrics.customerSegments.vip}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
            <div className="space-y-3">
              {customerMetrics.topCustomers.slice(0, 5).map((customer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-sm text-gray-600 ml-2">({customer.orders} orders)</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(customer.totalSpent)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    if (!performanceMetrics) return null;

    return (
      <div className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Fulfillment Time</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.orderFulfillmentTime.toFixed(1)}m</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kitchen Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.kitchenEfficiency.toFixed(1)}/hr</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Table Turnover</p>
                <p className="text-2xl font-bold text-gray-900">{performanceMetrics.tableTurnover}m</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Peak Hour</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performanceMetrics.peakHours[0]?.hour || 0}:00
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Staff Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Staff Member</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Orders Processed</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {performanceMetrics.staffProductivity.map((staff) => (
                  <tr key={staff.staffId}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{staff.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{staff.ordersProcessed}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${staff.efficiency}%` }}
                          ></div>
                        </div>
                        {staff.efficiency}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={staff.efficiency > 90 ? 'success' : staff.efficiency > 80 ? 'warning' : 'error'}>
                        {staff.efficiency > 90 ? 'Excellent' : staff.efficiency > 80 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Peak Hours Analysis</h3>
          <div className="grid grid-cols-5 gap-4">
            {performanceMetrics.peakHours.slice(0, 5).map((peak, index) => (
              <div key={index} className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{peak.hour}:00</div>
                <div className="text-sm text-gray-600">{peak.orderVolume} orders</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'sales', label: 'Sales Analytics', icon: TrendingUp },
    { id: 'customers', label: 'Customer Insights', icon: Users },
    { id: 'performance', label: 'Performance Metrics', icon: Activity }
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
            <p className="text-gray-600 mt-1">
              Real-time business intelligence and insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAnalytics}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as MetricType)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport(activeTab)}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'sales' && renderSalesTab()}
            {activeTab === 'customers' && renderCustomersTab()}
            {activeTab === 'performance' && renderPerformanceTab()}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
