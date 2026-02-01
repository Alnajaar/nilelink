'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@shared/components/ui/card';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  MapPin,
  Clock,
  Star,
  Gift,
  CreditCard,
  Settings
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';
import Link from 'next/link';

// Define the Order type to satisfy TypeScript
interface Order {
  id: string;
  restaurantName: string;
  status: string;
  createdAt: string;
  total: number;
  items: any[];
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  avgRating: number;
  totalSpent: number;
  rewardsEarned: number;
  favoriteRestaurants: number;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  avgRating: number;
  totalSpent: number;
  rewardsEarned: number;
  favoriteRestaurants: number;
}

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { orders, isLoading, isError } = useOrders();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    avgRating: 0,
    totalSpent: 0,
    rewardsEarned: 0,
    favoriteRestaurants: 0
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (orders.length > 0) {
      // Calculate stats based on orders
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((order: any) => 
        ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'picked-up'].includes(order.status.toLowerCase())
      ).length;
      
      const totalSpent = orders.reduce((sum: number, order: any) => sum + order.total, 0);
      
      // Mock data for other stats
      const avgRating = 4.7; // Would come from actual reviews
      const rewardsEarned = 125; // Would come from loyalty system
      const favoriteRestaurants = 3; // Would come from user preferences
      
      setStats({
        totalOrders,
        pendingOrders,
        avgRating,
        totalSpent,
        rewardsEarned,
        favoriteRestaurants
      });
    }
  }, [orders]);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'pending':
      case 'confirmed':
        return <Badge variant="secondary">Pending</Badge>;
      case 'preparing':
        return <Badge variant="default">Preparing</Badge>;
      case 'ready':
        return <Badge variant="default">Ready</Badge>;
      case 'picked_up':
      case 'picked-up':
        return <Badge variant="default">Out for delivery</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Customer Dashboard</h1>
        <p className="text-text-secondary">Manage your orders, rewards, and preferences</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <ShoppingBag className="h-4 w-4 text-muted-foreground mr-2" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="h-4 w-4 text-muted-foreground mr-2" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <Star className="h-4 w-4 text-muted-foreground mr-2" />
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.avgRating}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
              Spent
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">${stats.totalSpent.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <Gift className="h-4 w-4 text-muted-foreground mr-2" />
              Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.rewardsEarned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold">{stats.favoriteRestaurants}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">My Orders</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{order.restaurantName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/orders" className="w-full">
                  <Button variant="outline" className="w-full">
                    View All Orders
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loyalty Rewards</CardTitle>
                <CardDescription>Earn and redeem rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <Gift className="h-12 w-12 text-primary mx-auto mb-3" />
                    <p className="text-lg font-semibold">You have {stats.rewardsEarned} points</p>
                    <p className="text-sm text-muted-foreground mb-4">Redeem for discounts and rewards</p>
                    <Button>View Rewards</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">My Orders</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Restaurant</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-3 px-4 font-medium">#{order.id.substring(0, 8)}</td>
                        <td className="py-3 px-4 text-muted-foreground">{order.restaurantName}</td>
                        <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">${order.total.toFixed(2)}</td>
                        <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-3 px-4">
                          <Link href={`/track-order?orderId=${order.id}`}>
                            <Button variant="outline" size="sm">Track</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">My Rewards</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reward Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-5xl font-bold text-primary mb-2">{stats.rewardsEarned}</div>
                  <div className="text-sm text-muted-foreground">Points Available</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Redeem Points</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold">Welcome Back Discount</h3>
                    <p className="text-sm text-muted-foreground">20% off your next order</p>
                    <Badge variant="secondary" className="mt-2">Active</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold">Free Delivery</h3>
                    <p className="text-sm text-muted-foreground">On orders over $25</p>
                    <Badge variant="secondary" className="mt-2">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your profile and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Payment Methods</h3>
                    <p className="text-sm text-muted-foreground">Add or manage payment options</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Delivery Addresses</h3>
                    <p className="text-sm text-muted-foreground">Save your frequent delivery locations</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Notifications</h3>
                    <p className="text-sm text-muted-foreground">Control your notification preferences</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboard;