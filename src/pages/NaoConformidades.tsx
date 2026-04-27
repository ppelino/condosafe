import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type NaoConformidade = {
  id: string
  item_checklist: string
  descricao: string | null
  status: 'aberta' | 'andamento' | 'concluida'
  created_at: string
  condominios?: {
    nome: string
  }
  vistorias?: {
    descricao: string
  }
}

export default function NaoConformidades() {
  const [naoConformidades, setNaoConformidades] = useState<NaoConformidade[]>([])

  const carregarNaoConformidades = async () => {
    const { data, error } = await supabase
      .from('nao_conformidades')
      .select(`
        id,
        item_checklist,
        descricao,
        status,
        created_at,
        condominios (
          nome
        ),
        vistorias (
          descricao
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      alert('Erro ao carregar não conformidades: ' + error.message)
      return
    }

    setNaoConformidades((data || []) as NaoConformidade[])
  }

  useEffect(() => {
    carregarNaoConformidades()
  }, [])

  const atualizarStatus = async (
    id: string,
    novoStatus: 'aberta' | 'andamento' | 'concluida'
  ) => {
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

  const formatarStatus = (status: string) => {
    if (status === 'aberta') return '🔴 Aberta'
    if (status === 'andamento') return '🟠 Em andamento'
    if (status === 'concluida') return '🟢 Concluída'
    return status
  }

  const corStatus = (status: string) => {
    if (status === 'aberta') return '#e53935'
    if (status === 'andamento') return '#fb8c00'
    if (status === 'concluida') return '#43a047'
    return '#333'
  }

  return (
    <>
      <div className="header">
        <h1>Não Conformidades</h1>
        <p>Controle das falhas geradas automaticamente pelos checklists NOK.</p>
      </div>

      <div className="card">
        {/* 🔥 contador aqui */}
        <h3>Lista de Não Conformidades ({naoConformidades.length})</h3>

        {naoConformidades.length === 0 ? (
          <p>Nenhuma não conformidade registrada ainda.</p>
        ) : (
          naoConformidades.map((nc) => (
            <div key={nc.id} className="list-item">
              <div>
                <strong>{nc.item_checklist}</strong>
                <br />
                Condomínio: {nc.condominios?.nome || 'Não informado'}
                <br />
                Vistoria: {nc.vistorias?.descricao || 'Não informada'}
                <br />
                Observação: {nc.descricao || 'Sem descrição'}
                <br />
                Data: {new Date(nc.created_at).toLocaleDateString()}
              </div>

              <div>
                <strong
                  style={{
                    color: corStatus(nc.status),
                    fontWeight: 'bold'
                  }}
                >
                  {formatarStatus(nc.status)}
                </strong>

                <br /><br />

                <select
                  value={nc.status}
                  onChange={(e) =>
                    atualizarStatus(
                      nc.id,
                      e.target.value as 'aberta' | 'andamento' | 'concluida'
                    )
                  }
                >
                  <option value="aberta">🔴 Aberta</option>
                  <option value="andamento">🟠 Em andamento</option>
                  <option value="concluida">🟢 Concluída</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}