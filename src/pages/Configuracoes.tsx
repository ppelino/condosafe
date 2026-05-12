export default function Configuracoes() {
  return (
    <>
      <div className="header">
        <div className="premium-badge">CondoSafe Inspector</div>
        <h1>Configurações</h1>
        <p>Central administrativa para ajustes do sistema, relatórios, segurança e informações comerciais.</p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px'
        }}
      >
        <div className="card">
          <h3>Dados da Empresa</h3>
          <p><strong>Empresa:</strong> Datainsight SST</p>
          <p><strong>Sistema:</strong> CondoSafe Inspector</p>
          <p><strong>Responsável técnico:</strong> Edson Gomes</p>
          <p><strong>Uso:</strong> Gestão de vistorias, não conformidades e planos de ação.</p>
        </div>

        <div className="card">
          <h3>Plano e Acesso</h3>
          <p><strong>Status:</strong> Ativo</p>
          <p><strong>Controle:</strong> Bloqueio por vencimento e status do cliente.</p>
          <p><strong>Planos:</strong> Básico, Intermediário, Premium e Admin.</p>
          <p><strong>Administração:</strong> realizada em Admin / Clientes.</p>
        </div>

        <div className="card">
          <h3>Relatórios Técnicos</h3>
          <p>✅ Capa técnica</p>
          <p>✅ Resumo executivo</p>
          <p>✅ Não conformidades</p>
          <p>✅ Evidências fotográficas</p>
          <p>✅ Plano de ação</p>
          <p>✅ Assinatura e conclusão técnica</p>
        </div>

        <div className="card">
          <h3>Segurança</h3>
          <p>✅ Login com Supabase</p>
          <p>✅ Controle por perfil</p>
          <p>✅ Bloqueio por plano expirado</p>
          <p>✅ Área administrativa protegida</p>
        </div>

        <div className="card">
          <h3>Aparência</h3>
          <p><strong>Tema atual:</strong> Claro</p>
          <p><strong>Sidebar:</strong> Azul escuro</p>
          <p><strong>Estilo:</strong> SaaS profissional</p>
          <p><strong>Status:</strong> Layout em evolução responsiva.</p>
        </div>

        <div className="card">
          <h3>Próximas Melhorias</h3>        
          <p>• Área do cliente</p>
          <p>• Cadastro automático de novos clientes</p>
          <p>• Alertas de vencimento</p>
          <p>• Dashboard com gráficos avançados</p>
        </div>
      </div>
    </>
  )
}
