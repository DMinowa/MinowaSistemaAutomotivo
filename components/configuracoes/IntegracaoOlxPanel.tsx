import { createClient } from "@/lib/supabase/server";

function formatarDataHora(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default async function IntegracaoOlxPanel() {
  const supabase = await createClient();

  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);

  const [ultimoLogRes, logsHojeRes, errosRecentesRes] = await Promise.all([
    supabase.from("integracoes_log").select("*").eq("integracao", "olx").order("criado_em", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("integracoes_log").select("tipo_evento, origem_detalhada, sucesso").eq("integracao", "olx").gte("criado_em", inicioHoje.toISOString()),
    supabase.from("integracoes_log").select("*").eq("integracao", "olx").eq("sucesso", false).order("criado_em", { ascending: false }).limit(10),
  ]);

  const logsHoje = logsHojeRes.data ?? [];
  const recebidosHoje = logsHoje.filter((l) => l.tipo_evento === "lead_recebido").length;
  const financiamentoHoje = logsHoje.filter((l) => l.origem_detalhada?.includes("financiamento")).length;
  const chatHoje = logsHoje.filter((l) => l.origem_detalhada?.includes("Chat")).length;

  const ultimoLog = ultimoLogRes.data;
  const funcionando = ultimoLog ? ultimoLog.sucesso : null;

  return (
    <div>
      <div className="cards-row">
        <div className="card">
          <div className="card-label">STATUS</div>
          <div className="card-value" style={{ fontSize: 18, color: funcionando === false ? "#ff5c5c" : "#5ac882" }}>
            {funcionando === null ? "⚪ Aguardando primeiro lead" : funcionando ? "🟢 Funcionando" : "🔴 Erro recente"}
          </div>
          <div className="card-hint">Último lead: {formatarDataHora(ultimoLog?.criado_em ?? null)}</div>
        </div>
        <div className="card">
          <div className="card-label">LEADS RECEBIDOS HOJE</div>
          <div className="card-value">{recebidosHoje}</div>
        </div>
        <div className="card">
          <div className="card-label">FINANCIAMENTO</div>
          <div className="card-value" style={{ color: "#5ac882" }}>{financiamentoHoje}</div>
        </div>
        <div className="card">
          <div className="card-label">CHAT</div>
          <div className="card-value" style={{ color: "#4da3ff" }}>{chatHoje}</div>
        </div>
      </div>

      <div className="widget-card">
        <div className="widget-title" style={{ marginBottom: 4 }}>🌐 Endpoint de recebimento</div>
        <p className="form-hint" style={{ marginBottom: 12 }}>
          Configure esta URL no painel de Leads da OLX (Configurações → Integração de Leads):
        </p>
        <div className="form-input" style={{ userSelect: "all", cursor: "text" }}>
          https://minowa-sistema-minowa-veiculos.vercel.app/api/integrations/olx/leads
        </div>
        <p className="form-hint" style={{ marginTop: 12 }}>
          Se a OLX exigir um token de autenticação, configure a variável de ambiente <code>OLX_LEADS_TOKEN</code> na
          Vercel com o mesmo valor cadastrado no painel da OLX.
        </p>
      </div>

      <div className="widget-card">
        <div className="widget-title" style={{ marginBottom: 12 }}>Log de erros recentes</div>
        {(!errosRecentesRes.data || errosRecentesRes.data.length === 0) ? (
          <p className="empty-state">Nenhum erro registrado.</p>
        ) : (
          <ul className="simple-list">
            {errosRecentesRes.data.map((log: any) => (
              <li key={log.id} className="simple-list-item" style={{ alignItems: "flex-start" }}>
                <span className="avatar-dot" style={{ background: "rgba(255,92,92,0.15)", color: "#ff5c5c" }}>!</span>
                <div>
                  <div>{log.mensagem_erro || "Erro não especificado"}</div>
                  <div className="simple-list-meta" style={{ marginLeft: 0 }}>{formatarDataHora(log.criado_em)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
