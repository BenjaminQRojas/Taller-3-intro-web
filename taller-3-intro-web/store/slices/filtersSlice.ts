import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type FiltersState = {
  dateRange: string
  category: string
  searchTerm: string
  date: string | null
  granularity: 'day' | 'week' | 'month'
}

const initialState: FiltersState = {
  dateRange: '30',
  category: 'all',
  searchTerm: '',
  date: null,
  granularity: 'day',
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setDateRange(state, action: PayloadAction<string>) {
      state.dateRange = action.payload
    },
    setCategory(state, action: PayloadAction<string>) {
      state.category = action.payload
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload
    },
    setDate(state, action: PayloadAction<string | null>) {
      state.date = action.payload
    },
    setGranularity(state, action: PayloadAction<'day' | 'week' | 'month'>) {
      state.granularity = action.payload
    },
    resetFilters() {
      return initialState
    },
  },
})

export const { setDateRange, setCategory, setSearchTerm, setDate, setGranularity, resetFilters } = filtersSlice.actions
export default filtersSlice.reducer