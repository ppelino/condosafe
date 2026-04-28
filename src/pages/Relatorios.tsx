// 👇 (seu código continua igual até o return)

return (
  <>
    <div className="header no-print">
      <div className="premium-badge">CondoSafe Inspector</div>

      <h1>Relatório Técnico Premium</h1>
      <p>
        Documento gerado automaticamente com base nas vistorias, não conformidades e planos de ação.
      </p>

      <br />
      <button onClick={imprimirPDF}>Gerar PDF / Imprimir</button>
    </div>

    <div className="card report-area">

      {/* HEADER DO RELATÓRIO */}
      <div className="report-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo.png"
            alt="Datainsight"
            style={{ height: '60px' }}
          />

          <div>
            <h1 style={{ margin: 0 }}>Datainsight SST</h1>
            <small>Sistema Profissional de Gestão Condominial</small>
          </div>
        </div>

        <div className="report-box">
          <strong>RELATÓRIO TÉCNICO</strong>
          <br />
          <small>Segurança Condominial</small>
          <br /><br />
          Data: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* INTRO */}
      <div className="report-info">
        <p>
          Este relatório apresenta a análise técnica das condições observadas durante a vistoria,
          incluindo não conformidades identificadas e respectivos planos de ação.
        </p>
      </div>

      <h2>1. Identificação</h2>

      <div className="report-info">
        <p><strong>Condomínio:</strong> {condominioNome}</p>
        <p><strong>Responsável:</strong> ____________________________</p>
        <p><strong>Data:</strong> {new Date().toLocaleDateString()}</p>
      </div>

      <h2>2. Resumo Executivo</h2>

      <div className="report-summary">
        <div>
          <strong>{ncs.length}</strong>
          <span>Não Conformidades</span>
        </div>

        <div>
          <strong>{ncsAbertas}</strong>
          <span>NCs Abertas</span>
        </div>

        <div>
          <strong>{planos.length}</strong>
          <span>Planos de Ação</span>
        </div>

        <div>
          <strong>{planosPendentes}</strong>
          <span>Pendentes</span>
        </div>
      </div>

      <h2>3. Não Conformidades</h2>

      {ncs.map((nc, index) => (
        <div key={nc.id} className="report-item">
          <h3>NC {index + 1} — {nc.item_checklist}</h3>

          <p><strong>Descrição:</strong> {nc.descricao}</p>
          <p><strong>Status:</strong> {formatarStatusNC(nc.status)}</p>
          <p><strong>Data:</strong> {new Date(nc.created_at).toLocaleDateString()}</p>
        </div>
      ))}

      <h2>4. Plano de Ação</h2>

      {planos.map((p, index) => (
        <div key={p.id} className="report-item">
          <h3>Ação {index + 1}</h3>

          <p><strong>Ação:</strong> {p.acao}</p>
          <p><strong>Responsável:</strong> {p.responsavel}</p>
          <p><strong>Prazo:</strong> {p.prazo ? new Date(p.prazo).toLocaleDateString() : '-'}</p>
          <p><strong>Status:</strong> {formatarStatusPlano(p.status)}</p>
        </div>
      ))}

      <h2>5. Conclusão</h2>

      <p>
        As não conformidades identificadas devem ser tratadas com prioridade,
        visando garantir a segurança e conformidade do ambiente.
      </p>

      <div className="signature-area">
        <div>
          <p>________________________</p>
          <p>Responsável Técnico</p>
        </div>

        <div>
          <p>________________________</p>
          <p>Condomínio</p>
        </div>
      </div>

      <footer className="report-footer">
        Datainsight SST — CondoSafe Inspector
      </footer>

    </div>
  </>
)
