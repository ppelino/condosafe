import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Foto = {
  id: string
  nao_conformidade_id: string
  foto_url: string
  created_at?: string
}

type NaoConformidade = {
  id: string
  descricao: string | null
  status: string
  item_checklist: string | null
  created_at: string
  fotos?: Foto[]
}

export default function NaoConformidades() {
  const [naoConformidades, setNaoConformidades] = useState<NaoConformidade[]>([])
  const [carregando, setCarregando] = useState(true)
  const [enviandoFotoId, setEnviandoFotoId] = useState<string | null>(null)

  const carregarNaoConformidades = async () => {
    setCarregando(true)

    const { data: ncData, error: ncError } = await supabase
      .from('nao_conformidades')
      .select('*')
      .order('created_at', { ascending: false })

    if (ncError) {
      alert('Erro ao carregar não conformidades: ' + ncError.message)
      setCarregando(false)
      return
    }

    const { data: fotosData, error: fotosError } = await supabase
      .from('nao_conformidade_fotos')
      .select('*')
      .order('created_at', { ascending: true })

    if (fotosError) {
      alert('Erro ao carregar fotos: ' + fotosError.message)
      setCarregando(false)
      return
    }

    const listaComFotos = (ncData || []).map((nc) => ({
      ...nc,
      fotos: (fotosData || []).filter(
        (foto) => foto.nao_conformidade_id === nc.id
      )
    }))

    setNaoConformidades(listaComFotos)
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

  const enviarFotos = async (ncId: string, arquivos: FileList) => {
    if (!arquivos || arquivos.length === 0) return

    setEnviandoFotoId(ncId)

    for (const arquivo of Array.from(arquivos)) {
      const extensao = arquivo.name.split('.').pop()
      const nomeArquivo = `${ncId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extensao}`

      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(nomeArquivo, arquivo)

      if (uploadError) {
        alert('Erro ao enviar foto: ' + uploadError.message)
        setEnviandoFotoId(null)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('fotos')
        .getPublicUrl(nomeArquivo)

      const { error: insertError } = await supabase
        .from('nao_conformidade_fotos')
        .insert([
          {
            nao_conformidade_id: ncId,
            foto_url: publicUrlData.publicUrl
          }
        ])

      if (insertError) {
        alert('Erro ao salvar foto no banco: ' + insertError.message)
        setEnviandoFotoId(null)
        return
      }
    }

    setEnviandoFotoId(null)
    carregarNaoConformidades()
  }

  const obterCaminhoStorage = (fotoUrl: string) => {
    const marcador = '/storage/v1/object/public/fotos/'
    const partes = fotoUrl.split(marcador)

    if (partes.length < 2) return null

    return decodeURIComponent(partes[1])
  }

  const excluirFoto = async (foto: Foto) => {
    if (!confirm('Deseja excluir esta foto?')) return

    const caminho = obterCaminhoStorage(foto.foto_url)

    if (!caminho) {
      alert('Não foi possível localizar o caminho da foto no Storage.')
      return
    }

    const { error: storageError } = await supabase.storage
      .from('fotos')
      .remove([caminho])

    if (storageError) {
      alert('Erro ao excluir foto do Storage: ' + storageError.message)
      return
    }

    const { error: bancoError } = await supabase
      .from('nao_conformidade_fotos')
      .delete()
      .eq('id', foto.id)

    if (bancoError) {
      alert('Foto removida do Storage, mas deu erro ao remover do banco: ' + bancoError.message)
      return
    }

    carregarNaoConformidades()
  }

  const corStatus = (status: string) => {
    if (status === 'aberta') return '#dc2626'
    if (status === 'em andamento') return '#f59e0b'
    return '#16a34a'
  }

  const textoStatus = (status: string) => {
    if (status === 'aberta') return 'Aberta'
    if (status === 'em andamento') return 'Em andamento'
    if (status === 'concluida') return 'Concluída'
    return status
  }

  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Gestão de Não Conformidades</h1>
        <p>
          Acompanhamento técnico das irregularidades identificadas nas vistorias.
        </p>
      </div>

      <div className="card">
        <h3>Não Conformidades Registradas</h3>

        {carregando ? (
          <p>Carregando...</p>
        ) : naoConformidades.length === 0 ? (
          <p>Nenhuma não conformidade registrada.</p>
        ) : (
          naoConformidades.map((nc) => (
            <div
              key={nc.id}
              className="list-item"
              style={{ borderLeftColor: corStatus(nc.status) }}
            >
              <div style={{ width: '100%' }}>
                <strong>{nc.item_checklist || 'Item não informado'}</strong>
                <br />

                <span>{nc.descricao || 'Sem descrição'}</span>
                <br />

                <small style={{ color: '#64748b' }}>
                  {new Date(nc.created_at).toLocaleDateString('pt-BR')}
                </small>

                <div style={{ marginTop: '14px' }}>
                  <strong style={{ fontSize: '13px' }}>
                    Evidências fotográficas
                  </strong>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      marginTop: '10px',
                      marginBottom: '10px'
                    }}
                  >
                    {nc.fotos && nc.fotos.length > 0 ? (
                      nc.fotos.map((foto) => (
                        <div key={foto.id}>
                          <img
                            src={foto.foto_url}
                            alt="Foto da não conformidade"
                            style={{
                              width: '110px',
                              height: '90px',
                              objectFit: 'cover',
                              borderRadius: '10px',
                              border: '1px solid #e5e7eb',
                              display: 'block',
                              marginBottom: '6px'
                            }}
                          />

                          <button
                            type="button"
                            onClick={() => excluirFoto(foto)}
                            style={{
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: 'none',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      ))
                    ) : (
                      <small style={{ color: '#64748b' }}>
                        Nenhuma foto enviada.
                      </small>
                    )}
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        enviarFotos(nc.id, e.target.files)
                      }
                    }}
                  />

                  {enviandoFotoId === nc.id && (
                    <small style={{ color: '#2563eb' }}>
                      Enviando fotos...
                    </small>
                  )}
                </div>
              </div>

              <div>
                <strong
                  style={{
                    color: corStatus(nc.status),
                    textTransform: 'uppercase',
                    fontSize: '13px'
                  }}
                >
                  {textoStatus(nc.status)}
                </strong>

                <br />
                <br />

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
