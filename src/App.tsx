import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import GlobalLoader from './components/GlobalLoader'
import { useAuth } from './hooks/useAuth'

const ProtectedRoute: React.FC<{children: JSX.Element}> = ({ children }) =>{
  const { token, loading } = useAuth()
  if (loading) return <div className="container">Carregando...</div>
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App(){
  return (
    <div>
      <GlobalLoader />
      <header className="container nav">
        <h2><Link to="/" style={{color:'black',textDecoration:'none'}}>MySeriesList</Link></h2>
        <nav>
          <Link to="/register" style={{marginRight:8}}>Registrar</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
