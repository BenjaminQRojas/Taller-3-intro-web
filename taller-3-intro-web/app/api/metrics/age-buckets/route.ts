// app/api/metrics/age-buckets/route.ts
import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

function parseDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return isNaN(d.getTime()) ? undefined : d
}

function parseBuckets(param: string | null): number[] {
  if (!param) return [18, 25, 35, 45, 55, 65, 80]
  try {
    const arr = JSON.parse(param)
    return Array.isArray(arr) && arr.every((n) => Number.isFinite(n)) ? arr : [18, 25, 35, 45, 55, 65, 80]
  } catch {
    return [18, 25, 35, 45, 55, 65, 80]
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startDate = parseDate(searchParams.get('startDate'))
  const endDate = parseDate(searchParams.get('endDate'))
  const rawBuckets = parseBuckets(searchParams.get('buckets'))

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
    const sales = await prisma.sale.findMany({ where, select: { customerAge: true, amount: true } })

    const buckets = [...rawBuckets].sort((a, b) => a - b)
    const labels: string[] = []
    const count: number[] = []
    const revenue: number[] = []

    for (let i = 0; i < buckets.length - 1; i++) {
      const from = buckets[i]
      const to = buckets[i + 1] - 1
      labels.push(`${from}-${to}`)
      count.push(0)
      revenue.push(0)
    }

    // last bucket open-ended
    labels.push(`${buckets[buckets.length - 1]}+`)
    count.push(0)
    revenue.push(0)

    for (const s of sales) {
      const age = s.customerAge
      if (age == null) continue
      let idx = -1
      for (let i = 0; i < buckets.length - 1; i++) {
        if (age >= buckets[i] && age < buckets[i + 1]) {
          idx = i
          break
        }
      }
      if (idx === -1) idx = buckets.length - 1
      count[idx] += 1
      revenue[idx] += s.amount
    }

    return Response.json(
      { labels, count, revenue },
      { headers: { 'Cache-Control': 's-maxage=30, stale-while-revalidate=59' } },
    )
  } catch (error) {
    console.error('metrics/age-buckets error:', error)
    return Response.json({ error: 'Error en métricas por edad' }, { status: 500 })
  }
}
