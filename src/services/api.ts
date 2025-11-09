/// <reference types="vite/client" />
const API_BASE: string = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

/* 
 * Retorna headers de autorização quando existir token salvo no localStorage.
 * Sempre retorna um Record<string,string> para ser compatível com fetch.
*/
export function getAuthHeaders(): Record<string,string>{
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Realiza uma requisição fetch para a API configurada em VITE_API_BASE.
 * Normaliza headers, trata JSON e lança erro com informações úteis.
 * @param path caminho a partir da base da API
 */
function joinUrl(base: string, path: string){
  const a = base.replace(/\/+$/,'')
  const b = path.replace(/^\/+/, '')
  return `${a}/${b}`
}

export async function request(path: string, opts: RequestInit = {}){
  const url = joinUrl(API_BASE, path)
  const method = (opts.method || 'GET').toUpperCase()
  try { window.dispatchEvent(new CustomEvent('apiRequestStart', { detail: { url, method } })) } catch {}
  const headers = new Headers()

  if (opts.headers) {
    const h = opts.headers as HeadersInit
    if (h instanceof Headers) {
      h.forEach((value, key) => headers.set(key, value))
    } else if (Array.isArray(h)) {
      h.forEach(([key, value]) => headers.set(key, value))
    } else {
      Object.entries(h as Record<string, string>).forEach(([key, value]) => {
        if (value != null) headers.set(key, value)
      })
    }
  }

  // ensure JSON content-type by default
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  let res: Response
  try {
    if (import.meta.env.DEV) {
      try { console.debug('[api] fetch', { url, opts: { ...opts, headers }, API_BASE }) } catch {}
    }
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const parts = token.split('.')
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')))
            if (payload && typeof payload.exp === 'number'){
              const now = Math.floor(Date.now()/1000)
              if (payload.exp < now) {
                try { localStorage.removeItem('token') } catch {}
                try { window.dispatchEvent(new Event('tokenExpired')) } catch {}
                const err = new Error('Token expirado') as Error & { code?: string }
                err.code = 'TOKEN_EXPIRED'
                throw err
              }
            }
          }catch(e){/* ignore malformed token payload */}
        }
      }
    } catch(e) {
      // ignore errors checking token expiration
    }

    try {
      res = await fetch(url, { ...opts, headers })
    } catch (e: any) {
      // network error (DNS, CORS preflight blocked by browser will appear as TypeError in browser)
      const message = `Network error when fetching ${url}: ${e?.message || String(e)}`
      const err = new Error(message) as Error & { cause?: any }
      err.cause = e
      throw err
    }
    const text = await res.text()
    let data: unknown = null
    try { data = text ? JSON.parse(text) : null } catch(e){ data = text }
    if (!res.ok) {
      if (res.status === 401) {
        try { localStorage.removeItem('token') } catch {}
        try { window.dispatchEvent(new Event('tokenExpired')) } catch {}
      }
      const message = (data && typeof data === 'object' && 'message' in (data as any))
        ? (data as any).message
        : res.statusText || 'Erro na requisição'
      const err = new Error(String(message)) as Error & { status?: number; data?: unknown }
      err.status = res.status
      err.data = data
      throw err
    }
    return data
  } finally {
    try { window.dispatchEvent(new CustomEvent('apiRequestEnd', { detail: { url, method } })) } catch {}
  }
}
