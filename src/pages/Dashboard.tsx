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
  const [taxaConformidade, setTaxaConformidade] = useState(0)

  const carregarIndicadores = async () => {
    const hoje = new Date().toISOString().split('T')[0]

    const { count: condominios } = await supabase
      .from('condominios')
      .select('*', { count: 'exact', head: true })

    const { count: vistorias } = await supabase
      .from('vistorias')
      .select('*', { count: 'exact', head: true })

    const { count: ncs } = await supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })

    const { count: abertas } = await supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aberta')

    const { count: planos } = await supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })

    const { count: pendentes } = await supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente')

    const { count: atrasados } = await supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })
      .lt('prazo', hoje)
      .neq('status', 'concluida')

    setTotalCondominios(condominios || 0)
    setTotalVistorias(vistorias || 0)
    setTotalNCs(ncs || 0)
    setNcsAbertas(abertas || 0)
    setTotalPlanos(planos || 0)
    setPlanosPendentes(pendentes || 0)
    setPlanosAtrasados(atrasados || 0)

    // 📊 Taxa de conformidade
    if (ncs && abertas !== null) {
      const conformes = ncs - abertas
      const taxa = ncs > 0 ? (conformes / ncs) * 100 : 100
      setTaxaConformidade(Number(taxa.toFixed(1)))
    }
  }

  useEffect(() => {
    carregarIndicadores()
  }, [])

  return (
    <>
      <div className="header premium-header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Painel Executivo de Segurança</h1>
        <p>Visão estratégica da gestão de riscos e conformidade.</p>
      </div>

      <div className="cards">

        <div className="card premium-card">
          <span className="card-label">Condomínios</span>
          <div className="card-number">{totalCondominios}</div>
        </div>

        <div className="card premium-card">
          <span className="card-label">Vistorias</span>
          <div className="card-number">{totalVistorias}</div>
        </div>

        <div className="card premium-card">
          <span className="card-label">Não Conformidades</span>
          <div className="card-number">{totalNCs}</div>
        </div>

        <div className="card premium-card alert-card">
          <span className="card-label">NCs Abertas</span>
          <div className="card-number" style={{ color: 'red' }}>
            {ncsAbertas}
          </div>
        </div>

        <div className="card premium-card">
          <span className="card-label">Planos de Ação</span>
          <div className="card-number">{totalPlanos}</div>
        </div>

        <div className="card premium-card warning-card">
          <span className="card-label">Pendentes</span>
          <div className="card-number" style={{ color: 'orange' }}>
            {planosPendentes}
          </div>
        </div>

        <div className="card premium-card danger-card">
          <span className="card-label">Atrasados</span>
          <div className="card-number" style={{ color: 'red' }}>
            {planosAtrasados}
          </div>
        </div>

        <div className="card premium-card">
          <span className="card-label">Conformidade (%)</span>
          <div className="card-number" style={{ color: '#16a34a' }}>
            {taxaConformidade}%
          </div>
        </div>

      </div>
    </>
  )
}
