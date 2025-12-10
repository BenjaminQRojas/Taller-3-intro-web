// src/store/store.ts  (o app/store/store.ts)
import { configureStore } from '@reduxjs/toolkit';

// Reducer dummy para que no dé error mientras tu compañero hace el real
const dummyReducer = (state = {}) => state;

export const store = configureStore({
  reducer: {
    dummy: dummyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;