import { NextResponse } from "next/server";
import { processarLeadOlx, mapearOrigemOlx, registrarLogOlx, type OlxLeadPayload } from "@/lib/olxIntegration";
import { notificarLeadQuente, linkWhatsappVendedor } from "@/lib/notificarVendedor";

export const dynamic = "force-dynamic";

// A OLX envia o token de autenticação conforme configurado no painel de Leads do anunciante.
// Aceitamos tanto um header customizado quanto Authorization: Bearer <token>, para cobrir
// diferentes formatos de configuração.
function validarToken(request: Request): boolean {
  const tokenEsperado = process.env.OLX_LEADS_TOKEN;
  if (!tokenEsperado) return true; // sem token configurado ainda -> aceita (homologação inicial)

  const headerCustom = request.headers.get("x-olx-token");
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  return headerCustom === tokenEsperado || bearer === tokenEsperado;
}

export async function POST(request: Request) {
  if (!validarToken(request)) {
    await registrarLogOlx({
      tipoEvento: "erro",
      sucesso: false,
      mensagemErro: "Token de autenticação inválido ou ausente.",
    });
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let payload: OlxLeadPayload;
  try {
    payload = await request.json();
  } catch {
    await registrarLogOlx({ tipoEvento: "erro", sucesso: false, mensagemErro: "JSON inválido no corpo da requisição." });
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const resultado = await processarLeadOlx(payload);

  if (!resultado.ok) {
    // Nunca deixamos um erro de um lead travar o recebimento dos próximos —
    // respondemos 200 mesmo em erro de negócio para a OLX não ficar reenviando o mesmo lead quebrado,
    // mas o erro fica registrado em integracoes_log para auditoria.
    return NextResponse.json({ recebido: true, processado: false, erro: resultado.erro }, { status: 200 });
  }

  if (resultado.duplicado) {
    return NextResponse.json({ recebido: true, duplicado: true });
  }

  // Alerta o vendedor imediatamente para leads de financiamento (maior intenção de compra)
  if (payload.source === "financing") {
    const mapeamento = mapearOrigemOlx(payload.source);
    await notificarLeadQuente({
      nome: payload.name,
      telefone: payload.phone,
      veiculo: payload.adsInfo ? `${payload.adsInfo.marca ?? ""} ${payload.adsInfo.modelo ?? ""}`.trim() : undefined,
      formaPagamento: "financiamento",
      observacoes: `${mapeamento.emoji} ${mapeamento.label}${payload.message ? ` — "${payload.message}"` : ""}`,
    });
  }

  return NextResponse.json({ recebido: true, processado: true, leadId: resultado.leadId });
}

// Alguns provedores fazem uma verificação GET de disponibilidade do endpoint antes de homologar.
export async function GET() {
  return NextResponse.json({ status: "ok", integracao: "olx-leads" });
}
