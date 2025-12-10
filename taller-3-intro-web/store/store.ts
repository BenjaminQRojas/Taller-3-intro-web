import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import filtersReducer from './slices/filtersSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['filters'],
};

const rootReducer = {
  filters: filtersReducer,
};

const persistedReducer = persistReducer(persistConfig, (state: any, action: any) => {
  return {
    filters: filtersReducer(state?.filters, action),
  };
});

export const makeStore = () => {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const makePersistor = (store: AppStore) => persistStore(store);