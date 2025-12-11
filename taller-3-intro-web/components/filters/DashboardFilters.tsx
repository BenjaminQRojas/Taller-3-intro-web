"use client";
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import {
  setDateRange as setDateRangeAction,
  setCategory as setCategoryAction,
  setSearchTerm as setSearchTermAction,
  setDate as setDateAction,
  resetFilters,
} from '@/store/slices/filtersSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, CalendarDays } from 'lucide-react';

interface DashboardFiltersProps {
  categoriesList: string[];
  onApplyFilters: (filters: {
    dateRange: string;
    category: string;
    searchTerm: string;
    date: string | undefined;
  }) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ categoriesList, onApplyFilters }) => {
  const dispatch = useDispatch();
  const { dateRange, category, searchTerm, date } = useSelector((state: RootState) => state.filters);
  const [localDate, setLocalDate] = useState<Date | undefined>(date ? new Date(date) : new Date());

  const handleApplyFilters = () => {
    const exact = localDate ? new Date(localDate) : undefined;
    const exactStr = exact
      ? new Date(exact.getTime() - exact.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
      : undefined;
    
    dispatch(setDateAction(exactStr ?? null));
    
    onApplyFilters({
      dateRange,
      category,
      searchTerm,
      date: exactStr,
    });
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    const now = new Date();
    setLocalDate(now);
    
    const exactStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    
    onApplyFilters({
      dateRange: '30',
      category: 'all',
      searchTerm: '',
      date: undefined,
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date-range">Rango de Fechas</Label>
            <Select value={dateRange} onValueChange={(v) => dispatch(setDateRangeAction(v))}>
              <SelectTrigger id="date-range">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
                <SelectItem value="90">Últimos 90 días</SelectItem>
                <SelectItem value="365">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={category} onValueChange={(v) => dispatch(setCategoryAction(v))}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                {categoriesList.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === 'all' ? 'Todas' : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fecha Específica</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {localDate ? localDate.toLocaleDateString('es-CL') : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={localDate}
                  onSelect={(d) => setLocalDate(d ?? undefined)}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTermAction(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="default" size="sm" onClick={handleApplyFilters}>
            Aplicar Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardFilters;