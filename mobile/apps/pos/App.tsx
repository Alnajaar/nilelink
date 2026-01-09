import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { LogBox } from 'react-native';
import { configureStore } from './src/store/configureStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initializeDatabase } from './src/services/database';
import { initializeSagaContext } from './src/store/rootSaga';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle:'
]);

const store = configureStore();

export default function App() {
  useEffect(() => {
    // App.tsx
    import { SQLiteAdapter, setSyncStorage } from '@nilelink/sync-engine';

    // ... imports

    // Initialize database and saga context on app start
    const initApp = async () => {
      try {
        const db = await initializeDatabase();

        // Initialize Sync Engine Storage Adapter
        const adapter = new SQLiteAdapter();
        adapter.setDatabase(db);
        setSyncStorage(adapter);

        initializeSagaContext(db);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initApp();
  }, []);

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
