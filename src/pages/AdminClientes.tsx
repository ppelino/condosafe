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

  const dataParaBR = (data: string | null) => {
    if (!data) return ''
    const iso = data.substring(0, 10)
    const [ano, mes, dia] = iso.split('-')
    if (!ano || !mes || !dia) return ''
    return `${dia}/${mes}/${ano}`
  }

  const dataParaISO = (dataBR: string | null) => {
    if (!dataBR) return null
    const partes = dataBR.trim().split('/')
    if (partes.length !== 3) return null

    const [dia, mes, ano] = partes

    if (dia.length !== 2 || mes.length !== 2 || ano.length !== 4) {
      return null
    }

    return `${ano}-${mes}-${dia}`
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
      lista.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    )
  }

  const salvarPerfil = async (perfil: Perfil) => {
    setSalvandoId(perfil.id)

    const dataFormatada = dataParaISO(perfil.data_expiracao)

    const { error } = await supabase
      .from('perfis')
      .update({
        nome: perfil.nome,
        tipo: perfil.tipo,
        plano: perfil.plano,
        limite_condominios: Number(perfil.limite_condominios ?? 0),
        limite_usuarios: Number(perfil.limite_usuarios ?? 0),
        ativo: perfil.ativo === true,
        data_expiracao: dataFormatada
      })
      .eq('id', perfil.id)

    setSalvandoId(null)

    if (error) {
      alert('Erro ao salvar cliente: ' + error.message)
      console.error(error)
      return
    }

    alert('Cliente atualizado com sucesso!')
    carregarPerfis()
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

  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Administração de Clientes</h1>
        <p>Controle de usuários, planos, limites, status de acesso e vencimento.</p>
      </div>

      <div className="card">
        <h3>Clientes / Usuários</h3>

        {carregando ? (
          <p>Carregando clientes...</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '18px',
              marginTop: '18px'
            }}
          >
            {perfis.map((p) => (
              <div
                key={p.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '18px',
                  padding: '18px',
                  background: '#f8fafc',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.06)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                    gap: '12px'
                  }}
                >
                  <div>
                    <strong>{p.nome || 'Cliente sem nome'}</strong>
                    <br />
                    <small>ID: {p.user_id.substring(0, 8)}...</small>
                  </div>

                  <strong style={{ color: p.ativo ? '#16a34a' : '#dc2626' }}>
                    {p.ativo ? 'Ativo' : 'Inativo'}
                  </strong>
                </div>

                <label>Nome</label>
                <input
                  value={p.nome || ''}
                  onChange={(e) => atualizarCampo(p.id, 'nome', e.target.value)}
                />

                <label>Tipo</label>
                <select
                  value={p.tipo || 'cliente'}
                  onChange={(e) => atualizarCampo(p.id, 'tipo', e.target.value)}
                >
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                </select>

                <label>Plano</label>
                <select
                  value={p.plano || 'basico'}
                  onChange={(e) => aplicarPlano(p.id, e.target.value)}
                >
                  <option value="basico">Básico</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                </select>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}
                >
                  <div>
                    <label>Limite Condomínios</label>
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
                  </div>

                  <div>
                    <label>Limite Usuários</label>
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
                  </div>
                </div>

                <label>Status</label>
                <select
                  value={String(p.ativo === true)}
                  onChange={(e) =>
                    atualizarCampo(p.id, 'ativo', e.target.value === 'true')
                  }
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>

                <label>Data de vencimento</label>
                <input
                  type="text"
                  placeholder="dd/mm/aaaa"
                  value={dataParaBR(p.data_expiracao)}
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
                  style={{ marginTop: '14px', width: '100%' }}
                >
                  {salvandoId === p.id ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
