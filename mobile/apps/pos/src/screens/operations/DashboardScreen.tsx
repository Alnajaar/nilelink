import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
    Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import Components
import KPICard from '../../components/KPICard';
import QuickActionButton from '../../components/QuickActionButton';
import AISuggestionCard from '../../components/AISuggestionCard';
import StaffStatusIndicator from '../../components/StaffStatusIndicator';
import WeatherWidget from '../../components/WeatherWidget';

// Import Hooks
import { useNavigationIntelligence } from '../../hooks/useNavigationIntelligence';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';

// Import Types
import { RootState, AppDispatch } from '../../store';
import { NavigationContext, RestaurantMode } from '../../types/navigation';

// Import Actions
import { refreshDashboardData, updateRestaurantMode } from '../../store/slices/dashboardSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigationState = useSelector((state: RootState) => state.navigation);
    const dashboardData = useSelector((state: RootState) => state.dashboard);
    const auth = useSelector((state: RootState) => state.auth);

    const { aiSuggestions, urgentAlerts, quickActions } = useNavigationIntelligence();
    const { connectionStatus } = useRealTimeUpdates();

    const [refreshing, setRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Auto-determine restaurant mode based on time and operations
    useEffect(() => {
        const hour = currentTime.getHours();
        const dayOfWeek = currentTime.getDay();

        let newMode: RestaurantMode = 'OPEN';

        if (hour < 6 || hour > 22) {
            newMode = 'CLOSED';
        } else if (hour >= 6 && hour < 10) {
            newMode = 'OPENING_PREP';
        } else if (hour >= 21 && hour <= 22) {
            newMode = 'CLOSING';
        }

        // Override based on business logic
        if (urgentAlerts.some(alert => alert.type === 'EMERGENCY')) {
            newMode = 'EMERGENCY';
        }

        dispatch(updateRestaurantMode(newMode));
    }, [currentTime, urgentAlerts, dispatch]);

    const onRefresh = async () => {
        setRefreshing(true);
        await dispatch(refreshDashboardData());
        setRefreshing(false);
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        const userName = auth.user?.firstName || 'Restaurant Owner';

        if (hour < 12) return `Good morning, ${userName}! ☀️`;
        if (hour < 17) return `Good afternoon, ${userName}! 🌤️`;
        return `Good evening, ${userName}! 🌙`;
    };

    const getContextualMessage = () => {
        switch (navigationState.restaurantMode) {
            case 'OPENING_PREP':
                return "Time to start your day! Complete your opening checklist.";
            case 'PEAK_OPERATIONS':
                return "Peak hours are here! Stay focused on customer service.";
            case 'CLOSING':
                return "Wrapping up for the day. Don't forget your closing procedures.";
            case 'EMERGENCY':
                return "Emergency mode activated. Check alerts immediately.";
            default:
                return "Monitor your operations and keep customers happy!";
        }
    };

    const getRestaurantModeColor = (mode: RestaurantMode) => {
        switch (mode) {
            case 'OPEN': return '#10b981';
            case 'OPENING_PREP': return '#f59e0b';
            case 'CLOSING': return '#8b5cf6';
            case 'CLOSED': return '#6b7280';
            case 'EMERGENCY': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#f9f8f4' }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Header Section */}
            <LinearGradient
                colors={['#0e372b', '#1a5240']}
                style={{
                    paddingTop: 60,
                    paddingBottom: 30,
                    paddingHorizontal: 20,
                }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text style={{ fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
                            {getGreeting()}
                        </Text>
                        <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)' }}>
                            {getContextualMessage()}
                        </Text>
                    </View>

                    {/* Connection Status */}
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
                            {connectionStatus === 'online' ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                </View>

                {/* Restaurant Mode Indicator */}
                <View style={{
                    marginTop: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: getRestaurantModeColor(navigationState.restaurantMode),
                        marginRight: 8,
                    }} />
                    <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
                        {navigationState.restaurantMode.replace('_', ' ').toUpperCase()} MODE
                    </Text>
                </View>
            </LinearGradient>

            {/* Urgent Alerts Section */}
            {urgentAlerts.length > 0 && (
                <View style={{ padding: 20, paddingTop: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' }}>
                        ⚠️ Urgent Alerts
                    </Text>
                    {urgentAlerts.map((alert) => (
                        <TouchableOpacity
                            key={alert.id}
                            style={{
                                backgroundColor: '#fef2f2',
                                borderLeftWidth: 4,
                                borderLeftColor: '#ef4444',
                                padding: 16,
                                marginBottom: 12,
                                borderRadius: 8,
                            }}
                            onPress={() => {
                                // Navigate to relevant screen
                                Alert.alert('Alert', alert.message);
                            }}
                        >
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#dc2626', marginBottom: 4 }}>
                                {alert.title}
                            </Text>
                            <Text style={{ fontSize: 14, color: '#7f1d1d' }}>
                                {alert.message}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* AI Suggestions Section */}
            {aiSuggestions.length > 0 && (
                <View style={{ padding: 20, paddingTop: 0 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' }}>
                        💡 AI Suggestions
                    </Text>
                    {aiSuggestions.slice(0, 3).map((suggestion) => (
                        <AISuggestionCard key={suggestion.id} suggestion={suggestion} />
                    ))}
                </View>
            )}

            {/* KPI Cards Section */}
            <View style={{ padding: 20, paddingTop: 0 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' }}>
                    📊 Today's Performance
                </Text>
                <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                }}>
                    <KPICard
                        title="Today's Revenue"
                        value={`$${dashboardData.todayRevenue?.toLocaleString() || '0'}`}
                        change={dashboardData.revenueChange || 0}
                        icon="cash"
                        color="#10b981"
                    />
                    <KPICard
                        title="Active Orders"
                        value={dashboardData.activeOrders?.toString() || '0'}
                        change={0}
                        icon="restaurant"
                        color="#3b82f6"
                    />
                    <KPICard
                        title="Avg. Order Time"
                        value={`${dashboardData.avgOrderTime || 0}min`}
                        change={dashboardData.orderTimeChange || 0}
                        icon="time"
                        color="#f59e0b"
                    />
                    <KPICard
                        title="Customer Rating"
                        value={`${dashboardData.customerRating || 0}/5`}
                        change={dashboardData.ratingChange || 0}
                        icon="star"
                        color="#8b5cf6"
                    />
                </View>
            </View>

            {/* Quick Actions Section */}
            <View style={{ padding: 20, paddingTop: 0 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' }}>
                    ⚡ Quick Actions
                </Text>
                <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                }}>
                    {quickActions.slice(0, 6).map((action) => (
                        <QuickActionButton key={action.id} action={action} />
                    ))}
                </View>
            </View>

            {/* Staff Status Section */}
            <View style={{ padding: 20, paddingTop: 0 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' }}>
                    👥 Team Status
                </Text>
                <StaffStatusIndicator />
            </View>

            {/* Weather Widget (for outdoor operations) */}
            <View style={{ padding: 20, paddingTop: 0 }}>
                <WeatherWidget />
            </View>

            {/* Footer */}
            <View style={{
                padding: 20,
                alignItems: 'center',
                backgroundColor: 'white',
                marginTop: 20,
            }}>
                <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                    Last updated: {currentTime.toLocaleTimeString()}
                    {'\n'}
                    NileLink POS - Revolutionizing Restaurant Management
                </Text>
            </View>
        </ScrollView>
    );
};

export default DashboardScreen;