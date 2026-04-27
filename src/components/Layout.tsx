import { Link, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Layout() {
  const logout = async () => {
    await supabase.auth.signOut()
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
        <Link to="/configuracoes">Configurações</Link>

        <br />
        <button onClick={logout}>Sair</button>
      </div>

      <div className="main">
        <Outlet />
      </div>
    </div>
  )
}