'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@shared/components/Card';
import { Badge } from '@shared/components/Badge';
import { Button } from '@shared/components/Button';
import { 
  MapPin, 
  Clock, 
  Bike, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package,
  Navigation,
  Star
} from 'lucide-react';
import { useOrders, type Order } from '@/hooks/useOrders';
import { useAuth } from '@shared/providers/FirebaseAuthProvider';

interface OrderTrackingProps {
  orderId?: string;
}

const OrderTracking = ({ orderId }: OrderTrackingProps) => {
  const { orders, isLoading, isError } = useOrders();
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingProgress, setTrackingProgress] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      // Find specific order by ID
      const order = orders.find(o => o.id === orderId);
      setSelectedOrder(order || null);
    } else if (orders.length > 0) {
      // Use the most recent order if no specific ID provided
      setSelectedOrder(orders[0]);
    }
  }, [orderId, orders]);

  useEffect(() => {
    if (selectedOrder) {
      // Simulate tracking progress based on order status
      const progress = getOrderProgress(selectedOrder.status);
      setTrackingProgress(progress);
    }
  }, [selectedOrder]);

  const getOrderProgress = (status: string) => {
    const progressSteps = [
      { id: 'placed', label: 'Order Placed', icon: Package, completed: false },
      { id: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, completed: false },
      { id: 'preparing', label: 'Preparing', icon: Clock, completed: false },
      { id: 'ready', label: 'Ready for Pickup', icon: Bike, completed: false },
      { id: 'picked-up', label: 'Picked Up', icon: Truck, completed: false },
      { id: 'delivered', label: 'Delivered', icon: CheckCircle, completed: false }
    ];

    // Mark steps as completed based on status
    switch (status.toLowerCase()) {
      case 'pending':
        progressSteps[0].completed = true;
        break;
      case 'confirmed':
        progressSteps[0].completed = true;
        progressSteps[1].completed = true;
        break;
      case 'preparing':
        progressSteps[0].completed = true;
        progressSteps[1].completed = true;
        progressSteps[2].completed = true;
        break;
      case 'ready':
        progressSteps[0].completed = true;
        progressSteps[1].completed = true;
        progressSteps[2].completed = true;
        progressSteps[3].completed = true;
        break;
      case 'picked_up':
      case 'picked-up':
        progressSteps[0].completed = true;
        progressSteps[1].completed = true;
        progressSteps[2].completed = true;
        progressSteps[3].completed = true;
        progressSteps[4].completed = true;
        break;
      case 'delivered':
        progressSteps.forEach(step => step.completed = true);
        break;
      case 'cancelled':
        // Special handling for cancelled orders
        return {
          steps: [{ id: 'cancelled', label: 'Order Cancelled', icon: XCircle, completed: true }],
          currentStep: 0
        };
      default:
        progressSteps[0].completed = true; // At least show it's placed
    }

    const currentStep = progressSteps.findIndex(step => !step.completed);
    return {
      steps: progressSteps,
      currentStep: currentStep === -1 ? progressSteps.length : currentStep
    };
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'preparing':
      case 'ready':
      case 'picked_up':
      case 'picked-up':
        return 'default';
      case 'pending':
      case 'confirmed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load order information</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!selectedOrder) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No order found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Order #{selectedOrder.id.substring(0, 8)}</CardTitle>
              <CardDescription>
                Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
              {selectedOrder.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Restaurant</h3>
              <p className="text-lg">{selectedOrder.restaurantName}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>123 Main St, City, State 12345</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Estimated: 25-35 mins</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Delivery Information</h3>
              <div className="space-y-2">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>123 Delivery St, City, State 12345</span>
                </div>
                <div className="flex items-center">
                  <Bike className="h-4 w-4 mr-2" />
                  <span>Driver: John D. (4.8 ★)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {trackingProgress && trackingProgress.steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Progress</CardTitle>
            <CardDescription>Track your order from kitchen to door</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {trackingProgress.steps.map((step: any, index: number) => {
                const IconComponent = step.icon;
                const isCurrent = index === trackingProgress.currentStep;
                const isCompleted = step.completed;
                
                return (
                  <div key={step.id} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                            ? 'bg-primary text-white ring-4 ring-primary/20' 
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {index < trackingProgress.steps.length - 1 && (
                        <div className={`h-16 w-0.5 mt-2 ${
                          index < trackingProgress.currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                    <div className="pb-8">
                      <h4 className={`font-semibold ${
                        isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <p className="text-sm text-muted-foreground">
                          {step.id === 'preparing' && 'Your order is being prepared in the kitchen'}
                          {step.id === 'ready' && 'Your order is ready for pickup'}
                          {step.id === 'picked-up' && 'Your driver is on the way'}
                          {step.id === 'delivered' && 'Your order has been delivered'}
                          {step.id === 'cancelled' && 'This order has been cancelled'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${(selectedOrder.total * 0.9).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>$2.99</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span>${(selectedOrder.total * 0.1).toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span>${selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button className="flex-1">
          <Navigation className="w-4 h-4 mr-2" />
          Open in Maps
        </Button>
        <Button variant="outline" className="flex-1">
          Contact Support
        </Button>
      </div>
    </div>
  );
};

export default OrderTracking;