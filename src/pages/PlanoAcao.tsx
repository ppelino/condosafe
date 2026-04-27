import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type NaoConformidade = {
  id: string
  item_checklist: string
}

type PlanoAcaoItem = {
  id: string
  acao: string
  responsavel: string | null
  prazo: string | null
  status: 'pendente' | 'andamento' | 'concluido'
  created_at: string
  nao_conformidades?: {
    item_checklist: string
  }[]
}

export default function PlanoAcao() {
  const [ncs, setNcs] = useState<NaoConformidade[]>([])
  const [planos, setPlanos] = useState<PlanoAcaoItem[]>([])

  const [naoConformidadeId, setNaoConformidadeId] = useState('')
  const [acao, setAcao] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [prazo, setPrazo] = useState('')

  const carregarNCs = async () => {
    const { data, error } = await supabase
      .from('nao_conformidades')
      .select('id, item_checklist')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Erro ao carregar NCs: ' + error.message)
      return
    }

    setNcs(data || [])
  }

  const carregarPlanos = async () => {
    const { data, error } = await supabase
      .from('plano_acao')
      .select(`
        id,
        acao,
        responsavel,
        prazo,
        status,
        created_at,
        nao_conformidades (
          item_checklist
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      alert('Erro ao carregar planos: ' + error.message)
      return
    }

    setPlanos((data || []) as unknown as PlanoAcaoItem[])
  }

  useEffect(() => {
    carregarNCs()
    carregarPlanos()
  }, [])

  const salvarPlano = async () => {
    if (!naoConformidadeId || !acao) {
      alert('Selecione a não conformidade e descreva a ação corretiva.')
      return
    }

    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from('plano_acao').insert([
      {
        nao_conformidade_id: naoConformidadeId,
        acao,
        responsavel,
        prazo: prazo || null,
        status: 'pendente',
        user_id: userData.user?.id
      }
    ])

    if (error) {
      alert('Erro ao salvar plano: ' + error.message)
      return
    }

    alert('Plano de ação salvo!')
    setNaoConformidadeId('')
    setAcao('')
    setResponsavel('')
    setPrazo('')
    carregarPlanos()
  }

  const atualizarStatus = async (
    id: string,
    novoStatus: 'pendente' | 'andamento' | 'concluido'
  ) => {
    const { error } = await supabase
      .from('plano_acao')
      .update({ status: novoStatus })
      .eq('id', id)

    if (error) {
      alert('Erro ao atualizar status: ' + error.message)
      return
    }

    carregarPlanos()
  }

  const corStatus = (status: string) => {
    if (status === 'pendente') return '#e53935'
    if (status === 'andamento') return '#fb8c00'
    if (status === 'concluido') return '#43a047'
    return '#333'
  }

  const formatarStatus = (status: string) => {
    if (status === 'pendente') return '🔴 Pendente'
    if (status === 'andamento') return '🟠 Em andamento'
    if (status === 'concluido') return '🟢 Concluído'
    return status
  }

  return (
    <>
      <div className="header">
        <h1>Plano de Ação</h1>
        <p>Criação e acompanhamento das ações corretivas das não conformidades.</p>
      </div>

      <div className="card">
        <h3>Novo Plano de Ação</h3>

        <select
          value={naoConformidadeId}
          onChange={(e) => setNaoConformidadeId(e.target.value)}
        >
          <option value="">Selecione a não conformidade</option>
          {ncs.map((nc) => (
            <option key={nc.id} value={nc.id}>
              {nc.item_checklist}
            </option>
          ))}
        </select>

        <br /><br />

        <input
          placeholder="Ação corretiva"
          value={acao}
          onChange={(e) => setAcao(e.target.value)}
        />

        <br /><br />

        <input
          placeholder="Responsável"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
        />

        <br /><br />

        <input
          type="date"
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
        />

        <br /><br />

        <button onClick={salvarPlano}>Salvar Plano</button>
      </div>

      <div className="card">
        <h3>Planos de Ação ({planos.length})</h3>

        {planos.length === 0 ? (
          <p>Nenhum plano de ação registrado ainda.</p>
        ) : (
          planos.map((p) => (
            <div key={p.id} className="list-item">
              <div>
                <strong>{p.acao}</strong>
                <br />
                NC: {p.nao_conformidades?.[0]?.item_checklist || 'Não informada'}
                <br />
                Responsável: {p.responsavel || 'Não informado'}
                <br />
                Prazo: {p.prazo ? new Date(p.prazo).toLocaleDateString() : 'Sem prazo'}
              </div>

              <div>
                <strong style={{ color: corStatus(p.status), fontWeight: 'bold' }}>
                  {formatarStatus(p.status)}
                </strong>

                <br /><br />

                <select
                  value={p.status}
                  onChange={(e) =>
                    atualizarStatus(
                      p.id,
                      e.target.value as 'pendente' | 'andamento' | 'concluido'
                    )
                  }
                >
                  <option value="pendente">🔴 Pendente</option>
                  <option value="andamento">🟠 Em andamento</option>
                  <option value="concluido">🟢 Concluído</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
