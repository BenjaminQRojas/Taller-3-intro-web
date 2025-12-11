import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './slices/filtersSlice';

const APPLIED_KEY = 'filtersAppliedV1';

function loadAppliedFromSession() {
  try {
    if (typeof window === 'undefined') return undefined;
    const raw = window.sessionStorage.getItem(APPLIED_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const {
      appliedDateRange,
      appliedCategory,
      appliedSearchTerm,
      appliedDate,
      appliedGranularity,
    } = parsed || {};
    return {
      appliedDateRange: typeof appliedDateRange === 'string' ? appliedDateRange : '30',
      appliedCategory: typeof appliedCategory === 'string' ? appliedCategory : 'all',
      appliedSearchTerm: typeof appliedSearchTerm === 'string' ? appliedSearchTerm : '',
      appliedDate: appliedDate ?? null,
      appliedGranularity: ['day', 'week', 'month'].includes(appliedGranularity) ? appliedGranularity : 'day',
    } as {
      appliedDateRange: string;
      appliedCategory: string;
      appliedSearchTerm: string;
      appliedDate: string | null;
      appliedGranularity: 'day' | 'week' | 'month';
    };
  } catch {
    return undefined;
  }
}

const applied = loadAppliedFromSession();

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
  },
  preloadedState: applied
    ? {
        filters: {
          // current filter fields mirror applied on hydration
          dateRange: applied.appliedDateRange,
          category: applied.appliedCategory,
          searchTerm: applied.appliedSearchTerm,
          date: applied.appliedDate,
          granularity: applied.appliedGranularity,
          // applied snapshot
          appliedDateRange: applied.appliedDateRange,
          appliedCategory: applied.appliedCategory,
          appliedSearchTerm: applied.appliedSearchTerm,
          appliedDate: applied.appliedDate,
          appliedGranularity: applied.appliedGranularity,
        },
      }
    : undefined,
});

if (typeof window !== 'undefined') {
  store.subscribe(() => {
    try {
      const s = store.getState();
      const payload = {
        appliedDateRange: s.filters.appliedDateRange,
        appliedCategory: s.filters.appliedCategory,
        appliedSearchTerm: s.filters.appliedSearchTerm,
        appliedDate: s.filters.appliedDate,
        appliedGranularity: s.filters.appliedGranularity,
      };
      window.sessionStorage.setItem(APPLIED_KEY, JSON.stringify(payload));
    } catch {}
  });
}

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

