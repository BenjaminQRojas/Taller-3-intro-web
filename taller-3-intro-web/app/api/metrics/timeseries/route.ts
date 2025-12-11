// app/api/metrics/timeseries/route.ts
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

type Granularity = 'day' | 'week' | 'month'

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return isNaN(d.getTime()) ? undefined : d
}

function dateKey(d: Date, granularity: Granularity): string {
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  if (granularity === 'day') return `${year}-${month}-${day}`
  if (granularity === 'month') return `${year}-${month}`
  // week number (ISO-like simple calc)
  const tmp = new Date(Date.UTC(year, d.getUTCMonth(), d.getUTCDate()))
  const dayNum = (tmp.getUTCDay() + 6) % 7
  tmp.setUTCDate(tmp.getUTCDate() - dayNum + 3)
  const firstThursday = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 4))
  const week = 1 + Math.round(
    ((tmp.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7,
  )
  const w = String(week).padStart(2, '0')
  return `${year}-W${w}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startDate = parseDate(searchParams.get('startDate'))
  const endDate = parseDate(searchParams.get('endDate'))
  const category = searchParams.get('category') ?? undefined
  const region = searchParams.get('region') ?? undefined
  const searchTerm = searchParams.get('searchTerm') ?? undefined
  const granParam = (searchParams.get('granularity') as Granularity) || 'day'
  const granularity: Granularity = ['day', 'week', 'month'].includes(granParam) ? granParam : 'day'

  const where = {
    ...(category && { category }),
    ...(region && { region }),
    ...(searchTerm && { product: { contains: searchTerm, mode: 'insensitive' } as any }),
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
    const sales = await prisma.sale.findMany({ where, orderBy: { date: 'asc' } })

    const buckets = new Map<string, { revenue: number; units: number; count: number }>()
    for (const s of sales) {
      const key = dateKey(new Date(s.date), granularity)
      const cur = buckets.get(key) || { revenue: 0, units: 0, count: 0 }
      cur.revenue += s.amount
      cur.units += s.quantity
      cur.count += 1
      buckets.set(key, cur)
    }

    const labels = Array.from(buckets.keys()).sort()
    const revenue = labels.map((k) => buckets.get(k)!.revenue)
    const units = labels.map((k) => buckets.get(k)!.units)
    const aov = labels.map((k) => {
      const b = buckets.get(k)!
      return b.count > 0 ? b.revenue / b.count : 0
    })

    return Response.json(
      { labels, revenue, units, aov, granularity },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=59' } },
    )
  } catch (error) {
    console.error('metrics/timeseries error:', error)
    return Response.json({ error: 'Error en series de tiempo' }, { status: 500 })
  }
}
