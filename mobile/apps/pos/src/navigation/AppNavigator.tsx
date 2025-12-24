import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import { LoginScreen } from '../screens/LoginScreen';
import { RestaurantSelectionScreen } from '../screens/RestaurantSelectionScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { NewOrderScreen } from '../screens/NewOrderScreen';
import { KitchenDisplayScreen } from '../screens/KitchenDisplayScreen';
import { InventoryScreen } from '../screens/InventoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ShiftManagementScreen } from '../screens/ShiftManagementScreen';

export type RootStackParamList = {
  Login: undefined;
  RestaurantSelection: undefined;
  MainTabs: undefined;
  Settings: undefined;
  ShiftManagement: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  NewOrder: undefined;
  Kitchen: undefined;
  Inventory: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'NewOrder':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Kitchen':
              iconName = focused ? 'fast-food' : 'fast-food-outline';
              break;
            case 'Inventory':
              iconName = focused ? 'cube' : 'cube-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0d6efd',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarBadge: undefined
        }}
      />
      <Tab.Screen
        name="NewOrder"
        component={NewOrderScreen}
        options={{
          tabBarLabel: 'New Order',
          tabBarBadge: undefined
        }}
      />
      <Tab.Screen
        name="Kitchen"
        component={KitchenDisplayScreen}
        options={{
          tabBarLabel: 'Kitchen',
          tabBarBadge: 3 // Show number of pending orders
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarBadge: undefined
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RestaurantSelection" component={RestaurantSelectionScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ShiftManagement" component={ShiftManagementScreen} options={{ headerShown: true, title: 'Shift Management' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}