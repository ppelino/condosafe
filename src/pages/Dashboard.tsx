import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [totalCondominios, setTotalCondominios] = useState(0)
  const [totalVistorias, setTotalVistorias] = useState(0)
  const [totalNCs, setTotalNCs] = useState(0)
  const [ncsAbertas, setNcsAbertas] = useState(0)
  const [totalPlanos, setTotalPlanos] = useState(0)
  const [planosPendentes, setPlanosPendentes] = useState(0)
  const [planosAtrasados, setPlanosAtrasados] = useState(0)

  const carregarIndicadores = async () => {
    const hoje = new Date().toISOString().split('T')[0]

    const { count: countCondominios } = await supabase
      .from('condominios')
      .select('*', { count: 'exact', head: true })

    const { count: countVistorias } = await supabase
      .from('vistorias')
      .select('*', { count: 'exact', head: true })

    const { count: countNCs } = await supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })

    const { count: countNCsAbertas } = await supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aberta')

    const { count: countPlanos } = await supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })

    const { count: countPlanosPendentes } = await supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente')

    const { count: countPlanosAtrasados } = await supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })
      .lt('prazo', hoje)
      .neq('status', 'concluido')

    setTotalCondominios(countCondominios || 0)
    setTotalVistorias(countVistorias || 0)
    setTotalNCs(countNCs || 0)
    setNcsAbertas(countNCsAbertas || 0)
    setTotalPlanos(countPlanos || 0)
    setPlanosPendentes(countPlanosPendentes || 0)
    setPlanosAtrasados(countPlanosAtrasados || 0)
  }

  useEffect(() => {
    carregarIndicadores()
  }, [])

  return (
    <>
      <div className="header premium-header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Painel Executivo de Segurança Condominial</h1>
        <p>
          Controle técnico de vistorias, não conformidades e planos de ação corretiva.
        </p>
      </div>

      <div className="cards">

        <div className="card premium-card">
          <span className="card-label">Condomínios Monitorados</span>
          <div className="card-number">{totalCondominios}</div>
          <small>Unidades cadastradas no sistema</small>
        </div>

        <div className="card premium-card">
          <span className="card-label">Vistorias Realizadas</span>
          <div className="card-number">{totalVistorias}</div>
          <small>Inspeções registradas</small>
        </div>

        <div className="card premium-card">
          <span className="card-label">Não Conformidades Identificadas</span>
          <div className="card-number">{totalNCs}</div>
          <small>Ocorrências técnicas apontadas</small>
        </div>

        <div className="card premium-card alert-card">
          <span className="card-label">NCs Abertas</span>
          <div className="card-number" style={{ color: 'red' }}>
            {ncsAbertas}
          </div>
          <small>Pendentes de tratativa</small>
        </div>

        <div className="card premium-card">
          <span className="card-label">Planos de Ação</span>
          <div className="card-number">{totalPlanos}</div>
          <small>Ações corretivas cadastradas</small>
        </div>

        <div className="card premium-card warning-card">
          <span className="card-label">Planos Pendentes</span>
          <div className="card-number" style={{ color: 'orange' }}>
            {planosPendentes}
          </div>
          <small>Aguardando execução</small>
        </div>

        <div className="card premium-card danger-card">
          <span className="card-label">Planos Atrasados</span>
          <div className="card-number" style={{ color: 'red' }}>
            {planosAtrasados}
          </div>
          <small>Exigem atenção imediata</small>
        </div>

      </div>
    </>
  )
}
