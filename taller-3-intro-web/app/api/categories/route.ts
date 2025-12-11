import type { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    const grouped = await prisma.sale.groupBy({ by: ['category'] })
    const categories = grouped.map((g) => g.category).filter(Boolean)
    return Response.json({ categories }, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=599' } })
  } catch (error) {
    console.error('categories route error:', error)
    return Response.json({ error: 'Error al cargar categorías' }, { status: 500 })
  }
}
