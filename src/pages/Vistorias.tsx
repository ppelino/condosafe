return (
  <>
    <div className="header">
      <div className="premium-badge">CondoSafe Inspector</div>
      <h1>Gestão de Vistorias Técnicas</h1>
      <p>
        Registro estruturado de inspeções, com geração automática de não conformidades.
      </p>
    </div>

    {/* NOVA VISTORIA */}
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

    {/* HISTÓRICO */}
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
              <strong>{v.condominios?.[0]?.nome}</strong>
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

    {/* CHECKLIST */}
    <div className="card">
      <h3>Checklist Técnico da Vistoria</h3>
      <p style={{ marginBottom: '12px', color: '#64748b' }}>
        Registre os itens verificados durante a inspeção.
        Itens com <strong style={{ color: 'red' }}>NOK</strong> geram não conformidade automaticamente.
      </p>

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

    {/* ITENS DO CHECKLIST */}
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
