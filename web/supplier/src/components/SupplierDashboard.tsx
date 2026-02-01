'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@shared/components/Card';
import { Button } from '@shared/components/Button';
import { Badge } from '@shared/components/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components/Tabs';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';
import { SupplierService, type Supplier, type SupplierInventory, type SupplierOrder } from '@shared/services/SupplierService';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  lowStockItems: number;
  newOrders: number;
}

const SupplierDashboard = () => {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [inventory, setInventory] = useState<SupplierInventory[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    newOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, we'd use the actual SupplierService
      // For now, we'll simulate data loading
      const mockSupplier: Supplier = {
        id: 'sup_123456789',
        userId: user?.uid || 'user_123',
        businessName: 'ABC Wholesale Distributors',
        description: 'Leading supplier of electronics and household goods',
        contactEmail: 'contact@abcwholesale.com',
        contactPhone: '+1-555-123-4567',
        address: '123 Main St, City, State 12345',
        taxId: '12-3456789',
        businessType: 'distributor',
        status: 'approved',
        commissionRate: 5.0,
        payoutMethod: 'bank_transfer',
        bankDetails: {
          accountNumber: '****5678',
          routingNumber: '****1234',
          bankName: 'Example Bank'
        },
        minOrderAmount: 50,
        shippingOptions: [
          { id: 'ship_1', name: 'Standard Ground', cost: 5.99, estimatedDays: 5, serviceType: 'standard', zones: ['local', 'regional'] },
          { id: 'ship_2', name: 'Express', cost: 12.99, estimatedDays: 2, serviceType: 'express', zones: ['local', 'regional', 'national'] }
        ],
        inventorySyncEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalSales: 125000,
        totalOrders: 245,
        rating: 4.7,
        active: true
      };

      const mockInventory: SupplierInventory[] = [
        {
          id: 'inv_1',
          supplierId: 'sup_123456789',
          productId: 'prod_1',
          sku: 'ELEC-001',
          productName: 'Wireless Headphones',
          description: 'High-quality wireless headphones with noise cancellation',
          category: 'Electronics',
          price: 89.99,
          costPrice: 45.00,
          stockQuantity: 42,
          reservedQuantity: 3,
          minStockThreshold: 10,
          weight: 0.3,
          images: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'inv_2',
          supplierId: 'sup_123456789',
          productId: 'prod_2',
          sku: 'HOME-002',
          productName: 'Coffee Maker',
          description: 'Automatic drip coffee maker with thermal carafe',
          category: 'Home Appliances',
          price: 49.99,
          costPrice: 25.00,
          stockQuantity: 8,
          reservedQuantity: 2,
          minStockThreshold: 15,
          weight: 2.1,
          images: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'inv_3',
          supplierId: 'sup_123456789',
          productId: 'prod_3',
          sku: 'ELEC-003',
          productName: 'Smart Watch',
          description: 'Fitness tracker with heart rate monitor',
          category: 'Electronics',
          price: 199.99,
          costPrice: 100.00,
          stockQuantity: 0,
          reservedQuantity: 0,
          minStockThreshold: 5,
          weight: 0.1,
          images: [],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockOrders: SupplierOrder[] = [
        {
          id: 'ord_1',
          supplierId: 'sup_123456789',
          buyerId: 'buyer_1',
          items: [
            {
              id: 'item_1',
              orderId: 'ord_1',
              inventoryId: 'inv_1',
              productName: 'Wireless Headphones',
              quantity: 5,
              unitPrice: 89.99,
              totalAmount: 449.95
            }
          ],
          status: 'processing',
          totalAmount: 449.95,
          totalCost: 225.00,
          commissionAmount: 22.50,
          netAmount: 427.45,
          shippingAddress: '456 Market St, City, State 67890',
          billingAddress: '456 Market St, City, State 67890',
          shippingOptionId: 'ship_1',
          estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: 'ord_2',
          supplierId: 'sup_123456789',
          buyerId: 'buyer_2',
          items: [
            {
              id: 'item_2',
              orderId: 'ord_2',
              inventoryId: 'inv_2',
              productName: 'Coffee Maker',
              quantity: 2,
              unitPrice: 49.99,
              totalAmount: 99.98
            }
          ],
          status: 'pending',
          totalAmount: 99.98,
          totalCost: 50.00,
          commissionAmount: 5.00,
          netAmount: 94.98,
          shippingAddress: '789 Oak Ave, City, State 54321',
          billingAddress: '789 Oak Ave, City, State 54321',
          shippingOptionId: 'ship_2',
          estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: 'ord_3',
          supplierId: 'sup_123456789',
          buyerId: 'buyer_3',
          items: [
            {
              id: 'item_3',
              orderId: 'ord_3',
              inventoryId: 'inv_3',
              productName: 'Smart Watch',
              quantity: 1,
              unitPrice: 199.99,
              totalAmount: 199.99
            }
          ],
          status: 'shipped',
          totalAmount: 199.99,
          totalCost: 100.00,
          commissionAmount: 10.00,
          netAmount: 189.99,
          shippingAddress: '321 Pine Rd, City, State 09876',
          billingAddress: '321 Pine Rd, City, State 09876',
          shippingOptionId: 'ship_2',
          estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          actualDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      ];

      setSupplier(mockSupplier);
      setInventory(mockInventory);
      setOrders(mockOrders);

      // Calculate stats
      const newStats: DashboardStats = {
        totalProducts: mockInventory.length,
        totalOrders: mockOrders.length,
        pendingOrders: mockOrders.filter(o => o.status === 'pending' || o.status === 'processing').length,
        totalRevenue: mockOrders.reduce((sum, order) => sum + order.netAmount, 0),
        lowStockItems: mockInventory.filter(i => i.stockQuantity <= i.minStockThreshold).length,
        newOrders: mockOrders.filter(o => o.status === 'pending').length
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'processing':
        return <Badge variant="default">Processing</Badge>;
      case 'shipped':
        return <Badge variant="info">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
      case 'returned':
        return <Badge variant="destructive">Returned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold text-text-main">Supplier Dashboard</h1>
        <p className="text-text-muted">Manage your inventory, orders, and business operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active items in catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Processed this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Net earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <Card className="mb-8 border-l-4 border-l-yellow-500">
          <CardContent className="py-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <h3 className="font-semibold">Low Stock Alert</h3>
                <p className="text-sm text-muted-foreground">{stats.lowStockItems} items are running low on inventory</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                Review Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>You have {stats.newOrders} new orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">{order.buyerId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Your best-selling items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory
                    .filter(item => item.isActive)
                    .sort((a, b) => b.stockQuantity - a.stockQuantity)
                    .slice(0, 3)
                    .map((product) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.productName}</p>
                          <p className="text-sm text-muted-foreground">{product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${product.price.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{product.stockQuantity} in stock</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Inventory Management</h2>
            <Button>Add New Item</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-left py-3 px-4">SKU</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Stock</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-4 font-medium">{item.productName}</td>
                        <td className="py-3 px-4 text-muted-foreground">{item.sku}</td>
                        <td className="py-3 px-4">{item.category}</td>
                        <td className="py-3 px-4">${item.price.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {item.stockQuantity}
                            {item.stockQuantity <= item.minStockThreshold && (
                              <AlertTriangle className="h-4 w-4 ml-1 text-yellow-500" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {item.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Order Management</h2>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4">Order ID</th>
                      <th className="text-left py-3 px-4">Buyer</th>
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
                        <td className="py-3 px-4 text-muted-foreground">{order.buyerId}</td>
                        <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">${order.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Profile</CardTitle>
              <CardDescription>Manage your business information</CardDescription>
            </CardHeader>
            <CardContent>
              {supplier && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Business Information</h3>
                    <p><span className="text-muted-foreground">Name:</span> {supplier.businessName}</p>
                    <p><span className="text-muted-foreground">Type:</span> {supplier.businessType}</p>
                    <p><span className="text-muted-foreground">Status:</span> 
                      <Badge className="ml-2" variant={
                        supplier.status === 'approved' ? 'success' : 
                        supplier.status === 'pending' ? 'secondary' : 
                        supplier.status === 'suspended' ? 'destructive' : 'destructive'
                      }>
                        {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                      </Badge>
                    </p>
                    <p><span className="text-muted-foreground">Commission Rate:</span> {supplier.commissionRate}%</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <p><span className="text-muted-foreground">Email:</span> {supplier.contactEmail}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {supplier.contactPhone}</p>
                    <p><span className="text-muted-foreground">Address:</span> {supplier.address}</p>
                    <p><span className="text-muted-foreground">Tax ID:</span> {supplier.taxId}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierDashboard;