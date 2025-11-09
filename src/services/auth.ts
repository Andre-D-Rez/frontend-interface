import { request, getAuthHeaders } from './api'

export async function registerUser(payload: { name: string, email: string, password: string }): Promise<any>{
  return request('/api/register', { method: 'POST', body: JSON.stringify(payload) }) as Promise<any>
}

export async function loginUser(payload: { email: string, password: string }): Promise<{ token: string }>{
  return request('/api/login', { method: 'POST', body: JSON.stringify(payload) }) as Promise<{ token: string }>
}

export async function me(): Promise<{ nome: string; email: string }>{
  return request('/api/protected', { method: 'GET', headers: getAuthHeaders() }) as Promise<{ nome: string; email: string }>
}
