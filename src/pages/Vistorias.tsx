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

  // ✅ FUNÇÃO AJUSTADA AQUI
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
        status: 'aberta', // 🔥 CORRIGIDO AQUI
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
        <h1>Vistorias</h1>
        <p>Registro de inspeções realizadas nos condomínios.</p>
      </div>

      <div className="card">
        <h3>Nova Vistoria</h3>

        <select value={condominioId} onChange={(e) => setCondominioId(e.target.value)}>
          <option value="">Selecione o condomínio</option>
          {condominios.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <br /><br />

        <input
          placeholder="Descrição da vistoria"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <br /><br />

        <button onClick={salvarVistoria}>Salvar Vistoria</button>
      </div>

      <div className="card">
        <h3>Histórico de Vistorias</h3>

        {vistorias.length === 0 ? (
          <p>Nenhuma vistoria registrada ainda.</p>
        ) : (
          vistorias.map((v) => (
            <div key={v.id} className="list-item">
              <div>
                <strong>{v.condominios?.[0]?.nome}</strong>
                <br />
                {v.descricao}
              </div>

              <div>{new Date(v.data).toLocaleDateString()}</div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Checklist da Vistoria</h3>

        <select
          value={vistoriaSelecionada}
          onChange={(e) => setVistoriaSelecionada(e.target.value)}
        >
          <option value="">Selecione a vistoria</option>
          {vistorias.map((v) => (
            <option key={v.id} value={v.id}>
              {v.condominios?.[0]?.nome} - {v.descricao}
            </option>
          ))}
        </select>

        <br /><br />

        <input
          placeholder="Item verificado (ex: Extintores)"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />

        <br /><br />

        <select
          value={resposta}
          onChange={(e) => setResposta(e.target.value as 'OK' | 'NOK' | 'NA')}
        >
          <option value="OK">OK</option>
          <option value="NOK">NOK</option>
          <option value="NA">NA</option>
        </select>

        <br /><br />

        <input
          placeholder="Observação"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />

        <br /><br />

        <button onClick={salvarChecklist}>Salvar Checklist</button>
      </div>

      <div className="card">
        <h3>Itens do Checklist</h3>

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
