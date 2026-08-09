import { NextResponse } from "next/server";
import { processarMensagemChat, type MensagemChat } from "@/lib/chatEngine";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
try {
const body = await request.json();
const historico: MensagemChat[] = Array.isArray(body.mensagens) ? body.mensagens : [];
if (historico.length === 0) {
return NextResponse.json({ error: "Nenhuma mensagem enviada." }, { status: 400 });
}
const resultado = await processarMensagemChat(historico, "site");
return NextResponse.json(resultado);
} catch (err: any) {
return NextResponse.json({ error: err?.message ?? "Erro inesperado." }, { status: 500 });
}
}
