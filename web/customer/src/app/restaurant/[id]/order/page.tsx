'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { OrderForm } from '@shared/components/OrderForm';
import { PaymentProcessor } from '@shared/components/PaymentProcessor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  walletAddress: string;
}

interface OrderData {
  restaurantId: string;
  items: any[];
  total: number;
  deliveryAddress: string;
  phoneNumber: string;
  paymentMethod: 'crypto' | 'card';
  specialInstructions?: string;
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load restaurant and menu data
    loadRestaurantData();
  }, [restaurantId]);

  const loadRestaurantData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockRestaurant: Restaurant = {
        id: restaurantId,
        name: 'Pizza Palace',
        address: '123 Main St, City, State',
        phone: '+1234567890',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Mock wallet address
      };

      const mockMenuItems: MenuItem[] = [
        {
          id: '1',
          name: 'Margherita Pizza',
          price: 12.99,
          category: 'Pizza',
          description: 'Fresh mozzarella, tomato sauce, basil',
        },
        {
          id: '2',
          name: 'Pepperoni Pizza',
          price: 14.99,
          category: 'Pizza',
          description: 'Pepperoni, mozzarella, tomato sauce',
        },
        {
          id: '3',
          name: 'Caesar Salad',
          price: 8.99,
          category: 'Salads',
          description: 'Romaine lettuce, croutons, parmesan, caesar dressing',
        },
        {
          id: '4',
          name: 'Garlic Bread',
          price: 5.99,
          category: 'Sides',
          description: 'Fresh baked bread with garlic butter',
        },
        {
          id: '5',
          name: 'Chocolate Brownie',
          price: 6.99,
          category: 'Desserts',
          description: 'Rich chocolate brownie with vanilla ice cream',
        },
      ];

      setRestaurant(mockRestaurant);
      setMenuItems(mockMenuItems);
    } catch (error) {
      console.error('Error loading restaurant data:', error);
      setError('Failed to load restaurant information');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = (data: OrderData) => {
    setOrderData(data);
  };

  const handlePaymentSuccess = async (txHash: string) => {
    try {
      // Create order in database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          transactionHash: txHash,
          status: 'confirmed',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      setOrderId(result.orderId);
      setOrderPlaced(true);

      // Notify POS system via WebSocket or API
      // This would trigger the order to appear in the POS terminal

    } catch (error: any) {
      console.error('Error creating order:', error);
      setError('Order placed but failed to save. Please contact support.');
    }
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handleBackToMenu = () => {
    setOrderData(null);
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">Restaurant not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-600">Order Placed Successfully!</CardTitle>
            <CardDescription>
              Your order #{orderId} has been confirmed and sent to the restaurant.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{restaurant.name}</p>
              <p className="text-sm text-muted-foreground">{restaurant.address}</p>
              <p className="text-sm text-muted-foreground">{restaurant.phone}</p>
            </div>

            <div className="space-y-2">
              <Button onClick={() => router.push('/orders')} className="w-full">
                View My Orders
              </Button>
              <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                Order from Another Restaurant
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Restaurant
          </Button>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <p className="text-muted-foreground">{restaurant.address}</p>
            <p className="text-muted-foreground">{restaurant.phone}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Order Flow */}
        {!orderData ? (
          <OrderForm
            restaurantId={restaurantId}
            menuItems={menuItems}
            onOrderSubmit={handleOrderSubmit}
            onError={setError}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order before payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderData.items.map((item: any) => (
                  <div key={item.menuItem.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.menuItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.menuItem.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${orderData.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p><strong>Delivery to:</strong> {orderData.deliveryAddress}</p>
                  <p><strong>Phone:</strong> {orderData.phoneNumber}</p>
                  {orderData.specialInstructions && (
                    <p><strong>Instructions:</strong> {orderData.specialInstructions}</p>
                  )}
                </div>

                <Button onClick={handleBackToMenu} variant="outline" className="w-full">
                  Back to Menu
                </Button>
              </CardContent>
            </Card>

            {/* Payment */}
            <PaymentProcessor
              amount={orderData.total}
              recipientAddress={restaurant.walletAddress}
              orderId={`ORDER-${Date.now()}`}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handleBackToMenu}
            />
          </div>
        )}
      </div>
    </div>
  );
}
