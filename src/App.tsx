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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

    setEmail('')
    setPassword('')
  }

  const sair = async () => {
    setBloqueado(false)
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <h1 style={styles.logo}>CondoSafe</h1>
          <p style={styles.subtitle}>Carregando sistema...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.badge}>CondoSafe Inspector</div>

          <h1 style={styles.logo}>Acesso ao Sistema</h1>

          <p style={styles.subtitle}>
            Gestão profissional de condomínios, vistorias, não conformidades,
            planos de ação e relatórios técnicos.
          </p>

          <div style={styles.formBox}>
            <label style={styles.label}>E-mail</label>
            <input
              style={styles.input}
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label style={styles.label}>Senha</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin()
              }}
            />

            <button style={styles.primaryButton} onClick={handleLogin}>
              Entrar
            </button>
          </div>

          <div style={styles.infoBox}>
            <strong>Acesso controlado</strong>
            <p>
              Novos usuários devem ser cadastrados e liberados pelo administrador
              do sistema.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (verificandoPlano) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <h1 style={styles.logo}>Verificando Plano...</h1>
          <p style={styles.subtitle}>Aguarde enquanto validamos seu acesso.</p>
        </div>
      </div>
    )
  }

  if (bloqueado) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.badgeDanger}>Acesso bloqueado</div>

          <h1 style={styles.logo}>Plano Expirado</h1>

          <p style={styles.subtitle}>
            Seu acesso foi bloqueado. Entre em contato com o administrador para
            regularizar seu plano.
          </p>

          <button
            style={styles.primaryButton}
            onClick={async () => {
              await sair()
              window.location.reload()
            }}
          >
            Sair
          </button>
        </div>
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

const styles: { [key: string]: React.CSSProperties } = {
  loginPage: {
    minHeight: '100vh',
    width: '100%',
    background:
      'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #eff6ff 45%, #f8fafc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    boxSizing: 'border-box'
  },

  loginCard: {
    width: '100%',
    maxWidth: '460px',
    background: '#ffffff',
    borderRadius: '28px',
    padding: '32px',
    boxShadow: '0 30px 80px rgba(15, 23, 42, 0.22)',
    border: '1px solid rgba(226, 232, 240, 0.9)',
    boxSizing: 'border-box'
  },

  badge: {
    display: 'inline-block',
    padding: '7px 14px',
    borderRadius: '999px',
    background: '#dbeafe',
    color: '#1d4ed8',
    fontWeight: 700,
    fontSize: '13px',
    marginBottom: '14px'
  },

  badgeDanger: {
    display: 'inline-block',
    padding: '7px 14px',
    borderRadius: '999px',
    background: '#fee2e2',
    color: '#b91c1c',
    fontWeight: 700,
    fontSize: '13px',
    marginBottom: '14px'
  },

  logo: {
    margin: 0,
    color: '#0f172a',
    fontSize: 'clamp(28px, 5vw, 38px)',
    lineHeight: 1.1,
    fontWeight: 800
  },

  subtitle: {
    color: '#475569',
    fontSize: '15px',
    lineHeight: 1.5,
    marginTop: '12px',
    marginBottom: '22px'
  },

  formBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  label: {
    fontWeight: 700,
    color: '#1e293b',
    fontSize: '14px',
    marginTop: '6px'
  },

  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#f8fafc'
  },

  primaryButton: {
    width: '100%',
    marginTop: '14px',
    padding: '14px 18px',
    border: 0,
    borderRadius: '14px',
    background: '#2563eb',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.28)'
  },

  infoBox: {
    marginTop: '22px',
    padding: '14px',
    borderRadius: '16px',
    background: '#f1f5f9',
    color: '#334155',
    fontSize: '14px',
    lineHeight: 1.45
  }
}
