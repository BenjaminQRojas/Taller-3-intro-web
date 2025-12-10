import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
  category: string | null;
  dateFrom: string | null;  // e.g., '2025-01-01'
  dateTo: string | null;    // e.g., '2025-12-31'
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'area';  // Tipos de gráficos
  page: number;
  limit: number;
}

const initialState: FiltersState = {
  category: null,
  dateFrom: null,
  dateTo: null,
  chartType: 'bar',  // Default
  page: 1,
  limit: 20,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setCategory: (state, action: PayloadAction<string | null>) => {
      state.category = action.payload;
      state.page = 1;
    },
    setDateRange: (state, action: PayloadAction<{ from: string | null; to: string | null }>) => {
      state.dateFrom = action.payload.from;
      state.dateTo = action.payload.to;
      state.page = 1;
    },
    setChartType: (state, action: PayloadAction<FiltersState['chartType']>) => {
      state.chartType = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    resetFilters: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { setCategory, setDateRange, setChartType, setPage, setLimit, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;