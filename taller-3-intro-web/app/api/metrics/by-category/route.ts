// app/api/metrics/by-category/route.ts
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return isNaN(d.getTime()) ? undefined : d
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startDate = parseDate(searchParams.get('startDate'))
  const endDate = parseDate(searchParams.get('endDate'))

  const where = {
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  } as const

  try {
    const grouped = await prisma.sale.groupBy({
      by: ['category'],
      where,
      _sum: { amount: true, quantity: true },
    })

    const labels = grouped.map((g) => g.category)
    const revenue = grouped.map((g) => g._sum.amount ?? 0)
    const units = grouped.map((g) => g._sum.quantity ?? 0)

    return Response.json(
      { labels, revenue, units },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=59' } },
    )
  } catch (error) {
    console.error('metrics/by-category error:', error)
    return Response.json({ error: 'Error en métricas por categoría' }, { status: 500 })
  }
}
