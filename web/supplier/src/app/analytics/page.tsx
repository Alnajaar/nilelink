'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart,
  Users, Calendar, Filter, Download, Eye, PieChart, Activity, Target
} from 'lucide-react';
import { Button } from '@shared/components/Button';
import { Card } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';

interface AnalyticsData {
  revenue: {
    current: number;
    previous: number;
    growth: number;
  };
  orders: {
    current: number;
    previous: number;
    growth: number;
  };
  products: {
    active: number;
    lowStock: number;
    outOfStock: number;
  };
  customers: {
    new: number;
    returning: number;
    total: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    value: number;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30days');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics?supplierId=${user?.uid}&range=${dateRange}`);
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchAnalytics();
    }
  }, [user, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background antialiased">
      <div className="max-w-7xl mx-auto px-6 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text-main">Analytics Dashboard</h1>
              <p className="text-text-muted">Track your business performance and growth metrics</p>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-3 bg-surface border border-border-subtle rounded-lg text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
                <option value="year">This Year</option>
              </select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total Revenue</p>
                <p className="text-2xl font-bold text-text-main">
                  {analyticsData ? formatCurrency(analyticsData.revenue.current) : '$0'}
                </p>
                <div className="flex items-center mt-1">
                  {analyticsData?.revenue.growth !== undefined && (
                    <>
                      {analyticsData.revenue.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${analyticsData.revenue.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {Math.abs(analyticsData.revenue.growth)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Total Orders</p>
                <p className="text-2xl font-bold text-text-main">
                  {analyticsData?.orders.current || 0}
                </p>
                <div className="flex items-center mt-1">
                  {analyticsData?.orders.growth !== undefined && (
                    <>
                      {analyticsData.orders.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${analyticsData.orders.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {Math.abs(analyticsData.orders.growth)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Active Products</p>
                <p className="text-2xl font-bold text-text-main">
                  {analyticsData?.products.active || 0}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-text-subtle">In stock</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">New Customers</p>
                <p className="text-2xl font-bold text-text-main">
                  {analyticsData?.customers.new || 0}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-text-subtle">This period</span>
                </div>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <Users className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-main">Revenue Trend</h2>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Report
              </Button>
            </div>
            <div className="h-80 flex items-center justify-center border-2 border-dashed border-border-subtle rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted font-medium">Revenue Chart Visualization</p>
                <p className="text-sm text-text-subtle mt-1">Daily revenue over selected period</p>
              </div>
            </div>
          </Card>

          {/* Category Distribution */}
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-main">Category Distribution</h2>
              <Button variant="outline" size="sm">
                <PieChart className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
            <div className="h-80 flex items-center justify-center border-2 border-dashed border-border-subtle rounded-lg">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted font-medium">Category Distribution</p>
                <p className="text-sm text-text-subtle mt-1">Revenue by product category</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Products and Inventory Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Selling Products */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-main">Top Selling Products</h2>
              <Button variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {analyticsData?.topProducts?.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-surface/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-slate-200 border-2 border-dashed rounded-xl w-12 h-12 mr-4" />
                    <div>
                      <h3 className="font-medium text-text-main">{product.name}</h3>
                      <p className="text-sm text-text-muted">ID: {product.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-text-main">{product.sales} sold</p>
                    <p className="text-sm text-text-muted">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
              {!analyticsData?.topProducts?.length && (
                <div className="text-center py-8 text-text-muted">
                  <p>No sales data available</p>
                </div>
              )}
            </div>
          </Card>

          {/* Inventory Status */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-main">Inventory Status</h2>
              <Button variant="outline" size="sm">
                <Target className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-red-800">Out of Stock</h3>
                  <span className="text-lg font-bold text-red-800">{analyticsData?.products.outOfStock || 0}</span>
                </div>
                <p className="text-sm text-red-600">Products that need immediate restocking</p>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-yellow-800">Low Stock</h3>
                  <span className="text-lg font-bold text-yellow-800">{analyticsData?.products.lowStock || 0}</span>
                </div>
                <p className="text-sm text-yellow-600">Products approaching minimum stock levels</p>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-green-800">Well Stocked</h3>
                  <span className="text-lg font-bold text-green-800">
                    {analyticsData ? analyticsData.products.active - analyticsData.products.lowStock - analyticsData.products.outOfStock : 0}
                  </span>
                </div>
                <p className="text-sm text-green-600">Products with adequate stock levels</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}