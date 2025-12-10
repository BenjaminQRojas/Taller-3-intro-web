"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { setDateRange as setDateRangeAction, setCategory as setCategoryAction, setSearchTerm as setSearchTermAction, setDate as setDateAction, resetFilters } from '@/store/slices/filtersSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, CalendarDays } from 'lucide-react';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import DoughnutChart from '@/components/charts/DoughnutChart';
import ScatterChart from '@/components/charts/ScatterChart';
import RadarChart from '@/components/charts/RadarChart';
import PolarAreaChart from '@/components/charts/PolarAreaChart';
import {
  fetchOverview,
  fetchTimeseries,
  fetchByCategory,
  fetchByRegion,
  fetchTopProducts,
  fetchAgeBuckets,
} from '@/lib/metrics';
import { fetchRecentSales } from '@/lib/sales';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dateRange, category, searchTerm, date } = useSelector((state: RootState) => state.filters);
  const [localDate, setLocalDate] = useState<Date | undefined>(date ? new Date(date) : new Date());

  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<{ revenue: number; units: number; aov: number; avgPricePerUnit: number; count: number } | null>(null);
  const [series, setSeries] = useState<{ labels: string[]; revenue: number[]; units: number[]; aov: number[] } | null>(null);
  const [byCategory, setByCategory] = useState<{ labels: string[]; revenue: number[]; units: number[] } | null>(null);
  const [byRegion, setByRegion] = useState<{ labels: string[]; revenue: number[]; units: number[] } | null>(null);
  const [topProducts, setTopProducts] = useState<{ labels: string[]; values: number[] } | null>(null);
  const [ageBuckets, setAgeBuckets] = useState<{ labels: string[]; count: number[]; revenue: number[] } | null>(null);
  const [scatterPoints, setScatterPoints] = useState<{ x: number; y: number }[] | null>(null);

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const range = parseInt(dateRange || '30');
    const start = new Date(end);
    start.setDate(end.getDate() - (Number.isFinite(range) ? range : 30));
    return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
  }, [dateRange]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {
          startDate,
          endDate,
          category: category !== 'all' ? category : undefined,
        } as const;

        const [ov, ts, cat, reg, top, ages, recent] = await Promise.all([
          fetchOverview(params),
          fetchTimeseries({ ...params, granularity: 'day' }),
          fetchByCategory(params),
          fetchByRegion(params),
          fetchTopProducts({ ...params, sort: 'revenue', limit: 10 }),
          fetchAgeBuckets(params),
          fetchRecentSales(params, 200),
        ]);
        setOverview(ov);
        setSeries({ labels: ts.labels, revenue: ts.revenue, units: ts.units, aov: ts.aov });
        setByCategory(cat);
        setByRegion(reg);
        setTopProducts({ labels: top.labels, values: top.values });
        setAgeBuckets(ages);
        setScatterPoints(recent.map((s) => ({ x: s.quantity, y: s.amount })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [startDate, endDate, category]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bienvenido al panel de control de DataMobile</p>
      </div>

      {/* Filtros */}
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
                  <SelectItem value="all">Todas</SelectItem>
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

            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <Input id="search" type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => dispatch(setSearchTermAction(e.target.value))} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                dispatch(setDateAction(localDate ? new Date(localDate).toISOString().slice(0, 10) : null));
              }}
            >
              Aplicar Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                dispatch(resetFilters());
                setLocalDate(new Date());
              }}
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs - 6 cards for symmetry */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
          <Card><CardHeader><CardTitle>Total Revenue</CardTitle><CardDescription>Últimos {dateRange} días</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">${overview.revenue.toLocaleString()}</div></CardContent></Card>
          <Card><CardHeader><CardTitle>Units Sold</CardTitle><CardDescription>Últimos {dateRange} días</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.units.toLocaleString()}</div></CardContent></Card>
          <Card><CardHeader><CardTitle>AOV</CardTitle><CardDescription>Promedio por venta</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">${overview.aov.toFixed(0)}</div></CardContent></Card>
          <Card><CardHeader><CardTitle>Avg Price/Unit</CardTitle><CardDescription>Promedio por unidad</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">${overview.avgPricePerUnit.toFixed(0)}</div></CardContent></Card>
          <Card><CardHeader><CardTitle>Sales Count</CardTitle><CardDescription>Total de ventas</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.count.toLocaleString()}</div></CardContent></Card>
          <Card><CardHeader><CardTitle>Grupos</CardTitle><CardDescription>Categorías / Regiones</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{(byCategory?.labels.length || 0)} / {(byRegion?.labels.length || 0)}</div></CardContent></Card>
        </div>
      )}

      {/* Gráficos: ahora 6 cards para simetría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 1) Line: Revenue over time */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue over time</CardTitle>
            <CardDescription>Granularity: día</CardDescription>
          </CardHeader>
          <CardContent>
            {series ? (
              <LineChart labels={series.labels} datasets={[{ label: 'Revenue', data: series.revenue, borderColor: '#6b8afd' }]} />
            ) : (
              <div className="text-sm text-gray-500">Cargando…</div>
            )}
          </CardContent>
        </Card>

        {/* 2) Bar: Revenue by categoría + Top productos por revenue (en el mismo card) */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue por categoría</CardTitle>
            <CardDescription>Distribución y Top productos</CardDescription>
          </CardHeader>
          <CardContent>
            {byCategory ? (
              <div className="space-y-6">
                <BarChart labels={byCategory.labels} datasets={[{ label: 'Revenue por categoría', data: byCategory.revenue, backgroundColor: '#7bdff2' }]} />
                {topProducts ? (
                  <BarChart labels={topProducts.labels} datasets={[{ label: 'Top productos por revenue', data: topProducts.values, backgroundColor: '#9b5de5' }]} />
                ) : (
                  <div className="text-sm text-gray-500">Cargando top productos…</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Cargando…</div>
            )}
          </CardContent>
        </Card>

        {/* 3) Doughnut: Units by region */}
        <Card>
          <CardHeader>
            <CardTitle>Unidades por región</CardTitle>
            <CardDescription>Participación</CardDescription>
          </CardHeader>
          <CardContent>
            {byRegion ? (
              <DoughnutChart labels={byRegion.labels} data={byRegion.units} />
            ) : (
              <div className="text-sm text-gray-500">Cargando…</div>
            )}
          </CardContent>
        </Card>

        {/* 4) Scatter: Amount vs Quantity (correlación) */}
        <Card>
          <CardHeader>
            <CardTitle>Relación monto vs unidades</CardTitle>
            <CardDescription>Correlación</CardDescription>
          </CardHeader>
          <CardContent>
            {scatterPoints ? (
              <ScatterChart points={scatterPoints} />
            ) : (
              <div className="text-sm text-gray-500">Cargando…</div>
            )}
          </CardContent>
        </Card>

        {/* 5) Polar Area: Revenue por rango de edad */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue por rango de edad</CardTitle>
            <CardDescription>Distribución por rangos</CardDescription>
          </CardHeader>
          <CardContent>
            {ageBuckets ? (
              <PolarAreaChart labels={ageBuckets.labels} data={ageBuckets.revenue} />
            ) : (
              <div className="text-sm text-gray-500">Cargando…</div>
            )}
          </CardContent>
        </Card>

        {/* 6) Card de resumen para simetría */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
            <CardDescription>Distribuciones y correlaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">Explora las gráficas para más detalle.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;