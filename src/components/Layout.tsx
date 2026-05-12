import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Layout() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const verificarAdmin = async () => {
      setIsAdmin(false)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      if (user.email === 'edcondosafe@gmail.com') {
        setIsAdmin(true)
        return
      }

      const { data: perfil, error } = await supabase
        .from('perfis')
        .select('tipo')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Erro ao verificar perfil:', error)
        setIsAdmin(false)
        return
      }

      setIsAdmin(perfil?.tipo === 'admin')
    }

    verificarAdmin()
  }, [])

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true)
    }

    window.addEventListener('pwa-update-available', handleUpdateAvailable)

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable)
    }
  }, [])

  const logout = async () => {
    setIsAdmin(false)
    await supabase.auth.signOut()
  }

  const atualizarApp = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()

      for (const registration of registrations) {
        await registration.update()
      }
    }

    window.location.reload()
  }

  return (
    <div className="app-layout">
      <div className="sidebar">
        <h2>CondoSafe</h2>

        <Link to="/">Dashboard</Link>
        <Link to="/condominios">Condomínios</Link>
        <Link to="/vistorias">Vistorias</Link>
        <Link to="/nao-conformidades">Não Conformidades</Link>
        <Link to="/plano-acao">Plano de Ação</Link>
        <Link to="/relatorios">Relatórios</Link>
        <Link to="/planos">Planos</Link>

        {isAdmin && (
          <Link to="/admin-clientes">Admin / Clientes</Link>
        )}

        <Link to="/configuracoes">Configurações</Link>

        <br />
        <button onClick={logout}>Sair</button>
      </div>

      <div className="main">
        {updateAvailable && (
          <div
            className="no-print"
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <strong>Nova versão disponível.</strong>

            <button onClick={atualizarApp}>
              Atualizar agora
            </button>
          </div>
        )}

        <Outlet />
      </div>
    </div>
  )
}
