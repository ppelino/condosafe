import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import Planos from './pages/Planos'

function AdminRoute({ user }: { user: User }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const verificarAdmin = async () => {
      if (user.email === 'edcondosafe@gmail.com') {
        setIsAdmin(true)
        setChecking(false)
        return
      }

      const { data: perfil } = await supabase
        .from('perfis')
        .select('tipo')
        .eq('user_id', user.id)
        .maybeSingle()

      setIsAdmin(perfil?.tipo === 'admin')
      setChecking(false)
    }

    verificarAdmin()
  }, [user])

  if (checking) return <p>Verificando permissão...</p>

  if (!isAdmin) return <Navigate to="/" replace />

  return <AdminClientes />
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modoCadastro, setModoCadastro] = useState(false)
  const [loading, setLoading] = useState(true)
  const [bloqueado, setBloqueado] = useState(false)
  const [verificandoPlano, setVerificandoPlano] = useState(false)

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
      setBloqueado(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const verificarExpiracao = async () => {
      if (!user) return

      setVerificandoPlano(true)

      if (user.email === 'edcondosafe@gmail.com') {
        setBloqueado(false)
        setVerificandoPlano(false)
        return
      }

      const { data: perfil, error } = await supabase
        .from('perfis')
        .select('ativo, data_expiracao')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Erro ao verificar plano:', error)
        setVerificandoPlano(false)
        return
      }

      if (!perfil) {
        setBloqueado(true)
        setVerificandoPlano(false)
        return
      }

      if (perfil.ativo === false) {
        setBloqueado(true)
        setVerificandoPlano(false)
        return
      }

      if (perfil.data_expiracao) {
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        const vencimento = new Date(perfil.data_expiracao + 'T00:00:00')
        vencimento.setHours(0, 0, 0, 0)

        if (vencimento < hoje) {
          setBloqueado(true)
          setVerificandoPlano(false)
          return
        }
      }

      setBloqueado(false)
      setVerificandoPlano(false)
    }

    verificarExpiracao()
  }, [user])

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert(error.message)
      return
    }

    setNome('')
    setEmail('')
    setPassword('')
  }

  const handleCadastro = async () => {
    if (!nome || !email || !password) {
      alert('Preencha nome, email e senha.')
      return
    }

    if (password.length < 6) {
      alert('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome
        }
      }
    })

    if (error) {
      alert(error.message)
      return
    }

    alert('Cadastro criado com sucesso! Agora você já pode acessar o sistema.')

    setModoCadastro(false)
    setNome('')
    setEmail('')
    setPassword('')
  }

  const sair = async () => {
    setBloqueado(false)
    await supabase.auth.signOut()
  }

  if (loading) return <p>Carregando...</p>

  if (!user) {
    return (
      <div className="login-page">
        <h1>CondoSafe</h1>

        <p>
          {modoCadastro
            ? 'Crie sua conta para iniciar o teste grátis.'
            : 'Acesse sua conta para continuar.'}
        </p>

        {modoCadastro && (
          <>
            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <br />
            <br />
          </>
        )}

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

        {modoCadastro ? (
          <button onClick={handleCadastro}>Criar Conta</button>
        ) : (
          <button onClick={handleLogin}>Entrar</button>
        )}

        <br />
        <br />

        <button
          type="button"
          onClick={() => {
            setModoCadastro(!modoCadastro)
            setNome('')
            setEmail('')
            setPassword('')
          }}
          style={{
            background: 'transparent',
            color: '#2563eb',
            boxShadow: 'none'
          }}
        >
          {modoCadastro
            ? 'Já tenho conta'
            : 'Criar nova conta'}
        </button>
      </div>
    )
  }

  if (verificandoPlano) {
    return (
      <div className="login-page">
        <h1>Verificando Plano...</h1>
      </div>
    )
  }

  if (bloqueado) {
    return (
      <div className="login-page">
        <h1>Plano Expirado</h1>

        <p>Seu acesso foi bloqueado.</p>

        <p>Entre em contato com o administrador.</p>

        <button
          onClick={async () => {
            await sair()
            window.location.reload()
          }}
        >
          Sair
        </button>
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
          <Route path="planos" element={<Planos />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="admin-clientes" element={<AdminRoute user={user} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
