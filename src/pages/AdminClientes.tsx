import { useEffect, useMemo, useState } from 'react'
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
  const [filtro, setFiltro] = useState('todos')

  const normalizarDataISO = (data: string | null) => {
    if (!data) return ''
    return data.substring(0, 10)
  }

  const verificarAtivoPorData = (data: string | null) => {
    if (!data) return true

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    const vencimento = new Date(data + 'T00:00:00')
    vencimento.setHours(0, 0, 0, 0)

    return vencimento >= hoje
  }

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

    const perfisFormatados = (data || []).map((p) => ({
      ...p,
      data_expiracao: normalizarDataISO(p.data_expiracao)
    }))

    setPerfis(perfisFormatados)
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
        p.id === id ? { ...p, [campo]: valor } : p
      )
    )
  }

  const salvarPerfil = async (perfil: Perfil) => {
    setSalvandoId(perfil.id)

    const dataISO = perfil.data_expiracao
      ? perfil.data_expiracao.substring(0, 10)
      : null

    const ativoCalculado = verificarAtivoPorData(dataISO)

    const { data, error } = await supabase
      .from('perfis')
      .update({
        nome: perfil.nome,
        tipo: perfil.tipo,
        plano: perfil.plano,
        limite_condominios: Number(perfil.limite_condominios ?? 0),
        limite_usuarios: Number(perfil.limite_usuarios ?? 0),
        ativo: ativoCalculado,
        data_expiracao: dataISO
      })
      .eq('id', perfil.id)
      .select()
      .single()

    setSalvandoId(null)

    if (error) {
      alert('Erro ao salvar cliente: ' + error.message)
      return
    }

    if (!data) {
      alert('Nenhum cliente atualizado.')
      return
    }

    alert('Cliente atualizado!')
    await carregarPerfis()
  }

  const excluirPerfil = async (id: string) => {
    const confirmar = confirm(
      'Deseja realmente excluir este perfil?'
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('perfis')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Erro ao excluir perfil.')
      return
    }

    await carregarPerfis()
  }

  const alterarStatusRapido = async (
    id: string,
    novoStatus: boolean
  ) => {
    const { error } = await supabase
      .from('perfis')
      .update({
        ativo: novoStatus
      })
      .eq('id', id)

    if (error) {
      alert('Erro ao alterar status.')
      return
    }

    await carregarPerfis()
  }

  const aplicarPlano = (id: string, plano: string) => {
    atualizarCampo(id, 'plano', plano)

    if (plano === 'basico') {
      atualizarCampo(id, 'limite_condominios', 1)
      atualizarCampo(id, 'limite_usuarios', 1)
    }

    if (plano === 'intermediario') {
      atualizarCampo(id, 'limite_condominios', 5)
      atualizarCampo(id, 'limite_usuarios', 3)
    }

    if (plano === 'premium') {
      atualizarCampo(id, 'limite_condominios', 15)
      atualizarCampo(id, 'limite_usuarios', 10)
    }

    if (plano === 'admin') {
      atualizarCampo(id, 'limite_condominios', 999)
      atualizarCampo(id, 'limite_usuarios', 999)
    }
  }

  const perfisFiltrados = useMemo(() => {
    if (filtro === 'ativos') {
      return perfis.filter((p) => p.ativo === true)
    }

    if (filtro === 'inativos') {
      return perfis.filter((p) => p.ativo === false)
    }

    return perfis
  }, [perfis, filtro])

  return (
    <>
      <div className="header">
        <div className="premium-badge">
          CondoSafe Inspector
        </div>

        <h1>Administração de Clientes</h1>

        <p>
          Controle de usuários, planos, limites,
          vencimentos e acessos.
        </p>
      </div>

      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <h3>Clientes / Usuários</h3>

          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              maxWidth: '180px'
            }}
          >
            <option value="todos">Todos</option>
            <option value="ativos">Somente Ativos</option>
            <option value="inativos">Somente Inativos</option>
          </select>
        </div>

        {carregando ? (
          <p>Carregando clientes...</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '18px',
              marginTop: '18px'
            }}
          >
            {perfisFiltrados.map((p) => (
              <div
                key={p.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '22px',
                  padding: '20px',
                  background: '#ffffff',
                  boxShadow:
                    '0 12px 28px rgba(15, 23, 42, 0.08)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <div>
                    <strong
                      style={{
                        fontSize: '18px'
                      }}
                    >
                      {p.nome || 'Sem nome'}
                    </strong>

                    <br />

                    <small
                      style={{
                        color: '#64748b'
                      }}
                    >
                      ID: {p.user_id.substring(0, 8)}...
                    </small>
                  </div>

                  <div
                    style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      background:
                        p.ativo
                          ? '#dcfce7'
                          : '#fee2e2',
                      color:
                        p.ativo
                          ? '#166534'
                          : '#b91c1c',
                      fontWeight: 700,
                      fontSize: '13px'
                    }}
                  >
                    {p.ativo ? 'ATIVO' : 'INATIVO'}
                  </div>
                </div>

                <label>Nome</label>
                <input
                  value={p.nome || ''}
                  onChange={(e) =>
                    atualizarCampo(
                      p.id,
                      'nome',
                      e.target.value
                    )
                  }
                />

                <label>Tipo</label>
                <select
                  value={p.tipo || 'cliente'}
                  onChange={(e) =>
                    atualizarCampo(
                      p.id,
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
                  value={p.plano || 'basico'}
                  onChange={(e) =>
                    aplicarPlano(
                      p.id,
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

                  <option value="admin">
                    Admin
                  </option>
                </select>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap: '12px'
                  }}
                >
                  <div>
                    <label>
                      Limite Condomínios
                    </label>

                    <input
                      type="number"
                      value={
                        p.limite_condominios ?? 0
                      }
                      onChange={(e) =>
                        atualizarCampo(
                          p.id,
                          'limite_condominios',
                          Number(
                            e.target.value
                          )
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
                        p.limite_usuarios ?? 0
                      }
                      onChange={(e) =>
                        atualizarCampo(
                          p.id,
                          'limite_usuarios',
                          Number(
                            e.target.value
                          )
                        )
                      }
                    />
                  </div>
                </div>

                <label>Status</label>

                <select
                  value={String(p.ativo === true)}
                  onChange={(e) =>
                    atualizarCampo(
                      p.id,
                      'ativo',
                      e.target.value === 'true'
                    )
                  }
                >
                  <option value="true">
                    Ativo
                  </option>

                  <option value="false">
                    Inativo
                  </option>
                </select>

                <label>
                  Data de vencimento
                </label>

                <input
                  type="date"
                  value={p.data_expiracao || ''}
                  onChange={(e) =>
                    atualizarCampo(
                      p.id,
                      'data_expiracao',
                      e.target.value || null
                    )
                  }
                />

                <button
                  onClick={() => salvarPerfil(p)}
                  disabled={salvandoId === p.id}
                  style={{
                    marginTop: '16px',
                    width: '100%'
                  }}
                >
                  {salvandoId === p.id
                    ? 'Salvando...'
                    : 'Salvar Cliente'}
                </button>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap: '10px',
                    marginTop: '10px'
                  }}
                >
                  <button
                    onClick={() =>
                      alterarStatusRapido(
                        p.id,
                        !p.ativo
                      )
                    }
                    style={{
                      background:
                        p.ativo
                          ? '#f59e0b'
                          : '#16a34a'
                    }}
                  >
                    {p.ativo
                      ? 'Inativar'
                      : 'Reativar'}
                  </button>

                  <button
                    onClick={() =>
                      excluirPerfil(p.id)
                    }
                    style={{
                      background: '#dc2626'
                    }}
                  >
                    Excluir Perfil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
