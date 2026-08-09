import { createClient } from "@/lib/supabase/server";
import { buscarVeiculosDisponiveis } from "@/lib/veiculoBusca";
import { classificarLead } from "@/lib/leadScoring";
import { notificarLeadQuente, linkWhatsappVendedor } from "@/lib/notificarVendedor";
const SYSTEM_PROMPT = `Você é a Ana, consultora virtual de vendas da Minowa Veículos, uma revenda de veículos seminovos.
TOM DE VOZ: simpática, natural, objetiva, comercial, informal na medida certa. Nunca pareça um robô. Sem jargão técnico. Mensagens curtas. Faça no máximo UMA pergunta por vez. No máximo 1 emoji por mensagem, só quando fizer sentido.
REGRAS CRÍTICAS — NUNCA QUEBRE:
- NUNCA invente veículos, preços, ano, quilometragem, opcionais, condições de financiamento, taxas, parcelas ou disponibilidade.
- TODA informação sobre veículos deve vir da ferramenta buscar_veiculos. Se ela não retornar nada compatível, diga isso com sinceridade e sugira alternativas próximas ou encaminhar para um vendedor.
- Use buscar_veiculos sempre que o cliente mencionar marca, modelo, faixa de preço, câmbio, combustível, ano ou km — mesmo que a busca inicial não traga resultado, tente variações razoáveis (ex: sem alguns filtros) antes de dizer que não há nada.
- Sobre financiamento: você pode dizer que a Minowa trabalha com financiamento e que dá pra simular, mas NUNCA informe taxas, parcelas ou aprovação — isso depende de análise e é feito por um vendedor.
- Colete dados de forma progressiva e natural ao longo da conversa: nome, telefone, veículo de interesse, forma de pagamento (à vista, financiamento ou troca), se tem veículo para dar de entrada, prazo para decidir a compra, interesse em visita/test-drive. NUNCA peça tudo de uma vez — encaixe uma pergunta por vez no fluxo da conversa.
- Assim que tiver pelo menos nome + telefone + um dado a mais (veículo de interesse, forma de pagamento ou prazo), use a ferramenta registrar_lead.
- Se o cliente pedir para falar com um vendedor/humano, ou demonstrar urgência forte (ex: "preciso comprar hoje", "meu carro quebrou"), use a ferramenta oferecer_vendedor.
- Responda sempre em português do Brasil.`;
const TOOLS = [
{
name: "buscar_veiculos",
description:
"Busca veículos DISPONÍVEIS no estoque real da Minowa de acordo com os filtros informados. Use sempre que precisar responder sobre veículos, preços ou disponibilidade — nunca responda isso de memória.",
input_schema: {
type: "object",
properties: {
marca: { type: "string" },
modelo: { type: "string" },
ano_min: { type: "number" },
ano_max: { type: "number" },
preco_min: { type: "number" },
preco_max: { type: "number" },
cambio: { type: "string", enum: ["manual", "automatico", "cvt", "automatizado"] },
combustivel: {
type: "string",
enum: ["flex", "gasolina", "etanol", "diesel", "hibrido", "eletrico", "gnv"],
},
km_max: { type: "number" },
},
},
},
{
name: "registrar_lead",
description:
"Registra o lead no CRM da Minowa. Use quando já tiver nome, telefone e pelo menos mais um dado relevante coletado na conversa.",
input_schema: {
type: "object",
properties: {
nome: { type: "string" },
telefone: { type: "string" },
veiculo_interesse: { type: "string" },
forma_pagamento: { type: "string", enum: ["a_vista", "financiamento", "troca"] },
prazo_decisao: { type: "string", enum: ["curto", "medio", "indefinido"] },
aceitou_visita: { type: "boolean" },
observacoes: { type: "string" },
},
required: ["nome", "telefone"],
},
},
{
name: "oferecer_vendedor",
description: "Sinaliza que o cliente deve ser encaminhado para um vendedor humano via WhatsApp.",
input_schema: {
type: "object",
properties: { motivo: { type: "string" } },
},
},
];
export type MensagemChat = { role: "user" | "assistant"; content: string };
export type ResultadoChat = {
resposta: string;
mostrarVendedor: boolean;
linkVendedor: string | null;
leadRegistrado: boolean;
};
export async function processarMensagemChat(
historico: MensagemChat[],
origem: "site" | "whatsapp"
): Promise<ResultadoChat> {
const apiKey = process.env.ANTHROPIC_API_KEY;
const linkPadrao = linkWhatsappVendedor("Olá! Vim pelo site da Minowa e quero falar sobre um veículo.");
if (!apiKey) {
return {
resposta:
"Nosso assistente virtual está temporariamente indisponível. Chama a gente direto no WhatsApp que te atendemos rapidinho!",
mostrarVendedor: true,
linkVendedor: linkPadrao,
leadRegistrado: false,
};
}
const messages: any[] = historico.map((m) => ({ role: m.role, content: m.content }));
let mostrarVendedor = false;
let leadRegistrado = false;
let ultimaRespostaTexto = "";
for (let turno = 0; turno < 4; turno++) {
const res = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: {
"Content-Type": "application/json",
"x-api-key": apiKey,
"anthropic-version": "2023-06-01",
},
body: JSON.stringify({
model: "claude-sonnet-4-6",
max_tokens: 700,
system: SYSTEM_PROMPT,
tools: TOOLS,
messages,
}),
});
if (!res.ok) {
return {
resposta: "Tive um probleminha aqui pra responder agora. Pode tentar de novo em instantes?",
mostrarVendedor: true,
linkVendedor: linkPadrao,
leadRegistrado,
};
}
const data = await res.json();
const blocos = data.content ?? [];
const textoBlocos = blocos
.filter((b: any) => b.type === "text")
.map((b: any) => b.text)
.join("\n");
if (textoBlocos) ultimaRespostaTexto = textoBlocos;
const toolUses = blocos.filter((b: any) => b.type === "tool_use");
if (toolUses.length === 0) break;
messages.push({ role: "assistant", content: blocos });
const toolResults = [];
for (const tu of toolUses) {
if (tu.name === "buscar_veiculos") {
const { erro, veiculos } = await buscarVeiculosDisponiveis(tu.input ?? {});
toolResults.push({
type: "tool_result",
tool_use_id: tu.id,
content: erro ? `Erro ao buscar: ${erro}` : JSON.stringify(veiculos),
});
} else if (tu.name === "registrar_lead") {
const input = tu.input ?? {};
const { classificacao } = classificarLead({
veiculoInteresse: input.veiculo_interesse,
formaPagamento: input.forma_pagamento,
prazoDecisao: input.prazo_decisao,
telefone: input.telefone,
aceitouVisita: input.aceitou_visita,
});
const supabase = await createClient();
await supabase.from("leads").insert({
nome: input.nome || null,
telefone: input.telefone || null,
origem: origem === "whatsapp" ? "whatsapp" : "site",
canal_preferido: "texto",
modelo_interesse_texto: input.veiculo_interesse || null,
forma_pagamento: input.forma_pagamento || "a_vista",
prazo_decisao: input.prazo_decisao || "indefinido",
aceitou_visita: !!input.aceitou_visita,
classificacao,
observacoes: input.observacoes || null,
});
leadRegistrado = true;
if (classificacao === "quente") {
mostrarVendedor = true;
await notificarLeadQuente({
nome: input.nome,
telefone: input.telefone,
veiculo: input.veiculo_interesse,
formaPagamento: input.forma_pagamento,
observacoes: input.observacoes,
});
}
toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: "Lead registrado com sucesso." });
} else if (tu.name === "oferecer_vendedor") {
mostrarVendedor = true;
toolResults.push({
type: "tool_result",
tool_use_id: tu.id,
content: "Ok, o cliente será direcionado a um vendedor.",
});
}
}
messages.push({ role: "user", content: toolResults });
}
return {
resposta: ultimaRespostaTexto || "Desculpa, pode repetir de outro jeito? Não entendi bem.",
mostrarVendedor,
linkVendedor: mostrarVendedor ? linkPadrao : null,
leadRegistrado,
};
}
