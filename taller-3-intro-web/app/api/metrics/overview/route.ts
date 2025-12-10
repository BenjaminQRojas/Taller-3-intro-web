// app/api/metrics/overview/route.ts
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

  const where = {
    ...(category && { category }),
    ...(region && { region }),
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
    const [sumAmount, sumQuantity, count] = await Promise.all([
      prisma.sale.aggregate({ where, _sum: { amount: true } }),
      prisma.sale.aggregate({ where, _sum: { quantity: true } }),
      prisma.sale.count({ where }),
    ])

    const revenue = sumAmount._sum.amount ?? 0
    const units = sumQuantity._sum.quantity ?? 0
    const salesCount = count
    const aov = salesCount > 0 ? revenue / salesCount : 0
    const avgPricePerUnit = units > 0 ? revenue / units : 0

    return Response.json(
      { revenue, units, aov, avgPricePerUnit, count: salesCount },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=59' } },
    )
  } catch (error) {
    console.error('metrics/overview error:', error)
    return Response.json({ error: 'Error en métricas generales' }, { status: 500 })
  }
}
