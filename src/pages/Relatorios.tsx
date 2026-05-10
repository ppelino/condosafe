import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Foto = {
  id: string
  nao_conformidade_id: string
  foto_url: string
  created_at?: string
}

type NaoConformidade = {
  id: string
  item_checklist: string
  descricao: string | null
  status: string
  created_at: string
  user_id?: string
  fotos?: Foto[]
  condominio?: {
    nome: string
  } | null
  vistoria?: {
    descricao: string
  } | null
}

type PlanoAcao = {
  id: string
  acao: string
  responsavel: string | null
  prazo: string | null
  status: string
  user_id?: string
}

export default function Relatorios() {
  const [ncs, setNcs] = useState<NaoConformidade[]>([])
  const [planos, setPlanos] = useState<PlanoAcao[]>([])
  const [isAdmin, setIsAdmin] = useState(false)

  const verificarPerfil = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data: perfil } = await supabase
      .from('perfis')
      .select('tipo')
      .eq('user_id', user.id)
      .single()

    const admin = perfil?.tipo === 'admin'
    setIsAdmin(admin)

    return admin
  }

  const carregarRelatorio = async (adminAtual = isAdmin) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // =========================
    // NÃO CONFORMIDADES
    // =========================

    let queryNCs = supabase
      .from('nao_conformidades')
      .select(`
        id,
        item_checklist,
        descricao,
        status,
        created_at,
        user_id,
        condominio:condominios (
          nome
        ),
        vistoria:vistorias (
          descricao
        )
      `)
      .order('created_at', { ascending: false })

    if (!adminAtual) {
      queryNCs = queryNCs.eq('user_id', user.id)
    }

    const { data: dadosNCs, error: erroNCs } = await queryNCs

    if (erroNCs) {
      alert('Erro ao carregar não conformidades: ' + erroNCs.message)
      return
    }

    // =========================
    // FOTOS
    // =========================

    const { data: dadosFotos, error: erroFotos } = await supabase
      .from('nao_conformidade_fotos')
      .select('*')
      .order('created_at', { ascending: true })

    if (erroFotos) {
      alert('Erro ao carregar fotos das não conformidades: ' + erroFotos.message)
      return
    }

    const ncsComFotos = ((dadosNCs || []) as unknown as NaoConformidade[]).map(
      (nc) => ({
        ...nc,
        fotos: (dadosFotos || []).filter(
          (foto) => foto.nao_conformidade_id === nc.id
        )
      })
    )

    // =========================
    // PLANOS
    // =========================

    let queryPlanos = supabase
      .from('plano_acao')
      .select(`
        id,
        acao,
        responsavel,
        prazo,
        status,
        user_id
      `)
      .order('prazo', { ascending: true })

    if (!adminAtual) {
      queryPlanos = queryPlanos.eq('user_id', user.id)
    }

    const { data: dadosPlanos, error: erroPlanos } = await queryPlanos

    if (erroPlanos) {
      alert('Erro ao carregar planos de ação: ' + erroPlanos.message)
      return
    }

    setNcs(ncsComFotos)
    setPlanos((dadosPlanos || []) as PlanoAcao[])
  }

  const carregarTudo = async () => {
    const adminAtual = await verificarPerfil()
    await carregarRelatorio(adminAtual)
  }

  useEffect(() => {
    carregarTudo()
  }, [])

  const imprimirPDF = () => {
    window.print()
  }

  const formatarStatusNC = (status: string) => {
    if (status === 'aberta') return 'Aberta'
    if (status === 'andamento') return 'Em andamento'
    if (status === 'em andamento') return 'Em andamento'
    if (status === 'concluida') return 'Concluída'
    return status
  }

  const formatarStatusPlano = (status: string) => {
    if (status === 'pendente') return 'Pendente'
    if (status === 'andamento') return 'Em andamento'
    if (status === 'em andamento') return 'Em andamento'
    if (status === 'concluida') return 'Concluída'
    if (status === 'concluido') return 'Concluído'
    return status
  }

  const ncsAbertas = ncs.filter((n) => n.status === 'aberta').length

  const planosPendentes = planos.filter(
    (p) => p.status === 'pendente'
  ).length

  const planosConcluidos = planos.filter(
    (p) =>
      p.status === 'concluida' ||
      p.status === 'concluido'
  ).length

  const condominioNome =
    ncs[0]?.condominio?.nome || 'Não informado'

  return (
    <>
      {/* MANTÉM TODO O JSX DO SEU RELATÓRIO ABAIXO IGUAL */}
    </>
  )
}
