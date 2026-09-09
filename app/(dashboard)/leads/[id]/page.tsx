import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

const OLX_BADGE: Record<string, { emoji: string; cor: string }> = {
  financing: { emoji: "💰", cor: "#5ac882" },
  chat: { emoji: "💬", cor: "#4da3ff" },
  whatsapp: { emoji: "📱", cor: "#5ac882" },
  telefone: { emoji: "☎️", cor: "#f2b93b" },
  olx: { emoji: "🌐", cor: "#9a9a9c" },
};

function formatMoney(value: number | null) {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataHora(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export default async function LeadDetalhePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("*, veiculo:veiculos(marca, modelo, versao, ano_modelo, preco_venda), cliente:clientes(nome, email, telefone, cidade)")
    .eq("id", params.id)
    .single();

  if (error || !lead) {
    return (
      <div>
        <h1 className="page-title">Lead não encontrado</h1>
        <p className="page-subtitle">Verifique se o link está correto ou volte para a lista de leads.</p>
        <Link href="/leads" className="secondary-button">← Voltar para Leads</Link>
      </div>
    );
  }

  const badge = lead.origem === "olx" ? OLX_BADGE[lead.source_bruto] : null;

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{lead.nome || "Lead sem nome"}</h1>
          <p className="page-subtitle">
            {lead.origem === "olx" ? (
              <span>{badge?.emoji ?? "🌐"} {lead.origem_detalhada ?? "OLX"}</span>
            ) : (
              <span className="capitalize">{lead.origem}</span>
            )}
            {" · "}
            {formatarDataHora(lead.data_solicitacao_externa || lead.criado_em)}
          </p>
        </div>
        <Link href="/leads" className="secondary-button">← Voltar</Link>
      </div>

      <div className="cards-row cards-row-split">
        <div className="widget-card widget-card-grow">
          <div className="widget-title" style={{ marginBottom: 12 }}>Cliente</div>
          <div className="form-grid">
            <div><span className="form-label">Nome</span><div>{lead.cliente?.nome || lead.nome || "—"}</div></div>
            <div><span className="form-label">Telefone</span><div>{lead.cliente?.telefone || lead.telefone || "—"}</div></div>
            <div><span className="form-label">E-mail</span><div>{lead.cliente?.email || "—"}</div></div>
            <div><span className="form-label">Cidade</span><div>{lead.cliente?.cidade || "—"}</div></div>
          </div>
        </div>

        <div className="widget-card widget-card-grow">
          <div className="widget-title" style={{ marginBottom: 12 }}>Classificação</div>
          <div className="form-grid">
            <div><span className="form-label">Score</span><div><span className={`pill pill-${lead.classificacao}`}>{lead.classificacao}</span></div></div>
            <div><span className="form-label">Status</span><div>{lead.status_atendimento}</div></div>
            <div><span className="form-label">Forma de pagamento</span><div className="capitalize">{lead.forma_pagamento}</div></div>
            <div><span className="form-label">Prazo de decisão</span><div className="capitalize">{lead.prazo_decisao}</div></div>
          </div>
        </div>
      </div>

      {lead.veiculo && (
        <div className="widget-card">
          <div className="widget-title" style={{ marginBottom: 12 }}>Veículo de interesse</div>
          <div className="form-grid">
            <div><span className="form-label">Modelo</span><div>{lead.veiculo.marca} {lead.veiculo.modelo} {lead.veiculo.versao || ""}</div></div>
            <div><span className="form-label">Ano</span><div>{lead.veiculo.ano_modelo || "—"}</div></div>
            <div><span className="form-label">Preço no estoque</span><div>{formatMoney(lead.veiculo.preco_venda)}</div></div>
          </div>
        </div>
      )}

      {lead.origem === "olx" && (lead.link_ad || lead.ad_id) && (
        <div className="widget-card">
          <div className="widget-title" style={{ marginBottom: 12 }}>Anúncio OLX</div>
          {!lead.veiculo && <p className="form-hint" style={{ marginBottom: 12 }}>Veículo não identificado automaticamente no estoque.</p>}
          {lead.link_ad && (
            <a href={lead.link_ad} target="_blank" rel="noopener noreferrer" className="secondary-button">
              🔗 Ver anúncio na OLX
            </a>
          )}
        </div>
      )}

      {lead.observacoes && (
        <div className="widget-card">
          <div className="widget-title" style={{ marginBottom: 8 }}>Mensagem</div>
          <p style={{ margin: 0 }}>{lead.observacoes}</p>
        </div>
      )}
    </div>
  );
}
