import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Plano = {
  id: string
  nao_conformidade_id: string
  acao: string
  responsavel: string
  prazo: string
  status: string
}

type NaoConformidade = {
  id: string
  descricao: string | null
  item_checklist: string | null
}

export default function PlanoAcao() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [naoConformidades, setNaoConformidades] = useState<NaoConformidade[]>([])

  const [naoConformidadeId, setNaoConformidadeId] = useState('')
  const [acao, setAcao] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [prazo, setPrazo] = useState('')
  const [status, setStatus] = useState('pendente')
  const [salvando, setSalvando] = useState(false)

  const carregarPlanos = async () => {
    const { data, error } = await supabase
      .from('plano_acao')
      .select('*')
      .order('prazo', { ascending: true })

    if (error) {
      alert('Erro ao carregar plano de ação: ' + error.message)
      return
    }

    setPlanos(data || [])
  }

  const carregarNaoConformidades = async () => {
    const { data, error } = await supabase
      .from('nao_conformidades')
      .select('id, descricao, item_checklist')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Erro ao carregar não conformidades: ' + error.message)
      return
    }

    setNaoConformidades(data || [])
  }

  const salvarPlano = async () => {
    const acaoLimpa = acao.trim()
    const responsavelLimpo = responsavel.trim()

    if (!naoConformidadeId) {
      alert('Selecione uma não conformidade.')
      return
    }

    if (!acaoLimpa || !responsavelLimpo || !prazo) {
      alert('Preencha ação, responsável e prazo.')
      return
    }

    setSalvando(true)

    const { error } = await supabase.from('plano_acao').insert([
      {
        nao_conformidade_id: naoConformidadeId,
        acao: acaoLimpa,
        responsavel: responsavelLimpo,
        prazo,
        status // agora só pendente ou concluida
      }
    ])

    setSalvando(false)

    if (error) {
      alert('Erro ao salvar plano de ação:\n\n' + error.message)
      return
    }

    setNaoConformidadeId('')
    setAcao('')
    setResponsavel('')
    setPrazo('')
    setStatus('pendente')

    carregarPlanos()
  }

  const atualizarStatus = async (id: string, novoStatus: string) => {
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
    if (status === 'pendente') return '#dc2626'
    return '#16a34a'
  }

  const textoStatus = (status: string) => {
    if (status === 'pendente') return 'Pendente'
    if (status === 'concluida') return 'Concluída'
    return status
  }

  useEffect(() => {
    carregarPlanos()
    carregarNaoConformidades()
  }, [])

  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Plano de Ação Corretiva</h1>
      </div>

      <div className="card">
        <h3>Nova Ação Corretiva</h3>

        <select
          value={naoConformidadeId}
          onChange={(e) => setNaoConformidadeId(e.target.value)}
        >
          <option value="">Selecione a não conformidade</option>

          {naoConformidades.map((nc) => (
            <option key={nc.id} value={nc.id}>
              {nc.item_checklist || nc.descricao}
            </option>
          ))}
        </select>

        <input
          placeholder="Descreva a ação corretiva"
          value={acao}
          onChange={(e) => setAcao(e.target.value)}
        />

        <input
          placeholder="Responsável"
          value={responsavel}
          onChange={(e) => setResponsavel(e.target.value)}
        />

        <input
          type="date"
          value={prazo}
          onChange={(e) => setPrazo(e.target.value)}
        />

        {/* 🔥 AGORA SÓ 2 STATUS */}
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pendente">🔴 Pendente</option>
          <option value="concluida">🟢 Concluída</option>
        </select>

        <button onClick={salvarPlano} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Plano de Ação'}
        </button>
      </div>

      <div className="card">
        <h3>Ações Registradas ({planos.length})</h3>

        {planos.map((p) => (
          <div
            key={p.id}
            className="list-item"
            style={{ borderLeftColor: corStatus(p.status) }}
          >
            <div>
              <strong>{p.acao}</strong>
              <br />
              <small><strong>Responsável:</strong> {p.responsavel}</small>
              <br />
              <small>
                <strong>Prazo:</strong>{' '}
                {new Date(p.prazo + 'T00:00:00').toLocaleDateString('pt-BR')}
              </small>
            </div>

            <div>
              <strong style={{ color: corStatus(p.status) }}>
                {textoStatus(p.status)}
              </strong>

              <br /><br />

              <select
                value={p.status}
                onChange={(e) => atualizarStatus(p.id, e.target.value)}
              >
                <option value="pendente">Pendente</option>
                <option value="concluida">Concluída</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
