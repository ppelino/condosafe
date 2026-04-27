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
  }[]
  vistorias?: {
    descricao: string
  }[]
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
      setCarregando(false)
      return
    }

    setNaoConformidades((data || []) as unknown as NaoConformidade[])
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

  return (
    <>
      <div className="header">
        <h1>Não Conformidades</h1>
        <p>Controle das irregularidades encontradas nas vistorias.</p>
      </div>

      <div className="card">
        <h3>Lista de Não Conformidades</h3>

        {carregando ? (
          <p>Carregando...</p>
        ) : naoConformidades.length === 0 ? (
          <p>Nenhuma não conformidade registrada ainda.</p>
        ) : (
          naoConformidades.map((nc) => (
            <div key={nc.id} className="list-item">
              <div>
                <strong>{nc.item_checklist || 'Item não informado'}</strong>
                <br />

                <small>
                  Condomínio: {nc.condominios?.[0]?.nome || 'Não informado'}
                </small>
                <br />

                <small>
                  Vistoria: {nc.vistorias?.[0]?.descricao || 'Não informada'}
                </small>
                <br /><br />

                <span>{nc.descricao}</span>
                <br />

                <small>
                  Criada em: {new Date(nc.created_at).toLocaleDateString()}
                </small>
              </div>

              <div>
                <strong
                  style={{
                    color:
                      nc.status === 'aberta'
                        ? 'red'
                        : nc.status === 'em andamento'
                        ? 'orange'
                        : 'green'
                  }}
                >
                  {nc.status}
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
