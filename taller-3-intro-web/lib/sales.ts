export type Sale = {
  id: number
  date: string
  product: string
  category: string
  amount: number
  quantity: number
  region: string
  customerAge: number | null
}

export type SalesResponse = {
  sales: Sale[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') search.append(k, String(v))
  })
  return search.toString()
}

export async function fetchRecentSales(params: Record<string, string | number | undefined>, limit = 200): Promise<Sale[]> {
  const res = await fetch(`/api/sales?${qs({ ...params, page: 1, limit })}`)
  if (!res.ok) throw new Error('Failed to load recent sales')
  const json: SalesResponse = await res.json()
  return json.sales
}
