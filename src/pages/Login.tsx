import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

export default function Login(){
  const { login, loading } = useAuth()
  const [email,setEmail] = useState('')
  const [senha,setSenha] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [error,setError] = useState<string | null>(null)

  function validate(){
    const re = /^\S+@\S+\.\S+$/
    if (!re.test(email)) return 'Email inválido'
    if (!senha) return 'Senha é obrigatória'
    return null
  }

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    const v = validate()
    setError(v)
    if (v) return
    try{
      await login(email,senha)
      toast.success('Login realizado')
    }catch(err:any){
      // show backend message/body when available to help debugging
      const backendMsg = err?.data?.message || (err?.data ? JSON.stringify(err.data) : null)
      const show = backendMsg ? `${err?.message || 'Erro ao logar'} — ${backendMsg}` : (err?.message || 'Erro ao logar')
      if (import.meta.env.DEV) console.error('[login error]', err)
      toast.error(show)
    }
  }

  return (
    <div className="card">
      <h3>Login</h3>
      <form onSubmit={onSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <input
            type={showSenha ? 'text' : 'password'}
            placeholder="Senha"
            value={senha}
            onChange={e=>setSenha(e.target.value)}
            required
            style={{flex:1}}
          />
          <button
            type="button"
            onClick={() => setShowSenha(s => !s)}
            aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
            style={{padding:'6px 8px'}}
          >{showSenha ? 'Ocultar' : 'Mostrar'}</button>
        </div>
        {error && <div style={{color:'salmon'}}>{error}</div>}
        <button type="submit" disabled={loading}>{loading? 'Carregando...' : 'Entrar'}</button>
      </form>
    </div>
  )
}
