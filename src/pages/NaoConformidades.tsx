import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type NaoConformidade = {
  id: string
  descricao: string
  status: string
  item_checklist: string | null
  created_at: string

  condominios?: {
    nome: string
  } | null

  vistorias?: {
    descricao: string
  } | null
}

export default function NaoConformidades() {
  const [naoConformidades, setNaoConformidades] = useState<NaoConformidade[]>([])
  const [carregando, setCarregando] = useState(true)

  const carregarNaoConformidades = async () => {
    setCarregando(true)

    const { data, error } = await supabase
      .from('nao_conformidades')
      .select(`
        id,
        descricao,
        status,
        item_checklist,
        created_at,
        condominios:condominio_id (
          nome
        ),
        vistorias:vistoria_id (
          descricao
        )
      `)
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
    const s = status.toLowerCase()

    if (s === 'aberta') return '#dc2626'
    if (s === 'em andamento') return '#f59e0b'
    return '#16a34a'
  }

  return (
    <>
      {/* HEADER */}
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Gestão de Não Conformidades</h1>
        <p>
          Acompanhamento técnico das irregularidades identificadas nas vistorias condominiais.
        </p>
      </div>

      {/* LISTA */}
      <div className="card">
        <h3>Não Conformidades Registradas</h3>

        <p style={{ marginBottom: '16px', color: '#64748b' }}>
          Controle de ocorrências abertas, em andamento e concluídas para apoio ao plano de ação.
        </p>

        {carregando ? (
          <p>Carregando registros...</p>
        ) : naoConformidades.length === 0 ? (
          <p>Nenhuma não conformidade registrada ainda.</p>
        ) : (
          naoConformidades.map((nc) => (
            <div
              key={nc.id}
              className="list-item"
              style={{ borderLeftColor: corStatus(nc.status) }}
            >
              {/* LADO ESQUERDO */}
              <div>
                <strong>{nc.item_checklist || 'Item não informado'}</strong>
                <br />

                <small>
                  <strong>Condomínio:</strong>{' '}
                  {nc.condominios?.nome || 'Não informado'}
                </small>
                <br />

                <small>
                  <strong>Vistoria:</strong>{' '}
                  {nc.vistorias?.descricao || 'Não informada'}
                </small>
                <br /><br />

                <span>{nc.descricao}</span>
                <br />

                <small style={{ color: '#64748b' }}>
                  Registrada em:{' '}
                  {new Date(nc.created_at).toLocaleDateString()}
                </small>
              </div>

              {/* LADO DIREITO */}
              <div>
                <strong
                  style={{
                    color: corStatus(nc.status),
                    textTransform: 'uppercase',
                    fontSize: '13px'
                  }}
                >
                  {nc.status}
                </strong>

                <br /><br />

                <select
                  value={nc.status}
                  onChange={(e) =>
                    atualizarStatus(nc.id, e.target.value)
                  }
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
