"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, CalendarDays } from 'lucide-react';

type Props = {
  dateRange: string;
  category: string;
  searchTerm: string;
  localDate: Date | undefined;
  categoriesList: string[];
  onApply: () => void;
  onClear: () => void;
  onDateRangeChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  setLocalDate: (d: Date | undefined) => void;
};

export default function DashboardFilters({
  dateRange,
  category,
  searchTerm,
  localDate,
  categoriesList,
  onApply,
  onClear,
  onDateRangeChange,
  onCategoryChange,
  onSearchChange,
  setLocalDate,
}: Props) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date-range">Rango de Fechas</Label>
            <Select value={dateRange} onValueChange={onDateRangeChange}>
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
            <Select value={category} onValueChange={onCategoryChange}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                {categoriesList.map((c) => (
                  <SelectItem key={c} value={c}>{c === 'all' ? 'Todas' : c}</SelectItem>
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
                <Calendar mode="single" selected={localDate} onSelect={(d) => setLocalDate(d ?? undefined)} autoFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="search">Buscar</Label>
            <Input id="search" type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="default" size="lg" onClick={onApply}>Aplicar Filtros</Button>
          <Button variant="outline" size="lg" onClick={onClear}>Limpiar</Button>
        </div>
      </CardContent>
    </Card>
  );
}
