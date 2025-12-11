// app/api/metrics/top-products/route.ts
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
  const category = searchParams.get('category') ?? undefined
  const region = searchParams.get('region') ?? undefined
  const searchTerm = searchParams.get('searchTerm') ?? undefined
  const sort = (searchParams.get('sort') ?? 'revenue') as 'revenue' | 'units'
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10')))

  const where = {
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
    ...(category && { category }),
    ...(region && { region }),
    ...(searchTerm && { product: { contains: searchTerm, mode: 'insensitive' } as any }),
  } as const

  try {
    const grouped = await prisma.sale.groupBy({
      by: ['product'],
      where,
      _sum: { amount: true, quantity: true },
    })

    grouped.sort((a, b) => {
      const va = sort === 'revenue' ? a._sum.amount ?? 0 : a._sum.quantity ?? 0
      const vb = sort === 'revenue' ? b._sum.amount ?? 0 : b._sum.quantity ?? 0
      return vb - va
    })

    const top = grouped.slice(0, limit)
    const labels = top.map((g) => g.product)
    const values = top.map((g) => (sort === 'revenue' ? g._sum.amount ?? 0 : g._sum.quantity ?? 0))

    return Response.json(
      { labels, values, sort },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=59' } },
    )
  } catch (error) {
    console.error('metrics/top-products error:', error)
    return Response.json({ error: 'Error en top productos' }, { status: 500 })
  }
}
