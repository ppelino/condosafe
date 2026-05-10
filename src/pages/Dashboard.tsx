import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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
      perfil?.tipo === 'admin' || user.email === 'edcondosafe@gmail.com'

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

    setTotalCondominios(condominios || 0)
    setTotalVistorias(vistorias || 0)
    setTotalNCs(ncs || 0)
    setNcsAbertas(abertas || 0)
    setNcsConcluidas(concluidas || 0)
    setTotalPlanos(planos || 0)
    setPlanosPendentes(pendentes || 0)
    setPlanosAtrasados(atrasados || 0)

    const taxa = ncs && ncs > 0 ? ((concluidas || 0) / ncs) * 100 : 100
    setTaxaConformidade(Number(taxa.toFixed(1)))
  }

  useEffect(() => {
    carregarIndicadores()
  }, [])

  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Painel Executivo de Segurança Condominial</h1>
        <p>
          Visão estratégica das vistorias, não conformidades, planos de ação e
          riscos por condomínio.
        </p>
      </div>

      <div className="cards">
        <div className="card">
          <p>Condomínios Monitorados</p>
          <h2>{totalCondominios}</h2>
          <small>Unidades cadastradas</small>
        </div>

        <div className="card">
          <p>Vistorias Realizadas</p>
          <h2>{totalVistorias}</h2>
          <small>Inspeções registradas</small>
        </div>

        <div className="card">
          <p>Não Conformidades</p>
          <h2>{totalNCs}</h2>
          <small>Ocorrências identificadas</small>
        </div>

        <div className="card">
          <p>NCs Abertas</p>
          <h2>{ncsAbertas}</h2>
          <small>Pendentes de tratativa</small>
        </div>

        <div className="card">
          <p>NCs Concluídas</p>
          <h2>{ncsConcluidas}</h2>
          <small>Ocorrências resolvidas</small>
        </div>

        <div className="card">
          <p>Planos de Ação</p>
          <h2>{totalPlanos}</h2>
          <small>Ações corretivas cadastradas</small>
        </div>

        <div className="card">
          <p>Planos Pendentes</p>
          <h2>{planosPendentes}</h2>
          <small>Aguardando execução</small>
        </div>

        <div className="card">
          <p>Planos Atrasados</p>
          <h2>{planosAtrasados}</h2>
          <small>Exigem atenção imediata</small>
        </div>

        <div className="card">
          <p>Índice de Conformidade</p>
          <h2>{taxaConformidade}%</h2>
          <small>NCs concluídas sobre o total</small>
        </div>
      </div>
    </>
  )
}
