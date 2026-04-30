import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type RankingCondominio = {
  nome: string
  total: number
}

export default function Dashboard() {
  const [totalCondominios, setTotalCondominios] = useState(0)
  const [totalVistorias, setTotalVistorias] = useState(0)
  const [totalNCs, setTotalNCs] = useState(0)
  const [ncsAbertas, setNcsAbertas] = useState(0)
  const [ncsConcluidas, setNcsConcluidas] = useState(0)
  const [totalPlanos, setTotalPlanos] = useState(0)
  const [planosPendentes, setPlanosPendentes] = useState(0)
  const [planosAtrasados, setPlanosAtrasados] = useState(0)
  const [taxaConformidade, setTaxaConformidade] = useState(0)
  const [ranking, setRanking] = useState<RankingCondominio[]>([])

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

    const { count: concluidas } = await supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'concluida')

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

    const { data: ncsPorCondominio } = await supabase
      .from('nao_conformidades')
      .select(`
        id,
        condominio:condominios (
          nome
        )
      `)

    const mapa: Record<string, number> = {}

    ;(ncsPorCondominio || []).forEach((item: any) => {
      const nome = item.condominio?.nome || 'Não informado'
      mapa[nome] = (mapa[nome] || 0) + 1
    })

    const rankingFormatado = Object.entries(mapa)
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    setTotalCondominios(condominios || 0)
    setTotalVistorias(vistorias || 0)
    setTotalNCs(ncs || 0)
    setNcsAbertas(abertas || 0)
    setNcsConcluidas(concluidas || 0)
    setTotalPlanos(planos || 0)
    setPlanosPendentes(pendentes || 0)
    setPlanosAtrasados(atrasados || 0)
    setRanking(rankingFormatado)

    const taxa = ncs && ncs > 0 ? ((concluidas || 0) / ncs) * 100 : 100
    setTaxaConformidade(Number(taxa.toFixed(1)))
  }

  useEffect(() => {
    carregarIndicadores()
  }, [])

  const maiorRanking =
    ranking.length > 0 ? Math.max(...ranking.map((item) => item.total)) : 1

  const percentualAbertas =
    totalNCs > 0 ? Math.round((ncsAbertas / totalNCs) * 100) : 0

  const percentualConcluidas =
    totalNCs > 0 ? Math.round((ncsConcluidas / totalNCs) * 100) : 0

  const percentualPendentes =
    totalPlanos > 0 ? Math.round((planosPendentes / totalPlanos) * 100) : 0

  const percentualAtrasados =
    totalPlanos > 0 ? Math.round((planosAtrasados / totalPlanos) * 100) : 0

  return (
    <>
      <div className="header premium-header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Painel Executivo de Segurança Condominial</h1>
        <p>
          Visão estratégica das vistorias, não conformidades, planos de ação e riscos por condomínio.
        </p>
      </div>

      <div className="cards">
        <div className="card premium-card">
          <span className="card-label">Condomínios Monitorados</span>
          <div className="card-number">{totalCondominios}</div>
          <small>Unidades cadastradas</small>
        </div>

        <div className="card premium-card">
          <span className="card-label">Vistorias Realizadas</span>
          <div className="card-number">{totalVistorias}</div>
          <small>Inspeções registradas</small>
        </div>

        <div className="card premium-card">
          <span className="card-label">Não Conformidades</span>
          <div className="card-number">{totalNCs}</div>
          <small>Ocorrências identificadas</small>
        </div>

        <div className="card premium-card alert-card">
          <span className="card-label">NCs Abertas</span>
          <div className="card-number" style={{ color: '#dc2626' }}>
            {ncsAbertas}
          </div>
          <small>Pendentes de tratativa</small>
        </div>

        <div className="card premium-card">
          <span className="card-label">NCs Concluídas</span>
          <div className="card-number" style={{ color: '#16a34a' }}>
            {ncsConcluidas}
          </div>
          <small>Ocorrências resolvidas</small>
        </div>

        <div className="card premium-card">
          <span className="card-label">Planos de Ação</span>
          <div className="card-number">{totalPlanos}</div>
          <small>Ações corretivas cadastradas</small>
        </div>

        <div className="card premium-card warning-card">
          <span className="card-label">Planos Pendentes</span>
          <div className="card-number" style={{ color: '#f59e0b' }}>
            {planosPendentes}
          </div>
          <small>Aguardando execução</small>
        </div>

        <div className="card premium-card danger-card">
          <span className="card-label">Planos Atrasados</span>
          <div className="card-number" style={{ color: '#dc2626' }}>
            {planosAtrasados}
          </div>
          <small>Exigem atenção imediata</small>
        </div>

        <div className="card premium-card">
          <span className="card-label">Índice de Conformidade</span>
          <div className="card-number" style={{ color: '#16a34a' }}>
            {taxaConformidade}%
          </div>
          <small>NCs concluídas sobre o total</small>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Gráfico — Status das Não Conformidades</h3>
          <p style={{ marginBottom: '16px', color: '#64748b' }}>
            Distribuição percentual das ocorrências abertas e concluídas.
          </p>

          <div className="chart-row">
            <span>Abertas</span>
            <div className="bar-track">
              <div
                className="bar-fill danger"
                style={{ width: `${percentualAbertas}%` }}
              />
            </div>
            <strong>{percentualAbertas}%</strong>
          </div>

          <div className="chart-row">
            <span>Concluídas</span>
            <div className="bar-track">
              <div
                className="bar-fill success"
                style={{ width: `${percentualConcluidas}%` }}
              />
            </div>
            <strong>{percentualConcluidas}%</strong>
          </div>
        </div>

        <div className="card">
          <h3>Gráfico — Status dos Planos de Ação</h3>
          <p style={{ marginBottom: '16px', color: '#64748b' }}>
            Percentual de planos pendentes e atrasados.
          </p>

          <div className="chart-row">
            <span>Pendentes</span>
            <div className="bar-track">
              <div
                className="bar-fill warning"
                style={{ width: `${percentualPendentes}%` }}
              />
            </div>
            <strong>{percentualPendentes}%</strong>
          </div>

          <div className="chart-row">
            <span>Atrasados</span>
            <div className="bar-track">
              <div
                className="bar-fill danger"
                style={{ width: `${percentualAtrasados}%` }}
              />
            </div>
            <strong>{percentualAtrasados}%</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Gráfico — Ranking de Risco por Condomínio</h3>
        <p style={{ marginBottom: '16px', color: '#64748b' }}>
          Condomínios com maior número de não conformidades registradas.
        </p>

        {ranking.length === 0 ? (
          <p>Nenhum dado suficiente para gerar ranking.</p>
        ) : (
          ranking.map((item, index) => {
            const largura = Math.max(12, Math.round((item.total / maiorRanking) * 100))

            return (
              <div key={item.nome} className="ranking-item">
                <div className="ranking-top">
                  <strong>
                    {index + 1}º — {item.nome}
                  </strong>

                  <strong style={{ color: '#dc2626', fontSize: '22px' }}>
                    {item.total}
                  </strong>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill primary"
                    style={{ width: `${largura}%` }}
                  />
                </div>

                <small>Total de não conformidades registradas</small>
              </div>
            )
          })
        )}
      </div>

      <div className="card">
        <h3>Leitura Executiva</h3>

        <p style={{ color: '#475569', lineHeight: 1.6 }}>
          {planosAtrasados > 0
            ? `Atenção: existem ${planosAtrasados} plano(s) de ação atrasado(s), exigindo prioridade de acompanhamento.`
            : 'Não há planos de ação atrasados no momento.'}
        </p>

        <p style={{ color: '#475569', lineHeight: 1.6, marginTop: '8px' }}>
          {ncsAbertas > 0
            ? `Existem ${ncsAbertas} não conformidade(s) aberta(s), indicando necessidade de tratativa técnica.`
            : 'Não há não conformidades abertas no momento.'}
        </p>
      </div>
    </>
  )
}
