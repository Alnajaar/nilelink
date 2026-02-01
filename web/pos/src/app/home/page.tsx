// web/pos/src/app/home/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Store,
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  LogOut,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { Button } from '@shared/components/Button'
import { Card } from '@shared/components/Card'
import { useAuth } from '@shared/providers/AuthProvider'
import { motion } from 'framer-motion'

interface BusinessStats {
  totalOrders: number
  revenue: number
  products: number
  employees: number
  recentOrders: number
}

export default function PersonalizedHomePage() {
  const router = useRouter()
  const { user, logout, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<BusinessStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Not authenticated - show public homepage
        router.push('/')
        return
      }
      
      // Check if onboarding is pending
      if (user.onboardingStatus !== 'completed') {
        router.push('/onboarding/business-info')
        return
      }
      
      // Load business statistics
      loadBusinessStats()
    }
  }, [user, authLoading, router])

  const loadBusinessStats = async () => {
    try {
      // In a real implementation, this would fetch from your API
      // For demo purposes, using mock data
      const mockStats: BusinessStats = {
        totalOrders: 127,
        revenue: 15420.50,
        products: 42,
        employees: 3,
        recentOrders: 8
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Add items to your inventory',
      icon: Package,
      action: () => router.push('/products/create'),
      color: 'bg-blue-500'
    },
    {
      title: 'Process Order',
      description: 'Create a new customer order',
      icon: ShoppingCart,
      action: () => router.push('/orders/new'),
      color: 'bg-green-500'
    },
    {
      title: 'View Analytics',
      description: 'Check business performance',
      icon: BarChart3,
      action: () => router.push('/analytics'),
      color: 'bg-purple-500'
    },
    {
      title: 'Manage Staff',
      description: 'Add or edit employees',
      icon: Users,
      action: () => router.push('/staff'),
      color: 'bg-orange-500'
    }
  ]

  const recentActivities = [
    { id: 1, action: 'New order #ORD-001 placed', time: '2 minutes ago', type: 'order' },
    { id: 2, action: 'Product "Burger Deluxe" stock updated', time: '15 minutes ago', type: 'inventory' },
    { id: 3, action: 'Employee John Smith clocked in', time: '1 hour ago', type: 'employee' },
    { id: 4, action: 'Monthly report generated', time: '2 hours ago', type: 'report' }
  ]

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-white">NileLink POS</h1>
                <p className="text-sm text-gray-400">
                  Welcome back, {user?.firstName || 'Merchant'}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-white"
                onClick={() => router.push('/notifications')}
              >
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-white"
                onClick={() => router.push('/settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-white"
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Business Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">Business Overview</h2>
              <p className="text-gray-400 mt-2">Today's performance at a glance</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Full Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 hover:border-blue-500/50 transition-colors">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Orders</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.totalOrders.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 hover:border-green-500/50 transition-colors">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      ${(stats?.revenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 hover:border-purple-500/50 transition-colors">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Package className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Products</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.products || '0'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-lg border border-gray-700 hover:border-orange-500/50 transition-colors">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-500/20 rounded-lg">
                    <Users className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Employees</p>
                    <p className="text-2xl font-bold text-white">
                      {stats?.employees || '0'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 backdrop-blur-lg border border-gray-700">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <button
                          onClick={action.action}
                          className="w-full text-left p-4 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 hover:border-gray-500 transition-all group"
                        >
                          <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${action.color}`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-4 flex-1">
                              <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                {action.title}
                              </h4>
                              <p className="text-sm text-gray-400 mt-1">
                                {action.description}
                              </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-gray-800/50 backdrop-blur-lg border border-gray-700">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-300">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-6 border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => router.push('/activity')}
                >
                  View All Activity
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Business Status Banner */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30">
            <div className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-400 mr-4" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">Your POS is Live!</h3>
                  <p className="text-green-300 mt-1">
                    Your business is successfully deployed and ready to serve customers
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Start Selling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}