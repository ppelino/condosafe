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
    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('condominios')
      .select('*')
      .eq('user_id', userData.user?.id)
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
        .eq('user_id', userData.user?.id)

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

    const { data: userData } = await supabase.auth.getUser() // 🔥 AQUI ESTAVA FALTANDO

    const { error } = await supabase
      .from('condominios')
      .delete()
      .eq('id', id)
      .eq('user_id', userData.user?.id)

    if (error) {
      alert('Erro ao excluir: ' + error.message)
      return
    }

    carregarCondominios()
  }

  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Gestão de Condomínios</h1>
        <p>Cadastro, organização e acompanhamento das unidades atendidas.</p>
      </div>

      <div className="card">
        <h3>{editandoId ? 'Editar Condomínio' : 'Cadastrar Condomínio'}</h3>

        <div className="form-card-grid">
          <div className="form-mini-card">
            <label>Nome do Condomínio</label>
            <input
              placeholder="Ex: Condomínio Safira"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="form-mini-card">
            <label>Cidade</label>
            <input
              placeholder="Ex: Suzano"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>

          <div className="form-mini-card">
            <label>Estado</label>
            <input
              placeholder="Ex: SP"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            />
          </div>
        </div>

        <button onClick={salvarCondominio}>
          {editandoId ? 'Atualizar Condomínio' : 'Salvar Condomínio'}
        </button>

        {editandoId && (
          <button className="btn-secondary" onClick={limparFormulario}>
            Cancelar
          </button>
        )}
      </div>

      <div className="card">
        <h3>Condomínios Cadastrados</h3>

        {condominios.length === 0 ? (
          <p>Nenhum condomínio cadastrado ainda.</p>
        ) : (
          <div className="table-wrapper">
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

                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => editarCondominio(c)}>
                        Editar
                      </button>

                      <button onClick={() => excluirCondominio(c.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className="btn-secondary" onClick={() => window.print()}>
          Imprimir
        </button>
      </div>
    </>
  )
}
