export type Overview = {
  revenue: number
  units: number
  aov: number
  avgPricePerUnit: number
  count: number
}

export type Timeseries = {
  labels: string[]
  revenue: number[]
  units: number[]
  aov: number[]
  granularity: 'day' | 'week' | 'month'
}

export type Grouped = { labels: string[]; revenue: number[]; units: number[] }
export type TopProducts = { labels: string[]; values: number[]; sort: 'revenue' | 'units' }
export type AgeBuckets = { labels: string[]; count: number[]; revenue: number[] }

function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') search.append(k, String(v))
  })
  return search.toString()
}

export async function fetchOverview(params: Record<string, string | number | undefined>): Promise<Overview> {
  const res = await fetch(`/api/metrics/overview?${qs(params)}`)
  if (!res.ok) throw new Error('Failed to load overview')
  return res.json()
}

export async function fetchTimeseries(params: Record<string, string | number | undefined>): Promise<Timeseries> {
  const res = await fetch(`/api/metrics/timeseries?${qs(params)}`)
  if (!res.ok) throw new Error('Failed to load timeseries')
  return res.json()
}

export async function fetchByCategory(params: Record<string, string | number | undefined>): Promise<Grouped> {
  const res = await fetch(`/api/metrics/by-category?${qs(params)}`)
  if (!res.ok) throw new Error('Failed to load by-category')
  return res.json()
}

export async function fetchByRegion(params: Record<string, string | number | undefined>): Promise<Grouped> {
  const res = await fetch(`/api/metrics/by-region?${qs(params)}`)
  if (!res.ok) throw new Error('Failed to load by-region')
  return res.json()
}

export async function fetchTopProducts(params: Record<string, string | number | undefined>): Promise<TopProducts> {
  const res = await fetch(`/api/metrics/top-products?${qs(params)}`)
  if (!res.ok) throw new Error('Failed to load top-products')
  return res.json()
}

export async function fetchAgeBuckets(params: Record<string, string | number | undefined>): Promise<AgeBuckets> {
  const res = await fetch(`/api/metrics/age-buckets?${qs(params)}`)
  if (!res.ok) throw new Error('Failed to load age-buckets')
  return res.json()
}
