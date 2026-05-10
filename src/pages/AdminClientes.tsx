import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Perfil = {
  id: string
  user_id: string
  nome: string | null
  tipo: string | null
  plano: string | null
  limite_condominios: number | null
  limite_usuarios: number | null
  ativo: boolean | null
  data_expiracao: string | null
}

export default function AdminClientes() {
  const [perfis, setPerfis] = useState<Perfil[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvandoId, setSalvandoId] = useState<string | null>(null)

  const carregarPerfis = async () => {
    setCarregando(true)

    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      alert('Erro ao carregar clientes: ' + error.message)
      setCarregando(false)
      return
    }

    setPerfis(data || [])
    setCarregando(false)
  }

  useEffect(() => {
    carregarPerfis()
  }, [])

  const atualizarCampo = (
    id: string,
    campo: keyof Perfil,
    valor: string | number | boolean | null
  ) => {
    setPerfis((lista) =>
      lista.map((p) =>
        p.id === id
          ? {
              ...p,
              [campo]: valor
            }
          : p
      )
    )
  }

  const salvarPerfil = async (perfil: Perfil) => {
    setSalvandoId(perfil.id)

    const { error } = await supabase
      .from('perfis')
      .update({
        nome: perfil.nome,
        tipo: perfil.tipo,
        plano: perfil.plano,
        limite_condominios: perfil.limite_condominios,
        limite_usuarios: perfil.limite_usuarios,
        ativo: perfil.ativo,
        data_expiracao: perfil.data_expiracao || null
      })
      .eq('id', perfil.id)

    setSalvandoId(null)

    if (error) {
      alert('Erro ao salvar cliente: ' + error.message)
      return
    }

    alert('Cliente atualizado com sucesso!')
    carregarPerfis()
  }

  const aplicarPlano = (id: string, plano: string) => {
    if (plano === 'basico') {
      atualizarCampo(id, 'plano', 'basico')
      atualizarCampo(id, 'limite_condominios', 1)
      atualizarCampo(id, 'limite_usuarios', 1)
    }

    if (plano === 'profissional') {
      atualizarCampo(id, 'plano', 'profissional')
      atualizarCampo(id, 'limite_condominios', 5)
      atualizarCampo(id, 'limite_usuarios', 3)
    }

    if (plano === 'premium') {
      atualizarCampo(id, 'plano', 'premium')
      atualizarCampo(id, 'limite_condominios', 15)
      atualizarCampo(id, 'limite_usuarios', 10)
    }

    if (plano === 'admin') {
      atualizarCampo(id, 'plano', 'admin')
      atualizarCampo(id, 'limite_condominios', 999)
      atualizarCampo(id, 'limite_usuarios', 999)
    }
  }

  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Administração de Clientes</h1>
        <p>
          Controle de usuários, planos, limites, status de acesso e vencimento.
        </p>
      </div>

      <div className="card">
        <h3>Clientes / Usuários</h3>

        {carregando ? (
          <p>Carregando clientes...</p>
        ) : perfis.length === 0 ? (
          <p>Nenhum perfil cadastrado.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Plano</th>
                  <th>Limite Condomínios</th>
                  <th>Limite Usuários</th>
                  <th>Ativo</th>
                  <th>Vencimento</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {perfis.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <input
                        value={p.nome || ''}
                        onChange={(e) =>
                          atualizarCampo(p.id, 'nome', e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <select
                        value={p.tipo || 'cliente'}
                        onChange={(e) =>
                          atualizarCampo(p.id, 'tipo', e.target.value)
                        }
                      >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td>
                      <select
                        value={p.plano || 'basico'}
                        onChange={(e) => aplicarPlano(p.id, e.target.value)}
                      >
                        <option value="basico">Básico</option>
                        <option value="profissional">Profissional</option>
                        <option value="premium">Premium</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td>
                      <input
                        type="number"
                        value={p.limite_condominios ?? 0}
                        onChange={(e) =>
                          atualizarCampo(
                            p.id,
                            'limite_condominios',
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>

                    <td>
                      <input
                        type="number"
                        value={p.limite_usuarios ?? 0}
                        onChange={(e) =>
                          atualizarCampo(
                            p.id,
                            'limite_usuarios',
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>

                    <td>
                      <select
                        value={p.ativo ? 'true' : 'false'}
                        onChange={(e) =>
                          atualizarCampo(p.id, 'ativo', e.target.value === 'true')
                        }
                      >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    </td>

                    <td>
                      <input
                        type="date"
                        value={
                          p.data_expiracao
                            ? p.data_expiracao.substring(0, 10)
                            : ''
                        }
                        onChange={(e) =>
                          atualizarCampo(
                            p.id,
                            'data_expiracao',
                            e.target.value || null
                          )
                        }
                      />
                    </td>

                    <td>
                      <button
                        onClick={() => salvarPerfil(p)}
                        disabled={salvandoId === p.id}
                      >
                        {salvandoId === p.id ? 'Salvando...' : 'Salvar'}
                      </button>
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
