'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Package, DollarSign, Users, Tag, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface Sale {
    id: number;
    date: string;
    product: string;
    category: string;
    amount: number;
    quantity: number;
    region: string;
    customerAge: number | null;
    createdAt: string;
}

export default function SaleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [sale, setSale] = useState<Sale | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSale = async () => {
            try {
                const response = await fetch(`/api/sales/${params.id}`);
                if (!response.ok) {
                    throw new Error('Venta no encontrada');
                }
                const data = await response.json();
                setSale(data.sale);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al cargar la venta');
            } finally {
                setLoading(false);
            }
        };

        fetchSale();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !sale) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Error</CardTitle>
                        <CardDescription>{error || 'Venta no encontrada'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push('/dashboard')} className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const saleDate = new Date(sale.date);
    const pricePerUnit = sale.amount / sale.quantity;

    // Datos para gráfico de distribución de monto
    const doughnutData = {
        labels: ['Monto Total', 'Precio Unitario'],
        datasets: [
            {
                label: 'Distribución',
                data: [sale.amount, pricePerUnit],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(168, 85, 247, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    // Simulación de tendencia de ventas (datos de ejemplo)
    const lineData = {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Ventas Mensuales',
                data: [
                    sale.amount * 0.7,
                    sale.amount * 0.85,
                    sale.amount * 0.9,
                    sale.amount * 1.1,
                    sale.amount,
                    sale.amount * 1.15,
                ],
                fill: true,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderColor: 'rgba(34, 197, 94, 1)',
                tension: 0.4,
            },
        ],
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Electrónica': 'bg-blue-100 text-blue-800 border-blue-200',
            'Ropa': 'bg-purple-100 text-purple-800 border-purple-200',
            'Hogar': 'bg-green-100 text-green-800 border-green-200',
            'Deportes': 'bg-orange-100 text-orange-800 border-orange-200',
        };
        return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard')}
                        className="mb-4 hover:bg-white/80 transition-all"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Dashboard
                    </Button>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                        Detalle de Venta #{sale.id}
                    </h1>
                    <p className="text-slate-600">
                        Información completa y análisis de la transacción
                    </p>
                </div>

                {/* Información Principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Monto Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-slate-900">
                                ${sale.amount.toLocaleString('es-CL')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Cantidad
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-slate-900">
                                {sale.quantity} unidades
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Precio Unitario
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-slate-900">
                                ${pricePerUnit.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Edad Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-slate-900">
                                {sale.customerAge ? `${sale.customerAge} años` : 'N/A'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detalles del Producto */}
                <Card className="mb-6 hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Información del Producto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Producto</p>
                                <p className="text-lg font-semibold text-slate-900">{sale.product}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Categoría</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(sale.category)}`}>
                                    {sale.category}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-slate-600" />
                                <div>
                                    <p className="text-sm text-slate-600">Región</p>
                                    <p className="text-lg font-semibold text-slate-900">{sale.region}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-slate-600" />
                                <div>
                                    <p className="text-sm text-slate-600">Fecha de Venta</p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {saleDate.toLocaleDateString('es-CL', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Distribución de Montos</CardTitle>
                            <CardDescription>
                                Comparación entre monto total y precio unitario
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center items-center h-64">
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'bottom',
                                        },
                                    },
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>Tendencia de Ventas</CardTitle>
                            <CardDescription>
                                Proyección mensual basada en esta venta
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-64">
                            <Line
                                data={lineData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: false,
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                        },
                                    },
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Metadata */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <CardTitle>Información del Sistema</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-600">ID de Venta</p>
                                <p className="font-mono font-semibold text-slate-900">{sale.id}</p>
                            </div>
                            <div>
                                <p className="text-slate-600">Fecha de Registro</p>
                                <p className="font-semibold text-slate-900">
                                    {new Date(sale.createdAt).toLocaleString('es-CL')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
