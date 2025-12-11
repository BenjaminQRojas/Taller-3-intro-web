"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Overview = { revenue: number; units: number; aov: number; avgPricePerUnit: number; count: number } | null;
type Grouped = { labels: string[]; revenue: number[]; units: number[] } | null;

export default function KpiGrid({ overview, byCategory, byRegion, dateRange }: { overview: Overview; byCategory: Grouped; byRegion: Grouped; dateRange: string }) {
  if (!overview) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
      <Card><CardHeader><CardTitle>Ingresos totales</CardTitle><CardDescription>Últimos {dateRange} días</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">${overview.revenue.toLocaleString()}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>Unidades vendidas</CardTitle><CardDescription>Últimos {dateRange} días</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.units.toLocaleString()}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>AOV</CardTitle><CardDescription>Promedio por venta</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">${overview.aov.toFixed(0)}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>Precio por unidad</CardTitle><CardDescription>Promedio por unidad</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">${overview.avgPricePerUnit.toFixed(0)}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>Conteo de ventas</CardTitle><CardDescription>Total de ventas</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.count.toLocaleString()}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>Grupos</CardTitle><CardDescription>Categorías / Regiones</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{(byCategory?.labels.length || 0)} / {(byRegion?.labels.length || 0)}</div></CardContent></Card>
    </div>
  );
}
