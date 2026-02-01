'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@shared/components/Card';
import { Input } from '@shared/components/Input';
import { Button } from '@shared/components/Button';
import { Label } from '@shared/components/Label';
import OrderTracking from '@/components/OrderTracking';
import { Search } from 'lucide-react';

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    // In a real implementation, we would validate the order ID with an API call
    // For now, we'll just proceed with tracking
    setError('');
    setIsTracking(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Track Your Order</h1>
          <p className="text-text-secondary">Enter your order ID to track the status of your delivery</p>
        </div>

        {!isTracking ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Enter Order ID</CardTitle>
              <CardDescription>Find your order ID in your confirmation email or app</CardDescription>
            </CardHeader>
            <form onSubmit={handleTrackOrder}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <div className="relative">
                    <Input
                      id="orderId"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. ORD-123456"
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Track Order
                </Button>
              </CardContent>
            </form>
          </Card>
        ) : (
          <OrderTracking orderId={orderId} />
        )}

        {!isTracking && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-text-primary mb-4">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Where is my order?</h3>
                  <p className="text-sm text-text-secondary">
                    Once you place an order, you can track its status in real-time. You'll see when it's being prepared, picked up, and on its way to you.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">How long will it take?</h3>
                  <p className="text-sm text-text-secondary">
                    Estimated delivery time is shown when you place your order. You'll receive updates if there are any changes.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Can I modify my order?</h3>
                  <p className="text-sm text-text-secondary">
                    Orders can be modified before they're confirmed by the restaurant. Contact support if you need to make changes.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">What if there's an issue?</h3>
                  <p className="text-sm text-text-secondary">
                    If you encounter any problems with your order, please contact our support team for assistance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;