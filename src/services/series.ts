import { request, getAuthHeaders } from './api'
import { ISeries } from '../types'

function buildQuery(params?: Record<string,string|number|undefined>){
  if (!params) return ''
  const esc = encodeURIComponent
  const qs = Object.entries(params)
    .filter(([,v])=> v !== undefined && v !== null && String(v) !== '')
    .map(([k,v])=> `${esc(k)}=${esc(String(v))}`).join('&')
  return qs ? `?${qs}` : ''
}

export async function fetchSeries(filters?: Record<string,string|number|undefined>): Promise<ISeries[]>{
  const q = buildQuery(filters)
  const res = await request(`/api/series${q}`, { method: 'GET', headers: getAuthHeaders() })
  if (Array.isArray(res)) return res as ISeries[]
  if (res && typeof res === 'object'){
    const anyRes: any = res
    if (Array.isArray(anyRes.data)) return anyRes.data as ISeries[]
    if (Array.isArray(anyRes.series)) return anyRes.series as ISeries[]
    if (Array.isArray(anyRes.result)) return anyRes.result as ISeries[]
  }
  return []
}

export async function createSeries(payload: ISeries): Promise<ISeries>{
  return request('/api/series', { method: 'POST', body: JSON.stringify(payload), headers: getAuthHeaders() }) as Promise<ISeries>
}

/* Buscar uma série específica por id */
export async function getSeriesById(id: string): Promise<ISeries | null>{
  const res = await request(`/api/series/${id}`, { method: 'GET', headers: getAuthHeaders() })
  return (res as ISeries) ?? null
}

/* Atualização completa da série (PUT) */
export async function updateSeriesPut(id: string, payload: ISeries): Promise<ISeries>{
  return request(`/api/series/${id}`, { method: 'PUT', body: JSON.stringify(payload), headers: getAuthHeaders() }) as Promise<ISeries>
}

/* Atualização parcial da série (PATCH) */
export async function updateSeriesPatch(id: string, payload: Partial<ISeries>): Promise<ISeries>{
  return request(`/api/series/${id}`, { method: 'PATCH', body: JSON.stringify(payload), headers: getAuthHeaders() }) as Promise<ISeries>
}

export async function deleteSeries(id: string): Promise<void>{
  return request(`/api/series/${id}`, { method: 'DELETE', headers: getAuthHeaders() }) as Promise<void>
}
