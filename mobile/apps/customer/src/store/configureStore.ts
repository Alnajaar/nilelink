import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { customerReducer } from './customerSlice';
import restaurantsReducer from './restaurantsSlice';
import cartReducer from './cartSlice';
import checkoutReducer from './checkoutSlice';
import orderReducer from './orderSlice';
import authReducer from './authSlice';
import { rootSaga } from './rootSaga';

export function configureStore() {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: {
      customer: customerReducer,
      restaurants: restaurantsReducer,
      cart: cartReducer,
      checkout: checkoutReducer,
      order: orderReducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(sagaMiddleware),
  });

  sagaMiddleware.run(rootSaga);

  return store;
}

export type AppDispatch = ReturnType<typeof configureStore>['dispatch'];
export type RootState = ReturnType<ReturnType<typeof configureStore>['getState']>;