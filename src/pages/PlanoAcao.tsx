return (
  <>
    <div className="header">
      <div className="premium-badge">CondoSafe Inspector</div>
      <h1>Gestão de Plano de Ação Corretiva</h1>
      <p>
        Definição, acompanhamento e controle das ações corretivas vinculadas às não conformidades identificadas.
      </p>
    </div>

    {/* NOVO PLANO */}
    <div className="card">
      <h3>Registrar Ação Corretiva</h3>
      <p style={{ marginBottom: '12px', color: '#64748b' }}>
        Vincule uma ação a uma não conformidade e defina responsável e prazo para resolução.
      </p>

      <select
        value={naoConformidadeId}
        onChange={(e) => setNaoConformidadeId(e.target.value)}
      >
        <option value="">Selecione a não conformidade</option>
        {ncs.map((nc) => (
          <option key={nc.id} value={nc.id}>
            {nc.item_checklist}
          </option>
        ))}
      </select>

      <input
        placeholder="Descreva a ação corretiva (ex: Substituição de extintores vencidos)"
        value={acao}
        onChange={(e) => setAcao(e.target.value)}
      />

      <input
        placeholder="Responsável pela execução"
        value={responsavel}
        onChange={(e) => setResponsavel(e.target.value)}
      />

      <input
        type="date"
        value={prazo}
        onChange={(e) => setPrazo(e.target.value)}
      />

      <button onClick={salvarPlano}>Salvar Plano de Ação</button>
    </div>

    {/* LISTA */}
    <div className="card">
      <h3>Planos de Ação ({planos.length})</h3>
      <p style={{ marginBottom: '12px', color: '#64748b' }}>
        Monitoramento das ações corretivas com status e prazos definidos.
      </p>

      {planos.length === 0 ? (
        <p>Nenhum plano de ação registrado ainda.</p>
      ) : (
        planos.map((p) => (
          <div
            key={p.id}
            className="list-item"
            style={{ borderLeftColor: corStatus(p.status) }}
          >
            <div>
              <strong>{p.acao}</strong>
              <br />

              <small>
                <strong>Não Conformidade:</strong>{' '}
                {p.nao_conformidades?.[0]?.item_checklist || 'Não informada'}
              </small>
              <br />

              <small>
                <strong>Responsável:</strong>{' '}
                {p.responsavel || 'Não informado'}
              </small>
              <br />

              <small>
                <strong>Prazo:</strong>{' '}
                {p.prazo
                  ? new Date(p.prazo).toLocaleDateString()
                  : 'Sem prazo definido'}
              </small>
            </div>

            <div>
              <strong
                style={{
                  color: corStatus(p.status),
                  fontSize: '13px',
                  textTransform: 'uppercase'
                }}
              >
                {formatarStatus(p.status)}
              </strong>

              <br /><br />

              <select
                value={p.status}
                onChange={(e) =>
                  atualizarStatus(
                    p.id,
                    e.target.value as 'pendente' | 'andamento' | 'concluido'
                  )
                }
              >
                <option value="pendente">🔴 Pendente</option>
                <option value="andamento">🟠 Em andamento</option>
                <option value="concluido">🟢 Concluído</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  </>
)
