import React, { createContext, useEffect, useRef, useState } from 'react'
import { loginUser, registerUser, me as meReq } from '../services/auth'
import { useNavigate } from 'react-router-dom'

type User = { nome?: string; email?: string }

interface AuthContextValue{
  user: User | null
  token: string | null
  loading: boolean
    login: (email: string, password: string)=>Promise<void>
    register: (nome:string,email:string,password:string)=>Promise<void>
  logout: ()=>void
}

export const AuthContext = createContext<AuthContextValue>({} as any)

export const AuthProvider: React.FC<{children:React.ReactNode}> = ({ children }) =>{
  const [user,setUser] = useState<User|null>(null)
  const [token,setToken] = useState<string|null>(localStorage.getItem('token'))
  const [loading,setLoading] = useState<boolean>(false)
  const navigate = useNavigate()
  const expiryTimer = useRef<number | null>(null)

  useEffect(()=>{
    // schedule auto-logout when token expires (client-side)
    function scheduleExpiry(t?: string | null){
      // clear previous timer
      if (expiryTimer.current) {
        try { clearTimeout(expiryTimer.current) } catch {}
        expiryTimer.current = null
      }
      if (!t) return
      try {
        const parts = t.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')))
          if (payload && typeof payload.exp === 'number'){
            const now = Math.floor(Date.now()/1000)
            const ms = (payload.exp - now) * 1000
            if (ms <= 0) {
              try { window.dispatchEvent(new Event('tokenExpired')) } catch {}
            } else {
              // schedule tokenExpired event
              expiryTimer.current = window.setTimeout(() => {
                try { window.dispatchEvent(new Event('tokenExpired')) } catch {}
              }, ms) as unknown as number
            }
          }
        }
      } catch(e) {
        // ignore malformed token
      }
    }

    async function fetchMe(){
      scheduleExpiry(token)
      if (!token) return
      setLoading(true)
      try{
        const data = await meReq()
        setUser({ nome: data.nome, email: data.email })
      }catch(e){
        // token inválido/expirado
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
        navigate('/login')
      }finally{setLoading(false)}
    }
    fetchMe()
  },[token])

  // escutar evento global disparado por api.ts quando o token expirar
  useEffect(()=>{
    function onTokenExpired(){
      try { localStorage.removeItem('token') } catch {}
      // clear any scheduled timer
      try { if (expiryTimer.current) { clearTimeout(expiryTimer.current); expiryTimer.current = null } } catch {}
      setToken(null)
      setUser(null)
      navigate('/login')
    }
    window.addEventListener('tokenExpired', onTokenExpired)
    return () => window.removeEventListener('tokenExpired', onTokenExpired)
  },[])

  async function login(email:string, password:string){
    setLoading(true)
    try{
        const res:any = await loginUser({ email, password })
      if (res.token){
        localStorage.setItem('token', res.token)
        setToken(res.token)
        // schedule auto-logout based on token exp
        try { const ev = new Event('tokenExpirySchedule'); } catch {}
        // buscar user
        const info = await meReq()
        setUser({ nome: info.nome, email: info.email })
        navigate('/dashboard')
      }
    }finally{setLoading(false)}
  }

  async function register(nome:string,email:string,password:string){
    setLoading(true)
    try{
      // send 'name' field expected by backend
      await registerUser({ name: nome, email, password })
      // redirect to login
      navigate('/login')
    }finally{setLoading(false)}
  }

  function logout(){
    localStorage.removeItem('token')
    try { if (expiryTimer.current) { clearTimeout(expiryTimer.current); expiryTimer.current = null } } catch {}
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
