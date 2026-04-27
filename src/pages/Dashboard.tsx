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

    // CONDOMÍNIOS
    const { count: countCondominios } = await supabase
      .from('condominios')
      .select('*', { count: 'exact', head: true })

    // VISTORIAS
    const { count: countVistorias } = await supabase
      .from('vistorias')
      .select('*', { count: 'exact', head: true })

    // NÃO CONFORMIDADES
    const { count: countNCs } = await supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })

    const { count: countNCsAbertas } = await supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aberta')

    // PLANOS
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
      <div className="header">
        <h1>Dashboard Executivo</h1>
        <p>Visão geral do CondoSafe</p>
      </div>

      <div className="cards">

        <div className="card">
          <div>Total Condomínios</div>
          <div className="card-number">{totalCondominios}</div>
        </div>

        <div className="card">
          <div>Vistorias</div>
          <div className="card-number">{totalVistorias}</div>
        </div>

        <div className="card">
          <div>Não Conformidades</div>
          <div className="card-number">{totalNCs}</div>
        </div>

        <div className="card">
          <div>NCs Abertas</div>
          <div className="card-number" style={{ color: 'red' }}>
            {ncsAbertas}
          </div>
        </div>

        <div className="card">
          <div>Planos de Ação</div>
          <div className="card-number">{totalPlanos}</div>
        </div>

        <div className="card">
          <div>Planos Pendentes</div>
          <div className="card-number" style={{ color: 'orange' }}>
            {planosPendentes}
          </div>
        </div>

        <div className="card">
          <div>Planos Atrasados</div>
          <div className="card-number" style={{ color: 'red' }}>
            {planosAtrasados}
          </div>
        </div>

      </div>
    </>
  )
}