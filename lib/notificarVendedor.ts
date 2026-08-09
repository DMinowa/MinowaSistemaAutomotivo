const VENDEDOR_WHATSAPP = "5585991252367";
const VENDEDOR_EMAIL = "diegoveiculocar@gmail.com";
const URL_PAINEL = "https://minowa-sistema-minowa-veiculos.vercel.app/leads?classificacao=quente";
export type ResumoLead = {
nome?: string;
telefone?: string;
veiculo?: string;
formaPagamento?: string;
observacoes?: string;
};
function montarResumo(lead: ResumoLead) {
return [
"🔴 Lead QUENTE recebido pelo chatbot da Minowa",
lead.nome ? `Nome: ${lead.nome}` : null,
lead.telefone ? `Telefone: ${lead.telefone}` : null,
lead.veiculo ? `Veículo de interesse: ${lead.veiculo}` : null,
lead.formaPagamento ? `Forma de pagamento: ${lead.formaPagamento}` : null,
lead.observacoes ? `Obs: ${lead.observacoes}` : null,
`Veja no painel: ${URL_PAINEL}`,
]
.filter(Boolean)
.join("\n");
}
export async function notificarLeadQuente(lead: ResumoLead) {
const resumo = montarResumo(lead);
if (process.env.RESEND_API_KEY) {
try {
await fetch("https://api.resend.com/emails", {
method: "POST",
headers: {
Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
"Content-Type": "application/json",
},
body: JSON.stringify({
from: "Minowa Chatbot <onboarding@resend.dev>",
to: [VENDEDOR_EMAIL],
subject: `🔴 Lead quente: ${lead.nome || "Cliente do chatbot"}`,
text: resumo,
}),
});
} catch {
// notificação por e-mail é best-effort, não deve travar o fluxo do chat
}
}
if (process.env.ZAPI_INSTANCE_ID && process.env.ZAPI_TOKEN) {
try {
await fetch(
`https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`,
{
method: "POST",
headers: {
"Content-Type": "application/json",
...(process.env.ZAPI_CLIENT_TOKEN ? { "Client-Token": process.env.ZAPI_CLIENT_TOKEN } : {}),
},
body: JSON.stringify({ phone: VENDEDOR_WHATSAPP, message: resumo }),
}
);
} catch {
// idem: best-effort
}
}
}
export function linkWhatsappVendedor(textoInicial: string) {
return `https://wa.me/${VENDEDOR_WHATSAPP}?text=${encodeURIComponent(textoInicial)}`;
}
export async function enviarWhatsapp(numero: string, mensagem: string) {
if (!process.env.ZAPI_INSTANCE_ID || !process.env.ZAPI_TOKEN) return;
try {
await fetch(
`https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`,
{
method: "POST",
headers: {
"Content-Type": "application/json",
...(process.env.ZAPI_CLIENT_TOKEN ? { "Client-Token": process.env.ZAPI_CLIENT_TOKEN } : {}),
},
body: JSON.stringify({ phone: numero, message: mensagem }),
}
);
} catch {
// best-effort
}
}
