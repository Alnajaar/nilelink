import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaView, StatusBar } from 'react-native';
import { configureStore } from './src/store/configureStore';
import { POSHomeScreen } from './src/screens/POSHomeScreen';

const store = configureStore();

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar />
        <POSHomeScreen />
      </SafeAreaView>
    </Provider>
  );
}
