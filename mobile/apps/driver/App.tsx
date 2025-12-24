import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { JobSelectionScreen } from './src/screens/JobSelectionScreen';
import { ActiveDeliveryScreen } from './src/screens/ActiveDeliveryScreen';
import { CashSummaryScreen } from './src/screens/CashSummaryScreen';

const Stack = createNativeStackNavigator();

// Simple store for v0.1 Driver App
const initialState = { orders: [], activeJob: null, cashInHand: 0 };
const driverReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case 'PICKUP_ORDER': return { ...state, activeJob: action.payload };
        case 'COMPLETE_DELIVERY': return { ...state, activeJob: null, cashInHand: state.cashInHand + action.payload.total };
        default: return state;
    }
};

const store = createStore(combineReducers({ driver: driverReducer }));

export default function App() {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="JobSelection" component={JobSelectionScreen} />
                    <Stack.Screen name="ActiveDelivery" component={ActiveDeliveryScreen} />
                    <Stack.Screen name="CashSummary" component={CashSummaryScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );
}
