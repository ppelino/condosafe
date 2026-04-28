import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Condominio = {
  id: string
  nome: string
}

type NaoConformidade = {
  id: string
  descricao: string
  criticidade: string
  status: string
  created_at?: string
  condominio_id?: string
  condominios?: {
    nome: string
  }
}

export default function Relatorios() {
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [condominioId, setCondominioId] = useState('')
  const [naoConformidades, setNaoConformidades] = useState<NaoConformidade[]>([])

  const carregarCondominios = async () => {
    const { data, error } = await supabase
      .from('condominios')
      .select('id, nome')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao carregar condomínios:', error)
      return
    }

    setCondominios(data || [])
  }

  const carregarRelatorio = async () => {
    let query = supabase
      .from('nao_conformidades')
      .select(`
        id,
        descricao,
        criticidade,
        status,
        created_at,
        condominio_id,
        condominios (
          nome
        )
      `)
      .order('created_at', { ascending: false })

    if (condominioId) {
      query = query.eq('condominio_id', condominioId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao carregar relatório:', error)
      alert('Erro ao carregar relatório.')
      return
    }

    setNaoConformidades((data || []) as NaoConformidade[])
  }

  const imprimirRelatorio = () => {
    window.print()
  }

  useEffect(() => {
    carregarCondominios()
    carregarRelatorio()
  }, [])

  useEffect(() => {
    carregarRelatorio()
  }, [condominioId])

  return (
    <>
      <div className="header no-print">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Relatórios Técnicos</h1>
        <p>Geração de relatório com não conformidades por condomínio.</p>
      </div>

      <div className="card no-print">
        <h3>Filtro do Relatório</h3>

        <select value={condominioId} onChange={(e) => setCondominioId(e.target.value)}>
          <option value="">Todos os condomínios</option>
          {condominios.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <button onClick={imprimirRelatorio}>Imprimir / Salvar PDF</button>
      </div>

      <div className="card report-area">
        <div className="report-header">
          <h2>Relatório Técnico de Vistoria</h2>
          <p>CondoSafe Inspector — Gestão de Vistorias Técnicas</p>
        </div>

        <hr />

        {naoConformidades.length === 0 ? (
          <p>Nenhuma não conformidade encontrada para o filtro selecionado.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Condomínio</th>
                <th>Descrição</th>
                <th>Criticidade</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {naoConformidades.map((nc) => (
                <tr key={nc.id}>
                  <td>{nc.condominios?.nome || '-'}</td>
                  <td>{nc.descricao}</td>
                  <td>{nc.criticidade}</td>
                  <td>{nc.status}</td>
                  <td>
                    {nc.created_at
                      ? new Date(nc.created_at).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
