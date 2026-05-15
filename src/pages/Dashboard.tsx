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
  const [isAdmin, setIsAdmin] = useState(false)
  const [carregando, setCarregando] = useState(true)

  const carregarIndicadores = async () => {
    setCarregando(true)

    const hoje = new Date().toISOString().split('T')[0]

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setCarregando(false)
      return
    }

    const { data: perfil } = await supabase
      .from('perfis')
      .select('tipo')
      .eq('user_id', user.id)
      .maybeSingle()

    const admin =
      perfil?.tipo === 'admin' ||
      user.email === 'edcondosafe@gmail.com'

    setIsAdmin(admin)

    let qCondominios = supabase
      .from('condominios')
      .select('*', { count: 'exact', head: true })

    if (!admin) qCondominios = qCondominios.eq('user_id', user.id)

    const { count: condominios } = await qCondominios

    let qVistorias = supabase
      .from('vistorias')
      .select('*', { count: 'exact', head: true })

    if (!admin) qVistorias = qVistorias.eq('user_id', user.id)

    const { count: vistorias } = await qVistorias

    let qNCs = supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })

    if (!admin) qNCs = qNCs.eq('user_id', user.id)

    const { count: ncs } = await qNCs

    let qAbertas = supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aberta')

    if (!admin) qAbertas = qAbertas.eq('user_id', user.id)

    const { count: abertas } = await qAbertas

    let qConcluidas = supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'concluida')

    if (!admin) qConcluidas = qConcluidas.eq('user_id', user.id)

    const { count: concluidas } = await qConcluidas

    let qPlanos = supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })

    if (!admin) qPlanos = qPlanos.eq('user_id', user.id)

    const { count: planos } = await qPlanos

    let qPendentes = supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente')

    if (!admin) qPendentes = qPendentes.eq('user_id', user.id)

    const { count: pendentes } = await qPendentes

    let qAtrasados = supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })
      .lt('prazo', hoje)
      .neq('status', 'concluida')

    if (!admin) qAtrasados = qAtrasados.eq('user_id', user.id)

    const { count: atrasados } = await qAtrasados

    let qRanking = supabase
      .from('nao_conformidades')
      .select(`
        id,
        condominios (
          nome
        )
      `)

    if (!admin) qRanking = qRanking.eq('user_id', user.id)

    const { data: rankingData } = await qRanking

    const mapa: Record<string, number> = {}

    ;(rankingData || []).forEach((item: any) => {
      const nome = item.condominios?.nome || 'Não informado'
      mapa[nome] = (mapa[nome] || 0) + 1
    })

    const rankingFormatado = Object.entries(mapa)
      .map(([nome, total]) => ({
        nome,
        total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    setRanking(rankingFormatado)

    setTotalCondominios(condominios || 0)
    setTotalVistorias(vistorias || 0)
    setTotalNCs(ncs || 0)
    setNcsAbertas(abertas || 0)
    setNcsConcluidas(concluidas || 0)
    setTotalPlanos(planos || 0)
    setPlanosPendentes(pendentes || 0)
    setPlanosAtrasados(atrasados || 0)

    const taxa =
      ncs && ncs > 0
        ? ((concluidas || 0) / ncs) * 100
        : 100

    setTaxaConformidade(Number(taxa.toFixed(1)))
    setCarregando(false)
  }

  useEffect(() => {
    carregarIndicadores()
  }, [])

  const maiorRanking =
    ranking.length > 0 ? Math.max(...ranking.map((r) => r.total)) : 1

  const percentualAbertas =
    totalNCs > 0 ? Math.round((ncsAbertas / totalNCs) * 100) : 0

  const percentualConcluidas =
    totalNCs > 0 ? Math.round((ncsConcluidas / totalNCs) * 100) : 0

  const situacaoGeral =
    planosAtrasados > 0
      ? 'Atenção: existem planos de ação atrasados que exigem acompanhamento.'
      : ncsAbertas > 0
      ? 'Existem não conformidades abertas que precisam de tratativa.'
      : 'Situação controlada: não há pendências críticas no momento.'

  const statusConformidade =
    taxaConformidade >= 80
      ? 'Bom'
      : taxaConformidade >= 50
      ? 'Atenção'
      : 'Crítico'

  const maiorRisco =
    ranking.length > 0 ? ranking[0].nome : 'Sem registros'

  const kpiCard = (
    titulo: string,
    valor: number | string,
    descricao: string,
    icone: string,
    destaque?: string
  ) => (
    <div
      className="card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: '135px',
        transition: '0.2s ease',
      }}
    
    >
      <div
        style={{
          position: 'absolute',
          right: '18px',
          top: '18px',
          fontSize: '26px',
          opacity: 0.18,
        }}
      >
        {icone}
      </div>

      <p style={{ color: '#334155', fontWeight: 600 }}>{titulo}</p>

      <h2
        style={{
          fontSize: '34px',
          margin: '6px 0',
          color: destaque || '#0f172a',
        }}
      >
        {valor}
      </h2>

      <small>{descricao}</small>
    </div>
  )

  if (carregando) {
    return (
      <>
        <div className="header">
          <div className="premium-badge">CondoSafe Inspector</div>
          <h1>Dashboard Executivo</h1>
          <p>Carregando indicadores estratégicos...</p>
        </div>

        <div className="card">
          <p>Buscando dados do sistema...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>

        <h1>
          {isAdmin
            ? 'Dashboard Executivo Multiempresa'
            : 'Dashboard Executivo'}
        </h1>

        <p>
          Indicadores estratégicos de inspeções, conformidade, riscos e planos
          de ação.
        </p>
      </div>

      <div
        className="card"
        style={{
          borderLeft: planosAtrasados > 0 ? '5px solid #dc2626' : '5px solid #16a34a',
          background: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div>
            <h3>Situação Geral</h3>
            <p style={{ color: '#475569' }}>{situacaoGeral}</p>
          </div>

          <div>
            <strong>Conformidade</strong>
            <h2 style={{ color: taxaConformidade >= 80 ? '#16a34a' : taxaConformidade >= 50 ? '#f59e0b' : '#dc2626' }}>
              {taxaConformidade}% — {statusConformidade}
            </h2>
          </div>

          <div>
            <strong>Maior risco atual</strong>
            <p style={{ marginTop: '8px' }}>{maiorRisco}</p>
          </div>
        </div>
      </div>

      <div className="cards">
        {kpiCard('Condomínios', totalCondominios, 'Empresas monitoradas', '🏢')}

        {kpiCard('Vistorias', totalVistorias, 'Inspeções realizadas', '📋')}

        {kpiCard('Não Conformidades', totalNCs, 'Ocorrências registradas', '⚠️')}

        {kpiCard(
          'NCs Abertas',
          ncsAbertas,
          `${percentualAbertas}% do total`,
          '🔴',
          ncsAbertas > 0 ? '#dc2626' : '#0f172a'
        )}

        {kpiCard(
          'NCs Concluídas',
          ncsConcluidas,
          `${percentualConcluidas}% resolvidas`,
          '✅',
          '#16a34a'
        )}

        {kpiCard('Planos de Ação', totalPlanos, 'Ações cadastradas', '🛠️')}

        {kpiCard(
          'Planos Pendentes',
          planosPendentes,
          'Demandas em aberto',
          '🕒',
          planosPendentes > 0 ? '#f59e0b' : '#0f172a'
        )}

        {kpiCard(
          'Planos Atrasados',
          planosAtrasados,
          'Exigem atenção',
          '⏰',
          planosAtrasados > 0 ? '#dc2626' : '#16a34a'
        )}

        {kpiCard(
          'Índice de Conformidade',
          `${taxaConformidade}%`,
          'Indicador geral',
          '📈',
          taxaConformidade >= 80 ? '#16a34a' : taxaConformidade >= 50 ? '#f59e0b' : '#dc2626'
        )}
      </div>

      <div className="dashboard-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <h3>Distribuição das Não Conformidades</h3>
          <p style={{ color: '#64748b', marginBottom: '18px' }}>
            Comparativo entre ocorrências abertas e concluídas.
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
          <h3>Ranking de Risco por Condomínio</h3>
          <p style={{ color: '#64748b', marginBottom: '18px' }}>
            Condomínios com maior volume de não conformidades.
          </p>

          {ranking.length === 0 ? (
            <p>Nenhuma não conformidade registrada.</p>
          ) : (
            ranking.map((item, index) => (
              <div className="ranking-item" key={item.nome}>
                <div className="ranking-top">
                  <div>
                    <strong>
                      {index + 1}. {item.nome}
                    </strong>
                    <small>{item.total} ocorrência(s)</small>
                  </div>

                  <strong>{item.total}</strong>
                </div>

                <div className="bar-track">
                  <div
                    className="bar-fill primary"
                    style={{
                      width: `${(item.total / maiorRanking) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
