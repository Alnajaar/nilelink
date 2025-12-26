import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Alert,
    Vibration,
    Animated,
    Easing,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

// Import Types
import { RootState, AppDispatch } from '../../store';
import { NavigationContext } from '../../types/navigation';

// Import Hooks
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';

// Import Actions
import {
    loadOrders,
    updateOrderStatus,
    assignOrderToStaff,
    prioritizeOrder,
    addOrderNote,
    requestPayment,
} from '../../store/slices/ordersSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone?: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    orderType: OrderType;
    tableNumber?: number;
    estimatedPrepTime: number;
    priority: OrderPriority;
    createdAt: Date;
    lastUpdated: Date;
    assignedStaff?: string;
    notes?: string;
    specialInstructions?: string;
}

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    customizations?: string[];
    prepStatus: PrepStatus;
    estimatedTime: number;
}

type OrderStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'PREPARING'
    | 'READY'
    | 'SERVED'
    | 'COMPLETED'
    | 'CANCELLED';

type OrderType = 'DINE_IN' | 'TAKEOUT' | 'DELIVERY' | 'CURBSIDE';

type OrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

type PrepStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED';

const OrderManagementScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const orders = useSelector((state: RootState) => state.orders);
    const navigationState = useSelector((state: RootState) => state.navigation);
    const { connectionStatus } = useRealTimeUpdates();

    // Voice commands setup
    useVoiceCommands();

    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PENDING');
    const [selectedOrderType, setSelectedOrderType] = useState<OrderType | 'ALL'>('ALL');
    const [showOrderDetails, setShowOrderDetails] = useState<string | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(screenWidth)).current;

    // Mock orders data (in real app, this comes from Redux)
    const mockOrders: Order[] = [
        {
            id: 'ord_001',
            orderNumber: '#1001',
            customerName: 'John Smith',
            customerPhone: '+1234567890',
            items: [
                {
                    id: 'item_001',
                    name: 'Grilled Salmon',
                    quantity: 1,
                    price: 28.99,
                    customizations: ['Extra lemon', 'No butter'],
                    prepStatus: 'PREPARING',
                    estimatedTime: 15,
                },
                {
                    id: 'item_002',
                    name: 'Caesar Salad',
                    quantity: 1,
                    price: 12.99,
                    prepStatus: 'READY',
                    estimatedTime: 5,
                },
            ],
            totalAmount: 41.98,
            status: 'PREPARING',
            orderType: 'DINE_IN',
            tableNumber: 5,
            estimatedPrepTime: 15,
            priority: 'NORMAL',
            createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            lastUpdated: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
            assignedStaff: 'Chef Maria',
            specialInstructions: 'Allergic to nuts',
        },
        {
            id: 'ord_002',
            orderNumber: '#1002',
            customerName: 'Sarah Johnson',
            items: [
                {
                    id: 'item_003',
                    name: 'Pepperoni Pizza Large',
                    quantity: 1,
                    price: 24.99,
                    customizations: ['Extra cheese', 'Light sauce'],
                    prepStatus: 'PENDING',
                    estimatedTime: 20,
                },
            ],
            totalAmount: 24.99,
            status: 'PENDING',
            orderType: 'DELIVERY',
            estimatedPrepTime: 20,
            priority: 'HIGH',
            createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
            lastUpdated: new Date(Date.now() - 2 * 60 * 1000),
            specialInstructions: 'Apartment 4B, ring doorbell twice',
        },
    ];

    // Filter orders based on selected criteria
    const filteredOrders = mockOrders.filter(order => {
        const statusMatch = selectedStatus === 'ALL' || order.status === selectedStatus;
        const typeMatch = selectedOrderType === 'ALL' || order.orderType === selectedOrderType;
        return statusMatch && typeMatch;
    });

    // Sort by priority and creation time
    const sortedOrders = filteredOrders.sort((a, b) => {
        const priorityOrder = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];

        if (aPriority !== bPriority) return bPriority - aPriority;
        return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // AI-powered order prioritization
    const prioritizedOrders = sortedOrders.map(order => ({
        ...order,
        aiRecommendations: getAIRecommendations(order),
    }));

    // Real-time updates simulation
    useEffect(() => {
        dispatch(loadOrders());

        // Simulate real-time order updates
        const interval = setInterval(() => {
            // In real app, this would be WebSocket updates
            console.log('Checking for order updates...');
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [dispatch]);

    // New order notification
    useEffect(() => {
        const newOrders = sortedOrders.filter(order =>
            order.createdAt.getTime() > Date.now() - 60000 // Last minute
        );

        if (newOrders.length > 0 && soundEnabled) {
            // Play notification sound
            playNotificationSound();

            // Vibrate for urgent orders
            if (newOrders.some(order => order.priority === 'URGENT')) {
                Vibration.vibrate([0, 500, 200, 500]);
            }
        }
    }, [sortedOrders, soundEnabled]);

    const playNotificationSound = async () => {
        try {
            const { sound } = await Audio.Sound.createAsync(
                require('../../../assets/sounds/new_order.mp3')
            );
            await sound.playAsync();
        } catch (error) {
            // Fallback to system sound
        }
    };

    const getAIRecommendations = (order: Order) => {
        const recommendations = [];

        // Prep time optimization
        if (order.estimatedPrepTime > 20) {
            recommendations.push({
                type: 'PREP_OPTIMIZATION',
                message: 'Consider splitting prep across multiple stations',
                impact: 'Save 5-7 minutes',
            });
        }

        // Customer insights
        if (order.customerName === 'John Smith') {
            recommendations.push({
                type: 'CUSTOMER_INSIGHT',
                message: 'Regular customer - often adds dessert',
                impact: 'Upsell opportunity',
            });
        }

        // Inventory alerts
        if (order.items.some(item => item.name.includes('Salmon'))) {
            recommendations.push({
                type: 'INVENTORY_ALERT',
                message: 'Salmon stock running low',
                impact: 'Order more tonight',
            });
        }

        return recommendations;
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return '#f59e0b';
            case 'CONFIRMED': return '#3b82f6';
            case 'PREPARING': return '#f59e0b';
            case 'READY': return '#10b981';
            case 'SERVED': return '#8b5cf6';
            case 'COMPLETED': return '#6b7280';
            case 'CANCELLED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getPriorityIcon = (priority: OrderPriority) => {
        switch (priority) {
            case 'URGENT': return '🚨';
            case 'HIGH': return '🔴';
            case 'NORMAL': return '🟡';
            case 'LOW': return '🟢';
            default: return '🟡';
        }
    };

    const getOrderTypeIcon = (type: OrderType) => {
        switch (type) {
            case 'DINE_IN': return '🍽️';
            case 'TAKEOUT': return '🥡';
            case 'DELIVERY': return '🚚';
            case 'CURBSIDE': return '🚗';
            default: return '🍽️';
        }
    };

    const handleOrderAction = (orderId: string, action: string) => {
        const order = mockOrders.find(o => o.id === orderId);
        if (!order) return;

        // Voice feedback
        const voiceMessage = getVoiceFeedback(action, order);

        Alert.alert(
            'Order Action',
            `Confirm ${action} for order ${order.orderNumber}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        dispatch(updateOrderStatus({ orderId, status: action as OrderStatus }));
                        Alert.alert('Voice', voiceMessage);
                    },
                },
            ]
        );
    };

    const getVoiceFeedback = (action: string, order: Order) => {
        switch (action) {
            case 'CONFIRMED':
                return `Order ${order.orderNumber} confirmed. Starting preparation.`;
            case 'READY':
                return `Order ${order.orderNumber} is ready for ${order.orderType.toLowerCase()}.`;
            case 'COMPLETED':
                return `Order ${order.orderNumber} completed. Great job team!`;
            default:
                return `Order ${order.orderNumber} status updated to ${action}.`;
        }
    };

    const renderOrderCard = ({ item: order }: { item: Order }) => (
        <Animated.View
            style={{
                marginHorizontal: 16,
                marginVertical: 8,
                backgroundColor: 'white',
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            }}
        >
            {/* Order Header */}
            <TouchableOpacity
                style={{
                    padding: 16,
                    borderBottomWidth: order.showDetails ? 1 : 0,
                    borderBottomColor: '#e5e7eb',
                }}
                onPress={() => setShowOrderDetails(
                    showOrderDetails === order.id ? null : order.id
                )}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
                            {order.orderNumber}
                        </Text>
                        <Text style={{
                            marginLeft: 8,
                            fontSize: 14,
                            color: getStatusColor(order.status),
                            fontWeight: '600',
                            textTransform: 'uppercase',
                        }}>
                            {order.status}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0e372b' }}>
                            ${order.totalAmount.toFixed(2)}
                        </Text>
                        <Ionicons
                            name={showOrderDetails === order.id ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color="#6b7280"
                            style={{ marginLeft: 8 }}
                        />
                    </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Text style={{ fontSize: 16, color: '#1f2937', flex: 1 }}>
                        {order.customerName}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                        <Text style={{ fontSize: 14, color: '#6b7280', marginRight: 4 }}>
                            {getOrderTypeIcon(order.orderType)}
                        </Text>
                        {order.tableNumber && (
                            <Text style={{ fontSize: 14, color: '#6b7280' }}>
                                Table {order.tableNumber}
                            </Text>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                        <Text style={{ fontSize: 14, color: '#6b7280', marginRight: 4 }}>
                            {getPriorityIcon(order.priority)}
                        </Text>
                        <Text style={{ fontSize: 14, color: '#6b7280' }}>
                            {order.estimatedPrepTime}min
                        </Text>
                    </View>
                </View>

                {/* AI Recommendations */}
                {order.aiRecommendations && order.aiRecommendations.length > 0 && (
                    <View style={{
                        marginTop: 8,
                        padding: 8,
                        backgroundColor: '#f0f9f4',
                        borderRadius: 6,
                        borderLeftWidth: 3,
                        borderLeftColor: '#10b981',
                    }}>
                        <Text style={{ fontSize: 12, color: '#065f46', fontWeight: '600' }}>
                            💡 {order.aiRecommendations[0].message}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Order Details */}
            {showOrderDetails === order.id && (
                <View style={{ padding: 16 }}>
                    {/* Order Items */}
                    {order.items.map((item) => (
                        <View key={item.id} style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingVertical: 8,
                            borderBottomWidth: 1,
                            borderBottomColor: '#f3f4f6',
                        }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, color: '#1f2937', fontWeight: '500' }}>
                                    {item.quantity}x {item.name}
                                </Text>
                                {item.customizations && item.customizations.length > 0 && (
                                    <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                                        {item.customizations.join(', ')}
                                    </Text>
                                )}
                            </View>

                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ fontSize: 14, color: '#1f2937', fontWeight: '500' }}>
                                    ${item.price.toFixed(2)}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    color: getStatusColor(item.prepStatus as OrderStatus),
                                    fontWeight: '500',
                                    marginTop: 2,
                                }}>
                                    {item.prepStatus}
                                </Text>
                            </View>
                        </View>
                    ))}

                    {/* Special Instructions */}
                    {order.specialInstructions && (
                        <View style={{
                            marginTop: 12,
                            padding: 12,
                            backgroundColor: '#fef3c7',
                            borderRadius: 8,
                            borderLeftWidth: 3,
                            borderLeftColor: '#f59e0b',
                        }}>
                            <Text style={{ fontSize: 14, color: '#92400e', fontWeight: '600' }}>
                                Special Instructions:
                            </Text>
                            <Text style={{ fontSize: 14, color: '#92400e', marginTop: 4 }}>
                                {order.specialInstructions}
                            </Text>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 16,
                    }}>
                        {getNextActions(order).map((action) => (
                            <TouchableOpacity
                                key={action.id}
                                style={{
                                    flex: 1,
                                    backgroundColor: action.color,
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 8,
                                    marginHorizontal: 4,
                                    alignItems: 'center',
                                }}
                                onPress={() => handleOrderAction(order.id, action.id)}
                            >
                                <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                                    {action.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </Animated.View>
    );

    const getNextActions = (order: Order) => {
        switch (order.status) {
            case 'PENDING':
                return [
                    { id: 'CONFIRMED', label: 'Confirm', color: '#10b981' },
                    { id: 'CANCELLED', label: 'Cancel', color: '#ef4444' },
                ];
            case 'CONFIRMED':
                return [
                    { id: 'PREPARING', label: 'Start Prep', color: '#3b82f6' },
                ];
            case 'PREPARING':
                return [
                    { id: 'READY', label: 'Mark Ready', color: '#10b981' },
                ];
            case 'READY':
                return [
                    { id: 'SERVED', label: 'Mark Served', color: '#8b5cf6' },
                ];
            case 'SERVED':
                return [
                    { id: 'COMPLETED', label: 'Complete', color: '#6b7280' },
                ];
            default:
                return [];
        }
    };

    const statusFilters: { key: OrderStatus | 'ALL'; label: string; count: number }[] = [
        { key: 'ALL', label: 'All', count: mockOrders.length },
        { key: 'PENDING', label: 'Pending', count: mockOrders.filter(o => o.status === 'PENDING').length },
        { key: 'PREPARING', label: 'Preparing', count: mockOrders.filter(o => o.status === 'PREPARING').length },
        { key: 'READY', label: 'Ready', count: mockOrders.filter(o => o.status === 'READY').length },
    ];

    const typeFilters: { key: OrderType | 'ALL'; label: string }[] = [
        { key: 'ALL', label: 'All Types' },
        { key: 'DINE_IN', label: 'Dine-In' },
        { key: 'TAKEOUT', label: 'Takeout' },
        { key: 'DELIVERY', label: 'Delivery' },
        { key: 'CURBSIDE', label: 'Curbside' },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#f9f8f4' }}>
            {/* Header */}
            <View style={{
                backgroundColor: '#0e372b',
                paddingTop: 50,
                paddingBottom: 20,
                paddingHorizontal: 20,
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
                        Order Management
                    </Text>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: connectionStatus === 'online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                    }}>
                        <Ionicons
                            name={connectionStatus === 'online' ? 'wifi' : 'cloud-offline'}
                            size={16}
                            color={connectionStatus === 'online' ? '#10b981' : '#ef4444'}
                        />
                        <Text style={{
                            marginLeft: 6,
                            fontSize: 12,
                            color: connectionStatus === 'online' ? '#10b981' : '#ef4444',
                            fontWeight: '600'
                        }}>
                            {connectionStatus === 'online' ? 'Live' : 'Offline'}
                        </Text>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 16,
                }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
                            {prioritizedOrders.length}
                        </Text>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                            Active Orders
                        </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
                            {Math.round(prioritizedOrders.reduce((sum, order) => sum + order.estimatedPrepTime, 0) / prioritizedOrders.length) || 0}
                        </Text>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                            Avg Prep (min)
                        </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>
                            ${prioritizedOrders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(0)}
                        </Text>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                            Revenue Today
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ maxHeight: 60, backgroundColor: 'white' }}
                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
            >
                {/* Status Filters */}
                {statusFilters.map((filter) => (
                    <TouchableOpacity
                        key={filter.key}
                        style={{
                            marginRight: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            backgroundColor: selectedStatus === filter.key ? '#0e372b' : '#f3f4f6',
                            borderWidth: 1,
                            borderColor: selectedStatus === filter.key ? '#0e372b' : '#e5e7eb',
                        }}
                        onPress={() => setSelectedStatus(filter.key as OrderStatus)}
                    >
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: selectedStatus === filter.key ? 'white' : '#374151',
                        }}>
                            {filter.label} ({filter.count})
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Order Type Filters */}
            <View style={{
                flexDirection: 'row',
                backgroundColor: 'white',
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e7eb',
            }}>
                {typeFilters.map((filter) => (
                    <TouchableOpacity
                        key={filter.key}
                        style={{
                            marginRight: 16,
                            paddingVertical: 6,
                            borderBottomWidth: selectedOrderType === filter.key ? 2 : 0,
                            borderBottomColor: '#0e372b',
                        }}
                        onPress={() => setSelectedOrderType(filter.key)}
                    >
                        <Text style={{
                            fontSize: 14,
                            fontWeight: selectedOrderType === filter.key ? '600' : '500',
                            color: selectedOrderType === filter.key ? '#0e372b' : '#6b7280',
                        }}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Orders List */}
            <FlatList
                data={prioritizedOrders}
                renderItem={renderOrderCard}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 60,
                    }}>
                        <MaterialCommunityIcons name="clipboard-check" size={48} color="#d1d5db" />
                        <Text style={{ fontSize: 18, color: '#6b7280', marginTop: 12 }}>
                            No orders match your filters
                        </Text>
                        <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
                            Try adjusting your filters or check back later
                        </Text>
                    </View>
                }
            />

            {/* Voice Command Indicator */}
            <View style={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                right: 20,
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <MaterialCommunityIcons name="microphone" size={20} color="#6b7280" />
                <Text style={{ marginLeft: 8, fontSize: 14, color: '#6b7280', flex: 1 }}>
                    Say "New order for table 5" or "Show pending orders"
                </Text>
                <TouchableOpacity onPress={() => setSoundEnabled(!soundEnabled)}>
                    <Ionicons
                        name={soundEnabled ? 'volume-high' : 'volume-mute'}
                        size={20}
                        color={soundEnabled ? '#0e372b' : '#6b7280'}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default OrderManagementScreen;