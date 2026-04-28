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
        status
      `)
      .order('prazo', { ascending: true })

    if (erroPlanos) {
      alert('Erro ao carregar planos de ação: ' + erroPlanos.message)
      return
    }

    setNcs((dadosNCs || []) as unknown as NaoConformidade[])
    setPlanos((dadosPlanos || []) as PlanoAcao[])
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
  const planosPendentes = planos.filter((p) => p.status === 'pendente').length
  const planosConcluidos = planos.filter(
    (p) => p.status === 'concluida' || p.status === 'concluido'
  ).length

  const condominioNome = ncs[0]?.condominios?.[0]?.nome || 'Não informado'

  return (
    <>
      <div className="header no-print">
        <div className="premium-badge">CondoSafe Inspector</div>

        <h1>Relatório Técnico de Inspeção</h1>
        <p>
          Documento técnico gerado automaticamente com base nas vistorias,
          não conformidades e planos de ação corretiva.
        </p>

        <br />
        <button onClick={imprimirPDF}>Gerar PDF / Imprimir</button>
      </div>

      <div className="card report-area">
        <div className="report-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="/logo.png"
              alt="Datainsight"
              style={{ height: '60px', objectFit: 'contain' }}
            />

            <div>
              <h1 style={{ margin: 0 }}>Datainsight SST</h1>
              <p style={{ margin: 0 }}>
                CondoSafe Inspector — Gestão de Segurança Condominial
              </p>
            </div>
          </div>

          <div className="report-box">
            <strong>RELATÓRIO TÉCNICO DE INSPEÇÃO</strong>
            <br />
            <small>Vistorias • Não Conformidades • Plano de Ação</small>
            <br />
            <br />
            <strong>Emissão:</strong> {new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="report-info">
          <p>
            <strong>Finalidade:</strong> apresentar a análise técnica das condições
            observadas durante a vistoria, incluindo não conformidades identificadas
            e respectivos planos de ação corretiva.
          </p>
          <p>
            <strong>Metodologia:</strong> inspeção visual técnica baseada em checklist
            estruturado, registro de evidências e acompanhamento das ações corretivas.
          </p>
        </div>

        <h2>1. Identificação do Relatório</h2>

        <div className="report-info">
          <p><strong>Condomínio:</strong> {condominioNome}</p>
          <p><strong>Responsável pela vistoria:</strong> ____________________________</p>
          <p><strong>Data de emissão:</strong> {new Date().toLocaleDateString()}</p>
          <p><strong>Tipo de documento:</strong> Relatório de inspeção, não conformidades e plano de ação</p>
        </div>

        <h2>2. Resumo Executivo</h2>

        <div className="report-summary">
          <div>
            <strong>{ncs.length}</strong>
            <span>Não Conformidades</span>
          </div>

          <div>
            <strong>{ncsAbertas}</strong>
            <span>NCs Abertas</span>
          </div>

          <div>
            <strong>{planos.length}</strong>
            <span>Planos de Ação</span>
          </div>

          <div>
            <strong>{planosPendentes}</strong>
            <span>Planos Pendentes</span>
          </div>
        </div>

        <div className="report-info">
          <p>
            <strong>Situação geral:</strong>{' '}
            {ncsAbertas > 0 || planosPendentes > 0
              ? 'Existem pendências que exigem acompanhamento, tratativa e controle dos prazos.'
              : 'Não há pendências críticas registradas no momento.'}
          </p>
          <p><strong>Planos concluídos:</strong> {planosConcluidos}</p>
        </div>

        <h2>3. Não Conformidades Identificadas</h2>

        {ncs.length === 0 ? (
          <div className="report-info">
            <p>Nenhuma não conformidade registrada.</p>
          </div>
        ) : (
          ncs.map((nc, index) => (
            <div key={nc.id} className="report-item">
              <h3 style={{ color: '#dc2626' }}>
                NC {index + 1} — {nc.item_checklist}
              </h3>

              <p><strong>Condomínio:</strong> {nc.condominios?.[0]?.nome || 'Não informado'}</p>
              <p><strong>Vistoria:</strong> {nc.vistorias?.[0]?.descricao || 'Não informada'}</p>
              <p><strong>Descrição:</strong> {nc.descricao || 'Sem descrição'}</p>
              <p><strong>Classificação:</strong> Não conforme</p>
              <p><strong>Status:</strong> {formatarStatusNC(nc.status)}</p>
              <p><strong>Data do registro:</strong> {new Date(nc.created_at).toLocaleDateString()}</p>
            </div>
          ))
        )}

        <h2>4. Planos de Ação Corretiva</h2>

        {planos.length === 0 ? (
          <div className="report-info">
            <p>Nenhum plano de ação registrado.</p>
          </div>
        ) : (
          planos.map((p, index) => (
            <div key={p.id} className="report-item">
              <h3>Ação {index + 1} — {p.acao}</h3>

              <p><strong>Responsável:</strong> {p.responsavel || 'Não informado'}</p>
              <p>
                <strong>Prazo:</strong>{' '}
                {p.prazo ? new Date(p.prazo).toLocaleDateString() : 'Sem prazo definido'}
              </p>
              <p><strong>Status:</strong> {formatarStatusPlano(p.status)}</p>
            </div>
          ))
        )}

        <h2>5. Recomendações Técnicas</h2>

        <div className="report-info">
          <p>
            Recomenda-se que as não conformidades identificadas sejam tratadas com prioridade,
            considerando a segurança dos usuários, a prevenção de acidentes e a manutenção
            das condições adequadas do ambiente.
          </p>
          <p>
            Os planos de ação devem ser acompanhados periodicamente até sua conclusão,
            com registro das evidências de correção e validação das medidas executadas.
          </p>
        </div>

        <h2>6. Conclusão</h2>

        <div className="report-info">
          <p>
            Este relatório apresenta os registros técnicos das não conformidades identificadas
            durante as vistorias, bem como os respectivos planos de ação para controle,
            acompanhamento e correção das falhas observadas.
          </p>
          <p>
            As pendências apontadas devem ser acompanhadas até sua regularização,
            mantendo histórico técnico das ações executadas.
          </p>
        </div>

        <div className="signature-area">
          <div>
            <p>________________________________________</p>
            <p>Responsável Técnico</p>
          </div>

          <div>
            <p>________________________________________</p>
            <p>Representante do Condomínio</p>
          </div>
        </div>

        <footer className="report-footer">
          Datainsight SST — Relatório gerado automaticamente pelo CondoSafe Inspector
        </footer>
      </div>
    </>
  )
}
