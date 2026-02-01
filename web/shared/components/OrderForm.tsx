'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Plus, Minus, ShoppingCart } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface OrderFormProps {
  restaurantId: string;
  menuItems: MenuItem[];
  onOrderSubmit: (order: OrderData) => void;
  onError: (error: string) => void;
}

interface OrderData {
  restaurantId: string;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  phoneNumber: string;
  paymentMethod: 'crypto' | 'card';
  specialInstructions?: string;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  restaurantId,
  menuItems,
  onOrderSubmit,
  onError
}) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'card'>('crypto');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  // Group menu items by category
  const menuByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const addToOrder = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(item => item.menuItem.id === menuItem.id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { menuItem, quantity: 1 }]);
    }
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(orderItems.filter(item => item.menuItem.id !== menuItemId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getTotal = () => {
    return orderItems.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      onError('Please add at least one item to your order');
      return;
    }

    if (!deliveryAddress.trim()) {
      onError('Please enter a delivery address');
      return;
    }

    if (!phoneNumber.trim()) {
      onError('Please enter a phone number');
      return;
    }

    setLoading(true);

    try {
      const orderData: OrderData = {
        restaurantId,
        items: orderItems,
        total: getTotal(),
        deliveryAddress,
        phoneNumber,
        paymentMethod,
        specialInstructions: specialInstructions.trim() || undefined,
      };

      onOrderSubmit(orderData);
    } catch (error: any) {
      onError(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Menu Section */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Menu</CardTitle>
            <CardDescription>Choose your items</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-primary">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => {
                    const orderItem = orderItems.find(oi => oi.menuItem.id === item.id);
                    return (
                      <Card key={item.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                          </div>

                          {orderItem ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, orderItem.quantity - 1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="font-medium">{orderItem.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(item.id, orderItem.quantity + 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                ${(item.price * orderItem.quantity).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <Button
                              onClick={() => addToOrder(item)}
                              className="w-full"
                              size="sm"
                            >
                              Add to Order
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No items in order</p>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.menuItem.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.menuItem.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.menuItem.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium">
                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter your delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={paymentMethod === 'crypto' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('crypto')}
                        className="flex-1"
                      >
                        Crypto (USDC)
                      </Button>
                      <Button
                        type="button"
                        variant={paymentMethod === 'card' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('card')}
                        className="flex-1"
                      >
                        Card
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                    <Input
                      id="instructions"
                      placeholder="Any special requests..."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || orderItems.length === 0}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Place Order - ${getTotal().toFixed(2)}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
