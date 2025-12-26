import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OpeningChecklistScreen from '../screens/operations/OpeningChecklistScreen';
import DashboardScreen from '../screens/operations/DashboardScreen';
import OrderManagementScreen from '../screens/operations/OrderManagementScreen';
import TableManagementScreen from '../screens/operations/TableManagementScreen';
import PaymentProcessingScreen from '../screens/operations/PaymentProcessingScreen';
import EndOfDayReportScreen from '../screens/management/EndOfDayReportScreen';
import StaffManagementScreen from '../screens/management/StaffManagementScreen';
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Import Types
import { RootState, AppDispatch } from '../store';
import { NavigationState, NavigationContext, RestaurantMode } from '../types/navigation';

// Import Hooks
import { useNavigationIntelligence } from '../hooks/useNavigationIntelligence';
import { useVoiceCommands } from '../hooks/useVoiceCommands';

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Tables: undefined;
  Payments: undefined;
  Management: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ============================================================================
// AI-POWERED TAB BAR COMPONENT
// Context-aware navigation with predictive suggestions
// ============================================================================

interface IntelligentTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const IntelligentTabBar: React.FC<IntelligentTabBarProps> = ({
  state,
  descriptors,
  navigation
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigationState = useSelector((state: RootState) => state.navigation);
  const { aiSuggestions, urgentAlerts } = useNavigationIntelligence();

  const [animationValue] = useState(new Animated.Value(0));

  // Animate tab bar based on context
  useEffect(() => {
    Animated.spring(animationValue, {
      toValue: navigationState.navigationContext === 'PEAK_OPERATIONS' ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [navigationState.navigationContext]);

  const getTabIcon = (routeName: string, focused: boolean) => {
    const iconSize = focused ? 28 : 24;
    const iconColor = focused ? '#0e372b' : '#6b7280';

    switch (routeName) {
      case 'Dashboard':
        return <Ionicons name={focused ? 'home' : 'home-outline'} size={iconSize} color={iconColor} />;
      case 'Orders':
        return <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={iconSize} color={iconColor} />;
      case 'Tables':
        return <Ionicons name={focused ? 'grid' : 'grid-outline'} size={iconSize} color={iconColor} />;
      case 'Payments':
        return <Ionicons name={focused ? 'card' : 'card-outline'} size={iconSize} color={iconColor} />;
      case 'Management':
        return <Ionicons name={focused ? 'people' : 'people-outline'} size={iconSize} color={iconColor} />;
      case 'Analytics':
        return <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={iconSize} color={iconColor} />;
      case 'Settings':
        return <Ionicons name={focused ? 'settings' : 'settings-outline'} size={iconSize} color={iconColor} />;
      default:
        return <Ionicons name="help-circle" size={iconSize} color={iconColor} />;
    }
  };

  return (
    <View style={{
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      paddingBottom: 20,
      paddingTop: 10,
    }}>
      {/* Urgent Alerts Banner */}
      {urgentAlerts.length > 0 && (
        <View style={{
          backgroundColor: '#ef4444',
          padding: 8,
          marginHorizontal: 16,
          marginBottom: 8,
          borderRadius: 8,
        }}>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
            ⚠️ {urgentAlerts[0].title}
          </Text>
        </View>
      )}

      {/* AI Suggestions Banner */}
      {aiSuggestions.length > 0 && (
        <TouchableOpacity
          style={{
            backgroundColor: '#0e372b',
            padding: 8,
            marginHorizontal: 16,
            marginBottom: 8,
            borderRadius: 8,
          }}
          onPress={() => {
            // Navigate to suggested screen
            const suggestion = aiSuggestions[0];
            if (suggestion.action) {
              navigation.navigate(suggestion.action.screenId as any, suggestion.action.params);
            }
          }}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
            💡 {aiSuggestions[0].title}
          </Text>
        </TouchableOpacity>
      )}

      {/* Main Tab Bar */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{
                alignItems: 'center',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: isFocused ? '#f0f9f4' : 'transparent',
              }}
            >
              {getTabIcon(route.name, isFocused)}
              <Text style={{
                fontSize: 12,
                fontWeight: isFocused ? '600' : '500',
                color: isFocused ? '#0e372b' : '#6b7280',
                marginTop: 4,
              }}>
                {label}
              </Text>

              {/* Unread indicator for notifications */}
              {route.name === 'Orders' && navigationState.urgentAlerts.some((alert: any) => alert.type === 'ORDER') && (
                <View style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#ef4444',
                }} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ============================================================================
// MAIN TAB NAVIGATOR
// Context-aware tab navigation with AI enhancements
// ============================================================================

const MainTabNavigator = () => {
  const navigationState = useSelector((state: RootState) => state.navigation);
  const dispatch = useDispatch<AppDispatch>();

  // Initialize voice commands
  useVoiceCommands();

  return (
    <Tab.Navigator
      tabBar={(props) => <IntelligentTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar, use our custom one
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrderManagementScreen}
        options={{
          tabBarLabel: navigationState.restaurantMode === 'PEAK_OPERATIONS' ? 'Orders 🔥' : 'Orders',
        }}
      />
      <Tab.Screen
        name="Tables"
        component={TableManagementScreen}
        options={{
          tabBarLabel: 'Tables',
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentProcessingScreen}
        options={{
          tabBarLabel: 'Payments',
        }}
      />
      <Tab.Screen
        name="Management"
        component={StaffManagementScreen}
        options={{
          tabBarLabel: 'Manage',
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// ============================================================================
// ROOT APP NAVIGATOR
// Handles authentication and main app navigation
// ============================================================================

const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f8f4',
      }}>
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#0e372b',
          marginBottom: 20,
        }}>
          NileLink POS
        </Text>
        <Text style={{ fontSize: 16, color: '#6b7280' }}>
          Loading your restaurant...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : (
          <>
            {/* Opening Checklist - shown only during opening prep */}
            <Stack.Screen
              name="OpeningChecklist"
              component={OpeningChecklistScreen}
              options={{
                gestureEnabled: false,
              }}
            />
            <Stack.Screen name="Main" component={MainTabNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;