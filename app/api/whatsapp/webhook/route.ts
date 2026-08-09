import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processarMensagemChat, type MensagemChat } from "@/lib/chatEngine";
import { enviarWhatsapp } from "@/lib/notificarVendedor";
export const dynamic = "force-dynamic";
// Formato do payload pode variar por versão do Z-API — ajuste os campos abaixo
// conforme a documentação da instância real quando ela for contratada.
function extrairMensagemRecebida(body: any): { telefone: string; texto: string } | null {
if (body?.fromMe) return null; // ignora eco de mensagens enviadas pelo próprio bot
if (body?.isGroup) return null; // ignora mensagens de grupo
const telefone: string | undefined = body?.phone || body?.chat?.id || body?.senderPhone;
const texto: string | undefined =
body?.text?.message || body?.message?.text || body?.body || body?.text;
if (!telefone || !texto) return null;
return { telefone: String(telefone), texto: String(texto) };
}
export async function POST(request: Request) {
try {
const body = await request.json();
const recebida = extrairMensagemRecebida(body);
if (!recebida) {
return NextResponse.json({ ignorado: true });
}
const supabase = await createClient();
const { data: conversaExistente } = await supabase
.from("conversas_chat")
.select("id, mensagens")
.eq("telefone", recebida.telefone)
.maybeSingle();
const historico: MensagemChat[] = Array.isArray(conversaExistente?.mensagens)
? conversaExistente!.mensagens
: [];
historico.push({ role: "user", content: recebida.texto });
const resultado = await processarMensagemChat(historico, "whatsapp");
historico.push({ role: "assistant", content: resultado.resposta });
if (conversaExistente) {
await supabase
.from("conversas_chat")
.update({ mensagens: historico, atualizado_em: new Date().toISOString() })
.eq("id", conversaExistente.id);
} else {
await supabase.from("conversas_chat").insert({
telefone: recebida.telefone,
canal: "whatsapp",
mensagens: historico,
});
}
await enviarWhatsapp(recebida.telefone, resultado.resposta);
return NextResponse.json({ ok: true });
} catch (err: any) {
return NextResponse.json({ error: err?.message ?? "Erro inesperado." }, { status: 500 });
}
}
