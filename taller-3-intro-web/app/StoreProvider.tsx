'use client';

import React, { useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { makeStore, makePersistor, AppStore } from '@/store/store';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  const persistorRef = useRef<ReturnType<typeof makePersistor> | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    persistorRef.current = makePersistor(storeRef.current);
  }

  return (
    <ReduxProvider store={storeRef.current!}>
      <PersistGate loading={null} persistor={persistorRef.current!}>
        {children}
      </PersistGate>
    </ReduxProvider>
  );
}