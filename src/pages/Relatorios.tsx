import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type NaoConformidade = {
  id: string
  item_checklist: string
  descricao: string | null
  status: string
  created_at: string
  condominios?: { nome: string }[]
  vistorias?: { descricao: string }[]
}

type PlanoAcao = {
  id: string
  acao: string
  responsavel: string | null
  prazo: string | null
  status: string
  nao_conformidades?: { item_checklist: string }[]
}

export default function Relatorios() {
  const [ncs, setNcs] = useState<NaoConformidade[]>([])
  const [planos, setPlanos] = useState<PlanoAcao[]>([])

  const carregarRelatorio = async () => {
    const { data: dadosNCs, error: erroNCs } = await supabase
      .from('nao_conformidades')
      .select(`
        id,
        item_checklist,
        descricao,
        status,
        created_at,
        condominios ( nome ),
        vistorias ( descricao )
      `)
      .order('created_at', { ascending: false })

    if (erroNCs) {
      alert('Erro ao carregar não conformidades: ' + erroNCs.message)
      return
    }

    const { data: dadosPlanos, error: erroPlanos } = await supabase
      .from('plano_acao')
      .select(`
        id,
        acao,
        responsavel,
        prazo,
        status,
        nao_conformidades ( item_checklist )
      `)
      .order('created_at', { ascending: false })

    if (erroPlanos) {
      alert('Erro ao carregar planos de ação: ' + erroPlanos.message)
      return
    }

    setNcs((dadosNCs || []) as unknown as NaoConformidade[])
    setPlanos((dadosPlanos || []) as unknown as PlanoAcao[])
  }

  useEffect(() => {
    carregarRelatorio()
  }, [])

  const imprimirPDF = () => {
    window.print()
  }

  const formatarStatusNC = (status: string) => {
    if (status === 'aberta') return 'Aberta'
    if (status === 'andamento') return 'Em andamento'
    if (status === 'concluida') return 'Concluída'
    return status
  }

  const formatarStatusPlano = (status: string) => {
    if (status === 'pendente') return 'Pendente'
    if (status === 'andamento') return 'Em andamento'
    if (status === 'concluido') return 'Concluído'
    return status
  }

  return (
    <>
      <div className="header no-print">
        <h1>Relatórios</h1>
        <p>Relatório técnico das não conformidades e planos de ação.</p>
        <button onClick={imprimirPDF}>Gerar PDF / Imprimir</button>
      </div>

      <div className="card report-area">
        <div className="report-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="Datainsight"
              style={{ height: '60px', objectFit: 'contain' }}
            />

            <div>
              <h1 style={{ margin: 0 }}>Datainsight SST</h1>
              <p style={{ margin: 0 }}>
                Sistema de Vistorias e Gestão de Não Conformidades
              </p>
            </div>
          </div>

          <div className="report-box">
            <strong>Relatório Técnico</strong>
            <br />
            Data: {new Date().toLocaleDateString()}
          </div>
        </div>

        <hr />

        <h2>1. Identificação do Relatório</h2>

        <div className="report-info">
          <p><strong>Empresa/Sistema:</strong> Datainsight SST</p>
          <p><strong>Tipo:</strong> Relatório de inspeção e acompanhamento</p>
          <p><strong>Responsável pela inspeção:</strong> ______________________________</p>
          <p><strong>Condomínio:</strong> {ncs[0]?.condominios?.[0]?.nome || 'Não informado'}</p>
        </div>

        <h2>2. Resumo Executivo</h2>

        <div className="report-summary">
          <div>
            <strong>{ncs.length}</strong>
            <span>Não Conformidades</span>
          </div>

          <div>
            <strong>{planos.length}</strong>
            <span>Planos de Ação</span>
          </div>

          <div>
            <strong>{ncs.filter((n) => n.status === 'aberta').length}</strong>
            <span>NCs Abertas</span>
          </div>

          <div>
            <strong>{planos.filter((p) => p.status === 'pendente').length}</strong>
            <span>Planos Pendentes</span>
          </div>
        </div>

        <h2>3. Não Conformidades Identificadas</h2>

        {ncs.length === 0 ? (
          <p>Nenhuma não conformidade registrada.</p>
        ) : (
          ncs.map((nc, index) => (
            <div key={nc.id} className="report-item">
              <h3>NC {index + 1} — {nc.item_checklist}</h3>
              <p><strong>Condomínio:</strong> {nc.condominios?.[0]?.nome || 'Não informado'}</p>
              <p><strong>Vistoria:</strong> {nc.vistorias?.[0]?.descricao || 'Não informada'}</p>
              <p><strong>Descrição:</strong> {nc.descricao || 'Sem descrição'}</p>
              <p><strong>Status:</strong> {formatarStatusNC(nc.status)}</p>
              <p><strong>Data:</strong> {new Date(nc.created_at).toLocaleDateString()}</p>
            </div>
          ))
        )}

        <h2>4. Planos de Ação</h2>

        {planos.length === 0 ? (
          <p>Nenhum plano de ação registrado.</p>
        ) : (
          planos.map((p, index) => (
            <div key={p.id} className="report-item">
              <h3>Ação {index + 1} — {p.acao}</h3>
              <p><strong>NC relacionada:</strong> {p.nao_conformidades?.[0]?.item_checklist || 'Não informada'}</p>
              <p><strong>Responsável:</strong> {p.responsavel || 'Não informado'}</p>
              <p><strong>Prazo:</strong> {p.prazo ? new Date(p.prazo).toLocaleDateString() : 'Sem prazo'}</p>
              <p><strong>Status:</strong> {formatarStatusPlano(p.status)}</p>
            </div>
          ))
        )}

        <h2>5. Conclusão</h2>

        <p>
          Este relatório apresenta o registro das não conformidades identificadas durante as vistorias,
          bem como os respectivos planos de ação para controle, acompanhamento e correção das falhas.
        </p>

        <div className="signature-area">
          <div>
            <p>________________________________________</p>
            <p>Responsável pela Vistoria</p>
          </div>

          <div>
            <p>________________________________________</p>
            <p>Representante do Condomínio</p>
          </div>
        </div>

        <footer className="report-footer">
          Datainsight SST — Relatório gerado automaticamente pelo sistema
        </footer>
      </div>
    </>
  )
}
