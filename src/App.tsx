import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import './App.css'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Condominios from './pages/Condominios'
import Vistorias from './pages/Vistorias'
import NaoConformidades from './pages/NaoConformidades'
import PlanoAcao from './pages/PlanoAcao'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'
import AdminClientes from './pages/AdminClientes'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        setUser(null)
      } else {
        setUser(data.user)
      }

      setLoading(false)
    }

    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert(error.message)
      return
    }

    setEmail('')
    setPassword('')
  }

  if (loading) return <p>Carregando...</p>

  if (!user) {
    return (
      <div className="login-page">
        <h1>CondoSafe</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button onClick={handleLogin}>Entrar</button>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="condominios" element={<Condominios />} />
          <Route path="vistorias" element={<Vistorias />} />
          <Route path="nao-conformidades" element={<NaoConformidades />} />
          <Route path="plano-acao" element={<PlanoAcao />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="admin-clientes" element={<AdminClientes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
