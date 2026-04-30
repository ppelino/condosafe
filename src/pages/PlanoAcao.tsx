import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Plano = {
  id: string
  acao: string
  responsavel: string
  prazo: string
  status: string
}

export default function PlanoAcao() {
  const [planos, setPlanos] = useState<Plano[]>([])
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
      console.error('Erro ao carregar plano de ação:', error)
      alert(`Erro ao carregar plano de ação: ${error.message}`)
      return
    }

    setPlanos(data || [])
  }

  const salvarPlano = async () => {
    const acaoLimpa = acao.trim()
    const responsavelLimpo = responsavel.trim()
    const statusLimpo = status.trim().toLowerCase()

    if (!acaoLimpa || !responsavelLimpo || !prazo) {
      alert('Preencha ação, responsável e prazo.')
      return
    }

    if (
      statusLimpo !== 'pendente' &&
      statusLimpo !== 'andamento' &&
      statusLimpo !== 'concluida'
    ) {
      alert('Status inválido. Use: pendente, andamento ou concluida.')
      return
    }

    setSalvando(true)

    const { error } = await supabase.from('plano_acao').insert([
      {
        acao: acaoLimpa,
        responsavel: responsavelLimpo,
        prazo,
        status: statusLimpo
      }
    ])

    setSalvando(false)

    if (error) {
      console.error('Erro ao salvar plano:', error)

      alert(
        `Erro ao salvar plano de ação.\n\nDetalhe técnico: ${error.message}`
      )

      return
    }

    setAcao('')
    setResponsavel('')
    setPrazo('')
    setStatus('pendente')
    carregarPlanos()
  }

  const atualizarStatus = async (id: string, novoStatus: string) => {
    const statusLimpo = novoStatus.trim().toLowerCase()

    const { error } = await supabase
      .from('plano_acao')
      .update({ status: statusLimpo })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar status:', error)
      alert(`Erro ao atualizar status: ${error.message}`)
      return
    }

    carregarPlanos()
  }

  const corStatus = (status: string) => {
    if (status === 'pendente') return '#dc2626'
    if (status === 'andamento') return '#f59e0b'
    return '#16a34a'
  }

  const textoStatus = (status: string) => {
    if (status === 'pendente') return 'Pendente'
    if (status === 'andamento') return 'Em andamento'
    if (status === 'concluida') return 'Concluída'
    return status
  }

  useEffect(() => {
    carregarPlanos()
  }, [])

  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Plano de Ação Corretiva</h1>
        <p>
          Controle e acompanhamento das ações corretivas geradas a partir das
          vistorias.
        </p>
      </div>

      <div className="card">
        <h3>Nova Ação Corretiva</h3>

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

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pendente">🔴 Pendente</option>
          <option value="andamento">🟠 Em andamento</option>
          <option value="concluida">🟢 Concluída</option>
        </select>

        <button onClick={salvarPlano} disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Plano de Ação'}
        </button>
      </div>

      <div className="card">
        <h3>Ações Registradas ({planos.length})</h3>

        {planos.length === 0 ? (
          <p>Nenhuma ação registrada.</p>
        ) : (
          planos.map((p) => (
            <div
              key={p.id}
              className="list-item"
              style={{ borderLeftColor: corStatus(p.status) }}
            >
              <div>
                <strong>{p.acao}</strong>
                <br />

                <small>
                  <strong>Responsável:</strong> {p.responsavel}
                </small>
                <br />

                <small>
                  <strong>Prazo:</strong>{' '}
                  {p.prazo
                    ? new Date(p.prazo + 'T00:00:00').toLocaleDateString(
                        'pt-BR'
                      )
                    : 'Não definido'}
                </small>
              </div>

              <div>
                <strong
                  style={{
                    color: corStatus(p.status),
                    textTransform: 'uppercase',
                    fontSize: '13px'
                  }}
                >
                  {textoStatus(p.status)}
                </strong>

                <br />
                <br />

                <select
                  value={p.status}
                  onChange={(e) => atualizarStatus(p.id, e.target.value)}
                >
                  <option value="pendente">Pendente</option>
                  <option value="andamento">Em andamento</option>
                  <option value="concluida">Concluída</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
