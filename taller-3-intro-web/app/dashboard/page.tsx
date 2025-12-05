"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TrendingUp, Users, DollarSign, Package, Filter, Download, CalendarDays } from 'lucide-react';

const Dashboard = () => {
  const [dateRange, setDateRange] = useState('30');
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());

    // Redux?


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
              <Select value={dateRange} onValueChange={setDateRange}>
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
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="electronics">Electrónica</SelectItem>
                  <SelectItem value="clothing">Ropa</SelectItem>
                  <SelectItem value="food">Alimentos</SelectItem>
                  <SelectItem value="home">Hogar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha Específica</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {date ? date.toLocaleDateString('es-CL') : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="default" size="sm">
              Aplicar Filtros
            </Button>
            <Button variant="outline" size="sm">
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>



    {/* Gráficos CAMBIAR LAS RUTAS*/}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

    <Link href="">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
            <CardTitle>Gráfico 1</CardTitle>
            <CardDescription>Descripción</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="font-medium">insertar gráfico aquí</p>
        </CardContent>
        </Card>
    </Link>

    <Link href="">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
            <CardTitle>Gráfico 2</CardTitle>
            <CardDescription>Descripción</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="font-medium">insertar gráfico aquí</p>
        </CardContent>
        </Card>
    </Link>

    <Link href="">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
            <CardTitle>Gráfico 3</CardTitle>
            <CardDescription>Descripción</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="font-medium">insertar gráfico aquí</p>
        </CardContent>
        </Card>
    </Link>

    <Link href="">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
            <CardTitle>Gráfico 4</CardTitle>
            <CardDescription>Descripción</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="font-medium">insertar gráfico aquí</p>
        </CardContent>
        </Card>
    </Link>

    <Link href="">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
            <CardTitle>Gráfico 5</CardTitle>
            <CardDescription>Descripción</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="font-medium">insertar gráfico aquí</p>
        </CardContent>
        </Card>
    </Link>

    </div>
    </div>
  );
};

export default Dashboard;