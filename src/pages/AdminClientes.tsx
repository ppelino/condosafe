import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Perfil = {
  id: string
  nome: string
  tipo: string
  plano: string
  limite_condominios: number
  limite_usuarios: number
  ativo: boolean
  data_expiracao: string | null
}

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Perfil[]>([])
  const [loading, setLoading] = useState(true)
  const [salvandoId, setSalvandoId] = useState<string | null>(null)

  useEffect(() => {
    carregarClientes()
  }, [])

  const carregarClientes = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .order('nome')

    if (error) {
      alert('Erro ao carregar clientes')
      console.error(error)
      setLoading(false)
      return
    }

    setClientes(
      (data || []).map((cliente) => ({
        ...cliente,
        limite_condominios: cliente.limite_condominios ?? 0,
        limite_usuarios: cliente.limite_usuarios ?? 0,
        ativo: cliente.ativo ?? true,
        data_expiracao: cliente.data_expiracao ?? ''
      }))
    )

    setLoading(false)
  }

  const atualizarCampo = (
    id: string,
    campo: keyof Perfil,
    valor: string | number | boolean
  ) => {
    setClientes((prev) =>
      prev.map((cliente) =>
        cliente.id === id
          ? {
              ...cliente,
              [campo]: valor
            }
          : cliente
      )
    )
  }

  const salvarCliente = async (cliente: Perfil) => {
    setSalvandoId(cliente.id)

    const { error } = await supabase
      .from('perfis')
      .update({
        nome: cliente.nome,
        tipo: cliente.tipo,
        plano: cliente.plano,
        limite_condominios: cliente.limite_condominios,
        limite_usuarios: cliente.limite_usuarios,
        ativo: cliente.ativo,
        data_expiracao:
          cliente.data_expiracao === ''
            ? null
            : cliente.data_expiracao
      })
      .eq('id', cliente.id)

    setSalvandoId(null)

    if (error) {
      alert('Erro ao salvar cliente')
      console.error(error)
      return
    }

    alert('Cliente atualizado com sucesso!')

    carregarClientes()
  }

  if (loading) {
    return <p>Carregando clientes...</p>
  }

  return (
    <div className="page">
      <div className="page-header">
        <span className="badge">
          CondoSafe Inspector
        </span>

        <h1>Administração de Clientes</h1>

        <p>
          Controle de usuários, planos,
          limites, status de acesso e
          vencimento.
        </p>
      </div>

      <div className="card">
        <h2>Clientes / Usuários</h2>

        <div className="clientes-grid">
          {clientes.map((cliente) => (
            <div
              key={cliente.id}
              className="cliente-card"
            >
              <div className="cliente-topo">
                <div>
                  <h3>{cliente.nome}</h3>

                  <small>
                    ID:{' '}
                    {cliente.id.slice(0, 8)}
                    ...
                  </small>
                </div>

                <span
                  className={
                    cliente.ativo
                      ? 'status-ativo'
                      : 'status-inativo'
                  }
                >
                  {cliente.ativo
                    ? 'Ativo'
                    : 'Inativo'}
                </span>
              </div>

              <label>Nome</label>

              <input
                value={cliente.nome}
                onChange={(e) =>
                  atualizarCampo(
                    cliente.id,
                    'nome',
                    e.target.value
                  )
                }
              />

              <label>Tipo</label>

              <select
                value={cliente.tipo}
                onChange={(e) =>
                  atualizarCampo(
                    cliente.id,
                    'tipo',
                    e.target.value
                  )
                }
              >
                <option value="cliente">
                  Cliente
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>

              <label>Plano</label>

              <select
                value={cliente.plano}
                onChange={(e) =>
                  atualizarCampo(
                    cliente.id,
                    'plano',
                    e.target.value
                  )
                }
              >
                <option value="basico">
                  Básico
                </option>

                <option value="intermediario">
                  Intermediário
                </option>

                <option value="premium">
                  Premium
                </option>
              </select>

              <div className="limites-grid">
                <div>
                  <label>
                    Limite Condomínios
                  </label>

                  <input
                    type="number"
                    value={
                      cliente.limite_condominios
                    }
                    onChange={(e) =>
                      atualizarCampo(
                        cliente.id,
                        'limite_condominios',
                        Number(e.target.value)
                      )
                    }
                  />
                </div>

                <div>
                  <label>
                    Limite Usuários
                  </label>

                  <input
                    type="number"
                    value={
                      cliente.limite_usuarios
                    }
                    onChange={(e) =>
                      atualizarCampo(
                        cliente.id,
                        'limite_usuarios',
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
              </div>

              <label>Status</label>

              <select
                value={
                  cliente.ativo
                    ? 'ativo'
                    : 'inativo'
                }
                onChange={(e) =>
                  atualizarCampo(
                    cliente.id,
                    'ativo',
                    e.target.value ===
                      'ativo'
                  )
                }
              >
                <option value="ativo">
                  Ativo
                </option>

                <option value="inativo">
                  Inativo
                </option>
              </select>

              <label>
                Data de vencimento
              </label>

              <input
                type="date"
                value={
                  cliente.data_expiracao ||
                  ''
                }
                onChange={(e) =>
                  atualizarCampo(
                    cliente.id,
                    'data_expiracao',
                    e.target.value
                  )
                }
              />

              <button
                onClick={() =>
                  salvarCliente(cliente)
                }
                disabled={
                  salvandoId === cliente.id
                }
                className="btn-primary"
              >
                {salvandoId === cliente.id
                  ? 'Salvando...'
                  : 'Salvar Cliente'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
