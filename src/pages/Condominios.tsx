import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Condominio = {
  id: string
  nome: string
  cidade: string
  estado: string
}

export default function Condominios() {
  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const carregarCondominios = async () => {
    const { data, error } = await supabase
      .from('condominios')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Erro ao carregar condomínios: ' + error.message)
      return
    }

    setCondominios(data || [])
  }

  useEffect(() => {
    carregarCondominios()
  }, [])

  const limparFormulario = () => {
    setNome('')
    setCidade('')
    setEstado('')
    setEditandoId(null)
  }

  const salvarCondominio = async () => {
    if (!nome || !cidade || !estado) {
      alert('Preencha nome, cidade e estado.')
      return
    }

    const { data: userData } = await supabase.auth.getUser()

    if (editandoId) {
      const { error } = await supabase
        .from('condominios')
        .update({ nome, cidade, estado })
        .eq('id', editandoId)

      if (error) {
        alert('Erro ao editar: ' + error.message)
        return
      }
    } else {
      const { error } = await supabase.from('condominios').insert([
        {
          nome,
          cidade,
          estado,
          user_id: userData.user?.id
        }
      ])

      if (error) {
        alert('Erro ao salvar: ' + error.message)
        return
      }
    }

    limparFormulario()
    carregarCondominios()
  }

  const editarCondominio = (c: Condominio) => {
    setEditandoId(c.id)
    setNome(c.nome)
    setCidade(c.cidade)
    setEstado(c.estado)
  }

  const excluirCondominio = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este condomínio?')) return

    const { error } = await supabase
      .from('condominios')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Erro ao excluir: ' + error.message)
      return
    }

    carregarCondominios()
  }

  return (
    <>
      <div className="header">
        <h1>Condomínios</h1>
        <p>Cadastro e gestão dos condomínios atendidos.</p>
      </div>

      <div className="card">
        <h3>{editandoId ? 'Editar Condomínio' : 'Cadastrar Condomínio'}</h3>

        <div className="form-grid">
          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />

          <input
            placeholder="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          />
        </div>

        <br />

        <button onClick={salvarCondominio}>
          {editandoId ? 'Atualizar' : 'Salvar'}
        </button>

        {editandoId && (
          <button className="btn-secondary" onClick={limparFormulario}>
            Cancelar edição
          </button>
        )}
      </div>

      <div className="card">
        <h3>Condomínios cadastrados</h3>

        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cidade</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {condominios.map((c) => (
              <tr key={c.id}>
                <td>{c.nome}</td>
                <td>{c.cidade}</td>
                <td>{c.estado}</td>
                <td>
                  <button onClick={() => editarCondominio(c)}>Editar</button>
                  <button
                    className="btn-danger"
                    onClick={() => excluirCondominio(c.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <br />

        <button className="btn-secondary" onClick={() => window.print()}>
          Imprimir
        </button>
      </div>
    </>
  )
}