'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { syncReducer, rootSyncSaga, setSyncStorage, SQLiteAdapter } from '@nilelink/sync-engine'; // Note: SQLiteAdapter is exported but we want Web
// We need to import WebSyncAdapter via relative path or alias
// Assuming web/shared is accessible. If not, we might need a local copy.
// Trying straightforward relative import from project root perspective
import { WebSyncAdapter } from '@shared/storage/WebSyncAdapter';

interface SyncProviderProps {
    children: React.ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
    const [store, setStore] = useState<any>(null);

    useEffect(() => {
        // Initialize Sync Engine
        const init = async () => {
            try {
                const adapter = new WebSyncAdapter();
                await adapter.initialize();
                setSyncStorage(adapter);

                const sagaMiddleware = createSagaMiddleware();

                const newStore = configureStore({
                    reducer: {
                        sync: syncReducer,
                    },
                    middleware: (getDefaultMiddleware) =>
                        getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(sagaMiddleware),
                });

                sagaMiddleware.run(rootSyncSaga);
                setStore(newStore);
            } catch (e) {
                console.error("Failed to init sync engine", e);
            }
        };

        init();
    }, []);

    if (!store) return <>{children}</>; // Or loading spinner

    return <Provider store={store}>{children}</Provider>;
};
