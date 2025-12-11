import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type FiltersState = {
  dateRange: string
  category: string
  searchTerm: string
  date: string | null
  granularity: 'day' | 'week' | 'month'
  appliedDateRange: string
  appliedCategory: string
  appliedSearchTerm: string
  appliedDate: string | null
  appliedGranularity: 'day' | 'week' | 'month'
}

const initialState: FiltersState = {
  dateRange: '30',
  category: 'all',
  searchTerm: '',
  date: null,
  granularity: 'day',
  appliedDateRange: '30',
  appliedCategory: 'all',
  appliedSearchTerm: '',
  appliedDate: null,
  appliedGranularity: 'day',
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
    applyFilters(state) {
      state.appliedDateRange = state.dateRange
      state.appliedCategory = state.category
      state.appliedSearchTerm = state.searchTerm
      state.appliedDate = state.date
      state.appliedGranularity = state.granularity
    },
  },
})

export const { setDateRange, setCategory, setSearchTerm, setDate, setGranularity, resetFilters, applyFilters } = filtersSlice.actions
export default filtersSlice.reducer