import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Condominio = {
  id: string
  nome: string
}

type Vistoria = {
  id: string
  descricao: string
  data: string
  condominio_id: string
  condominios?: {
    nome: string
  }[]
}

type ChecklistResposta = {
  id: string
  item: string
  resposta: 'OK' | 'NOK' | 'NA'
  observacao: string | null
  created_at: string
  vistoria_id: string
}

export default function Vistorias() {
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [vistorias, setVistorias] = useState<Vistoria[]>([])
  const [checklists, setChecklists] = useState<ChecklistResposta[]>([])

  const [condominioId, setCondominioId] = useState('')
  const [descricao, setDescricao] = useState('')

  const [vistoriaSelecionada, setVistoriaSelecionada] = useState('')
  const [item, setItem] = useState('')
  const [resposta, setResposta] = useState<'OK' | 'NOK' | 'NA'>('OK')
  const [observacao, setObservacao] = useState('')

  const carregarCondominios = async () => {
    const { data, error } = await supabase
      .from('condominios')
      .select('id, nome')
      .order('nome', { ascending: true })

    if (error) {
      alert('Erro ao carregar condomínios: ' + error.message)
      return
    }

    setCondominios(data || [])
  }

  const carregarVistorias = async () => {
    const { data, error } = await supabase
      .from('vistorias')
      .select(`
        id,
        descricao,
        data,
        condominio_id,
        condominios (
          nome
        )
      `)
      .order('data', { ascending: false })

    if (error) {
      alert('Erro ao carregar vistorias: ' + error.message)
      return
    }

    setVistorias((data || []) as unknown as Vistoria[])
  }

  const carregarChecklists = async () => {
    const { data, error } = await supabase
      .from('checklist_respostas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert('Erro ao carregar checklist: ' + error.message)
      return
    }

    setChecklists(data || [])
  }

  useEffect(() => {
    carregarCondominios()
    carregarVistorias()
    carregarChecklists()
  }, [])

  const salvarVistoria = async () => {
    if (!condominioId || !descricao) {
      alert('Selecione o condomínio e preencha a descrição.')
      return
    }

    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from('vistorias').insert([
      {
        condominio_id: condominioId,
        descricao,
        user_id: userData.user?.id
      }
    ])

    if (error) {
      alert('Erro ao salvar vistoria: ' + error.message)
      return
    }

    alert('Vistoria salva!')
    setCondominioId('')
    setDescricao('')
    carregarVistorias()
  }

  const gerarNaoConformidade = async (
    vistoriaId: string,
    itemChecklist: string,
    observacaoChecklist: string
  ) => {
    const vistoria = vistorias.find((v) => v.id === vistoriaId)

    if (!vistoria) {
      alert('Erro: vistoria não encontrada para gerar NC.')
      return
    }

    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from('nao_conformidades').insert([
      {
        vistoria_id: vistoriaId,
        condominio_id: vistoria.condominio_id,
        item_checklist: itemChecklist,
        descricao:
          observacaoChecklist ||
          `Não conformidade gerada automaticamente para o item: ${itemChecklist}`,
        status: 'aberta',
        user_id: userData.user?.id
      }
    ])

    if (error) {
      alert('Checklist salvo, mas erro ao gerar não conformidade: ' + error.message)
    }
  }

  const salvarChecklist = async () => {
    if (!vistoriaSelecionada || !item || !resposta) {
      alert('Preencha todos os campos do checklist.')
      return
    }

    const { data: userData } = await supabase.auth.getUser()

    const { error } = await supabase.from('checklist_respostas').insert([
      {
        vistoria_id: vistoriaSelecionada,
        item,
        resposta,
        observacao,
        user_id: userData.user?.id
      }
    ])

    if (error) {
      alert('Erro ao salvar checklist: ' + error.message)
      return
    }

    if (resposta === 'NOK') {
      await gerarNaoConformidade(vistoriaSelecionada, item, observacao)
    }

    alert(
      resposta === 'NOK'
        ? 'Checklist salvo e não conformidade gerada!'
        : 'Checklist salvo!'
    )

    setItem('')
    setResposta('OK')
    setObservacao('')
    carregarChecklists()
  }

  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Gestão de Vistorias Técnicas</h1>
        <p>
          Registro estruturado de inspeções, com geração automática de não conformidades.
        </p>
      </div>

      <div className="card">
        <h3>Registrar Nova Vistoria</h3>
        <p style={{ marginBottom: '12px', color: '#64748b' }}>
          Selecione o condomínio e descreva a inspeção realizada.
        </p>

        <select value={condominioId} onChange={(e) => setCondominioId(e.target.value)}>
          <option value="">Selecione o condomínio</option>
          {condominios.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <input
          placeholder="Descrição da vistoria (ex: Inspeção mensal de segurança)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <button onClick={salvarVistoria}>Salvar Vistoria</button>
      </div>

      <div className="card">
        <h3>Histórico de Vistorias</h3>
        <p style={{ marginBottom: '12px', color: '#64748b' }}>
          Lista de inspeções realizadas nos condomínios cadastrados.
        </p>

        {vistorias.length === 0 ? (
          <p>Nenhuma vistoria registrada ainda.</p>
        ) : (
          vistorias.map((v) => (
            <div key={v.id} className="list-item">
              <div>
                <strong>{v.condominios?.[0]?.nome || 'Condomínio não informado'}</strong>
                <br />
                {v.descricao}
              </div>

              <div style={{ fontWeight: '600' }}>
                {new Date(v.data).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Checklist Técnico da Vistoria</h3>
        <p style={{ marginBottom: '12px', color: '#64748b' }}>
          Registre os itens verificados durante a inspeção.
          Itens com <strong style={{ color: 'red' }}> NOK </strong>
          geram não conformidade automaticamente.
        </p>

        <select
          value={vistoriaSelecionada}
          onChange={(e) => setVistoriaSelecionada(e.target.value)}
        >
          <option value="">Selecione a vistoria</option>
          {vistorias.map((v) => (
            <option key={v.id} value={v.id}>
              {v.condominios?.[0]?.nome || 'Condomínio não informado'} - {v.descricao}
            </option>
          ))}
        </select>

        <input
          placeholder="Item verificado (ex: Extintores, Iluminação de emergência)"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />

        <select
          value={resposta}
          onChange={(e) => setResposta(e.target.value as 'OK' | 'NOK' | 'NA')}
        >
          <option value="OK">OK - Conforme</option>
          <option value="NOK">NOK - Não Conforme</option>
          <option value="NA">NA - Não se Aplica</option>
        </select>

        <input
          placeholder="Observação técnica"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />

        <button onClick={salvarChecklist}>Salvar Checklist</button>
      </div>

      <div className="card">
        <h3>Itens Registrados</h3>
        <p style={{ marginBottom: '12px', color: '#64748b' }}>
          Histórico dos itens avaliados nas vistorias realizadas.
        </p>

        {checklists.length === 0 ? (
          <p>Nenhum item de checklist registrado ainda.</p>
        ) : (
          checklists.map((c) => (
            <div key={c.id} className="list-item">
              <div>
                <strong>{c.item}</strong>
                <br />
                {c.observacao || 'Sem observação'}
              </div>

              <div>
                <strong
                  style={{
                    color:
                      c.resposta === 'OK'
                        ? 'green'
                        : c.resposta === 'NOK'
                        ? 'red'
                        : 'gray'
                  }}
                >
                  {c.resposta}
                </strong>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
