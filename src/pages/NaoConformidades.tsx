import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type NaoConformidade = {
  id: string
  descricao: string | null
  status: string
  item_checklist: string | null
  created_at: string
}

export default function NaoConformidades() {
  const [naoConformidades, setNaoConformidades] = useState<NaoConformidade[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregarNaoConformidades = async () => {
    setCarregando(true)

    const { data, error } = await supabase
      .from('nao_conformidades')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Erro ao carregar não conformidades: ' + error.message)
      setCarregando(false)
      return
    }

    setNaoConformidades(data || [])
    setCarregando(false)
  }

  useEffect(() => {
    carregarNaoConformidades()
  }, [])

  const atualizarStatus = async (id: string, novoStatus: string) => {
    const { error } = await supabase
      .from('nao_conformidades')
      .update({ status: novoStatus })
      .eq('id', id)

    if (error) {
      alert('Erro ao atualizar status: ' + error.message)
      return
    }

    carregarNaoConformidades()
  }

  const corStatus = (status: string) => {
    if (status === 'aberta') return '#dc2626'
    if (status === 'em andamento') return '#f59e0b'
    return '#16a34a'
  }

  const textoStatus = (status: string) => {
    if (status === 'aberta') return 'Aberta'
    if (status === 'em andamento') return 'Em andamento'
    if (status === 'concluida') return 'Concluída'
    return status
  }

  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Gestão de Não Conformidades</h1>
        <p>
          Acompanhamento técnico das irregularidades identificadas nas vistorias.
        </p>
      </div>

      <div className="card">
        <h3>Não Conformidades Registradas</h3>

        {carregando ? (
          <p>Carregando...</p>
        ) : naoConformidades.length === 0 ? (
          <p>Nenhuma não conformidade registrada.</p>
        ) : (
          naoConformidades.map((nc) => (
            <div
              key={nc.id}
              className="list-item"
              style={{ borderLeftColor: corStatus(nc.status) }}
            >
              <div>
                <strong>{nc.item_checklist || 'Item não informado'}</strong>
                <br />

                <span>{nc.descricao || 'Sem descrição'}</span>
                <br />

                <small style={{ color: '#64748b' }}>
                  {new Date(nc.created_at).toLocaleDateString()}
                </small>
              </div>

              <div>
                <strong
                  style={{
                    color: corStatus(nc.status),
                    textTransform: 'uppercase',
                    fontSize: '13px'
                  }}
                >
                  {textoStatus(nc.status)}
                </strong>

                <br /><br />

                <select
                  value={nc.status}
                  onChange={(e) => atualizarStatus(nc.id, e.target.value)}
                >
                  <option value="aberta">Aberta</option>
                  <option value="em andamento">Em andamento</option>
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
