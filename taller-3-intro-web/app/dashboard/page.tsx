"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { setDate as setDateAction, applyFilters } from '@/store/slices/filtersSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardFilters from '@/components/filters/DashboardFilters';
import KpiGrid from '@/components/KpiGrid';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import DoughnutChart from '@/components/charts/DoughnutChart';
import PolarAreaChart from '@/components/charts/PolarAreaChart';
import {
  fetchOverview,
  fetchTimeseries,
  fetchByCategory,
  fetchByRegion,
  fetchTopProducts,
  fetchAgeBuckets,
  fetchCategories,
} from '@/lib/metrics';
import { fetchRecentSales, fetchSalesPaged } from '@/lib/sales';
import type { Sale, SalesResponse } from '@/lib/sales';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dateRange, category, searchTerm, date, appliedDateRange, appliedCategory, appliedSearchTerm, appliedDate } = useSelector((state: RootState) => state.filters);

  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<{ revenue: number; units: number; aov: number; avgPricePerUnit: number; count: number } | null>(null);
  const [series, setSeries] = useState<{ labels: string[]; revenue: number[]; units: number[]; aov: number[] } | null>(null);
  const [byCategory, setByCategory] = useState<{ labels: string[]; revenue: number[]; units: number[] } | null>(null);
  const [byRegion, setByRegion] = useState<{ labels: string[]; revenue: number[]; units: number[] } | null>(null);
  const [topProducts, setTopProducts] = useState<{ labels: string[]; values: number[] } | null>(null);
  const [ageBuckets, setAgeBuckets] = useState<{ labels: string[]; count: number[]; revenue: number[] } | null>(null);
  const [histogram, setHistogram] = useState<{ labels: string[]; counts: number[] } | null>(null);
  const [histogramMetric, setHistogramMetric] = useState<'amount' | 'quantity'>('amount');
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[] | null>(null);
  const [tableSales, setTableSales] = useState<Sale[] | null>(null);
  const [tablePage, setTablePage] = useState<number>(1);
  const [tableLimit, setTableLimit] = useState<number>(10);
  const [tablePages, setTablePages] = useState<number>(1);
  const [saleSearchId, setSaleSearchId] = useState<string>('');
  const router = useRouter();

  const { startDate, endDate } = useMemo(() => {
    const formatLocal = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const parseYMD = (s: string) => {
      const [y, m, d] = s.split('-').map(Number);
      return new Date(y, (m || 1) - 1, d || 1);
    };

    const endLocal = appliedDate ? parseYMD(appliedDate) : new Date();
    const range = parseInt(appliedDateRange || '30');
    const startLocal = new Date(endLocal);
    startLocal.setDate(endLocal.getDate() - (Number.isFinite(range) ? range : 30));
    return { startDate: formatLocal(startLocal), endDate: formatLocal(endLocal) };
  }, [appliedDateRange, appliedDate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {
          startDate,
          endDate,
          category: appliedCategory !== 'all' ? appliedCategory : undefined,
          searchTerm: appliedSearchTerm || undefined,
        } as const;

        const [ov, ts, cat, reg, top, ages, recent, cats, paged] = await Promise.all([
          fetchOverview(params),
          fetchTimeseries({ ...params, granularity: 'day' }),
          fetchByCategory(params),
          fetchByRegion(params),
          fetchTopProducts({ ...params, sort: 'revenue', limit: 10 }),
          fetchAgeBuckets(params),
          fetchRecentSales(params, 200),
          fetchCategories(),
          fetchSalesPaged(params, tablePage, tableLimit),
        ]);
        setOverview(ov);
        setSeries({ labels: ts.labels, revenue: ts.revenue, units: ts.units, aov: ts.aov });
        setByCategory(cat);
        setByRegion(reg);
        setTopProducts({ labels: top.labels, values: top.values });
        setAgeBuckets(ages);
        setRecentSales(recent);

        const series = (histogramMetric === 'amount' ? recent.map((s) => s.amount) : recent.map((s) => s.quantity)) as number[];
        const max = Math.max(0, ...series);
        const binCount = 10;
        const binSize = max > 0 ? Math.ceil(max / binCount) : 1;
        const labels: string[] = [];
        const counts = new Array(binCount).fill(0);
        for (let i = 0; i < binCount; i++) {
          const from = i * binSize;
          const to = i === binCount - 1 ? max : (i + 1) * binSize - 1;
          labels.push(
            histogramMetric === 'amount'
              ? `$${from.toLocaleString()} - $${to.toLocaleString()}`
              : `${from.toLocaleString()} - ${to.toLocaleString()}`
          );
        }
        for (const v of series) {
          const idx = Math.min(Math.floor(v / binSize), binCount - 1);
          counts[idx] += 1;
        }
        setHistogram({ labels, counts });
        setCategoriesList(['all', ...cats.categories]);
        setTableSales(paged.sales);
        setTablePages(paged.pagination.pages);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [startDate, endDate, appliedCategory, appliedSearchTerm, appliedDate, tablePage, tableLimit]);

  useEffect(() => {
    if (!recentSales) return;
    const series = histogramMetric === 'amount' ? recentSales.map((s) => s.amount) : recentSales.map((s) => s.quantity);
    const max = Math.max(0, ...series);
    const binCount = 10;
    const binSize = max > 0 ? Math.ceil(max / binCount) : 1;
    const labels: string[] = [];
    const counts = new Array(binCount).fill(0);
    for (let i = 0; i < binCount; i++) {
      const from = i * binSize;
      const to = i === binCount - 1 ? max : (i + 1) * binSize - 1;
      labels.push(
        histogramMetric === 'amount'
          ? `$${from.toLocaleString()} - $${to.toLocaleString()}`
          : `${from.toLocaleString()} - ${to.toLocaleString()}`
      );
    }
    for (const v of series) {
      const idx = Math.min(Math.floor(v / binSize), binCount - 1);
      counts[idx] += 1;
    }
    setHistogram({ labels, counts });
  }, [histogramMetric, recentSales]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      {}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Bienvenido al panel de control de DataMobile</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            id="sale-search"
            type="number"
            placeholder="Buscar venta por ID"
            value={saleSearchId}
            onChange={(e) => setSaleSearchId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && saleSearchId.trim() !== '') {
                const id = parseInt(saleSearchId.trim());
                if (Number.isFinite(id) && id > 0) router.push(`/detalle/${id}`);
              }
            }}
            className="w-64 md:w-80"
          />
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              if (saleSearchId.trim() !== '') {
                const id = parseInt(saleSearchId.trim());
                if (Number.isFinite(id) && id > 0) router.push(`/detalle/${id}`);
              }
            }}
          >
            Ir
          </Button>
        </div>
      </div>

      {}
      <DashboardFilters
        categoriesList={categoriesList}
        onApplyFilters={(filters) => {
          dispatch(setDateAction(filters.date ?? null));
          dispatch(applyFilters());
          setTablePage(1);
        }}
      />

      {}
      <div className="mb-6 text-sm text-gray-800 flex flex-wrap items-center gap-2">
        <span className="font-medium">Filtros aplicados:</span>
        <span className="px-2 py-1 rounded bg-gray-100">Rango: {appliedDateRange || '30'} días</span>
        <span className="px-2 py-1 rounded bg-gray-100">Categoría: {appliedCategory === 'all' ? 'Todas' : appliedCategory}</span>
        {appliedDate && (
          <span className="px-2 py-1 rounded bg-gray-100">
            Fecha: {(() => { const [y,m,d] = (appliedDate as string).split('-').map(Number); return new Date(y,(m||1)-1,(d||1)).toLocaleDateString('es-CL'); })()}
          </span>
        )}
        {appliedSearchTerm && (
          <span className="px-2 py-1 rounded bg-gray-100">Buscar: "{appliedSearchTerm}"</span>
        )}
      </div>

      {}
      <KpiGrid overview={overview} byCategory={byCategory} byRegion={byRegion} dateRange={dateRange} />

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos a lo largo del tiempo</CardTitle>
            <CardDescription>Granularidad: día</CardDescription>
          </CardHeader>
          <CardContent>
            {series ? (
              <LineChart labels={series.labels} datasets={[{ label: 'Revenue', data: series.revenue, borderColor: '#6b8afd' }]} />
            ) : loading ? (
              <div className="h-40 rounded bg-gray-100 animate-pulse" />
            ) : (
              <div className="text-sm text-gray-500">Sin datos…</div>
            )}
          </CardContent>
        </Card>

        {/* 2) Bar: Revenue by categoría + Top productos por revenue (en el mismo card) */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por categoría</CardTitle>
            <CardDescription>Distribución y Top productos</CardDescription>
          </CardHeader>
          <CardContent>
            {byCategory ? (
              <div className="space-y-6">
                <BarChart labels={byCategory.labels} datasets={[{ label: 'Revenue por categoría', data: byCategory.revenue, backgroundColor: '#7bdff2' }]} />
                {topProducts ? (
                  <BarChart labels={topProducts.labels} datasets={[{ label: 'Top productos por revenue', data: topProducts.values, backgroundColor: '#9b5de5' }]} />
                ) : loading ? (
                  <div className="h-32 rounded bg-gray-100 animate-pulse" />
                ) : (
                  <div className="text-sm text-gray-500">Sin datos…</div>
                )}
              </div>
            ) : loading ? (
              <div className="h-40 rounded bg-gray-100 animate-pulse" />
            ) : (
              <div className="text-sm text-gray-500">Sin datos…</div>
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
            ) : loading ? (
              <div className="h-40 rounded bg-gray-100 animate-pulse" />
            ) : (
              <div className="text-sm text-gray-500">Sin datos…</div>
            )}
          </CardContent>
        </Card>

        {/* 4) Histogram: Distribución de montos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Distribución</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={histogramMetric === 'amount' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHistogramMetric('amount')}
                >
                  Monto
                </Button>
                <Button
                  variant={histogramMetric === 'quantity' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHistogramMetric('quantity')}
                >
                  Unidades
                </Button>
              </div>
            </div>
            <CardDescription>Histograma de ventas recientes</CardDescription>
          </CardHeader>
          <CardContent>
            {histogram ? (
              <BarChart labels={histogram.labels} datasets={[{ label: histogramMetric === 'amount' ? 'Ventas por rango de monto' : 'Ventas por rango de unidades', data: histogram.counts, backgroundColor: '#f4a261' }]} />
            ) : loading ? (
              <div className="h-40 rounded bg-gray-100 animate-pulse" />
            ) : (
              <div className="text-sm text-gray-500">Sin datos…</div>
            )}
          </CardContent>
        </Card>

        {/* 5) Polar Area: Revenue por rango de edad */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por rango de edad</CardTitle>
            <CardDescription>Distribución por rangos</CardDescription>
          </CardHeader>
          <CardContent>
            {ageBuckets ? (
              <PolarAreaChart labels={ageBuckets.labels} data={ageBuckets.revenue} />
            ) : loading ? (
              <div className="h-40 rounded bg-gray-100 animate-pulse" />
            ) : (
              <div className="text-sm text-gray-500">Sin datos…</div>
            )}
          </CardContent>
        </Card>

        {/* 6) Recent Sales table */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas recientes</CardTitle>
            <CardDescription>IDs clicables para ver detalle</CardDescription>
          </CardHeader>
          <CardContent>
            {tableSales && tableSales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">ID</th>
                      <th className="py-2 pr-4">Fecha</th>
                      <th className="py-2 pr-4">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableSales.map((s) => (
                      <tr key={s.id} className="border-t border-gray-200">
                        <td className="py-2 pr-4 text-blue-600">
                          <Link href={`/detalle/${s.id}`}>{s.id}</Link>
                        </td>
                        <td className="py-2 pr-4">{new Date(s.date).toLocaleDateString('es-CL')}</td>
                        <td className="py-2 pr-4">${s.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-600">Página {tablePage} de {tablePages}</div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={tablePage <= 1}
                      onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={tablePage >= tablePages}
                      onClick={() => setTablePage((p) => p + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-6 rounded bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Sin datos de ventas recientes…</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;