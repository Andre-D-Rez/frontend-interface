import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'
import { isValidEmail, isStrongPassword, isValidName } from '../utils/validation'

export default function Register(){
  const { register, loading } = useAuth()
  const [nome,setNome] = useState('')
  const [email,setEmail] = useState('')
  const [senha,setSenha] = useState('')
  // keep internal variable name 'senha' for UI i18n but send field as 'password'
  const [showSenha, setShowSenha] = useState(false)
  const [error,setError] = useState<string| null>(null)
  // debug helpers removed

  function validate(){
    if (!isValidName(nome)) return 'Nome é obrigatório e precisa ter ao menos 2 caracteres'
    if (!isValidEmail(email)) return 'Email inválido'
    if (!isStrongPassword(senha)) return 'Senha inválida. Precisa ter ao menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial.'
    return null
  }

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    const v = validate()
    setError(v)
    if (v) return
    try{
  // send password field named 'password' and name as 'name' to the backend
  const payload = { name: nome, email, password: senha }
      if (import.meta.env.DEV) console.debug('[register] payload', payload)
      await register(nome,email,senha)
      toast.success('Registro criado! Faça login.')
    }catch(err:any){
      // show backend message/body when available to help debugging
      const backendMsg = err?.data?.message || (err?.data ? JSON.stringify(err.data) : null)
      const show = backendMsg ? `${err?.message || 'Erro ao cadastrar'} — ${backendMsg}` : (err?.message || 'Erro ao cadastrar')
      // in dev show full data in console
      if (import.meta.env.DEV) console.error('[register error]', err)
      toast.error(show)
    }
  }

  return (
    <div className="card">
      <h3>Registrar</h3>
      <form onSubmit={onSubmit}>
        <input placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} required />
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
        <div style={{fontSize:12, color:'#666', marginTop:6}}>
          Sua senha deve ter ao menos 8 caracteres e incluir: uma letra maiúscula, uma letra minúscula, um número e um caractere especial.
        </div>
        {error && <div style={{color:'salmon'}}>{error}</div>}
        <button type="submit" className="btn btn-lg" disabled={loading}>{loading? 'Carregando...' : 'Criar conta'}</button>
      </form>
      {/* debug removed */}
    </div>
  )
}
