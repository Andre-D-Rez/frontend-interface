import React, { createContext, useEffect, useState } from 'react'
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

  useEffect(()=>{
    async function fetchMe(){
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

  async function login(email:string, password:string){
    setLoading(true)
    try{
        const res:any = await loginUser({ email, password })
      if (res.token){
        localStorage.setItem('token', res.token)
        setToken(res.token)
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
