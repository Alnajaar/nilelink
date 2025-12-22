import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { posReducer } from './posSlice';
import { rootSaga } from './sagas';

export function configureStore() {
  const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    combineReducers({ pos: posReducer }),
    applyMiddleware(sagaMiddleware)
  );

  sagaMiddleware.run(rootSaga);

  return store;
}
