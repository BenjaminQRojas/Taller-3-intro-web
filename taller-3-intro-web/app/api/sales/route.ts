import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get('category') ?? undefined;
  const region = searchParams.get('region') ?? undefined;

  const minAmountStr = searchParams.get('minAmount');
  const maxAmountStr = searchParams.get('maxAmount');
  const minAgeStr = searchParams.get('minAge');
  const maxAgeStr = searchParams.get('maxAge');
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  const minAmount = minAmountStr ? Number(minAmountStr) : undefined;
  const maxAmount = maxAmountStr ? Number(maxAmountStr) : undefined;
  const minAge = minAgeStr ? Number(minAgeStr) : undefined;
  const maxAge = maxAgeStr ? Number(maxAgeStr) : undefined;

  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;

  const pageStr = searchParams.get('page');
  const limitStr = searchParams.get('limit');
  const page = pageStr ? parseInt(pageStr) : 1;
  const limit = limitStr ? parseInt(limitStr) : 50;
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 50;
  const skip = (safePage - 1) * safeLimit;

  const amountFilter =
    minAmount !== undefined || maxAmount !== undefined
      ? {
          amount: {
            ...(Number.isFinite(minAmount) ? { gte: minAmount } : {}),
            ...(Number.isFinite(maxAmount) ? { lte: maxAmount } : {}),
          },
        }
      : {};

  const ageFilter =
    minAge !== undefined || maxAge !== undefined
      ? {
          customerAge: {
            ...(Number.isFinite(minAge) ? { gte: minAge } : {}),
            ...(Number.isFinite(maxAge) ? { lte: maxAge } : {}),
          },
        }
      : {};

  const dateFilter =
    (startDate && !isNaN(startDate.getTime())) ||
    (endDate && !isNaN(endDate.getTime()))
      ? {
          date: {
            ...(startDate && !isNaN(startDate.getTime()) ? { gte: startDate } : {}),
            ...(endDate && !isNaN(endDate.getTime()) ? { lte: endDate } : {}),
          },
        }
      : {};

  try {
    const where = {
      ...(category && { category }),
      ...(region && { region }),
      ...amountFilter,
      ...ageFilter,
      ...dateFilter,
    } as const;

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        orderBy: { date: 'desc' },
        take: safeLimit,
        skip,
      }),
      prisma.sale.count({ where }),
    ]);

    return Response.json(
      {
        sales,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          pages: Math.ceil(total / safeLimit) || 1,
        },
      },
      {
        headers: {
          'Cache-Control': 's-maxage=30, stale-while-revalidate=59',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching sales:', error);
    return Response.json({ error: 'Error al cargar ventas' }, { status: 500 });
  }
}