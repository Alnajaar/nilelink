import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { configureStore } from './src/store/configureStore';
import { initializeDatabase } from './src/services/database';
import { initializeSagaContext } from './src/store/rootSaga';

// Import screens
import { CustomerHomeScreen } from './src/screens/CustomerHomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';
import { RestaurantListScreen } from './src/screens/RestaurantListScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderTrackingScreen from './src/screens/OrderTrackingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle:'
]);

const store = configureStore();

export type RootStackParamList = {
  Welcome: undefined;
  CustomerHome: undefined;
  Home: undefined;
  RestaurantList: undefined;
  RestaurantDetail: { restaurantId: string };
  Menu: { restaurantId: string };
  Checkout: undefined;
  OrderTracking: { orderId: string };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    // Initialize database and saga context on app start
    const initApp = async () => {
      try {
        const db = await initializeDatabase();
        initializeSagaContext(db);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initApp();
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="CustomerHome"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="RestaurantList" component={RestaurantListScreen} />
          <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}