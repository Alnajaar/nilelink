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
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { io, Socket } from 'socket.io-client';
import { api } from '@nilelink/mobile-shared';

// Import Types
import { RootState, AppDispatch } from '../store';

// Import Actions
// import { updateOrderStatus, rateOrder, reorderItems } from '../store/slices/orderSlice';

const SOCKET_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3010'
  : 'http://localhost:3010';

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

// Mock data for demonstration
const mockOrder = {
  restaurant: {
    name: 'Bella Italia',
    phone: '+1-555-0123',
  },
  estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
};

const mockDriver = {
  name: 'Ahmed Hassan',
  phone: '+1-555-0456',
  rating: 4.8,
  vehicleType: 'bike' as const,
  licensePlate: 'BK-1234',
};

const OrderTrackingScreen: React.FC<{ route: any }> = ({ route }) => {
  const { orderId } = route.params;
  const navigation = useNavigation();
  // const dispatch = useDispatch<AppDispatch>();
  // const order = useSelector((state: RootState) => state.order.currentOrder);

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [driverRating, setDriverRating] = useState(5);
  const [foodRating, setFoodRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isReordering, setIsReordering] = useState(false);

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const statusAnimation = useRef(new Animated.Value(0)).current;

  const orderStatuses: OrderStatus[] = [
    {
      id: 'PENDING',
      name: currentOrder?.paymentMethod === 'CRYPTO' && currentOrder?.paymentStatus === 'PENDING' ? 'Waiting for Payment' : 'Order Placed',
      description: currentOrder?.paymentMethod === 'CRYPTO' && currentOrder?.paymentStatus === 'PENDING' ? 'Waiting for blockchain verification' : 'Your order is being reviewed',
      icon: 'time-outline',
      color: '#6c757d',
      completed: true
    },
    { id: 'CONFIRMED', name: 'Confirmed', description: 'Restaurant has accepted your order', icon: 'checkmark-circle', color: '#10b981', completed: true },
    { id: 'PREPARING', name: 'Preparing', description: 'Chef is preparing your meal', icon: 'restaurant', color: '#f59e0b', completed: false },
    { id: 'READY', name: 'Ready', description: 'Order is ready for pickup', icon: 'checkmark-done-circle', color: '#3b82f6', completed: false },
    { id: 'IN_DELIVERY', name: 'On the Way', description: 'Driver is delivering your order', icon: 'bicycle', color: '#8b5cf6', completed: false },
    { id: 'DELIVERED', name: 'Delivered', description: 'Enjoy your meal!', icon: 'home', color: '#10b981', completed: false },
  ];

  useEffect(() => {
    fetchOrder();

    const newSocket = io(SOCKET_URL);
    newSocket.on('connect', () => {
      newSocket.emit('join', `order_${orderId}`);
    });

    newSocket.on('order:updated', (updatedOrder: any) => {
      if (updatedOrder.id === orderId) {
        setCurrentOrder(updatedOrder);
        updateStatusIndex(updatedOrder.status);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      if (response.data.success) {
        const o = response.data.data.order;
        setCurrentOrder(o);
        updateStatusIndex(o.status);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatusIndex = (status: string) => {
    const idx = orderStatuses.findIndex(s => s.id === status);
    if (idx !== -1) {
      setCurrentStatusIndex(idx);

      Animated.timing(progressAnimation, {
        toValue: (idx + 1) / orderStatuses.length,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      Animated.sequence([
        Animated.timing(statusAnimation, { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.timing(statusAnimation, { toValue: 0, duration: 300, useNativeDriver: false }),
      ]).start();
    }
  };

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
    // dispatch(rateOrder({
    //   orderId,
    //   driverRating,
    //   foodRating,
    //   review: reviewText,
    // }));
    setShowRatingModal(false);
    Alert.alert('Thank you!', 'Your feedback helps us improve our service.');
  };

  const handleReorder = async () => {
    setIsReordering(true);
    try {
      // await dispatch(reorderItems(mockOrder.items));
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

  if (isLoading || !currentOrder) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f9f8f4', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0e372b" />
        <Text style={{ marginTop: 12, color: '#6b7280' }}>Fetching Order Status...</Text>
      </View>
    );
  }

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
          onPress={() => navigation.goBack()}
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
            {currentOrder.orderNumber}
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

          {currentOrder.items?.map((item: any) => (
            <View key={item.id} style={{
              flexDirection: 'row',
              marginBottom: 12,
              paddingBottom: 12,
              borderBottomWidth: 1,
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
                  {item.menuItem?.name || 'Item'}
                </Text>

                <Text style={{ fontSize: 14, color: '#6b7280' }}>
                  Qty: {item.quantity} • ${Number(item.totalPrice).toFixed(2)}
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
              <Text style={{ fontSize: 14, color: '#1f2937' }}>${Number(currentOrder.totalAmount).toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0e372b' }}>
                ${Number(currentOrder.totalAmount).toFixed(2)}
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
                {currentOrder.deliveryAddress}
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