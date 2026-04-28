import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Plano = {
  id: string
  acao: string
  responsavel: string
  prazo: string
  status: string
  nao_conformidade_id?: string
}

export default function PlanoAcao() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [acao, setAcao] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [prazo, setPrazo] = useState('')
  const [status, setStatus] = useState('pendente')

  const carregarPlanos = async () => {
    const { data, error } = await supabase
      .from('planos_acao')
      .select('*')
      .order('prazo', { ascending: true })

    if (error) {
      console.error('Erro ao carregar plano de ação:', error)
      return
    }

    setPlanos(data || [])
  }

  const salvarPlano = async () => {
    if (!acao || !responsavel || !prazo) {
      alert('Preencha ação, responsável e prazo.')
      return
    }

    const { error } = await supabase.from('planos_acao').insert({
      acao,
      responsavel,
      prazo,
      status,
    })

    if (error) {
      console.error('Erro ao salvar plano:', error)
      alert('Erro ao salvar plano de ação.')
      return
    }

    setAcao('')
    setResponsavel('')
    setPrazo('')
    setStatus('pendente')
    carregarPlanos()
  }

  const atualizarStatus = async (id: string, novoStatus: string) => {
    const { error } = await supabase
      .from('planos_acao')
      .update({ status: novoStatus })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar status:', error)
      return
    }

    carregarPlanos()
  }

  useEffect(() => {
    carregarPlanos()
  }, [])

  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Plano de Ação</h1>
        <p>Controle das ações corretivas geradas a partir das vistorias técnicas.</p>
      </div>

      <div className="card">
        <h3>Nova Ação Corretiva</h3>

        <input
          placeholder="Ação corretiva"
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
          <option value="pendente">Pendente</option>
          <option value="andamento">Em andamento</option>
          <option value="concluida">Concluída</option>
        </select>

        <button onClick={salvarPlano}>Salvar Plano de Ação</button>
      </div>

      <div className="card">
        <h3>Ações Registradas</h3>

        {planos.length === 0 ? (
          <p>Nenhuma ação registrada.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ação</th>
                  <th>Responsável</th>
                  <th>Prazo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {planos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.acao}</td>
                    <td>{p.responsavel}</td>
                    <td>{p.prazo}</td>
                    <td>
                      <select
                        value={p.status}
                        onChange={(e) => atualizarStatus(p.id, e.target.value)}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="andamento">Em andamento</option>
                        <option value="concluida">Concluída</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
