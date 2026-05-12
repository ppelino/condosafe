export default function Planos() {
 const whatsappUrl =
  'https://wa.me/5511977198220?text=Ol%C3%A1%2C%20tenho%20interesse%20nos%20planos%20do%20CondoSafe%20Inspector.' 
  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Planos e Assinatura</h1>
        <p>Escolha o plano ideal para gestão de vistorias, evidências, não conformidades e relatórios técnicos.</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px'
        }}
      >
        <div className="card">
          <h3>Básico</h3>
          <h2>R$ 97/mês</h2>
          <p>✅ 1 condomínio</p>
          <p>✅ 1 usuário</p>
          <p>✅ Checklist técnico</p>
          <p>✅ Não conformidades</p>
          <p>✅ Plano de ação</p>
          <p>✅ Relatório PDF</p>

          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <button style={{ width: '100%', marginTop: '14px' }}>
              Solicitar Plano
            </button>
          </a>
        </div>

        <div
          className="card"
          style={{
            border: '2px solid #2563eb',
            boxShadow: '0 14px 35px rgba(37, 99, 235, 0.18)'
          }}
        >
          <div className="premium-badge">Mais indicado</div>
          <h3>Intermediário</h3>
          <h2>R$ 197/mês</h2>
          <p>✅ Até 5 condomínios</p>
          <p>✅ Até 3 usuários</p>
          <p>✅ Dashboard executivo</p>
          <p>✅ Evidências fotográficas</p>
          <p>✅ Relatórios completos</p>
          <p>✅ Acompanhamento de pendências</p>

          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <button style={{ width: '100%', marginTop: '14px' }}>
              Solicitar Plano
            </button>
          </a>
        </div>

        <div className="card">
          <h3>Premium</h3>
          <h2>R$ 397/mês</h2>
          <p>✅ Até 15 condomínios</p>
          <p>✅ Até 10 usuários</p>
          <p>✅ Gestão multiempresa</p>
          <p>✅ Painel administrativo</p>
          <p>✅ Controle avançado</p>
          <p>✅ Suporte prioritário</p>

          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <button style={{ width: '100%', marginTop: '14px' }}>
              Solicitar Plano
            </button>
          </a>
        </div>
      </div>

      <div className="card" style={{ marginTop: '18px' }}>
        <h3>O que está incluso no CondoSafe Inspector?</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '12px'
          }}
        >
          <p>✅ Gestão de condomínios</p>
          <p>✅ Vistorias técnicas</p>
          <p>✅ Checklist digital</p>
          <p>✅ Upload de fotos</p>
          <p>✅ Zoom em evidências</p>
          <p>✅ Não conformidades automáticas</p>
          <p>✅ Plano de ação</p>
          <p>✅ Relatório técnico PDF</p>
          <p>✅ Controle de status</p>
          <p>✅ Painel administrativo</p>
          <p>✅ Controle por plano</p>
          <p>✅ Bloqueio por vencimento</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '18px' }}>
        <h3>Modelo recomendado</h3>
        <p>
          Para condomínios, administradoras e consultorias, o CondoSafe pode ser
          utilizado como sistema de gestão técnica para organizar inspeções,
          evidências, pendências e relatórios profissionais.
        </p>
        <p>
          O modelo ideal é combinar o uso do sistema com serviço técnico,
          acompanhamento periódico e entrega de relatórios padronizados.
        </p>
      </div>
    </>
  )
}
