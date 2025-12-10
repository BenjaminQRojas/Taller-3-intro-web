// app/api/sales/[id]/route.ts
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

export async function GET(
    request: NextRequest,
    { params }: { params: Params }
) {
    try {
        const { id } = await params;
        const saleId = parseInt(id);

        if (!Number.isFinite(saleId) || saleId <= 0) {
            return Response.json(
                { error: 'ID de venta inválido' },
                { status: 400 }
            );
        }

        const sale = await prisma.sale.findUnique({
            where: { id: saleId },
        });

        if (!sale) {
            return Response.json(
                { error: 'Venta no encontrada' },
                { status: 404 }
            );
        }

        return Response.json(
            { sale },
            {
                headers: {
                    'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
                },
            }
        );
    } catch (error) {
        console.error('Error fetching sale:', error);
        return Response.json(
            { error: 'Error al cargar la venta' },
            { status: 500 }
        );
    }
}
