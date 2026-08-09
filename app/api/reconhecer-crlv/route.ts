import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
const PROMPT = `Você está vendo uma imagem de um CRLV (Certificado de Registro e Licenciamento de Veículo) ou CRLV-e brasileiro.
Extraia os dados do veículo e responda APENAS com um JSON válido, sem texto antes ou depois, no formato exato:
{
"marca": "",
"modelo": "",
"versao": "",
"ano_fabricacao": "",
"ano_modelo": "",
"placa": "",
"chassi": "",
"renavam": "",
"cor": "",
"combustivel": ""
}
Se algum campo não estiver visível ou legível, deixe como string vazia. Não invente valores.`;
export async function POST(request: Request) {
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
return NextResponse.json(
{ error: "ANTHROPIC_API_KEY não configurada no servidor. Peça para o Daniel configurar essa variável de ambiente na Vercel." },
{ status: 500 }
);
}
try {
const body = await request.json();
const { base64, mediaType } = body as { base64: string; mediaType: string };
if (!base64 || !mediaType) {
return NextResponse.json({ error: "Imagem não enviada corretamente." }, { status: 400 });
}
const isPdf = mediaType === "application/pdf";
const response = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: {
"Content-Type": "application/json",
"x-api-key": apiKey,
"anthropic-version": "2023-06-01",
},
body: JSON.stringify({
model: "claude-sonnet-4-6",
max_tokens: 1000,
messages: [
{
role: "user",
content: [
{
type: isPdf ? "document" : "image",
source: { type: "base64", media_type: mediaType, data: base64 },
},
{ type: "text", text: PROMPT },
],
},
],
}),
});
if (!response.ok) {
const errText = await response.text();
return NextResponse.json({ error: `Erro na API da Anthropic: ${errText}` }, { status: 500 });
}
const data = await response.json();
const textBlock = data.content?.find((b: any) => b.type === "text");
const rawText: string = textBlock?.text ?? "{}";
const cleaned = rawText.replace(/```json|```/g, "").trim();
let parsed;
try {
parsed = JSON.parse(cleaned);
} catch {
return NextResponse.json({ error: "Não foi possível interpretar a resposta. Tente uma imagem mais nítida." }, { status: 500 });
}
return NextResponse.json({ dados: parsed });
} catch (err: any) {
return NextResponse.json({ error: err?.message ?? "Erro inesperado." }, { status: 500 });
}
}
