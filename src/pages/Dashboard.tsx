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

    // =========================
    // VERIFICA PERFIL
    // =========================

    const { data: perfil } = await supabase
      .from('perfis')
      .select('tipo')
      .eq('user_id', user.id)
      .single()

    const admin = perfil?.tipo === 'admin'
    setIsAdmin(admin)

    // =========================
    // CONDOMINIOS
    // =========================

    let queryCondominios = supabase
      .from('condominios')
      .select('*', { count: 'exact', head: true })

    if (!admin) {
      queryCondominios = queryCondominios.eq('user_id', user.id)
    }

    const { count: condominios } = await queryCondominios

    // =========================
    // VISTORIAS
    // =========================

    let queryVistorias = supabase
      .from('vistorias')
      .select('*', { count: 'exact', head: true })

    if (!admin) {
      queryVistorias = queryVistorias.eq('user_id', user.id)
    }

    const { count: vistorias } = await queryVistorias

    // =========================
    // NCS
    // =========================

    let queryNCs = supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })

    if (!admin) {
      queryNCs = queryNCs.eq('user_id', user.id)
    }

    const { count: ncs } = await queryNCs

    // =========================
    // NCS ABERTAS
    // =========================

    let queryAbertas = supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'aberta')

    if (!admin) {
      queryAbertas = queryAbertas.eq('user_id', user.id)
    }

    const { count: abertas } = await queryAbertas

    // =========================
    // NCS CONCLUÍDAS
    // =========================

    let queryConcluidas = supabase
      .from('nao_conformidades')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'concluida')

    if (!admin) {
      queryConcluidas = queryConcluidas.eq('user_id', user.id)
    }

    const { count: concluidas } = await queryConcluidas

    // =========================
    // PLANOS
    // =========================

    let queryPlanos = supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })

    if (!admin) {
      queryPlanos = queryPlanos.eq('user_id', user.id)
    }

    const { count: planos } = await queryPlanos

    // =========================
    // PLANOS PENDENTES
    // =========================

    let queryPendentes = supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendente')

    if (!admin) {
      queryPendentes = queryPendentes.eq('user_id', user.id)
    }

    const { count: pendentes } = await queryPendentes

    // =========================
    // PLANOS ATRASADOS
    // =========================

    let queryAtrasados = supabase
      .from('plano_acao')
      .select('*', { count: 'exact', head: true })
      .lt('prazo', hoje)
      .neq('status', 'concluida')

    if (!admin) {
      queryAtrasados = queryAtrasados.eq('user_id', user.id)
    }

    const { count: atrasados } = await queryAtrasados

    // =========================
    // RANKING
    // =========================

    let queryRanking = supabase
      .from('nao_conformidades')
      .select(`
        id,
        condominios (
          nome
        )
      `)

    if (!admin) {
      queryRanking = queryRanking.eq('user_id', user.id)
    }

    const { data: ncsPorCondominio } = await queryRanking

    const mapa: Record<string, number> = {}

    ;(ncsPorCondominio || []).forEach((item: any) => {
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

    setTotalCondominios(condominios || 0)
    setTotalVistorias(vistorias || 0)
    setTotalNCs(ncs || 0)
    setNcsAbertas(abertas || 0)
    setNcsConcluidas(concluidas || 0)
    setTotalPlanos(planos || 0)
    setPlanosPendentes(pendentes || 0)
    setPlanosAtrasados(atrasados || 0)
    setRanking(rankingFormatado)

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
      ? Math.max(...ranking.map((item) => item.total))
      : 1

  const percentualAbertas =
    totalNCs > 0
      ? Math.round((ncsAbertas / totalNCs) * 100)
      : 0

  const percentualConcluidas =
    totalNCs > 0
      ? Math.round((ncsConcluidas / totalNCs) * 100)
      : 0

  const percentualPendentes =
    totalPlanos > 0
      ? Math.round((planosPendentes / totalPlanos) * 100)
      : 0

  const percentualAtrasados =
    totalPlanos > 0
      ? Math.round((planosAtrasados / totalPlanos) * 100)
      : 0

  return (
    <>
      {/* MANTÉM TODO SEU JSX ABAIXO IGUAL */}
    </>
  )
}
