import { createClient } from "@/lib/supabase/server";
import { classificarLead } from "@/lib/leadScoring";

// ── Payload recebido da OLX ──────────────────────────────────────────
export type OlxLeadPayload = {
  source?: string; // 'financing' | 'chat' | 'whatsapp' | 'telefone' | 'olx' | outro
  adId?: string;
  listId?: string;
  linkAd?: string;
  externalId?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  createdAt?: string; // ISO
  adsInfo?: {
    marca?: string;
    modelo?: string;
    versao?: string;
    ano?: string | number;
    preco?: number;
    km?: number;
    combustivel?: string;
    cambio?: string;
    [key: string]: unknown;
  };
};

export type ResultadoProcessamentoOlx = {
  ok: boolean;
  duplicado?: boolean;
  leadId?: string;
  clienteId?: string;
  veiculoId?: string | null;
  erro?: string;
};

// ── 1. Mapeamento de origem (source -> label amigável) ───────────────
const SOURCE_LABELS: Record<string, { label: string; emoji: string; tipo: string; suborigem: string }> = {
  financing: { label: "OLX — Simulação de financiamento", emoji: "💰", tipo: "financiamento", suborigem: "Simulação de financiamento" },
  chat: { label: "OLX — Chat Inbox", emoji: "💬", tipo: "contato", suborigem: "Chat Inbox OLX" },
  whatsapp: { label: "OLX — WhatsApp", emoji: "📱", tipo: "contato", suborigem: "WhatsApp OLX" },
  telefone: { label: "OLX — Telefone", emoji: "☎️", tipo: "contato", suborigem: "Telefone OLX" },
  olx: { label: "OLX — Outros", emoji: "🌐", tipo: "contato", suborigem: "Outros OLX" },
};

export function mapearOrigemOlx(source: string | undefined) {
  const chave = (source || "olx").toLowerCase();
  return SOURCE_LABELS[chave] ?? SOURCE_LABELS.olx;
}

// ── 2. Identificação do veículo (prioridade: adId > listId > linkAd > adsInfo > marca/modelo/ano) ──
export async function identificarVeiculoOlx(payload: OlxLeadPayload): Promise<string | null> {
  const supabase = await createClient();

  if (payload.adId) {
    const { data } = await supabase.from("veiculos").select("id").eq("olx_ad_id", payload.adId).maybeSingle();
    if (data) return data.id;
  }

  if (payload.listId) {
    const { data } = await supabase.from("veiculos").select("id").eq("olx_list_id", payload.listId).maybeSingle();
    if (data) return data.id;
  }

  if (payload.linkAd) {
    // Se o linkAd já foi salvo em algum lead anterior vinculado a um veículo, reaproveita a associação
    const { data } = await supabase
      .from("leads")
      .select("veiculo_interesse_id")
      .eq("link_ad", payload.linkAd)
      .not("veiculo_interesse_id", "is", null)
      .limit(1)
      .maybeSingle();
    if (data?.veiculo_interesse_id) return data.veiculo_interesse_id;
  }

  const info = payload.adsInfo;
  if (info?.marca && info?.modelo) {
    let query = supabase
      .from("veiculos")
      .select("id")
      .ilike("marca", `%${info.marca}%`)
      .ilike("modelo", `%${info.modelo}%`)
      .limit(1);
    if (info.ano) {
      query = query.eq("ano_modelo", Number(info.ano));
    }
    const { data } = await query.maybeSingle();
    if (data) return data.id;
  }

  return null;
}

// Ao achar (ou não) o veículo, salva o adId/listId no cadastro para acelerar próximos matches
async function vincularAnuncioAoVeiculo(veiculoId: string, payload: OlxLeadPayload) {
  const supabase = await createClient();
  const updates: Record<string, string> = {};
  if (payload.adId) updates.olx_ad_id = payload.adId;
  if (payload.listId) updates.olx_list_id = payload.listId;
  if (Object.keys(updates).length > 0) {
    await supabase.from("veiculos").update(updates).eq("id", veiculoId).is("olx_ad_id", null);
  }
}

// ── 3. Deduplicação de cliente (externalId > email > telefone) ───────
// Nota: a coluna clientes.telefone é NOT NULL no banco — só criamos cliente novo
// quando o payload trouxer telefone. Sem telefone, o lead ainda é criado normalmente,
// apenas sem vínculo a um cliente (cliente_id fica null).
async function encontrarOuCriarCliente(payload: OlxLeadPayload): Promise<string | null> {
  const supabase = await createClient();
  const telefone = (payload.phone || "").replace(/\D/g, "");
  const email = payload.email?.trim().toLowerCase();

  if (email) {
    const { data } = await supabase.from("clientes").select("id").ilike("email", email).maybeSingle();
    if (data) return data.id;
  }
  if (telefone) {
    const { data } = await supabase.from("clientes").select("id").eq("telefone", telefone).maybeSingle();
    if (data) return data.id;
  }

  // Sem telefone não dá pra criar cliente novo (coluna obrigatória) — o lead segue sem cliente_id.
  if (!telefone) return null;

  const { data: novo, error } = await supabase
    .from("clientes")
    .insert({
      nome: payload.name || "Cliente OLX",
      telefone,
      email: email || null,
      origem: "olx",
    })
    .select("id")
    .single();
  if (error) return null;
  return novo.id;
}

// ── 4. Deduplicação de lead (externalId por origem) ───────────────────
async function leadJaExiste(externalId: string | undefined): Promise<boolean> {
  if (!externalId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("id")
    .eq("external_id", externalId)
    .eq("origem", "olx")
    .maybeSingle();
  return !!data;
}

// ── 5. Registro de log (nunca lança erro — best effort) ──────────────
export async function registrarLogOlx(params: {
  tipoEvento: "lead_recebido" | "erro" | "lead_duplicado";
  origemDetalhada?: string;
  externalId?: string;
  sucesso: boolean;
  mensagemErro?: string;
  payload?: unknown;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("integracoes_log").insert({
      integracao: "olx",
      tipo_evento: params.tipoEvento,
      origem_detalhada: params.origemDetalhada || null,
      external_id: params.externalId || null,
      sucesso: params.sucesso,
      mensagem_erro: params.mensagemErro || null,
      payload: params.payload ? JSON.stringify(params.payload) : null,
    });
  } catch {
    // logging nunca deve derrubar o fluxo principal
  }
}

// ── 6. Processamento principal do lead OLX ────────────────────────────
export async function processarLeadOlx(payload: OlxLeadPayload): Promise<ResultadoProcessamentoOlx> {
  try {
    if (!payload || (!payload.phone && !payload.email && !payload.name)) {
      await registrarLogOlx({
        tipoEvento: "erro",
        sucesso: false,
        mensagemErro: "Payload inválido: sem nome, telefone ou e-mail.",
        payload,
      });
      return { ok: false, erro: "Payload inválido." };
    }

    const mapeamento = mapearOrigemOlx(payload.source);

    // dedup por externalId
    if (await leadJaExiste(payload.externalId)) {
      await registrarLogOlx({
        tipoEvento: "lead_duplicado",
        origemDetalhada: mapeamento.label,
        externalId: payload.externalId,
        sucesso: true,
        payload,
      });
      return { ok: true, duplicado: true };
    }

    const clienteId = await encontrarOuCriarCliente(payload);
    const veiculoId = await identificarVeiculoOlx(payload);
    if (veiculoId) await vincularAnuncioAoVeiculo(veiculoId, payload);

    const ehFinanciamento = mapeamento.tipo === "financiamento";
    const { classificacao } = classificarLead({
      veiculoInteresse: veiculoId ? "sim" : undefined,
      formaPagamento: ehFinanciamento ? "financiamento" : "a_vista",
      prazoDecisao: ehFinanciamento ? "curto" : "indefinido",
      telefone: payload.phone,
      solicitouSimulacaoFinanciamento: ehFinanciamento,
    });

    const supabase = await createClient();
    const { data: novoLead, error } = await supabase
      .from("leads")
      .insert({
        nome: payload.name || null,
        telefone: payload.phone ? payload.phone.replace(/\D/g, "") : null,
        origem: "olx",
        origem_detalhada: mapeamento.label,
        source_bruto: payload.source || null,
        external_id: payload.externalId || null,
        ad_id: payload.adId || null,
        list_id: payload.listId || null,
        link_ad: payload.linkAd || null,
        data_solicitacao_externa: payload.createdAt || new Date().toISOString(),
        payload_bruto: JSON.stringify(payload),
        cliente_id: clienteId,
        veiculo_interesse_id: veiculoId,
        canal_preferido: "texto",
        forma_pagamento: ehFinanciamento ? "financiamento" : "a_vista",
        prazo_decisao: ehFinanciamento ? "curto" : "indefinido",
        classificacao,
        observacoes: payload.message || null,
        status_atendimento: "novo",
      })
      .select("id")
      .single();

    if (error || !novoLead) {
      await registrarLogOlx({
        tipoEvento: "erro",
        origemDetalhada: mapeamento.label,
        externalId: payload.externalId,
        sucesso: false,
        mensagemErro: error?.message || "Falha ao inserir lead.",
        payload,
      });
      return { ok: false, erro: error?.message || "Falha ao inserir lead." };
    }

    await registrarLogOlx({
      tipoEvento: "lead_recebido",
      origemDetalhada: mapeamento.label,
      externalId: payload.externalId,
      sucesso: true,
      payload,
    });

    return { ok: true, leadId: novoLead.id, clienteId: clienteId || undefined, veiculoId };
  } catch (err: any) {
    await registrarLogOlx({
      tipoEvento: "erro",
      sucesso: false,
      mensagemErro: err?.message || "Erro inesperado.",
      payload,
    });
    return { ok: false, erro: err?.message || "Erro inesperado." };
  }
}
