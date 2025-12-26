import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import Types
import { RootState, AppDispatch } from '../store';

// Import Actions
import { updateOrderStatus, rateOrder, reorderItems } from '../store/slices/orderSlice';

interface OrderStatus {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  estimatedTime?: string;
  completed: boolean;
  timestamp?: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  customizations?: string[];
}

interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicleType: 'bike' | 'car' | 'scooter';
  licensePlate: string;
  photo: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const OrderTrackingScreen: React.FC<{ route: any }> = ({ route }) => {
  const { orderId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const order = useSelector((state: RootState) => state.order.currentOrder);

  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [driverRating, setDriverRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isReordering, setIsReordering] = useState(false);

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const statusAnimation = useRef(new Animated.Value(0)).current;

  // Mock order data
  const mockOrder = {
    id: orderId,
    orderNumber: '#NL-2024-001',
    status: 'in_progress',
    placedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    estimatedDelivery: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
    restaurant: {
      id: '1',
      name: 'Bella Italia',
      address: '123 Main St, New York, NY 10001',
      phone: '+1 (555) 123-4567',
    },
    deliveryAddress: {
      street: '456 Oak Avenue',
      city: 'New York',
      zipCode: '10002',
      coordinates: {
        latitude: 40.7589,
        longitude: -73.9851,
      },
    },
    items: [
      {
        id: '1',
        name: 'Margherita Pizza (Large)',
        quantity: 1,
        price: 22.99,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100',
        customizations: ['Thick Crust', 'Extra Pepperoni', 'Mushrooms'],
      },
      {
        id: '2',
        name: 'Truffle Risotto',
        quantity: 2,
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=100',
      },
    ],
    subtotal: 72.97,
    deliveryFee: 2.99,
    tax: 6.39,
    tip: 10.95,
    total: 93.30,
    paymentMethod: 'NileLink Wallet',
  };

  const orderStatuses: OrderStatus[] = [
    {
      id: 'confirmed',
      name: 'Order Confirmed',
      description: 'Your order has been confirmed by the restaurant',
      icon: 'checkmark-circle',
      color: '#10b981',
      completed: true,
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 'preparing',
      name: 'Preparing',
      description: 'Chef is preparing your delicious meal',
      icon: 'restaurant',
      color: '#f59e0b',
      completed: true,
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      estimatedTime: '5-10 min',
    },
    {
      id: 'ready',
      name: 'Ready for Pickup',
      description: 'Your order is ready and waiting for the driver',
      icon: 'checkmark-done-circle',
      color: '#3b82f6',
      completed: true,
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
    {
      id: 'picked_up',
      name: 'On the Way',
      description: 'Your order is with the delivery driver',
      icon: 'bicycle',
      color: '#8b5cf6',
      completed: true,
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      estimatedTime: '15-20 min',
    },
    {
      id: 'delivered',
      name: 'Delivered',
      description: 'Enjoy your meal!',
      icon: 'home',
      color: '#10b981',
      completed: false,
    },
  ];

  const mockDriver: DeliveryDriver = {
    id: '1',
    name: 'Alex Rodriguez',
    phone: '+1 (555) 987-6543',
    rating: 4.9,
    vehicleType: 'bike',
    licensePlate: 'NYC-2024',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    currentLocation: {
      latitude: 40.7505,
      longitude: -73.9934,
    },
  };

  useEffect(() => {
    // Simulate real-time status updates
    const statusTimer = setInterval(() => {
      setCurrentStatusIndex(prev => {
        if (prev < orderStatuses.length - 1) {
          const newIndex = prev + 1;
          // Animate progress bar
          Animated.timing(progressAnimation, {
            toValue: (newIndex + 1) / orderStatuses.length,
            duration: 1000,
            useNativeDriver: false,
          }).start();

          // Animate status change
          Animated.sequence([
            Animated.timing(statusAnimation, {
              toValue: 1,
              duration: 300,
              useNativeDriver: false,
            }),
            Animated.timing(statusAnimation, {
              toValue: 0,
              duration: 300,
              useNativeDriver: false,
            }),
          ]).start();

          return newIndex;
        }
        return prev;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(statusTimer);
  }, [progressAnimation, statusAnimation]);

  const handleCallRestaurant = () => {
    Alert.alert(
      'Call Restaurant',
      `Call ${mockOrder.restaurant.name} at ${mockOrder.restaurant.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {/* Implement phone call */ } },
      ]
    );
  };

  const handleCallDriver = () => {
    if (currentStatusIndex >= 3) { // Only show when order is picked up
      Alert.alert(
        'Call Driver',
        `Call ${mockDriver.name} at ${mockDriver.phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => {/* Implement phone call */ } },
        ]
      );
    }
  };

  const handleRateOrder = () => {
    setShowRatingModal(true);
  };

  const submitRating = () => {
    dispatch(rateOrder({
      orderId,
      driverRating,
      foodRating,
      review: reviewText,
    }));
    setShowRatingModal(false);
    Alert.alert('Thank you!', 'Your feedback helps us improve our service.');
  };

  const handleReorder = async () => {
    setIsReordering(true);
    try {
      await dispatch(reorderItems(mockOrder.items));
      Alert.alert('Success', 'Items added to your cart!');
      // Navigate to checkout
    } catch (error) {
      Alert.alert('Error', 'Failed to reorder items. Please try again.');
    } finally {
      setIsReordering(false);
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const deliveryTime = mockOrder.estimatedDelivery;
    const diff = deliveryTime.getTime() - now.getTime();

    if (diff <= 0) return 'Delivered!';

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentStatus = orderStatuses[currentStatusIndex];
  const isDelivered = currentStatusIndex === orderStatuses.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: '#f9f8f4' }}>
      {/* Header */}
      <LinearGradient
        colors={['#0e372b', '#1a5240']}
        style={{
          paddingTop: 50,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 50,
            left: 16,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
            padding: 8,
          }}
          onPress={() => {/* Navigate back */ }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 4,
          }}>
            Track Your Order
          </Text>
          <Text style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.9)',
          }}>
            {mockOrder.orderNumber}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Live Status Card */}
        <View style={{
          backgroundColor: 'white',
          margin: 16,
          borderRadius: 12,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          {/* Progress Bar */}
          <View style={{ marginBottom: 20 }}>
            <View style={{
              height: 4,
              backgroundColor: '#e5e7eb',
              borderRadius: 2,
              marginBottom: 8,
            }}>
              <Animated.View style={{
                height: 4,
                backgroundColor: currentStatus.color,
                borderRadius: 2,
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }} />
            </View>
            <Text style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#6b7280',
            }}>
              {currentStatusIndex + 1} of {orderStatuses.length} steps completed
            </Text>
          </View>

          {/* Current Status */}
          <Animated.View style={{
            alignItems: 'center',
            opacity: statusAnimation.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [1, 0.5, 1],
            }),
            transform: [{
              scale: statusAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0.95, 1],
              }),
            }],
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: currentStatus.color + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons
                name={currentStatus.icon as any}
                size={40}
                color={currentStatus.color}
              />
            </View>

            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#1f2937',
              textAlign: 'center',
              marginBottom: 8,
            }}>
              {currentStatus.name}
            </Text>

            <Text style={{
              fontSize: 16,
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: 16,
            }}>
              {currentStatus.description}
            </Text>

            {!isDelivered && (
              <View style={{
                backgroundColor: '#f0f9f4',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginBottom: 16,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#065f46',
                }}>
                  🕐 {getTimeRemaining()}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: 20,
          }}>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                padding: 12,
                backgroundColor: '#f3f4f6',
                borderRadius: 12,
                flex: 1,
                marginHorizontal: 4,
              }}
              onPress={handleCallRestaurant}
            >
              <Ionicons name="call" size={20} color="#0e372b" />
              <Text style={{ fontSize: 12, color: '#0e372b', marginTop: 4 }}>
                Call Restaurant
              </Text>
            </TouchableOpacity>

            {currentStatusIndex >= 3 && (
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  padding: 12,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 12,
                  flex: 1,
                  marginHorizontal: 4,
                }}
                onPress={handleCallDriver}
              >
                <Ionicons name="call" size={20} color="#0e372b" />
                <Text style={{ fontSize: 12, color: '#0e372b', marginTop: 4 }}>
                  Call Driver
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{
                alignItems: 'center',
                padding: 12,
                backgroundColor: '#f3f4f6',
                borderRadius: 12,
                flex: 1,
                marginHorizontal: 4,
              }}
              onPress={() => {/* Open support chat */ }}
            >
              <Ionicons name="chatbubble" size={20} color="#0e372b" />
              <Text style={{ fontSize: 12, color: '#0e372b', marginTop: 4 }}>
                Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Driver Info (when order is picked up) */}
        {currentStatusIndex >= 3 && (
          <View style={{
            backgroundColor: 'white',
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 12,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: 16,
            }}>
              Your Driver
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Ionicons name="person" size={30} color="#6b7280" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: 4,
                }}>
                  {mockDriver.name}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 4 }}>
                    {mockDriver.rating} • {mockDriver.vehicleType === 'bike' ? '🚴' : mockDriver.vehicleType === 'car' ? '🚗' : '🛵'} {mockDriver.licensePlate}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#0e372b',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    alignSelf: 'flex-start',
                  }}
                  onPress={() => {/* Open map with driver location */ }}
                >
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                    📍 Track Live
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Order Details */}
        <View style={{
          backgroundColor: 'white',
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 16,
          }}>
            Order Details
          </Text>

          {mockOrder.items.map((item) => (
            <View key={item.id} style={{
              flexDirection: 'row',
              marginBottom: 12,
              paddingBottom: 12,
              borderBottomWidth: item.id !== mockOrder.items[mockOrder.items.length - 1].id ? 1 : 0,
              borderBottomColor: '#e5e7eb',
            }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 8,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Text style={{ fontSize: 20 }}>🍕</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: 4,
                }}>
                  {item.name}
                </Text>

                {item.customizations && item.customizations.length > 0 && (
                  <Text style={{
                    fontSize: 12,
                    color: '#6b7280',
                    marginBottom: 4,
                  }}>
                    {item.customizations.join(' • ')}
                  </Text>
                )}

                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  Qty: {item.quantity} • ${item.price.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          {/* Order Summary */}
          <View style={{
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingTop: 16,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Subtotal</Text>
              <Text style={{ fontSize: 14, color: '#1f2937' }}>${mockOrder.subtotal.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Delivery Fee</Text>
              <Text style={{ fontSize: 14, color: '#1f2937' }}>${mockOrder.deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Tax</Text>
              <Text style={{ fontSize: 14, color: '#1f2937' }}>${mockOrder.tax.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>Tip</Text>
              <Text style={{ fontSize: 14, color: '#1f2937' }}>${mockOrder.tip.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0e372b' }}>
                ${mockOrder.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={{
          backgroundColor: 'white',
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 12,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: 16,
          }}>
            Delivery Address
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="location" size={20} color="#0e372b" style={{ marginTop: 2, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                color: '#1f2937',
                marginBottom: 4,
              }}>
                {mockOrder.deliveryAddress.street}
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>
                {mockOrder.deliveryAddress.city}, {mockOrder.deliveryAddress.zipCode}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 16,
          marginBottom: 32,
        }}>
          {isDelivered ? (
            <>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#0e372b',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginRight: 8,
                }}
                onPress={handleRateOrder}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  Rate Order
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginLeft: 8,
                }}
                onPress={handleReorder}
                disabled={isReordering}
              >
                <Text style={{
                  color: isReordering ? '#6b7280' : '#1f2937',
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                  {isReordering ? 'Reordering...' : 'Reorder'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#0e372b',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
              }}
              onPress={() => {/* Navigate to order history */ }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                View All Orders
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderTrackingScreen;