import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

const FILTERS_CLASSIFICACAO = [
  { label: "Todos", value: "" },
  { label: "Quentes", value: "quente" },
  { label: "Mornos", value: "morno" },
  { label: "Frios", value: "frio" },
];
const FILTERS_ORIGEM = [
  { label: "Todas", value: "" },
  { label: "OLX", value: "olx" },
  { label: "Instagram", value: "instagram" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Facebook", value: "facebook" },
  { label: "Site", value: "site" },
  { label: "Outros", value: "outro" },
];
const FILTERS_SUBORIGEM_OLX = [
  { label: "Todas", value: "" },
  { label: "Financiamento", value: "financing" },
  { label: "Chat", value: "chat" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Telefone", value: "telefone" },
  { label: "Outros", value: "olx" },
];
const FILTERS_PERIODO = [
  { label: "Todo período", value: "" },
  { label: "Hoje", value: "hoje" },
  { label: "Ontem", value: "ontem" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
];
const CLASSIFICACAO_LABEL: Record<string, string> = { quente: "Quente", morno: "Morno", frio: "Frio" };
const STATUS_LABEL: Record<string, string> = {
  novo: "Novo",
  em_atendimento: "Em atendimento",
  agendado: "Agendado",
  convertido: "Convertido",
  perdido: "Perdido",
};
const OLX_BADGE: Record<string, { emoji: string; cor: string }> = {
  financing: { emoji: "💰", cor: "#5ac882" },
  chat: { emoji: "💬", cor: "#4da3ff" },
  whatsapp: { emoji: "📱", cor: "#5ac882" },
  telefone: { emoji: "☎️", cor: "#f2b93b" },
  olx: { emoji: "🌐", cor: "#9a9a9c" },
};

function getRangePeriodo(periodo: string) {
  const hoje = new Date();
  if (periodo === "hoje") {
    const inicio = new Date(hoje); inicio.setHours(0, 0, 0, 0);
    return { inicio: inicio.toISOString(), fim: hoje.toISOString() };
  }
  if (periodo === "ontem") {
    const inicio = new Date(hoje); inicio.setDate(hoje.getDate() - 1); inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio); fim.setHours(23, 59, 59, 999);
    return { inicio: inicio.toISOString(), fim: fim.toISOString() };
  }
  if (periodo === "7d") {
    const inicio = new Date(hoje); inicio.setDate(hoje.getDate() - 7);
    return { inicio: inicio.toISOString(), fim: hoje.toISOString() };
  }
  if (periodo === "30d") {
    const inicio = new Date(hoje); inicio.setDate(hoje.getDate() - 30);
    return { inicio: inicio.toISOString(), fim: hoje.toISOString() };
  }
  return null;
}

function formatarDataHora(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { classificacao?: string; origem?: string; suborigem?: string; periodo?: string };
}) {
  const classificacao = searchParams?.classificacao ?? "";
  const origem = searchParams?.origem ?? "";
  const suborigem = searchParams?.suborigem ?? "";
  const periodo = searchParams?.periodo ?? "";

  const supabase = await createClient();
  let query = supabase
    .from("leads")
    .select("*, veiculo:veiculos(marca, modelo)")
    .order("criado_em", { ascending: false });

  if (classificacao) query = query.eq("classificacao", classificacao);
  if (origem) query = query.eq("origem", origem);
  if (origem === "olx" && suborigem) query = query.eq("source_bruto", suborigem);

  const range = getRangePeriodo(periodo);
  if (range) {
    query = query.gte("criado_em", range.inicio).lte("criado_em", range.fim);
  }

  const { data: leads, error } = await query;

  function buildHref(params: Record<string, string>) {
    const merged = { classificacao, origem, suborigem, periodo, ...params };
    const usp = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => { if (v) usp.set(k, v); });
    const qs = usp.toString();
    return qs ? `/leads?${qs}` : "/leads";
  }

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">Contatos recebidos pela Ana (chatbot), OLX e cadastros manuais</p>
        </div>
        <Link href="/leads/novo" className="primary-button">+ Novo lead</Link>
      </div>

      <div className="filter-row">
        {FILTERS_CLASSIFICACAO.map((f) => (
          <Link key={f.value} href={buildHref({ classificacao: f.value })} className={`filter-chip ${classificacao === f.value ? "active" : ""}`}>
            {f.label}
          </Link>
        ))}
      </div>
      <div className="filter-row">
        {FILTERS_ORIGEM.map((f) => (
          <Link key={f.value} href={buildHref({ origem: f.value, suborigem: "" })} className={`filter-chip ${origem === f.value ? "active" : ""}`}>
            {f.label}
          </Link>
        ))}
      </div>
      {origem === "olx" && (
        <div className="filter-row">
          {FILTERS_SUBORIGEM_OLX.map((f) => (
            <Link key={f.value} href={buildHref({ suborigem: f.value })} className={`filter-chip ${suborigem === f.value ? "active" : ""}`}>
              {f.label}
            </Link>
          ))}
        </div>
      )}
      <div className="filter-row">
        {FILTERS_PERIODO.map((f) => (
          <Link key={f.value} href={buildHref({ periodo: f.value })} className={`filter-chip ${periodo === f.value ? "active" : ""}`}>
            {f.label}
          </Link>
        ))}
      </div>

      {error && <p className="auth-error">Erro ao carregar leads: {error.message}</p>}

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Veículo de interesse</th>
              <th>Origem</th>
              <th>Classificação</th>
              <th>Status</th>
              <th>Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {(!leads || leads.length === 0) && (
              <tr><td colSpan={7} className="empty-row">Nenhum lead encontrado.</td></tr>
            )}
            {leads?.map((lead: any) => {
              const badge = lead.origem === "olx" ? OLX_BADGE[lead.source_bruto] : null;
              return (
                <tr key={lead.id}>
                  <td><Link href={`/leads/${lead.id}`} style={{ color: "inherit", textDecoration: "none" }}>{lead.nome || "—"}</Link></td>
                  <td>{lead.telefone || "—"}</td>
                  <td>{lead.veiculo ? `${lead.veiculo.marca} ${lead.veiculo.modelo}` : lead.modelo_interesse_texto || "—"}</td>
                  <td>
                    {lead.origem === "olx" ? (
                      <span className="pill" style={{ background: `${badge?.cor}22`, color: badge?.cor ?? "#9a9a9c" }}>
                        {badge?.emoji ?? "🌐"} {lead.origem_detalhada ?? "OLX"}
                      </span>
                    ) : (
                      <span className="capitalize">{lead.origem}</span>
                    )}
                  </td>
                  <td>
                    <span className={`pill pill-${lead.classificacao}`}>{CLASSIFICACAO_LABEL[lead.classificacao] ?? lead.classificacao}</span>
                  </td>
                  <td>{STATUS_LABEL[lead.status_atendimento] ?? lead.status_atendimento}</td>
                  <td>{formatarDataHora(lead.data_solicitacao_externa || lead.criado_em)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
