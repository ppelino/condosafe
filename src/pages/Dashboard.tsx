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

  const carregarIndicadores = async () => {
    const hoje = new Date().toISOString().split('T')[0]

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

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

    if (!admin) {
      qCondominios = qCondominios.eq('user_id', user.id)
    }

    const { count: condominios } = await qCondominios

    let qVistorias = supabase
      .from('vistorias')
      .select('*', { count: 'exact', head: true })

    if (!admin) {
      qVistorias = qVistorias.eq('user_id', user.id)
    }

    const { count: vistorias } = await qVistorias

    let qNCs = supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })

    if (!admin) {
      qNCs = qNCs.eq('user_id', user.id)
    }

    const { count: ncs } = await qNCs

    let qAbertas = supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aberta')

    if (!admin) {
      qAbertas = qAbertas.eq('user_id', user.id)
    }

    const { count: abertas } = await qAbertas

    let qConcluidas = supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'concluida')

    if (!admin) {
      qConcluidas = qConcluidas.eq('user_id', user.id)
    }

    const { count: concluidas } = await qConcluidas

    let qPlanos = supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })

    if (!admin) {
      qPlanos = qPlanos.eq('user_id', user.id)
    }

    const { count: planos } = await qPlanos

    let qPendentes = supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente')

    if (!admin) {
      qPendentes = qPendentes.eq('user_id', user.id)
    }

    const { count: pendentes } = await qPendentes

    let qAtrasados = supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })
      .lt('prazo', hoje)
      .neq('status', 'concluida')

    if (!admin) {
      qAtrasados = qAtrasados.eq('user_id', user.id)
    }

    const { count: atrasados } = await qAtrasados

    let qRanking = supabase
      .from('nao_conformidades')
      .select(`
        id,
        condominios (
          nome
        )
      `)

    if (!admin) {
      qRanking = qRanking.eq('user_id', user.id)
    }

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
  }

  useEffect(() => {
    carregarIndicadores()
  }, [])

  const maiorRanking =
    ranking.length > 0
      ? Math.max(...ranking.map((r) => r.total))
      : 1

  const percentualAbertas =
    totalNCs > 0
      ? Math.round((ncsAbertas / totalNCs) * 100)
      : 0

  const percentualConcluidas =
    totalNCs > 0
      ? Math.round((ncsConcluidas / totalNCs) * 100)
      : 0

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
          Indicadores estratégicos de inspeções, conformidade,
          riscos e planos de ação.
        </p>
      </div>

      <div className="cards">
        <div className="card">
          <p>Condomínios</p>
          <h2>{totalCondominios}</h2>
          <small>Empresas monitoradas</small>
        </div>

        <div className="card">
          <p>Vistorias</p>
          <h2>{totalVistorias}</h2>
          <small>Inspeções realizadas</small>
        </div>

        <div className="card">
          <p>Não Conformidades</p>
          <h2>{totalNCs}</h2>
          <small>Ocorrências registradas</small>
        </div>

        <div className="card">
          <p>NCs Abertas</p>
          <h2>{ncsAbertas}</h2>
          <small>{percentualAbertas}% do total</small>
        </div>

        <div className="card">
          <p>NCs Concluídas</p>
          <h2>{ncsConcluidas}</h2>
          <small>{percentualConcluidas}% resolvidas</small>
        </div>

        <div className="card">
          <p>Planos de Ação</p>
          <h2>{totalPlanos}</h2>
          <small>Ações cadastradas</small>
        </div>

        <div className="card">
          <p>Planos Pendentes</p>
          <h2>{planosPendentes}</h2>
          <small>Demandas em aberto</small>
        </div>

        <div className="card">
          <p>Planos Atrasados</p>
          <h2>{planosAtrasados}</h2>
          <small>Exigem atenção</small>
        </div>

        <div className="card">
          <p>Índice de Conformidade</p>
          <h2>{taxaConformidade}%</h2>
          <small>Indicador geral</small>
        </div>
      </div>

      <div className="cards" style={{ marginTop: '24px' }}>
        <div className="card">
          <h3>Distribuição das Não Conformidades</h3>

          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}
              >
                <span>Abertas</span>
                <strong>{percentualAbertas}%</strong>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: '#e5e7eb',
                  borderRadius: '999px',
                }}
              >
                <div
                  style={{
                    width: `${percentualAbertas}%`,
                    height: '10px',
                    background: '#dc2626',
                    borderRadius: '999px',
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}
              >
                <span>Concluídas</span>
                <strong>{percentualConcluidas}%</strong>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: '#e5e7eb',
                  borderRadius: '999px',
                }}
              >
                <div
                  style={{
                    width: `${percentualConcluidas}%`,
                    height: '10px',
                    background: '#16a34a',
                    borderRadius: '999px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Ranking de Risco por Condomínio</h3>

          {ranking.length === 0 ? (
            <p>Nenhuma não conformidade registrada.</p>
          ) : (
            <div style={{ marginTop: '16px' }}>
              {ranking.map((item) => (
                <div
                  key={item.nome}
                  style={{ marginBottom: '14px' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <span>{item.nome}</span>
                    <strong>{item.total}</strong>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '12px',
                      background: '#e5e7eb',
                      borderRadius: '999px',
                    }}
                  >
                    <div
                      style={{
                        width: `${(item.total / maiorRanking) * 100}%`,
                        height: '12px',
                        background: '#2563eb',
                        borderRadius: '999px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
